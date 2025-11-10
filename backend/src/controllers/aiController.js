// AI integration controller for feedback and hints
const aiService = require('../services/aiService');

const aiController = {
  /**
   * Generate AI feedback for a submission
   * POST /api/ai/feedback
   * Body: { submissionText, challengeContext: { title, description, requirements } }
   */
  generateFeedback: async (req, res, next) => {
    try {
      const { submissionText, challengeContext } = req.body;

      // Validate input
      if (!submissionText || !challengeContext) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: submissionText and challengeContext',
        });
      }

      if (!challengeContext.title || !challengeContext.description) {
        return res.status(400).json({
          success: false,
          message: 'challengeContext must include title and description',
        });
      }

      // Generate feedback using AI service
      const feedback = await aiService.generateFeedback(submissionText, challengeContext);

      res.json({
        success: true,
        data: {
          feedback,
          submissionLength: submissionText.length,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error generating feedback:', error);
      next(error);
    }
  },

  /**
   * Get AI hints for a challenge
   * GET /api/ai/hints/:challengeId
   * Query params: attempts, lastAttempt (optional)
   */
  getHints: async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const { attempts = 0, lastAttempt } = req.query;

      // In a real implementation, you would fetch challenge details from database
      // For now, we'll use mock data or expect it in request body
      const { challenge } = req.body;

      if (!challenge || !challenge.title || !challenge.description) {
        return res.status(400).json({
          success: false,
          message: 'Challenge details (title, description, difficulty) are required in request body',
        });
      }

      const userProgress = {
        attempts: parseInt(attempts, 10),
        lastAttempt,
      };

      // Generate hints using AI service
      const hints = await aiService.generateHints(challenge, userProgress);

      res.json({
        success: true,
        data: {
          challengeId,
          hints,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error generating hints:', error);
      next(error);
    }
  },

  /**
   * Generate challenge suggestions based on user profile
   * POST /api/ai/suggestions
   * Body: { userProfile: { skillLevel, completedCount, interests, goals, etc. } }
   */
  suggestChallenges: async (req, res, next) => {
    try {
      const { userProfile } = req.body;

      if (!userProfile || !userProfile.skillLevel) {
        return res.status(400).json({
          success: false,
          message: 'userProfile with skillLevel is required',
        });
      }

      // Generate suggestions using AI service
      const suggestions = await aiService.suggestNextChallenges(userProfile);

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      next(error);
    }
  },

  /**
   * Analyze learning progress using AI
   * POST /api/ai/analysis
   * Body: { userId, learningData: { completedChallenges, successRate, etc. } }
   */
  analyzeProgress: async (req, res, next) => {
    try {
      const { userId, learningData } = req.body;

      if (!userId || !learningData) {
        return res.status(400).json({
          success: false,
          message: 'userId and learningData are required',
        });
      }

      // Analyze patterns using AI service
      const analysis = await aiService.analyzePattern(userId, learningData);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('Error analyzing progress:', error);
      next(error);
    }
  },
};

module.exports = aiController;
