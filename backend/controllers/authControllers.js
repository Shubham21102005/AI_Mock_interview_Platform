const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
  return { accessToken, refreshToken };
};

const uploadImageToCloudinary = async (buffer) => {
  const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64Image, {
    folder: "user_profiles",
  });
  return result.secure_url;
};

const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePictureUrl = "";
    if (req.file) {
      profilePictureUrl = await uploadImageToCloudinary(req.file.buffer);
    }

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, username } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (username) updates.username = username;

    if (req.file) {
      updates.profilePicture = await uploadImageToCloudinary(req.file.buffer);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password -refreshToken");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

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

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

const profile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, refresh, logout, profile, updateProfile };
