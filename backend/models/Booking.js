const mongoose = require('mongoose');
const validator = require('validator');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [50, 'Customer name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone_number: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function (v) {
        return /^\+?[\d\s\-\(\)]{10,}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  hotelName: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function (v) {
        return v > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required'],
    max: [10, 'Maximum 10 guests allowed']
  },
  rooms: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 room is required']
  },
  totalNights: {
    type: Number,
    default: function () {
      if (this.checkIn && this.checkOut) {
        const diffTime = Math.abs(this.checkOut - this.checkIn);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      return 1;
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['Cash', 'Google Pay', 'PhonePe', 'Paytm', 'Credit Card', 'Debit Card'],
    default: 'Cash'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentId: {
    type: String,
    trim: true
  },
  bookingStatus: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Completed', 'No-Show'],
    default: 'Confirmed'
  },
  specialRequests: {
    type: String,
    maxlength: [200, 'Special requests cannot exceed 200 characters']
  },
  receiptUrl: {
    type: String
  },
  createdBy: {
    type: String,
    default: 'customer'
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingId = `HRP-${timestamp}-${random}`.toUpperCase();
  }

  // Calculate total amount
  if (this.price && this.totalNights && this.rooms) {
    this.totalAmount = this.price * this.totalNights * this.rooms;
  }

  next();
});

// Index for efficient queries
bookingSchema.index({ email: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for booking duration
bookingSchema.virtual('duration').get(function () {
  if (this.checkIn && this.checkOut) {
    const diffTime = Math.abs(this.checkOut - this.checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Method to check if booking is active
bookingSchema.methods.isActive = function () {
  return this.bookingStatus === 'Confirmed' && this.checkOut > new Date();
};

// Static method to find bookings by date range
bookingSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    $or: [
      { checkIn: { $gte: startDate, $lte: endDate } },
      { checkOut: { $gte: startDate, $lte: endDate } },
      { checkIn: { $lte: startDate }, checkOut: { $gte: endDate } }
    ]
  });
};

module.exports = mongoose.model('Booking', bookingSchema);
