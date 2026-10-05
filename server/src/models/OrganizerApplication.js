import mongoose from 'mongoose';

const organizerApplicationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  organizationName: { 
    type: String, 
    required: true 
  },
  contactPerson: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true,
    match: [/\S+@\S+\.\S+/, 'Email không hợp lệ']
  },
  phone: { 
    type: String, 
    required: true,
    match: [/^(\+84|0)\d{9,10}$/, 'Số điện thoại không hợp lệ']
  },
  organizationType: { 
    type: String, 
    required: true,
    enum: ['Công ty sự kiện', 'Công ty giải trí', 'Tổ chức phi lợi nhuận', 'Cá nhân', 'Khác']
  },
  eventCategory: { 
    type: String, 
    required: true,
    enum: ['Âm nhạc / Hòa nhạc', 'Hội thảo / Workshop', 'Triển lãm', 'Thể thao', 'Festival', 'Khác']
  },
  expectedEventVolume: { 
    type: String, 
    required: true,
    enum: ['1-5 sự kiện/năm', '6-10 sự kiện/năm', '11-20 sự kiện/năm', '20+ sự kiện/năm']
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  reviewedAt: { 
    type: Date 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  rejectionReason: { 
    type: String 
  }
}, { 
  timestamps: true 
});

// Index for faster queries
organizerApplicationSchema.index({ userId: 1, status: 1 });
organizerApplicationSchema.index({ createdAt: -1 });

export default mongoose.model('OrganizerApplication', organizerApplicationSchema);
