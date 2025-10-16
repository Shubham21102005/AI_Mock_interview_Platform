const Session = require("../models/session.js");
const User = require("../models/user.js");

const createSession = async (req, res) => {
  try {
    const { resume, jobDetails } = req.body;
    if (!resume || !jobDetails) {
      return res
        .status(400)
        .json({ message: "Resume and Job Details are required" });
    }
    const newSession = new Session({
      resume,
      jobDetails,
    });
    await newSession.save();
    res.status(201).json({
      message: "Session created successfully",
      sessionId: newSession._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json(session);
  } catch (error) {
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
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    session.status = status;
    await session.save();
    res.status(200).json({ message: "Session status updated", session });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//get all sessions from a user
const getAllSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const sessions = await Session.find({ _id: { $in: user.sessions } });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { sessionid } = req.params;
    const session = await Session.findByIdAndDelete(sessionid);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
