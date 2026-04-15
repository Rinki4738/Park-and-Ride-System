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
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ✅ Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});