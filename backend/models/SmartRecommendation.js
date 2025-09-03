const mongoose = require('mongoose');

const smartRecommendationSchema = new mongoose.Schema({
  // User Context
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  guestFingerprint: String, // For anonymous users

  // User Preferences Analysis
  preferences: {
    budget: {
      min: Number,
      max: Number,
      preferred: Number
    },
    roomTypes: [{
      type: String,
      weight: { type: Number, default: 1 }
    }],
    amenities: [{
      name: String,
      importance: { type: Number, min: 1, max: 5 }
    }],
    locations: [{
      city: String,
      preference: { type: Number, min: 1, max: 5 }
    }],
    travelPurpose: {
      type: String,
      enum: ['business', 'leisure', 'family', 'romantic', 'adventure', 'wellness']
    },
    groupSize: {
      adults: Number,
      children: Number
    }
  },

  // Behavioral Data
  behaviorData: {
    searchHistory: [{
      query: String,
      location: String,
      checkIn: Date,
      checkOut: Date,
      timestamp: { type: Date, default: Date.now }
    }],
    viewedHotels: [{
      hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
      viewDuration: Number, // seconds
      timestamp: { type: Date, default: Date.now }
    }],
    bookingHistory: [{
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
      satisfaction: { type: Number, min: 1, max: 5 },
      timestamp: { type: Date, default: Date.now }
    }],
    clickPatterns: [{
      element: String,
      page: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },

  // AI Recommendations
  recommendations: [{
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    score: { type: Number, min: 0, max: 1 },
    reasons: [String],
    category: {
      type: String,
      enum: ['perfect_match', 'budget_friendly', 'luxury_upgrade', 'similar_taste', 'trending']
    },
    confidence: { type: Number, min: 0, max: 1 },
    generatedAt: { type: Date, default: Date.now }
  }],

  // Machine Learning Features
  mlFeatures: {
    userVector: [Number], // User embedding vector
    seasonalPreferences: {
      spring: Number,
      summer: Number,
      autumn: Number,
      winter: Number
    },
    priceElasticity: Number, // How price-sensitive the user is
    loyaltyScore: Number, // Brand loyalty indicator
    adventureScore: Number, // Willingness to try new places
  },

  // Real-time Context
  currentContext: {
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
      country: String
    },
    weather: String,
    timeOfDay: String,
    device: String,
    urgency: { type: Number, min: 1, max: 5 } // How urgent is the booking
  },

  // Performance Metrics
  metrics: {
    recommendationAccuracy: Number,
    clickThroughRate: Number,
    conversionRate: Number,
    userSatisfaction: Number,
    lastUpdated: { type: Date, default: Date.now }
  },

  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for performance
smartRecommendationSchema.index({ userId: 1 });
smartRecommendationSchema.index({ sessionId: 1 });
smartRecommendationSchema.index({ 'recommendations.score': -1 });
smartRecommendationSchema.index({ 'preferences.travelPurpose': 1 });
smartRecommendationSchema.index({ createdAt: -1 });

// Method to update user preferences based on behavior
smartRecommendationSchema.methods.updatePreferences = function (newBehavior) {
  // AI logic to update preferences based on user behavior
  if (newBehavior.type === 'hotel_view') {
    this.behaviorData.viewedHotels.push({
      hotelId: newBehavior.hotelId,
      viewDuration: newBehavior.duration,
      timestamp: new Date()
    });
  }

  // Update ML features
  this.mlFeatures.lastInteraction = new Date();
  return this.save();
};

// Method to generate personalized recommendations
smartRecommendationSchema.methods.generateRecommendations = async function () {
  // This would integrate with ML service
  const Hotel = mongoose.model('Hotel');

  // Get hotels based on preferences
  const hotels = await Hotel.find({
    'roomTypes.price': {
      $gte: this.preferences.budget.min || 0,
      $lte: this.preferences.budget.max || 999999
    },
    isActive: true,
    status: 'Active'
  }).limit(20);

  // AI scoring algorithm (simplified)
  const recommendations = hotels.map(hotel => {
    let score = 0;
    const reasons = [];

    // Budget match
    const avgPrice = hotel.roomTypes.reduce((sum, room) => sum + room.price, 0) / hotel.roomTypes.length;
    if (avgPrice <= this.preferences.budget.preferred) {
      score += 0.3;
      reasons.push('Within your budget');
    }

    // Amenity match
    const userAmenities = this.preferences.amenities.map(a => a.name);
    const matchingAmenities = hotel.amenities.filter(a => userAmenities.includes(a));
    score += (matchingAmenities.length / userAmenities.length) * 0.4;

    if (matchingAmenities.length > 0) {
      reasons.push(`Has ${matchingAmenities.length} of your preferred amenities`);
    }

    // Rating boost
    score += (hotel.rating / 5) * 0.3;
    if (hotel.rating >= 4) {
      reasons.push('Highly rated by guests');
    }

    return {
      hotelId: hotel._id,
      score: Math.min(score, 1),
      reasons,
      category: score > 0.8 ? 'perfect_match' : score > 0.6 ? 'similar_taste' : 'budget_friendly',
      confidence: score
    };
  });

  // Sort by score and take top 10
  this.recommendations = recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return this.save();
};

// Static method to get trending hotels
smartRecommendationSchema.statics.getTrendingHotels = function (location, limit = 5) {
  return this.aggregate([
    {
      $match: {
        'behaviorData.viewedHotels.0': { $exists: true },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }
    },
    {
      $unwind: '$behaviorData.viewedHotels'
    },
    {
      $group: {
        _id: '$behaviorData.viewedHotels.hotelId',
        viewCount: { $sum: 1 },
        avgViewDuration: { $avg: '$behaviorData.viewedHotels.viewDuration' }
      }
    },
    {
      $sort: { viewCount: -1, avgViewDuration: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'hotels',
        localField: '_id',
        foreignField: '_id',
        as: 'hotel'
      }
    }
  ]);
};

module.exports = mongoose.model('SmartRecommendation', smartRecommendationSchema);
