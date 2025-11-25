// AI integration with Google Gemini API using the official SDK
const { GoogleGenAI } = require('@google/genai');

// Initialize the Google GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
});

/**
 * Call Google Gemini API with a prompt
 * @param {string} systemPrompt - System role instructions
 * @param {string} userPrompt - User message/prompt
 * @param {object} options - Additional options (temperature, maxOutputTokens, etc.)
 * @returns {Promise<string>} AI response content
 */
const callGemini = async (systemPrompt, userPrompt, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY is not configured in environment variables');
  }

  // Gemini model options: gemini-2.5-flash, gemini-2.5-pro, gemini-flash-latest
  const model = options.model || 'gemini-2.5-flash';

  // Combine system and user prompts for Gemini
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: combinedPrompt,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1000,
        topP: options.topP || 0.95,
        topK: options.topK || 40,
      }
    });

    if (response && response.text) {
      return response.text();
    }

    throw new Error('Invalid response format from Gemini API');
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    
    // Handle specific error cases
    if (error.message.includes('API key')) {
      throw new Error('Invalid or missing API key for Gemini AI service');
    }
    
    throw new Error(
      error.message || 'Failed to get response from AI service'
    );
  }
};

const aiService = {
  /**
   * Generate AI feedback for a code submission
   */
  generateFeedback: async (submissionText, challengeContext) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return `**Demo Mode - AI Feedback**

✅ **What was done well:**
- Your code structure is clean and readable
- Good use of meaningful variable/function names
- Follows basic JavaScript syntax correctly

🔧 **Areas for improvement:**
- Consider adding error handling for edge cases
- Add comments to explain complex logic
- Think about input validation

💡 **Suggestions:**
- Try breaking down complex functions into smaller, reusable parts
- Consider using modern ES6+ features like arrow functions
- Look into testing your code with different inputs

📚 **Learning opportunities:**
- Research best practices for ${challengeContext.title || 'this type of problem'}
- Practice writing unit tests
- Learn about code optimization techniques

*Note: This is a demo response. Configure GEMINI_API_KEY environment variable to get real AI feedback.*`;
    }

    const systemPrompt = `You are an expert programming tutor providing constructive feedback on student code submissions. Be encouraging, specific, and educational.`;

    const userPrompt = `Challenge: ${challengeContext.title}
Description: ${challengeContext.description}
Student's Submission: ${submissionText}

Please provide detailed, constructive feedback.`;

    return await callGemini(systemPrompt, userPrompt, {
      maxOutputTokens: 1500,
      temperature: 0.7,
    });
  },

  /**
   * Generate hints for a challenge
   */
  generateHints: async (challenge, userProgress) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return `**Demo Mode - Hints**

🤔 **Think about this:**
- What are the key steps needed to solve this problem?
- Have you broken down the problem into smaller parts?

💭 **Consider:**
- What data structures would be most helpful here?
- Are there any built-in functions that could simplify your solution?

*Note: Configure GEMINI_API_KEY for personalized AI hints.*`;
    }

    const systemPrompt = `You are a helpful programming tutor. Provide hints without giving away the answer directly.`;
    const userPrompt = `Challenge: ${challenge.title}\nDescription: ${challenge.description}\nPlease provide helpful hints.`;

    return await callGemini(systemPrompt, userPrompt, {
      maxOutputTokens: 800,
      temperature: 0.8,
    });
  },

  /**
   * Generate a new coding challenge
   */
  generateChallenge: async (options = {}) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return {
        title: "Array Sum Calculator",
        description: "Write a function that calculates the sum of all numbers in an array.",
        difficulty: "Easy",
        requirements: ["Function should accept an array of numbers", "Return the sum of all elements"],
        examples: [{ input: "[1, 2, 3, 4, 5]", output: "15" }],
        tags: ["arrays", "loops", "basic"],
        estimatedTime: "15 minutes"
      };
    }

    const systemPrompt = `You are an expert coding challenge creator. Generate engaging programming challenges.`;
    const userPrompt = `Create a coding challenge. Topic: ${options.topic || 'Any'}, Difficulty: ${options.difficulty || 'Medium'}`;

    const response = await callGemini(systemPrompt, userPrompt, {
      maxOutputTokens: 1200,
      temperature: 0.9,
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        title: "Generated Challenge",
        description: response,
        difficulty: options.difficulty || 'Medium',
        requirements: ["Implement the solution as described"],
        examples: [],
        tags: ["coding", "practice"],
        estimatedTime: "30 minutes"
      };
    }
  }
};

module.exports = aiService;
