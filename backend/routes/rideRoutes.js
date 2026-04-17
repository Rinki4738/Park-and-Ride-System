import express from "express";
import {
  createRide,
  getRideByBooking,
  getAllRides,
  bookRideSeat,
  cancelRideSeat
} from "../controllers/rideController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route - view all available rides
router.get("/", getAllRides);

// Protected routes - require authentication
router.use(protect);

// Create a new ride (driver)
router.post("/", createRide);

// Get ride by booking
router.get("/booking/:bookingId", getRideByBooking);

// Book a seat in a ride
router.post("/:rideId/book", bookRideSeat);

// Cancel ride booking
router.delete("/:rideId/cancel", cancelRideSeat);

export default router;
