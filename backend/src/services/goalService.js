const db = require('../database/connection');

const goalService = {
  // Get all goals for a user
  getUserGoals: async (userId, filters = {}) => {
    try {
      let query = `
        SELECT g.*, 
               COUNT(c.id) as total_challenges,
               COUNT(CASE WHEN c.is_completed = true THEN 1 END) as completed_challenges
        FROM goals g
        LEFT JOIN challenges c ON c.goal_id = g.id
        WHERE g.user_id = $1
      `;
      
      const params = [userId];
      
      // Add filters if provided
      if (filters.is_completed !== undefined) {
        query += ` AND g.is_completed = $${params.length + 1}`;
        params.push(filters.is_completed);
      }
      
      if (filters.category) {
        query += ` AND g.category = $${params.length + 1}`;
        params.push(filters.category);
      }
      
      query += `
        GROUP BY g.id
        ORDER BY g.created_at DESC
      `;
      
      const result = await db.query(query, params);
      
      // Calculate progress for each goal
      return result.rows.map(goal => ({
        ...goal,
        progress_percentage: goalService.calculateCompletion(goal),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch goals: ${error.message}`);
    }
  },

  // Get single goal by ID
  getGoalById: async (goalId, userId) => {
    try {
      const query = `
        SELECT g.*, 
               COUNT(c.id) as total_challenges,
               COUNT(CASE WHEN c.is_completed = true THEN 1 END) as completed_challenges
        FROM goals g
        LEFT JOIN challenges c ON c.goal_id = g.id
        WHERE g.id = $1 AND g.user_id = $2
        GROUP BY g.id
      `;
      
      const result = await db.query(query, [goalId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const goal = result.rows[0];
      return {
        ...goal,
        progress_percentage: goalService.calculateCompletion(goal),
      };
    } catch (error) {
      throw new Error(`Failed to fetch goal: ${error.message}`);
    }
  },

  // Create new goal
  createGoal: async (goalData, userId) => {
    try {
      const {
        title,
        description,
        category,
        difficulty_level = 'medium',
        target_completion_date,
        is_public = false,
      } = goalData;

      const query = `
        INSERT INTO goals 
        (user_id, title, description, category, difficulty_level, target_completion_date, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const result = await db.query(query, [
        userId,
        title,
        description,
        category || null,
        difficulty_level,
        target_completion_date,
        is_public,
      ]);
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create goal: ${error.message}`);
    }
  },

  // Update existing goal
  updateGoal: async (goalId, userId, updates) => {
    try {
      const allowedFields = [
        'title',
        'description',
        'category',
        'difficulty_level',
        'target_completion_date',
        'is_completed',
        'is_public',
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
      
      params.push(goalId, userId);
      
      const query = `
        UPDATE goals
        SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
        RETURNING *
      `;
      
      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update goal: ${error.message}`);
    }
  },

  // Delete goal
  deleteGoal: async (goalId, userId) => {
    try {
      const query = `
        DELETE FROM goals
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      
      const result = await db.query(query, [goalId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to delete goal: ${error.message}`);
    }
  },

  // Update goal progress based on challenges
  updateProgress: async (goalId) => {
    try {
      const query = `
        UPDATE goals
        SET progress_percentage = (
          SELECT CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN is_completed = true THEN 1 END)::numeric / COUNT(*)::numeric) * 100)
          END
          FROM challenges
          WHERE goal_id = $1
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [goalId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update progress: ${error.message}`);
    }
  },

  // Calculate goal completion percentage
  calculateCompletion: (goal) => {
    const totalChallenges = parseInt(goal.total_challenges) || 0;
    const completedChallenges = parseInt(goal.completed_challenges) || 0;
    
    if (totalChallenges === 0) return 0;
    
    return Math.round((completedChallenges / totalChallenges) * 100);
  },
};

module.exports = goalService;