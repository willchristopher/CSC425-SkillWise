const { query } = require('../database/connection');

const progressController = {
  // Get user progress overview with statistics
  getProgress: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user?.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Get user statistics
      const statsQuery = `
        SELECT 
          us.*,
          u.username,
          u.created_at as user_since
        FROM user_statistics us
        JOIN users u ON us.user_id = u.id
        WHERE us.user_id = $1
      `;
      const statsResult = await db.query(statsQuery, [userId]);
      const userStats = statsResult.rows[0];

      // Get recent progress events
      const eventsQuery = `
        SELECT pe.*
        FROM progress_events pe
        WHERE pe.user_id = $1
        ORDER BY pe.created_at DESC
        LIMIT 20
      `;
      const eventsResult = await db.query(eventsQuery, [userId]);

      // Get goal progress
      const goalsQuery = `
        SELECT COUNT(*) as total_goals,
               COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_goals
        FROM goals
        WHERE user_id = $1
      `;
      const goalsResult = await db.query(goalsQuery, [userId]);

      res.json({
        success: true,
        data: {
          statistics: userStats || {
            user_id: userId,
            total_points: 0,
            challenges_completed: 0,
            goals_completed: 0,
            streak_days: 0
          },
          recentEvents: eventsResult.rows,
          goalProgress: goalsResult.rows[0]
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update progress event (log user activity)
  updateProgress: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { eventType, description, pointsEarned, metadata } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Insert progress event
      const eventQuery = `
        INSERT INTO progress_events (user_id, event_type, description, points_earned, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const eventResult = await db.query(eventQuery, [
        userId, 
        eventType, 
        description, 
        pointsEarned || 0,
        JSON.stringify(metadata || {})
      ]);

      // Update user statistics if points were earned
      if (pointsEarned && pointsEarned > 0) {
        const updateStatsQuery = `
          INSERT INTO user_statistics (user_id, total_points, last_activity_date)
          VALUES ($1, $2, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id)
          DO UPDATE SET 
            total_points = user_statistics.total_points + $2,
            last_activity_date = CURRENT_TIMESTAMP
        `;
        await db.query(updateStatsQuery, [userId, pointsEarned]);
      }

      res.json({
        success: true,
        data: eventResult.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Get progress analytics and charts data
  getAnalytics: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user?.id;
      const { timeframe = '30d' } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      let dateFilter = '';
      switch (timeframe) {
        case '7d':
          dateFilter = "WHERE pe.created_at >= NOW() - INTERVAL '7 days'";
          break;
        case '30d':
          dateFilter = "WHERE pe.created_at >= NOW() - INTERVAL '30 days'";
          break;
        case '90d':
          dateFilter = "WHERE pe.created_at >= NOW() - INTERVAL '90 days'";
          break;
        default:
          dateFilter = '';
      }

      // Get activity over time
      const activityQuery = `
        SELECT 
          DATE(pe.created_at) as date,
          COUNT(*) as events_count,
          SUM(pe.points_earned) as points_earned
        FROM progress_events pe
        WHERE pe.user_id = $1 ${dateFilter ? 'AND pe.created_at >= NOW() - INTERVAL $2' : ''}
        GROUP BY DATE(pe.created_at)
        ORDER BY date DESC
      `;

      const activityResult = await db.query(activityQuery, 
        dateFilter ? [userId, timeframe.replace('d', ' days')] : [userId]
      );

      // Get event type breakdown
      const breakdownQuery = `
        SELECT 
          pe.event_type,
          COUNT(*) as count,
          SUM(pe.points_earned) as total_points
        FROM progress_events pe
        WHERE pe.user_id = $1 ${dateFilter ? 'AND pe.created_at >= NOW() - INTERVAL $2' : ''}
        GROUP BY pe.event_type
      `;

      const breakdownResult = await db.query(breakdownQuery,
        dateFilter ? [userId, timeframe.replace('d', ' days')] : [userId]
      );

      res.json({
        success: true,
        data: {
          timeframe,
          activityOverTime: activityResult.rows,
          eventTypeBreakdown: breakdownResult.rows
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get learning milestones and achievements
  getMilestones: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user?.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Define milestones
      const milestones = [
        { id: 1, title: 'First Steps', description: 'Complete your first challenge', requirement: 1, type: 'challenges' },
        { id: 2, title: 'Getting Started', description: 'Complete 5 challenges', requirement: 5, type: 'challenges' },
        { id: 3, title: 'Challenger', description: 'Complete 10 challenges', requirement: 10, type: 'challenges' },
        { id: 4, title: 'Goal Setter', description: 'Create your first goal', requirement: 1, type: 'goals' },
        { id: 5, title: 'Achiever', description: 'Complete your first goal', requirement: 1, type: 'goals_completed' },
        { id: 6, title: 'Streak Starter', description: 'Maintain a 3-day streak', requirement: 3, type: 'streak' },
        { id: 7, title: 'Week Warrior', description: 'Maintain a 7-day streak', requirement: 7, type: 'streak' }
      ];

      // Get user stats to check milestone progress
      const statsQuery = `
        SELECT 
          us.challenges_completed,
          us.goals_completed,
          us.streak_days,
          (SELECT COUNT(*) FROM goals WHERE user_id = $1) as goals_created
        FROM user_statistics us
        WHERE us.user_id = $1
      `;
      
      const statsResult = await db.query(statsQuery, [userId]);
      const userStats = statsResult.rows[0] || {
        challenges_completed: 0,
        goals_completed: 0,
        streak_days: 0,
        goals_created: 0
      };

      // Check milestone completion
      const milestonesWithProgress = milestones.map(milestone => {
        let currentValue = 0;
        switch (milestone.type) {
          case 'challenges':
            currentValue = userStats.challenges_completed || 0;
            break;
          case 'goals':
            currentValue = userStats.goals_created || 0;
            break;
          case 'goals_completed':
            currentValue = userStats.goals_completed || 0;
            break;
          case 'streak':
            currentValue = userStats.streak_days || 0;
            break;
        }

        return {
          ...milestone,
          currentValue,
          isCompleted: currentValue >= milestone.requirement,
          progress: Math.min(100, (currentValue / milestone.requirement) * 100)
        };
      });

      res.json({
        success: true,
        data: {
          milestones: milestonesWithProgress,
          completedCount: milestonesWithProgress.filter(m => m.isCompleted).length,
          totalCount: milestones.length
        }
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = progressController;
