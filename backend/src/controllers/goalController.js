const goalService = require('../services/goalService');

const goalController = {
  // Get all goals for user
  getGoals: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const filters = {
        is_completed: req.query.is_completed,
        category: req.query.category,
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );
      
      const goals = await goalService.getUserGoals(userId, filters);
      
      res.status(200).json({
        success: true,
        data: goals,
        count: goals.length,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single goal by ID
  getGoalById: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;
      
      const goal = await goalService.getGoalById(goalId, userId);
      
      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found',
        });
      }
      
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
      
      // Validation
      if (!goalData.title || !goalData.description || !goalData.target_completion_date) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, and target completion date are required',
        });
      }
      
      const newGoal = await goalService.createGoal(goalData, userId);
      
      res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: newGoal,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update existing goal
  updateGoal: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;
      const updates = req.body;
      
      const updatedGoal = await goalService.updateGoal(goalId, userId, updates);
      
      if (!updatedGoal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found',
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Goal updated successfully',
        data: updatedGoal,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete goal
  deleteGoal: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;
      
      const deletedGoal = await goalService.deleteGoal(goalId, userId);
      
      if (!deletedGoal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found',
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Goal deleted successfully',
        data: deletedGoal,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = goalController;