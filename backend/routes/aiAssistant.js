const express = require('express');
const router = express.Router();
const AIAssistant = require('../models/AIAssistant');
const Hotel = require('../models/Hotel');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// @route   POST /api/ai-assistant/session
// @desc    Start new AI assistant session
// @access  Public
router.post('/session', [
  body('hotelId').optional().isMongoId().withMessage('Invalid hotel ID'),
  body('language').optional().isIn(['en', 'hi', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const sessionId = uuidv4();
    const { hotelId, userId, language = 'en', contactInfo, deviceInfo } = req.body;

    let chainId = null;
    if (hotelId) {
      const hotel = await Hotel.findById(hotelId);
      if (hotel) {
        chainId = hotel.chainId;
      }
    }

    const session = new AIAssistant({
      sessionId,
      userId,
      guestId: userId ? null : uuidv4(),
      hotelId,
      chainId,
      language,
      contactInfo: contactInfo || {},
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        platform: deviceInfo?.platform || 'web',
        ...deviceInfo
      }
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'AI Assistant session started',
      data: {
        sessionId: session.sessionId,
        language: session.language,
        startTime: session.startTime
      }
    });
  } catch (error) {
    console.error('Error starting AI session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting AI session'
    });
  }
});

// @route   POST /api/ai-assistant/message
// @desc    Send message to AI assistant
// @access  Public
router.post('/message', [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
  body('messageType').optional().isIn(['text', 'booking_inquiry', 'complaint', 'information', 'emergency']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { sessionId, message, messageType = 'text' } = req.body;

    const session = await AIAssistant.findOne({ sessionId, isActive: true });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired'
      });
    }

    // Add user message
    await session.addMessage(message, 'user', messageType);

    // Simple AI response logic (in production, integrate with actual AI service)
    const aiResponse = generateAIResponse(message, messageType, session);
    const intent = detectIntent(message);

    // Add AI response
    await session.addMessage(aiResponse.message, 'assistant', 'text', intent, aiResponse.confidence);

    // Update session context if needed
    if (aiResponse.context) {
      session.context = { ...session.context, ...aiResponse.context };
      await session.save();
    }

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        response: aiResponse.message,
        intent,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions || []
      }
    });
  } catch (error) {
    console.error('Error processing AI message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing message'
    });
  }
});

// @route   GET /api/ai-assistant/session/:sessionId
// @desc    Get session conversation history
// @access  Public
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await AIAssistant.findOne({
      sessionId: req.params.sessionId,
      isActive: true
    }).populate('hotelId', 'name location');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        language: session.language,
        startTime: session.startTime,
        duration: session.sessionDuration,
        hotel: session.hotelId,
        conversations: session.conversations,
        messageCount: session.messageCount
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching session'
    });
  }
});

// @route   POST /api/ai-assistant/session/:sessionId/end
// @desc    End AI assistant session
// @access  Public
router.post('/session/:sessionId/end', [
  body('status').optional().isIn(['resolved', 'escalated', 'abandoned']).withMessage('Invalid status'),
  body('satisfactionRating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')
], async (req, res) => {
  try {
    const { status = 'resolved', satisfactionRating } = req.body;

    const session = await AIAssistant.findOne({
      sessionId: req.params.sessionId,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update satisfaction rating if provided
    if (satisfactionRating) {
      session.metrics.satisfactionRating = satisfactionRating;
    }

    await session.endSession(status);

    res.json({
      success: true,
      message: 'Session ended successfully',
      data: {
        sessionId: session.sessionId,
        status: session.status,
        duration: session.duration,
        messageCount: session.messageCount
      }
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while ending session'
    });
  }
});

// @route   POST /api/ai-assistant/session/:sessionId/escalate
// @desc    Escalate session to human agent
// @access  Public
router.post('/session/:sessionId/escalate', [
  body('reason').trim().isLength({ min: 5, max: 200 }).withMessage('Escalation reason must be 5-200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { reason } = req.body;

    const session = await AIAssistant.findOne({
      sessionId: req.params.sessionId,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.escalateToHuman(reason);

    res.json({
      success: true,
      message: 'Session escalated to human agent',
      data: {
        sessionId: session.sessionId,
        status: session.status,
        escalationReason: reason
      }
    });
  } catch (error) {
    console.error('Error escalating session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while escalating session'
    });
  }
});

// @route   GET /api/ai-assistant/analytics/:hotelId
// @desc    Get AI assistant analytics for hotel
// @access  Private (Staff only)
router.get('/analytics/:hotelId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await AIAssistant.getAnalytics(req.params.hotelId, start, end);

    // Get active sessions count
    const activeSessions = await AIAssistant.getActiveSessions(req.params.hotelId);

    // Get popular intents
    const intentAnalytics = await AIAssistant.aggregate([
      {
        $match: {
          hotelId: mongoose.Types.ObjectId(req.params.hotelId),
          startTime: { $gte: start, $lte: end }
        }
      },
      { $unwind: '$conversations' },
      { $match: { 'conversations.sender': 'user' } },
      {
        $group: {
          _id: '$conversations.intent',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        summary: analytics[0] || {
          totalSessions: 0,
          resolvedSessions: 0,
          escalatedSessions: 0,
          avgDuration: 0,
          avgSatisfaction: 0,
          avgResponseTime: 0
        },
        activeSessions: activeSessions.length,
        popularIntents: intentAnalytics,
        dateRange: { start, end }
      }
    });
  } catch (error) {
    console.error('Error fetching AI analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

// Helper function to generate AI responses (simplified)
function generateAIResponse(message, messageType, session) {
  const lowerMessage = message.toLowerCase();

  // Booking inquiries
  if (lowerMessage.includes('book') || lowerMessage.includes('reservation') || messageType === 'booking_inquiry') {
    return {
      message: "I'd be happy to help you with your booking! Could you please tell me your preferred check-in and check-out dates, and how many guests will be staying?",
      confidence: 0.9,
      context: { bookingInProgress: true },
      suggestions: ['Check availability', 'View room types', 'Special offers']
    };
  }

  // Room service
  if (lowerMessage.includes('room service') || lowerMessage.includes('food') || lowerMessage.includes('menu')) {
    return {
      message: "Our room service is available 24/7! You can order from our extensive menu through the in-room tablet or by calling extension 1234. Would you like me to help you with anything specific?",
      confidence: 0.85,
      suggestions: ['View menu', 'Order now', 'Dietary restrictions']
    };
  }

  // Facilities
  if (lowerMessage.includes('facilities') || lowerMessage.includes('amenities') || lowerMessage.includes('pool') || lowerMessage.includes('gym')) {
    return {
      message: "We offer excellent facilities including a swimming pool, fitness center, spa, restaurant, and business center. All facilities are open daily with varying hours. Which facility would you like to know more about?",
      confidence: 0.8,
      suggestions: ['Pool hours', 'Gym equipment', 'Spa services', 'Restaurant menu']
    };
  }

  // Complaints
  if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('complaint') || messageType === 'complaint') {
    return {
      message: "I'm sorry to hear you're experiencing an issue. I want to help resolve this for you immediately. Could you please provide more details about the problem you're facing?",
      confidence: 0.9,
      suggestions: ['Speak to manager', 'Report maintenance issue', 'Request room change']
    };
  }

  // Emergency
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || messageType === 'emergency') {
    return {
      message: "This appears to be an emergency. I'm immediately connecting you with our front desk staff. For immediate assistance, please call our emergency line at +91-XXXX-XXXX or press the emergency button in your room.",
      confidence: 1.0,
      context: { escalationReason: 'Emergency situation' }
    };
  }

  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      message: `Hello! Welcome to ${session.hotelId ? 'our hotel' : 'Hotel Royal Palace'}! I'm your AI assistant, available 24/7 to help you with bookings, information about our facilities, room service, and any other questions you might have. How can I assist you today?`,
      confidence: 0.95,
      suggestions: ['Make a booking', 'Hotel facilities', 'Room service', 'Local attractions']
    };
  }

  // Default response
  return {
    message: "Thank you for your message! I'm here to help you with hotel bookings, information about our facilities, room service, and any other questions. Could you please provide more details about what you're looking for?",
    confidence: 0.6,
    suggestions: ['Make a booking', 'Hotel information', 'Contact front desk', 'Speak to human agent']
  };
}

// Helper function to detect intent
function detectIntent(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('book') || lowerMessage.includes('reservation')) return 'booking';
  if (lowerMessage.includes('cancel')) return 'cancellation';
  if (lowerMessage.includes('room service') || lowerMessage.includes('food')) return 'room_service';
  if (lowerMessage.includes('facilities') || lowerMessage.includes('amenities')) return 'facilities';
  if (lowerMessage.includes('direction') || lowerMessage.includes('location')) return 'directions';
  if (lowerMessage.includes('problem') || lowerMessage.includes('complaint')) return 'complaint';
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) return 'emergency';

  return 'general';
}

module.exports = router;
