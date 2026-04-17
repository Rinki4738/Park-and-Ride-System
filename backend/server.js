import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json()); // to parse JSON
app.use(cors()); // allow cross-origin requests

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/ride", rideRoutes);
app.use("/api/test", testRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Park and Ride API is running...");
});

// ✅ Error Handling Middleware
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Global error handler

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// ✅ Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Park and Ride Server running on port ${PORT}`);
});