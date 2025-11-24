import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Email không hợp lệ'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(\+84|0)\d{9,10}$/, 'Số điện thoại không hợp lệ (ví dụ: +84912345678 hoặc 0912345678)'],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters'],
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'organizer'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: '',
    match: [/^https?:\/\/[^\s/$.?#].[^\s]*$/, 'Avatar phải là URL hợp lệ'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  lastLoginAt: {
    type: Date,
  },
  cccd: {
    type: String,
    trim: true,
    match: [/^\d{9,12}$/, 'CCCD phải từ 9 đến 12 số'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  dob: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v < new Date();
      },
      message: 'Ngày sinh phải là ngày trong quá khứ',
    },
  },
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
  paymentInfo: {
    moMoWallet: String,
    cardNumber: String,
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
});

// Mã hóa mật khẩu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// So sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);