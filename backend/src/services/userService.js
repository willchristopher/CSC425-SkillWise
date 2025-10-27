// User service for database operations and business logic
const db = require('../database/connection');
const { AppError } = require('../middleware/errorHandler');

const userService = {
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const { rows } = await db.query(
        'SELECT id, first_name, last_name, email, profile_image, bio, role, created_at, updated_at FROM users WHERE id = $1 AND is_active = true',
        [userId]
      );
      
      if (rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      return rows[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user', 500, 'GET_USER_ERROR');
    }
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      const allowedFields = ['first_name', 'last_name', 'bio', 'profile_image'];
      
      allowedFields.forEach(field => {
        if (profileData[field] !== undefined) {
          fields.push(`${field} = $${paramCount}`);
          values.push(profileData[field]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new AppError('No valid fields to update', 400, 'NO_UPDATE_FIELDS');
      }

      values.push(userId);
      const { rows } = await db.query(
        `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $${paramCount} AND is_active = true
         RETURNING id, first_name, last_name, email, profile_image, bio, role, created_at, updated_at`,
        values
      );

      if (rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      return rows[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update profile', 500, 'UPDATE_PROFILE_ERROR');
    }
  },

  // Get user statistics
  getUserStatistics: async (userId) => {
    try {
      // Check if user exists first
      await this.getUserById(userId);

      // Get user statistics (this would integrate with user_statistics table when available)
      const { rows } = await db.query(
        'SELECT * FROM user_statistics WHERE user_id = $1',
        [userId]
      );

      // Return default statistics if none exist yet
      if (rows.length === 0) {
        return {
          user_id: userId,
          goals_completed: 0,
          challenges_completed: 0,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          badges_earned: 0,
          created_at: new Date(),
          updated_at: new Date()
        };
      }

      return rows[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user statistics', 500, 'GET_STATS_ERROR');
    }
  },

  // Delete user account (soft delete)
  deleteAccount: async (userId) => {
    try {
      // Soft delete by setting is_active to false
      const { rows } = await db.query(
        'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_active = true RETURNING id',
        [userId]
      );

      if (rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Also revoke all refresh tokens
      await db.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
        [userId]
      );

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete account', 500, 'DELETE_ACCOUNT_ERROR');
    }
  }
};

module.exports = userService;