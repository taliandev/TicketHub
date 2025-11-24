import Ticket from '../models/Ticket.js';
import crypto from 'crypto';
import { Event } from '../models/Event.js';
// import { sendEmail } from '../utils/email.ts'; // Tạm thời comment out

// Lấy tất cả vé theo userId
export const getTicketsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = await Ticket.find({ userId }).populate('eventId');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy vé', error: err.message });
  }
};

// Lấy vé theo eventId và status
export const getAvailableTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const tickets = await Ticket.find({ eventId, status: 'available' });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy vé theo sự kiện', error: err.message });
  }
};

// Hàm sinh mã vé random duy nhất
function generateTicketCode() {
  return 'TKT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
}

// Hàm sinh mã QR riêng biệt (ở đây là random, thực tế có thể encode thêm info)
function generateQRCode() {
  return 'QR-' + crypto.randomBytes(10).toString('hex');
}

// Tạo vé mới
export const createTicket = async (req, res) => {
  try {
    // Chấp nhận cả 'type' và 'name' từ FE, ưu tiên 'type'
    const { eventId, userId, price, quantity_total, extraInfo } = req.body;
    const type = req.body.type || req.body.name;

    // Validate required fields
    if (!eventId || !userId || !type || !price || !quantity_total || !extraInfo) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc',
        required: ['eventId', 'userId', 'type', 'price', 'quantity_total', 'extraInfo']
      });
    }

    // Validate extraInfo
    const { fullName, email, phone, cccd } = extraInfo;
    if (!fullName || !email || !phone || !cccd) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin cá nhân',
        required: ['fullName', 'email', 'phone', 'cccd']
      });
    }

    // Lấy sự kiện và loại vé
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }

    // Kiểm tra category nếu chưa có
    if (!event.category) {
      event.category = 'Music'; // Giá trị mặc định
      await event.save({ validateBeforeSave: false });
    }

    const ticketType = event.ticketTypes.find(t => t.name === type);
    if (!ticketType) {
      return res.status(400).json({ message: `Loại vé không hợp lệ: ${type}` });
    }

    if (ticketType.available - (ticketType.sold || 0) < quantity_total) {
      return res.status(400).json({ message: 'Vé đã bán hết hoặc không đủ số lượng' });
    }

    // Đảm bảo sold là số, nếu không có thì khởi tạo 0
    ticketType.sold = Number(ticketType.sold) || 0;
    ticketType.sold += quantity_total;

    event.ticketTypes.forEach(t => {
      t.sold = Number(t.sold) || 0;
    });
    
    await event.save();

    const ticketCode = generateTicketCode();
    const qrCode = generateQRCode();
    
    const ticket = await Ticket.create({
      eventId,
      userId,
      type,
      price,
      quantity_total,
      status: 'pending', // Để pending thay vì paid
      ticketCode,
      qrCode,
      extraInfo: { 
        fullName, 
        email, 
        phone, 
        cccd 
      },
    });

    // Tạm thời disable email sending để tránh lỗi SMTP
    // TODO: Cấu hình SMTP credentials trong production
    /*
    if (event && email) {
      const html = `
        <h2>Chúc mừng bạn đã đặt vé thành công!</h2>
        <p><b>Sự kiện:</b> ${event.title}</p>
        <p><b>Loại vé:</b> ${type}</p>
        <p><b>Số lượng:</b> ${quantity_total}</p>
        <p><b>Mã vé:</b> ${ticketCode}</p>
        <p><b>QR Code:</b> ${qrCode}</p>
        <p><b>Ngày giờ:</b> ${new Date(event.date).toLocaleString()}</p>
        <p><b>Địa điểm:</b> ${event.location}</p>
        <p><b>Người mua:</b> ${fullName} (${email}, ${phone})</p>
        <p>Vui lòng xuất trình mã vé và QR code này khi đến sự kiện.</p>
      `;
      await sendEmail({
        to: email,
        subject: `Xác nhận đặt vé sự kiện: ${event.title}`,
        text: `Bạn đã đặt vé thành công cho sự kiện ${event.title}. Mã vé: ${ticketCode}, QR: ${qrCode}`,
        html,
      });
    }
    */

    // Log thông tin vé thay vì gửi email
    console.log('Ticket created successfully:', {
      ticketId: ticket._id,
      eventTitle: event.title,
      ticketCode,
      qrCode,
      userEmail: email,
      userName: fullName
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error('Error creating ticket:', err, 'Request body:', req.body);
    
    // Xử lý lỗi validation cụ thể
    if (err.name === 'ValidationError') {
      const validationErrors = Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      }));
      return res.status(400).json({ 
        message: 'Lỗi validation', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: 'Lỗi server khi tạo vé', error: err.message });
  }
};

// Đặt vé: nhận eventId, type, userId, ... -> tìm vé available phù hợp, cập nhật userId, status, extraInfo
export const bookTicket = async (req, res) => {
  try {
    const { eventId, type, userId, price, fullName, phone, email, cccd } = req.body;
    // Tìm vé available phù hợp
    const ticket = await Ticket.findOne({ eventId, type, status: 'available' });
    if (!ticket) return res.status(400).json({ message: 'Hết vé loại này hoặc không còn vé phù hợp' });
    // Cập nhật vé cho user
    ticket.userId = userId;
    ticket.status = 'paid';
    ticket.extraInfo = { fullName, phone, email, cccd };
    ticket.purchaseDate = new Date();
    ticket.ticketCode = ticket.ticketCode || ('TKT-' + Math.random().toString(36).substring(2, 10).toUpperCase());
    ticket.qrCode = ticket.qrCode || ('QR-' + Math.random().toString(36).substring(2, 12));
    await ticket.save();
    res.status(200).json(ticket);
  } catch (err) {
    console.error('Error booking ticket:', err, 'Request body:', req.body);
    res.status(500).json({ message: 'Lỗi server khi đặt vé', error: err.message, body: req.body });
  }
}; 

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = status || ticket.status;
    ticket.paymentMethod = paymentMethod || ticket.paymentMethod;
    await ticket.save();

    res.status(200).json(ticket);
  } catch (err) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật vé', error: err.message });
  }
};