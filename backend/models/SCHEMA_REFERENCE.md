/**
 * 🏗️ PARK AND RIDE SYSTEM - MONGODB SCHEMA REFERENCE
 * 
 * This document outlines the MongoDB schemas for the Park and Ride System,
 * including relationships, indexes, validation rules, and best practices.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 1. USER SCHEMA (Extended)
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Purpose: User authentication and profile management
 * Collections: users
 * 
 * Key Fields:
 * - name: User full name
 * - email: Unique email for login
 * - password: Hashed password
 * - carNumber: UNIQUE vehicle number (REQUIRED for parking verification)
 * - isActive: Account status (soft delete)
 * 
 * Relationships:
 * - Has Many: Bookings (1 User -> N Bookings)
 * - Has Many: Rides as Driver (1 User -> N Rides)
 * - Has Many: Rides as Passenger (1 User -> N Rides)
 * 
 * Indexes:
 * - carNumber (UNIQUE): For parking entry gate verification
 * - email (UNIQUE): For authentication
 * 
 * ⚠️ CRITICAL: carNumber must be unique and in uppercase for proper gate verification
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 2. PARKING LOT SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Purpose: Store parking lot information and availability
 * Collections: parkinglots
 * 
 * Key Fields:
 * - name: Lot name
 * - location: { address, latitude, longitude } - For geo queries
 * - totalSlots: Maximum capacity
 * - availableSlots: Current availability (DENORMALIZED for performance)
 * - pricePerHour: Hourly rate
 * - amenities: Features (24/7 Security, CCTV, EV Charging, etc.)
 * 
 * Relationships:
 * - Has Many: ParkingSlots (1 Lot -> N Slots)
 * - Has Many: Bookings (1 Lot -> N Bookings)
 * 
 * Indexes:
 * - name: For searching lots
 * - location coordinates: For geographic queries (nearby parking)
 * - availability: For finding available lots
 * 
 * 📊 DENORMALIZATION: availableSlots is denormalized from ParkingSlot collection
 * for performance. Update this field whenever a booking is created/cancelled.
 * 
 * Usage Example:
 * ```
 * db.parkinglots.find({
 *   isActive: true,
 *   availableSlots: { $gt: 0 },
 *   location: { // Geo query for nearby lots
 *     $near: {
 *       $geometry: { type: "Point", coordinates: [lon, lat] },
 *       $maxDistance: 5000 // 5km
 *     }
 *   }
 * })
 * ```
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 3. PARKING SLOT SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Purpose: Individual parking spaces
 * Collections: parkingslots
 * 
 * Key Fields:
 * - parkingLot: Reference to ParkingLot (Many-to-One)
 * - slotNumber: Specific slot identifier (e.g., "A1", "B23")
 * - isOccupied: Current occupancy status
 * - occupiedBy: Reference to Booking (if occupied) - DENORMALIZED
 * - vehicleType: "car" | "bike" | "any"
 * - floor: For multi-level parking
 * - section: Zone identifier
 * - isUnderMaintenance: Maintenance flag
 * 
 * Relationships:
 * - Belongs To: ParkingLot
 * - Has One: Booking (current occupier)
 * 
 * Indexes (CRITICAL):
 * - (parkingLot, slotNumber) UNIQUE: Prevent duplicate slots in same lot
 * - (parkingLot, isOccupied): Find available slots quickly
 * - (parkingLot, vehicleType): Filter by vehicle type
 * 
 * 🔒 DOUBLE BOOKING PREVENTION:
 * - Compound index (parkingLot, slotNumber) ensures no duplicate slots
 * - isOccupied flag and occupiedBy ref link to booking
 * - Pre-save validation prevents marking occupied without booking ref
 * 
 * Usage Example:
 * ```
 * // Find available slots for a vehicle type in a parking lot
 * db.parkingslots.find({
 *   parkingLot: ObjectId("..."),
 *   isOccupied: false,
 *   vehicleType: { $in: ["car", "any"] },
 *   isUnderMaintenance: false
 * })
 * ```
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 4. BOOKING SCHEMA (MOST CRITICAL)
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Purpose: Reserve parking spaces with time, pricing, and verification
 * Collections: bookings
 * 
 * Key Fields:
 * - user: Reference to User (who made the booking)
 * - parkingLot: Reference to ParkingLot
 * - slot: Reference to ParkingSlot (specific space)
 * - carNumber: CRITICAL - stored for entry gate verification (DENORMALIZED from User)
 * - startTime: When parking starts
 * - endTime: When parking ends
 * - totalPrice: Calculated based on duration and hourly rate
 * - amountPaid: Payment collected
 * - status: "booked" | "in-progress" | "completed" | "cancelled"
 * - paymentStatus: "pending" | "completed" | "refunded"
 * - entryTime: Actual vehicle entry timestamp
 * - exitTime: Actual vehicle exit timestamp
 * 
 * Relationships:
 * - Belongs To: User, ParkingLot, ParkingSlot
 * 
 * Indexes (CRITICAL):
 * - carNumber: Gate verification lookup (MOST IMPORTANT)
 * - (user, status): User's current bookings
 * - (slot, status): Double booking prevention
 * - (parkingLot, status): Lot analytics
 * - (startTime, endTime): Date range queries
 * 
 * 🚨 KEY BUSINESS LOGIC:
 * 
 * 1. DOUBLE BOOKING PREVENTION:
 *    - Pre-save hook checks for overlapping bookings on same slot
 *    - Only checks "booked" and "in-progress" statuses (completed/cancelled don't matter)
 *    - Query: No 2 active bookings with overlapping time windows on same slot
 * 
 * 2. ENTRY VERIFICATION:
 *    - Gate scans carNumber: "MH02AB1234"
 *    - Query: Find booking with carNumber AND status in ["booked", "in-progress"]
 *    - Verify startTime <= now <= endTime
 *    - Mark as "in-progress" and record entryTime
 * 
 * 3. PRICE CALCULATION:
 *    - totalPrice = ceiling((endTime - startTime) / 3600000 * pricePerHour)
 *    - Calculated in pre-save hook
 *    - Hours are rounded up (even 1 minute = 1 hour charge)
 * 
 * 4. SLOT STATE MANAGEMENT:
 *    - When booking created: ParkingSlot.isOccupied = false (not yet entered)
 *    - When marked in-progress: ParkingSlot.isOccupied = true
 *    - When marked completed: ParkingSlot.isOccupied = false
 * 
 * Usage Example:
 * ```
 * // Gate Verification: Find vehicle by carNumber for entry
 * db.bookings.findOne({
 *   carNumber: "MH02AB1234",
 *   status: { $in: ["booked", "in-progress"] },
 *   startTime: { $lte: ISODate("2024-01-15T10:30:00Z") },
 *   endTime: { $gte: ISODate("2024-01-15T10:30:00Z") }
 * })
 * 
 * // Prevent double booking
 * db.bookings.findOne({
 *   slot: ObjectId("..."),
 *   status: { $in: ["booked", "in-progress"] },
 *   startTime: { $lt: ISODate("2024-01-15T12:00:00Z") },
 *   endTime: { $gt: ISODate("2024-01-15T10:00:00Z") }
 * })
 * 
 * // User's current bookings
 * db.bookings.find({
 *   user: ObjectId("..."),
 *   status: { $in: ["booked", "in-progress"] }
 * }).sort({ startTime: 1 })
 * ```
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 5. RIDE SCHEMA (Last-mile Integration)
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Purpose: Share rides from parking lot to destination
 * Collections: rides
 * 
 * Key Fields:
 * - driver: Reference to User (who is offering the ride)
 * - fromLocation: { address, latitude, longitude }
 * - toLocation: { address, latitude, longitude }
 * - departureTime: When ride departs
 * - totalSeats: Vehicle capacity (max 8)
 * - seatsBooked: Current passengers count (DENORMALIZED)
 * - passengers: Array of User references (BOUNDED array, max 8)
 * - pricePerSeat: Cost per passenger
 * - status: "scheduled" | "in-progress" | "completed" | "cancelled"
 * - vehicleDetails: { vehicleNumber, model, color }
 * - amenities: Features provided (AC, Water Bottle, WiFi, etc.)
 * 
 * Relationships:
 * - Belongs To: User (Driver)
 * - Has Many: Users (Passengers - relationships via passengers array)
 * 
 * Indexes:
 * - (driver, status): Driver's rides
 * - (departureTime, status): Find rides by time
 * - location coordinates: Geo queries for nearby rides
 * - status: For filtering active rides
 * 
 * ⚠️ IMPORTANT DESIGN DECISIONS:
 * 
 * 1. PASSENGERS ARRAY (Embedded vs Reference):
 *    - Embedded as ObjectId array in Ride document
 *    - MAX 8 passengers (bounded array, safe from 16MB limit)
 *    - Rationale: Accessed together, limited size, single-query lookups
 *    - Benefits: One query gets all passengers; atomic updates
 *    - If rides can have 100+ passengers, create separate Booking collection
 * 
 * 2. SEATS TRACKING:
 *    - seatsBooked is denormalized from passengers.length
 *    - Kept in sync with pre-save hook
 *    - Enables quick "available seats" queries without counting array
 * 
 * Usage Example:
 * ```
 * // Find available rides from Parking Lot to Destination
 * db.rides.find({
 *   status: "scheduled",
 *   departureTime: { $gte: ISODate("2024-01-15T10:00:00Z") },
 *   "fromLocation.latitude": { $gte: lat - 0.01, $lte: lat + 0.01 },
 *   "fromLocation.longitude": { $gte: lon - 0.01, $lte: lon + 0.01 },
 *   seatsBooked: { $lt: totalSeats } // Has available seats
 * })
 * 
 * // Get ride with all passenger details
 * db.rides.aggregate([
 *   { $match: { _id: ObjectId("...") } },
 *   { $lookup: {
 *       from: "users",
 *       localField: "passengers",
 *       foreignField: "_id",
 *       as: "passengerDetails"
 *     }
 *   }
 * ])
 * ```
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SCHEMA RELATIONSHIPS DIAGRAM
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 *                    ┌─────────┐
 *                    │  USER   │
 *                    └────┬────┘
 *                         │
 *          ┌──────────────┼──────────────┐
 *          │              │              │
 *    [1:N BOOKING]  [1:N RIDE(driver)]  [N:RIDE(passenger)]
 *          │              │              │
 *          ▼              ▼              ▼
 *       BOOKING        RIDE          RIDE(passengers array)
 *          │
 *    [M:1 PARKING LOT] ◄─────────────┐
 *          │                          │
 *          │                    [M:1 PARKING LOT]
 *          │
 *    [M:1 PARKING SLOT] ◄─────────────┐
 *                               [M:1 PARKING SLOT]
 * 
 * Collections:
 * - users
 * - parkinglots
 * - parkingslots
 * - bookings
 * - rides
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * BEST PRACTICES IMPLEMENTED
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * 1. ✅ INDEXING STRATEGY:
 *    - All foreign key references indexed for quick lookups
 *    - Compound indexes for common query patterns
 *    - UNIQUE indexes for carNumber (critical for gate verification)
 * 
 * 2. ✅ DENORMALIZATION:
 *    - carNumber stored in Booking (from User) for gate verification
 *    - availableSlots in ParkingLot (from ParkingSlots) for availability checks
 *    - seatsBooked in Ride (from passengers array) for quick counts
 *    - These are updated via application logic when related data changes
 * 
 * 3. ✅ VALIDATION:
 *    - Required fields with error messages
 *    - Enum constraints for status fields
 *    - Min/max constraints for numeric fields
 *    - Email format validation
 *    - Pre-save hooks for complex validation (time ranges, overlaps)
 * 
 * 4. ✅ REFERENCES (Not embedding):
 *    - User -> Booking (one-to-many, >100 likely)
 *    - ParkingLot -> ParkingSlot (one-to-many, hundreds/thousands)
 *    - Booking references User, ParkingLot, ParkingSlot
 *    - Ride uses reference array for passengers (bounded to 8)
 * 
 * 5. ✅ TIMESTAMPS:
 *    - All collections have createdAt/updatedAt
 *    - Useful for audits, analytics, sorting
 * 
 * 6. ✅ SCALABILITY:
 *    - No unbounded arrays (max 8 passengers per ride)
 *    - Proper indexing for common queries
 *    - Denormalized fields for performance-critical queries
 * 
 * 7. ✅ DATA INTEGRITY:
 *    - Pre-save hooks prevent invalid states
 *    - Double booking prevention logic
 *    - Relationship consistency checks
 *    - Instance methods for safe state transitions
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * WORKFLOW: BOOKING A PARKING SPACE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * 1. User selects parking lot and time window
 * 2. Backend queries available slots:
 *    query: { parkingLot: lot_id, isOccupied: false, vehicleType: {...} }
 * 
 * 3. User selects specific slot
 * 4. Check for double booking:
 *    pre-save hook finds overlapping bookings
 * 
 * 5. Create booking with:
 *    { user, parkingLot, slot, carNumber, startTime, endTime, totalPrice }
 * 
 * 6. Update ParkingLot.availableSlots -= 1
 * 
 * 7. Mark ParkingSlot as occupied:
 *    { isOccupied: true, occupiedBy: booking_id }
 * 
 * 8. User receives booking confirmation with carNumber for gate entry
 * 
 * GATE ENTRY:
 * 1. Vehicle arrives at gate
 * 2. Scan carNumber barcode/QR code
 * 3. Query: { carNumber: "MH02AB1234", status: ["booked", "in-progress"], times valid }
 * 4. If found: Mark booking as "in-progress", record entryTime
 * 5. Mark ParkingSlot.isOccupied = true (if not already)
 * 6. Open gate barrier
 * 
 * GATE EXIT:
 * 1. Vehicle leaves parking
 * 2. Manual/automatic detection
 * 3. Mark booking as "completed", record exitTime
 * 4. Mark ParkingSlot.isOccupied = false, occupiedBy = null
 * 5. Generate final invoice
 * 6. Update ParkingLot.availableSlots += 1
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * COMMON QUERIES
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// Find available slots for booking
db.parkingslots.find({
  parkingLot: ObjectId("lot_id"),
  isOccupied: false,
  vehicleType: { $in: ["car", "any"] },
  isUnderMaintenance: false
});

// Gate verification - find vehicle
db.bookings.findOne({
  carNumber: "MH02AB1234",
  status: { $in: ["booked", "in-progress"] },
  startTime: { $lte: new Date() },
  endTime: { $gte: new Date() }
});

// Check double booking
db.bookings.findOne({
  slot: ObjectId("slot_id"),
  status: { $in: ["booked", "in-progress"] },
  startTime: { $lt: endTime },
  endTime: { $gt: startTime }
});

// User's active bookings
db.bookings.find({
  user: ObjectId("user_id"),
  status: { $in: ["booked", "in-progress"] }
}).sort({ startTime: 1 });

// Completed bookings for revenue
db.bookings.find({
  parkingLot: ObjectId("lot_id"),
  status: "completed",
  createdAt: { $gte: ISODate("2024-01-01"), $lte: ISODate("2024-01-31") }
}).aggregate([
  { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
]);

// Available rides
db.rides.find({
  status: "scheduled",
  departureTime: { $gte: new Date() },
  seatsBooked: { $lt: "$totalSeats" }
});

export const SCHEMA_REFERENCE = {
  description: "Schema reference loaded from models"
};
