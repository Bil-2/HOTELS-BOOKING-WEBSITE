const express = require('express');
const router = express.Router();
const SmartRecommendation = require('../models/SmartRecommendation');
const DynamicPricing = require('../models/DynamicPricing');
const VirtualTour = require('../models/VirtualTour');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Generate AI-powered recommendations
router.post('/generate', async (req, res) => {
  try {
    const { userId, sessionId, searchCriteria, preferences, filters } = req.body;

    // Get user's booking history for personalization
    const userBookings = await Booking.find({
      userId: userId,
      status: { $in: ['confirmed', 'completed'] }
    }).populate('hotelId');

    // Get user's previous interactions
    const userInteractions = await SmartRecommendation.find({
      userId: userId,
      'userInteractions.0': { $exists: true }
    }).sort({ createdAt: -1 }).limit(10);

    // Build user profile from history
    const userProfile = await buildUserProfile(userId, userBookings, userInteractions);

    // Get available hotels based on search criteria
    let availableHotels = await Hotel.find({
      'location.city': { $regex: searchCriteria.destination, $options: 'i' },
      status: 'active'
    });

    // Apply basic filters
    if (searchCriteria.checkIn && searchCriteria.checkOut) {
      // Check availability for the date range
      availableHotels = await filterByAvailability(availableHotels, searchCriteria);
    }

    // Generate AI recommendations for each hotel
    const recommendations = [];

    for (const hotel of availableHotels) {
      // Calculate AI score based on user preferences and behavior
      const aiScore = await calculateAIScore(hotel, userProfile, preferences, searchCriteria);

      if (aiScore.score > 0.3) { // Only include hotels with decent match
        // Get dynamic pricing
        const dynamicPricing = await getDynamicPricing(hotel._id, searchCriteria);

        // Get virtual tour info
        const virtualTour = await VirtualTour.findOne({ hotelId: hotel._id, isActive: true });

        // Determine recommendation category
        const category = determineCategory(aiScore, dynamicPricing, userProfile);

        // Generate AI reasons
        const reasons = generateReasons(aiScore, hotel, userProfile, dynamicPricing);

        recommendations.push({
          hotelId: hotel._id,
          name: hotel.name,
          location: `${hotel.location.city}, ${hotel.location.state}`,
          rating: hotel.rating,
          image: hotel.images && hotel.images.length > 0 ? hotel.images[0] : '/default-hotel.jpg',
          amenities: hotel.amenities || [],
          score: aiScore.score,
          confidence: aiScore.confidence,
          reasons: reasons,
          category: category,
          dynamicPricing: dynamicPricing,
          virtualTour: virtualTour ? {
            available: true,
            scenes: virtualTour.scenes.length,
            duration: virtualTour.estimatedDuration
          } : null,
          availability: await getAvailabilityInfo(hotel, searchCriteria),
          popularity: hotel.bookingStats?.totalBookings || 0
        });
      }
    }

    // Sort by AI score
    recommendations.sort((a, b) => b.score - a.score);

    // Apply category filters
    let filteredRecommendations = recommendations;
    if (filters.category && filters.category !== 'all') {
      filteredRecommendations = recommendations.filter(r => r.category === filters.category);
    }

    // Generate AI insights
    const insights = generateAIInsights(userProfile, recommendations, searchCriteria);

    // Save recommendation session
    const recommendationSession = new SmartRecommendation({
      userId: userId,
      sessionId: sessionId,
      searchCriteria: searchCriteria,
      userPreferences: preferences,
      userProfile: userProfile,
      recommendations: filteredRecommendations.slice(0, 20), // Top 20
      aiInsights: insights,
      generatedAt: new Date()
    });

    await recommendationSession.save();

    res.json({
      success: true,
      recommendations: filteredRecommendations.slice(0, 12), // Return top 12 initially
      insights: insights,
      sessionId: recommendationSession._id
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
});

// Track user interactions for ML learning
router.post('/track', async (req, res) => {
  try {
    const { userId, sessionId, action, data, timestamp } = req.body;

    // Find the recommendation session
    const session = await SmartRecommendation.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation session not found'
      });
    }

    // Add interaction to session
    session.userInteractions.push({
      action: action,
      data: data,
      timestamp: timestamp || new Date(),
      context: {
        deviceType: req.headers['user-agent'] ? 'web' : 'unknown',
        sessionDuration: Date.now() - session.createdAt.getTime()
      }
    });

    // Update performance metrics based on action
    updatePerformanceMetrics(session, action, data);

    await session.save();

    // Update user's long-term preferences based on interactions
    await updateUserPreferences(userId, action, data);

    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track interaction',
      error: error.message
    });
  }
});

// Get personalized hotel details with AI insights
router.get('/hotel/:hotelId/insights', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { userId, sessionId } = req.query;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Get user profile
    const userBookings = await Booking.find({ userId: userId });
    const userInteractions = await SmartRecommendation.find({ userId: userId });
    const userProfile = await buildUserProfile(userId, userBookings, userInteractions);

    // Generate personalized insights for this hotel
    const insights = {
      personalizedScore: await calculateAIScore(hotel, userProfile),
      priceComparison: await getPriceComparison(hotel, userProfile),
      similarHotels: await getSimilarHotels(hotel, userProfile),
      bestTimeToBook: await getBestBookingTime(hotel),
      userRecommendations: await getUserSpecificRecommendations(hotel, userProfile)
    };

    res.json({
      success: true,
      hotel: hotel,
      insights: insights
    });

  } catch (error) {
    console.error('Error getting hotel insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hotel insights',
      error: error.message
    });
  }
});

// Get trending hotels and recommendations
router.get('/trending', async (req, res) => {
  try {
    const { location, timeframe = '7d' } = req.query;

    // Calculate trending hotels based on recent bookings and interactions
    const trendingHotels = await SmartRecommendation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - getTrendingTimeframe(timeframe))
          },
          ...(location && {
            'searchCriteria.destination': { $regex: location, $options: 'i' }
          })
        }
      },
      {
        $unwind: '$userInteractions'
      },
      {
        $match: {
          'userInteractions.action': { $in: ['hotel_viewed', 'hotel_liked', 'booking_initiated'] }
        }
      },
      {
        $group: {
          _id: '$userInteractions.data.hotelId',
          interactionCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          avgScore: { $avg: '$userInteractions.data.score' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
          trendingScore: {
            $multiply: [
              '$interactionCount',
              { $divide: ['$uniqueUserCount', 10] },
              { $ifNull: ['$avgScore', 0.5] }
            ]
          }
        }
      },
      {
        $sort: { trendingScore: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Populate hotel details
    const trendingHotelIds = trendingHotels.map(t => t._id);
    const hotels = await Hotel.find({ _id: { $in: trendingHotelIds } });

    const trendingWithDetails = trendingHotels.map(trending => {
      const hotel = hotels.find(h => h._id.toString() === trending._id.toString());
      return {
        hotel: hotel,
        trendingScore: trending.trendingScore,
        interactionCount: trending.interactionCount,
        uniqueUsers: trending.uniqueUserCount
      };
    });

    res.json({
      success: true,
      trending: trendingWithDetails,
      timeframe: timeframe
    });

  } catch (error) {
    console.error('Error getting trending hotels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending hotels',
      error: error.message
    });
  }
});

// Get recommendation analytics for admin
router.get('/analytics', auth, async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const matchQuery = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (userId) {
      matchQuery.userId = userId;
    }

    const analytics = await SmartRecommendation.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          avgRecommendations: { $avg: { $size: '$recommendations' } },
          totalInteractions: { $sum: { $size: '$userInteractions' } },
          avgClickThroughRate: { $avg: '$performanceMetrics.clickThroughRate' },
          avgConversionRate: { $avg: '$performanceMetrics.conversionRate' },
          avgEngagementScore: { $avg: '$performanceMetrics.engagementScore' }
        }
      }
    ]);

    // Get category distribution
    const categoryStats = await SmartRecommendation.aggregate([
      { $match: matchQuery },
      { $unwind: '$recommendations' },
      {
        $group: {
          _id: '$recommendations.category',
          count: { $sum: 1 },
          avgScore: { $avg: '$recommendations.score' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get interaction patterns
    const interactionStats = await SmartRecommendation.aggregate([
      { $match: matchQuery },
      { $unwind: '$userInteractions' },
      {
        $group: {
          _id: '$userInteractions.action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      analytics: analytics[0] || {},
      categoryStats: categoryStats,
      interactionStats: interactionStats
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
});

// Helper Functions

async function buildUserProfile(userId, bookings, interactions) {
  const profile = {
    userId: userId,
    bookingHistory: {
      totalBookings: bookings.length,
      avgPrice: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / (bookings.length || 1),
      preferredLocations: [...new Set(bookings.map(b => b.hotelId?.location?.city).filter(Boolean))],
      preferredAmenities: []
    },
    behaviorPatterns: {
      searchFrequency: interactions.length,
      avgSessionDuration: 0,
      preferredCategories: [],
      interactionTypes: {}
    },
    preferences: {
      priceRange: { min: 0, max: 50000 },
      travelPurpose: 'leisure',
      groupSize: { adults: 2, children: 0 }
    }
  };

  // Analyze booking patterns
  if (bookings.length > 0) {
    const prices = bookings.map(b => b.totalAmount).filter(Boolean);
    profile.preferences.priceRange = {
      min: Math.min(...prices) * 0.8,
      max: Math.max(...prices) * 1.2
    };

    // Extract preferred amenities from booked hotels
    const allAmenities = bookings.flatMap(b => b.hotelId?.amenities || []);
    const amenityCounts = {};
    allAmenities.forEach(amenity => {
      amenityCounts[amenity] = (amenityCounts[amenity] || 0) + 1;
    });
    profile.bookingHistory.preferredAmenities = Object.entries(amenityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([amenity]) => amenity);
  }

  // Analyze interaction patterns
  interactions.forEach(session => {
    session.userInteractions.forEach(interaction => {
      profile.behaviorPatterns.interactionTypes[interaction.action] =
        (profile.behaviorPatterns.interactionTypes[interaction.action] || 0) + 1;
    });
  });

  return profile;
}

async function calculateAIScore(hotel, userProfile, preferences = {}, searchCriteria = {}) {
  let score = 0.5; // Base score
  let confidence = 0.7;
  const factors = {};

  // Location preference (20% weight)
  if (userProfile.bookingHistory.preferredLocations.includes(hotel.location.city)) {
    score += 0.2;
    factors.locationMatch = 0.2;
  }

  // Price preference (25% weight)
  const hotelPrice = hotel.roomTypes?.[0]?.price || 10000;
  const userPriceRange = preferences.budget || userProfile.preferences.priceRange;
  if (hotelPrice >= userPriceRange.min && hotelPrice <= userPriceRange.max) {
    score += 0.25;
    factors.priceMatch = 0.25;
  } else if (hotelPrice <= userPriceRange.preferred) {
    score += 0.15;
    factors.priceMatch = 0.15;
  }

  // Amenity preference (20% weight)
  const hotelAmenities = hotel.amenities || [];
  const preferredAmenities = preferences.amenities || userProfile.bookingHistory.preferredAmenities;
  const amenityMatches = hotelAmenities.filter(a => preferredAmenities.includes(a)).length;
  if (preferredAmenities.length > 0) {
    const amenityScore = (amenityMatches / preferredAmenities.length) * 0.2;
    score += amenityScore;
    factors.amenityMatch = amenityScore;
  }

  // Rating influence (15% weight)
  const ratingScore = ((hotel.rating || 3) / 5) * 0.15;
  score += ratingScore;
  factors.ratingScore = ratingScore;

  // Availability bonus (10% weight)
  if (hotel.roomTypes?.some(rt => rt.available > 0)) {
    score += 0.1;
    factors.availabilityBonus = 0.1;
  }

  // Behavioral patterns (10% weight)
  const userInteractionTypes = userProfile.behaviorPatterns.interactionTypes;
  if (userInteractionTypes.hotel_liked > userInteractionTypes.hotel_disliked) {
    score += 0.05;
    factors.behaviorBonus = 0.05;
  }

  // Ensure score is between 0 and 1
  score = Math.min(Math.max(score, 0), 1);

  // Calculate confidence based on data availability
  confidence = Math.min(
    0.5 +
    (userProfile.bookingHistory.totalBookings > 0 ? 0.2 : 0) +
    (preferredAmenities.length > 0 ? 0.15 : 0) +
    (Object.keys(userInteractionTypes).length > 0 ? 0.15 : 0),
    1
  );

  return { score, confidence, factors };
}

async function getDynamicPricing(hotelId, searchCriteria) {
  try {
    const pricing = await DynamicPricing.findOne({ hotelId: hotelId });
    if (!pricing) return null;

    const hotel = await Hotel.findById(hotelId);
    const basePrice = hotel.roomTypes?.[0]?.price || 10000;

    // Calculate dynamic price based on demand, seasonality, etc.
    let finalPrice = basePrice;
    let discount = 0;
    const priceChangeReasons = [];

    // Apply demand multiplier
    if (pricing.demandFactors.currentDemand > 0.8) {
      finalPrice *= 1.2;
      priceChangeReasons.push('High demand');
    } else if (pricing.demandFactors.currentDemand < 0.3) {
      finalPrice *= 0.85;
      discount = basePrice - finalPrice;
      priceChangeReasons.push('Low demand discount');
    }

    // Apply seasonal adjustments
    const month = new Date().getMonth();
    if (pricing.seasonalFactors.peakSeasons.includes(month)) {
      finalPrice *= 1.15;
      priceChangeReasons.push('Peak season');
    }

    // Apply event-based pricing
    if (pricing.eventFactors.length > 0) {
      finalPrice *= 1.1;
      priceChangeReasons.push('Local events');
    }

    return {
      originalPrice: basePrice,
      finalPrice: Math.round(finalPrice),
      discount: Math.round(discount),
      priceChangeReason: priceChangeReasons,
      lastUpdated: pricing.lastUpdated
    };
  } catch (error) {
    console.error('Error getting dynamic pricing:', error);
    return null;
  }
}

function determineCategory(aiScore, dynamicPricing, userProfile) {
  if (aiScore.score > 0.85) return 'perfect_match';
  if (dynamicPricing?.discount > 0) return 'budget_friendly';
  if (dynamicPricing?.finalPrice > userProfile.preferences.priceRange.max) return 'luxury_upgrade';
  if (aiScore.factors.amenityMatch > 0.15) return 'similar_taste';
  return 'trending';
}

function generateReasons(aiScore, hotel, userProfile, dynamicPricing) {
  const reasons = [];

  if (aiScore.factors.locationMatch) {
    reasons.push(`You've stayed in ${hotel.location.city} before`);
  }
  if (aiScore.factors.priceMatch > 0.2) {
    reasons.push('Perfect match for your budget');
  }
  if (aiScore.factors.amenityMatch > 0.1) {
    reasons.push('Has amenities you typically prefer');
  }
  if (hotel.rating >= 4.5) {
    reasons.push('Highly rated by guests');
  }
  if (dynamicPricing?.discount > 0) {
    reasons.push(`Save ₹${dynamicPricing.discount.toLocaleString()} with current offer`);
  }

  return reasons.slice(0, 4); // Return top 4 reasons
}

async function getAvailabilityInfo(hotel, searchCriteria) {
  const totalRooms = hotel.roomTypes?.reduce((sum, rt) => sum + (rt.totalRooms || 0), 0) || 0;
  const availableRooms = hotel.roomTypes?.reduce((sum, rt) => sum + (rt.available || 0), 0) || 0;

  const availabilityRatio = totalRooms > 0 ? availableRooms / totalRooms : 0;

  let status = 'high';
  let urgency = false;

  if (availabilityRatio < 0.2) {
    status = 'low';
    urgency = true;
  } else if (availabilityRatio < 0.5) {
    status = 'medium';
  }

  return {
    roomsLeft: availableRooms,
    status: status,
    urgency: urgency
  };
}

function generateAIInsights(userProfile, recommendations, searchCriteria) {
  const insights = {
    userStyle: 'Balanced Traveler',
    bestBookingTime: '2-3 weeks in advance',
    trendingCategory: 'Luxury Hotels'
  };

  // Determine user style based on booking history and preferences
  const avgPrice = userProfile.bookingHistory.avgPrice;
  if (avgPrice > 15000) {
    insights.userStyle = 'Luxury Traveler';
  } else if (avgPrice < 5000) {
    insights.userStyle = 'Budget Conscious';
  } else {
    insights.userStyle = 'Value Seeker';
  }

  // Determine trending category from recommendations
  const categoryCount = {};
  recommendations.forEach(r => {
    categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
  });

  const topCategory = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)[0];

  if (topCategory) {
    insights.trendingCategory = topCategory[0].replace('_', ' ');
  }

  return insights;
}

function updatePerformanceMetrics(session, action, data) {
  if (!session.performanceMetrics) {
    session.performanceMetrics = {
      clickThroughRate: 0,
      conversionRate: 0,
      engagementScore: 0,
      totalViews: 0,
      totalClicks: 0,
      totalBookings: 0
    };
  }

  const metrics = session.performanceMetrics;

  switch (action) {
    case 'recommendations_viewed':
      metrics.totalViews += 1;
      break;
    case 'hotel_viewed':
      metrics.totalClicks += 1;
      break;
    case 'booking_initiated':
      metrics.totalBookings += 1;
      break;
    case 'hotel_liked':
      metrics.engagementScore += 1;
      break;
    case 'hotel_disliked':
      metrics.engagementScore -= 0.5;
      break;
  }

  // Recalculate rates
  if (metrics.totalViews > 0) {
    metrics.clickThroughRate = metrics.totalClicks / metrics.totalViews;
  }
  if (metrics.totalClicks > 0) {
    metrics.conversionRate = metrics.totalBookings / metrics.totalClicks;
  }
}

async function updateUserPreferences(userId, action, data) {
  // This would update a user preferences collection
  // For now, we'll just log the preference update
  console.log(`Updating preferences for user ${userId} based on ${action}:`, data);
}

function getTrendingTimeframe(timeframe) {
  const timeframes = {
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };
  return timeframes[timeframe] || timeframes['7d'];
}

async function filterByAvailability(hotels, searchCriteria) {
  // This would check actual availability against bookings
  // For now, return all hotels (simplified)
  return hotels.filter(hotel =>
    hotel.roomTypes && hotel.roomTypes.some(rt => rt.available > 0)
  );
}

module.exports = router;
