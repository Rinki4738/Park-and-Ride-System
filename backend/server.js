import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json()); // to parse JSON
app.use(cors()); // allow cross-origin requests

// ✅ Routes
app.use("/api/auth", authRoutes);


app.use("/api/test", testRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ MongoDB Connection
// ✅ Server Start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

startServer();