import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { 
  checkinTicket, 
  getTicketInfo,
  getCheckinStats 
} from '../controllers/checkinController.js';

const router = express.Router();

// All routes require authentication and organizer/admin role
router.use(protect);
router.use(authorize('organizer', 'admin'));

// Check-in ticket
router.post('/checkin', checkinTicket);

// Get ticket info
router.get('/ticket/:ticketCode', getTicketInfo);

// Get check-in statistics for an event
router.get('/stats/:eventId', getCheckinStats);

export default router;
