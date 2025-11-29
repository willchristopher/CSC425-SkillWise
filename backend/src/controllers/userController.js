// User management controller for profile, settings, statistics
const { query } = require('../database/connection');
const bcrypt = require('bcryptjs');

const userController = {
  // Get user profile
  getProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const result = await query(
        'SELECT id, first_name, last_name, email, is_active, is_verified, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const user = result.rows[0];
      
      res.json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;

      const result = await query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, first_name, last_name, email, is_active, is_verified, created_at, updated_at',
        [firstName, lastName, email, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user statistics
  getStatistics: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Mock statistics for demo
      const stats = {
        total_challenges: 15,
        completed_challenges: 9,
        points_earned: 1250,
        current_streak: 7,
        rank: 'Advanced',
        goals_completed: 3,
        goals_in_progress: 2,
      };

      res.json({
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete user account
  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.user.id;

      await query('DELETE FROM users WHERE id = $1', [userId]);

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Change password
  changePassword: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // In a real implementation, you'd verify the current password
      // For demo purposes, just update it
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', 
        [hashedPassword, userId]);

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
