// AI integration with Google Gemini API using axios
const axios = require('axios');
const { query } = require('../database/connection');
const { getPrompt, validateResponse } = require('../utils/promptTemplates');

/**
 * Log AI interaction to database
 * @param {object} logData - Data to log
 * @returns {Promise<void>}
 */
const logAIInteraction = async (logData) => {
  try {
    await query(
      `
      INSERT INTO ai_interaction_logs (
        user_id, endpoint, prompt_text, system_prompt, response_text,
        model, temperature, max_tokens, tokens_used, response_time_ms,
        status, error_message, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `,
      [
        logData.userId || null,
        logData.endpoint,
        logData.promptText,
        logData.systemPrompt,
        logData.responseText || null,
        logData.model,
        logData.temperature,
        logData.maxTokens,
        logData.tokensUsed || null,
        logData.responseTimeMs,
        logData.status,
        logData.errorMessage || null,
        logData.metadata ? JSON.stringify(logData.metadata) : null,
      ]
    );
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error('Failed to log AI interaction:', error);
  }
};

/**
 * Call Google Gemini API with a prompt
 * @param {string} systemPrompt - System role instructions
 * @param {string} userPrompt - User message/prompt
 * @param {object} options - Additional options (temperature, maxOutputTokens, etc.)
 * @returns {Promise<string>} AI response content
 */
const callGemini = async (systemPrompt, userPrompt, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const startTime = Date.now();

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in environment variables'
    );
  }

  // Gemini model options: gemini-2.5-flash, gemini-2.5-pro, gemini-flash-latest
  const model = options.model || 'gemini-2.5-flash';
  const temperature = options.temperature || 0.7;
  const maxOutputTokens = options.maxOutputTokens || 1000;

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
      temperature,
      maxOutputTokens,
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
        timeout: 60000, // 60 second timeout for longer submissions
      }
    );

    const responseTime = Date.now() - startTime;

    // Log the full response for debugging
    console.log('Gemini API response:', JSON.stringify(response.data, null, 2));

    // Extract text from Gemini response
    const candidate = response.data?.candidates?.[0];
    const content = candidate?.content;
    const finishReason = candidate?.finishReason;

    // Check if response was truncated due to MAX_TOKENS before any text was generated
    // This happens with Gemini 2.5 models that use "thinking tokens"
    if (
      finishReason === 'MAX_TOKENS' &&
      (!content?.parts || !content.parts[0]?.text)
    ) {
      console.error(
        'Response exhausted token budget during thinking phase. Increase maxOutputTokens.'
      );
      throw new Error('AI response was too short. Please try again.');
    }

    if (content?.parts?.[0]?.text) {
      const responseText = content.parts[0].text;
      const tokensUsed = response.data?.usageMetadata?.totalTokenCount;

      // Warn if response was truncated due to MAX_TOKENS
      if (finishReason === 'MAX_TOKENS') {
        console.warn(
          '⚠️  Response truncated: MAX_TOKENS limit reached. Consider increasing maxOutputTokens.'
        );
      }

      // Log successful interaction (if endpoint provided in options)
      if (options.endpoint) {
        await logAIInteraction({
          userId: options.userId,
          endpoint: options.endpoint,
          promptText: userPrompt,
          systemPrompt,
          responseText,
          model,
          temperature,
          maxTokens: maxOutputTokens,
          tokensUsed,
          responseTimeMs: responseTime,
          status: finishReason === 'MAX_TOKENS' ? 'truncated' : 'success',
          metadata: {
            ...options.metadata,
            finishReason,
          },
        });
      }

      return responseText;
    }

    // Check if content was blocked
    if (response.data?.promptFeedback?.blockReason) {
      const errorMsg = `Content blocked: ${response.data.promptFeedback.blockReason}`;

      if (options.endpoint) {
        await logAIInteraction({
          userId: options.userId,
          endpoint: options.endpoint,
          promptText: userPrompt,
          systemPrompt,
          model,
          temperature,
          maxTokens: maxOutputTokens,
          responseTimeMs: responseTime,
          status: 'blocked',
          errorMessage: errorMsg,
          metadata: options.metadata,
        });
      }

      throw new Error(errorMsg);
    }

    console.error('Unexpected Gemini response structure:', response.data);
    throw new Error('Invalid response format from Gemini API');
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Log the full error details
    if (error.response) {
      console.error('Gemini API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('Gemini API Error - No Response:', error.message);
    } else {
      console.error('Gemini API Error:', error.message);
    }

    // Log failed interaction
    if (options.endpoint) {
      await logAIInteraction({
        userId: options.userId,
        endpoint: options.endpoint,
        promptText: userPrompt,
        systemPrompt,
        model,
        temperature,
        maxTokens: maxOutputTokens,
        responseTimeMs: responseTime,
        status: 'error',
        errorMessage: error.response?.data?.error?.message || error.message,
        metadata: options.metadata,
      });
    }

    throw new Error(
      error.response?.data?.error?.message ||
        'Failed to get response from AI service'
    );
  }
};

const aiService = {
  /**
   * Generate AI feedback for a code submission
   * @param {string} submissionText - The code or text submitted by the user
   * @param {object} challengeContext - Context about the challenge (title, description, requirements)
   * @param {number} userId - User ID for logging
   * @returns {Promise<object>} Object containing feedback and metadata
   */
  generateFeedback: async (submissionText, challengeContext, userId = null) => {
    // Get the feedback template
    const { systemPrompt, userPrompt } = getPrompt('generateFeedback', {
      challengeTitle: challengeContext.title,
      challengeDescription: challengeContext.description,
      challengeRequirements: challengeContext.requirements || 'N/A',
      submissionText: submissionText,
      previousAttempts: challengeContext.previousAttempts || 0,
    });

    // Call Gemini API with logging
    // Use higher token limit (2500) to avoid truncation in long feedback
    const response = await callGemini(systemPrompt, userPrompt, {
      maxOutputTokens: 2500,
      temperature: 0.7,
      endpoint: 'generateFeedback',
      userId,
    });

    // Validate the response has expected content
    const validation = validateResponse('generateFeedback', response);

    if (!validation.valid) {
      console.warn('Feedback validation failed:', validation.errors);
      // Still return the response but log the issue
    }

    return {
      feedback: response,
      prompt: {
        system: systemPrompt,
        user: userPrompt,
        combined: `${systemPrompt}\n\n${userPrompt}`,
      },
      metadata: {
        validated: validation.isValid,
        validationErrors: validation.errors,
      },
    };
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
${
  userProgress.lastAttempt
    ? `Last attempt summary: ${userProgress.lastAttempt}`
    : ''
}

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

  /**
   * Generate a complete challenge using AI
   * @param {object} params - Challenge parameters (category, difficulty, topic, requirements)
   * @returns {Promise<object>} Generated challenge with title, description, instructions, etc.
   */
  generateChallenge: async (params) => {
    const { category, difficulty, topic, requirements, userId } = params;

    // Use prompt template
    const prompt = getPrompt('generateChallenge', {
      category,
      difficulty,
      topic,
      requirements,
    });

    const response = await callGemini(prompt.systemPrompt, prompt.userPrompt, {
      ...prompt.config,
      endpoint: 'generateChallenge',
      userId,
      metadata: { category, difficulty, topic, requirements },
    });

    try {
      // Try to parse the JSON response
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();

      // Remove various markdown code block formats
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
      cleanedResponse = cleanedResponse.replace(/\s*```\s*$/, '');

      // Try to find JSON content between braces if there's extra text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      const challengeData = JSON.parse(cleanedResponse);

      // Validate and sanitize numeric fields
      const estimatedTime = parseInt(challengeData.estimated_time_minutes, 10);
      const pointsReward = parseInt(challengeData.points_reward, 10);

      // Convert instructions array to string if needed
      let instructions = challengeData.instructions;
      if (Array.isArray(instructions)) {
        instructions = instructions
          .map((item, index) => `${index + 1}. ${item}`)
          .join('\n');
      }

      // Ensure required fields are present and valid
      const result = {
        ...challengeData,
        instructions: instructions || challengeData.instructions,
        category: category,
        difficulty_level: difficulty,
        estimated_time_minutes:
          !isNaN(estimatedTime) && estimatedTime > 0 ? estimatedTime : 30,
        points_reward:
          !isNaN(pointsReward) && pointsReward > 0 ? pointsReward : 10,
        generated: true,
        generatedAt: new Date().toISOString(),
      };

      // Validate response format
      const validation = validateResponse('generateChallenge', result);
      if (!validation.valid) {
        console.error('AI response validation failed:', validation.errors);
        console.error('Response data:', result);
      }

      return result;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', response);
      // Return a structured error with the raw response
      throw new Error('AI generated invalid JSON. Please try again.');
    }
  },

  /**
   * Analyze a topic to understand what the user wants to study
   * @param {string} userInput - The user's input describing what they want to study
   * @param {number} userId - User ID for logging
   * @returns {Promise<object>} Topic analysis with subject area and focus
   */
  analyzeTopic: async (userInput, userId = null) => {
    const prompt = getPrompt('analyzeTopic', { userInput });

    const response = await callGemini(prompt.systemPrompt, prompt.userPrompt, {
      ...prompt.config,
      endpoint: 'analyzeTopic',
      userId,
      metadata: { userInput },
    });

    try {
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
      cleanedResponse = cleanedResponse.replace(/\s*```\s*$/, '');

      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing topic analysis:', parseError);
      throw new Error('Failed to analyze topic. Please try again.');
    }
  },

  /**
   * Generate a comprehensive study guide
   * @param {object} params - Study guide parameters
   * @param {number} userId - User ID for logging
   * @returns {Promise<object>} Complete study guide with questions
   */
  generateStudyGuide: async (params, userId = null) => {
    const {
      topic,
      questionTypes,
      questionCount,
      gradingMode,
      difficultyLevel,
      additionalContext,
    } = params;

    const prompt = getPrompt('generateStudyGuide', {
      topic,
      questionTypes: questionTypes.join(', '),
      questionCount: questionCount.toString(),
      gradingMode,
      difficultyLevel,
      additionalContext: additionalContext || '',
    });

    const response = await callGemini(prompt.systemPrompt, prompt.userPrompt, {
      ...prompt.config,
      endpoint: 'generateStudyGuide',
      userId,
      metadata: {
        topic,
        questionTypes,
        questionCount,
        gradingMode,
        difficultyLevel,
      },
    });

    try {
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
      cleanedResponse = cleanedResponse.replace(/\s*```\s*$/, '');

      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      const studyGuide = JSON.parse(cleanedResponse);

      // Validate response
      const validation = validateResponse('generateStudyGuide', studyGuide);
      if (!validation.valid) {
        console.warn('Study guide validation failed:', validation.errors);
      }

      return {
        ...studyGuide,
        gradingMode,
        generatedAt: new Date().toISOString(),
      };
    } catch (parseError) {
      console.error('Error parsing study guide:', parseError);
      console.error('Raw response:', response);
      throw new Error('Failed to generate study guide. Please try again.');
    }
  },

  /**
   * Grade a student's answer using AI
   * @param {object} params - Grading parameters
   * @param {number} userId - User ID for logging
   * @returns {Promise<object>} Grading result with feedback
   */
  gradeAnswer: async (params, userId = null) => {
    const { question, correctAnswer, studentAnswer, questionType } = params;

    const prompt = getPrompt('gradeResponse', {
      question,
      correctAnswer,
      studentAnswer,
      questionType,
    });

    const response = await callGemini(prompt.systemPrompt, prompt.userPrompt, {
      ...prompt.config,
      endpoint: 'gradeAnswer',
      userId,
      metadata: { questionType },
    });

    try {
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
      cleanedResponse = cleanedResponse.replace(/\s*```\s*$/, '');

      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing grade response:', parseError);
      throw new Error('Failed to grade answer. Please try again.');
    }
  },
};

module.exports = aiService;
