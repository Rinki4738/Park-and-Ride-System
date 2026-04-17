import Booking from "../models/Booking.js";
import ParkingLot from "../models/ParkingLot.js";
import ParkingSlot from "../models/ParkingSlot.js";
import User from "../models/User.js";

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { parkingLotId, slotId, startTime, endTime, paymentMethod } = req.body;
    const userId = req.user;

    // Validate required fields
    if (!parkingLotId || !slotId || !startTime || !endTime) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ msg: "End time must be after start time" });
    }

    if (start < new Date()) {
      return res.status(400).json({ msg: "Start time cannot be in the past" });
    }

    // Get user and verify car number
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Verify parking lot exists
    const lot = await ParkingLot.findById(parkingLotId);
    if (!lot) {
      return res.status(404).json({ msg: "Parking lot not found" });
    }

    // Verify slot exists and is available
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ msg: "Parking slot not found" });
    }

    if (slot.isOccupied || slot.isUnderMaintenance) {
      return res.status(400).json({ msg: "Slot is not available" });
    }

    // Calculate total price
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const totalPrice = hours * lot.pricePerHour;

    // Create booking
    const booking = await Booking.create({
      user: userId,
      parkingLot: parkingLotId,
      slot: slotId,
      carNumber: user.carNumber,
      startTime: start,
      endTime: end,
      pricePerHour: lot.pricePerHour,
      totalPrice,
      paymentMethod: paymentMethod || "upi"
    });

    // Update slot status
    await ParkingSlot.findByIdAndUpdate(slotId, {
      isOccupied: true,
      occupiedBy: booking._id
    });

    // Update available slots in parking lot
    await ParkingLot.findByIdAndUpdate(parkingLotId, {
      availableSlots: lot.availableSlots - 1
    });

    res.status(201).json({
      msg: "Booking created successfully",
      booking: {
        _id: booking._id,
        parkingLotId: booking.parkingLot,
        slotId: booking.slot,
        carNumber: booking.carNumber,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice,
        status: booking.status
      }
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// CANCEL BOOKING
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    // Find booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    // Verify user owns this booking
    if (booking.user.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized to cancel this booking" });
    }

    // Check if booking can be cancelled
    if (booking.status === "completed" || booking.status === "cancelled") {
      return res.status(400).json({ msg: `Booking is already ${booking.status}` });
    }

    // Update booking status
    await Booking.findByIdAndUpdate(id, { status: "cancelled" });

    // Free up the slot
    await ParkingSlot.findByIdAndUpdate(booking.slot, {
      isOccupied: false,
      occupiedBy: null
    });

    // Update available slots in parking lot
    const lot = await ParkingLot.findById(booking.parkingLot);
    if (lot) {
      await ParkingLot.findByIdAndUpdate(booking.parkingLot, {
        availableSlots: lot.availableSlots + 1
      });
    }

    res.json({
      msg: "Booking cancelled successfully",
      bookingId: id
    });

  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid booking ID" });
    }
    res.status(500).json({ msg: error.message });
  }
};

// GET USER BOOKINGS
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user;

    const bookings = await Booking.find({ user: userId })
      .populate("parkingLot", "name location pricePerHour")
      .populate("slot", "slotNumber floor section")
      .sort({ createdAt: -1 });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ msg: "No bookings found" });
    }

    // Group bookings by status
    const groupedBookings = {
      booked: bookings.filter(b => b.status === "booked"),
      inProgress: bookings.filter(b => b.status === "in-progress"),
      completed: bookings.filter(b => b.status === "completed"),
      cancelled: bookings.filter(b => b.status === "cancelled")
    };

    res.json({
      msg: "User bookings retrieved successfully",
      totalBookings: bookings.length,
      summary: {
        booked: groupedBookings.booked.length,
        inProgress: groupedBookings.inProgress.length,
        completed: groupedBookings.completed.length,
        cancelled: groupedBookings.cancelled.length
      },
      bookings: groupedBookings
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
