import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/protected", protect, (req, res) => {
  res.json({
    message: "You are authorized 🎉",
    userId: req.user,
  });
});

export default router;