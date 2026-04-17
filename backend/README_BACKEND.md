# Park and Ride System - Backend

Complete REST API backend for a modern Park and Ride sharing system built with **Node.js**, **Express.js**, and **MongoDB**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green)
![License](https://img.shields.io/badge/license-ISC-yellow)

---

## 📋 Quick Overview

A comprehensive backend system that enables:
- ✅ User registration and JWT authentication
- ✅ Parking lot discovery and slot management
- ✅ Booking parking spaces with real-time availability
- ✅ Creating and sharing rides with other users
- ✅ Passenger ride booking and management

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` file:
```
MONGO_URI=mongodb://localhost:27017/parkandride
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
```

### 3. Start Server
```bash
npm start          # Production
npm run dev        # Development with hot-reload
```

Server starts at: `http://localhost:5000`

---

## 📁 Project Structure

```
backend/
├── controllers/          # Business logic for each feature
│   ├── authController.js       → User authentication
│   ├── parkingController.js    → Parking management
│   ├── bookingController.js    → Booking operations
│   └── rideController.js       → Ride operations
├── middlewares/          # Express middleware
│   ├── authMiddleware.js       → JWT verification
│   └── errorMiddleware.js      → Error handling
├── models/               # MongoDB schemas
│   ├── User.js
│   ├── ParkingLot.js
│   ├── ParkingSlot.js
│   ├── Booking.js
│   ├── Ride.js
│   ├── index.js
│   └── SCHEMA_REFERENCE.md
├── routes/               # API endpoints
│   ├── authRoutes.js
│   ├── parkingRoutes.js
│   ├── bookingRoutes.js
│   ├── rideRoutes.js
│   └── testRoutes.js
├── server.js             # Express app setup
├── package.json          # Dependencies
├── API_DOCUMENTATION.md  # Full API reference
├── IMPLEMENTATION_GUIDE.md  # Dev guide
├── TESTING_GUIDE.md      # Testing procedures
└── README.md             # This file
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile *(protected)* |

### Parking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/parking` | Get all parking lots |
| GET | `/api/parking/:id` | Get parking lot details |
| GET | `/api/parking/:id/slots` | Get slots in parking lot |
| POST | `/api/parking` | Create parking lot *(admin)* |

### Booking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/booking` | Create booking *(protected)* |
| GET | `/api/booking/user` | Get user's bookings *(protected)* |
| DELETE | `/api/booking/:id` | Cancel booking *(protected)* |

### Rides
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ride` | Get all available rides |
| POST | `/api/ride` | Create ride *(protected)* |
| GET | `/api/ride/booking/:bookingId` | Get ride for booking *(protected)* |
| POST | `/api/ride/:rideId/book` | Book ride seat *(protected)* |
| DELETE | `/api/ride/:rideId/cancel` | Cancel ride booking *(protected)* |

---

## 🔐 Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Token obtained from login endpoint, expires in 7 days.

---

## 📚 Documentation

### Complete Guides Available:

1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Comprehensive API reference with examples
   - All endpoints explained
   - Request/response formats
   - Error codes and messages
   - Database schemas
   
2. **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Developer guide
   - Project structure overview
   - Setup instructions
   - Key features breakdown
   - Common workflows
   - Debugging tips
   
3. **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing procedures
   - 15+ test cases with cURL commands
   - Expected responses
   - Error scenarios
   - Postman collection info

---

## 🧪 Testing

Quick test with cURL:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "carNumber": "DL01AB1234"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get parking lots
curl -X GET http://localhost:5000/api/parking
```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for complete test suite.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Password Security:** bcryptjs
- **CORS:** Enabled for frontend integration
- **Environment:** dotenv

---

## 📦 Dependencies

```json
{
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.6",
  "dotenv": "^17.4.1",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^9.4.1"
}
```

Dev Dependencies:
```json
{
  "nodemon": "^3.1.14"
}
```

---

## 🔍 Key Features

### 1. User Management
- Secure registration with email validation
- Login with JWT token generation
- Profile management
- Unique car number verification

### 2. Parking Management
- Browse multiple parking lots
- Real-time slot availability
- Price per hour tracking
- Amenities display (Security, CCTV, EV Charging, etc.)
- Floor/section organization

### 3. Booking System
- Automated price calculation based on hours
- Automatic slot occupancy management
- Booking status tracking (booked, in-progress, completed, cancelled)
- Payment method selection
- Cancellation with slot release

### 4. Ride Sharing
- Driver can create rides with available seats
- Passengers can book seats in rides
- Real-time seat availability
- Location-based ride discovery
- Price per seat management
- Ride cancellation support

### 5. Error Handling
- Global error middleware
- Validation error messages
- Consistent JSON responses
- HTTP status codes
- Helpful error descriptions

---

## 📊 Database Models

### User
- Registration and authentication
- Car number for parking verification
- Account status tracking

### ParkingLot
- Multiple parking locations
- Geolocation support (latitude/longitude)
- Slot management
- Dynamic pricing

### ParkingSlot
- Individual slot tracking
- Occupancy status
- Maintenance tracking
- Vehicle type constraints

### Booking
- User-to-parking-lot relationship
- Time-based pricing
- Payment tracking
- Status management

### Ride
- Driver information
- Route details (from/to locations)
- Passenger management
- Pricing per seat

---

## ⚙️ Configuration

### Environment Variables

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/parkandride

# JWT Secret (use strong secret in production)
JWT_SECRET=your_super_secret_key_min_32_characters_recommended

# Server Configuration
PORT=5000
NODE_ENV=development|production
```

---

## 🔒 Security Features

✅ **Password Hashing** - bcryptjs with salt rounds
✅ **JWT Authentication** - 7-day token expiration
✅ **Protected Routes** - Middleware-based access control
✅ **Input Validation** - Server-side validation on all endpoints
✅ **Unique Constraints** - Email and car number uniqueness
✅ **CORS Protection** - Cross-origin requests configured
✅ **Error Handling** - No sensitive data in error messages
✅ **Database Indexing** - Performance optimization

---

## 🚨 Common Issues

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in .env
- Verify network access

### Token Expired Error
- Get new token from login endpoint
- Token valid for 7 days from login

### "User already exists"
- Use different email
- Car number must be unique

### Slot Not Available
- Choose different time slot
- Try another parking lot
- Cancel existing booking

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for more troubleshooting.

---

## 📈 Performance

- MongoDB indexes for fast queries
- Efficient slot availability calculation
- Denormalized data for quick lookups
- Proper query optimization
- Connection pooling via Mongoose

---

## 🔄 API Workflow Example

### Complete User Journey:

```
1. Register → POST /api/auth/register
2. Login → POST /api/auth/login (get token)
3. Browse Lots → GET /api/parking
4. View Slots → GET /api/parking/:id/slots
5. Create Booking → POST /api/booking
6. View Rides → GET /api/ride
7. Book Seat → POST /api/ride/:id/book
8. View Profile → GET /api/auth/profile
9. View Bookings → GET /api/booking/user
```

---

## 🤝 Contributing

To extend functionality:
1. Add new controller in `controllers/`
2. Create routes in `routes/`
3. Define models in `models/` if needed
4. Add middleware if necessary
5. Update server.js with new routes
6. Document in API_DOCUMENTATION.md

---

## 📞 Support & Documentation

- **Full API Docs:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Developer Guide:** [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Testing Guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Schema Reference:** [models/SCHEMA_REFERENCE.md](./models/SCHEMA_REFERENCE.md)

---

## 📜 License

ISC License - See LICENSE file for details

---

## 🎯 Version History

### v1.0.0 (Current)
- ✅ Complete authentication system (register, login, profile)
- ✅ Full parking management (browse, view slots, create lots)
- ✅ Complete booking system (create, cancel, view bookings)
- ✅ Ride sharing system (create, book, view rides)
- ✅ Error handling middleware
- ✅ JWT-based security
- ✅ Full API documentation
- ✅ Comprehensive testing guide

---

## 🎉 Ready to Use!

The backend is fully functional and ready for integration with a frontend application.

**Next Steps:**
1. ✅ Backend is complete
2. Build frontend (React/Vue/Angular)
3. Connect frontend to these API endpoints
4. Deploy to production

---

**Happy Coding!** 🚀

For detailed information, please refer to the comprehensive documentation files included in this project.

---

*Last Updated: 2024*
*Version: 1.0.0*
