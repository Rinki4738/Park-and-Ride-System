import mongoose from "mongoose";

const parkingLotSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, "Parking lot name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [100, "Name cannot exceed 100 characters"]
  },

  // Location with coordinates for geographic queries
  location: {
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
      min: [-90, "Latitude must be between -90 and 90"],
      max: [90, "Latitude must be between -90 and 90"]
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
      min: [-180, "Longitude must be between -180 and 180"],
      max: [180, "Longitude must be between -180 and 180"]
    }
  },

  // Slot Capacity Information
  totalSlots: {
    type: Number,
    required: [true, "Total slots is required"],
    min: [1, "Must have at least 1 slot"],
    max: [10000, "Maximum 10000 slots per lot"]
  },

  // Available slots count - denormalized for performance
  // This should be updated whenever a booking is created/cancelled
  availableSlots: {
    type: Number,
    required: [true, "Available slots is required"],
    default: function() {
      return this.totalSlots;
    }
  },

  // Pricing Information
  pricePerHour: {
    type: Number,
    required: [true, "Price per hour is required"],
    min: [0, "Price cannot be negative"],
    max: [10000, "Price seems unreasonable"]
  },

  // Optional Amenities
  amenities: {
    type: [String],
    enum: [
      "24/7 Security",
      "CCTV",
      "EV Charging",
      "Covered",
      "Lighting",
      "Valet Service",
      "Wheelchair Accessible",
      "WiFi"
    ],
    default: []
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true // For filtering active lots
  },

  // Additional metadata
  description: {
    type: String,
    maxlength: [500, "Description cannot exceed 500 characters"]
  }
}, {
  timestamps: true
});

// Indexes
parkingLotSchema.index({ name: 1 }); // For searching by name
parkingLotSchema.index({ "location.latitude": 1, "location.longitude": 1 }); // For geographic queries
parkingLotSchema.index({ availableSlots: 1 }); // For finding available lots
parkingLotSchema.index({ isActive: 1 }); // For filtering active lots
// Method to update available slots (call when booking is made/cancelled)
parkingLotSchema.methods.updateAvailableSlots = function(count) {
  this.availableSlots = Math.max(0, this.availableSlots + count);
  return this.save();
};

export default mongoose.model("ParkingLot", parkingLotSchema);
