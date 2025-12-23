import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator'; // Đảm bảo đã cài: npm install validator

// Subschema cho extraInfo
const ExtraInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    validate: [validator.isEmail, 'Invalid email format']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function (v) {
        return /^\d{9,11}$/.test(v); // Điều chỉnh tùy chuẩn Việt Nam
      },
      message: props => `${props.value} is not a valid phone number`
    }
  },
  cccd: {
    type: String,
    required: [true, 'CCCD is required'],
    validate: {
      validator: function (v) {
        return /^\d{9,12}$/.test(v);
      },
      message: props => `${props.value} is not a valid CCCD`
    }
  }
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required'],
    index: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true,
  },

  type: {
    type: String,
    required: [true, 'Ticket type is required'], // Ex: "VIP", "Standard"
  },

  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    // This is TOTAL price (unit price × quantity)
  },

  currency: {
    type: String,
    default: 'VND',
  },

  quantity_total: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    // Number of tickets purchased in this order
  },

  status: {
    type: String,
    enum: ['pending', 'paid', 'reserved', 'cancelled', 'used'],
    default: 'pending',
  },

  ticketCode: {
    type: String,
    unique: true,
    default: uuidv4
  },

  qrCode: {
    type: String, // Base64 hoặc URL ảnh QR
  },

  used: {
    type: Boolean,
    default: false,
  },

  usedAt: {
    type: Date,
  },

  purchaseDate: {
    type: Date,
    default: Date.now,
  },

  paidAt: {
    type: Date,
  },

  paymentMethod: {
    type: String,
    enum: ['qr_code', 'momo', 'vnpay', 'cash'],
  },

  extraInfo: {
    type: ExtraInfoSchema,
    required: true
  },

}, {
  timestamps: true
});

// Index giúp tra cứu nhanh hơn
ticketSchema.index({ eventId: 1, type: 1 });

export default mongoose.model('Ticket', ticketSchema);
