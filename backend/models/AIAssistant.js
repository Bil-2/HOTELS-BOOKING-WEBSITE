const mongoose = require('mongoose');

const aiAssistantSchema = new mongoose.Schema({
  // Session Information
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true,
    trim: true
  },

  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestId: String, // For non-registered users

  // Hotel Context
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  chainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelChain'
  },

  // Conversation Details
  conversations: [{
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    sender: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'booking_inquiry', 'complaint', 'information', 'emergency'],
      default: 'text'
    },
    intent: {
      type: String,
      enum: ['booking', 'cancellation', 'room_service', 'facilities', 'directions', 'complaint', 'emergency', 'general']
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be less than 0'],
      max: [1, 'Confidence cannot be more than 1']
    }
  }],

  // Session Status
  status: {
    type: String,
    enum: ['active', 'resolved', 'escalated', 'abandoned'],
    default: 'active'
  },

  // Language and Preferences
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
  },

  // Context and State
  context: {
    currentTopic: String,
    userPreferences: {
      roomType: String,
      budget: Number,
      checkIn: Date,
      checkOut: Date,
      guests: Number
    },
    bookingInProgress: {
      type: Boolean,
      default: false
    },
    escalationReason: String
  },

  // Performance Metrics
  metrics: {
    responseTime: {
      type: Number, // in milliseconds
      default: 0
    },
    satisfactionRating: {
      type: Number,
      min: [1, 'Rating cannot be less than 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    issueResolved: {
      type: Boolean,
      default: false
    },
    escalatedToHuman: {
      type: Boolean,
      default: false
    }
  },

  // Contact Information
  contactInfo: {
    name: String,
    email: String,
    phone: String
  },

  // Session Metadata
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // in minutes

  // Device and Location
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    platform: String
  },

  // Follow-up Actions
  followUpActions: [{
    action: {
      type: String,
      enum: ['send_email', 'schedule_callback', 'create_ticket', 'book_room', 'send_sms']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    scheduledTime: Date,
    completedTime: Date,
    details: String
  }],

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
aiAssistantSchema.index({ sessionId: 1 });
aiAssistantSchema.index({ userId: 1 });
aiAssistantSchema.index({ hotelId: 1 });
aiAssistantSchema.index({ chainId: 1 });
aiAssistantSchema.index({ status: 1 });
aiAssistantSchema.index({ startTime: 1 });
aiAssistantSchema.index({ language: 1 });

// Virtual for conversation count
aiAssistantSchema.virtual('messageCount').get(function () {
  return this.conversations.length;
});

// Virtual for session duration
aiAssistantSchema.virtual('sessionDuration').get(function () {
  if (this.endTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
  }
  return Math.round((new Date() - this.startTime) / (1000 * 60));
});

// Method to add conversation message
aiAssistantSchema.methods.addMessage = function (message, sender, messageType = 'text', intent = 'general', confidence = 0.8) {
  this.conversations.push({
    message,
    sender,
    messageType,
    intent,
    confidence
  });
  return this.save();
};

// Method to end session
aiAssistantSchema.methods.endSession = function (status = 'resolved') {
  this.status = status;
  this.endTime = new Date();
  this.duration = this.sessionDuration;
  return this.save();
};

// Method to escalate to human
aiAssistantSchema.methods.escalateToHuman = function (reason) {
  this.status = 'escalated';
  this.context.escalationReason = reason;
  this.metrics.escalatedToHuman = true;
  return this.save();
};

// Method to add follow-up action
aiAssistantSchema.methods.addFollowUpAction = function (action, details, scheduledTime) {
  this.followUpActions.push({
    action,
    details,
    scheduledTime
  });
  return this.save();
};

// Static method to get active sessions by hotel
aiAssistantSchema.statics.getActiveSessions = function (hotelId) {
  return this.find({
    hotelId: hotelId,
    status: 'active',
    isActive: true
  });
};

// Static method to get session analytics
aiAssistantSchema.statics.getAnalytics = function (hotelId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        hotelId: mongoose.Types.ObjectId(hotelId),
        startTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        resolvedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        escalatedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'escalated'] }, 1, 0] }
        },
        avgDuration: { $avg: '$duration' },
        avgSatisfaction: { $avg: '$metrics.satisfactionRating' },
        avgResponseTime: { $avg: '$metrics.responseTime' }
      }
    }
  ]);
};

// Static method to find sessions by intent
aiAssistantSchema.statics.findByIntent = function (intent, hotelId) {
  return this.find({
    'conversations.intent': intent,
    hotelId: hotelId,
    isActive: true
  });
};

module.exports = mongoose.model('AIAssistant', aiAssistantSchema);
