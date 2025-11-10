const db = require('../database/connection');

const challengeService = {
  // Get all challenges for a goal
  getChallengesByGoal: async (goalId, userId) => {
    try {
      const query = `
        SELECT c.* 
        FROM challenges c
        JOIN goals g ON c.goal_id = g.id
        WHERE c.goal_id = $1 AND g.user_id = $2
        ORDER BY c.created_at DESC
      `;
      
      const result = await db.query(query, [goalId, userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch challenges: ${error.message}`);
    }
  },

  // Get all challenges for a user (across all goals)
  getUserChallenges: async (userId, filters = {}) => {
    try {
      let query = `
        SELECT c.*, g.title as goal_title
        FROM challenges c
        JOIN goals g ON c.goal_id = g.id
        WHERE g.user_id = $1
      `;
      
      const params = [userId];
      
      if (filters.is_completed !== undefined) {
        query += ` AND c.is_completed = $${params.length + 1}`;
        params.push(filters.is_completed);
      }
      
      if (filters.difficulty_level) {
        query += ` AND c.difficulty_level = $${params.length + 1}`;
        params.push(filters.difficulty_level);
      }
      
      query += ` ORDER BY c.created_at DESC`;
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch challenges: ${error.message}`);
    }
  },

  // Get single challenge by ID
  getChallengeById: async (challengeId, userId) => {
    try {
      const query = `
        SELECT c.*, g.title as goal_title
        FROM challenges c
        JOIN goals g ON c.goal_id = g.id
        WHERE c.id = $1 AND g.user_id = $2
      `;
      
      const result = await db.query(query, [challengeId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to fetch challenge: ${error.message}`);
    }
  },

  // Create new challenge
  createChallenge: async (challengeData, userId) => {
    try {
      const {
        goal_id,
        title,
        description,
        difficulty_level = 'medium',
        points_reward = 100,
        due_date,
      } = challengeData;

      // Verify goal belongs to user
      const goalCheck = await db.query(
        'SELECT id FROM goals WHERE id = $1 AND user_id = $2',
        [goal_id, userId]
      );

      if (goalCheck.rows.length === 0) {
        throw new Error('Goal not found or access denied');
      }

      const query = `
        INSERT INTO challenges 
        (goal_id, title, description, difficulty_level, points_reward, due_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await db.query(query, [
        goal_id,
        title,
        description,
        difficulty_level,
        points_reward,
        due_date || null,
      ]);
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create challenge: ${error.message}`);
    }
  },

  // Update existing challenge
  updateChallenge: async (challengeId, userId, updates) => {
    try {
      const allowedFields = [
        'title',
        'description',
        'difficulty_level',
        'points_reward',
        'due_date',
        'is_completed',
      ];
      
      const setClauses = [];
      const params = [];
      let paramIndex = 1;
      
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(updates[key]);
          paramIndex++;
        }
      });
      
      if (setClauses.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      // If marking as completed, set completion_date
      if (updates.is_completed === true) {
        setClauses.push(`completion_date = CURRENT_TIMESTAMP`);
      }
      
      params.push(challengeId, userId);
      
      const query = `
        UPDATE challenges c
        SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
        FROM goals g
        WHERE c.id = $${paramIndex} AND c.goal_id = g.id AND g.user_id = $${paramIndex + 1}
        RETURNING c.*
      `;
      
      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update challenge: ${error.message}`);
    }
  },

  // Delete challenge
  deleteChallenge: async (challengeId, userId) => {
    try {
      const query = `
        DELETE FROM challenges c
        USING goals g
        WHERE c.id = $1 AND c.goal_id = g.id AND g.user_id = $2
        RETURNING c.*
      `;
      
      const result = await db.query(query, [challengeId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to delete challenge: ${error.message}`);
    }
  },
};

module.exports = challengeService;