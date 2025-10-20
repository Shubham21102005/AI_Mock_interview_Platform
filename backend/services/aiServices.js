// services/aiService.js

const { GoogleGenAI } = require("@google/genai");
const {
  systemPrompt,
  generateQuestionPrompt,
  generateContextPrompt,
  generateEvaluationPrompt,
} = require("../prompts/promptTemplate.js");

// Initialize Google Gen AI client
const aiClient = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function generateNextQuestion({ resume, jobDetails, conversation }) {
  const prompt = generateQuestionPrompt({ resume, jobDetails, conversation });

  const response = await aiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
      },
    ],
  });

  return response.output_text?.trim().trim();
}

async function processCandidateResponse({ resume, jobDetails, conversation }) {
  const prompt = generateContextPrompt({ recentMessages: conversation });

  const response = await aiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
      },
    ],
  });

  const text = response.output_text?.trim().trim();
  const lower = text.toLowerCase();
  const end =
    lower.includes("this concludes our interview") ||
    lower.includes("we’ll now prepare your feedback");

  return { end, message: text };
}

async function generateFeedback({ resume, jobDetails, conversation }) {
  const prompt = generateEvaluationPrompt({ resume, jobDetails, conversation });

  const response = await aiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
      },
    ],
  });

  let text = response.output_text?.trim().trim();
  const match = text.match(/```json([\s\S]*?)```/);
  if (match) text = match[1].trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse feedback JSON", err, text);
    throw new Error("Feedback parsing error");
  }
}

module.exports = {
  generateNextQuestion,
  processCandidateResponse,
  generateFeedback,
};
