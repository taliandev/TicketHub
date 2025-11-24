import mongoose from 'mongoose';

const userTicketSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  qrCodeData: {
    type: String,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  checkInTime: { type: Date },
  seatNumber: { type: String },
  extraInfo: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true,
});

export default mongoose.model('UserTicket', userTicketSchema); 