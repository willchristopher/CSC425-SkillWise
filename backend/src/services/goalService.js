const pool = require('../database/connection');

const goalService = {
  // Get all goals for a user
  getUserGoals: async (userId) => {
    const result = await pool.query(
      `SELECT id, title, description, category, difficulty_level, target_completion_date,
              progress_percentage, is_completed, created_at, updated_at
       FROM goals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      difficulty: row.difficulty_level,
      targetCompletionDate: row.target_completion_date,
      currentProgress: row.progress_percentage,
      status: row.is_completed ? 'completed' : 'active',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Get a single goal by ID
  getGoalById: async (goalId, userId) => {
    const result = await pool.query(
      `SELECT id, title, description, category, difficulty_level, target_completion_date,
              progress_percentage, is_completed, created_at, updated_at
       FROM goals
       WHERE id = $1 AND user_id = $2`,
      [goalId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Goal not found');
    }

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      difficulty: row.difficulty_level,
      targetCompletionDate: row.target_completion_date,
      currentProgress: row.progress_percentage,
      status: row.is_completed ? 'completed' : 'active',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  // Create new goal
  createGoal: async (goalData, userId) => {
    const { title, description, category, difficulty, targetCompletionDate } = goalData;

    // Convert empty strings to null for database
    const cleanTargetDate = targetCompletionDate && targetCompletionDate.trim() !== '' 
      ? targetCompletionDate 
      : null;

    const result = await pool.query(
      `INSERT INTO goals (user_id, title, description, category, difficulty_level, target_completion_date, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING id, title, description, category, difficulty_level, target_completion_date,
                 progress_percentage, is_completed, created_at, updated_at`,
      [userId, title, description || null, category || null, difficulty || 'medium', cleanTargetDate]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      difficulty: row.difficulty_level,
      targetCompletionDate: row.target_completion_date,
      currentProgress: row.progress_percentage,
      status: row.is_completed ? 'completed' : 'active',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  // Update goal
  updateGoal: async (goalId, userId, updates) => {
    const { title, description, category, difficulty, targetCompletionDate, currentProgress, status } = updates;

    // Convert empty strings to null for database
    const cleanTargetDate = targetCompletionDate && targetCompletionDate.trim() !== '' 
      ? targetCompletionDate 
      : null;

    // Convert status to boolean
    const isCompleted = status === 'completed' ? true : (status === 'active' ? false : null);

    const result = await pool.query(
      `UPDATE goals
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           difficulty_level = COALESCE($4, difficulty_level),
           target_completion_date = COALESCE($5, target_completion_date),
           progress_percentage = COALESCE($6, progress_percentage),
           is_completed = COALESCE($7, is_completed),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING id, title, description, category, difficulty_level, target_completion_date,
                 progress_percentage, is_completed, created_at, updated_at`,
      [title, description, category, difficulty, cleanTargetDate, currentProgress, isCompleted, goalId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Goal not found');
    }

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      difficulty: row.difficulty_level,
      targetCompletionDate: row.target_completion_date,
      currentProgress: row.progress_percentage,
      status: row.is_completed ? 'completed' : 'active',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  // Delete goal
  deleteGoal: async (goalId, userId) => {
    const result = await pool.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id',
      [goalId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Goal not found');
    }

    return { success: true, id: result.rows[0].id };
  },

  // Update goal progress
  updateProgress: async (goalId, userId, progress) => {
    const isCompleted = progress >= 100;
    
    const result = await pool.query(
      `UPDATE goals
       SET progress_percentage = $1,
           is_completed = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING id, progress_percentage, is_completed`,
      [progress, isCompleted, goalId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Goal not found');
    }

    return {
      id: result.rows[0].id,
      currentProgress: result.rows[0].progress_percentage,
      status: result.rows[0].is_completed ? 'completed' : 'active',
    };
  },

  // Get user statistics
  getUserStats: async (userId) => {
    const result = await pool.query(
      `SELECT
         COUNT(*) as total_goals,
         COUNT(*) FILTER (WHERE is_completed = true) as goals_completed,
         COUNT(*) FILTER (WHERE is_completed = false) as goals_active,
         COALESCE(AVG(progress_percentage) FILTER (WHERE is_completed = false), 0) as avg_progress
       FROM goals
       WHERE user_id = $1`,
      [userId]
    );

    return {
      totalGoals: parseInt(result.rows[0].total_goals) || 0,
      goalsCompleted: parseInt(result.rows[0].goals_completed) || 0,
      goalsActive: parseInt(result.rows[0].goals_active) || 0,
      avgProgress: Math.round(parseFloat(result.rows[0].avg_progress)) || 0,
    };
  },

  // Calculate goal completion percentage
  calculateCompletion: (goal) => {
    return goal.progress_percentage || 0;
  },
};

module.exports = goalService;