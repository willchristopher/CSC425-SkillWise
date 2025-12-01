// Leaderboard controller for rankings and points
const pool = require('../database/connection');

const leaderboardController = {
  // Get global leaderboard
  getLeaderboard: async (req, res, next) => {
    try {
      const { timeframe = 'all-time', limit = 20, offset = 0 } = req.query;

      // Get leaderboard from user_statistics
      const result = await pool.query(
        `
        SELECT 
          us.user_id,
          u.first_name,
          u.last_name,
          u.email,
          us.total_points,
          us.level,
          us.total_challenges_completed,
          us.total_goals_completed,
          us.current_streak_days,
          us.rank_position,
          ROW_NUMBER() OVER (ORDER BY us.total_points DESC, us.total_challenges_completed DESC) as rank
        FROM user_statistics us
        JOIN users u ON us.user_id = u.id
        ORDER BY us.total_points DESC, us.total_challenges_completed DESC
        LIMIT $1 OFFSET $2
      `,
        [limit, offset]
      );

      // Get total count
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM user_statistics'
      );
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: result.rows.map((row) => ({
          id: row.user_id,
          rank: parseInt(row.rank),
          name: `${row.first_name} ${row.last_name}`,
          initials: (
            row.first_name[0] + (row.last_name?.[0] || '')
          ).toUpperCase(),
          points: row.total_points || 0,
          level: row.level || 1,
          completedChallenges: row.total_challenges_completed || 0,
          completedGoals: row.total_goals_completed || 0,
          streak: row.current_streak_days || 0,
          isCurrentUser: row.user_id === req.user?.id,
        })),
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + result.rows.length < total,
        },
      });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      next(error);
    }
  },

  // Get user ranking
  getUserRanking: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Get user's rank and stats
      const result = await pool.query(
        `
        WITH ranked_users AS (
          SELECT 
            user_id,
            total_points,
            level,
            total_challenges_completed,
            total_goals_completed,
            current_streak_days,
            ROW_NUMBER() OVER (ORDER BY total_points DESC, total_challenges_completed DESC) as rank
          FROM user_statistics
        )
        SELECT 
          ru.*,
          u.first_name,
          u.last_name,
          (SELECT COUNT(*) FROM user_statistics) as total_users
        FROM ranked_users ru
        JOIN users u ON ru.user_id = u.id
        WHERE ru.user_id = $1
      `,
        [userId]
      );

      if (result.rows.length === 0) {
        // Create user stats if not exists
        await pool.query(
          `
          INSERT INTO user_statistics (user_id, total_points, level)
          VALUES ($1, 0, 1)
          ON CONFLICT (user_id) DO NOTHING
        `,
          [userId]
        );

        return res.json({
          success: true,
          data: {
            rank: null,
            points: 0,
            level: 1,
            completedChallenges: 0,
            completedGoals: 0,
            streak: 0,
            totalUsers: 1,
            percentile: 0,
          },
        });
      }

      const userStats = result.rows[0];
      const percentile = Math.round(
        (1 - userStats.rank / userStats.total_users) * 100
      );

      res.json({
        success: true,
        data: {
          rank: parseInt(userStats.rank),
          points: userStats.total_points || 0,
          level: userStats.level || 1,
          completedChallenges: userStats.total_challenges_completed || 0,
          completedGoals: userStats.total_goals_completed || 0,
          streak: userStats.current_streak_days || 0,
          totalUsers: parseInt(userStats.total_users),
          percentile,
        },
      });
    } catch (error) {
      console.error('Get user ranking error:', error);
      next(error);
    }
  },

  // Get points breakdown
  getPointsBreakdown: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Get breakdown of how user earned their points
      const result = await pool.query(
        `
        SELECT 
          us.total_points,
          us.total_challenges_completed,
          us.total_goals_completed,
          us.total_peer_reviews_given,
          us.level,
          us.experience_points
        FROM user_statistics us
        WHERE us.user_id = $1
      `,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          data: {
            totalPoints: 0,
            breakdown: [],
          },
        });
      }

      const stats = result.rows[0];

      // Estimate points breakdown (challenges: 10 pts each, goals: 25 pts each, reviews: 5 pts each)
      const breakdown = [
        {
          category: 'Challenges',
          points: stats.total_challenges_completed * 10,
          count: stats.total_challenges_completed,
        },
        {
          category: 'Goals',
          points: stats.total_goals_completed * 25,
          count: stats.total_goals_completed,
        },
        {
          category: 'Peer Reviews',
          points: stats.total_peer_reviews_given * 5,
          count: stats.total_peer_reviews_given,
        },
      ].filter((item) => item.count > 0);

      res.json({
        success: true,
        data: {
          totalPoints: stats.total_points,
          level: stats.level,
          experiencePoints: stats.experience_points,
          breakdown,
        },
      });
    } catch (error) {
      console.error('Get points breakdown error:', error);
      next(error);
    }
  },

  // Get achievements
  getAchievements: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `
        SELECT 
          a.id,
          a.name,
          a.description,
          a.icon,
          a.points,
          a.category,
          ua.earned_at
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
        ORDER BY ua.earned_at DESC NULLS LAST, a.points DESC
      `,
        [userId]
      );

      res.json({
        success: true,
        data: result.rows.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          icon: row.icon,
          points: row.points,
          category: row.category,
          earned: !!row.earned_at,
          earnedAt: row.earned_at,
        })),
      });
    } catch (error) {
      console.error('Get achievements error:', error);
      next(error);
    }
  },
};

module.exports = leaderboardController;
