// AI Feedback controller for retrieving stored feedback
const aiFeedbackService = require('../services/aiFeedbackService');

const aiFeedbackController = {
  /**
   * Get feedback for a specific submission
   * GET /api/feedback/submission/:submissionId
   */
  getFeedbackBySubmission: async (req, res, next) => {
    try {
      const { submissionId } = req.params;
      const userId = req.user?.id;

      // First verify the submission belongs to the user
      const { query } = require('../database/connection');
      const submissionCheck = await query(
        'SELECT id FROM submissions WHERE id = $1 AND user_id = $2',
        [submissionId, userId]
      );

      if (submissionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
      }

      const feedback = await aiFeedbackService.getFeedbackBySubmission(
        submissionId
      );

      res.json({
        success: true,
        data: {
          feedback,
          count: feedback.length,
        },
      });
    } catch (error) {
      console.error('Error getting feedback:', error);
      next(error);
    }
  },

  /**
   * Get latest feedback for a submission
   * GET /api/feedback/submission/:submissionId/latest
   */
  getLatestFeedback: async (req, res, next) => {
    try {
      const { submissionId } = req.params;
      const userId = req.user?.id;

      // Verify submission belongs to user
      const { query } = require('../database/connection');
      const submissionCheck = await query(
        'SELECT id FROM submissions WHERE id = $1 AND user_id = $2',
        [submissionId, userId]
      );

      if (submissionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
      }

      const feedback = await aiFeedbackService.getLatestFeedback(submissionId);

      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'No feedback found for this submission',
        });
      }

      res.json({
        success: true,
        data: feedback,
      });
    } catch (error) {
      console.error('Error getting latest feedback:', error);
      next(error);
    }
  },

  /**
   * Get all feedback for the authenticated user
   * GET /api/feedback/user
   */
  getUserFeedback: async (req, res, next) => {
    try {
      const userId = req.user?.id;

      const feedback = await aiFeedbackService.getFeedbackByUser(userId);

      res.json({
        success: true,
        data: {
          feedback,
          count: feedback.length,
        },
      });
    } catch (error) {
      console.error('Error getting user feedback:', error);
      next(error);
    }
  },

  /**
   * Delete feedback
   * DELETE /api/feedback/:feedbackId
   */
  deleteFeedback: async (req, res, next) => {
    try {
      const { feedbackId } = req.params;
      const userId = req.user?.id;

      // Verify feedback belongs to user's submission
      const { query } = require('../database/connection');
      const feedbackCheck = await query(
        `SELECT af.id 
         FROM ai_feedback af
         JOIN submissions s ON af.submission_id = s.id
         WHERE af.id = $1 AND s.user_id = $2`,
        [feedbackId, userId]
      );

      if (feedbackCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Feedback not found',
        });
      }

      await aiFeedbackService.deleteFeedback(feedbackId);

      res.json({
        success: true,
        message: 'Feedback deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      next(error);
    }
  },
};

module.exports = aiFeedbackController;
