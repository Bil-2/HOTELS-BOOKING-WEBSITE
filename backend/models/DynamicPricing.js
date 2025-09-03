const mongoose = require('mongoose');

const dynamicPricingSchema = new mongoose.Schema({
  // Hotel Reference
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Standard', 'Deluxe', 'Suite', 'Presidential', 'Family', 'Executive']
  },

  // Base Pricing
  basePricing: {
    basePrice: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    lastUpdated: { type: Date, default: Date.now }
  },

  // Dynamic Factors
  demandFactors: {
    occupancyRate: { type: Number, min: 0, max: 1 }, // 0-100%
    bookingVelocity: Number, // Bookings per hour
    searchVolume: Number, // Searches for this hotel
    competitorPricing: [{
      competitorId: String,
      price: Number,
      timestamp: { type: Date, default: Date.now }
    }],
    marketDemand: { type: Number, min: 0, max: 5 } // Market demand level
  },

  // Seasonal Pricing
  seasonalFactors: {
    season: {
      type: String,
      enum: ['peak', 'high', 'medium', 'low', 'off']
    },
    seasonMultiplier: { type: Number, default: 1 },
    weatherImpact: {
      condition: String, // sunny, rainy, stormy, etc.
      multiplier: { type: Number, default: 1 }
    },
    holidayPeriod: {
      isHoliday: { type: Boolean, default: false },
      holidayName: String,
      multiplier: { type: Number, default: 1 }
    }
  },

  // Event-Based Pricing
  eventFactors: {
    localEvents: [{
      eventName: String,
      eventType: {
        type: String,
        enum: ['conference', 'concert', 'sports', 'festival', 'exhibition', 'wedding']
      },
      startDate: Date,
      endDate: Date,
      expectedAttendees: Number,
      impactRadius: Number, // km from hotel
      priceMultiplier: { type: Number, default: 1 }
    }],
    cityEvents: [{
      eventName: String,
      impact: { type: String, enum: ['high', 'medium', 'low'] },
      multiplier: { type: Number, default: 1 }
    }]
  },

  // Time-Based Factors
  timeFactors: {
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    },
    advanceBooking: {
      daysInAdvance: Number,
      multiplier: { type: Number, default: 1 }
    },
    lastMinute: {
      isLastMinute: { type: Boolean, default: false },
      hoursBeforeCheckIn: Number,
      multiplier: { type: Number, default: 1 }
    }
  },

  // Customer Segmentation
  customerFactors: {
    customerType: {
      type: String,
      enum: ['business', 'leisure', 'group', 'corporate', 'loyalty_member']
    },
    loyaltyTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond']
    },
    groupSize: Number,
    lengthOfStay: Number,
    repeatCustomer: { type: Boolean, default: false }
  },

  // AI Pricing Algorithm
  aiPricing: {
    mlModelVersion: String,
    predictedDemand: { type: Number, min: 0, max: 1 },
    priceElasticity: Number,
    optimalPrice: Number,
    confidence: { type: Number, min: 0, max: 1 },
    factors: [{
      name: String,
      weight: Number,
      impact: Number
    }]
  },

  // Current Pricing
  currentPricing: {
    finalPrice: { type: Number, required: true },
    originalPrice: Number,
    discount: Number,
    surcharge: Number,
    totalMultiplier: { type: Number, default: 1 },
    priceChangeReason: [String],
    validFrom: { type: Date, default: Date.now },
    validUntil: Date
  },

  // Performance Metrics
  metrics: {
    conversionRate: Number,
    revenuePerAvailableRoom: Number, // RevPAR
    averageDailyRate: Number, // ADR
    priceAcceptanceRate: Number,
    competitiveIndex: Number
  },

  // Pricing Rules
  pricingRules: {
    minPrice: Number,
    maxPrice: Number,
    maxIncreasePercent: { type: Number, default: 50 },
    maxDecreasePercent: { type: Number, default: 30 },
    priceChangeFrequency: { type: Number, default: 60 } // minutes
  },

  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes
dynamicPricingSchema.index({ hotelId: 1, roomType: 1 });
dynamicPricingSchema.index({ 'currentPricing.validFrom': 1, 'currentPricing.validUntil': 1 });
dynamicPricingSchema.index({ 'seasonalFactors.season': 1 });
dynamicPricingSchema.index({ createdAt: -1 });

// Method to calculate dynamic price
dynamicPricingSchema.methods.calculateDynamicPrice = function () {
  let finalMultiplier = 1;
  const reasons = [];

  // Demand-based pricing
  if (this.demandFactors.occupancyRate > 0.8) {
    finalMultiplier *= 1.3;
    reasons.push('High occupancy rate');
  } else if (this.demandFactors.occupancyRate < 0.3) {
    finalMultiplier *= 0.8;
    reasons.push('Low occupancy - special rate');
  }

  // Seasonal adjustments
  finalMultiplier *= this.seasonalFactors.seasonMultiplier;
  if (this.seasonalFactors.seasonMultiplier > 1) {
    reasons.push(`${this.seasonalFactors.season} season premium`);
  }

  // Weather impact
  finalMultiplier *= this.seasonalFactors.weatherImpact.multiplier;

  // Holiday pricing
  if (this.seasonalFactors.holidayPeriod.isHoliday) {
    finalMultiplier *= this.seasonalFactors.holidayPeriod.multiplier;
    reasons.push(`${this.seasonalFactors.holidayPeriod.holidayName} holiday pricing`);
  }

  // Event-based pricing
  this.eventFactors.localEvents.forEach(event => {
    const now = new Date();
    if (now >= event.startDate && now <= event.endDate) {
      finalMultiplier *= event.priceMultiplier;
      reasons.push(`${event.eventName} event pricing`);
    }
  });

  // Time-based factors
  const dayMultipliers = {
    friday: 1.1,
    saturday: 1.2,
    sunday: 1.1
  };
  if (dayMultipliers[this.timeFactors.dayOfWeek]) {
    finalMultiplier *= dayMultipliers[this.timeFactors.dayOfWeek];
    reasons.push('Weekend premium');
  }

  // Last minute pricing
  if (this.timeFactors.lastMinute.isLastMinute) {
    finalMultiplier *= this.timeFactors.lastMinute.multiplier;
    reasons.push('Last minute booking');
  }

  // Customer loyalty discount
  const loyaltyDiscounts = {
    bronze: 0.95,
    silver: 0.9,
    gold: 0.85,
    platinum: 0.8,
    diamond: 0.75
  };
  if (this.customerFactors.loyaltyTier && loyaltyDiscounts[this.customerFactors.loyaltyTier]) {
    finalMultiplier *= loyaltyDiscounts[this.customerFactors.loyaltyTier];
    reasons.push(`${this.customerFactors.loyaltyTier} loyalty discount`);
  }

  // Apply pricing rules constraints
  const maxMultiplier = 1 + (this.pricingRules.maxIncreasePercent / 100);
  const minMultiplier = 1 - (this.pricingRules.maxDecreasePercent / 100);
  finalMultiplier = Math.max(minMultiplier, Math.min(maxMultiplier, finalMultiplier));

  // Calculate final price
  const finalPrice = Math.round(this.basePricing.basePrice * finalMultiplier);

  // Apply min/max constraints
  const constrainedPrice = Math.max(
    this.pricingRules.minPrice || finalPrice,
    Math.min(this.pricingRules.maxPrice || finalPrice, finalPrice)
  );

  // Update current pricing
  this.currentPricing = {
    finalPrice: constrainedPrice,
    originalPrice: this.basePricing.basePrice,
    discount: this.basePricing.basePrice > constrainedPrice ? this.basePricing.basePrice - constrainedPrice : 0,
    surcharge: constrainedPrice > this.basePricing.basePrice ? constrainedPrice - this.basePricing.basePrice : 0,
    totalMultiplier: finalMultiplier,
    priceChangeReason: reasons,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + (this.pricingRules.priceChangeFrequency * 60 * 1000))
  };

  return this.save();
};

// Method to update demand factors
dynamicPricingSchema.methods.updateDemandFactors = function (occupancy, bookingVelocity, searchVolume) {
  this.demandFactors.occupancyRate = occupancy;
  this.demandFactors.bookingVelocity = bookingVelocity;
  this.demandFactors.searchVolume = searchVolume;
  this.demandFactors.marketDemand = this.calculateMarketDemand();
  return this.save();
};

// Method to calculate market demand
dynamicPricingSchema.methods.calculateMarketDemand = function () {
  let demand = 1; // Base demand

  // Factor in occupancy rate
  demand += this.demandFactors.occupancyRate * 2;

  // Factor in booking velocity
  if (this.demandFactors.bookingVelocity > 5) demand += 1;
  else if (this.demandFactors.bookingVelocity < 1) demand -= 1;

  // Factor in search volume
  if (this.demandFactors.searchVolume > 100) demand += 0.5;

  return Math.max(0, Math.min(5, demand));
};

// Static method to get pricing for date range
dynamicPricingSchema.statics.getPricingForDateRange = function (hotelId, roomType, startDate, endDate) {
  return this.find({
    hotelId: hotelId,
    roomType: roomType,
    'currentPricing.validFrom': { $lte: endDate },
    'currentPricing.validUntil': { $gte: startDate },
    isActive: true
  }).sort({ 'currentPricing.validFrom': 1 });
};

// Static method to get competitor analysis
dynamicPricingSchema.statics.getCompetitorAnalysis = function (location, roomType) {
  return this.aggregate([
    {
      $lookup: {
        from: 'hotels',
        localField: 'hotelId',
        foreignField: '_id',
        as: 'hotel'
      }
    },
    {
      $match: {
        'hotel.location': new RegExp(location, 'i'),
        roomType: roomType,
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        avgPrice: { $avg: '$currentPricing.finalPrice' },
        minPrice: { $min: '$currentPricing.finalPrice' },
        maxPrice: { $max: '$currentPricing.finalPrice' },
        priceCount: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('DynamicPricing', dynamicPricingSchema);
