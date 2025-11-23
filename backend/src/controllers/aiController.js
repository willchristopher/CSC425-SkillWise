// AI integration controller for feedback and hints
const aiService = require('../services/aiService');
const db = require('../database/connection');

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

  /**
   * Submit work for AI feedback and persist the result
   * POST /api/ai/submitForFeedback
   * Body: { submissionId (optional), submissionText, challengeContext }
   */
  submitForFeedback: async (req, res, next) => {
    try {
      const { submissionId = null, submissionText, challengeContext } = req.body;

      if (!submissionText || !challengeContext) {
        return res.status(400).json({ success: false, message: 'submissionText and challengeContext required' });
      }

      // Generate feedback
      const feedbackText = await aiService.generateFeedback(submissionText, challengeContext);

      // Log prompt/response to console for auditing
      console.log('AI Feedback generated for submissionId=', submissionId);
      console.log('Feedback:', feedbackText?.slice(0, 200));

      // Persist into ai_feedback table if database available
      try {
        await db.query(
          `INSERT INTO ai_feedback (submission_id, feedback_text, feedback_type, ai_model, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [submissionId, feedbackText, 'submission_feedback', process.env.OPENAI_MODEL || process.env.GEMINI_MODEL || null]
        );
      } catch (dbErr) {
        console.warn('Warning: failed to persist AI feedback to database', dbErr.message || dbErr);
      }

      res.json({ success: true, data: { feedback: feedbackText, saved: true } });
    } catch (error) {
      console.error('Error in submitForFeedback:', error);
      next(error);
    }
  },

  /**
   * Generate a challenge from AI and log prompt/response
   * POST /api/ai/generateChallenge
   * Body: { topic (optional), difficulty (optional) }
   */
  generateChallenge: async (req, res, next) => {
    try {
      const { topic = 'general algorithms', difficulty = 'medium' } = req.body || {};

      // Call AI service to generate a challenge
      const challengeText = await aiService.generateChallenge({ topic, difficulty });

      // Attempt to parse returned text into JSON-like structure (best-effort)
      let challenge = { title: '', description: '', difficulty };
      if (typeof challengeText === 'string') {
        // Keep full text as description and try to extract a first-line title
        const lines = challengeText.split('\n').filter(Boolean);
        challenge.title = lines[0] ? lines[0].replace(/^#|\-\s*/g, '').trim() : `AI Challenge: ${topic}`;
        challenge.description = challengeText;
      } else if (typeof challengeText === 'object') {
        challenge = { ...challenge, ...challengeText };
      }

      // Log prompt/response
      console.log('AI generated challenge for topic=', topic, 'difficulty=', difficulty);
      console.log('Challenge title:', challenge.title);

      // Persist a record to ai_feedback table for audit (feedback_type used for generative logs)
      try {
        await db.query(
          `INSERT INTO ai_feedback (submission_id, feedback_text, feedback_type, ai_model, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [null, JSON.stringify(challenge), 'challenge_generation', process.env.OPENAI_MODEL || process.env.GEMINI_MODEL || null]
        );
      } catch (dbErr) {
        console.warn('Warning: failed to persist AI challenge log to database', dbErr.message || dbErr);
      }

      res.json({ success: true, data: { challenge } });
    } catch (error) {
      console.error('Error generating AI challenge:', error);
      next(error);
    }
  },
};

module.exports = aiController;
