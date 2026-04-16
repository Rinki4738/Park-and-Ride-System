/**
 * Park and Ride System - MongoDB Models
 * 
 * Exposes all Mongoose models with proper ES Modules pattern
 * Usage: import { User, ParkingLot, ParkingSlot, Booking, Ride } from './models/index.js'
 */

import User from "./User.js";
import ParkingLot from "./ParkingLot.js";
import ParkingSlot from "./ParkingSlot.js";
import Booking from "./Booking.js";
import Ride from "./Ride.js";

export {
  User,
  ParkingLot,
  ParkingSlot,
  Booking,
  Ride
};

export default {
  User,
  ParkingLot,
  ParkingSlot,
  Booking,
  Ride
};
