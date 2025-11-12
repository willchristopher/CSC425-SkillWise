// Goals CRUD operations controller
const goalService = require('../services/goalService');
const { AppError } = require('../middleware/errorHandler');

const goalController = {
  // Get all goals for user
  getGoals: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const filters = {
        category: req.query.category,
        difficulty: req.query.difficulty,
        is_completed: req.query.is_completed !== undefined
          ? req.query.is_completed === 'true'
          : undefined,
      };

      const goals = await goalService.getUserGoals(userId, filters);

      res.status(200).json({
        success: true,
        data: goals,
        message: 'Goals retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single goal by ID
  getGoalById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const goal = await goalService.getGoalById(id, userId);

      res.status(200).json({
        success: true,
        data: goal,
        message: 'Goal retrieved successfully',
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

      const newGoal = await goalService.createGoal(goalData, userId);

      res.status(201).json({
        success: true,
        data: newGoal,
        message: 'Goal created successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Update existing goal
  updateGoal: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const updatedGoal = await goalService.updateGoal(id, userId, updateData);

      res.status(200).json({
        success: true,
        data: updatedGoal,
        message: 'Goal updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Update goal progress
  updateProgress: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { progress_percentage } = req.body;

      if (progress_percentage === undefined || progress_percentage === null) {
        return next(new AppError('Progress percentage is required', 400, 'MISSING_PROGRESS'));
      }

      const updatedGoal = await goalService.updateProgress(
        id,
        userId,
        { progress_percentage },
      );

      res.status(200).json({
        success: true,
        data: updatedGoal,
        message: 'Goal progress updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete goal
  deleteGoal: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await goalService.deleteGoal(id, userId);

      res.status(200).json({
        success: true,
        message: 'Goal deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get goal statistics for user
  getGoalStatistics: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const statistics = await goalService.getGoalStatistics(userId);

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'Goal statistics retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get popular goal categories
  getPopularCategories: async (req, res, next) => {
    try {
      const categories = await goalService.getPopularCategories();

      res.status(200).json({
        success: true,
        data: categories,
        message: 'Popular categories retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = goalController;
