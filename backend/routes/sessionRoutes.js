// routes/sessionRoutes.js

const express = require("express");
const router = express.Router();
const {
  createSession,
  getSession,
  updateSessionStatus,
  getAllSessions,
  deleteSession,
  startInterview,
  respondToQuestion,
  getConversation,
  retakeInterview,
} = require("../controllers/sessionControllers.js");
const protect = require("../middleware/authMiddleware.js"); // JWT middleware

// ==================
// CRUD Endpoints
// ==================

// Create a new session
router.post("/", protect, createSession);

// Get all sessions for logged-in user
router.get("/", protect, getAllSessions);

// Get a single session by ID
router.get("/:sessionId", protect, getSession);

// Update session status
router.put("/:sessionId/status", protect, updateSessionStatus);

// Delete a session
router.delete("/:sessionId", protect, deleteSession);

// ==================
// AI Interview Flow Endpoints
// ==================

// Start interview (first AI question)
router.post("/:sessionId/start", protect, startInterview);

// Respond to candidate answer, get next question or end
router.post("/:sessionId/respond", protect, respondToQuestion);

// Get full conversation history
router.get("/:sessionId/conversation", protect, getConversation);

// Retake interview (clear conversation, feedback, reset status)
router.post("/:sessionId/retake", protect, retakeInterview);

module.exports = router;
