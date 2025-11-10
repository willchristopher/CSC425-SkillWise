// AI integration with OpenAI API for feedback and learning assistance
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Lazy initialization to prevent startup crashes
let geminiClient = null;

/**
 * Get or initialize the Gemini client
 * @returns {GoogleGenerativeAI} Gemini client instance
 * @throws {Error} If GEMINI_API_KEY is not configured
 */
const getGeminiClient = () => {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing');
    }

    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  
  return geminiClient;
};

/**
 * Parse AI-generated questions into structured format
 * @param {string} questionsText - Raw text from AI
 * @returns {Array} Structured questions array
 */
const parseInteractiveQuestions = (questionsText) => {
  const questions = [];
  const questionBlocks = questionsText.split('---QUESTION START---');

  for (let i = 1; i < questionBlocks.length; i++) {
    const block = questionBlocks[i].split('---QUESTION END---')[0];
    if (!block) continue;

    const question = {
      id: i,
      type: extractField(block, 'Type'),
      difficulty: extractField(block, 'Difficulty'),
      question: extractField(block, 'Question'),
      answer: extractField(block, 'Answer'),
      explanation: extractField(block, 'Explanation'),
      hint: extractField(block, 'Hint'),
    };

    // Extract options for MCQ
    if (question.type === 'MCQ') {
      question.options = extractOptions(block);
    }

    // Only add if we have essential fields
    if (question.question && question.answer) {
      questions.push(question);
    }
  }

  return questions;
};

/**
 * Extract a field value from question block
 */
const extractField = (block, fieldName) => {
  const regex = new RegExp(`${fieldName}:\\s*(.+?)(?=\\n[A-Z][a-z]+:|\\n\\n|$)`, 's');
  const match = block.match(regex);
  return match ? match[1].trim() : '';
};

/**
 * Extract MCQ options from question block
 */
const extractOptions = (block) => {
  const optionsMatch = block.match(/Options:\s*((?:[A-D]\).*?\n?)+)/s);
  if (!optionsMatch) return [];

  const optionsText = optionsMatch[1];
  const options = [];
  const optionRegex = /([A-D])\)\s*(.+?)(?=\n[A-D]\)|$)/gs;
  let match;

  while ((match = optionRegex.exec(optionsText)) !== null) {
    options.push({
      letter: match[1],
      text: match[2].trim()
    });
  }

  return options;
};

const aiService = {
  /**
   * Generate AI feedback for code submission
   * @param {string} submissionText - User's code submission
   * @param {Object} challengeContext - Challenge details (title, description, difficulty)
   * @returns {Object} AI-generated feedback
   */
  generateFeedback: async (submissionText, challengeContext = {}) => {
    const client = getGeminiClient();
    if (!client) {
      throw new Error('Gemini API key not configured');
    }

    if (!submissionText || submissionText.trim().length === 0) {
      throw new Error('Submission text is required');
    }

    const prompt = `You are an expert programming tutor. Analyze the following code submission and provide constructive feedback.

Challenge: ${challengeContext.title || 'Programming Challenge'}
Difficulty: ${challengeContext.difficulty || 'Medium'}
Description: ${challengeContext.description || 'Code review'}

Student's Code:
\`\`\`
${submissionText}
\`\`\`

Provide feedback in the following format:
1. Strengths: What the student did well
2. Areas for Improvement: Specific issues or improvements needed
3. Suggestions: Concrete steps to improve the code
4. Overall Assessment: Brief summary

Keep feedback encouraging and educational.`;

    try {
      const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
      const result = await model.generateContent(prompt);
      const feedback = result.response.text();

      return {
        feedback,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key');
      } else if (error.message?.includes('RATE_LIMIT')) {
        throw new Error('Gemini API rate limit exceeded. Please try again later.');
      } else if (error.status === 500) {
        throw new Error('Gemini service temporarily unavailable');
      }
      throw new Error(`AI service error: ${error.message}`);
    }
  },

  /**
   * Generate hints for a challenge
   * @param {string} challengeTitle - Challenge title
   * @param {string} challengeDescription - Challenge description
   * @param {string} userProgress - Optional user's current code
   * @returns {Object} AI-generated hints
   */
  generateHints: async (challengeTitle, challengeDescription, userProgress = '') => {
    const client = getGeminiClient();
    if (!client) {
      throw new Error('Gemini API key not configured');
    }

    let prompt = `You are a helpful programming tutor. A student is working on this challenge:

Challenge: ${challengeTitle}
Description: ${challengeDescription}`;

    if (userProgress) {
      prompt += `\n\nStudent's current code:\n\`\`\`\n${userProgress}\n\`\`\``;
    }

    prompt += `\n\nProvide 3-4 helpful hints to guide the student without giving away the complete solution. Each hint should progressively guide them toward the solution.`;

    try {
      const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
      const result = await model.generateContent(prompt);
      const hints = result.response.text();

      return {
        hints,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key');
      }
      throw new Error(`AI service error: ${error.message}`);
    }
  },

  /**
   * Analyze learning patterns and provide insights
   * @param {Object} learningData - User's learning statistics
   * @returns {Object} AI analysis
   */
  analyzePattern: async (learningData) => {
    const client = getGeminiClient();
    if (!client) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Analyze this student's learning data and provide insights:

Completed Challenges: ${learningData.completedChallenges || 0}
Success Rate: ${learningData.successRate || 0}%
Strengths: ${learningData.strengths?.join(', ') || 'N/A'}
Areas Needing Work: ${learningData.weaknesses?.join(', ') || 'N/A'}
Recent Activity: ${learningData.recentActivity || 'Limited data'}

Provide:
1. Learning Progress Summary
2. Recommended Focus Areas
3. Motivational Insight`;

    try {
      const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
      const result = await model.generateContent(prompt);
      const analysis = result.response.text();

      return {
        analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  },

  /**
   * Suggest next challenges based on user skill level
   * @param {Object} userProfile - User's skill profile
   * @returns {Object} Challenge suggestions
   */
  suggestNextChallenges: async (userProfile) => {
    const client = getGeminiClient();
    if (!client) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Based on this student's profile, suggest 3-5 appropriate next challenges:

Skill Level: ${userProfile.skillLevel || 'Beginner'}
Completed Topics: ${userProfile.completedTopics?.join(', ') || 'None'}
Preferred Languages: ${userProfile.languages?.join(', ') || 'Any'}
Learning Goals: ${userProfile.goals || 'General programming'}

Suggest challenges that:
1. Match their current skill level
2. Build on completed topics
3. Introduce new relevant concepts
4. Align with their goals

Format as a numbered list with challenge types.`;

    try {
      const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
      const result = await model.generateContent(prompt);
      const suggestions = result.response.text();

      return {
        suggestions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  },

  /**
   * Generate personalized practice questions for a learning goal
   * @param {Object} goal - User's learning goal
   * @returns {Object} AI-generated practice questions with interactive elements
   */
  generatePracticeQuestions: async (goal) => {
    const client = getGeminiClient();
    if (!client) {
      throw new Error('Gemini API key not configured');
    }

    if (!goal || !goal.title) {
      throw new Error('Goal information is required');
    }

    // Create personalized prompt based on difficulty
    const difficultyInstructions = {
      easy: 'Create beginner-friendly questions with clear explanations. Focus on fundamental concepts.',
      medium: 'Create intermediate-level questions that require practical application. Mix theory and practice.',
      hard: 'Create advanced questions that require deep understanding and problem-solving. Include edge cases and complex scenarios.'
    };

    const prompt = `You are an expert ${goal.category || 'programming'} educator. Generate 5 interactive practice questions for: "${goal.title}"

**Goal Details:**
- Topic: ${goal.title}
- Description: ${goal.description || 'Master this topic'}
- Difficulty: ${goal.difficulty || 'medium'}
- Category: ${goal.category || 'programming'}

**Instructions:** ${difficultyInstructions[goal.difficulty] || difficultyInstructions.medium}

**Create exactly 5 questions using these formats:**

1. **Multiple Choice Question (MCQ)** - Test conceptual understanding
2. **Fill in the Blank** - Test syntax and terminology knowledge  
3. **True/False with Explanation** - Test understanding of key concepts
4. **Code Output Prediction** - Test practical understanding
5. **Problem-Solving Challenge** - Apply knowledge to solve a real problem

**For each question, use this EXACT format:**

---QUESTION START---
Type: [MCQ|FILL_BLANK|TRUE_FALSE|CODE_OUTPUT|PROBLEM_SOLVING]
Difficulty: [Easy|Medium|Hard]
Question: [Your question here]

[For MCQ only:]
Options:
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]

Answer: [Correct answer - for MCQ use letter, for FILL_BLANK use exact answer, for TRUE_FALSE use True/False]
Explanation: [Detailed explanation of why this is correct and common mistakes to avoid]
Hint: [A helpful hint without giving away the answer]
---QUESTION END---

Make questions specific to "${goal.title}" in ${goal.category}. Ensure answers are precise and explanations are educational.`;

    try {
      const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
      const result = await model.generateContent(prompt);
      const questionsText = result.response.text();

      // Parse the questions into structured format
      const questions = parseInteractiveQuestions(questionsText);

      return {
        goalTitle: goal.title,
        difficulty: goal.difficulty,
        category: goal.category,
        questions: questions,
        rawText: questionsText, // Keep raw text as backup
        generatedAt: new Date().toISOString(),
        isAIGenerated: true,
        totalQuestions: questions.length,
      };
    } catch (error) {
      // Check for rate limiting or API errors
      if (error.message?.includes('429') || error.message?.includes('Resource exhausted')) {
        throw new Error('AI service is temporarily unavailable due to rate limits. Please try again in a few minutes.');
      }
      
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('AI service configuration error. Please contact support.');
      }
      
      throw new Error(`Failed to generate practice questions: ${error.message}`);
    }
  },

  /**
   * Generate a personalized study plan for a goal
   * @param {Object} goal - User's learning goal
   * @returns {Object} AI-generated study plan
   */
  generateStudyPlan: async (goal) => {
    const client = getGeminiClient();
    if (!client) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Create a personalized study plan to help a student achieve this learning goal:

Goal: ${goal.title}
Description: ${goal.description || 'Not provided'}
Difficulty: ${goal.difficulty || 'medium'}
Target Date: ${goal.targetCompletionDate || 'Flexible'}
Current Progress: ${goal.currentProgress || 0}%

Create a study plan with:
1. Week-by-week breakdown
2. Key topics to cover
3. Practice exercises
4. Milestones to track progress
5. Resources to use

Make it actionable and achievable.`;

    try {
      const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
      const result = await model.generateContent(prompt);
      const studyPlan = result.response.text();

      return {
        goalTitle: goal.title,
        studyPlan,
        generatedAt: new Date().toISOString(),
        isAIGenerated: true,
      };
    } catch (error) {
      // Handle rate limiting with fallback content
      if (error.message?.includes('429') || error.message?.includes('Resource exhausted') || error.message?.includes('RATE_LIMIT')) {
        console.warn('⚠️ Gemini API rate limit hit, providing fallback study plan');
        return {
          goalTitle: goal.title,
          studyPlan: `**Study Plan for: ${goal.title}**

**Note:** AI service is temporarily rate-limited. Here's a basic study plan framework:

**Week 1-2: Foundations**
- Research and understand the basics of ${goal.title}
- Watch tutorial videos and read documentation
- Set up your development environment
- Complete 2-3 beginner exercises

**Week 3-4: Practice & Application**
- Build small projects using ${goal.title}
- Practice coding challenges related to this topic
- Review common patterns and best practices
- Join online communities for support

**Week 5-6: Advanced Concepts**
- Explore advanced features and techniques
- Optimize and refactor your practice projects
- Read case studies and real-world applications
- Start building a portfolio project

**Week 7-8: Mastery & Review**
- Complete a comprehensive project
- Teach the concept to others (blog, video, etc.)
- Review and fill knowledge gaps
- Prepare for assessments or certifications

**Milestones:**
- ✅ Complete basic tutorial
- ✅ Build first working project
- ✅ Solve 10+ practice problems
- ✅ Create portfolio project
- ✅ Achieve ${goal.title} mastery

💡 **Tip:** Try generating an AI study plan again in a few minutes for a personalized learning path!`,
          generatedAt: new Date().toISOString(),
          isAIGenerated: false,
          rateLimited: true,
        };
      }
      
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key');
      }
      
      throw new Error(`AI service error: ${error.message}`);
    }
  },
};

module.exports = aiService;