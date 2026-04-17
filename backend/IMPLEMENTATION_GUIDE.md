# Park and Ride System - Implementation Guide

## 📁 Project Structure

```
backend/
├── controllers/
│   ├── authController.js       ✅ User authentication & profile
│   ├── parkingController.js    ✅ Parking lots & slots management
│   ├── bookingController.js    ✅ Booking creation & management
│   └── rideController.js       ✅ Ride creation & management
├── middlewares/
│   ├── authMiddleware.js       ✅ JWT token protection
│   └── errorMiddleware.js      ✅ Global error handling
├── models/
│   ├── User.js                 ✅ User schema
│   ├── ParkingLot.js           ✅ Parking lot schema
│   ├── ParkingSlot.js          ✅ Parking slot schema
│   ├── Booking.js              ✅ Booking schema
│   ├── Ride.js                 ✅ Ride schema
│   ├── index.js                ✅ Models export
│   └── SCHEMA_REFERENCE.md     📄 Schema documentation
├── routes/
│   ├── authRoutes.js           ✅ Auth endpoints
│   ├── parkingRoutes.js        ✅ Parking endpoints
│   ├── bookingRoutes.js        ✅ Booking endpoints
│   ├── rideRoutes.js           ✅ Ride endpoints
│   └── testRoutes.js           ✅ Test endpoints
├── server.js                   ✅ Express server setup
├── package.json                ✅ Dependencies
├── .env                        📝 Environment variables
├── API_DOCUMENTATION.md        📄 Full API docs
└── IMPLEMENTATION_GUIDE.md     📄 This file
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
Create `.env` file:
```
MONGO_URI=mongodb://localhost:27017/parkandride
JWT_SECRET=your_super_secret_key_change_this
PORT=5000
NODE_ENV=development
```

### 3. Start Server
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

Server runs on: `http://localhost:5000`

---

## 🔑 Key Features Implemented

### ✅ Authentication System
- **Register**: Create new user with email, password, and car number
- **Login**: Get JWT token valid for 7 days
- **Protected Routes**: Auth middleware validates JWT on protected endpoints
- **Password Security**: Hashed with bcryptjs

### ✅ Parking Management
- **View All Lots**: Public endpoint to browse parking lots
- **Filter by ID**: Get specific parking lot details
- **View Slots**: See available, occupied, and maintenance slots
- **Real-time Availability**: Slot status updates automatically

### ✅ Booking System
- **Create Booking**: Reserve a parking slot for specific time
- **Auto Slot Assignment**: Slot marked as occupied automatically
- **Price Calculation**: Based on hours booked × rate
- **Cancel Booking**: Free up slots, update availability
- **User Bookings**: View all bookings grouped by status

### ✅ Ride Sharing
- **Create Ride**: Driver posts a ride with departure time and seats
- **Book Seats**: Passengers can book available seats
- **View Rides**: Browse upcoming rides with real-time seat count
- **Ride Details**: Get driver info, locations, price
- **Cancel Booking**: Passenger can cancel ride booking

### ✅ Error Handling
- **Global Error Handler**: Centralized error management
- **Validation Errors**: 400 Bad Request with details
- **Auth Errors**: 401 Unauthorized, 403 Forbidden
- **Not Found**: 404 for missing resources
- **Server Errors**: 500 with helpful messages

---

## 📋 API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | ❌ |
| POST | /api/auth/login | Login user | ❌ |
| GET | /api/auth/profile | Get user profile | ✅ |
| GET | /api/parking | Get all parking lots | ❌ |
| GET | /api/parking/:id | Get parking lot details | ❌ |
| GET | /api/parking/:id/slots | Get slots in lot | ❌ |
| POST | /api/parking | Create parking lot | ✅ |
| POST | /api/booking | Create booking | ✅ |
| GET | /api/booking/user | Get user bookings | ✅ |
| DELETE | /api/booking/:id | Cancel booking | ✅ |
| POST | /api/ride | Create ride | ✅ |
| GET | /api/ride | Get all rides | ❌ |
| GET | /api/ride/booking/:bookingId | Get ride for booking | ✅ |
| POST | /api/ride/:rideId/book | Book ride seat | ✅ |
| DELETE | /api/ride/:rideId/cancel | Cancel ride booking | ✅ |

---

## 🧪 Testing Endpoints

### Create Sample Data

1. **Register a User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "carNumber": "DL01AB1234"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```
Save the token from response.

3. **Get Profile** (Protected)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <your_token>"
```

4. **Get All Parking Lots**
```bash
curl -X GET http://localhost:5000/api/parking
```

---

## 🔐 Authentication Flow

```
1. User Registration
   └─> POST /api/auth/register
       └─> User created in MongoDB
           └─> Password hashed with bcryptjs

2. User Login
   └─> POST /api/auth/login
       └─> Email & password verified
           └─> JWT token generated (7 day expiry)
               └─> Token returned to client

3. Protected Route Access
   └─> GET /api/auth/profile
       └─> Authorization: Bearer <token>
           └─> authMiddleware validates token
               └─> Route handler executes
                   └─> Response sent
```

---

## 📊 Database Relationships

```
User (1) ──→ (Many) Booking
         └──→ (Many) Ride (as driver)

ParkingLot (1) ──→ (Many) ParkingSlot
            └──→ (Many) Booking

ParkingSlot (1) ──→ (1) Booking

Booking (1) ──→ (1) User
       └──→ (1) ParkingLot
           └──→ (1) ParkingSlot

Ride (1) ──→ (1) User (driver)
    └──→ (Many) User (passengers)
```

---

## 🛡️ Middleware Stack

### Global Middlewares (applied to all routes)
```
1. express.json()        - Parse JSON request bodies
2. cors()                - Handle cross-origin requests
3. errorHandler          - Catch and handle errors (applied last)
```

### Route-specific Middlewares
```
/api/auth/profile  - protect (JWT validation)
/api/booking/*     - protect (JWT validation)
/api/ride (POST)   - protect (JWT validation)
/api/parking (POST) - protect (JWT validation)
```

---

## ⚡ Error Handling Examples

### Missing Required Fields
```json
{
  "msg": "Please provide all required fields"
}
```

### Invalid Token
```json
{
  "message": "Token failed"
}
```

### Resource Not Found
```json
{
  "msg": "Parking lot not found"
}
```

### Unauthorized Access
```json
{
  "msg": "Not authorized to perform this action"
}
```

---

## 🔍 Debugging Tips

### Enable MongoDB Logs
```javascript
// In server.js
mongoose.set('debug', true);
```

### Log Request Details
```javascript
// Add to server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Check Token Payload
```bash
# Use jwt.io to decode tokens
# Paste your token at https://jwt.io
```

---

## 📝 Code Quality

### Best Practices Implemented
✅ Async/await error handling
✅ Input validation on all endpoints
✅ Consistent error responses
✅ JWT-based authentication
✅ MongoDB indexing for performance
✅ Modular controller structure
✅ Proper HTTP status codes
✅ CORS enabled for frontend integration
✅ Environment variable configuration
✅ Global error middleware

---

## 🚨 Common Issues & Solutions

### Issue: "MongoDB Connection Error"
**Solution**: 
- Check MONGO_URI in .env
- Ensure MongoDB is running
- Verify network connection

### Issue: "Token failed"
**Solution**:
- Check JWT_SECRET in .env
- Verify token format (Bearer <token>)
- Check token expiration (7 days)

### Issue: "Slot not available"
**Solution**:
- Choose a different time slot
- Select another parking lot
- Cancel existing booking to free up slot

### Issue: "User already exists"
**Solution**:
- Use different email
- Car number must be unique

---

## 🔄 Common Workflows

### Workflow 1: Book Parking
```
1. Register/Login
2. Browse parking lots (GET /api/parking)
3. View available slots (GET /api/parking/:id/slots)
4. Create booking (POST /api/booking)
5. Receive booking confirmation
```

### Workflow 2: Offer a Ride
```
1. Register/Login (as driver)
2. Create ride (POST /api/ride)
3. Share ride ID with passengers
4. Passengers book seats (POST /api/ride/:id/book)
5. View booked passengers
```

### Workflow 3: Share Parking with Ride
```
1. Create parking booking
2. Create ride with same departure time
3. Passengers can book ride and share parking
4. Save money with shared parking & ride
```

---

## 📈 Performance Optimizations

✅ MongoDB indexes on frequently queried fields
✅ Populate only needed fields in queries
✅ Efficient slot availability calculation
✅ Denormalized availableSlots field in ParkingLot
✅ Compound indexes for complex queries
✅ Proper pagination support

---

## 🔐 Security Checklist

- ✅ JWT tokens with expiration
- ✅ Password hashing (bcryptjs)
- ✅ Protected routes with middleware
- ✅ Input validation on all endpoints
- ✅ CORS configured
- ✅ Error messages don't leak sensitive data
- ✅ Unique constraints on email/carNumber
- ✅ Rate limiting ready (add with express-rate-limit)
- ✅ HTTPS recommended for production

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

---

## 🤝 Contributing

To extend this system:

1. Add new controller in `controllers/`
2. Create routes in `routes/`
3. Define models in `models/`
4. Add middleware if needed in `middlewares/`
5. Update server.js with new routes
6. Test all endpoints
7. Update API_DOCUMENTATION.md

---

## 📞 Support

For issues or questions:
1. Check API_DOCUMENTATION.md
2. Review error messages carefully
3. Check MongoDB connection
4. Verify environment variables
5. Test with Postman/cURL

---

## Version History
- **v1.0.0** (Current): Complete backend implementation
  - 5 controllers with 15+ endpoints
  - 2 middleware (auth + error handling)
  - 5 models with proper schemas
  - 4 route files
  - Full API documentation

---

Happy Coding! 🎉
