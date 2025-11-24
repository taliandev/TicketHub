import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'credit_card', 'paypal', 'momo', 'vnpay', 'bank_transfer', 'qr_code'],
    required: false
  },
  transactionId: {
    type: String,
    required: false
  },
  paidAt: {
    type: Date,
  },
  couponCode: { 
    type: String 
  }
}, {
  timestamps: true,
});

export default mongoose.model('Order', orderSchema); 