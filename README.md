# Hotel Royal Palace - Backend API

A comprehensive Node.js/Express backend for the Hotel Royal Palace booking system with MongoDB database integration.

## 🚀 Features

- **Hotel Management**: CRUD operations for hotels with search and filtering
- **Booking System**: Complete booking workflow with PDF receipt generation
- **Authentication**: JWT-based user authentication and authorization
- **Payment Integration**: Support for multiple payment methods
- **PDF Receipts**: Automatic generation of booking confirmation receipts
- **Database Seeding**: Sample hotel data for development

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **PDF Generation**: PDFKit
- **Validation**: Mongoose validators + custom validation
- **Security**: bcryptjs for password hashing

## 📦 Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running locally or update MONGODB_URI in .env
   mongod
   ```

5. **Seed the database (optional)**
   ```bash
   node -e "require('./utils/seedData').seedHotels().then(() => process.exit())"
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/hotel-royal-palace

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📚 API Endpoints

### Hotels
- `GET /api/hotels` - Get all hotels with filtering
- `GET /api/hotels/search?location=Mumbai` - Search hotels by location
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels` - Create new hotel (Admin)
- `PUT /api/hotels/:id` - Update hotel (Admin)
- `DELETE /api/hotels/:id` - Deactivate hotel (Admin)
- `GET /api/hotels/:id/availability` - Check hotel availability

### Bookings
- `GET /api/bookings` - Get all bookings with pagination
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings/book-hotel` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/customer/:email` - Get bookings by customer email
- `GET /api/bookings/stats/overview` - Get booking statistics

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### System
- `GET /api/health` - Health check endpoint

## 📋 API Usage Examples

### Search Hotels
```bash
curl "http://localhost:5000/api/hotels/search?location=Mumbai"
```

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings/book-hotel \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "email": "john@example.com",
    "phone_number": "+91-9876543210",
    "hotelName": "Hotel Novotel",
    "location": "kolkata",
    "checkIn": "2025-01-15",
    "checkOut": "2025-01-17",
    "guests": 2,
    "paymentMethod": "Google Pay",
    "paymentStatus": "Completed",
    "price": 5000
  }'
```

### User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+91-9876543210"
  }'
```

## 🗂️ Project Structure

```
backend/
├── models/           # Database models
│   ├── Hotel.js
│   ├── Booking.js
│   └── User.js
├── routes/           # API routes
│   ├── hotels.js
│   ├── bookings.js
│   └── auth.js
├── utils/            # Utility functions
│   ├── pdfGenerator.js
│   └── seedData.js
├── receipts/         # Generated PDF receipts
├── uploads/          # File uploads
├── server.js         # Main server file
├── package.json
└── .env
```

## 🔒 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 📄 PDF Receipts

Booking confirmations automatically generate PDF receipts that include:
- Booking details and confirmation ID
- Customer information
- Hotel information
- Payment details
- Price breakdown with GST
- Terms and conditions

Receipts are accessible at: `http://localhost:5000/receipts/{bookingId}.pdf`

## 🌱 Database Seeding

To populate the database with sample hotel data:

```bash
node -e "require('./utils/seedData').seedHotels().then(() => console.log('✅ Seeding complete')).catch(console.error)"
```

## 🚦 Development

1. **Start in development mode**
   ```bash
   npm run dev
   ```

2. **Check API health**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **View logs**
   - Server logs show in console
   - MongoDB connection status
   - API request/response logs

## 🔧 Production Deployment

1. **Set environment to production**
   ```env
   NODE_ENV=production
   ```

2. **Use production MongoDB URI**
   ```env
   MONGODB_URI=mongodb://your-production-db-uri
   ```

3. **Start with PM2 (recommended)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name hotel-api
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support, email: RoyalHotel@info.com

---

**Hotel Royal Palace Backend API** - Built with ❤️ using Node.js and Express
