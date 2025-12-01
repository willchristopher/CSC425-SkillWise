// Shared constants for SkillWise
// Categories and question types for goals and challenges

const CATEGORIES = {
  // Technology & Coding
  programming: { name: 'Programming', icon: '💻' },
  'web-development': { name: 'Web Development', icon: '🌐' },
  'data-science': { name: 'Data Science', icon: '📊' },

  // Languages
  'language-learning': { name: 'Language Learning', icon: '🗣️' },

  // Arts & Creative
  music: { name: 'Music', icon: '🎵' },
  'art-design': { name: 'Art & Design', icon: '🎨' },
  writing: { name: 'Writing', icon: '✍️' },

  // Academic
  mathematics: { name: 'Mathematics', icon: '📐' },
  science: { name: 'Science', icon: '🔬' },
  history: { name: 'History', icon: '📚' },

  // Business & Professional
  business: { name: 'Business', icon: '💼' },
  marketing: { name: 'Marketing', icon: '📈' },
  leadership: { name: 'Leadership', icon: '👔' },

  // Lifestyle
  cooking: { name: 'Cooking', icon: '🍳' },
  fitness: { name: 'Fitness', icon: '💪' },
  'personal-development': { name: 'Personal Development', icon: '🧠' },
  'personal-finance': { name: 'Personal Finance', icon: '💰' },

  // Hobbies
  crafts: { name: 'Crafts & DIY', icon: '🔨' },
  gardening: { name: 'Gardening', icon: '🌱' },

  other: { name: 'Other', icon: '📝' },
};

// Question types for AI-generated challenges
const QUESTION_TYPES = {
  MCQ: 'mcq', // Multiple choice question
  FILL_BLANK: 'fill-blank', // Fill in the blank
  TRUE_FALSE: 'true-false', // True or false
  MATCHING: 'matching', // Match items from two columns
  SHORT_ANSWER: 'short-answer', // Brief written response
  LONG_RESPONSE: 'long-response', // Essay/detailed response
  CODE_CHALLENGE: 'code-challenge', // Programming challenge
  PRACTICAL: 'practical', // Hands-on task with evidence submission
  FLASHCARD: 'flashcard', // Term/definition review
  ORDERING: 'ordering', // Put items in correct sequence
};

const QUESTION_TYPE_DETAILS = {
  [QUESTION_TYPES.MCQ]: {
    name: 'Multiple Choice',
    icon: '🔘',
    description: 'Choose the correct answer from options',
    suitable_for: ['all'],
  },
  [QUESTION_TYPES.FILL_BLANK]: {
    name: 'Fill in the Blank',
    icon: '📝',
    description: 'Complete the sentence with the correct word',
    suitable_for: ['language-learning', 'programming', 'mathematics'],
  },
  [QUESTION_TYPES.TRUE_FALSE]: {
    name: 'True or False',
    icon: '✓✗',
    description: 'Determine if statements are true or false',
    suitable_for: ['all'],
  },
  [QUESTION_TYPES.MATCHING]: {
    name: 'Matching',
    icon: '🔗',
    description: 'Match items from two columns',
    suitable_for: ['language-learning', 'history', 'science'],
  },
  [QUESTION_TYPES.SHORT_ANSWER]: {
    name: 'Short Answer',
    icon: '💬',
    description: 'Write a brief response',
    suitable_for: ['all'],
  },
  [QUESTION_TYPES.LONG_RESPONSE]: {
    name: 'Long Response',
    icon: '📄',
    description: 'Write a detailed explanation or essay',
    suitable_for: ['writing', 'history', 'science', 'business'],
  },
  [QUESTION_TYPES.CODE_CHALLENGE]: {
    name: 'Code Challenge',
    icon: '💻',
    description: 'Write code to solve a problem',
    suitable_for: ['programming', 'web-development', 'data-science'],
  },
  [QUESTION_TYPES.PRACTICAL]: {
    name: 'Practical Task',
    icon: '🎯',
    description: 'Complete a hands-on task and submit evidence',
    suitable_for: [
      'cooking',
      'fitness',
      'music',
      'art-design',
      'crafts',
      'gardening',
    ],
  },
  [QUESTION_TYPES.FLASHCARD]: {
    name: 'Flashcard Review',
    icon: '🃏',
    description: 'Review terms and definitions',
    suitable_for: ['language-learning', 'science', 'history'],
  },
  [QUESTION_TYPES.ORDERING]: {
    name: 'Put in Order',
    icon: '📋',
    description: 'Arrange items in the correct sequence',
    suitable_for: ['history', 'cooking', 'programming'],
  },
};

// Get recommended question types for a category
const getQuestionTypesForCategory = (categoryId) => {
  const types = [];
  for (const [typeId, details] of Object.entries(QUESTION_TYPE_DETAILS)) {
    if (
      details.suitable_for.includes('all') ||
      details.suitable_for.includes(categoryId)
    ) {
      types.push({ id: typeId, ...details });
    }
  }
  return types;
};

module.exports = {
  CATEGORIES,
  QUESTION_TYPES,
  QUESTION_TYPE_DETAILS,
  getQuestionTypesForCategory,
};
