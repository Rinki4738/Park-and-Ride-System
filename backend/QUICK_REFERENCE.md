# Park and Ride API - Quick Reference Card

## 🚀 Quick Start

```bash
npm install              # Install dependencies
npm start               # Start server (http://localhost:5000)
npm run dev             # Development mode with hot-reload
```

---

## 🔑 Authentication

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "carNumber": "DL01AB1234"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
Response: { "token": "jwt_token_here", "userId": "..." }
```

### Protected Endpoints
```
Authorization: Bearer <jwt_token>
```

---

## 🅿️ Parking Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/parking` | GET | ❌ | Get all lots |
| `/api/parking/:id` | GET | ❌ | Get lot details |
| `/api/parking/:id/slots` | GET | ❌ | Get slots |
| `/api/parking` | POST | ✅ | Create lot |

---

## 📦 Booking Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/booking` | POST | ✅ | Create booking |
| `/api/booking/user` | GET | ✅ | Get user bookings |
| `/api/booking/:id` | DELETE | ✅ | Cancel booking |

---

## 🚗 Ride Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/ride` | GET | ❌ | Get all rides |
| `/api/ride` | POST | ✅ | Create ride |
| `/api/ride/booking/:bookingId` | GET | ✅ | Get ride for booking |
| `/api/ride/:rideId/book` | POST | ✅ | Book seat |
| `/api/ride/:rideId/cancel` | DELETE | ✅ | Cancel booking |

---

## 📊 Response Format

### Success (2xx)
```json
{
  "msg": "Success message",
  "data": { /* data */ }
}
```

### Error (4xx/5xx)
```json
{
  "msg": "Error message"
}
```

---

## 🔐 JWT Token Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗂️ File Locations

| Component | File |
|-----------|------|
| Auth Logic | `controllers/authController.js` |
| Parking Logic | `controllers/parkingController.js` |
| Booking Logic | `controllers/bookingController.js` |
| Ride Logic | `controllers/rideController.js` |
| Auth Routes | `routes/authRoutes.js` |
| Parking Routes | `routes/parkingRoutes.js` |
| Booking Routes | `routes/bookingRoutes.js` |
| Ride Routes | `routes/rideRoutes.js` |
| JWT Middleware | `middlewares/authMiddleware.js` |
| Error Middleware | `middlewares/errorMiddleware.js` |
| Main Server | `server.js` |

---

## 🧪 Test Examples

### cURL - Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123","carNumber":"DL01AB1234"}'
```

### cURL - Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

### cURL - Get Parking Lots (Protected)
```bash
curl -X GET http://localhost:5000/api/parking \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛠️ Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/parkandride
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

---

## 💾 Database Collections

- **users** - User accounts
- **parkinglots** - Parking locations
- **parkingslots** - Individual slots
- **bookings** - Parking reservations
- **rides** - Ride offerings

---

## 🚨 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - No/invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 500 | Server Error |

---

## ✅ Validation Rules

### User Registration
- Name: 2-100 chars
- Email: Valid email format
- Password: 6+ chars
- CarNumber: Indian format (e.g., DL01AB1234)

### Parking Booking
- StartTime: Must be in future
- EndTime: Must be after StartTime
- Slot: Must be available
- Price: Auto-calculated from hours × rate

### Ride Creation
- Seats: 1-8 seats
- DepartureTime: Must be in future
- TotalSeats: Min 1, Max 8

---

## 🔄 Common Workflows

### Book Parking
```
1. POST /api/auth/register        → Create account
2. POST /api/auth/login           → Get JWT token
3. GET /api/parking               → Browse lots
4. GET /api/parking/:id/slots     → See slots
5. POST /api/booking              → Create booking
```

### Share Ride
```
1. POST /api/auth/login           → Get JWT token
2. POST /api/ride                 → Create ride
3. GET /api/ride                  → Share ride ID
4. POST /api/ride/:id/book        → Passenger books
```

---

## 📈 Pricing Calculation

```
Total Price = Hours × Price Per Hour

Example:
- Start: 14:00
- End: 18:00
- Hours: 4
- Price/Hour: ₹50
- Total: ₹200
```

---

## 🔍 Debug Tips

1. **Check token:** Use [jwt.io](https://jwt.io)
2. **Check MongoDB:** Use MongoDB Compass
3. **Check logs:** Review console output
4. **Test endpoints:** Use Postman or cURL
5. **Review errors:** Read error messages carefully

---

## 📚 Documentation

- Full API docs: `API_DOCUMENTATION.md`
- Developer guide: `IMPLEMENTATION_GUIDE.md`
- Testing guide: `TESTING_GUIDE.md`
- Schema info: `models/SCHEMA_REFERENCE.md`
- Backend overview: `README_BACKEND.md`

---

## ⚡ Performance Tips

- Use GET for retrieving data
- Use POST for creating data
- Use DELETE for removing data
- Filter results on server side
- Use pagination for large datasets

---

## 🎯 Feature Summary

✅ User authentication (JWT)
✅ Parking lot management
✅ Parking slot booking
✅ Ride sharing system
✅ Real-time availability
✅ Price calculation
✅ Error handling
✅ Input validation

---

## 🚀 Version Info

- **Version:** 1.0.0
- **Node:** 14+
- **Status:** Production Ready

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection refused | Start MongoDB |
| Token error | Re-login, get new token |
| Slot unavailable | Choose different time |
| Email exists | Use different email |
| Invalid ID | Check ObjectId format |

---

**Keep this card handy for quick reference!** 📌

---

*Last Updated: 2024*
