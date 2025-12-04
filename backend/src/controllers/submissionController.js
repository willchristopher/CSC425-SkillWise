const submissionService = require('../services/submissionService');

const submissionController = {
  // Submit work for a challenge
  submitWork: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { challengeId, content, language, notes } = req.body;

      if (!challengeId || !content) {
        return res.status(400).json({
          success: false,
          error: 'Challenge ID and content are required',
        });
      }

      const submission = await submissionService.createSubmission({
        userId,
        challengeId,
        content,
        language,
        notes,
      });

      res.status(201).json({
        success: true,
        data: submission,
        message: 'Submission created successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get submission by ID
  getSubmission: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const submission = await submissionService.getSubmissionById(id);

      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found',
        });
      }

      // Check if user owns the submission or has permission to view
      if (submission.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this submission',
        });
      }

      res.json({
        success: true,
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user submissions
  getUserSubmissions: async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user.id;
      const { limit, offset, status } = req.query;

      const submissions = await submissionService.getUserSubmissions(userId, {
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
        status,
      });

      res.json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update submission
  updateSubmission: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { content, language, notes } = req.body;

      // Verify ownership
      const existing = await submissionService.getSubmissionById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found',
        });
      }

      if (existing.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this submission',
        });
      }

      // Can only update pending/draft submissions
      if (existing.status === 'graded') {
        return res.status(400).json({
          success: false,
          error: 'Cannot update a graded submission',
        });
      }

      const updated = await submissionService.updateSubmission(id, {
        content,
        language,
        notes,
      });

      res.json({
        success: true,
        data: updated,
        message: 'Submission updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete submission
  deleteSubmission: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify ownership
      const existing = await submissionService.getSubmissionById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found',
        });
      }

      if (existing.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this submission',
        });
      }

      await submissionService.deleteSubmission(id);

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

  // Get submissions for a specific challenge
  getChallengeSubmissions: async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const { limit, offset } = req.query;

      const submissions = await submissionService.getChallengeSubmissions(
        challengeId,
        {
          limit: parseInt(limit) || 20,
          offset: parseInt(offset) || 0,
        }
      );

      res.json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      next(error);
    }
  },

  // Grade a submission (by AI or instructor)
  gradeSubmission: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { score, feedback } = req.body;
      const userId = req.user.id;

      if (score === undefined || feedback === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Score and feedback are required',
        });
      }

      // Verify the submission belongs to the authenticated user (for permission check)
      const submission = await submissionService.getSubmissionById(id);
      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Submission not found',
        });
      }

      // Grade the submission (this will update stats and streak)
      const gradedSubmission = await submissionService.gradeSubmission(
        id,
        { score, feedback },
        userId // grader ID
      );

      res.json({
        success: true,
        data: gradedSubmission,
        message: 'Submission graded successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = submissionController;
