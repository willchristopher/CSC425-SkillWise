const challengeService = require('../services/challengeService');

const challengeController = {
  /**
   * Get all challenges with optional filters
   */
  getChallenges: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const filters = {
        difficulty: req.query.difficulty,
        category: req.query.category,
        search: req.query.search,
      };

      const challenges = await challengeService.getChallenges(userId, filters);

      res.status(200).json({
        success: true,
        data: challenges,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single challenge by ID
   */
  getChallengeById: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const challenge = await challengeService.getChallengeById(id, userId);

      res.status(200).json({
        success: true,
        data: challenge,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Start a challenge (create submission)
   */
  startChallenge: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await challengeService.startChallenge(id, userId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Seed challenges (admin/dev only)
   */
  seedChallenges: async (req, res, next) => {
    try {
      await challengeService.seedChallenges();

      res.status(200).json({
        success: true,
        message: 'Challenges seeded successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = challengeController;