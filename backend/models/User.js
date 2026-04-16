import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false // Don't return password by default in queries
  },
  // Vehicle number for parking entry verification - UNIQUE per user
  carNumber: {
    type: String,
    required: [true, "Car number is required"],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/, "Please provide a valid Indian vehicle number"],
    index: true // Index for quick lookup at parking gates
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes using Mongoose's supported schema index API
userSchema.index({ carNumber: 1 }); // For parking entry verification
userSchema.index({ email: 1 }); // For login
userSchema.index({ createdAt: 1 }); // For user filtering
export default mongoose.model("User", userSchema);