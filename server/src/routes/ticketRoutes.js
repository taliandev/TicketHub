import express from 'express';
import { getTicketsByUserId, createTicket, getAvailableTicketsByEvent, bookTicket, updateTicketStatus } from '../controllers/ticketController.js';

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

export default router; 