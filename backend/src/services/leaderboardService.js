// Leaderboard business logic and database operations
const { query, withTransaction } = require('../database/connection');
const { AppError } = require('../middleware/errorHandler');

const leaderboardService = {
  /**
   * Get global leaderboard with rankings
   * Returns ALL active users, even those without stats (they get 0 points)
   */
  getLeaderboard: async (filters = {}) => {
    try {
      const { timeframe = 'all-time', limit = 50, offset = 0 } = filters;

      let sql = '';
      const params = [];
      let paramCount = 0;

      if (timeframe === 'all-time') {
        // Get ALL active users with their stats (LEFT JOIN so users without stats still appear)
        sql = `
          SELECT 
            u.id as user_id,
            u.first_name,
            u.last_name,
            u.profile_image,
            COALESCE(us.total_points, 0) as total_points,
            COALESCE(us.total_challenges_completed, 0) as total_challenges_completed,
            COALESCE(us.total_goals_completed, 0) as total_goals_completed,
            COALESCE(us.total_peer_reviews_given, 0) as total_peer_reviews_given,
            COALESCE(us.level, 1) as level,
            COALESCE(us.experience_points, 0) as experience_points,
            COALESCE(us.current_streak_days, 0) as current_streak_days,
            COALESCE(us.longest_streak_days, 0) as longest_streak_days,
            COALESCE(us.average_score, 0) as average_score,
            RANK() OVER (ORDER BY COALESCE(us.total_points, 0) DESC, u.created_at ASC) as rank_position
          FROM users u
          LEFT JOIN user_statistics us ON u.id = us.user_id
          WHERE u.is_active = true
          ORDER BY COALESCE(us.total_points, 0) DESC, u.created_at ASC
        `;
      } else {
        // For daily/weekly/monthly, calculate from progress_events
        // Still include ALL users, showing 0 for those without activity in timeframe
        let dateFilter = '';
        if (timeframe === 'daily') {
          dateFilter = 'AND pe.timestamp_occurred >= CURRENT_DATE';
        } else if (timeframe === 'weekly') {
          dateFilter =
            "AND pe.timestamp_occurred >= DATE_TRUNC('week', CURRENT_DATE)";
        } else if (timeframe === 'monthly') {
          dateFilter =
            "AND pe.timestamp_occurred >= DATE_TRUNC('month', CURRENT_DATE)";
        }

        sql = `
          SELECT 
            u.id as user_id,
            u.first_name,
            u.last_name,
            u.profile_image,
            COALESCE(SUM(pe.points_earned), 0) as total_points,
            COUNT(CASE WHEN pe.event_type = 'points_awarded' THEN 1 END) as total_challenges_completed,
            COUNT(CASE WHEN pe.event_type = 'goal_completed' THEN 1 END) as total_goals_completed,
            COUNT(CASE WHEN pe.event_type = 'peer_review_given' THEN 1 END) as total_peer_reviews_given,
            COALESCE(us.level, 1) as level,
            COALESCE(us.experience_points, 0) as experience_points,
            COALESCE(us.current_streak_days, 0) as current_streak_days,
            COALESCE(us.longest_streak_days, 0) as longest_streak_days,
            COALESCE(us.average_score, 0) as average_score,
            RANK() OVER (ORDER BY COALESCE(SUM(pe.points_earned), 0) DESC, u.created_at ASC) as rank_position
          FROM users u
          LEFT JOIN progress_events pe ON u.id = pe.user_id ${dateFilter}
          LEFT JOIN user_statistics us ON u.id = us.user_id
          WHERE u.is_active = true
          GROUP BY u.id, us.level, us.experience_points, us.current_streak_days, 
                   us.longest_streak_days, us.average_score
          ORDER BY total_points DESC, u.created_at ASC
        `;
      }

      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(limit);

      paramCount++;
      sql += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await query(sql, params);

      // Get total count of all active users
      const countSql = 'SELECT COUNT(*) FROM users WHERE is_active = true';
      const countResult = await query(countSql);
      const totalCount = parseInt(countResult.rows[0].count);

      // Return as 'rankings' to match frontend expectations
      return {
        rankings: result.rows,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + result.rows.length < totalCount,
        },
      };
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw new AppError('Failed to get leaderboard', 500, 'LEADERBOARD_ERROR');
    }
  },

  /**
   * Get user's ranking
   */
  getUserRanking: async (userId) => {
    try {
      // Get user's stats and ranking among ALL users
      const result = await query(
        `WITH ranked_users AS (
          SELECT 
            u.id as user_id,
            u.first_name,
            u.last_name,
            COALESCE(us.total_points, 0) as total_points,
            COALESCE(us.total_challenges_completed, 0) as total_challenges_completed,
            COALESCE(us.total_goals_completed, 0) as total_goals_completed,
            COALESCE(us.total_peer_reviews_given, 0) as total_peer_reviews_given,
            COALESCE(us.level, 1) as level,
            COALESCE(us.experience_points, 0) as experience_points,
            COALESCE(us.current_streak_days, 0) as current_streak_days,
            COALESCE(us.longest_streak_days, 0) as longest_streak_days,
            RANK() OVER (ORDER BY COALESCE(us.total_points, 0) DESC, u.created_at ASC) as rank_position
          FROM users u
          LEFT JOIN user_statistics us ON u.id = us.user_id
          WHERE u.is_active = true
        )
        SELECT *, (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users
        FROM ranked_users
        WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        // User not found - return default
        const totalUsersResult = await query(
          'SELECT COUNT(*) FROM users WHERE is_active = true'
        );
        return {
          user_id: userId,
          rank_position: null,
          total_points: 0,
          total_challenges_completed: 0,
          total_goals_completed: 0,
          total_peer_reviews_given: 0,
          level: 1,
          experience_points: 0,
          current_streak_days: 0,
          longest_streak_days: 0,
          total_users: parseInt(totalUsersResult.rows[0].count),
        };
      }

      return result.rows[0];
    } catch (error) {
      console.error('Get user ranking error:', error);
      throw new AppError('Failed to get user ranking', 500, 'RANKING_ERROR');
    }
  },

  /**
   * Get points breakdown for a user
   */
  getPointsBreakdown: async (userId) => {
    try {
      // Get points by category
      const result = await query(
        `SELECT 
          event_type,
          SUM(points_earned) as total_points,
          COUNT(*) as event_count
        FROM progress_events
        WHERE user_id = $1 AND points_earned > 0
        GROUP BY event_type
        ORDER BY total_points DESC`,
        [userId]
      );

      // Get recent point transactions
      const recentResult = await query(
        `SELECT 
          pe.*,
          c.title as challenge_title
        FROM progress_events pe
        LEFT JOIN challenges c ON pe.related_challenge_id = c.id
        WHERE pe.user_id = $1 AND pe.points_earned > 0
        ORDER BY pe.timestamp_occurred DESC
        LIMIT 20`,
        [userId]
      );

      // Get total points
      const totalResult = await query(
        'SELECT total_points, experience_points FROM user_statistics WHERE user_id = $1',
        [userId]
      );

      return {
        breakdown: result.rows,
        recent_transactions: recentResult.rows,
        total_points: totalResult.rows[0]?.total_points || 0,
        experience_points: totalResult.rows[0]?.experience_points || 0,
      };
    } catch (error) {
      throw new AppError('Failed to get points breakdown', 500, 'POINTS_ERROR');
    }
  },

  /**
   * Get user achievements
   */
  getAchievements: async (userId) => {
    try {
      // Get all achievements with user's progress
      const result = await query(
        `SELECT 
          a.*,
          ua.earned_at,
          ua.progress_data,
          CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as earned
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
        WHERE a.is_active = true
        ORDER BY ua.earned_at DESC NULLS LAST, a.rarity DESC`,
        [userId]
      );

      // Count earned achievements
      const earnedCount = result.rows.filter((a) => a.earned).length;
      const totalCount = result.rows.length;

      return {
        achievements: result.rows,
        earned_count: earnedCount,
        total_count: totalCount,
        completion_percentage:
          totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0,
      };
    } catch (error) {
      throw new AppError(
        'Failed to get achievements',
        500,
        'ACHIEVEMENTS_ERROR'
      );
    }
  },

  /**
   * Update user points
   */
  updateUserPoints: async (userId, points, reason) => {
    try {
      return await withTransaction(async (transactionQuery) => {
        // Update user statistics
        await transactionQuery(
          `INSERT INTO user_statistics (user_id, total_points, experience_points)
           VALUES ($1, $2, $2)
           ON CONFLICT (user_id) 
           DO UPDATE SET 
             total_points = user_statistics.total_points + $2,
             experience_points = user_statistics.experience_points + $2,
             updated_at = CURRENT_TIMESTAMP`,
          [userId, points]
        );

        // Log the points change
        await transactionQuery(
          `INSERT INTO progress_events (user_id, event_type, event_data, points_earned)
           VALUES ($1, $2, $3, $4)`,
          [userId, 'points_manual_update', JSON.stringify({ reason }), points]
        );

        // Return updated stats
        const result = await transactionQuery(
          'SELECT * FROM user_statistics WHERE user_id = $1',
          [userId]
        );

        return result.rows[0];
      });
    } catch (error) {
      throw new AppError('Failed to update points', 500, 'UPDATE_POINTS_ERROR');
    }
  },

  /**
   * Recalculate and update leaderboard rankings
   */
  recalculateRankings: async () => {
    try {
      await query(`
        WITH ranked AS (
          SELECT 
            user_id,
            RANK() OVER (ORDER BY total_points DESC) as new_rank
          FROM user_statistics
        )
        UPDATE user_statistics us
        SET rank_position = r.new_rank
        FROM ranked r
        WHERE us.user_id = r.user_id
      `);

      return { success: true, message: 'Rankings recalculated' };
    } catch (error) {
      throw new AppError('Failed to recalculate rankings', 500, 'RECALC_ERROR');
    }
  },

  /**
   * Check and award achievements
   */
  checkAchievements: async (userId) => {
    try {
      // Get user stats
      const statsResult = await query(
        'SELECT * FROM user_statistics WHERE user_id = $1',
        [userId]
      );

      if (statsResult.rows.length === 0) return [];

      const stats = statsResult.rows[0];
      const newAchievements = [];

      // Get achievements user hasn't earned
      const unearnedResult = await query(
        `SELECT a.* FROM achievements a
         WHERE a.is_active = true
         AND NOT EXISTS (
           SELECT 1 FROM user_achievements ua 
           WHERE ua.achievement_id = a.id AND ua.user_id = $1
         )`,
        [userId]
      );

      for (const achievement of unearnedResult.rows) {
        const criteria = achievement.criteria;
        let earned = false;

        // Check each criteria type
        if (
          criteria.challenges_completed &&
          stats.total_challenges_completed >= criteria.challenges_completed
        ) {
          earned = true;
        }
        if (
          criteria.goals_completed &&
          stats.total_goals_completed >= criteria.goals_completed
        ) {
          earned = true;
        }
        if (
          criteria.points_earned &&
          stats.total_points >= criteria.points_earned
        ) {
          earned = true;
        }
        if (
          criteria.reviews_given &&
          stats.total_peer_reviews_given >= criteria.reviews_given
        ) {
          earned = true;
        }
        if (criteria.level_reached && stats.level >= criteria.level_reached) {
          earned = true;
        }
        if (
          criteria.streak_days &&
          stats.current_streak_days >= criteria.streak_days
        ) {
          earned = true;
        }

        if (earned) {
          // Award the achievement
          await query(
            `INSERT INTO user_achievements (user_id, achievement_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, achievement_id) DO NOTHING`,
            [userId, achievement.id]
          );

          // Award achievement points
          if (achievement.points_reward > 0) {
            await query(
              `UPDATE user_statistics 
               SET total_points = total_points + $1,
                   experience_points = experience_points + $1
               WHERE user_id = $2`,
              [achievement.points_reward, userId]
            );
          }

          newAchievements.push(achievement);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Check achievements error:', error);
      return [];
    }
  },
};

module.exports = leaderboardService;
