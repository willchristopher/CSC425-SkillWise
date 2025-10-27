// User management controller for profile, settings, statistics
const userService = require('../services/userService');
const { AppError } = require('../middleware/errorHandler');

const userController = {
  // Get user profile
  getProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const updatedUser = await userService.updateProfile(userId, updateData);

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user statistics
  getStatistics: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const statistics = await userService.getUserStatistics(userId);

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'Statistics retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete user account
  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.user.id;
      await userService.deleteAccount(userId);

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;