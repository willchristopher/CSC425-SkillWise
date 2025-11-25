const leaderboardService = require('../services/leaderboardService');

const leaderboardController = {
  // Get global leaderboard with rankings
  getLeaderboard: async (req, res, next) => {
    try {
      const { timeframe = 'all', limit = 50 } = req.query;
      const leaderboard = await leaderboardService.calculateRankings(timeframe);
      const topPerformers = leaderboard.slice(0, limit);
      
      res.json({
        success: true,
        data: {
          leaderboard: topPerformers,
          totalUsers: leaderboard.length,
          timeframe
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get specific user ranking and position
  getUserRanking: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user?.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const rank = await leaderboardService.getUserRank(userId);
      const userStats = await leaderboardService.calculateRankings('all');
      const userInfo = userStats.find(user => user.id == userId);

      res.json({
        success: true,
        data: {
          rank,
          userInfo,
          totalUsers: userStats.length
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user's points breakdown and history
  getPointsBreakdown: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user?.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // This would typically fetch from progress_events table
      const breakdown = {
        totalPoints: 0,
        sources: {
          challenges: 0,
          goals: 0,
          peer_reviews: 0,
          achievements: 0,
          streaks: 0
        },
        recentActivity: []
      };

      res.json({
        success: true,
        data: breakdown
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user achievements and badges
  getAchievements: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user?.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // This would typically fetch from achievements table
      const achievements = {
        earned: [],
        available: [
          {
            id: 'first_challenge',
            title: 'First Challenge',
            description: 'Complete your first coding challenge',
            points: 10,
            icon: '🎯',
            earned: false
          },
          {
            id: 'streak_7',
            title: 'Week Warrior',
            description: 'Maintain a 7-day learning streak',
            points: 25,
            icon: '🔥',
            earned: false
          }
        ]
      };

      res.json({
        success: true,
        data: achievements
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = leaderboardController;
