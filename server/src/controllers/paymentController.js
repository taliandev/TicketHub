import crypto from 'crypto';
import QRCode from 'qrcode';
import Ticket  from '../models/Ticket.js';
import Order from '../models/Order.js';
import Redis from 'ioredis';
import { Event } from '../models/Event.js';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
});

// Lưu trữ tạm thời các giao dịch (trong production nên dùng Redis)
const transactions = new Map();

const releaseReservationIfAny = async (reservationId) => {
  if (!reservationId) return;
  const keys = await redis.keys(`res:*:*:${reservationId}`);
  if (keys && keys.length > 0) {
    await redis.del(keys[0]);
  }
};

const decrementRealStock = async (ticketId, method, reservationId) => {
  // Find the ticket to get eventId, type, quantity
  const ticket = await Ticket.findById(ticketId).lean();
  if (!ticket) return;
  const { eventId, type, quantity_total } = ticket;

  // Decrement Event.ticketTypes.available and increment sold
  await Event.updateOne(
    { _id: eventId, 'ticketTypes.name': type },
    {
      $inc: {
        'ticketTypes.$.available': -Number(quantity_total),
        'ticketTypes.$.sold': Number(quantity_total)
      }
    }
  );

  // Release reservation lock
  await releaseReservationIfAny(reservationId);
};

// Tạo QR code thanh toán
export const createQRPayment = async (req, res) => {
  try {
    const { amount, ticketId, description, reservationId } = req.body;
    
    const transactionId = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Tạo thông tin thanh toán
    const paymentData = {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'CONG TY TICKETHUB',
      amount: amount,
      content: transactionId
    };
    
    // Tạo QR code
    const qrData = JSON.stringify(paymentData);
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    
    // Lưu thông tin giao dịch
    transactions.set(transactionId, {
      id: transactionId,
      ticketId,
      amount,
      status: 'pending',
      method: 'qr_code',
      createdAt: new Date(),
      description,
      reservationId: reservationId || null,
    });
    
    res.json({
      transactionId,
      qrCodeUrl,
      paymentData
    });
  } catch (error) {
    console.error('Error creating QR payment:', error);
    res.status(500).json({ message: 'Không thể tạo QR code thanh toán' });
  }
};

// Tạo thanh toán Momo
export const createMomoPayment = async (req, res) => {
  try {
    const { amount, ticketId, returnUrl, reservationId } = req.body;
    
    const transactionId = `MOMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Tạo thông tin thanh toán Momo
    const momoData = {
      partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
      orderId: transactionId,
      requestId: transactionId,
      amount: amount,
      orderInfo: `Thanh toan ve su kien - ${ticketId}`,
      returnUrl: returnUrl,
      ipnUrl: `${process.env.BASE_URL}/api/payments/webhook`,
      requestType: 'captureWallet',
      extraData: reservationId || '',
      lang: 'vi'
    };
    
    // Tạo signature (trong thực tế sẽ dùng secret key)
    const signature = crypto.createHash('sha256').update(JSON.stringify(momoData)).digest('hex');
    momoData.signature = signature;
    
    // Lưu thông tin giao dịch
    transactions.set(transactionId, {
      id: transactionId,
      ticketId,
      amount,
      status: 'pending',
      method: 'momo',
      createdAt: new Date(),
      paymentData: momoData,
      reservationId: reservationId || null,
    });
    
    // Trong thực tế sẽ gọi API Momo
    const payUrl = `${process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create'}`;
    
    res.json({
      transactionId,
      payUrl,
      deeplink: `momo://app?action=pay&data=${encodeURIComponent(JSON.stringify(momoData))}`
    });
  } catch (error) {
    console.error('Error creating Momo payment:', error);
    res.status(500).json({ message: 'Không thể tạo thanh toán Momo' });
  }
};

// Tạo thanh toán VNPay
export const createVNPayPayment = async (req, res) => {
  try {
    const { amount, ticketId, returnUrl, reservationId } = req.body;
    
    const transactionId = `VNPAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Tạo thông tin thanh toán VNPay
    const vnpayData = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'TEST',
      vnp_Amount: amount * 100, // VNPay yêu cầu số tiền nhân 100
      vnp_CurrCode: 'VND',
      vnp_TxnRef: transactionId,
      vnp_OrderInfo: `Thanh toan ve su kien - ${ticketId}`,
      vnp_OrderType: 'billpayment',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: req.ip,
      vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '0700'
    };
    
    // Tạo signature
    const secretKey = process.env.VNPAY_HASH_SECRET || 'TEST';
    const signData = Object.keys(vnpayData)
      .sort()
      .map(key => `${key}=${vnpayData[key]}`)
      .join('&');
    
    const hmac = crypto.createHmac('sha512', secretKey);
    const signature = hmac.update(signData, 'utf8').digest('hex');
    vnpayData.vnp_SecureHash = signature;
    
    // Lưu thông tin giao dịch
    transactions.set(transactionId, {
      id: transactionId,
      ticketId,
      amount,
      status: 'pending',
      method: 'vnpay',
      createdAt: new Date(),
      paymentData: vnpayData,
      reservationId: reservationId || null,
    });
    
    // Tạo URL thanh toán
    const paymentUrl = `${process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'}?${Object.keys(vnpayData).map(key => `${key}=${encodeURIComponent(vnpayData[key])}`).join('&')}`;
    
    res.json({
      transactionId,
      paymentUrl
    });
  } catch (error) {
    console.error('Error creating VNPay payment:', error);
    res.status(500).json({ message: 'Không thể tạo thanh toán VNPay' });
  }
};

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = transactions.get(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    }
    
    // Trong thực tế sẽ kiểm tra với ngân hàng/gateway
    // Ở đây chỉ mô phỏng
    if (transaction.status === 'pending') {
      // Kiểm tra xem có thanh toán thành công không
      // Trong demo, giả sử 50% khả năng thành công
      const isSuccess = Math.random() > 0.5;
      
      if (isSuccess) {
        transaction.status = 'paid';
        transaction.paidAt = new Date();
        
        // Lấy thông tin vé để có userId
        const ticket = await Ticket.findById(transaction.ticketId);
        if (!ticket) {
          return res.status(404).json({ message: 'Không tìm thấy vé' });
        }
        
        // Cập nhật trạng thái vé
        await Ticket.findByIdAndUpdate(transaction.ticketId, {
          status: 'paid',
          paymentMethod: transaction.method,
          paidAt: new Date()
        });
        
        // Tạo order
        await Order.create({
          userId: ticket.userId,
          ticketId: transaction.ticketId,
          amount: transaction.amount,
          paymentMethod: transaction.method,
          status: 'paid',
          transactionId: transactionId,
          paidAt: new Date()
        });

        // Decrement stock and release reservation
        if (transaction.reservationId) {
          await decrementRealStock(transaction.ticketId, transaction.method, transaction.reservationId);
        }
      }
    }
    
    res.json({
      transactionId,
      status: transaction.status,
      amount: transaction.amount,
      method: transaction.method,
      createdAt: transaction.createdAt,
      paidAt: transaction.paidAt
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ message: 'Không thể kiểm tra trạng thái thanh toán' });
  }
};

// Webhook nhận thông báo thanh toán
export const handlePaymentWebhook = async (req, res) => {
  try {
    const { transactionId, status, amount, signature } = req.body;
    
    // Verify signature (trong thực tế)
    // const expectedSignature = crypto.createHmac('sha256', secretKey).update(JSON.stringify(req.body)).digest('hex');
    // if (signature !== expectedSignature) {
    //   return res.status(400).json({ message: 'Invalid signature' });
    // }
    
    const transaction = transactions.get(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (status === 'success' || status === 'paid') {
      transaction.status = 'paid';
      transaction.paidAt = new Date();
      
      // Lấy thông tin vé để có userId
      const ticket = await Ticket.findById(transaction.ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      // Cập nhật trạng thái vé
      await Ticket.findByIdAndUpdate(transaction.ticketId, {
        status: 'paid',
        paymentMethod: transaction.method,
        paidAt: new Date()
      });
      
      // Tạo order
      await Order.create({
        userId: ticket.userId,
        ticketId: transaction.ticketId,
        amount: transaction.amount,
        paymentMethod: transaction.method,
        status: 'paid',
        transactionId: transactionId,
        paidAt: new Date()
      });

      // Decrement stock and release reservation
      if (transaction.reservationId) {
        await decrementRealStock(transaction.ticketId, transaction.method, transaction.reservationId);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
}; 