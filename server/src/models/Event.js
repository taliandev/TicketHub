import mongoose from 'mongoose';

// Subdocument cho từng loại vé
const ticketTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
  available: { type: Number, required: true, min: [0, 'Available must be non-negative'] },
  sold: { type: Number, default: 0, min: [0, 'Sold cannot be negative'] },
  purchaseLimit: { type: Number, default: 10, min: [1, 'Purchase limit must be at least 1'] },
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'View cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function (v) {
        return v > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  img: {
    type: String,
    required: [true, 'Image is required'],
    validate: {
      validator: function (v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Image must be a valid image URL'
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Technology', 'Entertainment', 'Business', 'Food & Drink', 'Fashion',
      'Sports', 'Arts', 'Gaming', 'Photography', 'Marketing',
      'Music', 'Film', 'Wellness', 'Dance', 'Architecture'
    ]
  },
  ticketTypes: [ticketTypeSchema],
  ticketSalesStatus: {
    type: String,
    enum: ['upcoming', 'on sale', 'sold out'],
    default: 'upcoming'
  },
  startSaleDate: {
    type: Date
  },
  endSaleDate: {
    type: Date
  },
  refundPolicy: {
    type: String,
    default: 'No refund'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled'],
    default: 'draft'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field - tính totalCapacity động
eventSchema.virtual('totalCapacity').get(function () {
  return this.ticketTypes.reduce((sum, t) => sum + t.available, 0);
});

// Validate ngày bắt đầu / kết thúc bán vé
eventSchema.path('endSaleDate').validate(function (v) {
  return !this.startSaleDate || !v || this.startSaleDate < v;
}, 'End sale date must be after start sale date');

eventSchema.path('startSaleDate').validate(function (v) {
  return !v || !this.date || v < this.date;
}, 'Start sale date must be before event date');

eventSchema.path('endSaleDate').validate(function (v) {
  return !v || !this.date || v < this.date;
}, 'End sale date must be before event date');

// Tối ưu tìm kiếm
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizerId: 1 });

export const Event = mongoose.model('Event', eventSchema);
