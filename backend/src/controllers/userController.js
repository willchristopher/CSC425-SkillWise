// User management controller for profile, settings, statistics
const userService = require('../services/userService');
const { AppError } = require('../middleware/errorHandler');

const userController = {
  // Get user profile
  getProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);

      if (!user) {
        return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
      }

      res.status(200).json({
        status: 'success',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      });
    } catch (error) {
      next(new AppError(error.message, 500, 'GET_PROFILE_FAILED'));
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName } = req.body;

      const updatedUser = await userService.updateProfile(userId, {
        first_name: firstName,
        last_name: lastName
      });

      res.status(200).json({
        status: 'success',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          updatedAt: updatedUser.updated_at
        }
      });
    } catch (error) {
      next(new AppError(error.message, 400, 'UPDATE_PROFILE_FAILED'));
    }
  },

  // Get user statistics
  getStatistics: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const stats = await userService.getUserStats(userId);

      res.status(200).json({
        status: 'success',
        data: stats || {}
      });
    } catch (error) {
      next(new AppError(error.message, 500, 'GET_STATISTICS_FAILED'));
    }
  },

  // Delete user account
  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.user.id;
      await userService.deleteUser(userId);

      res.status(200).json({
        status: 'success',
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(new AppError(error.message, 500, 'DELETE_ACCOUNT_FAILED'));
    }
  }
};

module.exports = userController;