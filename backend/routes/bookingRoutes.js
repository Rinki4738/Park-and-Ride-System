import express from "express";
import {
  createBooking,
  cancelBooking,
  getUserBookings
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// Create a new booking
router.post("/", createBooking);

// Get all bookings for the logged-in user
router.get("/user", getUserBookings);

// Cancel a specific booking
router.delete("/:id", cancelBooking);

export default router;
