import express from 'express';
import {
  getOrganizerStats,
  getOrganizerEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  getOrganizerRevenue,
  getOrganizerTickets,
  verifyTicket
} from '../controllers/organizerController.js';
import { authenticate, isOrganizer } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and organizer role
router.use(authenticate);
router.use(isOrganizer);

// Dashboard stats
router.get('/stats', getOrganizerStats);
router.get('/revenue', getOrganizerRevenue);

// Event management
router.get('/events', getOrganizerEvents);
router.post('/events', createEvent);
router.put('/events/:eventId', updateEvent);
router.delete('/events/:eventId', deleteEvent);
router.get('/events/:eventId/attendees', getEventAttendees);

// Ticket management
router.get('/tickets', getOrganizerTickets);
router.post('/verify-ticket', verifyTicket);

export default router;
