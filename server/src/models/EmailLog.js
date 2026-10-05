import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  emailId: {
    type: String, // Resend email ID
    unique: true,
    sparse: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  },
  
  type: {
    type: String,
    enum: ['ticket', 'order-confirmation', 'password-reset'],
    required: true
  },
  
  recipient: {
    type: String,
    required: true
  },
  
  subject: {
    type: String,
    required: true
  },
  
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'opened', 'bounced', 'failed'],
    default: 'queued',
    index: true
  },
  
  sentAt: {
    type: Date
  },
  
  deliveredAt: {
    type: Date
  },
  
  openedAt: {
    type: Date
  },
  
  bouncedAt: {
    type: Date
  },
  
  failedAt: {
    type: Date
  },
  
  error: {
    type: String
  },
  
  attempts: {
    type: Number,
    default: 0
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
  
}, {
  timestamps: true
});

// Indexes
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ userId: 1, type: 1 });

export default mongoose.model('EmailLog', emailLogSchema);
