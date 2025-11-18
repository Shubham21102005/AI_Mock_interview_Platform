const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/connectDB.js");
const authRoutes = require("./routes/authRoutes.js");
const sessionRoutes = require("./routes/sessionRoutes.js");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

//Routes
app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);

// 404 handler - log unmatched routes
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found" });
});

app.listen(process.env.PORT, async () => {
  try {
    await connectDB();
    console.log(`Server Running On ${process.env.PORT}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
});
