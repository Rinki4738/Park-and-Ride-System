import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  // Driver Information
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Driver reference is required"],
    index: true
  },

  // From Location (Parking Lot)
  fromLocation: {
    address: {
      type: String,
      required: [true, "From address is required"],
      trim: true
    },
    latitude: {
      type: Number,
      required: [true, "From latitude is required"]
    },
    longitude: {
      type: Number,
      required: [true, "From longitude is required"]
    }
  },

  // To Location (Destination)
  toLocation: {
    address: {
      type: String,
      required: [true, "To address is required"],
      trim: true
    },
    latitude: {
      type: Number,
      required: [true, "To latitude is required"]
    },
    longitude: {
      type: Number,
      required: [true, "To longitude is required"]
    }
  },

  // Timing Information
  departureTime: {
    type: Date,
    required: [true, "Departure time is required"],
    min: [new Date(), "Departure time cannot be in the past"],
    index: true
  },

  // Seat Information
  totalSeats: {
    type: Number,
    required: [true, "Total seats is required"],
    min: [1, "Must have at least 1 seat"],
    max: [8, "Maximum 8 seats per ride"]
  },

  seatsBooked: {
    type: Number,
    default: 0,
    min: [0, "Seats booked cannot be negative"]
  },

  // Passengers array (references to User)
  // Bounded array (max 8 passengers) - safe from 16MB limit
  passengers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  // Pricing Information
  pricePerSeat: {
    type: Number,
    required: [true, "Price per seat is required"],
    min: [0, "Price cannot be negative"]
  },

  // Ride Status
  status: {
    type: String,
    enum: {
      values: ["scheduled", "in-progress", "completed", "cancelled"],
      message: "Status must be scheduled, in-progress, completed, or cancelled"
    },
    default: "scheduled",
    index: true
  },

  // Vehicle Information
  vehicleDetails: {
    vehicleNumber: {
      type: String,
      uppercase: true,
      required: [true, "Vehicle number is required"]
    },
    model: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    }
  },

  // Optional Amenities during ride
  amenities: {
    type: [String],
    enum: [
      "AC",
      "Water Bottle",
      "Music System",
      "Phone Charger",
      "WiFi",
      "Blanket"
    ],
    default: []
  },

  // Rating and Review
  avgRating: {
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"],
    default: null
  },

  totalReviews: {
    type: Number,
    default: 0
  },

  // Additional Notes
  description: {
    type: String,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },

  notes: {
    type: String,
    maxlength: [500, "Notes cannot exceed 500 characters"]
  }
}, { 
  timestamps: true,
  indexes: [
    // For driver's rides
    { driver: 1, status: 1 },
    { driver: 1, createdAt: -1 },
    
    // For finding rides by timing
    { departureTime: 1, status: 1 },
    
    // For location-based queries (not exact, but helps with range queries)
    { "fromLocation.latitude": 1, "fromLocation.longitude": 1 },
    { "toLocation.latitude": 1, "toLocation.longitude": 1 },
    
    // For ride status
    { status: 1 },
    
    // For finding rides with available seats
    { status: 1, seatsBooked: 1 }
  ]
});

// Validation: totalSeats must be >= seatsBooked
rideSchema.pre("save", function(next) {
  if (this.seatsBooked > this.totalSeats) {
    throw new Error("Seats booked cannot exceed total seats");
  }
  
  if (this.passengers.length !== this.seatsBooked) {
    this.seatsBooked = this.passengers.length;
  }
  
  next();
});

// Instance method: add passenger
rideSchema.methods.addPassenger = function(userId) {
  if (this.seatsBooked >= this.totalSeats) {
    throw new Error("No seats available for this ride");
  }
  
  if (this.passengers.includes(userId)) {
    throw new Error("Passenger already registered for this ride");
  }
  
  if (userId.toString() === this.driver.toString()) {
    throw new Error("Driver cannot be a passenger");
  }
  
  this.passengers.push(userId);
  this.seatsBooked = this.passengers.length;
  return this.save();
};

// Instance method: remove passenger
rideSchema.methods.removePassenger = function(userId) {
  const initialLength = this.passengers.length;
  this.passengers = this.passengers.filter(
    pid => pid.toString() !== userId.toString()
  );
  
  if (this.passengers.length === initialLength) {
    throw new Error("Passenger not found in this ride");
  }
  
  this.seatsBooked = this.passengers.length;
  return this.save();
};

// Instance method: get available seats
rideSchema.methods.getAvailableSeats = function() {
  return this.totalSeats - this.seatsBooked;
};

// Instance method: mark as in-progress
rideSchema.methods.startRide = function() {
  this.status = "in-progress";
  return this.save();
};

// Instance method: mark as completed
rideSchema.methods.completeRide = function() {
  this.status = "completed";
  return this.save();
};

// Instance method: cancel ride
rideSchema.methods.cancelRide = function() {
  if (this.status === "completed") {
    throw new Error("Cannot cancel a completed ride");
  }
  this.status = "cancelled";
  return this.save();
};

export default mongoose.model("Ride", rideSchema);
