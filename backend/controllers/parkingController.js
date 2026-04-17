import ParkingLot from "../models/ParkingLot.js";
import ParkingSlot from "../models/ParkingSlot.js";

// GET ALL PARKING LOTS
export const getAllParkingLots = async (req, res) => {
  try {
    const lots = await ParkingLot.find({ isActive: true });

    if (!lots || lots.length === 0) {
      return res.status(404).json({ msg: "No parking lots found" });
    }

    res.json({
      msg: "Parking lots retrieved successfully",
      count: lots.length,
      lots
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// GET PARKING LOT BY ID
export const getParkingLotById = async (req, res) => {
  try {
    const { id } = req.params;

    const lot = await ParkingLot.findById(id);
    if (!lot) {
      return res.status(404).json({ msg: "Parking lot not found" });
    }

    res.json({
      msg: "Parking lot retrieved successfully",
      lot
    });

  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid parking lot ID" });
    }
    res.status(500).json({ msg: error.message });
  }
};

// GET SLOTS BY LOT
export const getSlotsByLot = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify lot exists
    const lot = await ParkingLot.findById(id);
    if (!lot) {
      return res.status(404).json({ msg: "Parking lot not found" });
    }

    // Get all slots for this lot
    const slots = await ParkingSlot.find({ parkingLot: id });

    // Separate available and occupied slots
    const availableSlots = slots.filter(slot => !slot.isOccupied && !slot.isUnderMaintenance);
    const occupiedSlots = slots.filter(slot => slot.isOccupied);
    const maintenanceSlots = slots.filter(slot => slot.isUnderMaintenance);

    res.json({
      msg: "Slots retrieved successfully",
      parkingLotId: id,
      totalSlots: slots.length,
      summary: {
        available: availableSlots.length,
        occupied: occupiedSlots.length,
        maintenance: maintenanceSlots.length
      },
      slots: {
        available: availableSlots,
        occupied: occupiedSlots,
        maintenance: maintenanceSlots
      }
    });

  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid parking lot ID" });
    }
    res.status(500).json({ msg: error.message });
  }
};

// CREATE PARKING LOT (Admin function)
export const createParkingLot = async (req, res) => {
  try {
    const { name, location, totalSlots, pricePerHour, amenities } = req.body;

    // Validate required fields
    if (!name || !location || !totalSlots || pricePerHour === undefined) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }

    const lot = await ParkingLot.create({
      name,
      location,
      totalSlots,
      availableSlots: totalSlots,
      pricePerHour,
      amenities: amenities || []
    });

    res.status(201).json({
      msg: "Parking lot created successfully",
      lot
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
