// AI integration controller for feedback, hints, and challenge generation
const aiService = require('../services/aiService');
const db = require('../database/connection');
const pino = require('pino');

const logger = pino({ name: 'ai-controller' });

const aiController = {
  /**
   * Generate a challenge using AI (Story 3.1, 3.2)
   * POST /api/ai/generateChallenge
   * Body: { category, topic, difficulty, questionTypes, numQuestions, customInstructions }
   */
  generateChallenge: async (req, res, next) => {
    try {
      const {
        category,
        topic,
        difficulty,
        questionTypes,
        numQuestions,
        customInstructions,
        // Legacy support
        skill,
      } = req.body;

      // Log the request (Story 3.2 requirement)
      logger.info({
        action: 'generateChallenge_request',
        userId: req.user?.id,
        params: { category, topic, difficulty, questionTypes, numQuestions },
      });

      // Generate challenge using AI service with new parameters
      const challenge = await aiService.generateChallenge({
        category: category || 'programming',
        topic: topic || skill || 'General',
        difficulty: difficulty || 'intermediate',
        questionTypes: questionTypes || ['mcq', 'short-answer'],
        numQuestions: parseInt(numQuestions) || 5,
        customInstructions: customInstructions || '',
      });

      // Log the response (Story 3.2 requirement)
      logger.info({
        action: 'generateChallenge_response',
        userId: req.user?.id,
        challengeTitle: challenge.title,
        questionCount: challenge.questions?.length,
        generatedAt: challenge.generatedAt,
      });

      res.json({
        success: true,
        data: challenge,
      });
    } catch (error) {
      logger.error({
        action: 'generateChallenge_error',
        userId: req.user?.id,
        error: error.message,
      });
      next(error);
    }
  },

  /**
   * Submit work for AI feedback (Story 3.4, 3.5, 3.6)
   * POST /api/ai/submitForFeedback
   * Body: { submissionText, challengeContext: { title, description }, submissionId? }
   */
  submitForFeedback: async (req, res, next) => {
    try {
      const { submissionText, challengeContext, submissionId } = req.body;

      // Validate input
      if (!submissionText) {
        return res.status(400).json({
          success: false,
          message: 'submissionText is required',
        });
      }

      if (!challengeContext || !challengeContext.title) {
        return res.status(400).json({
          success: false,
          message: 'challengeContext with title is required',
        });
      }

      logger.info({
        action: 'submitForFeedback_request',
        userId: req.user?.id,
        submissionLength: submissionText.length,
        challengeTitle: challengeContext.title,
      });

      // Build the prompt for logging (Story 3.6)
      const promptText = `Challenge: ${challengeContext.title}\nDescription: ${
        challengeContext.description || ''
      }\nSubmission: ${submissionText.substring(0, 500)}...`;

      // Generate feedback using AI service
      const startTime = Date.now();
      const feedback = await aiService.submitForFeedback(
        submissionText,
        challengeContext
      );
      const processingTime = Date.now() - startTime;

      // Story 3.6: Full response for storage
      const responseText = JSON.stringify(feedback);

      // Save to database if submissionId is provided (Story 3.5, 3.6)
      let savedFeedback = null;
      if (submissionId) {
        try {
          // Story 3.6: Table with submission_id, prompt, response, model, score, rubric
          const result = await db.query(
            `INSERT INTO ai_feedback (
              submission_id,
              prompt,
              response,
              model,
              score,
              rubric,
              feedback_text, 
              feedback_type,
              confidence_score,
              suggestions,
              strengths,
              improvements,
              processing_time_ms
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`,
            [
              submissionId,
              promptText, // Story 3.6: prompt
              responseText, // Story 3.6: response
              process.env.GEMINI_MODEL || 'gemini-2.0-flash', // Story 3.6: model
              feedback.overall_score || null, // Story 3.6: score
              JSON.stringify(feedback.rubric_criteria || {}), // Story 3.6: rubric
              feedback.feedback_summary || '',
              'submission_feedback',
              feedback.overall_score ? feedback.overall_score / 100 : null,
              feedback.suggestions || [],
              feedback.strengths || [],
              feedback.improvements || [],
              processingTime,
            ]
          );
          savedFeedback = result.rows[0];
          logger.info({
            action: 'submitForFeedback_saved',
            feedbackId: savedFeedback.id,
            submissionId,
          });
        } catch (dbError) {
          logger.warn({
            action: 'submitForFeedback_save_failed',
            error: dbError.message,
            submissionId,
          });
          // Continue - we still return the feedback even if save fails
        }
      }

      res.json({
        success: true,
        data: {
          feedback,
          savedToDatabase: !!savedFeedback,
          feedbackId: savedFeedback?.id,
        },
      });
    } catch (error) {
      logger.error({
        action: 'submitForFeedback_error',
        userId: req.user?.id,
        error: error.message,
      });
      next(error);
    }
  },

  /**
   * Generate AI feedback for a submission (legacy endpoint)
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
          message:
            'Missing required fields: submissionText and challengeContext',
        });
      }

      if (!challengeContext.title || !challengeContext.description) {
        return res.status(400).json({
          success: false,
          message: 'challengeContext must include title and description',
        });
      }

      // Generate feedback using AI service
      const feedback = await aiService.generateFeedback(
        submissionText,
        challengeContext
      );

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
   * POST /api/ai/hints/:challengeId
   * Body: { challenge: { title, description, difficulty } }
   */
  getHints: async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const { attempts = 0, lastAttempt } = req.query;
      const { challenge } = req.body;

      if (!challenge || !challenge.title || !challenge.description) {
        return res.status(400).json({
          success: false,
          message:
            'Challenge details (title, description, difficulty) are required in request body',
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
