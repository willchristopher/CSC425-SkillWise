// Goal business logic and database operations
const db = require('../database/connection');
const { AppError } = require('../middleware/errorHandler');

const goalService = {
  // Get user goals with progress
  getUserGoals: async (userId, filters = {}) => {
    try {
      let query = `
        SELECT 
          id, 
          title, 
          description, 
          category, 
          difficulty_level, 
          target_completion_date, 
          is_completed, 
          completion_date, 
          progress_percentage, 
          points_reward, 
          is_public, 
          created_at, 
          updated_at
        FROM goals 
        WHERE user_id = $1
      `;

      const params = [userId];
      let paramCount = 2;

      // Add filters
      if (filters.category) {
        query += ` AND category = $${paramCount}`;
        params.push(filters.category);
        paramCount++;
      }

      if (filters.difficulty) {
        query += ` AND difficulty_level = $${paramCount}`;
        params.push(filters.difficulty);
        paramCount++;
      }

      if (filters.is_completed !== undefined) {
        query += ` AND is_completed = $${paramCount}`;
        params.push(filters.is_completed);
        paramCount++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new AppError('Failed to get user goals', 500, 'GET_GOALS_ERROR');
    }
  },

  // Get single goal by ID
  getGoalById: async (goalId, userId) => {
    try {
      const result = await db.query(
        'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
        [goalId, userId],
      );

      if (result.rows.length === 0) {
        throw new AppError('Goal not found', 404, 'GOAL_NOT_FOUND');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get goal', 500, 'GET_GOAL_ERROR');
    }
  },

  // Create new goal with validation
  createGoal: async (goalData, userId) => {
    try {
      const {
        title,
        description,
        category,
        difficulty_level = 'medium',
        target_completion_date,
        points_reward = 10,
        is_public = false,
      } = goalData;

      // Validate required fields
      if (!title || title.trim().length === 0) {
        throw new AppError('Goal title is required', 400, 'INVALID_GOAL_DATA');
      }

      if (title.length > 255) {
        throw new AppError('Goal title is too long', 400, 'INVALID_GOAL_DATA');
      }

      // Validate difficulty level
      const validDifficultyLevels = ['easy', 'medium', 'hard'];
      if (!validDifficultyLevels.includes(difficulty_level)) {
        throw new AppError('Invalid difficulty level', 400, 'INVALID_DIFFICULTY');
      }

      // Validate target completion date
      if (target_completion_date && new Date(target_completion_date) < new Date()) {
        throw new AppError('Target completion date cannot be in the past', 400, 'INVALID_DATE');
      }

      const insertQuery = `
        INSERT INTO goals (
          user_id, 
          title, 
          description, 
          category, 
          difficulty_level, 
          target_completion_date, 
          points_reward, 
          is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        userId,
        title.trim(),
        description?.trim() || null,
        category?.trim() || null,
        difficulty_level,
        target_completion_date || null,
        points_reward,
        is_public,
      ]);

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create goal', 500, 'CREATE_GOAL_ERROR');
    }
  },

  // Update existing goal
  updateGoal: async (goalId, userId, updateData) => {
    try {
      // First check if goal exists and belongs to user
      await goalService.getGoalById(goalId, userId);

      const fields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      const allowedFields = [
        'title', 'description', 'category', 'difficulty_level',
        'target_completion_date', 'points_reward', 'is_public',
      ];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          fields.push(`${field} = $${paramCount}`);
          values.push(updateData[field]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new AppError('No valid fields to update', 400, 'NO_UPDATE_FIELDS');
      }

      // Validate title if being updated
      if (updateData.title !== undefined) {
        if (!updateData.title || updateData.title.trim().length === 0) {
          throw new AppError('Goal title is required', 400, 'INVALID_GOAL_DATA');
        }
        if (updateData.title.length > 255) {
          throw new AppError('Goal title is too long', 400, 'INVALID_GOAL_DATA');
        }
      }

      // Validate difficulty level if being updated
      if (updateData.difficulty_level !== undefined) {
        const validDifficultyLevels = ['easy', 'medium', 'hard'];
        if (!validDifficultyLevels.includes(updateData.difficulty_level)) {
          throw new AppError('Invalid difficulty level', 400, 'INVALID_DIFFICULTY');
        }
      }

      values.push(goalId, userId);
      const updateQuery = `
        UPDATE goals 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING *
      `;

      const result = await db.query(updateQuery, values);
      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update goal', 500, 'UPDATE_GOAL_ERROR');
    }
  },

  // Update goal progress
  updateProgress: async (goalId, userId, progressData) => {
    try {
      const { progress_percentage } = progressData;

      // Validate progress percentage
      if (progress_percentage < 0 || progress_percentage > 100) {
        throw new AppError('Progress must be between 0 and 100', 400, 'INVALID_PROGRESS');
      }

      // Check if goal is completed
      const is_completed = progress_percentage === 100;
      const completion_date = is_completed ? new Date() : null;

      const result = await db.query(`
        UPDATE goals 
        SET 
          progress_percentage = $1,
          is_completed = $2,
          completion_date = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND user_id = $5
        RETURNING *
      `, [progress_percentage, is_completed, completion_date, goalId, userId]);

      if (result.rows.length === 0) {
        throw new AppError('Goal not found', 404, 'GOAL_NOT_FOUND');
      }

      // If goal is completed, award points to user
      if (is_completed && !result.rows[0].completion_date) {
        await goalService.awardPoints(userId, result.rows[0].points_reward);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update progress', 500, 'UPDATE_PROGRESS_ERROR');
    }
  },

  // Delete goal
  deleteGoal: async (goalId, userId) => {
    try {
      const result = await db.query(
        'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id',
        [goalId, userId],
      );

      if (result.rows.length === 0) {
        throw new AppError('Goal not found', 404, 'GOAL_NOT_FOUND');
      }

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete goal', 500, 'DELETE_GOAL_ERROR');
    }
  },

  // Calculate goal statistics for user
  getGoalStatistics: async (userId) => {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_goals,
          COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_goals,
          COUNT(CASE WHEN is_completed = false THEN 1 END) as active_goals,
          ROUND(AVG(progress_percentage), 2) as average_progress,
          SUM(CASE WHEN is_completed = true THEN points_reward ELSE 0 END) as total_points_earned
        FROM goals 
        WHERE user_id = $1
      `;

      const result = await db.query(statsQuery, [userId]);
      const stats = result.rows[0];

      // Convert string numbers to integers
      return {
        total_goals: parseInt(stats.total_goals) || 0,
        completed_goals: parseInt(stats.completed_goals) || 0,
        active_goals: parseInt(stats.active_goals) || 0,
        average_progress: parseFloat(stats.average_progress) || 0,
        total_points_earned: parseInt(stats.total_points_earned) || 0,
      };
    } catch (error) {
      throw new AppError('Failed to get goal statistics', 500, 'GET_STATS_ERROR');
    }
  },

  // Award points to user (placeholder for now)
  awardPoints: async (userId, points) => {
    try {
      // This would integrate with user_statistics table
      // For now, just log the points award
      console.log(`Awarding ${points} points to user ${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to award points:', error);
      return false;
    }
  },

  // Get popular goal categories
  getPopularCategories: async () => {
    try {
      const result = await db.query(`
        SELECT 
          category, 
          COUNT(*) as goal_count 
        FROM goals 
        WHERE category IS NOT NULL 
        GROUP BY category 
        ORDER BY goal_count DESC 
        LIMIT 10
      `);

      return result.rows;
    } catch (error) {
      throw new AppError('Failed to get popular categories', 500, 'GET_CATEGORIES_ERROR');
    }
  },
};

module.exports = goalService;
