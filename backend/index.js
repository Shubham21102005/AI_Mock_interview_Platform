const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/connectDB.js");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

app.listen(process.env.PORT, async () => {
  try {
    await connectDB();
    console.log(`Server Running On ${process.env.PORT}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
});
