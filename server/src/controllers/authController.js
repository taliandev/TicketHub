import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

// Token generation helpers
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '15m' } // Short-lived access token
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
    { expiresIn: '7d' } // Long-lived refresh token
  );
};

const setRefreshTokenCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    // Don't set domain - let browser handle it
  };

  // Production debug logging - can remove after fixing
  if (isProduction) {
    console.log('[Cookie] Setting refresh token:', {
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      httpOnly: cookieOptions.httpOnly,
      path: cookieOptions.path
    });
  }

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

// Register new user
export const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullName,
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: 'User registered successfully',
      accessToken, // Send access token in response body
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập đầy đủ thông tin' 
      });
    }

    // Find user by email or username
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    });
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Email hoặc tên đăng nhập không tồn tại',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Mật khẩu không chính xác',
        code: 'INVALID_PASSWORD'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    user.lastLoginAt = new Date();
    await user.save();

    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Login successful',
      accessToken, // Send access token in response body
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
}; 


// Forgot password - Send reset email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and save to database
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expiry time (1 hour)
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL }/reset-password/${resetToken}`;

    // Send email
    try {
      await sendPasswordResetEmail(user.email, user.fullName, resetUrl);
      
      res.json({ 
        message: 'Email đặt lại mật khẩu đã được gửi',
        // For development only - remove in production
        ...(process.env.NODE_ENV === 'development' && { resetUrl })
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Clear reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({ 
        message: 'Không thể gửi email. Vui lòng thử lại sau' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Token không hợp lệ hoặc đã hết hạn' 
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Mật khẩu đã được đặt lại thành công',
      accessToken, // Changed from 'token' to 'accessToken'
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Change password (for logged in users)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập đầy đủ thông tin' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
        code: 'PASSWORD_UNCHANGED'
      });
    }

    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Mật khẩu hiện tại không đúng',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Refresh access token using refresh token from cookie
export const refreshAccessToken = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  try {
    const { refreshToken } = req.cookies;

    // Production debug logging - can remove after fixing
    if (isProduction) {
      console.log('[Refresh] Request origin:', req.headers.origin);
      console.log('[Refresh] Cookies received:', Object.keys(req.cookies).join(', ') || 'none');
      console.log('[Refresh] Has refreshToken:', !!refreshToken);
    }

    if (!refreshToken) {
      if (isProduction) {
        console.log('[Refresh] No refresh token - returning 204');
      }
      return res.status(204).end();
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret');
    } catch (err) {
      if (isProduction) {
        console.log('[Refresh] Token verification failed:', err.message);
      }
      return res.status(204).end();
    }

    // Find user and verify refresh token matches
    const user = await User.findById(decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      if (isProduction) {
        console.log('[Refresh] User not found or token mismatch');
      }
      return res.status(204).end();
    }

    // Check if refresh token is expired
    if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
      if (isProduction) {
        console.log('[Refresh] Token expired in DB');
      }
      return res.status(204).end();
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    if (isProduction) {
      console.log('[Refresh] Success - user:', user.username);
    }

    res.json({
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Refresh] Error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Logout - clear refresh token
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Remove refresh token from database
      const decoded = jwt.decode(refreshToken);
      if (decoded?.id) {
        await User.findByIdAndUpdate(decoded.id, {
          refreshToken: null,
          refreshTokenExpires: null,
        });
      }
    }

    // Clear cookie with same settings as when it was set
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
