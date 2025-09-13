// models/sessionModel.js
const mongoose = require("mongoose");

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
    feedback: {
      overall: { type: String }, // overall summary ("Good communication, needs more depth in technical answers")
      strengths: [{ type: String }], // list of strong points
      weaknesses: [{ type: String }], // list of improvement areas
      rating: { type: Number }, // numeric rating (1–5 or 1–10)
      suggestions: { type: String }, // detailed actionable advice
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
