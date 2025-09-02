# 🚀 Hotel Royal Palace - Complete Deployment Guide

This guide will help you deploy your full-stack Hotel Royal Palace booking system.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

## 🏗️ Project Structure

```
Hotel-Website-React/
├── src/                    # React frontend
├── backend/               # Node.js/Express API
├── package.json          # Frontend dependencies
└── README.md
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/hotel-royal-palace

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas cloud connection
# Update MONGODB_URI in .env with your Atlas connection string
```

### 5. Seed Database
```bash
npm run seed
```

### 6. Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Backend will run on: `http://localhost:5000`

## ⚛️ Frontend Setup

### 1. Navigate to Root Directory
```bash
cd ..  # Go back to project root
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 🧪 Testing the Application

### 1. Check Backend Health
```bash
curl http://localhost:5000/api/health
```

### 2. Test Hotel Search
```bash
curl "http://localhost:5000/api/hotels/search?location=Mumbai"
```

### 3. Frontend Features to Test
- ✅ Home page loads with carousel
- ✅ Hotel search functionality
- ✅ Booking form submission
- ✅ PDF receipt generation
- ✅ Navigation between pages

## 🔍 Common Issues & Solutions

### Backend Issues

**Issue**: MongoDB connection error
```bash
# Solution: Start MongoDB service
brew services start mongodb/brew/mongodb-community
# Or on Linux/Windows: mongod
```

**Issue**: Port 5000 already in use
```bash
# Solution: Change PORT in .env file
PORT=5001
```

**Issue**: JWT_SECRET error
```bash
# Solution: Set proper JWT_SECRET in .env
JWT_SECRET=your-actual-secret-key-here
```

### Frontend Issues

**Issue**: API calls failing
```bash
# Solution: Ensure backend is running on correct port
# Check console for CORS errors
```

**Issue**: Images not loading
```bash
# Solution: Verify image paths in src/assets/Component/Image/
```

## 🌐 Production Deployment

### Backend (Node.js)

#### Option 1: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-hotel-api

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-production-secret
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy backend"
git push heroku main
```

#### Option 2: DigitalOcean/AWS
```bash
# Build and deploy using PM2
npm install -g pm2
pm2 start server.js --name hotel-api
pm2 startup
pm2 save
```

### Frontend (React)

#### Option 1: Netlify
```bash
# Build for production
npm run build

# Deploy dist/ folder to Netlify
# Update API URLs to production backend
```

#### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Database (MongoDB)

#### MongoDB Atlas (Recommended)
1. Create account at mongodb.com/atlas
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in production

## 🔒 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS for production
- [ ] Enable MongoDB authentication
- [ ] Set up proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

## 📊 API Endpoints Summary

### Hotels
- `GET /api/hotels` - List all hotels
- `GET /api/hotels/search?location=Mumbai` - Search hotels
- `POST /api/hotels` - Create hotel (Admin)

### Bookings
- `POST /api/bookings/book-hotel` - Create booking
- `GET /api/bookings` - List bookings
- `GET /api/bookings/customer/:email` - Customer bookings

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile

## 🛠️ Development Commands

### Backend
```bash
npm run dev      # Start with nodemon
npm run seed     # Seed database
npm start        # Production start
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
```

## 📞 Support

For issues or questions:
- Email: RoyalHotel@info.com
- Check logs in browser console and server terminal
- Verify all environment variables are set

## 🎉 Success!

If everything is working:
- ✅ Backend API responding on port 5000
- ✅ Frontend loading on port 5173
- ✅ Database connected and seeded
- ✅ Booking system functional
- ✅ PDF receipts generating

Your Hotel Royal Palace booking system is now ready for guests! 🏨
