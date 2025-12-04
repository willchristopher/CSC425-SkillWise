const peerReviewService = require('../services/peerReviewService');

const peerReviewController = {
  // Get available submissions for review (review queue)
  getReviewQueue: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { limit, offset, skill } = req.query;

      const queue = await peerReviewService.getReviewQueue(userId, {
        limit: parseInt(limit) || 10,
        offset: parseInt(offset) || 0,
        skill,
      });

      res.json({
        success: true,
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get review assignments for the current user
  getReviewAssignments: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const assignments = await peerReviewService.getReviewsByReviewer(userId, {
        status: 'pending',
      });

      res.json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      next(error);
    }
  },

  // Submit a peer review
  submitReview: async (req, res, next) => {
    try {
      const reviewerId = req.user.id;
      const {
        submissionId,
        rating,
        feedback,
        strengths,
        improvements,
        codeQuality,
      } = req.body;

      if (!submissionId || rating === undefined || !feedback) {
        return res.status(400).json({
          success: false,
          error: 'Submission ID, rating, and feedback are required',
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5',
        });
      }

      // Combine feedback fields into review_text
      const reviewText = [
        feedback,
        strengths ? `\n\nStrengths: ${strengths}` : '',
        improvements ? `\n\nAreas for Improvement: ${improvements}` : '',
      ].join('');

      const review = await peerReviewService.createReview(
        reviewerId,
        parseInt(submissionId),
        {
          review_text: reviewText,
          rating: parseInt(rating),
          criteria_scores: codeQuality ? { code_quality: codeQuality } : null,
        }
      );

      res.status(201).json({
        success: true,
        data: review,
        message: 'Review submitted successfully! You earned 5 points.',
      });
    } catch (error) {
      if (error.code === 'SELF_REVIEW') {
        return res.status(400).json({
          success: false,
          error: 'Cannot review your own submission',
        });
      }
      if (error.code === 'ALREADY_REVIEWED') {
        return res.status(409).json({
          success: false,
          error: 'You have already reviewed this submission',
        });
      }
      next(error);
    }
  },

  // Get reviews received by the current user
  getReceivedReviews: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { limit, offset } = req.query;

      const reviews = await peerReviewService.getReceivedReviews(userId, {
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
      });

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get review history (reviews given by current user)
  getReviewHistory: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { limit, offset, status } = req.query;

      const reviews = await peerReviewService.getReviewsByReviewer(userId, {
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
        status,
      });

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get reviews for a specific submission
  getSubmissionReviews: async (req, res, next) => {
    try {
      const { submissionId } = req.params;

      const reviews = await peerReviewService.getReviewsForSubmission(
        submissionId
      );

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get submission details for review
  getSubmissionDetails: async (req, res, next) => {
    try {
      const { submissionId } = req.params;
      const submissionService = require('../services/submissionService');

      const submission = await submissionService.getSubmissionById(
        submissionId
      );

      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found',
        });
      }

      // Get any existing reviews for this submission
      const reviews = await peerReviewService.getReviewsForSubmission(
        submissionId
      );

      res.json({
        success: true,
        data: {
          ...submission,
          reviews,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Update a review
  updateReview: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { rating, feedback, strengths, improvements, codeQuality } =
        req.body;

      // Verify the reviewer owns this review
      const existing = await peerReviewService.getReviewsByReviewer(userId, {
        limit: 100,
      });
      const review = existing.find((r) => r.id === parseInt(id));

      if (!review) {
        return res.status(404).json({
          success: false,
          error: 'Review not found or not authorized',
        });
      }

      const updated = await peerReviewService.updateReview(id, {
        rating,
        feedback,
        strengths,
        improvements,
        codeQuality,
      });

      res.json({
        success: true,
        data: updated,
        message: 'Review updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user's submissions available for peer review
  getMySubmissions: async (req, res, next) => {
    try {
      const userId = req.user.id;
      console.log('[getMySubmissions] Fetching for user:', userId);

      // Only get submissions from challenges that require peer review
      const submissions = await peerReviewService.getUserSubmissionsForReview(
        userId
      );
      console.log(
        '[getMySubmissions] Found submissions:',
        submissions.length,
        submissions
      );

      // Enhance with review counts and latest feedback
      const submissionsWithReviews = await Promise.all(
        submissions.map(async (sub) => {
          try {
            const reviews = await peerReviewService.getReviewsForSubmission(
              sub.id
            );
            return {
              ...sub,
              reviewCount: reviews.length,
              averageRating:
                reviews.length > 0
                  ? Math.round(
                      (reviews.reduce((sum, r) => sum + r.rating, 0) /
                        reviews.length) *
                        10
                    ) / 10
                  : null,
              latest_feedback:
                reviews.length > 0 ? reviews[0].review_text : null,
              reviews: reviews.slice(0, 3), // Include up to 3 reviews
            };
          } catch (err) {
            // If we can't get reviews (e.g., authorization), just return the submission
            return {
              ...sub,
              reviewCount: 0,
              averageRating: null,
              latest_feedback: null,
              reviews: [],
            };
          }
        })
      );

      res.json({
        success: true,
        data: submissionsWithReviews,
      });
    } catch (error) {
      next(error);
    }
  },

  // Submit new work for peer review
  submitWorkForReview: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { title, description, content, category, difficulty } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required',
        });
      }

      const submissionService = require('../services/submissionService');

      // Create a custom peer review challenge/submission
      const submission = await submissionService.createPeerReviewSubmission(
        userId,
        {
          title,
          description,
          content,
          category: category || 'General',
          difficulty: difficulty || 'Intermediate',
        }
      );

      res.status(201).json({
        success: true,
        data: submission,
        message: 'Work submitted successfully! Other users can now review it.',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get feedback received on user's submissions
  getReceivedFeedback: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { unreadOnly } = req.query;

      const reviews = await peerReviewService.getReceivedReviews(userId);

      // Filter to unread if requested
      let filteredReviews = reviews;
      if (unreadOnly === 'true') {
        filteredReviews = reviews.filter((r) => !r.read_by_reviewee);
      }

      res.json({
        success: true,
        data: {
          reviews: filteredReviews,
          unreadCount: reviews.filter((r) => !r.read_by_reviewee).length,
          totalCount: reviews.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark feedback as read
  markFeedbackRead: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { reviewId } = req.params;

      await peerReviewService.markReviewRead(reviewId, userId);

      res.json({
        success: true,
        message: 'Feedback marked as read',
      });
    } catch (error) {
      next(error);
    }
  },

  // Update a submission
  updateSubmission: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { submissionId } = req.params;
      const { title, description, content, category, difficulty } = req.body;

      const submissionService = require('../services/submissionService');
      const db = require('../database/connection');

      // Get submission to verify ownership
      const submission = await submissionService.getSubmissionById(
        submissionId
      );
      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found',
        });
      }

      if (submission.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this submission',
        });
      }

      // Update the challenge (title, description, category, difficulty)
      if (title || description || category || difficulty) {
        const challengeUpdates = [];
        const challengeValues = [];
        let paramCount = 0;

        if (title) {
          paramCount++;
          challengeUpdates.push(`title = $${paramCount}`);
          challengeValues.push(title);
        }
        if (description) {
          paramCount++;
          challengeUpdates.push(`description = $${paramCount}`);
          challengeValues.push(description);
        }
        if (category) {
          paramCount++;
          challengeUpdates.push(`category = $${paramCount}`);
          challengeValues.push(category);
        }
        if (difficulty) {
          paramCount++;
          challengeUpdates.push(`difficulty_level = $${paramCount}`);
          challengeValues.push(difficulty);
        }

        if (challengeUpdates.length > 0) {
          paramCount++;
          challengeValues.push(submission.challenge_id);
          await db.query(
            `UPDATE challenges SET ${challengeUpdates.join(
              ', '
            )}, updated_at = CURRENT_TIMESTAMP
             WHERE id = $${paramCount}`,
            challengeValues
          );
        }
      }

      // Update the submission content
      if (content) {
        await submissionService.updateSubmission(submissionId, { content });
      }

      res.json({
        success: true,
        message: 'Submission updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete a submission
  deleteSubmission: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { submissionId } = req.params;

      const submissionService = require('../services/submissionService');
      const db = require('../database/connection');

      // Get submission to verify ownership
      const submission = await submissionService.getSubmissionById(
        submissionId
      );
      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found',
        });
      }

      if (submission.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this submission',
        });
      }

      const challengeId = submission.challenge_id;

      // Delete the submission (this also deletes peer reviews via cascade or service)
      await submissionService.deleteSubmission(submissionId);

      // Delete the associated challenge if it was created for peer review
      await db.query(
        'DELETE FROM challenges WHERE id = $1 AND created_by = $2 AND requires_peer_review = true',
        [challengeId, userId]
      );

      res.json({
        success: true,
        message: 'Submission deleted successfully',
      });
    } catch (error) {
      // Handle AppError instances
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
      }
      next(error);
    }
  },
};

module.exports = peerReviewController;
