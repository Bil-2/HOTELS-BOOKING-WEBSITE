const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const hotelRoutes = require('./routes/hotels');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');
const hotelChainRoutes = require('./routes/hotelChain');
const staffRoutes = require('./routes/staff');
const aiAssistantRoutes = require('./routes/aiAssistant');

const app = express();
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// AI Assistant specific rate limiting (more restrictive)
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 AI requests per minute
  message: {
    error: 'Too many AI requests, please slow down.'
  }
});
app.use('/api/ai-assistant/', aiLimiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// API Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chain', hotelChainRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hotel Royal Palace Multi-Chain Management API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api/status', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

    // Get basic stats
    const Hotel = require('./models/Hotel');
    const HotelChain = require('./models/HotelChain');
    const Booking = require('./models/Booking');

    const [hotelCount, chainCount, bookingCount] = await Promise.all([
      Hotel.countDocuments({ isActive: true }),
      HotelChain.countDocuments({ isActive: true }),
      Booking.countDocuments()
    ]);

    res.json({
      status: 'OK',
      database: dbStatus,
      statistics: {
        totalHotels: hotelCount,
        totalChains: chainCount,
        totalBookings: bookingCount
      },
      features: {
        multiHotelManagement: true,
        aiAssistant: true,
        staffManagement: true,
        inventoryTracking: true,
        realTimeAnalytics: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Unable to fetch system status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableEndpoints: {
      hotels: '/api/hotels',
      bookings: '/api/bookings',
      auth: '/api/auth',
      hotelChain: '/api/chain',
      staff: '/api/staff',
      aiAssistant: '/api/ai-assistant',
      health: '/api/health',
      status: '/api/status'
    }
  });
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-royal-palace-chain',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);

    // Start server after successful DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Hotel Royal Palace Multi-Chain Management Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📈 Status check: http://localhost:${PORT}/api/status`);
      console.log(`🤖 AI Assistant: http://localhost:${PORT}/api/ai-assistant`);
      console.log(`👥 Staff Management: http://localhost:${PORT}/api/staff`);
      console.log(`🏨 Hotel Chain Management: http://localhost:${PORT}/api/chain`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);

    // Retry connection after 5 seconds
    console.log('🔄 Retrying database connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📦 Database connection closed.');
    process.exit(0);
  });
});

// Initialize database connection
connectDB();

module.exports = app;
