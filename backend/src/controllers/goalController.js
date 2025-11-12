const Goal = require('../models/Goal');
const goalService = require('../services/goalService');

const goalController = {
  // Get all goals for authenticated user
  getGoals: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      // Use goalService to get goals with calculated progress
      const goals = await goalService.getUserGoals(userId);
      
      res.status(200).json({
        success: true,
        data: goals,
        count: goals.length
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single goal by ID
  getGoalById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const goal = await Goal.findById(id);
      
      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      // Verify goal belongs to user
      if (goal.user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this goal'
        });
      }

      res.status(200).json({
        success: true,
        data: goal
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new goal
  createGoal: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { title, description, target_date, type } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      const goalData = {
        title,
        description,
        user_id: userId,
        target_date,
        type: type || 'personal'
      };

      const newGoal = await Goal.create(goalData);

      res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: newGoal
      });
    } catch (error) {
      next(error);
    }
  },

  // Update existing goal
  updateGoal: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, target_date, progress, status } = req.body;

      // Check if goal exists and belongs to user
      const existingGoal = await Goal.findById(id);
      if (!existingGoal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      if (existingGoal.user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this goal'
        });
      }

      const updateData = {
        title,
        description,
        target_date,
        progress,
        status
      };

      const updatedGoal = await Goal.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Goal updated successfully',
        data: updatedGoal
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete goal
  deleteGoal: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if goal exists and belongs to user
      const existingGoal = await Goal.findById(id);
      if (!existingGoal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      if (existingGoal.user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this goal'
        });
      }

      await Goal.delete(id);

      res.status(200).json({
        success: true,
        message: 'Goal deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = goalController;