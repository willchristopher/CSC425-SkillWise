// Progress tracking business logic and database operations
const { query, withTransaction } = require('../database/connection');
const { AppError } = require('../middleware/errorHandler');

const progressService = {
  /**
   * Calculate overall user progress
   */
  calculateOverallProgress: async (userId) => {
    try {
      // Get user statistics
      const statsResult = await query(
        'SELECT * FROM user_statistics WHERE user_id = $1',
        [userId]
      );

      // Get goals progress
      const goalsResult = await query(
        `SELECT 
          COUNT(*) as total_goals,
          COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_goals,
          AVG(progress_percentage) as avg_progress
        FROM goals
        WHERE user_id = $1`,
        [userId]
      );

      // Get challenges attempted
      const challengesResult = await query(
        `SELECT 
          COUNT(DISTINCT challenge_id) as total_attempted,
          COUNT(DISTINCT CASE WHEN status = 'completed' THEN challenge_id END) as completed,
          AVG(CASE WHEN score IS NOT NULL THEN score END) as avg_score
        FROM submissions
        WHERE user_id = $1`,
        [userId]
      );

      // Get activity streak
      const streakResult = await query(
        `SELECT 
          COALESCE(current_streak_days, 0) as current_streak,
          COALESCE(longest_streak_days, 0) as longest_streak,
          last_activity_date
        FROM user_statistics
        WHERE user_id = $1`,
        [userId]
      );

      const stats = statsResult.rows[0] || {};
      const goals = goalsResult.rows[0] || {};
      const challenges = challengesResult.rows[0] || {};
      const streak = streakResult.rows[0] || {};

      return {
        level: stats.level || 1,
        experience_points: stats.experience_points || 0,
        total_points: stats.total_points || 0,
        goals: {
          total: parseInt(goals.total_goals) || 0,
          completed: parseInt(goals.completed_goals) || 0,
          average_progress: parseFloat(goals.avg_progress) || 0,
        },
        challenges: {
          total_attempted: parseInt(challenges.total_attempted) || 0,
          completed: parseInt(challenges.completed) || 0,
          average_score: parseFloat(challenges.avg_score) || 0,
        },
        streak: {
          current: parseInt(streak.current_streak) || 0,
          longest: parseInt(streak.longest_streak) || 0,
          last_activity: streak.last_activity_date,
        },
        peer_reviews: {
          given: stats.total_peer_reviews_given || 0,
          received: stats.total_peer_reviews_received || 0,
        },
      };
    } catch (error) {
      console.error('Calculate progress error:', error);
      throw new AppError('Failed to calculate progress', 500, 'PROGRESS_ERROR');
    }
  },

  /**
   * Track a learning event
   */
  trackEvent: async (userId, eventType, eventData = {}) => {
    try {
      return await withTransaction(async (transactionQuery) => {
        // Insert the event
        const result = await transactionQuery(
          `INSERT INTO progress_events (
            user_id, event_type, event_data, points_earned,
            related_goal_id, related_challenge_id, related_submission_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            userId,
            eventType,
            JSON.stringify(eventData),
            eventData.points || 0,
            eventData.goal_id || null,
            eventData.challenge_id || null,
            eventData.submission_id || null,
          ]
        );

        // Update streak
        await progressService.updateStreak(transactionQuery, userId);

        // Check for new achievements
        const leaderboardService = require('./leaderboardService');
        await leaderboardService.checkAchievements(userId);

        return result.rows[0];
      });
    } catch (error) {
      console.error('Track event error:', error);
      throw new AppError('Failed to track event', 500, 'TRACK_ERROR');
    }
  },

  /**
   * Update user's activity streak
   */
  updateStreak: async (transactionQuery, userId) => {
    try {
      console.log(
        `[progressService.updateStreak] Updating streak for user: ${userId}`
      );
      // Get current streak info
      const currentStats = await transactionQuery(
        'SELECT last_activity_date, current_streak_days, longest_streak_days FROM user_statistics WHERE user_id = $1',
        [userId]
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentStreak = 1;
      let longestStreak = 1;

      if (currentStats.rows.length > 0) {
        const stats = currentStats.rows[0];
        const lastActivity = stats.last_activity_date
          ? new Date(stats.last_activity_date)
          : null;

        if (lastActivity) {
          lastActivity.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor(
            (today - lastActivity) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 0) {
            // Same day, keep current streak
            currentStreak = stats.current_streak_days || 1;
          } else if (daysDiff === 1) {
            // Consecutive day, increment streak
            currentStreak = (stats.current_streak_days || 0) + 1;
          } else {
            // Streak broken, reset to 1
            currentStreak = 1;
          }
        }

        longestStreak = Math.max(currentStreak, stats.longest_streak_days || 0);
      }

      // Update or insert statistics
      console.log(
        `[progressService.updateStreak] Setting streak to ${currentStreak}, longest to ${longestStreak} for user ${userId}`
      );
      await transactionQuery(
        `INSERT INTO user_statistics (user_id, current_streak_days, longest_streak_days, last_activity_date)
         VALUES ($1, $2, $3, CURRENT_DATE)
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           current_streak_days = $2,
           longest_streak_days = GREATEST(user_statistics.longest_streak_days, $3),
           last_activity_date = CURRENT_DATE,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, currentStreak, longestStreak]
      );
      console.log(
        `[progressService.updateStreak] Streak update completed for user ${userId}`
      );
    } catch (error) {
      console.error('Update streak error:', error);
      // Don't throw, just log - streak update failure shouldn't block other operations
    }
  },

  /**
   * Generate progress analytics
   */
  generateAnalytics: async (userId, timeframe = 'week') => {
    try {
      let dateFilter = '';
      if (timeframe === 'day') {
        dateFilter = 'timestamp_occurred >= CURRENT_DATE';
      } else if (timeframe === 'week') {
        dateFilter = "timestamp_occurred >= CURRENT_DATE - INTERVAL '7 days'";
      } else if (timeframe === 'month') {
        dateFilter = "timestamp_occurred >= CURRENT_DATE - INTERVAL '30 days'";
      } else if (timeframe === 'year') {
        dateFilter = "timestamp_occurred >= CURRENT_DATE - INTERVAL '365 days'";
      }

      // Activity by day
      const activityByDay = await query(
        `SELECT 
          DATE(timestamp_occurred) as date,
          COUNT(*) as event_count,
          SUM(points_earned) as points_earned
        FROM progress_events
        WHERE user_id = $1 AND ${dateFilter}
        GROUP BY DATE(timestamp_occurred)
        ORDER BY date DESC`,
        [userId]
      );

      // Activity by type
      const activityByType = await query(
        `SELECT 
          event_type,
          COUNT(*) as count,
          SUM(points_earned) as total_points
        FROM progress_events
        WHERE user_id = $1 AND ${dateFilter}
        GROUP BY event_type
        ORDER BY count DESC`,
        [userId]
      );

      // Recent completions
      const recentCompletions = await query(
        `SELECT 
          pe.*,
          c.title as challenge_title,
          g.title as goal_title
        FROM progress_events pe
        LEFT JOIN challenges c ON pe.related_challenge_id = c.id
        LEFT JOIN goals g ON pe.related_goal_id = g.id
        WHERE pe.user_id = $1 
          AND pe.event_type IN ('points_awarded', 'goal_completed', 'challenge_submission')
          AND ${dateFilter}
        ORDER BY pe.timestamp_occurred DESC
        LIMIT 10`,
        [userId]
      );

      // Skills progress (from goals)
      const skillsProgress = await query(
        `SELECT 
          category,
          COUNT(*) as total_goals,
          COUNT(CASE WHEN is_completed THEN 1 END) as completed_goals,
          AVG(progress_percentage) as avg_progress
        FROM goals
        WHERE user_id = $1 AND category IS NOT NULL
        GROUP BY category
        ORDER BY avg_progress DESC`,
        [userId]
      );

      return {
        timeframe,
        activity_by_day: activityByDay.rows,
        activity_by_type: activityByType.rows,
        recent_completions: recentCompletions.rows,
        skills_progress: skillsProgress.rows,
      };
    } catch (error) {
      throw new AppError(
        'Failed to generate analytics',
        500,
        'ANALYTICS_ERROR'
      );
    }
  },

  /**
   * Check milestone completion
   */
  checkMilestones: async (userId) => {
    try {
      const stats = await query(
        'SELECT * FROM user_statistics WHERE user_id = $1',
        [userId]
      );

      if (stats.rows.length === 0) return [];

      const userStats = stats.rows[0];
      const milestones = [];

      // Define milestones
      const milestoneDefinitions = [
        {
          type: 'challenges',
          thresholds: [1, 5, 10, 25, 50, 100],
          label: 'Challenges Completed',
        },
        {
          type: 'goals',
          thresholds: [1, 3, 5, 10, 25],
          label: 'Goals Achieved',
        },
        {
          type: 'points',
          thresholds: [100, 500, 1000, 5000, 10000],
          label: 'Points Earned',
        },
        {
          type: 'reviews',
          thresholds: [1, 5, 10, 25, 50],
          label: 'Peer Reviews Given',
        },
        {
          type: 'streak',
          thresholds: [3, 7, 14, 30, 60, 100],
          label: 'Day Streak',
        },
        {
          type: 'level',
          thresholds: [2, 5, 10, 15, 20],
          label: 'Level Reached',
        },
      ];

      for (const milestone of milestoneDefinitions) {
        let currentValue = 0;
        switch (milestone.type) {
          case 'challenges':
            currentValue = userStats.total_challenges_completed || 0;
            break;
          case 'goals':
            currentValue = userStats.total_goals_completed || 0;
            break;
          case 'points':
            currentValue = userStats.total_points || 0;
            break;
          case 'reviews':
            currentValue = userStats.total_peer_reviews_given || 0;
            break;
          case 'streak':
            currentValue = userStats.current_streak_days || 0;
            break;
          case 'level':
            currentValue = userStats.level || 1;
            break;
        }

        // Find next milestone
        const nextThreshold = milestone.thresholds.find(
          (t) => t > currentValue
        );
        const achievedThresholds = milestone.thresholds.filter(
          (t) => t <= currentValue
        );

        milestones.push({
          type: milestone.type,
          label: milestone.label,
          current_value: currentValue,
          achieved: achievedThresholds,
          next_threshold: nextThreshold || null,
          progress_to_next: nextThreshold
            ? Math.round((currentValue / nextThreshold) * 100)
            : 100,
        });
      }

      return milestones;
    } catch (error) {
      throw new AppError('Failed to check milestones', 500, 'MILESTONE_ERROR');
    }
  },

  /**
   * Get skill progress based on challenges and goals
   */
  getSkillProgress: async (userId) => {
    try {
      // Get progress by category from submissions
      const challengeProgress = await query(
        `SELECT 
          c.category,
          COUNT(DISTINCT s.challenge_id) as challenges_attempted,
          COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.challenge_id END) as challenges_completed,
          AVG(CASE WHEN s.score IS NOT NULL THEN s.score END) as avg_score
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = $1
        GROUP BY c.category
        ORDER BY challenges_completed DESC`,
        [userId]
      );

      // Get progress from goals
      const goalProgress = await query(
        `SELECT 
          category,
          COUNT(*) as total_goals,
          COUNT(CASE WHEN is_completed THEN 1 END) as completed_goals,
          AVG(progress_percentage) as avg_progress
        FROM goals
        WHERE user_id = $1 AND category IS NOT NULL
        GROUP BY category`,
        [userId]
      );

      // Combine into skill map
      const skillMap = {};

      for (const challenge of challengeProgress.rows) {
        if (!skillMap[challenge.category]) {
          skillMap[challenge.category] = {
            category: challenge.category,
            challenges_attempted: 0,
            challenges_completed: 0,
            goals_total: 0,
            goals_completed: 0,
            avg_score: 0,
            avg_progress: 0,
          };
        }
        skillMap[challenge.category].challenges_attempted =
          parseInt(challenge.challenges_attempted) || 0;
        skillMap[challenge.category].challenges_completed =
          parseInt(challenge.challenges_completed) || 0;
        skillMap[challenge.category].avg_score =
          parseFloat(challenge.avg_score) || 0;
      }

      for (const goal of goalProgress.rows) {
        if (!skillMap[goal.category]) {
          skillMap[goal.category] = {
            category: goal.category,
            challenges_attempted: 0,
            challenges_completed: 0,
            goals_total: 0,
            goals_completed: 0,
            avg_score: 0,
            avg_progress: 0,
          };
        }
        skillMap[goal.category].goals_total = parseInt(goal.total_goals) || 0;
        skillMap[goal.category].goals_completed =
          parseInt(goal.completed_goals) || 0;
        skillMap[goal.category].avg_progress =
          parseFloat(goal.avg_progress) || 0;
      }

      // Calculate overall skill level for each category
      const skills = Object.values(skillMap).map((skill) => ({
        ...skill,
        skill_level: Math.round(
          skill.avg_score * 0.4 +
            skill.avg_progress * 0.3 +
            (skill.challenges_completed /
              Math.max(skill.challenges_attempted, 1)) *
              100 *
              0.3
        ),
      }));

      return skills.sort((a, b) => b.skill_level - a.skill_level);
    } catch (error) {
      throw new AppError('Failed to get skill progress', 500, 'SKILLS_ERROR');
    }
  },

  /**
   * Get recent activity for a user
   */
  getRecentActivity: async (userId, limit = 20) => {
    try {
      const result = await query(
        `SELECT 
          pe.*,
          c.title as challenge_title,
          g.title as goal_title
        FROM progress_events pe
        LEFT JOIN challenges c ON pe.related_challenge_id = c.id
        LEFT JOIN goals g ON pe.related_goal_id = g.id
        WHERE pe.user_id = $1
        ORDER BY pe.timestamp_occurred DESC
        LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      throw new AppError(
        'Failed to get recent activity',
        500,
        'ACTIVITY_ERROR'
      );
    }
  },
};

module.exports = progressService;
