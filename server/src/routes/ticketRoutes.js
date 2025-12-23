import express from 'express';
import {
  getTicketsByUserId,
  createTicket,
  getAvailableTicketsByEvent,
  bookTicket,
  updateTicketStatus
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';
import { checkinTicket } from '../controllers/checkinController.js';

const router = express.Router();

// Lấy tất cả vé theo userId
router.get('/user/:userId', getTicketsByUserId);
// Lấy vé còn trống theo eventId
router.get('/event/:eventId/available', getAvailableTicketsByEvent);
// Đặt vé mới
router.post('/', createTicket);
// Đặt vé: cập nhật vé có sẵn
router.post('/book', bookTicket);

// Cập nhật trạng thái vé - Sửa path từ '/tickets/:id' thành '/:id'
router.patch('/:id', updateTicketStatus);

// Check-in ticket (organizer/admin only)
router.post('/checkin', protect, authorize('organizer', 'admin'), checkinTicket);

export default router; 