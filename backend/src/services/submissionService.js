// Submission business logic and database operations
const { query, withTransaction } = require('../database/connection');
const { AppError } = require('../middleware/errorHandler');
const progressService = require('./progressService');

const submissionService = {
  /**
   * Submit work for a challenge
   */
  submitWork: async (userId, challengeId, submissionData) => {
    try {
      return await withTransaction(async (transactionQuery) => {
        // Check if challenge exists and is active
        const challengeResult = await transactionQuery(
          'SELECT * FROM challenges WHERE id = $1 AND is_active = true',
          [challengeId]
        );

        if (challengeResult.rows.length === 0) {
          throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
        }

        const challenge = challengeResult.rows[0];

        // Get current attempt count for this user and challenge
        const attemptResult = await transactionQuery(
          'SELECT COUNT(*) as attempts FROM submissions WHERE user_id = $1 AND challenge_id = $2',
          [userId, challengeId]
        );

        const currentAttempts = parseInt(attemptResult.rows[0].attempts) || 0;

        // Check if user has exceeded max attempts
        if (currentAttempts >= challenge.max_attempts) {
          throw new AppError(
            `Maximum attempts (${challenge.max_attempts}) reached for this challenge`,
            400,
            'MAX_ATTEMPTS_REACHED'
          );
        }

        const attemptNumber = currentAttempts + 1;

        // Create the submission
        const insertResult = await transactionQuery(
          `INSERT INTO submissions (
            user_id, challenge_id, submission_text, submission_files,
            status, attempt_number, time_spent_minutes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            userId,
            challengeId,
            submissionData.submission_text,
            submissionData.submission_files
              ? JSON.stringify(submissionData.submission_files)
              : null,
            'submitted',
            attemptNumber,
            submissionData.time_spent_minutes || null,
          ]
        );

        const submission = insertResult.rows[0];

        // Log progress event
        await transactionQuery(
          `INSERT INTO progress_events (
            user_id, event_type, event_data, related_challenge_id, related_submission_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            'challenge_submission',
            JSON.stringify({
              challenge_title: challenge.title,
              attempt_number: attemptNumber,
              challenge_category: challenge.category,
            }),
            challengeId,
            submission.id,
          ]
        );

        // Ensure user_statistics record exists
        await transactionQuery(
          `INSERT INTO user_statistics (user_id) VALUES ($1)
           ON CONFLICT (user_id) DO UPDATE SET 
             last_activity_date = CURRENT_DATE,
             updated_at = CURRENT_TIMESTAMP`,
          [userId]
        );

        return submission;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Submit work error:', error);
      throw new AppError('Failed to submit work', 500, 'SUBMISSION_ERROR');
    }
  },

  /**
   * Get submission by ID
   */
  getSubmissionById: async (submissionId, userId = null) => {
    try {
      let sql = `
        SELECT s.*, 
          c.title as challenge_title,
          c.description as challenge_description,
          c.category as challenge_category,
          c.difficulty_level,
          c.points_reward,
          c.requires_peer_review,
          u.first_name as submitter_first_name,
          u.last_name as submitter_last_name
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        JOIN users u ON s.user_id = u.id
        WHERE s.id = $1
      `;

      const result = await query(sql, [submissionId]);

      if (result.rows.length === 0) {
        throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
      }

      const submission = result.rows[0];

      // If userId provided, check access rights
      if (userId && submission.user_id !== userId) {
        // Allow viewing if it's for peer review
        const reviewCheck = await query(
          'SELECT id FROM peer_reviews WHERE reviewer_id = $1 AND submission_id = $2',
          [userId, submissionId]
        );

        if (reviewCheck.rows.length === 0) {
          // Check if user is assigned to review this
          throw new AppError(
            'Not authorized to view this submission',
            403,
            'UNAUTHORIZED'
          );
        }
      }

      return submission;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Failed to get submission',
        500,
        'GET_SUBMISSION_ERROR'
      );
    }
  },

  /**
   * Get all submissions for a user
   */
  getUserSubmissions: async (userId, filters = {}) => {
    try {
      let sql = `
        SELECT s.*, 
          c.title as challenge_title,
          c.category as challenge_category,
          c.difficulty_level,
          c.points_reward,
          (SELECT COUNT(*) FROM peer_reviews pr WHERE pr.submission_id = s.id) as review_count,
          (SELECT AVG(rating) FROM peer_reviews pr WHERE pr.submission_id = s.id AND pr.is_completed = true) as avg_rating
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = $1
      `;

      const params = [userId];
      let paramCount = 1;

      if (filters.status) {
        paramCount++;
        sql += ` AND s.status = $${paramCount}`;
        params.push(filters.status);
      }

      if (filters.challengeId) {
        paramCount++;
        sql += ` AND s.challenge_id = $${paramCount}`;
        params.push(filters.challengeId);
      }

      sql += ' ORDER BY s.submitted_at DESC';

      if (filters.limit) {
        paramCount++;
        sql += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      throw new AppError(
        'Failed to get user submissions',
        500,
        'GET_SUBMISSIONS_ERROR'
      );
    }
  },

  /**
   * Get submissions for a challenge
   */
  getChallengeSubmissions: async (challengeId, filters = {}) => {
    try {
      let sql = `
        SELECT s.*,
          u.first_name,
          u.last_name,
          (SELECT COUNT(*) FROM peer_reviews pr WHERE pr.submission_id = s.id) as review_count
        FROM submissions s
        JOIN users u ON s.user_id = u.id
        WHERE s.challenge_id = $1
      `;

      const params = [challengeId];
      let paramCount = 1;

      if (filters.status) {
        paramCount++;
        sql += ` AND s.status = $${paramCount}`;
        params.push(filters.status);
      }

      sql += ' ORDER BY s.submitted_at DESC';

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      throw new AppError(
        'Failed to get challenge submissions',
        500,
        'GET_SUBMISSIONS_ERROR'
      );
    }
  },

  /**
   * Grade a submission (by AI or instructor)
   */
  gradeSubmission: async (submissionId, gradeData, graderId = null) => {
    try {
      return await withTransaction(async (transactionQuery) => {
        // Get the submission
        const submissionResult = await transactionQuery(
          `SELECT s.*, c.points_reward, c.requires_peer_review
           FROM submissions s
           JOIN challenges c ON s.challenge_id = c.id
           WHERE s.id = $1`,
          [submissionId]
        );

        if (submissionResult.rows.length === 0) {
          throw new AppError(
            'Submission not found',
            404,
            'SUBMISSION_NOT_FOUND'
          );
        }

        const submission = submissionResult.rows[0];
        const { score, feedback } = gradeData;

        // Determine if challenge is completed (score >= 70 is passing)
        const isPassing = score >= 70;
        const newStatus = isPassing ? 'completed' : 'needs_revision';

        // Update the submission
        const updateResult = await transactionQuery(
          `UPDATE submissions 
           SET score = $1, feedback = $2, status = $3, 
               graded_at = CURRENT_TIMESTAMP, graded_by = $4
           WHERE id = $5
           RETURNING *`,
          [score, feedback, newStatus, graderId, submissionId]
        );

        // If passing and doesn't require peer review, award points and update streak
        if (isPassing && !submission.requires_peer_review) {
          console.log(
            `[gradeSubmission] Challenge passing for user ${submission.user_id}, updating stats`
          );
          await submissionService.awardPointsForCompletion(
            transactionQuery,
            submission.user_id,
            submission.challenge_id,
            submission.points_reward,
            submissionId
          );

          // Update streak for the completed challenge
          console.log(
            `[gradeSubmission] Calling updateStreak for user ${submission.user_id}`
          );
          await progressService.updateStreak(
            transactionQuery,
            submission.user_id
          );
        } else {
          console.log(
            `[gradeSubmission] Not updating streak - isPassing: ${isPassing}, requires_peer_review: ${submission.requires_peer_review}`
          );
        }

        return updateResult.rows[0];
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to grade submission', 500, 'GRADE_ERROR');
    }
  },

  /**
   * Update submission status
   */
  updateSubmissionStatus: async (submissionId, status, userId) => {
    try {
      // Verify ownership
      const checkResult = await query(
        'SELECT user_id FROM submissions WHERE id = $1',
        [submissionId]
      );

      if (checkResult.rows.length === 0) {
        throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
      }

      if (checkResult.rows[0].user_id !== userId) {
        throw new AppError('Not authorized', 403, 'UNAUTHORIZED');
      }

      const validStatuses = [
        'submitted',
        'in_review',
        'completed',
        'needs_revision',
        'withdrawn',
      ];
      if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status', 400, 'INVALID_STATUS');
      }

      const result = await query(
        `UPDATE submissions SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`,
        [status, submissionId]
      );

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Failed to update submission status',
        500,
        'UPDATE_ERROR'
      );
    }
  },

  /**
   * Update submission content
   */
  updateSubmission: async (submissionId, updateData) => {
    try {
      const { content, language, notes } = updateData;

      const updates = [];
      const values = [];
      let paramCount = 0;

      if (content !== undefined) {
        paramCount++;
        updates.push(`submission_text = $${paramCount}`);
        values.push(content);
      }

      if (notes !== undefined) {
        paramCount++;
        updates.push(`feedback = $${paramCount}`);
        values.push(notes);
      }

      if (updates.length === 0) {
        throw new AppError('No updates provided', 400, 'NO_UPDATES');
      }

      paramCount++;
      values.push(submissionId);

      const result = await query(
        `UPDATE submissions SET ${updates.join(
          ', '
        )}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount} RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update submission', 500, 'UPDATE_ERROR');
    }
  },

  /**
   * Delete a submission
   */
  deleteSubmission: async (submissionId) => {
    try {
      // Delete associated progress events first (foreign key)
      await query(
        'DELETE FROM progress_events WHERE related_submission_id = $1',
        [submissionId]
      );

      // Delete associated peer reviews (foreign key)
      await query('DELETE FROM peer_reviews WHERE submission_id = $1', [
        submissionId,
      ]);

      // Delete associated AI feedback
      await query('DELETE FROM ai_feedback WHERE submission_id = $1', [
        submissionId,
      ]);

      // Delete the submission
      const result = await query(
        'DELETE FROM submissions WHERE id = $1 RETURNING *',
        [submissionId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Submission not found', 404, 'SUBMISSION_NOT_FOUND');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete submission', 500, 'DELETE_ERROR');
    }
  },

  /**
   * Award points for challenge completion
   */
  awardPointsForCompletion: async (
    transactionQuery,
    userId,
    challengeId,
    points,
    submissionId
  ) => {
    // Check if points were already awarded for this challenge
    const existingAward = await transactionQuery(
      `SELECT id FROM progress_events 
       WHERE user_id = $1 AND related_challenge_id = $2 
       AND event_type = 'points_awarded'`,
      [userId, challengeId]
    );

    if (existingAward.rows.length > 0) {
      return; // Already awarded
    }

    // Update user statistics
    await transactionQuery(
      `INSERT INTO user_statistics (user_id, total_points, total_challenges_completed, experience_points)
       VALUES ($1, $2, 1, $2)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         total_points = user_statistics.total_points + $2,
         total_challenges_completed = user_statistics.total_challenges_completed + 1,
         experience_points = user_statistics.experience_points + $2,
         last_activity_date = CURRENT_DATE,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, points]
    );

    // Log the points award
    await transactionQuery(
      `INSERT INTO progress_events (
        user_id, event_type, event_data, points_earned, related_challenge_id, related_submission_id
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        'points_awarded',
        JSON.stringify({ reason: 'challenge_completion', points }),
        points,
        challengeId,
        submissionId,
      ]
    );

    // Update goal progress using progress_contribution from challenge_goals table
    // This adds the user-specified percentage contribution to the goal's progress
    await transactionQuery(
      `UPDATE goals g
       SET progress_percentage = LEAST(100, COALESCE(progress_percentage, 0) + COALESCE(cg.progress_contribution, 10)),
           challenges_completed = COALESCE(challenges_completed, 0) + 1,
           is_completed = CASE 
             WHEN COALESCE(progress_percentage, 0) + COALESCE(cg.progress_contribution, 10) >= 100 THEN true 
             ELSE is_completed 
           END,
           completion_date = CASE 
             WHEN COALESCE(progress_percentage, 0) + COALESCE(cg.progress_contribution, 10) >= 100 THEN CURRENT_TIMESTAMP 
             ELSE completion_date 
           END,
           updated_at = CURRENT_TIMESTAMP
       FROM challenge_goals cg
       WHERE cg.goal_id = g.id 
       AND cg.challenge_id = $1 
       AND g.user_id = $2`,
      [challengeId, userId]
    );

    // Check and update user level
    await submissionService.updateUserLevel(transactionQuery, userId);
  },

  /**
   * Update user level based on experience points
   */
  updateUserLevel: async (transactionQuery, userId) => {
    // Level thresholds: Level 1 = 0, Level 2 = 100, Level 3 = 250, etc.
    const levelThresholds = [
      0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000,
    ];

    const statsResult = await transactionQuery(
      'SELECT experience_points FROM user_statistics WHERE user_id = $1',
      [userId]
    );

    if (statsResult.rows.length === 0) return;

    const xp = statsResult.rows[0].experience_points;
    let newLevel = 1;

    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (xp >= levelThresholds[i]) {
        newLevel = i + 1;
        break;
      }
    }

    await transactionQuery(
      'UPDATE user_statistics SET level = $1 WHERE user_id = $2',
      [newLevel, userId]
    );
  },

  /**
   * Get submissions available for peer review
   */
  getSubmissionsForPeerReview: async (userId) => {
    try {
      // Get submissions that:
      // 1. Require peer review
      // 2. Are not the user's own
      // 3. Haven't been reviewed by this user yet
      // 4. Have status 'submitted' or 'in_review'
      const result = await query(
        `SELECT s.*, 
          c.title as challenge_title,
          c.category as challenge_category,
          c.difficulty_level,
          u.first_name as submitter_first_name,
          u.last_name as submitter_last_name,
          (SELECT COUNT(*) FROM peer_reviews pr WHERE pr.submission_id = s.id AND pr.is_completed = true) as completed_reviews
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        JOIN users u ON s.user_id = u.id
        WHERE c.requires_peer_review = true
          AND s.user_id != $1
          AND s.status IN ('submitted', 'in_review')
          AND NOT EXISTS (
            SELECT 1 FROM peer_reviews pr 
            WHERE pr.submission_id = s.id AND pr.reviewer_id = $1
          )
        ORDER BY s.submitted_at ASC
        LIMIT 10`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      throw new AppError(
        'Failed to get peer review submissions',
        500,
        'GET_SUBMISSIONS_ERROR'
      );
    }
  },

  /**
   * Create a submission for peer review (without a specific challenge)
   * This creates both a challenge and submission in one go
   */
  createPeerReviewSubmission: async (userId, data) => {
    try {
      return await withTransaction(async (transactionQuery) => {
        const { title, description, content, category, difficulty } = data;

        // Create a peer review challenge
        const challengeResult = await transactionQuery(
          `INSERT INTO challenges (
            created_by, title, description, instructions, category, difficulty_level,
            points_reward, requires_peer_review, max_attempts, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
            userId,
            title,
            description || 'Work submitted for peer review',
            content, // Use content as instructions
            category || 'General',
            difficulty || 'Intermediate',
            10, // Points for completing peer review
            true, // Requires peer review
            1, // Max attempts
            true,
          ]
        );

        const challenge = challengeResult.rows[0];

        // Create the submission
        const submissionResult = await transactionQuery(
          `INSERT INTO submissions (
            user_id, challenge_id, submission_text, status, attempt_number
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *`,
          [userId, challenge.id, content, 'submitted', 1]
        );

        const submission = submissionResult.rows[0];

        // Ensure user_statistics exists
        await transactionQuery(
          `INSERT INTO user_statistics (user_id) VALUES ($1)
           ON CONFLICT (user_id) DO UPDATE SET 
             last_activity_date = CURRENT_DATE,
             updated_at = CURRENT_TIMESTAMP`,
          [userId]
        );

        // Log progress event
        await transactionQuery(
          `INSERT INTO progress_events (
            user_id, event_type, event_data, related_challenge_id, related_submission_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            'work_submitted_for_review',
            JSON.stringify({
              title,
              category: category || 'General',
            }),
            challenge.id,
            submission.id,
          ]
        );

        return {
          ...submission,
          challenge_title: challenge.title,
          challenge_category: challenge.category,
          difficulty_level: challenge.difficulty_level,
        };
      });
    } catch (error) {
      console.error('Create peer review submission error:', error);
      throw new AppError(
        'Failed to submit work for review',
        500,
        'SUBMISSION_ERROR'
      );
    }
  },
};

module.exports = submissionService;
