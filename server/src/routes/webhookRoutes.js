import express from 'express';
import { handleResendWebhook, getEmailStats } from '../controllers/webhookController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public webhook endpoint (no auth required)
router.post('/resend', handleResendWebhook);

// Admin only - email stats
router.get('/email-stats', protect, authorize('admin'), getEmailStats);

export default router;
