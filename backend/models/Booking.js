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
  timestamps: true
});

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

// For preventing double booking of same slot
// A slot cannot have 2 overlapping bookings with status "booked" or "in-progress"
bookingSchema.index({ slot: 1, status: 1 });

// For entry gate verification - carNumber lookup
bookingSchema.index({ carNumber: 1, status: 1 });
bookingSchema.index({ carNumber: 1, startTime: 1 });

// For lot analytics
bookingSchema.index({ parkingLot: 1, status: 1 });
bookingSchema.index({ parkingLot: 1, createdAt: -1 });

// For date range queries
bookingSchema.index({ startTime: 1, endTime: 1 });

// For payment tracking
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
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

const BOOKING_SLOT_LOCK_COLLECTION = "booking_slot_locks";
const BOOKING_SLOT_LOCK_TTL_MS = 30 * 1000;

async function acquireSlotLock(slot) {
  const locks = mongoose.connection.collection(BOOKING_SLOT_LOCK_COLLECTION);
  const now = new Date();
  const lockToken = new mongoose.Types.ObjectId().toString();
  const expiresAt = new Date(now.getTime() + BOOKING_SLOT_LOCK_TTL_MS);

  const result = await locks.findOneAndUpdate(
    {
      _id: slot.toString(),
      $or: [
        { expiresAt: { $lte: now } },
        { expiresAt: { $exists: false } }
      ]
    },
    {
      $set: {
        token: lockToken,
        expiresAt,
        updatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    {
      upsert: true,
      returnDocument: "after"
    }
  );

  if (!result || !result.value || result.value.token !== lockToken) {
    throw new Error("Another booking is currently being processed for this slot. Please try again.");
  }

  return lockToken;
}

async function releaseSlotLock(slot, lockToken) {
  if (!slot || !lockToken) {
    return;
  }

  const locks = mongoose.connection.collection(BOOKING_SLOT_LOCK_COLLECTION);
  await locks.deleteOne({
    _id: slot.toString(),
    token: lockToken
  });
}

// Pre-save: prevent double booking
// Serialize overlapping-booking checks per slot with an atomic lock
bookingSchema.pre("save", async function(next) {
  const shouldCheckOverlap =
    this.isNew ||
    this.isModified("slot") ||
    this.isModified("startTime") ||
    this.isModified("endTime") ||
    this.isModified("status");

  const shouldBlockSlot =
    this.status === "booked" || this.status === "in-progress";

  if (!shouldCheckOverlap || !shouldBlockSlot) {
    return next();
  }

  try {
    const lockToken = await acquireSlotLock(this.slot);
    this.$locals.slotLockToken = lockToken;

    const overlap = await mongoose.model("Booking").findOne({
      slot: this.slot,
      status: { $in: ["booked", "in-progress"] },
      startTime: { $lt: this.endTime },
      endTime: { $gt: this.startTime },
      _id: { $ne: this._id } // Exclude current booking
    });

    if (overlap) {
      await releaseSlotLock(this.slot, lockToken);
      delete this.$locals.slotLockToken;
      throw new Error("This slot is already booked for the selected time period");
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Release per-slot lock after a successful save
bookingSchema.post("save", async function(doc, next) {
  try {
    await releaseSlotLock(doc.slot, doc.$locals && doc.$locals.slotLockToken);
    if (doc.$locals) {
      delete doc.$locals.slotLockToken;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Release per-slot lock if the save fails after acquiring it
bookingSchema.post("save", async function(error, doc, next) {
  try {
    await releaseSlotLock(doc && doc.slot, doc && doc.$locals && doc.$locals.slotLockToken);
    if (doc && doc.$locals) {
      delete doc.$locals.slotLockToken;
    }
  } catch (releaseError) {
    return next(releaseError);
  }
  next(error);
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
