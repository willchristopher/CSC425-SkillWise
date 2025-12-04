// Challenge CRUD operations controller
const challengeService = require('../services/challengeService');

/**
 * Helper function for standardized error responses
 */
const sendError = (res, statusCode, message, code = null) => {
  const response = { success: false, message };
  if (code) response.code = code;
  return res.status(statusCode).json(response);
};

/**
 * Helper function for standardized success responses
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = { success: true };
  if (data !== null) response.data = data;
  response.message = message;
  return res.status(statusCode).json(response);
};

const challengeController = {
  /**
   * Get all challenges with optional filtering
   */
  getChallenges: async (req, res, next) => {
    try {
      const {
        category,
        difficulty,
        requiresPeerReview,
        estimatedTimeMax,
        search,
        tags,
        limit,
      } = req.query;
      const userId = req.user?.id || null;

      const filters = {};
      if (category) filters.category = category;
      if (difficulty) filters.difficulty = difficulty;
      if (requiresPeerReview !== undefined)
        filters.requiresPeerReview = requiresPeerReview === 'true';
      if (estimatedTimeMax)
        filters.estimatedTimeMax = parseInt(estimatedTimeMax, 10);
      if (search) filters.search = search;
      if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
      if (limit) filters.limit = parseInt(limit, 10);

      const challenges = await challengeService.getAllChallenges(
        filters,
        userId
      );

      sendSuccess(res, challenges, `Retrieved ${challenges.length} challenges`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get challenges for the current user
   */
  getUserChallenges: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const challenges = await challengeService.getUserChallenges(userId);

      sendSuccess(res, challenges, `Retrieved ${challenges.length} user challenges`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get challenges linked to a specific goal
   */
  getChallengesByGoal: async (req, res, next) => {
    try {
      const { goalId } = req.params;
      const userId = req.user.id;

      const challenges = await challengeService.getChallengesByGoal(
        parseInt(goalId, 10),
        userId
      );

      sendSuccess(res, challenges, `Retrieved ${challenges.length} challenges for goal ${goalId}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single challenge by ID
   */
  getChallengeById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id; // Optional for public challenges

      const challenge = await challengeService.getChallengeById(
        parseInt(id, 10),
        userId
      );

      sendSuccess(res, challenge, 'Challenge retrieved successfully');
    } catch (error) {
      if (error.message === 'Challenge not found') {
        return sendError(res, 404, error.message);
      }
      next(error);
    }
  },

  /**
   * Create a new challenge
   */
  createChallenge: async (req, res, next) => {
    try {
      const challengeData = req.body;
      const creatorId = req.user.id;

      const challenge = await challengeService.createChallenge(
        challengeData,
        creatorId
      );

      sendSuccess(res, challenge, 'Challenge created successfully', 201);
    } catch (error) {
      if (error.message.includes('Validation error')) {
        return sendError(res, 400, error.message);
      }
      next(error);
    }
  },

  /**
   * Update a challenge
   */
  updateChallenge: async (req, res, next) => {
    try {
      const { id } = req.params;
      const challengeData = req.body;
      const userId = req.user.id;

      const challenge = await challengeService.updateChallenge(
        parseInt(id, 10),
        challengeData,
        userId
      );

      sendSuccess(res, challenge, 'Challenge updated successfully');
    } catch (error) {
      if (error.message === 'Challenge not found') {
        return sendError(res, 404, error.message);
      }
      if (error.message === 'Not authorized to update this challenge') {
        return sendError(res, 403, error.message);
      }
      if (error.message.includes('Validation error')) {
        return sendError(res, 400, error.message);
      }
      next(error);
    }
  },

  /**
   * Delete a challenge
   */
  deleteChallenge: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await challengeService.deleteChallenge(parseInt(id, 10), userId);

      sendSuccess(res, null, 'Challenge deleted successfully');
    } catch (error) {
      // Handle AppError instances
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message, error.code);
      }
      next(error);
    }
  },

  /**
   * Link a challenge to a goal
   */
  linkChallengeToGoal: async (req, res, next) => {
    try {
      const { id: challengeId } = req.params;
      const { goalId } = req.body;
      const userId = req.user.id;

      const link = await challengeService.linkChallengeToGoal(
        parseInt(challengeId, 10),
        parseInt(goalId, 10),
        userId
      );

      sendSuccess(res, link, 'Challenge linked to goal successfully', 201);
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('not accessible')
      ) {
        return sendError(res, 404, error.message);
      }
      if (error.message.includes('already linked')) {
        return sendError(res, 409, error.message);
      }
      next(error);
    }
  },

  /**
   * Unlink a challenge from a goal
   */
  unlinkChallengeFromGoal: async (req, res, next) => {
    try {
      const { id: challengeId } = req.params;
      const { goalId } = req.body;
      const userId = req.user.id;

      await challengeService.unlinkChallengeFromGoal(
        parseInt(challengeId, 10),
        parseInt(goalId, 10),
        userId
      );

      sendSuccess(res, null, 'Challenge unlinked from goal successfully');
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('not accessible')
      ) {
        return sendError(res, 404, error.message);
      }
      next(error);
    }
  },

  /**
   * Get challenge statistics
   */
  getChallengeStatistics: async (req, res, next) => {
    try {
      const { id } = req.params;

      const statistics = await challengeService.getChallengeStatistics(
        parseInt(id, 10)
      );

      sendSuccess(res, statistics, 'Challenge statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recommended challenges for the user
   */
  getRecommendedChallenges: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { limit } = req.query;

      const recommendations = await challengeService.getRecommendedChallenges(
        userId,
        limit ? parseInt(limit, 10) : 10
      );

      sendSuccess(res, recommendations, `Retrieved ${recommendations.length} recommended challenges`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get popular challenge categories
   */
  getPopularCategories: async (req, res, next) => {
    try {
      const categories = await challengeService.getPopularCategories();

      sendSuccess(res, categories, 'Popular categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Submit a solution for a challenge
   */
  submitChallenge: async (req, res, next) => {
    try {
      const challengeId = parseInt(req.params.id, 10);
      const userId = req.user.id;
      const { code, requestPeerReview } = req.body;

      if (!code || !code.trim()) {
        return sendError(res, 400, 'Code submission is required');
      }

      const submission = await challengeService.submitChallenge(
        challengeId,
        userId,
        code,
        requestPeerReview || false
      );

      const message =
        submission.status === 'pending_review'
          ? 'Challenge submitted for peer review!'
          : 'Challenge completed successfully!';
      sendSuccess(res, submission, message, 201);
    } catch (error) {
      // Handle AppError instances with proper status codes
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message, error.code);
      }

      // Fallback: Use case-insensitive matching for error messages
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('not found')) {
        return sendError(res, 404, error.message);
      }
      if (errorMessage.includes('maximum attempts')) {
        return sendError(res, 400, error.message);
      }
      if (errorMessage.includes('failed to submit')) {
        // Extract the actual error from the wrapped message
        const actualError = error.message.replace(
          /^Failed to submit challenge: /i,
          ''
        );
        const actualErrorLower = actualError.toLowerCase();

        if (actualErrorLower.includes('maximum attempts')) {
          return sendError(res, 400, actualError);
        }
        if (actualErrorLower.includes('not found')) {
          return sendError(res, 404, actualError);
        }
      }
      next(error);
    }
  },

  /**
   * Get submissions for a challenge
   */
  getChallengeSubmissions: async (req, res, next) => {
    try {
      const challengeId = parseInt(req.params.id, 10);
      const userId = req.user.id;

      const submissions = await challengeService.getChallengeSubmissions(
        challengeId,
        userId
      );

      sendSuccess(res, submissions, 'Submissions retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark a submission as complete and award points
   */
  markSubmissionComplete: async (req, res, next) => {
    try {
      const submissionId = parseInt(req.body.submission_id, 10);
      const challengeId = parseInt(req.body.challenge_id, 10);
      const userId = req.user.id;

      if (!submissionId || !challengeId) {
        return sendError(res, 400, 'Submission ID and Challenge ID are required');
      }

      const submission = await challengeService.markSubmissionComplete(
        submissionId,
        userId,
        challengeId
      );

      sendSuccess(res, submission, 'Challenge marked as complete and points awarded', 200);
    } catch (error) {
      if (
        error.message.includes('not found') ||
        error.message.includes('not authorized')
      ) {
        return sendError(res, 404, error.message);
      }
      if (error.message.includes('already marked')) {
        return sendError(res, 400, error.message);
      }
      next(error);
    }
  },
};

module.exports = challengeController;
