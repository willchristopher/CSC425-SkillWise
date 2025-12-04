const progressService = require('../services/progressService');

const progressController = {
  // Get user progress overview
  getProgress: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const progress = await progressService.calculateOverallProgress(userId);

      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get progress overview (alias for frontend compatibility)
  getOverview: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const overview = await progressService.calculateOverallProgress(userId);

      res.json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  },

  // Track a progress event
  updateProgress: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { eventType, metadata, points } = req.body;

      if (!eventType) {
        return res.status(400).json({
          success: false,
          error: 'Event type is required',
        });
      }

      const event = await progressService.trackEvent(
        userId,
        eventType,
        metadata || {},
        points
      );

      res.status(201).json({
        success: true,
        data: event,
        message: 'Progress event tracked successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get progress analytics
  getAnalytics: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { period } = req.query;

      const analytics = await progressService.generateAnalytics(
        userId,
        period || 'week'
      );

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get skill progress
  getSkills: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const skills = await progressService.getSkillProgress(userId);

      res.json({
        success: true,
        data: skills,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get milestones
  getMilestones: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const milestones = await progressService.checkMilestones(userId);

      res.json({
        success: true,
        data: milestones,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get activity feed
  getActivity: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { limit } = req.query;

      const activity = await progressService.getRecentActivity(
        userId,
        parseInt(limit) || 20
      );

      res.json({
        success: true,
        data: { activities: activity },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user stats (combined with progress)
  getStats: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { query } = require('../database/connection');

      // Get user statistics
      const statsResult = await query(
        `
        SELECT 
          us.*,
          (SELECT COUNT(*) FROM goals WHERE user_id = $1) as total_goals_created,
          (SELECT COUNT(*) FROM submissions WHERE user_id = $1) as total_submissions
        FROM user_statistics us
        WHERE us.user_id = $1
      `,
        [userId]
      );

      if (statsResult.rows.length === 0) {
        // Initialize stats if they don't exist
        await query(
          `
          INSERT INTO user_statistics (user_id) VALUES ($1)
          ON CONFLICT (user_id) DO NOTHING
        `,
          [userId]
        );

        return res.json({
          success: true,
          data: {
            total_points: 0,
            total_challenges_completed: 0,
            total_goals_completed: 0,
            total_peer_reviews_given: 0,
            total_peer_reviews_received: 0,
            current_streak_days: 0,
            longest_streak_days: 0,
            level: 1,
            experience_points: 0,
          },
        });
      }

      res.json({
        success: true,
        data: statsResult.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // Get streak information
  getStreak: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { query } = require('../database/connection');

      const result = await query(
        `
        SELECT 
          current_streak_days,
          longest_streak_days,
          last_activity_date
        FROM user_statistics
        WHERE user_id = $1
      `,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          data: {
            currentStreak: 0,
            longestStreak: 0,
            lastActivity: null,
          },
        });
      }

      const stats = result.rows[0];
      res.json({
        success: true,
        data: {
          currentStreak: stats.current_streak_days,
          longestStreak: stats.longest_streak_days,
          lastActivity: stats.last_activity_date,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = progressController;
