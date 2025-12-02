const leaderboardService = require('../services/leaderboardService');

const leaderboardController = {
  // Get global leaderboard
  getLeaderboard: async (req, res, next) => {
    try {
      const { timeframe, limit, offset } = req.query;

      const leaderboard = await leaderboardService.getLeaderboard({
        timeframe: timeframe || 'all-time',
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
      });

      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user's ranking
  getUserRanking: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { timeframe } = req.query;

      const ranking = await leaderboardService.getUserRanking(
        userId,
        timeframe || 'all-time'
      );

      res.json({
        success: true,
        data: ranking,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get points breakdown for user
  getPointsBreakdown: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const breakdown = await leaderboardService.getPointsBreakdown(userId);

      res.json({
        success: true,
        data: breakdown,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user's achievements
  getAchievements: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const achievements = await leaderboardService.getAchievements(userId);

      res.json({
        success: true,
        data: achievements,
      });
    } catch (error) {
      next(error);
    }
  },

  // Award points to a user (admin or system)
  awardPoints: async (req, res, next) => {
    try {
      const { userId, points, reason, category } = req.body;

      if (!userId || !points || !reason) {
        return res.status(400).json({
          success: false,
          error: 'User ID, points, and reason are required',
        });
      }

      const result = await leaderboardService.awardPoints(
        userId,
        points,
        reason,
        category
      );

      res.json({
        success: true,
        data: result,
        message: `${points} points awarded successfully`,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all available achievements
  getAllAchievements: async (req, res, next) => {
    try {
      const { query } = require('../database/connection');

      const result = await query(`
        SELECT id, name, description, badge_icon, points_required, category, tier
        FROM achievements
        ORDER BY points_required ASC, category, name
      `);

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user statistics
  getUserStats: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const { query } = require('../database/connection');

      const result = await query(
        `
        SELECT us.*, u.name, u.email
        FROM user_statistics us
        JOIN users u ON u.id = us.user_id
        WHERE us.user_id = $1
      `,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User statistics not found',
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // Get top performers in a category
  getTopPerformers: async (req, res, next) => {
    try {
      const { category, limit } = req.query;
      const { query: dbQuery } = require('../database/connection');

      let orderBy = 'total_points';
      switch (category) {
        case 'challenges':
          orderBy = 'total_challenges_completed';
          break;
        case 'goals':
          orderBy = 'total_goals_completed';
          break;
        case 'reviews':
          orderBy = 'total_peer_reviews_given';
          break;
        case 'streak':
          orderBy = 'current_streak_days';
          break;
      }

      const result = await dbQuery(
        `
        SELECT us.*, u.name, u.avatar_url
        FROM user_statistics us
        JOIN users u ON u.id = us.user_id
        ORDER BY ${orderBy} DESC
        LIMIT $1
      `,
        [parseInt(limit) || 10]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = leaderboardController;
