const userService = require('../services/userService');

// Helper function to format user response data
const formatUserResponse = (profile, includeStats = true) => {
  const user = {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    name: `${profile.first_name} ${profile.last_name}`,
    email: profile.email,
    profileIcon: profile.profile_image,
    bio: profile.bio,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
  
  if (includeStats) {
    user.stats = {
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
    };
  }
  
  return user;
};

// Helper function to format stats object
const formatStats = (stats) => ({
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
});

const userController = {
  // Get user profile
  getProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const profile = await userService.getFullProfile(userId);

      if (!profile) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, data: formatUserResponse(profile) });
    } catch (error) {
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, bio, profileIcon } = req.body;

      const updated = await userService.updateProfile(userId, {
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        profile_icon: profileIcon,
      });

      res.json({
        success: true,
        data: formatUserResponse(updated, false),
        message: 'Profile updated successfully',
      });
    } catch (error) {
      if (error.message === 'No valid fields to update') {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  },

  // Get user statistics
  getStatistics: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const stats = await userService.getUserStats(userId);

      res.json({ success: true, data: formatStats(stats) });
    } catch (error) {
      next(error);
    }
  },

  // Delete user account
  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.user.id;
      await userService.deleteUser(userId);
      res.json({ success: true, message: 'Account deleted successfully' });
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
        return res.status(400).json({ success: false, error: 'Current password and new password are required' });
      }

      const user = await userService.getUserByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userService.updatePassword(userId, hashedPassword);

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
