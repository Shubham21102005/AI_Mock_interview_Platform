const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    resume: {
      type: String,
      required: true, // full resume text
    },
    jobDetails: {
      title: { type: String }, // e.g., "Frontend Developer"
      description: { type: String }, // job description text
      yoeRequired: { type: String }, // e.g., "2+ years"
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },

    // 🧠 New field for storing conversation history
    conversation: [messageSchema],

    feedback: {
      overall: { type: String },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      rating: { type: Number },
      suggestions: { type: String },
    },

    currentQuestionCount: {
      type: Number,
      default: 0, // helps track when to end interview
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
