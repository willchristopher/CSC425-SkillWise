const submissionService = require('../services/submissionService');

const submissionController = {
  /**
   * Submit work for a challenge
   */
  submitWork: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const submissionData = req.body;

      const submission = await submissionService.submitSolution(submissionData, userId);

      res.status(201).json({
        success: true,
        message: 'Submission created successfully',
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get submission by ID
   */
  getSubmission: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const submission = await submissionService.getSubmissionById(id, userId);

      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all submissions for the current user
   */
  getUserSubmissions: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const submissions = await submissionService.getUserSubmissions(userId);

      res.status(200).json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update submission status
   */
  updateSubmission: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      const submission = await submissionService.updateSubmissionStatus(id, status, userId);

      res.status(200).json({
        success: true,
        message: 'Submission updated successfully',
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = submissionController;