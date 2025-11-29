const { query } = require('../database/connection');

const leaderboardService = {
  // Calculate user rankings based on points and achievements
  calculateRankings: async (timeframe = 'all') => {
    try {
      let whereClause = '';
      const params = [];

      if (timeframe === 'weekly') {
        whereClause = 'WHERE us.updated_at >= NOW() - INTERVAL \'7 days\'';
      } else if (timeframe === 'monthly') {
        whereClause = 'WHERE us.updated_at >= NOW() - INTERVAL \'30 days\'';
      }

      const query = `
        SELECT 
          u.id,
          u.username,
          u.email,
          us.total_points,
          us.challenges_completed,
          us.goals_completed,
          us.streak_days,
          ROW_NUMBER() OVER (ORDER BY us.total_points DESC, us.challenges_completed DESC) as rank
        FROM users u
        LEFT JOIN user_statistics us ON u.id = us.user_id
        ${whereClause}
        ORDER BY us.total_points DESC, us.challenges_completed DESC
        LIMIT $1
      `;

      params.push(100); // Limit to top 100
      const result = await query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error calculating rankings:', error);
      throw error;
    }
  },

  // Update user points for various activities
  updateUserPoints: async (userId, points, reason) => {
    try {
      // Update user statistics
      const updateQuery = `
        INSERT INTO user_statistics (user_id, total_points, last_activity_date)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id)
        DO UPDATE SET 
          total_points = user_statistics.total_points + $2,
          last_activity_date = CURRENT_TIMESTAMP
      `;

      await query(updateQuery, [userId, points]);

      // Log the point change as a progress event
      const logQuery = `
        INSERT INTO progress_events (user_id, event_type, description, points_earned, created_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      `;

      await query(logQuery, [userId, 'points_earned', reason, points]);

      return { success: true, pointsAdded: points };
    } catch (error) {
      console.error('Error updating user points:', error);
      throw error;
    }
  },

  // Get top performers with details
  getTopPerformers: async (limit = 10) => {
    try {
      const query = `
        SELECT 
          u.id,
          u.username,
          u.email,
          us.total_points,
          us.challenges_completed,
          us.goals_completed,
          us.streak_days,
          us.last_activity_date,
          ROW_NUMBER() OVER (ORDER BY us.total_points DESC, us.challenges_completed DESC) as rank
        FROM users u
        LEFT JOIN user_statistics us ON u.id = us.user_id
        WHERE us.total_points > 0
        ORDER BY us.total_points DESC, us.challenges_completed DESC
        LIMIT $1
      `;

      const result = await query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting top performers:', error);
      throw error;
    }
  },

  // Calculate achievement points based on achievement type
  calculateAchievementPoints: (achievement) => {
    const pointsMap = {
      'first_challenge': 10,
      'first_goal': 15,
      'streak_7': 25,
      'streak_30': 100,
      'challenge_master': 50,
      'goal_setter': 20,
      'peer_reviewer': 30,
      'ai_collaborator': 15
    };

    return pointsMap[achievement.type] || 5;
  },

  // Get user's current rank
  getUserRank: async (userId) => {
    try {
      const query = `
        WITH ranked_users AS (
          SELECT 
            u.id,
            ROW_NUMBER() OVER (ORDER BY us.total_points DESC, us.challenges_completed DESC) as rank
          FROM users u
          LEFT JOIN user_statistics us ON u.id = us.user_id
          WHERE us.total_points > 0
        )
        SELECT rank FROM ranked_users WHERE id = $1
      `;

      const result = await query(query, [userId]);
      return result.rows[0]?.rank || null;
    } catch (error) {
      console.error('Error getting user rank:', error);
      throw error;
    }
  },
};

module.exports = leaderboardService;
