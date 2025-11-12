// Implement challenge business logic
const Challenge = require('../models/Challenge');
const db = require('../database/connection');

const challengeService = {
  // Get challenges with difficulty filtering
  getChallenges: async (filters = {}) => {
    try {
      const { difficulty, category, userId } = filters;
      
      if (difficulty) {
        return await Challenge.findByDifficulty(difficulty);
      } else if (category) {
        return await Challenge.findBySubject(category);
      } else if (userId) {
        // Get challenges for a specific user's goals
        const query = `
          SELECT DISTINCT c.*
          FROM challenges c
          INNER JOIN user_goal_challenges ugc ON c.id = ugc.challenge_id
          WHERE ugc.user_id = $1
          ORDER BY c.difficulty_level, c.created_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
      } else {
        return await Challenge.findAll();
      }
    } catch (error) {
      throw new Error(`Error getting challenges: ${error.message}`);
    }
  },

  // Generate personalized challenges based on user's goals
  generatePersonalizedChallenges: async (userId) => {
    try {
      // Get user's goals and their categories
      const goalQuery = `
        SELECT DISTINCT category
        FROM goals
        WHERE user_id = $1 AND is_completed = false
      `;
      const goalResult = await db.query(goalQuery, [userId]);
      const categories = goalResult.rows.map(row => row.category);
      
      if (categories.length === 0) {
        // Return general challenges if no goals
        return await Challenge.findAll();
      }
      
      // Find challenges matching user's goal categories
      const challengeQuery = `
        SELECT * FROM challenges
        WHERE category = ANY($1) AND is_active = true
        ORDER BY difficulty_level, created_at DESC
        LIMIT 20
      `;
      const result = await db.query(challengeQuery, [categories]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error generating personalized challenges: ${error.message}`);
    }
  },

  // Validate challenge completion
  validateCompletion: async (challengeId, submissionData) => {
    try {
      const challenge = await Challenge.findById(challengeId);
      
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      // Basic validation - check if submission has required fields
      const isValid = submissionData && 
                     submissionData.content && 
                     submissionData.content.length > 0;
      
      return {
        isValid,
        challenge,
        pointsAwarded: isValid ? challenge.points_reward : 0
      };
    } catch (error) {
      throw new Error(`Error validating completion: ${error.message}`);
    }
  },

  // Calculate challenge difficulty based on various factors
  calculateDifficulty: (challenge) => {
    try {
      if (!challenge) return 'medium';
      
      // If difficulty is already set, return it
      if (challenge.difficulty_level) {
        return challenge.difficulty_level;
      }
      
      // Calculate based on estimated time and other factors
      const timeMinutes = challenge.estimated_time_minutes || 30;
      
      if (timeMinutes < 15) return 'easy';
      if (timeMinutes < 45) return 'medium';
      if (timeMinutes < 90) return 'hard';
      return 'expert';
    } catch (error) {
      console.error('Error calculating difficulty:', error);
      return 'medium';
    }
  },

  // Link challenge to a goal
  linkChallengeToGoal: async (userId, goalId, challengeId) => {
    try {
      const query = `
        INSERT INTO user_goal_challenges (user_id, goal_id, challenge_id, status, created_at, updated_at)
        VALUES ($1, $2, $3, 'not_started', NOW(), NOW())
        ON CONFLICT (user_id, goal_id, challenge_id) DO NOTHING
        RETURNING *
      `;
      const result = await db.query(query, [userId, goalId, challengeId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error linking challenge to goal: ${error.message}`);
    }
  },

  // Mark challenge as complete
  markChallengeComplete: async (userId, goalId, challengeId) => {
    try {
      const query = `
        UPDATE user_goal_challenges
        SET status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE user_id = $1 AND goal_id = $2 AND challenge_id = $3
        RETURNING *
      `;
      const result = await db.query(query, [userId, goalId, challengeId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking challenge complete: ${error.message}`);
    }
  }
};

module.exports = challengeService;