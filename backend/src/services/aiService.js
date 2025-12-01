// AI integration with Google Gemini API using axios
const axios = require('axios');

/**
 * Call Google Gemini API with a prompt
 * @param {string} systemPrompt - System role instructions
 * @param {string} userPrompt - User message/prompt
 * @param {object} options - Additional options (temperature, maxOutputTokens, etc.)
 * @returns {Promise<string>} AI response content
 */
const callGemini = async (systemPrompt, userPrompt, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  // Gemini model options: gemini-2.5-flash, gemini-2.5-pro, gemini-flash-latest
  const model = options.model || 'gemini-2.5-flash';

  // Combine system and user prompts for Gemini
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: combinedPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 1000,
      topP: options.topP || 0.95,
      topK: options.topK || 40,
    },
  };

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      },
    );

    // Extract text from Gemini response
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text;
    }

    throw new Error('Invalid response format from Gemini API');
  } catch (error) {
    console.error('Error calling Gemini API:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message ||
      'Failed to get response from AI service',
    );
  }
};

const aiService = {
  /**
   * Generate AI feedback for a code submission
   * @param {string} submissionText - The code or text submitted by the user
   * @param {object} challengeContext - Context about the challenge (title, description, requirements)
   * @returns {Promise<string>} AI-generated feedback
   */
  generateFeedback: async (submissionText, challengeContext) => {
    const systemPrompt = `You are an expert programming tutor providing constructive feedback on student code submissions. 
    Be encouraging, specific, and educational. Point out both strengths and areas for improvement.
    Focus on code quality, best practices, and learning opportunities.`;

    const userPrompt = `Challenge: ${challengeContext.title}
    
Description: ${challengeContext.description}

Student's Submission:
${submissionText}

Please provide detailed, constructive feedback on this submission. Include:
1. What was done well
2. Areas for improvement
3. Specific suggestions for better implementation
4. Any best practices or concepts the student should learn`;

    return await callGemini(systemPrompt, userPrompt, {
      maxOutputTokens: 1500,
      temperature: 0.7,
    });
  },

  /**
   * Generate hints for a challenge without giving away the solution
   * @param {object} challenge - Challenge details (title, description, difficulty)
   * @param {object} userProgress - User's current progress and attempts
   * @returns {Promise<string>} AI-generated hints
   */
  generateHints: async (challenge, userProgress) => {
    const systemPrompt = `You are a helpful programming tutor. Provide hints that guide the student toward the solution 
    without giving away the answer directly. Ask thought-provoking questions and suggest approaches to consider.`;

    const userPrompt = `Challenge: ${challenge.title}
    
Description: ${challenge.description}
Difficulty: ${challenge.difficulty}

Student's attempts: ${userProgress.attempts || 0}
${userProgress.lastAttempt ? `Last attempt summary: ${userProgress.lastAttempt}` : ''}

Please provide 2-3 helpful hints that will guide the student without revealing the complete solution.`;

    return await callGemini(systemPrompt, userPrompt, {
      maxOutputTokens: 800,
      temperature: 0.8,
    });
  },

  /**
   * Analyze user's learning patterns and provide insights
   * @param {string} userId - User ID
   * @param {object} learningData - User's learning history and statistics
   * @returns {Promise<object>} Analysis with insights and recommendations
   */
  analyzePattern: async (userId, learningData) => {
    const systemPrompt = `You are an educational data analyst. Analyze student learning patterns and provide 
    actionable insights to help them improve their learning journey. Be specific and encouraging.`;

    const userPrompt = `Student Learning Data:
    - Total challenges completed: ${learningData.completedChallenges}
    - Success rate: ${learningData.successRate}%
    - Strong areas: ${learningData.strongAreas?.join(', ') || 'None yet'}
    - Areas needing work: ${learningData.weakAreas?.join(', ') || 'None yet'}
    - Average time per challenge: ${learningData.avgTimePerChallenge} minutes
    - Learning streak: ${learningData.streak} days
    - Recent activity: ${learningData.recentActivity}

Please analyze this learning pattern and provide:
1. Key strengths observed
2. Areas that need attention
3. Specific recommendations for improvement
4. Suggested learning strategies`;

    const response = await callGemini(systemPrompt, userPrompt, {
      maxOutputTokens: 1200,
      temperature: 0.7,
    });

    return {
      analysis: response,
      generatedAt: new Date().toISOString(),
      userId,
    };
  },

  /**
   * Suggest next challenges based on user's skill level and progress
   * @param {object} userProfile - User's skill profile and preferences
   * @returns {Promise<object>} Challenge suggestions with reasoning
   */
  suggestNextChallenges: async (userProfile) => {
    const systemPrompt = `You are a personalized learning advisor. Recommend programming challenges 
    that match the student's current skill level and help them progress. Consider their interests and goals.`;

    const userPrompt = `Student Profile:
    - Current skill level: ${userProfile.skillLevel}
    - Completed challenges: ${userProfile.completedCount}
    - Interests: ${userProfile.interests?.join(', ') || 'General programming'}
    - Goals: ${userProfile.goals || 'Improve programming skills'}
    - Recent topics: ${userProfile.recentTopics?.join(', ') || 'Various'}
    - Preferred difficulty: ${userProfile.preferredDifficulty || 'Medium'}

Based on this profile, suggest 3-5 specific types of challenges they should tackle next. 
For each suggestion, briefly explain why it would be beneficial for their learning journey.`;

    const response = await callGemini(systemPrompt, userPrompt, {
      maxOutputTokens: 1000,
      temperature: 0.8,
    });

    return {
      suggestions: response,
      generatedAt: new Date().toISOString(),
      basedOnProfile: {
        skillLevel: userProfile.skillLevel,
        completedCount: userProfile.completedCount,
      },
    };
  },
};


// --- OpenAI integration for challenge generation ---
const { Configuration, OpenAIApi } = (() => {
  try {
    return require('openai');
  } catch {
    return {};
  }
})();

/**
 * Generate a programming challenge using OpenAI (ChatGPT)
 * @param {string} prompt - The prompt to send to OpenAI
 * @returns {Promise<string>} Raw AI response (string)
 */
aiService.generateChallenge = async (prompt) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set in environment');
  if (!Configuration || !OpenAIApi) throw new Error('openai package not installed');

  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  const response = await openai.createChatCompletion({
    model,
    messages: [
      { role: 'system', content: 'You are an expert programming instructor.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });
  // Return the raw text content
  return response.data.choices[0].message.content;
};

/**
 * Parse the AI response into { title, description, difficulty, hints }
 * @param {string} aiRawResponse
 * @returns {object|null}
 */
aiService.parseChallengeResponse = (aiRawResponse) => {
  try {
    // Try to parse as JSON
    const obj = JSON.parse(aiRawResponse);
    if (!obj.title || !obj.description || !obj.difficulty) return null;
    return {
      title: obj.title,
      description: obj.description,
      difficulty: obj.difficulty,
      hints: Array.isArray(obj.hints) ? obj.hints : [],
    };
  } catch {
    // Try to extract JSON from text
    const match = aiRawResponse.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const obj = JSON.parse(match[0]);
        if (!obj.title || !obj.description || !obj.difficulty) return null;
        return {
          title: obj.title,
          description: obj.description,
          difficulty: obj.difficulty,
          hints: Array.isArray(obj.hints) ? obj.hints : [],
        };
      } catch {}
    }
    return null;
  }
};

module.exports = aiService;
