const userService = require('../services/userService');

const userController = {
  // Get user profile
  getProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      console.log('Getting profile for user ID:', userId);

      const profile = await userService.getFullProfile(userId);
      console.log('Profile from DB:', profile);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Format response to match frontend expectations
      const responseData = {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        avatarUrl: profile.profile_image,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        stats: {
          totalPoints: profile.total_points || 0,
          challengesCompleted: profile.total_challenges_completed || 0,
          goalsCompleted: profile.total_goals_completed || 0,
          peerReviewsGiven: profile.total_peer_reviews_given || 0,
          peerReviewsReceived: profile.total_peer_reviews_received || 0,
          currentStreak: profile.current_streak_days || 0,
          longestStreak: profile.longest_streak_days || 0,
          level: profile.level || 1,
          experiencePoints: profile.experience_points || 0,
          rank: profile.rank_position,
        },
      };

      console.log('Sending response:', responseData);

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, avatarUrl } = req.body;

      const updated = await userService.updateProfile(userId, {
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      });

      res.json({
        success: true,
        data: {
          id: updated.id,
          firstName: updated.first_name,
          lastName: updated.last_name,
          name: `${updated.first_name} ${updated.last_name}`,
          email: updated.email,
          avatarUrl: updated.avatar_url,
          updatedAt: updated.updated_at,
        },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      if (error.message === 'No valid fields to update') {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  },

  // Get user statistics
  getStatistics: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const stats = await userService.getUserStats(userId);

      res.json({
        success: true,
        data: {
          totalPoints: stats?.total_points || 0,
          challengesCompleted: stats?.total_challenges_completed || 0,
          goalsCompleted: stats?.total_goals_completed || 0,
          peerReviewsGiven: stats?.total_peer_reviews_given || 0,
          peerReviewsReceived: stats?.total_peer_reviews_received || 0,
          currentStreak: stats?.current_streak_days || 0,
          longestStreak: stats?.longest_streak_days || 0,
          level: stats?.level || 1,
          experiencePoints: stats?.experience_points || 0,
          rank: stats?.rank_position,
          lastActivity: stats?.last_activity_date,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete user account
  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.user.id;

      await userService.deleteUser(userId);

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
      const bcrypt = require('bcrypt');

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required',
        });
      }

      // Get user with password
      const user = await userService.getUserByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
        });
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userService.updatePassword(userId, hashedPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
