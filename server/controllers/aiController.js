const axios = require("axios");
const asyncHandler = require("../utils/asyncHandler");

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const buildFallbackSuggestion = (title, description) => {
  const words = `${title} ${description}`.trim().split(/\s+/).filter(Boolean);
  const complexityScore = Math.min(6, Math.max(1, Math.ceil(words.length / 10)));
  const effortOptions = ["1-2 hours", "2-4 hours", "half day", "1 day", "2 days", "3+ days"];
  const dueDateOffsets = [1, 2, 3, 4, 5, 7];

  return {
    estimatedEffort: effortOptions[complexityScore - 1],
    suggestedDueDate: daysFromNow(dueDateOffsets[complexityScore - 1]),
    reasoning: `Fallback estimate based on the task length and its apparent complexity (${words.length} words).`,
    source: "fallback",
  };
};

const extractJson = (text) => {
  if (typeof text !== "string" || !text.trim()) {
    return null;
  }

  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
};

const normalizeSuggestion = (payload) => {
  const estimatedEffort =
    payload.estimatedEffort || payload.effort || payload.estimate || "";
  const suggestedDueDate =
    payload.suggestedDueDate || payload.dueDate || payload.date || "";
  const reasoning = payload.reasoning || payload.reason || payload.explanation || "";

  if (!estimatedEffort || !suggestedDueDate || !reasoning) {
    throw new Error("Invalid AI payload");
  }

  return {
    estimatedEffort: String(estimatedEffort).trim(),
    suggestedDueDate: String(suggestedDueDate).trim(),
    reasoning: String(reasoning).trim(),
    source: "gemini",
  };
};

const suggestTaskPlanning = asyncHandler(async (req, res) => {
  const { title, description = "" } = req.body;
  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  const trimmedDescription = typeof description === "string" ? description.trim() : "";

  if (!trimmedTitle) {
    return res.status(400).json({
      message: "Task title is required",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json(buildFallbackSuggestion(trimmedTitle, trimmedDescription));
  }

  try {
    const prompt = [
      "You are a product planning assistant for TaskFlow.",
      "Return a single JSON object with these exact keys:",
      '{ "estimatedEffort": "string", "suggestedDueDate": "YYYY-MM-DD", "reasoning": "string" }',
      "Keep the reasoning short and practical.",
      `Task title: ${trimmedTitle}`,
      `Task description: ${trimmedDescription || "No description provided."}`,
    ].join("\n");

    const { data } = await axios.post(
      `${GEMINI_ENDPOINT}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || "")
        .join("") || "";

    const parsed = JSON.parse(extractJson(text) || text);
    const suggestion = normalizeSuggestion(parsed);

    return res.json(suggestion);
  } catch (error) {
    return res.json(buildFallbackSuggestion(trimmedTitle, trimmedDescription));
  }
});

module.exports = {
  suggestTaskPlanning,
};
