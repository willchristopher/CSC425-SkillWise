const Challenge = require('../models/Challenge');

const challengeController = {
  // Get all challenges
  getChallenges: async (req, res, next) => {
    try {
      const { difficulty, subject } = req.query;
      
      let challenges;
      if (difficulty) {
        challenges = await Challenge.findByDifficulty(difficulty);
      } else if (subject) {
        challenges = await Challenge.findBySubject(subject);
      } else {
        challenges = await Challenge.findAll();
      }

      res.status(200).json({
        success: true,
        data: challenges,
        count: challenges.length
      });
    } catch (error) {
      next(error);
    }
  },

  // Get challenge by ID
  getChallengeById: async (req, res, next) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid challenge ID'
        });
      }

      const challenge = await Challenge.findById(id);
      
      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      res.status(200).json({
        success: true,
        data: challenge
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new challenge (admin only)
  createChallenge: async (req, res, next) => {
    try {
      const { title, description, instructions, difficulty, subject, points, type, content, category, goal_id } = req.body;

      // Validate required fields
      if (!title || !description || !instructions) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, and instructions are required'
        });
      }

      const challengeData = {
        title,
        description,
        instructions,
        category: category || subject || 'general',
        difficulty_level: difficulty || 'medium',
        points_reward: points || 10,
        goal_id: goal_id || null,
        created_by: req.user?.userId || null,
        type: type || 'coding',
        content
      };

      const newChallenge = await Challenge.create(challengeData);

      res.status(201).json({
        success: true,
        message: 'Challenge created successfully',
        data: newChallenge
      });
    } catch (error) {
      next(error);
    }
  },

  // Update challenge (admin only)
  updateChallenge: async (req, res, next) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid challenge ID'
        });
      }

      const { title, description, difficulty, subject, points, type, content } = req.body;

      // Check if challenge exists
      const existingChallenge = await Challenge.findById(id);
      if (!existingChallenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      const updateData = {
        title,
        description,
        difficulty,
        subject,
        points,
        type,
        content
      };

      const updatedChallenge = await Challenge.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Challenge updated successfully',
        data: updatedChallenge
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete challenge (admin only)
  deleteChallenge: async (req, res, next) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid challenge ID'
        });
      }

      // Check if challenge exists
      const existingChallenge = await Challenge.findById(id);
      if (!existingChallenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      await Challenge.delete(id);

      res.status(200).json({
        success: true,
        message: 'Challenge deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = challengeController;