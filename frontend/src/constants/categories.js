// Shared categories for goals and challenges
// SkillWise supports ALL kinds of learning - not just coding!

export const CATEGORIES = {
  // Technology & Coding
  PROGRAMMING: {
    id: 'programming',
    name: 'Programming',
    icon: '💻',
    description: 'Learn coding languages and software development',
    subcategories: [
      'JavaScript',
      'Python',
      'Java',
      'C++',
      'Rust',
      'Go',
      'TypeScript',
    ],
  },
  WEB_DEVELOPMENT: {
    id: 'web-development',
    name: 'Web Development',
    icon: '🌐',
    description: 'Build websites and web applications',
    subcategories: ['HTML/CSS', 'React', 'Vue', 'Angular', 'Node.js', 'APIs'],
  },
  DATA_SCIENCE: {
    id: 'data-science',
    name: 'Data Science',
    icon: '📊',
    description: 'Analyze data and build ML models',
    subcategories: [
      'Statistics',
      'Machine Learning',
      'Data Visualization',
      'SQL',
    ],
  },

  // Languages
  LANGUAGE_LEARNING: {
    id: 'language-learning',
    name: 'Language Learning',
    icon: '🗣️',
    description: 'Master new languages',
    subcategories: [
      'Spanish',
      'French',
      'German',
      'Japanese',
      'Mandarin',
      'Korean',
      'Italian',
      'Portuguese',
    ],
  },

  // Arts & Creative
  MUSIC: {
    id: 'music',
    name: 'Music',
    icon: '🎵',
    description: 'Learn instruments and music theory',
    subcategories: [
      'Piano',
      'Guitar',
      'Music Theory',
      'Singing',
      'Drums',
      'Composition',
    ],
  },
  ART_DESIGN: {
    id: 'art-design',
    name: 'Art & Design',
    icon: '🎨',
    description: 'Develop artistic and design skills',
    subcategories: [
      'Drawing',
      'Painting',
      'UI/UX Design',
      'Graphic Design',
      'Photography',
      '3D Modeling',
    ],
  },
  WRITING: {
    id: 'writing',
    name: 'Writing',
    icon: '✍️',
    description: 'Improve writing skills',
    subcategories: [
      'Creative Writing',
      'Technical Writing',
      'Copywriting',
      'Blogging',
      'Poetry',
    ],
  },

  // Academic
  MATHEMATICS: {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '📐',
    description: 'Build mathematical skills',
    subcategories: [
      'Algebra',
      'Calculus',
      'Statistics',
      'Geometry',
      'Linear Algebra',
    ],
  },
  SCIENCE: {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    description: 'Explore scientific topics',
    subcategories: [
      'Physics',
      'Chemistry',
      'Biology',
      'Astronomy',
      'Environmental Science',
    ],
  },
  HISTORY: {
    id: 'history',
    name: 'History',
    icon: '📚',
    description: 'Learn about historical events and periods',
    subcategories: [
      'World History',
      'American History',
      'Ancient Civilizations',
      'Modern History',
    ],
  },

  // Business & Professional
  BUSINESS: {
    id: 'business',
    name: 'Business',
    icon: '💼',
    description: 'Develop business acumen',
    subcategories: [
      'Entrepreneurship',
      'Management',
      'Finance',
      'Accounting',
      'Strategy',
    ],
  },
  MARKETING: {
    id: 'marketing',
    name: 'Marketing',
    icon: '📈',
    description: 'Master marketing techniques',
    subcategories: [
      'Digital Marketing',
      'Social Media',
      'SEO',
      'Content Marketing',
      'Analytics',
    ],
  },
  LEADERSHIP: {
    id: 'leadership',
    name: 'Leadership',
    icon: '👔',
    description: 'Build leadership capabilities',
    subcategories: [
      'Team Management',
      'Communication',
      'Decision Making',
      'Conflict Resolution',
    ],
  },

  // Lifestyle & Personal
  COOKING: {
    id: 'cooking',
    name: 'Cooking',
    icon: '🍳',
    description: 'Learn culinary skills',
    subcategories: [
      'Baking',
      'International Cuisine',
      'Healthy Cooking',
      'Meal Prep',
      'BBQ & Grilling',
    ],
  },
  FITNESS: {
    id: 'fitness',
    name: 'Fitness',
    icon: '💪',
    description: 'Improve physical fitness',
    subcategories: [
      'Strength Training',
      'Cardio',
      'Yoga',
      'Running',
      'Swimming',
      'Martial Arts',
    ],
  },
  PERSONAL_DEVELOPMENT: {
    id: 'personal-development',
    name: 'Personal Development',
    icon: '🧠',
    description: 'Grow as a person',
    subcategories: [
      'Productivity',
      'Time Management',
      'Mindfulness',
      'Public Speaking',
      'Goal Setting',
    ],
  },
  FINANCE: {
    id: 'personal-finance',
    name: 'Personal Finance',
    icon: '💰',
    description: 'Master money management',
    subcategories: [
      'Budgeting',
      'Investing',
      'Saving',
      'Retirement Planning',
      'Taxes',
    ],
  },

  // Hobbies & Crafts
  CRAFTS: {
    id: 'crafts',
    name: 'Crafts & DIY',
    icon: '🔨',
    description: 'Learn hands-on crafting skills',
    subcategories: [
      'Woodworking',
      'Knitting',
      'Sewing',
      'Pottery',
      'Jewelry Making',
    ],
  },
  GARDENING: {
    id: 'gardening',
    name: 'Gardening',
    icon: '🌱',
    description: 'Develop green thumb skills',
    subcategories: [
      'Indoor Plants',
      'Vegetable Garden',
      'Landscaping',
      'Composting',
    ],
  },

  OTHER: {
    id: 'other',
    name: 'Other',
    icon: '📝',
    description: 'Other learning goals',
    subcategories: [],
  },
};

// Get flat list of category names for dropdowns
export const getCategoryList = () => {
  return Object.values(CATEGORIES).map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    description: cat.description,
  }));
};

// Get category by ID
export const getCategoryById = (id) => {
  return Object.values(CATEGORIES).find((cat) => cat.id === id);
};

// Get subcategories for a category
export const getSubcategories = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category?.subcategories || [];
};

// Question types supported by AI tutor
export const QUESTION_TYPES = {
  MCQ: {
    id: 'mcq',
    name: 'Multiple Choice',
    icon: '🔘',
    description: 'Choose the correct answer from options',
  },
  FILL_BLANK: {
    id: 'fill-blank',
    name: 'Fill in the Blank',
    icon: '📝',
    description: 'Complete the sentence with the correct word',
  },
  TRUE_FALSE: {
    id: 'true-false',
    name: 'True or False',
    icon: '✓✗',
    description: 'Determine if statements are true or false',
  },
  MATCHING: {
    id: 'matching',
    name: 'Matching',
    icon: '🔗',
    description: 'Match items from two columns',
  },
  SHORT_ANSWER: {
    id: 'short-answer',
    name: 'Short Answer',
    icon: '💬',
    description: 'Write a brief response',
  },
  LONG_RESPONSE: {
    id: 'long-response',
    name: 'Long Response',
    icon: '📄',
    description: 'Write a detailed explanation or essay',
  },
  CODE_CHALLENGE: {
    id: 'code-challenge',
    name: 'Code Challenge',
    icon: '💻',
    description: 'Write code to solve a problem',
  },
  PRACTICAL: {
    id: 'practical',
    name: 'Practical Task',
    icon: '🎯',
    description: 'Complete a hands-on task and submit evidence',
  },
  FLASHCARD: {
    id: 'flashcard',
    name: 'Flashcard Review',
    icon: '🃏',
    description: 'Review terms and definitions',
  },
  ORDERING: {
    id: 'ordering',
    name: 'Put in Order',
    icon: '📋',
    description: 'Arrange items in the correct sequence',
  },
};

// Get question types as list
export const getQuestionTypeList = () => {
  return Object.values(QUESTION_TYPES);
};

export default CATEGORIES;
