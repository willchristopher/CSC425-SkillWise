// Challenge CRUD operations controller
const challengeService = require('../services/challengeService');

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

      const filters = {};
      if (category) filters.category = category;
      if (difficulty) filters.difficulty = difficulty;
      if (requiresPeerReview !== undefined) filters.requiresPeerReview = requiresPeerReview === 'true';
      if (estimatedTimeMax) filters.estimatedTimeMax = parseInt(estimatedTimeMax, 10);
      if (search) filters.search = search;
      if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
      if (limit) filters.limit = parseInt(limit, 10);

      const challenges = await challengeService.getAllChallenges(filters);

      res.json({
        success: true,
        data: challenges,
        message: `Retrieved ${challenges.length} challenges`,
      });
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

      res.json({
        success: true,
        data: challenges,
        message: `Retrieved ${challenges.length} user challenges`,
      });
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

      const challenges = await challengeService.getChallengesByGoal(parseInt(goalId, 10), userId);

      res.json({
        success: true,
        data: challenges,
        message: `Retrieved ${challenges.length} challenges for goal ${goalId}`,
      });
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

      const challenge = await challengeService.getChallengeById(parseInt(id, 10), userId);

      res.json({
        success: true,
        data: challenge,
        message: 'Challenge retrieved successfully',
      });
    } catch (error) {
      if (error.message === 'Challenge not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
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

      const challenge = await challengeService.createChallenge(challengeData, creatorId);

      res.status(201).json({
        success: true,
        data: challenge,
        message: 'Challenge created successfully',
      });
    } catch (error) {
      if (error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
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
        userId,
      );

      res.json({
        success: true,
        data: challenge,
        message: 'Challenge updated successfully',
      });
    } catch (error) {
      if (error.message === 'Challenge not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Not authorized to update this challenge') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
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

      res.json({
        success: true,
        message: 'Challenge deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Challenge not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Not authorized to delete this challenge') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
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
        userId,
      );

      res.status(201).json({
        success: true,
        data: link,
        message: 'Challenge linked to goal successfully',
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('not accessible')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('already linked')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
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
        userId,
      );

      res.json({
        success: true,
        message: 'Challenge unlinked from goal successfully',
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('not accessible')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
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

      const statistics = await challengeService.getChallengeStatistics(parseInt(id, 10));

      res.json({
        success: true,
        data: statistics,
        message: 'Challenge statistics retrieved successfully',
      });
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
        limit ? parseInt(limit, 10) : 10,
      );

      res.json({
        success: true,
        data: recommendations,
        message: `Retrieved ${recommendations.length} recommended challenges`,
      });
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

      res.json({
        success: true,
        data: categories,
        message: 'Popular categories retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = challengeController;

module.exports = challengeController;
