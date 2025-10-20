// services/aiServices.js

const { GoogleGenAI } = require("@google/genai");
const {
  systemPrompt,
  generateQuestionPrompt,
  generateContextPrompt,
  generateEvaluationPrompt,
} = require("../prompts/promptTemplate.js");

// Initialize Google Gen AI client
const aiClient = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

/**
 * Safely extract model text from the response.
 * Uses the canonical path that works across SDK versions.
 */
function extractOutput(apiResponse) {
  return apiResponse?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

/**
 * Simple heuristic: end after maxQuestions assistant messages
 */
function shouldEndInterview(conversation = [], maxQuestions = 25) {
  const questionCount = (conversation || []).filter(
    (m) => m.role === "assistant"
  ).length;
  return questionCount >= maxQuestions;
}

async function generateNextQuestion({ resume, jobDetails, conversation }) {
  try {
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

    const text = extractOutput(response);
    return text || "Let's begin — could you tell me about your background?";
  } catch (err) {
    console.error("aiService.generateNextQuestion error:", err);
    return "Let's begin — could you tell me about your background?";
  }
}

async function processCandidateResponse({ resume, jobDetails, conversation }) {
  try {
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

    const text = extractOutput(response);
    const lower = (text || "").toLowerCase();
    const end =
      lower.includes("this concludes our interview") ||
      lower.includes("we’ll now prepare your feedback") ||
      lower.includes("end of interview");

    return { end, message: text || "Can you elaborate a bit more on that?" };
  } catch (err) {
    console.error("aiService.processCandidateResponse error:", err);
    return {
      end: false,
      message: "Could you please expand on your last point?",
    };
  }
}

async function generateFeedback({ resume, jobDetails, conversation }) {
  try {
    const prompt = generateEvaluationPrompt({
      resume,
      jobDetails,
      conversation,
    });

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
        },
      ],
    });

    let text = extractOutput(response);

    // if model returns ```json ... ``` extract inner JSON
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) text = match[1].trim();

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      // fallback — return raw text under key so caller can handle
      console.warn(
        "aiService.generateFeedback: response not valid JSON, returning raw text"
      );
      return { rawFeedback: text };
    }
  } catch (err) {
    console.error("aiService.generateFeedback error:", err);
    return { error: "Failed to generate feedback" };
  }
}

module.exports = {
  generateNextQuestion,
  processCandidateResponse,
  generateFeedback,
  shouldEndInterview,
};
