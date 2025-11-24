import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  usageLimit: { type: Number },
  used: { type: Number, default: 0 },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Promotion', promotionSchema);