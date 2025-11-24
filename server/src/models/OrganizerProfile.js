import mongoose from 'mongoose';

const organizerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  organizationName: { type: String, required: true },
  logoUrl: String,
  website: String,
  description: String,
  socials: {
    facebook: String,
    instagram: String,
    twitter: String,
  }
}, { timestamps: true });

export default mongoose.model('OrganizerProfile', organizerProfileSchema);
