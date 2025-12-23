import express from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  changePassword 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Forgot password - Send reset email
router.post('/forgot-password', forgotPassword);

// Reset password with token
router.post('/reset-password/:token', resetPassword);

// Change password (requires authentication)
router.post('/change-password', protect, changePassword);

export default router; 