const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters']
  },
  chainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelChain',
    required: [true, 'Hotel must belong to a chain']
  },
  hotelCode: {
    type: String,
    required: [true, 'Hotel code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [50, 'Location cannot exceed 50 characters']
  },

  // Pricing and Rooms
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  roomTypes: [{
    type: {
      type: String,
      required: true,
      enum: ['Standard', 'Deluxe', 'Suite', 'Presidential', 'Family', 'Executive']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    totalRooms: {
      type: Number,
      required: true,
      min: [1, 'Must have at least 1 room']
    },
    availableRooms: {
      type: Number,
      required: true,
      min: [0, 'Available rooms cannot be negative']
    },
    amenities: [String],
    maxOccupancy: {
      type: Number,
      default: 2
    }
  }],

  // Hotel Details
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    alt: String,
    category: {
      type: String,
      enum: ['exterior', 'lobby', 'room', 'restaurant', 'pool', 'gym', 'spa', 'other']
    }
  }],
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },

  // Contact and Address
  contact: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    fax: String,
    website: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Operational Information
  manager: {
    name: String,
    phone: String,
    email: String,
    employeeId: String
  },
  operationalHours: {
    checkIn: { type: String, default: '14:00' },
    checkOut: { type: String, default: '11:00' },
    frontDesk24x7: { type: Boolean, default: true }
  },

  // Financial Information
  revenue: {
    monthly: { type: Number, default: 0 },
    yearly: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },

  // Status and Settings
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Closed', 'Under Construction'],
    default: 'Active'
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // AI Assistant Settings
  aiAssistant: {
    enabled: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    responseTime: { type: String, default: 'instant' }
  }
}, {
  timestamps: true
});

// Indexes for search functionality
hotelSchema.index({ name: 'text', location: 'text', description: 'text' });
hotelSchema.index({ location: 1 });
hotelSchema.index({ 'roomTypes.price': 1 });
hotelSchema.index({ chainId: 1 });
hotelSchema.index({ hotelCode: 1 });

// Virtual for total rooms
hotelSchema.virtual('totalRooms').get(function () {
  return this.roomTypes.reduce((total, roomType) => total + roomType.totalRooms, 0);
});

// Virtual for total available rooms
hotelSchema.virtual('totalAvailableRooms').get(function () {
  return this.roomTypes.reduce((total, roomType) => total + roomType.availableRooms, 0);
});

// Virtual for occupancy rate
hotelSchema.virtual('occupancyRate').get(function () {
  const total = this.totalRooms;
  const available = this.totalAvailableRooms;
  return total > 0 ? ((total - available) / total * 100).toFixed(2) : 0;
});

// Method to check room availability by type
hotelSchema.methods.checkRoomAvailability = function (roomType, requiredRooms = 1) {
  const room = this.roomTypes.find(rt => rt.type === roomType);
  return room ? room.availableRooms >= requiredRooms : false;
};

// Method to get room price by type
hotelSchema.methods.getRoomPrice = function (roomType) {
  const room = this.roomTypes.find(rt => rt.type === roomType);
  return room ? room.price : this.basePrice;
};

// Static method to find hotels by chain
hotelSchema.statics.findByChain = function (chainId) {
  return this.find({
    chainId: chainId,
    isActive: true,
    status: 'Active'
  });
};

// Static method to find hotels by location
hotelSchema.statics.findByLocation = function (location) {
  return this.find({
    location: new RegExp(location, 'i'),
    isActive: true,
    status: 'Active',
    'roomTypes.availableRooms': { $gt: 0 }
  });
};

module.exports = mongoose.model('Hotel', hotelSchema);
