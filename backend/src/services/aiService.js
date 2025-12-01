const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  CATEGORIES,
  QUESTION_TYPES,
  getQuestionTypesForCategory,
} = require('../constants/categories');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================
// PROMPT TEMPLATES FOR DIFFERENT QUESTION TYPES
// ============================================

const QUESTION_STRUCTURES = {
  mcq: `{
    "type": "mcq",
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct"
  }`,

  'fill-blank': `{
    "type": "fill-blank",
    "question": "The sentence with _____ for blanks",
    "blanks": ["correct answer 1", "correct answer 2"],
    "hint": "Optional hint"
  }`,

  'true-false': `{
    "type": "true-false",
    "statement": "A statement that is either true or false",
    "correctAnswer": true,
    "explanation": "Why this is true/false"
  }`,

  matching: `{
    "type": "matching",
    "instructions": "Match the items on the left with items on the right",
    "leftItems": ["Item 1", "Item 2", "Item 3"],
    "rightItems": ["Match A", "Match B", "Match C"],
    "correctPairs": [[0, 1], [1, 2], [2, 0]]
  }`,

  'short-answer': `{
    "type": "short-answer",
    "question": "A question requiring a brief answer",
    "sampleAnswer": "An example of a good answer",
    "keyPoints": ["key point 1", "key point 2"]
  }`,

  'long-response': `{
    "type": "long-response",
    "prompt": "A detailed prompt or essay question",
    "guidelines": ["Guideline 1", "Guideline 2"],
    "rubric": {
      "excellent": "Description of excellent response",
      "good": "Description of good response",
      "needsWork": "Description of response needing improvement"
    }
  }`,

  'code-challenge': `{
    "type": "code-challenge",
    "title": "Challenge title",
    "description": "What to build or solve",
    "language": "javascript",
    "starterCode": "// Starter code here",
    "testCases": [
      {"input": "test input", "expectedOutput": "expected output"}
    ],
    "hints": ["Hint 1", "Hint 2"]
  }`,

  practical: `{
    "type": "practical",
    "title": "Practical exercise title",
    "description": "What to do in this hands-on exercise",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "materials": ["Material 1", "Material 2"],
    "successCriteria": ["Criterion 1", "Criterion 2"]
  }`,

  flashcard: `{
    "type": "flashcard",
    "front": "Question or term on front of card",
    "back": "Answer or definition on back of card",
    "category": "Optional category for grouping"
  }`,

  ordering: `{
    "type": "ordering",
    "instructions": "Put these items in the correct order",
    "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
    "correctOrder": [2, 0, 3, 1],
    "explanation": "Why this order is correct"
  }`,
};

const PROMPT_TEMPLATES = {
  GENERATE_CHALLENGE: `You are an expert tutor and educational content creator. Generate engaging learning content for a student.

CONTEXT:
- Category: {{category}}
- Topic: {{topic}}
- Difficulty: {{difficulty}}
- User's Skill Level: {{skillLevel}}

CONTENT REQUIREMENTS:
{{#if customInstructions}}
User's Custom Instructions: {{customInstructions}}
{{/if}}

Generate {{numQuestions}} questions using ONLY these question types: {{questionTypes}}

For each question type, use this exact JSON structure:

{{questionStructures}}

IMPORTANT GUIDELINES:
1. Make questions engaging and relevant to the topic
2. Vary the difficulty appropriately for the skill level
3. Include helpful explanations and hints where applicable
4. For practical exercises, make them achievable and hands-on
5. Keep questions focused and clear
6. Tailor content to the specific category (e.g., for music include notation, for cooking include measurements)

Return a JSON object with this structure:
{
  "title": "A catchy title for this challenge set",
  "description": "Brief overview of what the learner will practice",
  "category": "{{category}}",
  "topic": "{{topic}}",
  "difficulty": "{{difficulty}}",
  "estimatedTime": "X minutes",
  "questions": [
    // Array of question objects following the structures above
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"]
}

Return ONLY valid JSON, no additional text.`,

  SUBMIT_FEEDBACK: `You are an encouraging and helpful tutor providing feedback on a student's work.

ORIGINAL CHALLENGE:
{{challenge}}

STUDENT'S SUBMISSION:
{{submission}}

QUESTION TYPE: {{questionType}}

Provide constructive feedback in this JSON format:
{
  "score": <number 0-100>,
  "feedback": "Detailed, encouraging feedback",
  "strengths": ["What the student did well"],
  "improvements": ["Areas to work on"],
  "correctAnswer": "The correct answer if applicable",
  "nextSteps": ["Suggested next steps for learning"],
  "encouragement": "A motivating message"
}

Be supportive and educational. Focus on growth and understanding.
Return ONLY valid JSON.`,

  LEARNING_PATH: `Create a personalized learning path for a student.

GOAL: {{goal}}
CURRENT LEVEL: {{currentLevel}}
TIME AVAILABLE: {{timeFrame}}
PREFERRED LEARNING STYLE: {{learningStyle}}

Create a structured learning path with milestones, recommended resources, and challenges.

Return JSON:
{
  "title": "Learning Path Title",
  "overview": "What this path will achieve",
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What you'll learn",
      "challengeTypes": ["Recommended question types"],
      "estimatedTime": "X hours/days"
    }
  ],
  "weeklyPlan": [
    {
      "week": 1,
      "focus": "Focus area",
      "activities": ["Activity 1", "Activity 2"]
    }
  ]
}

Return ONLY valid JSON.`,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Replace template placeholders with actual values
 */
function fillTemplate(template, data) {
  let result = template;

  // Handle conditional blocks {{#if key}}...{{/if}}
  result = result.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, key, content) => {
      return data[key] ? content : '';
    }
  );

  // Replace simple placeholders {{key}}
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(placeholder, value);
  }

  return result;
}

/**
 * Call Gemini API with error handling
 */
async function callGemini(prompt, options = {}) {
  try {
    const model = genAI.getGenerativeModel({
      model: options.model || 'gemini-2.0-flash',
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 4096,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up response - remove markdown code blocks if present
    let cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

// ============================================
// MAIN SERVICE FUNCTIONS
// ============================================

/**
 * Generate a challenge with multiple question types
 */
async function generateChallenge({
  category,
  topic,
  difficulty = 'intermediate',
  skillLevel = 'intermediate',
  questionTypes = ['mcq', 'short-answer'],
  numQuestions = 5,
  customInstructions = '',
}) {
  // Build question structures for selected types
  const selectedStructures = questionTypes
    .map((type) => `${type.toUpperCase()}:\n${QUESTION_STRUCTURES[type] || ''}`)
    .join('\n\n');

  // Get category name
  const categoryData = CATEGORIES[category];
  const categoryName = categoryData ? categoryData.name : category;

  const prompt = fillTemplate(PROMPT_TEMPLATES.GENERATE_CHALLENGE, {
    category: categoryName,
    topic,
    difficulty,
    skillLevel,
    questionTypes: questionTypes.join(', '),
    numQuestions: numQuestions.toString(),
    questionStructures: selectedStructures,
    customInstructions,
  });

  const challenge = await callGemini(prompt);

  // Add metadata
  challenge.generatedAt = new Date().toISOString();
  challenge.questionTypes = questionTypes;
  challenge.categoryId = category;

  return challenge;
}

/**
 * Submit answer and get AI feedback
 */
async function submitForFeedback({ challenge, submission, questionType }) {
  const prompt = fillTemplate(PROMPT_TEMPLATES.SUBMIT_FEEDBACK, {
    challenge: JSON.stringify(challenge, null, 2),
    submission:
      typeof submission === 'string'
        ? submission
        : JSON.stringify(submission, null, 2),
    questionType,
  });

  return await callGemini(prompt);
}

/**
 * Validate answer for auto-gradeable question types
 */
function validateAnswer(question, userAnswer) {
  const type = question.type;
  let isCorrect = false;
  let feedback = '';

  switch (type) {
    case 'mcq':
      isCorrect = userAnswer === question.correctAnswer;
      feedback = isCorrect
        ? question.explanation
        : `The correct answer was option ${question.correctAnswer + 1}: ${
            question.options[question.correctAnswer]
          }. ${question.explanation}`;
      break;

    case 'true-false':
      isCorrect = userAnswer === question.correctAnswer;
      feedback = isCorrect
        ? `Correct! ${question.explanation}`
        : `The statement is actually ${question.correctAnswer}. ${question.explanation}`;
      break;

    case 'fill-blank': {
      // Check each blank (case insensitive)
      const userBlanks = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      const correctBlanks = question.blanks;
      isCorrect = userBlanks.every(
        (ans, i) =>
          ans.toLowerCase().trim() === correctBlanks[i].toLowerCase().trim()
      );
      feedback = isCorrect
        ? 'All blanks filled correctly!'
        : `Correct answers: ${correctBlanks.join(', ')}`;
      break;
    }

    case 'ordering':
      isCorrect =
        JSON.stringify(userAnswer) === JSON.stringify(question.correctOrder);
      feedback = isCorrect
        ? `Perfect order! ${question.explanation}`
        : `The correct order was: ${question.correctOrder
            .map((i) => question.items[i])
            .join(' → ')}`;
      break;

    case 'matching': {
      const userPairs = userAnswer.map((pair) => pair.sort().join('-')).sort();
      const correctPairs = question.correctPairs
        .map((pair) => pair.sort().join('-'))
        .sort();
      isCorrect = JSON.stringify(userPairs) === JSON.stringify(correctPairs);
      feedback = isCorrect
        ? 'All pairs matched correctly!'
        : 'Some matches were incorrect. Review the correct pairs.';
      break;
    }

    default:
      // For non-auto-gradeable types, return null to indicate AI grading needed
      return null;
  }

  return {
    isCorrect,
    feedback,
    score: isCorrect ? 100 : 0,
  };
}

/**
 * Generate a personalized learning path
 */
async function generateLearningPath({
  goal,
  currentLevel = 'beginner',
  timeFrame = '4 weeks',
  learningStyle = 'mixed',
}) {
  const prompt = fillTemplate(PROMPT_TEMPLATES.LEARNING_PATH, {
    goal,
    currentLevel,
    timeFrame,
    learningStyle,
  });

  return await callGemini(prompt);
}

/**
 * Get recommended question types for a category
 */
function getRecommendedQuestionTypes(categoryId) {
  return getQuestionTypesForCategory(categoryId);
}

/**
 * Generate a single question of a specific type
 */
async function generateSingleQuestion({
  category,
  topic,
  questionType,
  difficulty = 'intermediate',
}) {
  const structure = QUESTION_STRUCTURES[questionType];
  if (!structure) {
    throw new Error(`Unknown question type: ${questionType}`);
  }

  const prompt = `Generate a single ${questionType} question about "${topic}" in the ${category} category.
Difficulty: ${difficulty}

Use this exact JSON structure:
${structure}

Return ONLY the JSON object, no additional text.`;

  return await callGemini(prompt);
}

/**
 * Get hints for a question
 */
async function getHint(question) {
  const prompt = `Given this question, provide a helpful hint that guides the learner without giving away the answer:

Question: ${JSON.stringify(question)}

Return JSON:
{
  "hint": "A helpful hint",
  "difficulty": "How much this hint helps (small/medium/large)"
}`;

  return await callGemini(prompt);
}

/**
 * Explain a concept in detail
 */
async function explainConcept({
  topic,
  category,
  depth = 'intermediate',
  includeExamples = true,
}) {
  const prompt = `Explain the concept of "${topic}" in the context of ${category}.
Depth: ${depth}
Include examples: ${includeExamples}

Return JSON:
{
  "title": "Concept title",
  "explanation": "Clear explanation",
  "keyPoints": ["Key point 1", "Key point 2"],
  "examples": ["Example 1", "Example 2"],
  "commonMistakes": ["Mistake to avoid"],
  "relatedConcepts": ["Related topic 1", "Related topic 2"]
}`;

  return await callGemini(prompt);
}

module.exports = {
  generateChallenge,
  submitForFeedback,
  validateAnswer,
  generateLearningPath,
  getRecommendedQuestionTypes,
  generateSingleQuestion,
  getHint,
  explainConcept,
  QUESTION_STRUCTURES,
  QUESTION_TYPES,
};
