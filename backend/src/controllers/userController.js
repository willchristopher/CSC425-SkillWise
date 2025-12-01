// User management controller for profile, settings, statistics
const userService = require('../services/userService');
const db = require('../database/connection');

const userController = {
  // Get user profile with stats
  getProfile: async (req, res, next) => {
    try {
      const userId = req.user.userId;

      // Get basic user info
      const user = await userService.getUserById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      }

      // Get user statistics
      const stats = await userService.getUserStats(userId);

      // Get goals count
      const goalsResult = await db.query(
        'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_completed = true) as completed FROM goals WHERE user_id = $1',
        [userId]
      );

      // Get challenges count
      const challengesResult = await db.query(
        'SELECT COUNT(*) as total FROM challenges WHERE created_by = $1',
        [userId]
      );

      const profile = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        joinedDate: user.created_at,
        totalPoints: stats?.total_points || 0,
        level: Math.floor((stats?.total_points || 0) / 100) + 1,
        completedChallenges: stats?.challenges_completed || 0,
        goalsAchieved: parseInt(goalsResult.rows[0]?.completed) || 0,
        totalGoals: parseInt(goalsResult.rows[0]?.total) || 0,
        totalChallenges: parseInt(challengesResult.rows[0]?.total) || 0,
        currentStreak: stats?.current_streak || 0,
        longestStreak: stats?.longest_streak || 0,
      };

      res.json({ success: true, data: profile });
    } catch (error) {
      console.error('Get profile error:', error);
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { firstName, lastName, bio, location, website } = req.body;

      // Build update query dynamically
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (firstName !== undefined) {
        fields.push(`first_name = $${paramCount++}`);
        values.push(firstName);
      }
      if (lastName !== undefined) {
        fields.push(`last_name = $${paramCount++}`);
        values.push(lastName);
      }
      if (bio !== undefined) {
        fields.push(`bio = $${paramCount++}`);
        values.push(bio);
      }
      if (location !== undefined) {
        fields.push(`location = $${paramCount++}`);
        values.push(location);
      }
      if (website !== undefined) {
        fields.push(`website = $${paramCount++}`);
        values.push(website);
      }

      if (fields.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: 'No fields to update' });
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);

      const result = await db.query(
        `UPDATE users SET ${fields.join(
          ', '
        )} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      }

      const user = result.rows[0];
      res.json({
        success: true,
        data: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          bio: user.bio,
          location: user.location,
          website: user.website,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      next(error);
    }
  },

  // Get user statistics
  getStatistics: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const stats = await userService.getUserStats(userId);

      // Get additional stats from other tables
      const goalsResult = await db.query(
        'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_completed = true) as completed FROM goals WHERE user_id = $1',
        [userId]
      );

      const challengesResult = await db.query(
        'SELECT COUNT(*) as created FROM challenges WHERE created_by = $1',
        [userId]
      );

      res.json({
        success: true,
        data: {
          totalPoints: stats?.total_points || 0,
          level: Math.floor((stats?.total_points || 0) / 100) + 1,
          challengesCompleted: stats?.challenges_completed || 0,
          goalsCompleted: parseInt(goalsResult.rows[0]?.completed) || 0,
          totalGoals: parseInt(goalsResult.rows[0]?.total) || 0,
          challengesCreated: parseInt(challengesResult.rows[0]?.created) || 0,
          currentStreak: stats?.current_streak || 0,
          longestStreak: stats?.longest_streak || 0,
        },
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      next(error);
    }
  },

  // Delete user account
  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      await userService.deleteUser(userId);
      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      next(error);
    }
  },
};

module.exports = userController;
