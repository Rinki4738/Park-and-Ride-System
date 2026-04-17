import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, carNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password || !carNumber) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const carExists = await User.findOne({ carNumber });
    if (carExists) {
      return res.status(400).json({ msg: "Car number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      carNumber
    });

    res.status(201).json({ 
      msg: "User registered successfully",
      userId: user._id 
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ 
      msg: "Login successful",
      token,
      userId: user._id 
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ 
      msg: "Profile fetched successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        carNumber: user.carNumber,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};