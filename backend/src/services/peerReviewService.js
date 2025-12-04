// Peer review business logic and database operations
const { query, withTransaction } = require('../database/connection');
const { AppError } = require('../middleware/errorHandler');

const peerReviewService = {
  /**
   * Get submissions available for peer review (excludes user's own submissions)
   */
  getReviewQueue: async (userId, options = {}) => {
    try {
      const { limit = 10, offset = 0, skill } = options;

      let sql = `
        SELECT 
          s.id, s.submission_text, s.status, s.submitted_at, s.created_at,
          c.id as challenge_id, c.title as challenge_title, c.category, c.difficulty_level,
          c.description as challenge_description, c.requires_peer_review,
          u.id as user_id, u.first_name as submitter_first_name, u.last_name as submitter_last_name,
          (SELECT COUNT(*) FROM peer_reviews pr WHERE pr.submission_id = s.id) as review_count,
          (SELECT COUNT(*) FROM peer_reviews pr WHERE pr.submission_id = s.id AND pr.is_completed = true) as completed_reviews
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id != $1
          AND c.requires_peer_review = true
          AND s.status IN ('pending', 'in_review', 'submitted')
          AND NOT EXISTS (
            SELECT 1 FROM peer_reviews pr 
            WHERE pr.submission_id = s.id AND pr.reviewer_id = $1
          )
          AND (SELECT COUNT(*) FROM peer_reviews pr WHERE pr.submission_id = s.id AND pr.is_completed = true) < 3
      `;

      const params = [userId];
      let paramCount = 1;

      if (skill) {
        paramCount++;
        sql += ` AND c.category = $${paramCount}`;
        params.push(skill);
      }

      sql += ` ORDER BY s.created_at DESC LIMIT $${paramCount + 1} OFFSET $${
        paramCount + 2
      }`;
      params.push(limit, offset);

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Get review queue error:', error);
      throw new AppError('Failed to get review queue', 500, 'QUEUE_ERROR');
    }
  },

  /**
   * Create a new peer review assignment
   */
  createReview: async (reviewerId, submissionId, reviewData) => {
    try {
      return await withTransaction(async (transactionQuery) => {
        // Get submission details
        const submissionResult = await transactionQuery(
          `SELECT s.*, c.requires_peer_review, c.title as challenge_title
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

        // Check if reviewer is not the submitter
        if (submission.user_id === reviewerId) {
          throw new AppError(
            'Cannot review your own submission',
            400,
            'SELF_REVIEW'
          );
        }

        // Check if already reviewed by this user
        const existingReview = await transactionQuery(
          'SELECT id FROM peer_reviews WHERE reviewer_id = $1 AND submission_id = $2',
          [reviewerId, submissionId]
        );

        if (existingReview.rows.length > 0) {
          throw new AppError(
            'Already reviewed this submission',
            400,
            'ALREADY_REVIEWED'
          );
        }

        // Create the review
        const insertResult = await transactionQuery(
          `INSERT INTO peer_reviews (
            reviewer_id, reviewee_id, submission_id, review_text,
            rating, criteria_scores, time_spent_minutes, is_anonymous,
            is_completed, completed_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
          RETURNING *`,
          [
            reviewerId,
            submission.user_id,
            submissionId,
            reviewData.review_text,
            reviewData.rating,
            reviewData.criteria_scores
              ? JSON.stringify(reviewData.criteria_scores)
              : null,
            reviewData.time_spent_minutes || null,
            reviewData.is_anonymous !== false, // default true
            true, // completed immediately
          ]
        );

        const review = insertResult.rows[0];

        // Update submission status to in_review if first review
        await transactionQuery(
          `UPDATE submissions SET status = 'in_review', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND status = 'submitted'`,
          [submissionId]
        );

        // Update reviewer's statistics
        await transactionQuery(
          `INSERT INTO user_statistics (user_id, total_peer_reviews_given)
           VALUES ($1, 1)
           ON CONFLICT (user_id) 
           DO UPDATE SET 
             total_peer_reviews_given = user_statistics.total_peer_reviews_given + 1,
             last_activity_date = CURRENT_DATE,
             updated_at = CURRENT_TIMESTAMP`,
          [reviewerId]
        );

        // Update reviewee's statistics
        await transactionQuery(
          `INSERT INTO user_statistics (user_id, total_peer_reviews_received)
           VALUES ($1, 1)
           ON CONFLICT (user_id) 
           DO UPDATE SET 
             total_peer_reviews_received = user_statistics.total_peer_reviews_received + 1,
             updated_at = CURRENT_TIMESTAMP`,
          [submission.user_id]
        );

        // Award points to reviewer (5 points for giving a review)
        const reviewPoints = 5;
        await transactionQuery(
          `UPDATE user_statistics 
           SET total_points = total_points + $1,
               experience_points = experience_points + $1
           WHERE user_id = $2`,
          [reviewPoints, reviewerId]
        );

        // Log progress event for reviewer
        await transactionQuery(
          `INSERT INTO progress_events (
            user_id, event_type, event_data, points_earned, related_submission_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            reviewerId,
            'peer_review_given',
            JSON.stringify({
              submission_id: submissionId,
              challenge_title: submission.challenge_title,
              rating: reviewData.rating,
            }),
            reviewPoints,
            submissionId,
          ]
        );

        // Check if submission has enough reviews (3) to be marked completed
        const reviewCountResult = await transactionQuery(
          `SELECT COUNT(*) as count, AVG(rating) as avg_rating
           FROM peer_reviews 
           WHERE submission_id = $1 AND is_completed = true`,
          [submissionId]
        );

        const reviewCount = parseInt(reviewCountResult.rows[0].count);
        const avgRating = parseFloat(reviewCountResult.rows[0].avg_rating) || 0;

        if (reviewCount >= 3) {
          // Mark submission as completed and calculate final score
          const finalScore = Math.round(avgRating * 20); // Convert 1-5 to 0-100

          await transactionQuery(
            `UPDATE submissions 
             SET status = 'completed', 
                 score = $1,
                 graded_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [finalScore, submissionId]
          );

          // Award points to the submitter if passing
          if (finalScore >= 70) {
            const challengeResult = await transactionQuery(
              'SELECT points_reward FROM challenges WHERE id = $1',
              [submission.challenge_id]
            );

            if (challengeResult.rows.length > 0) {
              const points = challengeResult.rows[0].points_reward;

              await transactionQuery(
                `UPDATE user_statistics 
                 SET total_points = total_points + $1,
                     total_challenges_completed = total_challenges_completed + 1,
                     experience_points = experience_points + $1
                 WHERE user_id = $2`,
                [points, submission.user_id]
              );

              await transactionQuery(
                `INSERT INTO progress_events (
                  user_id, event_type, event_data, points_earned, related_challenge_id, related_submission_id
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                  submission.user_id,
                  'points_awarded',
                  JSON.stringify({ reason: 'peer_review_completion', points }),
                  points,
                  submission.challenge_id,
                  submissionId,
                ]
              );
            }
          }
        }

        return review;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Create review error:', error);
      throw new AppError('Failed to create review', 500, 'CREATE_REVIEW_ERROR');
    }
  },

  /**
   * Get reviews for a submission
   */
  getReviewsForSubmission: async (submissionId, userId = null) => {
    try {
      // First check if user has access to this submission
      if (userId) {
        const accessCheck = await query(
          'SELECT s.user_id FROM submissions s WHERE s.id = $1',
          [submissionId]
        );

        if (accessCheck.rows.length === 0) {
          throw new AppError(
            'Submission not found',
            404,
            'SUBMISSION_NOT_FOUND'
          );
        }

        // Only the submitter can see reviews for their submission
        if (accessCheck.rows[0].user_id !== userId) {
          throw new AppError('Not authorized', 403, 'UNAUTHORIZED');
        }
      }

      const result = await query(
        `SELECT pr.*,
          CASE WHEN pr.is_anonymous THEN NULL ELSE u.first_name END as reviewer_first_name,
          CASE WHEN pr.is_anonymous THEN NULL ELSE u.last_name END as reviewer_last_name
        FROM peer_reviews pr
        LEFT JOIN users u ON pr.reviewer_id = u.id
        WHERE pr.submission_id = $1 AND pr.is_completed = true
        ORDER BY pr.completed_at DESC`,
        [submissionId]
      );

      return result.rows;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get reviews', 500, 'GET_REVIEWS_ERROR');
    }
  },

  /**
   * Get reviews given by a user
   */
  getReviewsByReviewer: async (reviewerId) => {
    try {
      const result = await query(
        `SELECT pr.*,
          s.submission_text,
          c.title as challenge_title,
          c.category as challenge_category
        FROM peer_reviews pr
        JOIN submissions s ON pr.submission_id = s.id
        JOIN challenges c ON s.challenge_id = c.id
        WHERE pr.reviewer_id = $1
        ORDER BY pr.created_at DESC`,
        [reviewerId]
      );

      return result.rows;
    } catch (error) {
      throw new AppError('Failed to get reviews', 500, 'GET_REVIEWS_ERROR');
    }
  },

  /**
   * Get reviews received by a user
   */
  getReceivedReviews: async (userId) => {
    try {
      const result = await query(
        `SELECT pr.*,
          s.submission_text,
          s.id as submission_id,
          c.title as challenge_title,
          c.category as challenge_category,
          CASE WHEN pr.is_anonymous THEN NULL ELSE u.first_name END as reviewer_first_name,
          CASE WHEN pr.is_anonymous THEN NULL ELSE u.last_name END as reviewer_last_name
        FROM peer_reviews pr
        JOIN submissions s ON pr.submission_id = s.id
        JOIN challenges c ON s.challenge_id = c.id
        LEFT JOIN users u ON pr.reviewer_id = u.id
        WHERE pr.reviewee_id = $1 AND pr.is_completed = true
        ORDER BY pr.completed_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      throw new AppError(
        'Failed to get received reviews',
        500,
        'GET_REVIEWS_ERROR'
      );
    }
  },

  /**
   * Mark a review as read by the reviewee
   */
  markReviewRead: async (reviewId, userId) => {
    try {
      const result = await query(
        `UPDATE peer_reviews 
         SET read_by_reviewee = true, read_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND reviewee_id = $2
         RETURNING *`,
        [reviewId, userId]
      );

      if (result.rows.length === 0) {
        throw new AppError(
          'Review not found or not authorized',
          404,
          'REVIEW_NOT_FOUND'
        );
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to mark review as read', 500, 'UPDATE_ERROR');
    }
  },

  /**
   * Get pending review assignments for a user
   */
  getPendingReviews: async (userId) => {
    try {
      // Get submissions that need review and user hasn't reviewed yet
      const result = await query(
        `SELECT s.*,
          c.title as challenge_title,
          c.description as challenge_description,
          c.category as challenge_category,
          c.difficulty_level,
          u.first_name as submitter_first_name,
          u.last_name as submitter_last_name,
          (SELECT COUNT(*) FROM peer_reviews WHERE submission_id = s.id AND is_completed = true) as review_count
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        JOIN users u ON s.user_id = u.id
        WHERE c.requires_peer_review = true
          AND s.user_id != $1
          AND s.status IN ('submitted', 'in_review')
          AND NOT EXISTS (
            SELECT 1 FROM peer_reviews 
            WHERE submission_id = s.id AND reviewer_id = $1
          )
        ORDER BY 
          (SELECT COUNT(*) FROM peer_reviews WHERE submission_id = s.id) ASC,
          s.submitted_at ASC
        LIMIT 10`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      throw new AppError(
        'Failed to get pending reviews',
        500,
        'GET_PENDING_ERROR'
      );
    }
  },

  /**
   * Update a review
   */
  updateReview: async (reviewId, reviewerId, updateData) => {
    try {
      // Check ownership
      const checkResult = await query(
        'SELECT * FROM peer_reviews WHERE id = $1 AND reviewer_id = $2',
        [reviewId, reviewerId]
      );

      if (checkResult.rows.length === 0) {
        throw new AppError(
          'Review not found or not authorized',
          404,
          'REVIEW_NOT_FOUND'
        );
      }

      const fields = [];
      const values = [];
      let paramCount = 0;

      if (updateData.review_text !== undefined) {
        paramCount++;
        fields.push(`review_text = $${paramCount}`);
        values.push(updateData.review_text);
      }

      if (updateData.rating !== undefined) {
        paramCount++;
        fields.push(`rating = $${paramCount}`);
        values.push(updateData.rating);
      }

      if (updateData.criteria_scores !== undefined) {
        paramCount++;
        fields.push(`criteria_scores = $${paramCount}`);
        values.push(JSON.stringify(updateData.criteria_scores));
      }

      if (fields.length === 0) {
        throw new AppError('No fields to update', 400, 'NO_UPDATE_FIELDS');
      }

      paramCount++;
      values.push(reviewId);

      const result = await query(
        `UPDATE peer_reviews 
         SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update review', 500, 'UPDATE_REVIEW_ERROR');
    }
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId, reviewerId) => {
    try {
      const result = await query(
        'DELETE FROM peer_reviews WHERE id = $1 AND reviewer_id = $2 RETURNING *',
        [reviewId, reviewerId]
      );

      if (result.rows.length === 0) {
        throw new AppError(
          'Review not found or not authorized',
          404,
          'REVIEW_NOT_FOUND'
        );
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete review', 500, 'DELETE_REVIEW_ERROR');
    }
  },

  /**
   * Get user's submissions that need peer review
   */
  getUserSubmissionsForReview: async (userId) => {
    try {
      const result = await query(
        `SELECT s.*,
          c.title as challenge_title,
          c.category as challenge_category,
          c.difficulty_level,
          (SELECT COUNT(*) FROM peer_reviews WHERE submission_id = s.id AND is_completed = true) as review_count,
          (SELECT AVG(rating) FROM peer_reviews WHERE submission_id = s.id AND is_completed = true) as avg_rating
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = $1 AND c.requires_peer_review = true
        ORDER BY s.submitted_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      throw new AppError(
        'Failed to get submissions for review',
        500,
        'GET_SUBMISSIONS_ERROR'
      );
    }
  },
};

module.exports = peerReviewService;
