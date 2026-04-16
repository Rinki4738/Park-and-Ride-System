import mongoose from "mongoose";

const parkingSlotSchema = new mongoose.Schema({
  // Reference to Parking Lot (Many slots belong to One lot)
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingLot",
    required: [true, "Parking lot reference is required"],
    index: true
  },

  // Slot Identifier
  slotNumber: {
    type: String,
    required: [true, "Slot number is required"],
    trim: true,
    example: "A1", // Ground level, slot 1
    minlength: [1, "Slot number must be at least 1 character"]
  },

  // Occupancy Status
  isOccupied: {
    type: Boolean,
    default: false,
    index: true // For finding available slots quickly
  },

  // Current Booking Reference (if occupied)
  // This allows quick lookup without querying Booking collection
  occupiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    default: null
  },

  // Vehicle Type Constraint (optional)
  // Some slots may be reserved for specific vehicle types
  vehicleType: {
    type: String,
    enum: {
      values: ["car", "bike", "any"],
      message: "Vehicle type must be car, bike, or any"
    },
    default: "any"
  },

  // Floor/Level Information (for underground/multi-level parking)
  floor: {
    type: Number,
    min: [-10, "Basement floors minimum -10"],
    max: [20, "Ground and above maximum 20"],
    default: 0
  },

  // Section/Zone (for quick navigation)
  section: {
    type: String,
    trim: true,
    example: "North Wing A"
  },

  // Maintenance Status
  isUnderMaintenance: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  indexes: [
    // Compound index to ensure unique slotNumber per parkingLot
    { parkingLot: 1, slotNumber: 1, unique: true },
    
    // For finding available slots in a lot
    { parkingLot: 1, isOccupied: 1 },
    
    // For finding slots by vehicle type
    { parkingLot: 1, vehicleType: 1 },
    
    // For maintenance queries
    { isUnderMaintenance: 1 }
  ]
});

// Pre-save validation: prevent double booking
parkingSlotSchema.pre("save", async function(next) {
  if (this.isOccupied && !this.occupiedBy) {
    throw new Error("Cannot mark slot as occupied without booking reference");
  }
  
  if (!this.isOccupied && this.occupiedBy) {
    this.occupiedBy = null; // Clear booking reference if not occupied
  }
  
  next();
});

// Instance method to mark slot as available
parkingSlotSchema.methods.markAvailable = function() {
  this.isOccupied = false;
  this.occupiedBy = null;
  return this.save();
};

// Instance method to mark slot as occupied
parkingSlotSchema.methods.markOccupied = function(bookingId) {
  if (!bookingId) {
    throw new Error("Booking reference is required");
  }
  this.isOccupied = true;
  this.occupiedBy = bookingId;
  return this.save();
};

export default mongoose.model("ParkingSlot", parkingSlotSchema);
