# Park and Ride System - Testing Guide

## 🧪 Testing Overview

This guide provides complete testing procedures with example requests and expected responses for all API endpoints.

**Base URL:** `http://localhost:5000`

---

## ✅ Prerequisites

1. MongoDB running locally or connected
2. Backend server running (`npm start`)
3. Postman, Thunder Client, or cURL installed
4. `.env` file configured with:
   - MONGO_URI
   - JWT_SECRET
   - PORT
   - NODE_ENV

---

## 🔑 Authentication Tests

### Test 1: Register New User

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "securepass123",
  "carNumber": "DL01AC5678"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "securepass123",
    "carNumber": "DL01AC5678"
  }'
```

**Expected Response (201):**
```json
{
  "msg": "User registered successfully",
  "userId": "65abc123def456xyz789"
}
```

**Test Case - Duplicate Email:**
```json
{
  "name": "Alice Johnson 2",
  "email": "alice@example.com",
  "password": "securepass123",
  "carNumber": "DL01AC6789"
}
```
**Expected Response (400):**
```json
{
  "msg": "User already exists"
}
```

---

### Test 2: Login User

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "alice@example.com",
  "password": "securepass123"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

**Expected Response (200):**
```json
{
  "msg": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "65abc123def456xyz789"
}
```

**⚠️ Save this token for protected routes!**

---

### Test 3: Get User Profile (Protected)

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "msg": "Profile fetched successfully",
  "user": {
    "_id": "65abc123def456xyz789",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "carNumber": "DL01AC5678",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Test Case - Missing Token:**
```
No Authorization header
```
**Expected Response (401):**
```json
{
  "message": "Not authorized, no token"
}
```

---

## 🅿️ Parking Tests

### Test 4: Get All Parking Lots

**Endpoint:** `GET /api/parking`

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/parking
```

**Expected Response (200):**
```json
{
  "msg": "Parking lots retrieved successfully",
  "count": 2,
  "lots": [
    {
      "_id": "65lot001xyz",
      "name": "Downtown Parking Hub",
      "location": {
        "address": "123 Main Street, Downtown",
        "latitude": 28.6139,
        "longitude": 77.2090
      },
      "totalSlots": 500,
      "availableSlots": 250,
      "pricePerHour": 50,
      "amenities": ["24/7 Security", "CCTV", "Lighting"],
      "isActive": true
    },
    {
      "_id": "65lot002xyz",
      "name": "Airport Parking",
      "location": {
        "address": "456 Airport Road",
        "latitude": 28.5555,
        "longitude": 77.1855
      },
      "totalSlots": 1000,
      "availableSlots": 500,
      "pricePerHour": 40,
      "amenities": ["24/7 Security", "EV Charging"],
      "isActive": true
    }
  ]
}
```

---

### Test 5: Get Parking Lot by ID

**Endpoint:** `GET /api/parking/:id`

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/parking/65lot001xyz
```

**Expected Response (200):**
```json
{
  "msg": "Parking lot retrieved successfully",
  "lot": {
    "_id": "65lot001xyz",
    "name": "Downtown Parking Hub",
    "location": {
      "address": "123 Main Street, Downtown",
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "totalSlots": 500,
    "availableSlots": 250,
    "pricePerHour": 50,
    "amenities": ["24/7 Security", "CCTV", "Lighting"],
    "isActive": true
  }
}
```

---

### Test 6: Get Slots by Parking Lot

**Endpoint:** `GET /api/parking/:id/slots`

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/parking/65lot001xyz/slots
```

**Expected Response (200):**
```json
{
  "msg": "Slots retrieved successfully",
  "parkingLotId": "65lot001xyz",
  "totalSlots": 10,
  "summary": {
    "available": 7,
    "occupied": 2,
    "maintenance": 1
  },
  "slots": {
    "available": [
      {
        "_id": "65slot001",
        "slotNumber": "A1",
        "floor": 0,
        "section": "Ground Floor North",
        "vehicleType": "car",
        "isOccupied": false,
        "isUnderMaintenance": false
      },
      {
        "_id": "65slot002",
        "slotNumber": "A2",
        "floor": 0,
        "section": "Ground Floor North",
        "vehicleType": "car",
        "isOccupied": false,
        "isUnderMaintenance": false
      }
    ],
    "occupied": [
      {
        "_id": "65slot003",
        "slotNumber": "A3",
        "floor": 0,
        "section": "Ground Floor North",
        "vehicleType": "car",
        "isOccupied": true,
        "occupiedBy": "65booking001"
      }
    ],
    "maintenance": [
      {
        "_id": "65slot004",
        "slotNumber": "B1",
        "floor": 1,
        "section": "First Floor East",
        "vehicleType": "car",
        "isUnderMaintenance": true
      }
    ]
  }
}
```

---

### Test 7: Create Parking Lot (Admin)

**Endpoint:** `POST /api/parking`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "New Shopping Mall Parking",
  "location": {
    "address": "789 Commercial Blvd, Shopping District",
    "latitude": 28.6200,
    "longitude": 77.2150
  },
  "totalSlots": 300,
  "pricePerHour": 60,
  "amenities": ["24/7 Security", "CCTV", "Covered", "WiFi"]
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/parking \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Shopping Mall Parking",
    "location": {
      "address": "789 Commercial Blvd",
      "latitude": 28.6200,
      "longitude": 77.2150
    },
    "totalSlots": 300,
    "pricePerHour": 60,
    "amenities": ["24/7 Security", "CCTV", "Covered", "WiFi"]
  }'
```

**Expected Response (201):**
```json
{
  "msg": "Parking lot created successfully",
  "lot": {
    "_id": "65lot003xyz",
    "name": "New Shopping Mall Parking",
    "location": {
      "address": "789 Commercial Blvd, Shopping District",
      "latitude": 28.6200,
      "longitude": 77.2150
    },
    "totalSlots": 300,
    "availableSlots": 300,
    "pricePerHour": 60,
    "amenities": ["24/7 Security", "CCTV", "Covered", "WiFi"],
    "isActive": true
  }
}
```

---

## 📦 Booking Tests

### Test 8: Create Booking

**Endpoint:** `POST /api/booking`

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request:**
```json
{
  "parkingLotId": "65lot001xyz",
  "slotId": "65slot001",
  "startTime": "2024-01-20T14:00:00Z",
  "endTime": "2024-01-20T18:00:00Z",
  "paymentMethod": "upi"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/booking \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "parkingLotId": "65lot001xyz",
    "slotId": "65slot001",
    "startTime": "2024-01-20T14:00:00Z",
    "endTime": "2024-01-20T18:00:00Z",
    "paymentMethod": "upi"
  }'
```

**Expected Response (201):**
```json
{
  "msg": "Booking created successfully",
  "booking": {
    "_id": "65booking001xyz",
    "parkingLotId": "65lot001xyz",
    "slotId": "65slot001",
    "carNumber": "DL01AC5678",
    "startTime": "2024-01-20T14:00:00Z",
    "endTime": "2024-01-20T18:00:00Z",
    "totalPrice": 200,
    "status": "booked"
  }
}
```

**Price Calculation:** (18:00 - 14:00) × 50 = 4 hours × ₹50 = ₹200

---

### Test 9: Get User Bookings

**Endpoint:** `GET /api/booking/user`

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/booking/user \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "msg": "User bookings retrieved successfully",
  "totalBookings": 3,
  "summary": {
    "booked": 1,
    "inProgress": 1,
    "completed": 1,
    "cancelled": 0
  },
  "bookings": {
    "booked": [
      {
        "_id": "65booking001xyz",
        "parkingLot": {
          "_id": "65lot001xyz",
          "name": "Downtown Parking Hub",
          "location": { ... },
          "pricePerHour": 50
        },
        "slot": {
          "_id": "65slot001",
          "slotNumber": "A1",
          "floor": 0
        },
        "startTime": "2024-01-20T14:00:00Z",
        "endTime": "2024-01-20T18:00:00Z",
        "totalPrice": 200,
        "status": "booked"
      }
    ],
    "inProgress": [ ... ],
    "completed": [ ... ],
    "cancelled": [ ... ]
  }
}
```

---

### Test 10: Cancel Booking

**Endpoint:** `DELETE /api/booking/:id`

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**cURL Command:**
```bash
curl -X DELETE http://localhost:5000/api/booking/65booking001xyz \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "msg": "Booking cancelled successfully",
  "bookingId": "65booking001xyz"
}
```

**Verification:** Check that slot is now available and parking lot availableSlots is incremented.

---

## 🚗 Ride Tests

### Test 11: Create Ride

**Endpoint:** `POST /api/ride`

**Headers:**
```
Authorization: Bearer <driver_token>
Content-Type: application/json
```

**Request:**
```json
{
  "fromLocation": {
    "address": "123 Main Street, Downtown",
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "toLocation": {
    "address": "456 Airport Road",
    "latitude": 28.5555,
    "longitude": 77.1855
  },
  "departureTime": "2024-01-20T18:00:00Z",
  "totalSeats": 4,
  "pricePerSeat": 300
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/ride \
  -H "Authorization: Bearer <driver_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fromLocation": {
      "address": "123 Main Street, Downtown",
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "toLocation": {
      "address": "456 Airport Road",
      "latitude": 28.5555,
      "longitude": 77.1855
    },
    "departureTime": "2024-01-20T18:00:00Z",
    "totalSeats": 4,
    "pricePerSeat": 300
  }'
```

**Expected Response (201):**
```json
{
  "msg": "Ride created successfully",
  "ride": {
    "_id": "65ride001xyz",
    "driver": "65abc123def456xyz789",
    "fromLocation": {
      "address": "123 Main Street, Downtown",
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "toLocation": {
      "address": "456 Airport Road",
      "latitude": 28.5555,
      "longitude": 77.1855
    },
    "departureTime": "2024-01-20T18:00:00Z",
    "totalSeats": 4,
    "availableSeats": 4,
    "pricePerSeat": 300
  }
}
```

---

### Test 12: Get All Rides

**Endpoint:** `GET /api/ride`

**Query Parameters (optional):**
```
?status=pending
```

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/ride?status=pending"
```

**Expected Response (200):**
```json
{
  "msg": "Rides retrieved successfully",
  "count": 3,
  "rides": [
    {
      "_id": "65ride001xyz",
      "driver": {
        "_id": "65abc123def456xyz789",
        "name": "Alice Johnson",
        "carNumber": "DL01AC5678"
      },
      "fromLocation": {
        "address": "123 Main Street, Downtown",
        "latitude": 28.6139,
        "longitude": 77.2090
      },
      "toLocation": {
        "address": "456 Airport Road",
        "latitude": 28.5555,
        "longitude": 77.1855
      },
      "departureTime": "2024-01-20T18:00:00Z",
      "totalSeats": 4,
      "availableSeats": 2,
      "pricePerSeat": 300,
      "passengersCount": 2,
      "rideStatus": "pending"
    }
  ]
}
```

---

### Test 13: Book Ride Seat

**Endpoint:** `POST /api/ride/:rideId/book`

**Headers:**
```
Authorization: Bearer <passenger_token>
Content-Type: application/json
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/ride/65ride001xyz/book \
  -H "Authorization: Bearer <passenger_token>" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "msg": "Seat booked successfully",
  "rideId": "65ride001xyz",
  "availableSeats": 3,
  "pricePerSeat": 300,
  "totalCost": 300
}
```

---

### Test 14: Get Ride by Booking

**Endpoint:** `GET /api/ride/booking/:bookingId`

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/ride/booking/65booking001xyz \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "msg": "Ride retrieved successfully",
  "ride": {
    "_id": "65ride001xyz",
    "driver": {
      "_id": "65abc123def456xyz789",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "carNumber": "DL01AC5678"
    },
    "fromLocation": {
      "address": "123 Main Street, Downtown",
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "toLocation": {
      "address": "456 Airport Road",
      "latitude": 28.5555,
      "longitude": 77.1855
    },
    "departureTime": "2024-01-20T18:00:00Z",
    "totalSeats": 4,
    "availableSeats": 2,
    "pricePerSeat": 300,
    "passengers": [ ... ]
  }
}
```

---

### Test 15: Cancel Ride Booking

**Endpoint:** `DELETE /api/ride/:rideId/cancel`

**Headers:**
```
Authorization: Bearer <passenger_token>
Content-Type: application/json
```

**cURL Command:**
```bash
curl -X DELETE http://localhost:5000/api/ride/65ride001xyz/cancel \
  -H "Authorization: Bearer <passenger_token>" \
  -H "Content-Type: application/json"
```

**Expected Response (200):**
```json
{
  "msg": "Ride booking cancelled successfully",
  "rideId": "65ride001xyz",
  "availableSeats": 3
}
```

---

## ❌ Error Testing

### Test 16: Invalid Token

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid_token_12345"
```

**Expected Response (401):**
```json
{
  "message": "Token failed"
}
```

---

### Test 17: Missing Required Fields

**Endpoint:** `POST /api/booking`

**Request:**
```json
{
  "parkingLotId": "65lot001xyz"
  // Missing slotId, startTime, endTime
}
```

**Expected Response (400):**
```json
{
  "msg": "Please provide all required fields"
}
```

---

### Test 18: Invalid ObjectId

**Endpoint:** `GET /api/parking/invalid123`

**Expected Response (400):**
```json
{
  "msg": "Invalid parking lot ID"
}
```

---

### Test 19: Resource Not Found

**Endpoint:** `GET /api/parking/65abc123def456xyz999`

**Expected Response (404):**
```json
{
  "msg": "Parking lot not found"
}
```

---

## 📊 Test Summary Checklist

### Authentication ✅
- [ ] Test 1: Register new user
- [ ] Register with duplicate email
- [ ] Test 2: Login user
- [ ] Login with wrong password
- [ ] Test 3: Get profile (protected)
- [ ] Get profile without token

### Parking ✅
- [ ] Test 4: Get all parking lots
- [ ] Test 5: Get parking lot by ID
- [ ] Test 6: Get slots by lot
- [ ] Test 7: Create parking lot (admin)

### Booking ✅
- [ ] Test 8: Create booking
- [ ] Create booking with past date
- [ ] Test 9: Get user bookings
- [ ] Test 10: Cancel booking
- [ ] Cancel already cancelled booking

### Rides ✅
- [ ] Test 11: Create ride
- [ ] Test 12: Get all rides
- [ ] Test 13: Book ride seat
- [ ] Book same ride twice
- [ ] Test 14: Get ride by booking
- [ ] Test 15: Cancel ride booking

### Error Handling ✅
- [ ] Test 16: Invalid token
- [ ] Test 17: Missing required fields
- [ ] Test 18: Invalid ObjectId
- [ ] Test 19: Resource not found

---

## 🔍 Postman Collection Import

Import these endpoints into Postman for easy testing:

```json
{
  "info": {
    "name": "Park and Ride API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/auth/register"
          }
        }
      ]
    }
  ]
}
```

---

## 💾 Sample Test Data Script

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

# 1. Register user
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "carNumber": "DL01AB1234"
  }')

echo "Register Response: $REGISTER_RESPONSE"

# 2. Login user
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token (requires jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# 3. Get profile
curl -s -X GET $BASE_URL/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Get parking lots
curl -s -X GET $BASE_URL/api/parking | jq
```

---

## 🎯 Quick Start for Testing

1. **Setup:** Ensure MongoDB and server are running
2. **Register:** Create test user (Test 1)
3. **Login:** Get JWT token (Test 2)
4. **Browse:** View parking lots (Test 4)
5. **Book:** Create parking booking (Test 8)
6. **Share:** Create and book ride (Tests 11, 13)
7. **Verify:** Check bookings and rides

---

Version: 1.0.0
Last Updated: 2024
