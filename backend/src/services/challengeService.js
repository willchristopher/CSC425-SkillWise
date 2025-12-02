// Challenge business logic and operations
const { query, withTransaction } = require('../database/connection');
const { z } = require('zod');
const aiService = require('./aiService');
const aiFeedbackService = require('./aiFeedbackService');
const { AppError } = require('../middleware/errorHandler');

// Validation schemas
const challengeCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  instructions: z.string().min(1),
  category: z.string().min(1).max(100),
  difficulty_level: z.enum(['easy', 'medium', 'hard']).default('medium'),
  estimated_time_minutes: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().int().positive().optional()),
  points_reward: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 10 : parsed;
    }
    return val;
  }, z.number().int().min(1).default(10)),
  max_attempts: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 3 : parsed;
    }
    return val;
  }, z.number().int().min(1).default(3)),
  requires_peer_review: z.boolean().default(false),
  goal_id: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  learning_objectives: z.array(z.string()).default([]),
});

const challengeUpdateSchema = challengeCreateSchema.partial();

const challengeService = {
  /**
   * Get all challenges with filtering options
   */
  getAllChallenges: async (filters = {}, userId = null) => {
    try {
      let sql = `
        SELECT 
          c.*,
          u.first_name as creator_first_name,
          u.last_name as creator_last_name,
          COUNT(s.id) as submission_count,
          AVG(CASE WHEN s.status = 'completed' THEN s.score ELSE NULL END) as average_score,
          (SELECT status FROM submissions WHERE challenge_id = c.id AND user_id = $1 ORDER BY submitted_at DESC LIMIT 1) as user_submission_status,
          (SELECT id FROM submissions WHERE challenge_id = c.id AND user_id = $1 ORDER BY submitted_at DESC LIMIT 1) as user_submission_id,
          (SELECT score FROM submissions WHERE challenge_id = c.id AND user_id = $1 ORDER BY submitted_at DESC LIMIT 1) as user_score,
          (SELECT COUNT(*) FROM submissions WHERE challenge_id = c.id AND user_id = $1) as user_attempts
        FROM challenges c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN submissions s ON c.id = s.challenge_id
        WHERE c.is_active = true
      `;

      const params = [userId || null];
      let paramCount = 1;

      // Apply filters
      if (filters.category) {
        paramCount++;
        sql += ` AND c.category = $${paramCount}`;
        params.push(filters.category);
      }

      if (filters.difficulty) {
        paramCount++;
        sql += ` AND c.difficulty_level = $${paramCount}`;
        params.push(filters.difficulty);
      }

      if (filters.requiresPeerReview !== undefined) {
        paramCount++;
        sql += ` AND c.requires_peer_review = $${paramCount}`;
        params.push(filters.requiresPeerReview);
      }

      if (filters.estimatedTimeMax) {
        paramCount++;
        sql += ` AND c.estimated_time_minutes <= $${paramCount}`;
        params.push(filters.estimatedTimeMax);
      }

      if (filters.search) {
        paramCount++;
        sql += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }

      if (filters.tags && filters.tags.length > 0) {
        paramCount++;
        sql += ` AND c.tags && $${paramCount}`;
        params.push(filters.tags);
      }

      sql += `
        GROUP BY c.id, u.id
        ORDER BY c.created_at DESC
      `;

      if (filters.limit) {
        paramCount++;
        sql += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get challenges: ${error.message}`);
    }
  },

  /**
   * Get challenges for a specific user (if they created them)
   */
  getUserChallenges: async (userId) => {
    try {
      const sql = `
        SELECT 
          c.*,
          COUNT(s.id) as submission_count,
          COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completion_count
        FROM challenges c
        LEFT JOIN submissions s ON c.id = s.challenge_id
        WHERE c.created_by = $1 AND (c.is_active IS NULL OR c.is_active = true)
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `;

      const result = await query(sql, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get user challenges: ${error.message}`);
    }
  },

  /**
   * Get challenges linked to a specific goal
   */
  getChallengesByGoal: async (goalId, userId) => {
    try {
      const sql = `
        SELECT 
          c.*,
          s.id as user_submission_id,
          s.status as user_submission_status,
          s.score as user_score,
          s.submitted_at as user_submitted_at,
          COUNT(sub.id) as total_submissions
        FROM challenges c
        LEFT JOIN submissions s ON c.id = s.challenge_id AND s.user_id = $2
        LEFT JOIN submissions sub ON c.id = sub.challenge_id
        JOIN challenge_goals cg ON c.id = cg.challenge_id
        WHERE cg.goal_id = $1 AND c.is_active = true
        GROUP BY c.id, s.id
        ORDER BY c.created_at DESC
      `;

      const result = await query(sql, [goalId, userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get challenges by goal: ${error.message}`);
    }
  },

  /**
   * Get a single challenge by ID
   */
  getChallengeById: async (challengeId, userId = null) => {
    try {
      let sql = `
        SELECT 
          c.*,
          u.first_name as creator_first_name,
          u.last_name as creator_last_name,
          COUNT(s.id) as submission_count
      `;

      if (userId) {
        sql += `,
          us.id as user_submission_id,
          us.status as user_submission_status,
          us.score as user_score,
          us.attempts_count as user_attempts
        `;
      }

      sql += `
        FROM challenges c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN submissions s ON c.id = s.challenge_id
      `;

      if (userId) {
        sql += `
          LEFT JOIN submissions us ON c.id = us.challenge_id AND us.user_id = $2
        `;
      }

      sql += `
        WHERE c.id = $1 AND c.is_active = true
        GROUP BY c.id, u.id
      `;

      if (userId) {
        sql += ', us.id';
      }

      const params = userId ? [challengeId, userId] : [challengeId];
      const result = await query(sql, params);

      if (result.rows.length === 0) {
        throw new Error('Challenge not found');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get challenge: ${error.message}`);
    }
  },

  /**
   * Create a new challenge
   */
  createChallenge: async (challengeData, creatorId) => {
    try {
      // Validate input
      const validatedData = challengeCreateSchema.parse(challengeData);

      return await withTransaction(async (transactionQuery) => {
        // Create the challenge
        const challengeResult = await transactionQuery(
          `
          INSERT INTO challenges (
            title, description, instructions, category, difficulty_level,
            estimated_time_minutes, points_reward, max_attempts, requires_peer_review,
            created_by, tags, prerequisites, learning_objectives
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *
        `,
          [
            validatedData.title,
            validatedData.description,
            validatedData.instructions,
            validatedData.category,
            validatedData.difficulty_level,
            validatedData.estimated_time_minutes,
            validatedData.points_reward,
            validatedData.max_attempts,
            validatedData.requires_peer_review,
            creatorId,
            validatedData.tags,
            validatedData.prerequisites,
            validatedData.learning_objectives,
          ]
        );

        const challenge = challengeResult.rows[0];

        // Link to goal if specified
        if (validatedData.goal_id) {
          await transactionQuery(
            `
            INSERT INTO challenge_goals (challenge_id, goal_id, created_by)
            VALUES ($1, $2, $3)
          `,
            [challenge.id, validatedData.goal_id, creatorId]
          );
        }

        return challenge;
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw new Error(`Failed to create challenge: ${error.message}`);
    }
  },

  /**
   * Update a challenge
   */
  updateChallenge: async (challengeId, challengeData, userId) => {
    try {
      // Check if user can update this challenge
      const existingChallenge = await query(
        'SELECT created_by FROM challenges WHERE id = $1',
        [challengeId]
      );

      if (existingChallenge.rows.length === 0) {
        throw new Error('Challenge not found');
      }

      if (existingChallenge.rows[0].created_by !== userId) {
        throw new Error('Not authorized to update this challenge');
      }

      // Validate input
      const validatedData = challengeUpdateSchema.parse(challengeData);

      // Build update query
      const updateFields = [];
      const params = [];
      let paramCount = 0;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (value !== undefined) {
          paramCount++;
          updateFields.push(`${key} = $${paramCount}`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      paramCount++;
      params.push(challengeId);

      const sql = `
        UPDATE challenges 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await query(sql, params);
      return result.rows[0];
    } catch (error) {
      if (error.name === 'ZodError') {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw new Error(`Failed to update challenge: ${error.message}`);
    }
  },

  /**
   * Delete a challenge
   */
  deleteChallenge: async (challengeId, userId) => {
    try {
      // Check if user can delete this challenge
      const existingChallenge = await query(
        'SELECT created_by FROM challenges WHERE id = $1',
        [challengeId]
      );

      if (existingChallenge.rows.length === 0) {
        throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
      }

      if (existingChallenge.rows[0].created_by !== userId) {
        throw new AppError(
          'Not authorized to delete this challenge',
          403,
          'UNAUTHORIZED'
        );
      }

      // Soft delete by setting is_active to false
      const result = await query(
        'UPDATE challenges SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [challengeId]
      );

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete challenge', 500, 'DELETE_ERROR');
    }
  },

  /**
   * Link a challenge to a goal
   */
  linkChallengeToGoal: async (challengeId, goalId, userId) => {
    try {
      return await withTransaction(async (transactionQuery) => {
        // Check if goal belongs to user
        const goalCheck = await transactionQuery(
          'SELECT id FROM goals WHERE id = $1 AND user_id = $2',
          [goalId, userId]
        );

        if (goalCheck.rows.length === 0) {
          throw new Error('Goal not found or not accessible');
        }

        // Check if challenge exists
        const challengeCheck = await transactionQuery(
          'SELECT id FROM challenges WHERE id = $1 AND is_active = true',
          [challengeId]
        );

        if (challengeCheck.rows.length === 0) {
          throw new Error('Challenge not found');
        }

        // Check if link already exists
        const existingLink = await transactionQuery(
          'SELECT id FROM challenge_goals WHERE challenge_id = $1 AND goal_id = $2',
          [challengeId, goalId]
        );

        if (existingLink.rows.length > 0) {
          throw new Error('Challenge is already linked to this goal');
        }

        // Create the link
        const result = await transactionQuery(
          `
          INSERT INTO challenge_goals (challenge_id, goal_id, created_by)
          VALUES ($1, $2, $3)
          RETURNING *
        `,
          [challengeId, goalId, userId]
        );

        return result.rows[0];
      });
    } catch (error) {
      throw new Error(`Failed to link challenge to goal: ${error.message}`);
    }
  },

  /**
   * Unlink a challenge from a goal
   */
  unlinkChallengeFromGoal: async (challengeId, goalId, userId) => {
    try {
      // Check if goal belongs to user
      const goalCheck = await query(
        'SELECT id FROM goals WHERE id = $1 AND user_id = $2',
        [goalId, userId]
      );

      if (goalCheck.rows.length === 0) {
        throw new Error('Goal not found or not accessible');
      }

      const result = await query(
        'DELETE FROM challenge_goals WHERE challenge_id = $1 AND goal_id = $2 RETURNING *',
        [challengeId, goalId]
      );

      if (result.rows.length === 0) {
        throw new Error('Challenge link not found');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to unlink challenge from goal: ${error.message}`);
    }
  },

  /**
   * Get challenge statistics
   */
  getChallengeStatistics: async (challengeId) => {
    try {
      const result = await query(
        `
        SELECT 
          COUNT(s.id) as total_submissions,
          COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_submissions,
          COUNT(CASE WHEN s.status = 'pending' THEN 1 END) as pending_submissions,
          COUNT(CASE WHEN s.status = 'failed' THEN 1 END) as failed_submissions,
          AVG(CASE WHEN s.status = 'completed' THEN s.score ELSE NULL END) as average_score,
          MIN(CASE WHEN s.status = 'completed' THEN s.score ELSE NULL END) as min_score,
          MAX(CASE WHEN s.status = 'completed' THEN s.score ELSE NULL END) as max_score,
          COUNT(DISTINCT s.user_id) as unique_participants
        FROM submissions s
        WHERE s.challenge_id = $1
      `,
        [challengeId]
      );

      const stats = result.rows[0];

      return {
        total_submissions: parseInt(stats.total_submissions) || 0,
        completed_submissions: parseInt(stats.completed_submissions) || 0,
        pending_submissions: parseInt(stats.pending_submissions) || 0,
        failed_submissions: parseInt(stats.failed_submissions) || 0,
        completion_rate:
          stats.total_submissions > 0
            ? Math.round(
                (stats.completed_submissions / stats.total_submissions) * 100
              )
            : 0,
        average_score: stats.average_score
          ? parseFloat(stats.average_score).toFixed(1)
          : null,
        min_score: stats.min_score || null,
        max_score: stats.max_score || null,
        unique_participants: parseInt(stats.unique_participants) || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get challenge statistics: ${error.message}`);
    }
  },

  /**
   * Generate personalized challenge recommendations
   */
  getRecommendedChallenges: async (userId, limit = 10) => {
    try {
      // Get user's completed challenges and preferences
      const sql = `
        WITH user_stats AS (
          SELECT 
            AVG(CASE WHEN s.status = 'completed' THEN s.score ELSE NULL END) as avg_score,
            MODE() WITHIN GROUP (ORDER BY c.difficulty_level) as preferred_difficulty,
            MODE() WITHIN GROUP (ORDER BY c.category) as preferred_category
          FROM submissions s
          JOIN challenges c ON s.challenge_id = c.id
          WHERE s.user_id = $1 AND s.status = 'completed'
        ),
        user_completed AS (
          SELECT challenge_id FROM submissions 
          WHERE user_id = $1 AND status = 'completed'
        )
        SELECT DISTINCT 
          c.*,
          COUNT(s.id) as popularity_score,
          AVG(CASE WHEN s.status = 'completed' THEN s.score ELSE NULL END) as avg_completion_score,
          CASE 
            WHEN c.category = (SELECT preferred_category FROM user_stats) THEN 2
            ELSE 1
          END as category_match,
          CASE 
            WHEN c.difficulty_level = (SELECT preferred_difficulty FROM user_stats) THEN 2
            ELSE 1
          END as difficulty_match
        FROM challenges c
        LEFT JOIN submissions s ON c.id = s.challenge_id
        WHERE c.is_active = true
          AND c.id NOT IN (SELECT challenge_id FROM user_completed)
        GROUP BY c.id
        ORDER BY 
          (category_match + difficulty_match) DESC,
          popularity_score DESC,
          c.created_at DESC
        LIMIT $2
      `;

      const result = await query(sql, [userId, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get recommended challenges: ${error.message}`);
    }
  },

  /**
   * Get popular categories
   */
  getPopularCategories: async () => {
    try {
      const result = await query(`
        SELECT 
          category,
          COUNT(*) as challenge_count,
          COUNT(DISTINCT s.user_id) as unique_participants
        FROM challenges c
        LEFT JOIN submissions s ON c.id = s.challenge_id
        WHERE c.is_active = true
        GROUP BY category
        ORDER BY challenge_count DESC
        LIMIT 10
      `);

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get popular categories: ${error.message}`);
    }
  },

  /**
   * Submit a challenge solution
   */
  submitChallenge: async (
    challengeId,
    userId,
    code,
    requestPeerReview = false
  ) => {
    try {
      // Check if challenge exists
      const challengeResult = await query(
        'SELECT id, max_attempts, points_reward, category, title, description, instructions FROM challenges WHERE id = $1 AND is_active = true',
        [challengeId]
      );

      if (challengeResult.rows.length === 0) {
        throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
      }

      const challenge = challengeResult.rows[0];

      // Check user's previous attempts
      const attemptsResult = await query(
        'SELECT COUNT(*) as attempt_count FROM submissions WHERE challenge_id = $1 AND user_id = $2',
        [challengeId, userId]
      );

      const attemptCount = parseInt(attemptsResult.rows[0].attempt_count, 10);

      if (attemptCount >= challenge.max_attempts) {
        throw new AppError(
          `Maximum attempts (${challenge.max_attempts}) reached for this challenge`,
          400,
          'MAX_ATTEMPTS_REACHED'
        );
      }

      // Create submission and mark as completed immediately
      const submissionResult = await withTransaction(
        async (transactionQuery) => {
          // Determine status based on peer review request
          const status = requestPeerReview ? 'pending_review' : 'completed';

          const submissionRes = await transactionQuery(
            `
          INSERT INTO submissions (
            challenge_id, user_id, submission_text, status, submitted_at, attempt_number
          ) VALUES ($1, $2, $3, $4, NOW(), $5)
          RETURNING *
        `,
            [challengeId, userId, code, status, attemptCount + 1]
          );

          const submission = submissionRes.rows[0];

          // Award points immediately since challenge is complete
          const points = Math.min(challenge.points_reward || 10, 5); // Cap at 5 points

          // Update user statistics
          await transactionQuery(
            `INSERT INTO user_statistics (user_id, total_points, total_challenges_completed, last_activity_date)
             VALUES ($1, $2, 1, CURRENT_DATE)
             ON CONFLICT (user_id) DO UPDATE SET 
               total_points = user_statistics.total_points + $2,
               total_challenges_completed = user_statistics.total_challenges_completed + 1,
               last_activity_date = CURRENT_DATE,
               updated_at = CURRENT_TIMESTAMP`,
            [userId, points]
          );

          // Log progress event
          await transactionQuery(
            `INSERT INTO progress_events (
              user_id, event_type, event_data, related_challenge_id, related_submission_id, points_earned
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              userId,
              'challenge_completed',
              JSON.stringify({
                challenge_title: challenge.title,
                attempt_number: attemptCount + 1,
                challenge_category: challenge.category,
                requested_peer_review: requestPeerReview,
              }),
              challengeId,
              submission.id,
              points,
            ]
          );

          return { ...submission, points_earned: points };
        }
      );

      return submissionResult;
    } catch (error) {
      // Re-throw AppErrors as-is to preserve status codes
      if (error instanceof AppError) {
        throw error;
      }
      // Wrap other errors
      throw new AppError(
        `Failed to submit challenge: ${error.message}`,
        500,
        'SUBMISSION_ERROR'
      );
    }
  },

  /**
   * Mark a submission as complete and award points
   */
  markSubmissionComplete: async (submissionId, userId, challengeId) => {
    try {
      return await withTransaction(async (transactionQuery) => {
        // Verify submission belongs to user
        const submissionCheck = await transactionQuery(
          'SELECT * FROM submissions WHERE id = $1 AND user_id = $2',
          [submissionId, userId]
        );

        if (submissionCheck.rows.length === 0) {
          throw new Error('Submission not found or not authorized');
        }

        const submission = submissionCheck.rows[0];

        // Check if already completed
        if (submission.status === 'completed') {
          throw new Error('Submission is already marked as complete');
        }

        // Get challenge points
        const challengeCheck = await transactionQuery(
          'SELECT points_reward FROM challenges WHERE id = $1',
          [challengeId]
        );

        if (challengeCheck.rows.length === 0) {
          throw new Error('Challenge not found');
        }

        const points = Math.min(challengeCheck.rows[0].points_reward || 10, 5); // Cap at 5 points

        // Update submission to completed
        const updateResult = await transactionQuery(
          "UPDATE submissions SET status = 'completed', score = 75 WHERE id = $1 RETURNING *",
          [submissionId]
        );

        // Award points and update statistics
        const submissionService = require('./submissionService');
        await submissionService.awardPointsForCompletion(
          transactionQuery,
          userId,
          challengeId,
          points,
          submissionId
        );

        return updateResult.rows[0];
      });
    } catch (error) {
      throw new Error(`Failed to mark submission complete: ${error.message}`);
    }
  },

  /**
   * Get submissions for a challenge by user
   */
  getChallengeSubmissions: async (challengeId, userId) => {
    try {
      const result = await query(
        `
        SELECT 
          s.*,
          c.title as challenge_title,
          c.max_attempts
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.challenge_id = $1 AND s.user_id = $2
        ORDER BY s.submitted_at DESC
      `,
        [challengeId, userId]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get challenge submissions: ${error.message}`);
    }
  },
};

module.exports = challengeService;
