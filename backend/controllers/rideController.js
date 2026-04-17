import Ride from "../models/Ride.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

// CREATE RIDE
export const createRide = async (req, res) => {
  try {
    const {
      bookingId,
      fromLocation,
      toLocation,
      departureTime,
      totalSeats,
      pricePerSeat
    } = req.body;

    const driverId = req.user;

    // Validate required fields
    if (!fromLocation || !toLocation || !departureTime || !totalSeats || pricePerSeat === undefined) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }

    // Validate seats
    if (totalSeats < 1 || totalSeats > 8) {
      return res.status(400).json({ msg: "Total seats must be between 1 and 8" });
    }

    // Validate departure time
    const departure = new Date(departureTime);
    if (departure < new Date()) {
      return res.status(400).json({ msg: "Departure time cannot be in the past" });
    }

    // Verify driver exists
    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ msg: "Driver not found" });
    }

    // Create ride
    const ride = await Ride.create({
      driver: driverId,
      fromLocation,
      toLocation,
      departureTime: departure,
      totalSeats,
      pricePerSeat,
      seatsBooked: 0,
      passengers: []
    });

    res.status(201).json({
      msg: "Ride created successfully",
      ride: {
        _id: ride._id,
        driver: ride.driver,
        fromLocation: ride.fromLocation,
        toLocation: ride.toLocation,
        departureTime: ride.departureTime,
        totalSeats: ride.totalSeats,
        availableSeats: ride.totalSeats,
        pricePerSeat: ride.pricePerSeat
      }
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// GET RIDE BY BOOKING
export const getRideByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    // Find ride associated with this booking
    // Typically, rides are created based on parking start time
    const ride = await Ride.findOne({
      departureTime: { $gte: booking.startTime }
    })
      .populate("driver", "name email carNumber")
      .populate("passengers", "name email carNumber")
      .sort({ departureTime: 1 })
      .limit(1);

    if (!ride) {
      return res.status(404).json({ msg: "No rides found for this booking period" });
    }

    const availableSeats = ride.totalSeats - ride.seatsBooked;

    res.json({
      msg: "Ride retrieved successfully",
      ride: {
        _id: ride._id,
        driver: ride.driver,
        fromLocation: ride.fromLocation,
        toLocation: ride.toLocation,
        departureTime: ride.departureTime,
        totalSeats: ride.totalSeats,
        availableSeats: availableSeats,
        pricePerSeat: ride.pricePerSeat,
        passengers: ride.passengers
      }
    });

  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid booking ID" });
    }
    res.status(500).json({ msg: error.message });
  }
};

// GET ALL RIDES
export const getAllRides = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};

    // Filter by status if provided
    if (status) {
      query.rideStatus = status;
    }

    // Only get upcoming or ongoing rides
    query.departureTime = { $gte: new Date() };

    const rides = await Ride.find(query)
      .populate("driver", "name email carNumber")
      .populate("passengers", "name email carNumber")
      .sort({ departureTime: 1 });

    if (!rides || rides.length === 0) {
      return res.status(404).json({ msg: "No rides found" });
    }

    // Enrich response with available seats
    const enrichedRides = rides.map(ride => ({
      _id: ride._id,
      driver: ride.driver,
      fromLocation: ride.fromLocation,
      toLocation: ride.toLocation,
      departureTime: ride.departureTime,
      totalSeats: ride.totalSeats,
      availableSeats: ride.totalSeats - ride.seatsBooked,
      pricePerSeat: ride.pricePerSeat,
      passengersCount: ride.passengers.length,
      rideStatus: ride.rideStatus
    }));

    res.json({
      msg: "Rides retrieved successfully",
      count: enrichedRides.length,
      rides: enrichedRides
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// BOOK A SEAT IN A RIDE
export const bookRideSeat = async (req, res) => {
  try {
    const { rideId } = req.params;
    const passengerId = req.user;

    // Verify ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ msg: "Ride not found" });
    }

    // Check if ride is full
    if (ride.seatsBooked >= ride.totalSeats) {
      return res.status(400).json({ msg: "Ride is full" });
    }

    // Check if passenger already booked
    if (ride.passengers.includes(passengerId)) {
      return res.status(400).json({ msg: "You have already booked a seat in this ride" });
    }

    // Verify passenger exists
    const passenger = await User.findById(passengerId);
    if (!passenger) {
      return res.status(404).json({ msg: "Passenger not found" });
    }

    // Book the seat
    ride.passengers.push(passengerId);
    ride.seatsBooked += 1;
    await ride.save();

    res.json({
      msg: "Seat booked successfully",
      rideId: ride._id,
      availableSeats: ride.totalSeats - ride.seatsBooked,
      pricePerSeat: ride.pricePerSeat,
      totalCost: ride.pricePerSeat
    });

  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid ride ID" });
    }
    res.status(500).json({ msg: error.message });
  }
};

// CANCEL RIDE SEAT
export const cancelRideSeat = async (req, res) => {
  try {
    const { rideId } = req.params;
    const passengerId = req.user;

    // Verify ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ msg: "Ride not found" });
    }

    // Check if passenger is in the ride
    const passengerIndex = ride.passengers.findIndex(
      p => p.toString() === passengerId
    );

    if (passengerIndex === -1) {
      return res.status(400).json({ msg: "You are not booked in this ride" });
    }

    // Remove passenger
    ride.passengers.splice(passengerIndex, 1);
    ride.seatsBooked -= 1;
    await ride.save();

    res.json({
      msg: "Ride booking cancelled successfully",
      rideId: ride._id,
      availableSeats: ride.totalSeats - ride.seatsBooked
    });

  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid ride ID" });
    }
    res.status(500).json({ msg: error.message });
  }
};
