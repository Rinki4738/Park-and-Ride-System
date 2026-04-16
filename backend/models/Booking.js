import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  // User making the booking
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"],
    index: true
  },

  // Parking Lot booked
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingLot",
    required: [true, "Parking lot reference is required"],
    index: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingSlot",
    required: [true, "Parking slot reference is required"]
  },
  carNumber: {
    type: String,
    required: [true, "Car number is required for entry verification"],
    uppercase: true,
    index: true // Index for quick verification at gate
  },
  startTime: {
    type: Date,
    required: [true, "Start time is required"],
    min: [new Date(), "Start time cannot be in the past"]
  },
  endTime: {
    type: Date,
    required: [true, "End time is required"]
  },
  pricePerHour: {
    type: Number,
    required: true // Captured at booking time (lot price may change)
  },
  totalPrice: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: ["booked", "in-progress", "completed", "cancelled"],
      message: "Status must be booked, in-progress, completed, or cancelled"
    },
    default: "booked",
    index: true // For filtering bookings by status
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ["credit_card", "debit_card", "upi", "wallet", "cash"],
      message: "Invalid payment method"
    },
    default: "upi"
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ["pending", "completed", "refunded"],
      message: "Invalid payment status"
    },
    default: "pending"
  },
  entryTime: {
    type: Date,
    default: null // Set when vehicle enters
  },

  exitTime: {
    type: Date,
    default: null // Set when vehicle exits
  },
  notes: {
    type: String,
    maxlength: [500, "Notes cannot exceed 500 characters"]
  }
}, { 
  timestamps: true,
  indexes: [
    { user: 1, status: 1 },
    { user: 1, createdAt: -1 },
    
    // For preventing double booking of same slot
    // A slot cannot have 2 overlapping bookings with status "booked" or "in-progress"
    { slot: 1, status: 1 },
    
    // For entry gate verification - carNumber lookup
    { carNumber: 1, status: 1 },
    { carNumber: 1, startTime: 1 },
    
    // For lot analytics
    { parkingLot: 1, status: 1 },
    { parkingLot: 1, createdAt: -1 },
    
    // For date range queries
    { startTime: 1, endTime: 1 },
    
    // For payment tracking
    { paymentStatus: 1 },
    { status: 1, paymentStatus: 1 }
  ]
});

// Validation: endTime must be after startTime
bookingSchema.pre("save", function(next) {
  if (this.endTime <= this.startTime) {
    throw new Error("End time must be after start time");
  }
  
  // Calculate total price if not already set
  if (!this.totalPrice || this.totalPrice === 0) {
    const durationHours = (this.endTime - this.startTime) / (1000 * 60 * 60);
    this.totalPrice = Math.ceil(durationHours * this.pricePerHour);
  }
  
  next();
});

// Pre-save: prevent double booking
// Check for overlapping bookings on the same slot
bookingSchema.pre("save", async function(next) {
  if (this.isModified("slot") || this.isNew) {
    const overlap = await mongoose.model("Booking").findOne({
      slot: this.slot,
      status: { $in: ["booked", "in-progress"] },
      $or: [
        {
          startTime: { $lt: this.endTime },
          endTime: { $gt: this.startTime }
        }
      ],
      _id: { $ne: this._id } // Exclude current booking
    });

    if (overlap) {
      throw new Error("This slot is already booked for the selected time period");
    }
  }
  next();
});

// Instance method: mark as in-progress (vehicle entered)
bookingSchema.methods.markAsInProgress = function() {
  this.status = "in-progress";
  this.entryTime = new Date();
  return this.save();
};

// Instance method: mark as completed (vehicle exited)
bookingSchema.methods.markAsCompleted = function() {
  this.status = "completed";
  this.exitTime = new Date();
  return this.save();
};

// Instance method: cancel booking
bookingSchema.methods.cancel = function() {
  if (this.status === "completed" || this.status === "cancelled") {
    throw new Error("Cannot cancel a completed or already cancelled booking");
  }
  this.status = "cancelled";
  return this.save();
};

// Instance method: get duration in hours
bookingSchema.methods.getDurationHours = function() {
  return (this.endTime - this.startTime) / (1000 * 60 * 60);
};

export default mongoose.model("Booking", bookingSchema);
