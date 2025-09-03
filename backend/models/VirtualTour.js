const mongoose = require('mongoose');

const virtualTourSchema = new mongoose.Schema({
  // Hotel Reference
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },

  // Tour Information
  tourInfo: {
    title: { type: String, required: true },
    description: String,
    tourType: {
      type: String,
      enum: ['full_hotel', 'room_specific', 'amenities', 'exterior', 'custom'],
      required: true
    },
    duration: Number, // estimated duration in minutes
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'comprehensive'],
      default: 'easy'
    },
    language: { type: String, default: 'en' },
    isPublic: { type: Boolean, default: true }
  },

  // 360° Scenes
  scenes: [{
    sceneId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ['lobby', 'room', 'bathroom', 'restaurant', 'pool', 'gym', 'spa', 'exterior', 'corridor', 'amenity']
    },

    // 360° Image/Video
    media: {
      type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
      },
      url: { type: String, required: true },
      thumbnailUrl: String,
      resolution: {
        width: Number,
        height: Number
      },
      fileSize: Number,
      format: String // jpg, png, mp4, etc.
    },

    // Scene Position and Orientation
    position: {
      x: Number,
      y: Number,
      z: Number,
      floor: Number
    },
    initialView: {
      pitch: { type: Number, default: 0 }, // vertical angle
      yaw: { type: Number, default: 0 },   // horizontal angle
      fov: { type: Number, default: 90 }   // field of view
    },

    // Interactive Hotspots
    hotspots: [{
      hotspotId: String,
      type: {
        type: String,
        enum: ['navigation', 'info', 'booking', 'media', 'product', 'service']
      },
      position: {
        pitch: Number,
        yaw: Number
      },
      content: {
        title: String,
        description: String,
        mediaUrl: String,
        linkUrl: String,
        actionType: {
          type: String,
          enum: ['navigate', 'show_info', 'book_room', 'call_service', 'view_menu', 'external_link']
        }
      },
      styling: {
        icon: String,
        color: String,
        animation: String,
        size: { type: String, default: 'medium' }
      },
      targetScene: String, // for navigation hotspots
      isActive: { type: Boolean, default: true }
    }],

    // Audio
    audio: {
      narrationUrl: String,
      backgroundMusicUrl: String,
      ambientSoundUrl: String,
      autoPlay: { type: Boolean, default: false },
      volume: { type: Number, default: 0.5, min: 0, max: 1 }
    },

    // Scene Settings
    settings: {
      autoRotate: { type: Boolean, default: false },
      autoRotateSpeed: { type: Number, default: 2 },
      mouseZoom: { type: Boolean, default: true },
      mouseControl: { type: Boolean, default: true },
      showControls: { type: Boolean, default: true },
      showCompass: { type: Boolean, default: false }
    }
  }],

  // Tour Navigation
  navigation: {
    startScene: { type: String, required: true },
    tourPath: [String], // suggested path through scenes
    allowFreeNavigation: { type: Boolean, default: true },
    showMiniMap: { type: Boolean, default: false },
    showProgress: { type: Boolean, default: true }
  },

  // Interactive Features
  interactiveFeatures: {
    roomBooking: {
      enabled: { type: Boolean, default: true },
      availableRooms: [String], // room types that can be booked
      bookingWidget: {
        position: String,
        style: String
      }
    },

    virtualConcierge: {
      enabled: { type: Boolean, default: false },
      aiAssistantId: String,
      triggerScenes: [String] // scenes where concierge appears
    },

    socialSharing: {
      enabled: { type: Boolean, default: true },
      platforms: [String], // facebook, twitter, instagram, etc.
      customMessage: String
    },

    measurements: {
      enabled: { type: Boolean, default: false },
      units: { type: String, enum: ['metric', 'imperial'], default: 'metric' }
    }
  },

  // Customization
  branding: {
    logo: {
      url: String,
      position: { type: String, default: 'top-left' },
      size: { type: String, default: 'medium' }
    },
    colors: {
      primary: String,
      secondary: String,
      accent: String,
      background: String
    },
    fonts: {
      primary: String,
      secondary: String
    },
    customCSS: String
  },

  // Analytics and Tracking
  analytics: {
    totalViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    averageViewTime: Number, // in seconds
    completionRate: Number, // percentage who complete full tour

    sceneAnalytics: [{
      sceneId: String,
      views: { type: Number, default: 0 },
      averageTimeSpent: Number,
      hotspotClicks: [{
        hotspotId: String,
        clicks: { type: Number, default: 0 }
      }],
      exitRate: Number // percentage who exit from this scene
    }],

    deviceStats: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      vr: { type: Number, default: 0 }
    },

    geographicData: [{
      country: String,
      city: String,
      views: { type: Number, default: 0 }
    }],

    conversionMetrics: {
      bookingConversions: { type: Number, default: 0 },
      inquiryConversions: { type: Number, default: 0 },
      shareConversions: { type: Number, default: 0 }
    }
  },

  // Technical Settings
  technical: {
    loadingStrategy: {
      type: String,
      enum: ['progressive', 'preload', 'lazy'],
      default: 'progressive'
    },
    qualitySettings: {
      autoQuality: { type: Boolean, default: true },
      maxQuality: { type: String, enum: ['low', 'medium', 'high', 'ultra'], default: 'high' },
      adaptiveStreaming: { type: Boolean, default: true }
    },
    compatibility: {
      webVR: { type: Boolean, default: true },
      mobileVR: { type: Boolean, default: true },
      fallbackMode: { type: String, default: 'panorama' }
    },
    performance: {
      maxConcurrentUsers: { type: Number, default: 100 },
      cachingEnabled: { type: Boolean, default: true },
      cdnEnabled: { type: Boolean, default: true }
    }
  },

  // Access Control
  access: {
    isPublic: { type: Boolean, default: true },
    requiresLogin: { type: Boolean, default: false },
    allowedUserTypes: [String],
    passwordProtected: { type: Boolean, default: false },
    password: String,
    expiryDate: Date,
    maxViews: Number,
    currentViews: { type: Number, default: 0 }
  },

  // SEO and Metadata
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String,
    canonicalUrl: String,
    structuredData: mongoose.Schema.Types.Mixed
  },

  // Version Control
  version: {
    major: { type: Number, default: 1 },
    minor: { type: Number, default: 0 },
    patch: { type: Number, default: 0 },
    changelog: [String],
    lastUpdated: { type: Date, default: Date.now }
  },

  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes
virtualTourSchema.index({ hotelId: 1 });
virtualTourSchema.index({ 'tourInfo.tourType': 1 });
virtualTourSchema.index({ 'scenes.sceneId': 1 });
virtualTourSchema.index({ isPublic: 1, isActive: 1 });
virtualTourSchema.index({ 'analytics.totalViews': -1 });

// Virtual for tour URL
virtualTourSchema.virtual('tourUrl').get(function () {
  return `/virtual-tour/${this.hotelId}/${this._id}`;
});

// Method to track view
virtualTourSchema.methods.trackView = function (deviceType, location) {
  this.analytics.totalViews += 1;

  // Update device stats
  if (this.analytics.deviceStats[deviceType]) {
    this.analytics.deviceStats[deviceType] += 1;
  }

  // Update geographic data
  if (location && location.country) {
    const geoEntry = this.analytics.geographicData.find(
      entry => entry.country === location.country && entry.city === location.city
    );

    if (geoEntry) {
      geoEntry.views += 1;
    } else {
      this.analytics.geographicData.push({
        country: location.country,
        city: location.city,
        views: 1
      });
    }
  }

  return this.save();
};

// Method to track scene interaction
virtualTourSchema.methods.trackSceneInteraction = function (sceneId, timeSpent, hotspotClicks) {
  let sceneAnalytic = this.analytics.sceneAnalytics.find(s => s.sceneId === sceneId);

  if (!sceneAnalytic) {
    sceneAnalytic = {
      sceneId: sceneId,
      views: 0,
      averageTimeSpent: 0,
      hotspotClicks: [],
      exitRate: 0
    };
    this.analytics.sceneAnalytics.push(sceneAnalytic);
  }

  sceneAnalytic.views += 1;
  sceneAnalytic.averageTimeSpent =
    (sceneAnalytic.averageTimeSpent * (sceneAnalytic.views - 1) + timeSpent) / sceneAnalytic.views;

  // Track hotspot clicks
  if (hotspotClicks && hotspotClicks.length > 0) {
    hotspotClicks.forEach(clickedHotspot => {
      let hotspotStat = sceneAnalytic.hotspotClicks.find(h => h.hotspotId === clickedHotspot);
      if (hotspotStat) {
        hotspotStat.clicks += 1;
      } else {
        sceneAnalytic.hotspotClicks.push({
          hotspotId: clickedHotspot,
          clicks: 1
        });
      }
    });
  }

  return this.save();
};

// Method to add new scene
virtualTourSchema.methods.addScene = function (sceneData) {
  // Generate unique scene ID
  const sceneId = `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sceneData.sceneId = sceneId;

  this.scenes.push(sceneData);

  // If this is the first scene, make it the start scene
  if (this.scenes.length === 1) {
    this.navigation.startScene = sceneId;
  }

  return this.save();
};

// Method to get tour statistics
virtualTourSchema.methods.getStatistics = function () {
  const totalScenes = this.scenes.length;
  const totalHotspots = this.scenes.reduce((sum, scene) => sum + scene.hotspots.length, 0);

  return {
    totalViews: this.analytics.totalViews,
    uniqueVisitors: this.analytics.uniqueVisitors,
    averageViewTime: this.analytics.averageViewTime,
    completionRate: this.analytics.completionRate,
    totalScenes: totalScenes,
    totalHotspots: totalHotspots,
    conversionRate: this.analytics.totalViews > 0 ?
      (this.analytics.conversionMetrics.bookingConversions / this.analytics.totalViews * 100) : 0
  };
};

// Static method to get popular tours
virtualTourSchema.statics.getPopularTours = function (limit = 10) {
  return this.find({
    isActive: true,
    isPublished: true,
    isPublic: true
  })
    .sort({ 'analytics.totalViews': -1 })
    .limit(limit)
    .populate('hotelId', 'name location rating');
};

// Static method to get tours by hotel chain
virtualTourSchema.statics.getToursByChain = function (chainId) {
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
        'hotel.chainId': mongoose.Types.ObjectId(chainId),
        isActive: true,
        isPublished: true
      }
    },
    {
      $project: {
        tourInfo: 1,
        analytics: 1,
        hotel: { $arrayElemAt: ['$hotel', 0] }
      }
    }
  ]);
};

module.exports = mongoose.model('VirtualTour', virtualTourSchema);
