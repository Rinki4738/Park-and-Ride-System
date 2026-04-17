import express from "express";
import {
  getAllParkingLots,
  getParkingLotById,
  getSlotsByLot,
  createParkingLot
} from "../controllers/parkingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes - anyone can view parking lots and slots
router.get("/", getAllParkingLots);
router.get("/:id", getParkingLotById);
router.get("/:id/slots", getSlotsByLot);

// Protected routes - admin only for creating parking lots
router.post("/", protect, createParkingLot);

export default router;
