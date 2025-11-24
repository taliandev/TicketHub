import express from 'express';
import { 
  createQRPayment, 
  createMomoPayment, 
  createVNPayPayment, 
  checkPaymentStatus,
  handlePaymentWebhook 
} from '../controllers/paymentController.js';

const router = express.Router();

// Tạo QR code thanh toán
router.post('/create-qr', createQRPayment);

// Tạo thanh toán Momo
router.post('/momo', createMomoPayment);

// Tạo thanh toán VNPay
router.post('/vnpay', createVNPayPayment);

// Kiểm tra trạng thái thanh toán
router.get('/status/:transactionId', checkPaymentStatus);

// Webhook nhận thông báo thanh toán
router.post('/webhook', handlePaymentWebhook);

export default router; 