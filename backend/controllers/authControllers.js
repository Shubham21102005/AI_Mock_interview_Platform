const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
  return { accessToken, refreshToken };
};

// REGISTER
const register = async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    username,
    email,
    password: hashedPassword,
    profilePicture: "",
  });
  await newUser.save();

  res.status(201).json({ message: "User registered successfully" });
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.status(200).json({
    accessToken,
    refreshToken,
    user: { id: user._id, username: user.username, email: user.email },
  });
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  const userId = req.user.userId; // from authMiddleware
  const { name, username, profilePicture } = req.body;

  try {
    // Only allow specific fields to be updated
    const updates = {};
    if (name) updates.name = name;
    if (username) updates.username = username;
    if (profilePicture) updates.profilePicture = profilePicture;

    // Check if username already taken (optional)
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// REFRESH TOKEN
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);
    user.refreshToken = newRefresh;
    await user.save();

    res.status(200).json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

// LOGOUT
const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.status(200).json({ message: "Logged out successfully" });
  } catch {
    res.status(400).json({ message: "Invalid token" });
  }
};

// PROFILE
const profile = async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json(user);
};

module.exports = { register, login, refresh, logout, profile, updateProfile };
