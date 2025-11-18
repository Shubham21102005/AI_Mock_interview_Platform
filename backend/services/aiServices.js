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
 * Retry utility with exponential backoff for handling temporary API failures
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay in milliseconds (default: 1000)
 * @returns {Promise} Result of the function or throws the last error
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable (503, 429, or network errors)
      const isRetryable =
        error.status === 503 ||
        error.status === 429 ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('overloaded') ||
        error.message?.includes('timeout');

      // If not retryable or last attempt, throw immediately
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 200; // Add small random jitter
      const totalDelay = delay + jitter;

      console.log(
        `API call failed (attempt ${attempt + 1}/${maxRetries + 1}). ` +
        `Retrying in ${Math.round(totalDelay)}ms... Error: ${error.message}`
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
}

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

    const response = await retryWithBackoff(async () => {
      return await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
          },
        ],
      });
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

    const response = await retryWithBackoff(async () => {
      return await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
          },
        ],
      });
    });

    const text = extractOutput(response);
    const lower = (text || "").toLowerCase();
    const end =
      lower.includes("this concludes our interview") ||
      lower.includes("we'll now prepare your feedback") ||
      lower.includes("end of interview");

    return { end, message: text || "Can you elaborate a bit more on that?" };
  } catch (err) {
    console.error("aiService.processCandidateResponse error:", err);

    // Provide user-friendly error message based on error type
    let errorMessage = "Could you please expand on your last point?";
    if (err.status === 503 || err.message?.includes('overloaded')) {
      errorMessage = "I'm experiencing high demand right now. Could you please try again in a moment?";
    } else if (err.status === 429) {
      errorMessage = "I need a brief moment to process. Please try again shortly.";
    }

    return {
      end: false,
      message: errorMessage,
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

    const response = await retryWithBackoff(async () => {
      return await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
          },
        ],
      });
    }, 5, 2000); // Increase retries and delay for feedback generation (more critical)

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

    // Provide more informative error messages
    let errorMessage = "Failed to generate feedback";
    if (err.status === 503 || err.message?.includes('overloaded')) {
      errorMessage = "The AI service is currently overloaded. Your interview responses have been saved. Please try generating feedback again in a few moments.";
    } else if (err.status === 429) {
      errorMessage = "Rate limit exceeded. Please wait a moment before generating feedback.";
    }

    return { error: errorMessage };
  }
}

module.exports = {
  generateNextQuestion,
  processCandidateResponse,
  generateFeedback,
  shouldEndInterview,
};
