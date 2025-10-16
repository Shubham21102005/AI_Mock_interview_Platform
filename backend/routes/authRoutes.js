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
const upload = require("../middleware/uploadMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, profile);
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("profilePicture"),
  updateProfile
);

module.exports = router;
