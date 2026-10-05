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
  verifyTicket,
  submitApplication,
  getApplications,
  approveApplication,
  rejectApplication
} from '../controllers/organizerController.js';
import { authenticate, isOrganizer, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public application route (only requires authentication, not organizer role)
router.post('/applications', authenticate, submitApplication);

// Admin routes for managing applications
router.get('/applications', authenticate, isAdmin, getApplications);
router.put('/applications/:id/approve', authenticate, isAdmin, approveApplication);
router.put('/applications/:id/reject', authenticate, isAdmin, rejectApplication);

// All routes below require authentication and organizer role
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
