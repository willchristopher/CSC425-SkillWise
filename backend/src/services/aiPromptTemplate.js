// aiPromptTemplate.js
/**
 * Build a prompt for AI challenge generation with consistent format and example.
 * @param {Object} params
 * @param {string} params.topic - The topic for the challenge (e.g., 'arrays')
 * @param {string} params.difficulty - The difficulty level ('easy'|'medium'|'hard')
 * @param {Array<Object>} [params.examples] - Optional array of example challenges
 * @returns {string} The prompt string for OpenAI
 */
function buildGenerateChallengePrompt({ topic, difficulty, examples = [] }) {
  const exampleBlock =
    examples && examples.length > 0
      ? `\nExample output:\n${JSON.stringify(examples[0], null, 2)}\n`
      : `\nExample output:\n{
  "title": "Reverse Pairs",
  "description": "Given an array of integers, count the number of pairs (i,j) where i<j and nums[i] > nums[j]. Provide O(n log n) solution.",
  "difficulty": "medium",
  "hints": ["Use merge sort pattern", "Count cross inversions"]
}\n`;

  return (
    `Generate a short programming challenge for students.\n` +
    `Topic: ${topic || 'arrays'}.\n` +
    `Difficulty: ${difficulty || 'medium'}.\n` +
    `Constraints: Max 300 words. Optionally include a sample input/output.\n` +
    `Respond ONLY with a JSON object with the following keys: title, description, difficulty, hints (array of 1-3 helpful hints).\n` +
    exampleBlock +
    `Do not include any explanation or markdown, only the JSON object.\n`
  );
}

module.exports = { buildGenerateChallengePrompt };
