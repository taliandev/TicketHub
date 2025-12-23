import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
  }
  next();
};

// Check if user is organizer
export const isOrganizer = (req, res, next) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ organizer mới có quyền truy cập' });
  }
  next();
};

// Check if user is admin or organizer
export const isAdminOrOrganizer = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
  }
  next();
};

// Alias for authenticate (for consistency with other routes)
export const protect = authenticate;

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Chỉ ${roles.join(' hoặc ')} mới có quyền truy cập` 
      });
    }

    next();
  };
};
