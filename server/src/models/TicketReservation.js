import mongoose from 'mongoose';

const ticketReservationSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('TicketReservation', ticketReservationSchema); 