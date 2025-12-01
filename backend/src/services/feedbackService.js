// feedbackService.js
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiService = require('./aiService');

/**
 * Save uploaded file to disk (simple local storage)
 * @param {object} file - Multer file object
 * @returns {string} filePath
 */
function saveUploadedFile(file) {
  if (!file) return null;
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const dest = path.join(uploadDir, `${Date.now()}_${file.originalname}`);
  fs.writeFileSync(dest, file.buffer);
  return dest;
}

/**
 * Build feedback prompt for OpenAI
 * @param {object} params
 * @param {string} params.title
 * @param {string} params.description
 * @param {string} [params.language]
 * @returns {string}
 */
function buildFeedbackPrompt({ title, description, language }) {
  return (
    `Evaluate the following user submission for a coding challenge.\n` +
    `Title: ${title}\n` +
    (language ? `Language: ${language}\n` : '') +
    `Description: ${description}\n` +
    `\nRespond ONLY with a JSON object with these keys: score (1-10), summary, strengths (array), improvements (array), suggestedResources (array).\n` +
    `Example output:\n{\n  "score": 7,\n  "summary": "Good approach but O(n^2) in worst case; recommend using merge sort technique...",\n  "strengths": ["clear variable names", "edge case handling"],\n  "improvements": ["optimize inner loop", "add comments"],\n  "suggestedResources": ["https://www.geeksforgeeks.org/merge-sort/"]\n}\n` +
    `Do not include any explanation or markdown, only the JSON object.\n`
  );
}

/**
 * Parse AI feedback response
 * @param {string} aiRaw
 * @returns {object|null}
 */
function parseFeedbackResponse(aiRaw) {
  try {
    const obj = JSON.parse(aiRaw);
    if (!obj.score || !obj.summary) return null;
    return obj;
  } catch {
    // Try to extract JSON from text
    const match = aiRaw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const obj = JSON.parse(match[0]);
        if (!obj.score || !obj.summary) return null;
        return obj;
      } catch {}
    }
    return null;
  }
}

module.exports = {
  saveUploadedFile,
  buildFeedbackPrompt,
  parseFeedbackResponse,
  prisma,
};
