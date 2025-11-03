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
 * Improved heuristic: end interview based on question count and topic coverage
 * This serves as a safety net if the AI doesn't end the interview autonomously
 */
function shouldEndInterview(conversation = [], maxQuestions = 15) {
  const questionCount = (conversation || []).filter(
    (m) => m.role === "assistant"
  ).length;

  // Hard stop at maxQuestions (default 15)
  if (questionCount >= maxQuestions) {
    return true;
  }

  // Soft threshold: after 10 questions, check if key topics are covered
  if (questionCount >= 10) {
    const conversationText = conversation
      .map((m) => m.content.toLowerCase())
      .join(" ");

    // Check for diverse topic coverage
    const hasTechnical = /react|javascript|python|java|framework|library|code|develop/i.test(conversationText);
    const hasDSA = /algorithm|complexity|data structure|leetcode|optimize|time complexity|space complexity/i.test(conversationText);
    const hasBehavioral = /team|project|challenge|conflict|experience|situation|leadership/i.test(conversationText);

    // If we have reasonable coverage after 10 questions, allow AI to continue but suggest ending
    const topicsCovered = [hasTechnical, hasDSA, hasBehavioral].filter(Boolean).length;

    // If 12+ questions and at least 2 topic areas covered, strongly suggest ending
    if (questionCount >= 12 && topicsCovered >= 2) {
      return true;
    }
  }

  return false;
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
