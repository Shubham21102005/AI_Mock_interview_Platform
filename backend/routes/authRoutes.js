const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  profile,
  updateProfile,
} = require("../controllers/authControllers.js");
const authMiddleware = require("../middleware/authMiddleware.js");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, profile);
router.put("/me", authMiddleware, updateProfile);

module.exports = router;
