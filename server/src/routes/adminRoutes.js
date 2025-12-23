import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllEvents,
  updateEventStatus,
  deleteEvent,
  getRevenueAnalytics,
  getRecentActivities
} from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Dashboard stats
router.get('/stats', getAdminStats);
router.get('/activities', getRecentActivities);
router.get('/revenue', getRevenueAnalytics);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Event management
router.get('/events', getAllEvents);
router.put('/events/:eventId/status', updateEventStatus);
router.delete('/events/:eventId', deleteEvent);

export default router;
