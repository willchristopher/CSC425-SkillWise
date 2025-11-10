const goalService = require('../services/goalService');

const goalController = {
  // Get all goals for user
  getGoals: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const goals = await goalService.getUserGoals(userId);

      res.status(200).json({
        success: true,
        data: goals,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single goal by ID
  getGoalById: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const goal = await goalService.getGoalById(id, userId);

      res.status(200).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new goal
  createGoal: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const goalData = req.body;

      const goal = await goalService.createGoal(goalData, userId);

      res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update existing goal
  updateGoal: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updates = req.body;

      const goal = await goalService.updateGoal(id, userId, updates);

      res.status(200).json({
        success: true,
        message: 'Goal updated successfully',
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete goal
  deleteGoal: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await goalService.deleteGoal(id, userId);

      res.status(200).json({
        success: true,
        message: 'Goal deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user statistics
  getStats: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const stats = await goalService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = goalController;