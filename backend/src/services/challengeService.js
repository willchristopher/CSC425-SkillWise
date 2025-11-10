const pool = require('../database/connection');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let geminiClient = null;

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

const extractField = (text, fieldName) => {
  const regex = new RegExp(`${fieldName}:\\s*(.+?)(?=\\n[A-Z][a-z]+:|\\n---|$)`, 's');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
};

const parseChallengesFromAI = (text, goal) => {
  const challenges = [];
  const challengeBlocks = text.split('---CHALLENGE START---');

  for (let i = 1; i < challengeBlocks.length; i++) {
    const block = challengeBlocks[i].split('---CHALLENGE END---')[0];
    if (!block) continue;

    try {
      const challenge = {
        id: `${goal.id}-${i}`,
        goal_id: goal.id,
        title: extractField(block, 'Title'),
        description: extractField(block, 'Description'),
        instructions: extractField(block, 'Instructions'),
        difficulty_level: extractField(block, 'Difficulty') || goal.difficulty_level,
        category: extractField(block, 'Category') || goal.category || 'programming',
        estimated_time_minutes: parseInt(extractField(block, 'EstimatedTime')) || 30,
        points_reward: parseInt(extractField(block, 'Points')) || 150,
        starter_code: extractField(block, 'StarterCode'),
        success_criteria: extractField(block, 'SuccessCriteria'),
      };
      challenges.push(challenge);
    } catch (error) {
      console.error('Error parsing challenge block:', error);
    }
  }

  return challenges;
};

const generateChallengesForGoal = async (goal) => {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    const prompt = `You are an expert programming instructor creating practical coding challenges.

Generate 3 diverse coding challenges for the following learning goal:

**Goal Title:** ${goal.title}
**Description:** ${goal.description || 'No description provided'}
**Category:** ${goal.category || 'General Programming'}
**Difficulty Level:** ${goal.difficulty_level}
**Current Progress:** ${goal.progress_percentage}%

Requirements:
1. Create 3 different types of challenges (e.g., algorithm, debugging, implementation)
2. Challenges should build on each other in complexity
3. Each challenge should be practical and help achieve the goal
4. Match the difficulty level to the goal's difficulty (${goal.difficulty_level})
5. Provide clear instructions and success criteria

Format each challenge EXACTLY as follows (include all delimiters):

---CHALLENGE START---
Title: [Clear, specific title]
Description: [Brief 1-2 sentence overview]
Instructions: [Detailed step-by-step instructions]
Difficulty: [easy/medium/hard - must match: ${goal.difficulty_level}]
Category: [${goal.category || 'programming'}]
EstimatedTime: [number in minutes, e.g., 30]
Points: [100 for easy, 200 for medium, 300 for hard]
StarterCode: [Provide helpful starter code or template]
SuccessCriteria: [Clear criteria for completion]
---CHALLENGE END---

Generate all 3 challenges now:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const challenges = parseChallengesFromAI(text, goal);
    return challenges;
  } catch (error) {
    console.error('Error generating challenges with Gemini:', error);
    return [{
      id: `${goal.id}-fallback`,
      goal_id: goal.id,
      title: `Practice: ${goal.title}`,
      description: goal.description || `Work on improving your skills in ${goal.title}`,
      instructions: 'Complete a practice exercise related to this goal.',
      difficulty_level: goal.difficulty_level,
      category: goal.category || 'programming',
      estimated_time_minutes: 30,
      points_reward: goal.difficulty_level === 'easy' ? 100 : (goal.difficulty_level === 'hard' ? 300 : 200),
      starter_code: '// Your code here',
      success_criteria: 'Complete the exercise successfully',
    }];
  }
};

const challengeService = {
  getChallenges: async (userId, filters = {}) => {
    try {
      const goalsResult = await pool.query(
        `SELECT id, title, description, category, difficulty_level, progress_percentage
         FROM goals
         WHERE user_id = $1 AND is_completed = false
         ORDER BY created_at DESC`,
        [userId]
      );

      const goals = goalsResult.rows;

      if (goals.length === 0) {
        return [];
      }

      const allChallenges = [];
      
      for (const goal of goals) {
        const challenges = await generateChallengesForGoal(goal);
        allChallenges.push(...challenges);
      }

      let filteredChallenges = allChallenges;

      if (filters.difficulty) {
        filteredChallenges = filteredChallenges.filter(
          c => c.difficulty_level.toLowerCase() === filters.difficulty.toLowerCase()
        );
      }

      if (filters.category) {
        filteredChallenges = filteredChallenges.filter(
          c => c.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredChallenges = filteredChallenges.filter(
          c => c.title.toLowerCase().includes(searchLower) ||
               c.description.toLowerCase().includes(searchLower)
        );
      }

      return filteredChallenges;
    } catch (error) {
      console.error('Error generating challenges:', error);
      throw error;
    }
  },

  getChallengeById: async (challengeId, userId) => {
    try {
      const parts = challengeId.split('-');
      const goalId = parseInt(parts[0]);
      
      if (isNaN(goalId)) {
        const error = new Error('Invalid challenge ID format');
        error.statusCode = 400;
        throw error;
      }

      const goalResult = await pool.query(
        `SELECT id, title, description, category, difficulty_level, progress_percentage
         FROM goals
         WHERE id = $1 AND user_id = $2 AND is_completed = false`,
        [goalId, userId]
      );

      if (goalResult.rows.length === 0) {
        const error = new Error('Goal not found or already completed');
        error.statusCode = 404;
        throw error;
      }

      const goal = goalResult.rows[0];
      const challenges = await generateChallengesForGoal(goal);
      const challenge = challenges.find(c => c.id === challengeId);

      if (!challenge) {
        const error = new Error('Challenge not found');
        error.statusCode = 404;
        throw error;
      }

      return {
        id: challenge.id,
        goal_id: challenge.goal_id,
        title: challenge.title,
        description: challenge.description,
        instructions: challenge.instructions,
        difficulty: challenge.difficulty_level,
        category: challenge.category,
        timeEstimate: challenge.estimated_time_minutes,
        points: challenge.points_reward,
        starterCode: challenge.starter_code,
        successCriteria: challenge.success_criteria,
      };
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  },

  startChallenge: async (challengeId, userId) => {
    try {
      const challenge = await challengeService.getChallengeById(challengeId, userId);

      const checkQuery = `
        SELECT id, status FROM submissions
        WHERE user_id = $1 AND challenge_id = $2
      `;
      const existing = await pool.query(checkQuery, [userId, challengeId]);

      if (existing.rows.length > 0) {
        return {
          message: 'Challenge already started',
          submissionId: existing.rows[0].id,
          status: existing.rows[0].status,
        };
      }

      const insertQuery = `
        INSERT INTO submissions (challenge_id, user_id, status, submission_text, submitted_at)
        VALUES ($1, $2, 'in_progress', $3, NOW())
        RETURNING id
      `;
      
      const result = await pool.query(insertQuery, [
        challengeId,
        userId,
        challenge.starterCode || '',
      ]);

      return {
        message: 'Challenge started successfully',
        submissionId: result.rows[0].id,
        challenge,
      };
    } catch (error) {
      console.error('Error starting challenge:', error);
      throw error;
    }
  },

  getChallengeSubmission: async (challengeId, userId) => {
    try {
      const query = `
        SELECT id, challenge_id, status, submission_text, score, submitted_at
        FROM submissions
        WHERE challenge_id = $1 AND user_id = $2
        ORDER BY submitted_at DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [challengeId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error fetching challenge submission:', error);
      throw error;
    }
  },
};

module.exports = challengeService;
