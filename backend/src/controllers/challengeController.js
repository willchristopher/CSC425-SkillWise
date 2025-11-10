const challengeService = require('../services/challengeService');

const challengeController = {
  // Get all challenges for user
  getChallenges: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { goal_id, is_completed, difficulty_level } = req.query;
      
      let challenges;
      
      if (goal_id) {
        challenges = await challengeService.getChallengesByGoal(goal_id, userId);
      } else {
        const filters = {};
        if (is_completed !== undefined) filters.is_completed = is_completed === 'true';
        if (difficulty_level) filters.difficulty_level = difficulty_level;
        
        challenges = await challengeService.getUserChallenges(userId, filters);
      }
      
      res.status(200).json({
        success: true,
        data: challenges,
        count: challenges.length,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get challenge by ID
  getChallengeById: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const challengeId = req.params.id;
      
      const challenge = await challengeService.getChallengeById(challengeId, userId);
      
      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found',
        });
      }
      
      res.status(200).json({
        success: true,
        data: challenge,
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new challenge
  createChallenge: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const challengeData = req.body;
      
      if (!challengeData.goal_id || !challengeData.title || !challengeData.description) {
        return res.status(400).json({
          success: false,
          message: 'Goal ID, title, and description are required',
        });
      }
      
      const newChallenge = await challengeService.createChallenge(challengeData, userId);
      
      res.status(201).json({
        success: true,
        message: 'Challenge created successfully',
        data: newChallenge,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update challenge
  updateChallenge: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const challengeId = req.params.id;
      const updates = req.body;
      
      const updatedChallenge = await challengeService.updateChallenge(
        challengeId,
        userId,
        updates
      );
      
      if (!updatedChallenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found',
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Challenge updated successfully',
        data: updatedChallenge,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete challenge
  deleteChallenge: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const challengeId = req.params.id;
      
      const deletedChallenge = await challengeService.deleteChallenge(challengeId, userId);
      
      if (!deletedChallenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found',
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Challenge deleted successfully',
        data: deletedChallenge,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = challengeController;