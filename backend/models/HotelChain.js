const mongoose = require('mongoose');

const hotelChainSchema = new mongoose.Schema({
  chainName: {
    type: String,
    required: [true, 'Hotel chain name is required'],
    trim: true,
    maxlength: [100, 'Chain name cannot exceed 100 characters']
  },
  headquarters: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },
    contact: {
      phone: String,
      email: String,
      website: String
    }
  },
  totalHotels: {
    type: Number,
    default: 0
  },
  totalRooms: {
    type: Number,
    default: 0
  },
  establishedYear: {
    type: Number,
    min: [1900, 'Invalid establishment year']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  logo: {
    url: String,
    alt: String
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  settings: {
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    language: { type: String, default: 'en' },
    taxRate: { type: Number, default: 18 }, // GST rate
    cancellationPolicy: String,
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '11:00' }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for total revenue calculation
hotelChainSchema.virtual('totalRevenue').get(function () {
  // This will be calculated from bookings
  return 0;
});

module.exports = mongoose.model('HotelChain', hotelChainSchema);
