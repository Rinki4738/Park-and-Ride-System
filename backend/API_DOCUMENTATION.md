
# Park and Ride System - Backend API Documentation

## Overview
Complete REST API for a Park and Ride System built with Node.js, Express.js, and MongoDB.

---

## Base URL
```
http://localhost:5000/api
```

---

## Authentication
All protected routes require a JWT token passed in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

JWT tokens are obtained after login and expire in 7 days.

---

## API Endpoints

### 1. Authentication Routes (`/api/auth`)

#### Register User
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "carNumber": "DL01AB1234"
}
```
- **Response (201):**
```json
{
  "msg": "User registered successfully",
  "userId": "65abc123def456xyz789"
}
```

#### Login User
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response (200):**
```json
{
  "msg": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "65abc123def456xyz789"
}
```

#### Get User Profile
- **Endpoint:** `GET /api/auth/profile`
- **Access:** Protected (requires JWT token)
- **Response (200):**
```json
{
  "msg": "Profile fetched successfully",
  "user": {
    "_id": "65abc123def456xyz789",
    "name": "John Doe",
    "email": "john@example.com",
    "carNumber": "DL01AB1234",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Parking Routes (`/api/parking`)

#### Get All Parking Lots
- **Endpoint:** `GET /api/parking`
- **Access:** Public
- **Query Parameters:** None
- **Response (200):**
```json
{
  "msg": "Parking lots retrieved successfully",
  "count": 3,
  "lots": [
    {
      "_id": "65abc123def456xyz789",
      "name": "Central Business District Parking",
      "location": {
        "address": "123 Main St, Downtown",
        "latitude": 28.6139,
        "longitude": 77.2090
      },
      "totalSlots": 500,
      "availableSlots": 250,
      "pricePerHour": 50,
      "amenities": ["24/7 Security", "CCTV", "EV Charging"],
      "isActive": true
    }
  ]
}
```

#### Get Parking Lot by ID
- **Endpoint:** `GET /api/parking/:id`
- **Access:** Public
- **URL Parameters:**
  - `id` (string): Parking Lot MongoDB ID
- **Response (200):**
```json
{
  "msg": "Parking lot retrieved successfully",
  "lot": {
    "_id": "65abc123def456xyz789",
    "name": "Central Business District Parking",
    "location": { ... },
    "totalSlots": 500,
    "availableSlots": 250,
    "pricePerHour": 50,
    "amenities": [],
    "isActive": true
  }
}
```

#### Get Slots by Parking Lot
- **Endpoint:** `GET /api/parking/:id/slots`
- **Access:** Public
- **URL Parameters:**
  - `id` (string): Parking Lot MongoDB ID
- **Response (200):**
```json
{
  "msg": "Slots retrieved successfully",
  "parkingLotId": "65abc123def456xyz789",
  "totalSlots": 500,
  "summary": {
    "available": 250,
    "occupied": 240,
    "maintenance": 10
  },
  "slots": {
    "available": [
      {
        "_id": "65abc123...",
        "slotNumber": "A1",
        "floor": 0,
        "section": "North Wing A",
        "vehicleType": "car",
        "isOccupied": false
      }
    ],
    "occupied": [ ... ],
    "maintenance": [ ... ]
  }
}
```

#### Create Parking Lot (Admin)
- **Endpoint:** `POST /api/parking`
- **Access:** Protected
- **Request Body:**
```json
{
  "name": "New Parking Lot",
  "location": {
    "address": "456 Park Ave, City",
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "totalSlots": 300,
  "pricePerHour": 40,
  "amenities": ["24/7 Security", "CCTV"]
}
```
- **Response (201):** Similar to Get Parking Lot response

---

### 3. Booking Routes (`/api/booking`)

#### Create Booking
- **Endpoint:** `POST /api/booking`
- **Access:** Protected
- **Request Body:**
```json
{
  "parkingLotId": "65abc123def456xyz789",
  "slotId": "65def456xyz789abc123",
  "startTime": "2024-01-20T10:00:00Z",
  "endTime": "2024-01-20T14:00:00Z",
  "paymentMethod": "upi"
}
```
- **Response (201):**
```json
{
  "msg": "Booking created successfully",
  "booking": {
    "_id": "65xyz789abc123def456",
    "parkingLotId": "65abc123def456xyz789",
    "slotId": "65def456xyz789abc123",
    "carNumber": "DL01AB1234",
    "startTime": "2024-01-20T10:00:00Z",
    "endTime": "2024-01-20T14:00:00Z",
    "totalPrice": 200,
    "status": "booked"
  }
}
```

#### Get User Bookings
- **Endpoint:** `GET /api/booking/user`
- **Access:** Protected
- **Response (200):**
```json
{
  "msg": "User bookings retrieved successfully",
  "totalBookings": 5,
  "summary": {
    "booked": 1,
    "inProgress": 2,
    "completed": 2,
    "cancelled": 0
  },
  "bookings": {
    "booked": [ ... ],
    "inProgress": [ ... ],
    "completed": [ ... ],
    "cancelled": [ ... ]
  }
}
```

#### Cancel Booking
- **Endpoint:** `DELETE /api/booking/:id`
- **Access:** Protected (owner of booking)
- **URL Parameters:**
  - `id` (string): Booking MongoDB ID
- **Response (200):**
```json
{
  "msg": "Booking cancelled successfully",
  "bookingId": "65xyz789abc123def456"
}
```

---

### 4. Ride Routes (`/api/ride`)

#### Get All Rides
- **Endpoint:** `GET /api/ride`
- **Access:** Public
- **Query Parameters:**
  - `status` (optional): Filter by ride status
- **Response (200):**
```json
{
  "msg": "Rides retrieved successfully",
  "count": 10,
  "rides": [
    {
      "_id": "65ride123abc456xyz",
      "driver": {
        "_id": "65driver123...",
        "name": "Jane Smith",
        "carNumber": "DL01XY5678"
      },
      "fromLocation": {
        "address": "123 Main St, Downtown",
        "latitude": 28.6139,
        "longitude": 77.2090
      },
      "toLocation": {
        "address": "456 Airport Rd",
        "latitude": 28.5555,
        "longitude": 77.1855
      },
      "departureTime": "2024-01-20T14:00:00Z",
      "totalSeats": 4,
      "availableSeats": 2,
      "pricePerSeat": 300,
      "passengersCount": 2,
      "rideStatus": "pending"
    }
  ]
}
```

#### Create Ride
- **Endpoint:** `POST /api/ride`
- **Access:** Protected
- **Request Body:**
```json
{
  "fromLocation": {
    "address": "123 Main St, Downtown",
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "toLocation": {
    "address": "456 Airport Rd",
    "latitude": 28.5555,
    "longitude": 77.1855
  },
  "departureTime": "2024-01-20T14:00:00Z",
  "totalSeats": 4,
  "pricePerSeat": 300
}
```
- **Response (201):**
```json
{
  "msg": "Ride created successfully",
  "ride": {
    "_id": "65ride123abc456xyz",
    "driver": "65driver123...",
    "fromLocation": { ... },
    "toLocation": { ... },
    "departureTime": "2024-01-20T14:00:00Z",
    "totalSeats": 4,
    "availableSeats": 4,
    "pricePerSeat": 300
  }
}
```

#### Get Ride by Booking
- **Endpoint:** `GET /api/ride/booking/:bookingId`
- **Access:** Protected
- **URL Parameters:**
  - `bookingId` (string): Booking MongoDB ID
- **Response (200):**
```json
{
  "msg": "Ride retrieved successfully",
  "ride": {
    "_id": "65ride123abc456xyz",
    "driver": { ... },
    "fromLocation": { ... },
    "toLocation": { ... },
    "departureTime": "2024-01-20T14:00:00Z",
    "totalSeats": 4,
    "availableSeats": 2,
    "pricePerSeat": 300,
    "passengers": [ ... ]
  }
}
```

#### Book Ride Seat
- **Endpoint:** `POST /api/ride/:rideId/book`
- **Access:** Protected
- **URL Parameters:**
  - `rideId` (string): Ride MongoDB ID
- **Response (200):**
```json
{
  "msg": "Seat booked successfully",
  "rideId": "65ride123abc456xyz",
  "availableSeats": 1,
  "pricePerSeat": 300,
  "totalCost": 300
}
```

#### Cancel Ride Seat
- **Endpoint:** `DELETE /api/ride/:rideId/cancel`
- **Access:** Protected
- **URL Parameters:**
  - `rideId` (string): Ride MongoDB ID
- **Response (200):**
```json
{
  "msg": "Ride booking cancelled successfully",
  "rideId": "65ride123abc456xyz",
  "availableSeats": 2
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "msg": "Please provide all required fields"
}
```

### 401 - Unauthorized
```json
{
  "msg": "Not authorized, no token"
}
```

### 403 - Forbidden
```json
{
  "msg": "Not authorized to perform this action"
}
```

### 404 - Not Found
```json
{
  "msg": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "msg": "Internal server error message"
}
```

---

## Database Models

### User Schema
- `name`: String (required, 2-100 chars)
- `email`: String (required, unique, valid email format)
- `password`: String (required, 6+ chars, hashed)
- `carNumber`: String (required, unique, Indian vehicle format)
- `isActive`: Boolean (default: true)
- `timestamps`: Creation and update dates

### ParkingLot Schema
- `name`: String (required)
- `location`: Object with address, latitude, longitude
- `totalSlots`: Number (required, 1-10000)
- `availableSlots`: Number (automatically updated)
- `pricePerHour`: Number (required)
- `amenities`: Array of strings
- `isActive`: Boolean (default: true)

### ParkingSlot Schema
- `parkingLot`: Reference to ParkingLot
- `slotNumber`: String (required)
- `isOccupied`: Boolean (default: false)
- `occupiedBy`: Reference to Booking
- `vehicleType`: Enum (car, bike, any)
- `floor`: Number (default: 0)
- `section`: String
- `isUnderMaintenance`: Boolean (default: false)

### Booking Schema
- `user`: Reference to User
- `parkingLot`: Reference to ParkingLot
- `slot`: Reference to ParkingSlot
- `carNumber`: String (required, for verification)
- `startTime`: Date (required, future date)
- `endTime`: Date (required, after startTime)
- `pricePerHour`: Number (captured at booking time)
- `totalPrice`: Number (calculated)
- `amountPaid`: Number (default: 0)
- `status`: Enum (booked, in-progress, completed, cancelled)
- `paymentMethod`: Enum (credit_card, debit_card, upi, wallet, cash)
- `paymentStatus`: Enum (pending, completed, refunded)

### Ride Schema
- `driver`: Reference to User
- `fromLocation`: Object with address, latitude, longitude
- `toLocation`: Object with address, latitude, longitude
- `departureTime`: Date (required, future date)
- `totalSeats`: Number (1-8)
- `seatsBooked`: Number (default: 0)
- `passengers`: Array of User references
- `pricePerSeat`: Number (required)
- `rideStatus`: Enum (pending, in-progress, completed, cancelled)

---

## Workflow Examples

### Example 1: Create a Booking
1. User registers: `POST /api/auth/register`
2. User logs in: `POST /api/auth/login` (get JWT token)
3. View parking lots: `GET /api/parking`
4. View slots in a lot: `GET /api/parking/:id/slots`
5. Create booking: `POST /api/booking` (with JWT token)

### Example 2: Offer a Ride
1. Driver logs in: `POST /api/auth/login`
2. Create ride: `POST /api/ride` (with JWT token)
3. Passengers can book seats: `POST /api/ride/:rideId/book`

### Example 3: Cancel Booking
1. Get user bookings: `GET /api/booking/user` (with JWT token)
2. Cancel booking: `DELETE /api/booking/:id` (with JWT token)

---

## Setup & Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Environment Variables (.env)
```
MONGO_URI=mongodb://localhost:27017/parkandride
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### Install Dependencies
```bash
npm install
```

### Start Server
```bash
npm start
```

Server runs on `http://localhost:5000`

---

## Status Codes Summary
- `200 OK`: Successful GET, PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Server Error`: Internal error

---

## Security Features
✅ JWT-based authentication with 7-day expiration
✅ Password hashing with bcryptjs
✅ Protected routes with auth middleware
✅ Input validation on all endpoints
✅ Unique constraints on email and carNumber
✅ CORS enabled for cross-origin requests
✅ Global error handling

---

## Testing Tools
- **Postman**: Import API endpoints for testing
- **Thunder Client**: VS Code alternative to Postman
- **cURL**: Command-line testing

Example cURL:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

---

Last Updated: 2024
Version: 1.0.0
