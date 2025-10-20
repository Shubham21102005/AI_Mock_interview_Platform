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

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);

app.listen(process.env.PORT, async () => {
  try {
    await connectDB();
    console.log(`Server Running On ${process.env.PORT}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
});
