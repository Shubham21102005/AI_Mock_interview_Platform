// controllers/sessionController.js

const Session = require("../models/session.js");
const User = require("../models/user.js");
const {
  generateNextQuestion,
  processCandidateResponse,
  generateFeedback,
  shouldEndInterview,
} = require("../services/aiServices.js");

// -------------------- CRUD Controllers --------------------

const createSession = async (req, res) => {
  try {
    const { resume, jobDetails } = req.body;
    if (!resume || !jobDetails) {
      return res
        .status(400)
        .json({ message: "Resume and Job Details are required" });
    }
    const newSession = new Session({ resume, jobDetails });
    await newSession.save();
    res.status(201).json({
      message: "Session created successfully",
      sessionId: newSession._id,
    });
  } catch (error) {
    console.error("createSession error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json(session);
  } catch (error) {
    console.error("getSession error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    if (!["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    session.status = status;
    await session.save();
    res.status(200).json({ message: "Session status updated", session });
  } catch (error) {
    console.error("updateSessionStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const sessions = await Session.find({ _id: { $in: user.sessions } });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("getAllSessions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { sessionid } = req.params;
    const session = await Session.findByIdAndDelete(sessionid);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("deleteSession error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- AI Interview Flow Controllers --------------------

const startInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "pending") {
      return res.status(400).json({ message: "Interview already started" });
    }

    const firstQuestion = await generateNextQuestion({
      resume: session.resume,
      jobDetails: session.jobDetails,
      conversation: session.conversation || [],
    });

    // ensure we have a string question
    const safeQuestion =
      typeof firstQuestion === "string" && firstQuestion.trim() !== ""
        ? firstQuestion.trim()
        : "Let's begin — could you tell me about your background?";

    session.conversation = session.conversation || [];
    session.conversation.push({ role: "assistant", content: safeQuestion });
    session.status = "in-progress";
    session.currentQuestionCount = 1;
    await session.save();

    res
      .status(200)
      .json({ message: "Interview started", question: safeQuestion });
  } catch (error) {
    console.error("startInterview error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const respondToQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ message: "Answer is required" });

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status !== "in-progress") {
      return res.status(400).json({ message: "Interview is not in progress" });
    }

    session.conversation = session.conversation || [];
    session.conversation.push({ role: "user", content: String(answer) });

    const { end, message } = await processCandidateResponse({
      resume: session.resume,
      jobDetails: session.jobDetails,
      conversation: session.conversation,
    });

    const safeMessage =
      typeof message === "string" && message.trim() !== ""
        ? message.trim()
        : "Could you clarify that a bit more?";

    session.conversation.push({ role: "assistant", content: safeMessage });
    session.currentQuestionCount = (session.currentQuestionCount || 0) + 1;

    // use service heuristic
    if (end || shouldEndInterview(session.conversation, 15)) {
      session.status = "completed";
      const feedback = await generateFeedback({
        resume: session.resume,
        jobDetails: session.jobDetails,
        conversation: session.conversation,
      });
      session.feedback = feedback;
      await session.save();
      return res.status(200).json({ message: "Interview completed", feedback });
    }

    await session.save();
    res.status(200).json({ message: "Next question", question: safeMessage });
  } catch (error) {
    console.error("respondToQuestion error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ conversation: session.conversation || [] });
  } catch (error) {
    console.error("getConversation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createSession,
  getSession,
  updateSessionStatus,
  getAllSessions,
  deleteSession,
  startInterview,
  respondToQuestion,
  getConversation,
};
