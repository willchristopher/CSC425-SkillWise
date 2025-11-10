// AI integration controller for feedback and hints
const aiService = require('../services/aiService');
const { AppError } = require('../middleware/errorHandler');

const aiController = {
  /**
   * Generate AI feedback for code submission
   * POST /api/ai/feedback
   * Body: { submissionText, challengeContext: { title, description, difficulty } }
   */
  generateFeedback: async (req, res, next) => {
    try {
      const { submissionText, challengeContext } = req.body;

      if (!submissionText) {
        return next(new AppError('Submission text is required', 400, 'VALIDATION_ERROR'));
      }

      // Validate submission text length
      if (submissionText.length > 10000) {
        return next(new AppError('Submission text too long (max 10000 characters)', 400, 'VALIDATION_ERROR'));
      }

      const result = await aiService.generateFeedback(submissionText, challengeContext || {});

      res.status(200).json({
        status: 'success',
        data: {
          feedback: result.feedback,
          metadata: {
            model: result.model,
            tokensUsed: result.tokensUsed,
            timestamp: result.timestamp
          }
        }
      });
    } catch (error) {
      if (error.message.includes('API key')) {
        return next(new AppError(error.message, 503, 'AI_SERVICE_ERROR'));
      }
      next(new AppError(error.message, 500, 'AI_FEEDBACK_ERROR'));
    }
  },

  /**
   * Get AI hints for a challenge
   * POST /api/ai/hints
   * Body: { challengeTitle, challengeDescription, userProgress }
   */
  getHints: async (req, res, next) => {
    try {
      const { challengeTitle, challengeDescription, userProgress } = req.body;

      if (!challengeTitle || !challengeDescription) {
        return next(new AppError('Challenge title and description are required', 400, 'VALIDATION_ERROR'));
      }

      const result = await aiService.generateHints(
        challengeTitle,
        challengeDescription,
        userProgress || ''
      );

      res.status(200).json({
        status: 'success',
        data: {
          hints: result.hints,
          timestamp: result.timestamp
        }
      });
    } catch (error) {
      if (error.message.includes('API key')) {
        return next(new AppError(error.message, 503, 'AI_SERVICE_ERROR'));
      }
      next(new AppError(error.message, 500, 'AI_HINTS_ERROR'));
    }
  },

  /**
   * Generate personalized challenge suggestions
   * POST /api/ai/suggestions
   * Body: { skillLevel, completedTopics, languages, goals }
   */
  suggestChallenges: async (req, res, next) => {
    try {
      const userProfile = {
        skillLevel: req.body.skillLevel || 'Beginner',
        completedTopics: req.body.completedTopics || [],
        languages: req.body.languages || [],
        goals: req.body.goals || 'General programming improvement'
      };

      const result = await aiService.suggestNextChallenges(userProfile);

      res.status(200).json({
        status: 'success',
        data: {
          suggestions: result.suggestions,
          timestamp: result.timestamp
        }
      });
    } catch (error) {
      if (error.message.includes('API key')) {
        return next(new AppError(error.message, 503, 'AI_SERVICE_ERROR'));
      }
      next(new AppError(error.message, 500, 'AI_SUGGESTIONS_ERROR'));
    }
  },

  /**
   * Analyze learning progress and patterns
   * POST /api/ai/analysis
   * Body: { completedChallenges, successRate, strengths, weaknesses, recentActivity }
   */
  analyzeProgress: async (req, res, next) => {
    try {
      const learningData = {
        completedChallenges: req.body.completedChallenges || 0,
        successRate: req.body.successRate || 0,
        strengths: req.body.strengths || [],
        weaknesses: req.body.weaknesses || [],
        recentActivity: req.body.recentActivity || 'No recent activity'
      };

      const result = await aiService.analyzePattern(learningData);

      res.status(200).json({
        status: 'success',
        data: {
          analysis: result.analysis,
          timestamp: result.timestamp
        }
      });
    } catch (error) {
      if (error.message.includes('API key')) {
        return next(new AppError(error.message, 503, 'AI_SERVICE_ERROR'));
      }
      next(new AppError(error.message, 500, 'AI_ANALYSIS_ERROR'));
    }
  },

  /**
   * Generate practice questions for a learning goal
   * POST /api/ai/practice-questions
   * Body: { goalId, title, description, difficulty, category }
   */
  generatePracticeQuestions: async (req, res, next) => {
    try {
      const { title, description, difficulty, category } = req.body;

      console.log('🤖 Generate practice questions request:', { title, description, difficulty, category });

      if (!title) {
        return next(new AppError('Goal title is required', 400, 'VALIDATION_ERROR'));
      }

      const goal = {
        title,
        description,
        difficulty: difficulty || 'medium',
        category: category || 'programming',
      };

      console.log('📝 Calling AI service with goal:', goal);
      const result = await aiService.generatePracticeQuestions(goal);
      console.log('✅ AI service returned:', { totalQuestions: result.totalQuestions, isAIGenerated: result.isAIGenerated });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      console.error('❌ AI Controller Error:', error.message);
      console.error('Stack:', error.stack);
      
      if (error.message.includes('API key')) {
        return next(new AppError(error.message, 503, 'AI_SERVICE_ERROR'));
      }
      next(new AppError(error.message, 500, 'AI_QUESTIONS_ERROR'));
    }
  },

  /**
   * Generate study plan for a learning goal
   * POST /api/ai/study-plan
   * Body: { title, description, difficulty, targetCompletionDate, currentProgress }
   */
  generateStudyPlan: async (req, res, next) => {
    try {
      const { title, description, difficulty, targetCompletionDate, currentProgress } = req.body;

      if (!title) {
        return next(new AppError('Goal title is required', 400, 'VALIDATION_ERROR'));
      }

      const goal = {
        title,
        description,
        difficulty: difficulty || 'medium',
        targetCompletionDate,
        currentProgress: currentProgress || 0,
      };

      const result = await aiService.generateStudyPlan(goal);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      if (error.message.includes('API key')) {
        return next(new AppError(error.message, 503, 'AI_SERVICE_ERROR'));
      }
      next(new AppError(error.message, 500, 'AI_STUDY_PLAN_ERROR'));
    }
  },
};

module.exports = aiController;