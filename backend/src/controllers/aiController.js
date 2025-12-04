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
      const feedbackResult = await aiService.generateFeedback(
        submissionText,
        challengeContext
      );

      res.json({
        success: true,
        data: {
          feedback: feedbackResult.feedback, // Extract just the feedback text
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

  /**
   * Generate a challenge using AI
   * POST /api/ai/generateChallenge
   * Body: { category, difficulty, topic (optional), requirements (optional) }
   */
  generateChallenge: async (req, res, next) => {
    try {
      const { category, difficulty, topic, requirements } = req.body;

      // Validate input
      if (!category || !difficulty) {
        return res.status(400).json({
          success: false,
          message: 'category and difficulty are required',
        });
      }

      // Validate difficulty level
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: 'difficulty must be one of: easy, medium, hard',
        });
      }

      // Generate challenge using AI service
      const challenge = await aiService.generateChallenge({
        category,
        difficulty,
        topic,
        requirements,
        userId: req.user?.id, // Include user ID for logging
      });

      // Extra sanitization to ensure clean integers before sending to frontend
      const sanitizedChallenge = {
        ...challenge,
        estimated_time_minutes: Number.isInteger(
          challenge.estimated_time_minutes
        )
          ? challenge.estimated_time_minutes
          : parseInt(challenge.estimated_time_minutes, 10) || 30,
        points_reward: Number.isInteger(challenge.points_reward)
          ? challenge.points_reward
          : parseInt(challenge.points_reward, 10) || 10,
        max_attempts: challenge.max_attempts
          ? Number.isInteger(challenge.max_attempts)
            ? challenge.max_attempts
            : parseInt(challenge.max_attempts, 10)
          : 3,
      };

      res.json({
        success: true,
        data: sanitizedChallenge,
      });
    } catch (error) {
      console.error('Error generating challenge:', error);
      // Return a more helpful error message to the client
      return res.status(500).json({
        success: false,
        message:
          error.message || 'Failed to generate challenge. Please try again.',
      });
    }
  },

  /**
   * Generate AI feedback for an existing submission
   * POST /api/ai/feedback
   * Body: { submissionId }
   */
  generateSubmissionFeedback: async (req, res, next) => {
    try {
      const { submissionId } = req.body;
      const userId = req.user?.id;

      // Validate input
      if (!submissionId) {
        return res.status(400).json({
          success: false,
          message: 'submissionId is required',
        });
      }

      // Fetch submission from database
      const { query } = require('../database/connection');
      const submissionResult = await query(
        `
        SELECT 
          s.*,
          c.title,
          c.description,
          c.instructions
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.id = $1 AND s.user_id = $2
      `,
        [submissionId, userId]
      );

      if (submissionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
      }

      const submission = submissionResult.rows[0];

      // Truncate submission if it's very long to avoid API issues
      const maxLength = 8000;
      const truncatedText =
        submission.submission_text?.substring(0, maxLength) || '';
      const wasTruncated = submission.submission_text?.length > maxLength;

      // Generate AI feedback
      const startTime = Date.now();
      let feedbackResult;
      try {
        feedbackResult = await aiService.generateFeedback(
          truncatedText,
          {
            title: submission.title,
            description: submission.description,
            requirements: submission.instructions || '',
            previousAttempts: submission.attempt_number - 1,
          },
          userId
        );
      } catch (aiError) {
        console.error('AI Feedback Generation Failed:', aiError.message);
        // Return error to user with option to retry
        return res.status(500).json({
          success: false,
          message:
            'AI service is currently unavailable. Please try again in a moment.',
          error: aiError.message,
        });
      }

      const processingTime = Date.now() - startTime;

      // Parse the feedback to structure it better
      const feedbackText = feedbackResult.feedback;

      // Simple parsing to extract positive points and improvements
      const positiveMatch = feedbackText.match(
        /what.*?well[:\n]+([\s\S]*?)(?=\n\n|areas? for improvement|$)/i
      );
      const improvementsMatch = feedbackText.match(
        /areas? for improvement[:\n]+([\s\S]*?)(?=\n\n|suggestions?|$)/i
      );
      const suggestionsMatch = feedbackText.match(
        /suggestions?[:\n]+([\s\S]*?)$/i
      );

      // Store feedback in ai_feedback table
      const aiFeedbackService = require('../services/aiFeedbackService');
      await aiFeedbackService.createAIFeedback({
        submissionId: submission.id,
        prompt: feedbackResult.prompt.combined,
        response: feedbackText,
        feedbackType: 'on_demand',
        suggestions: suggestionsMatch ? [suggestionsMatch[1].trim()] : [],
        strengths: positiveMatch ? [positiveMatch[1].trim()] : [],
        improvements: improvementsMatch ? [improvementsMatch[1].trim()] : [],
        aiModel: 'gemini-2.5-flash',
        processingTimeMs: processingTime,
      });

      // Also update submission for backwards compatibility
      await query(
        `
        UPDATE submissions
        SET feedback = $1, updated_at = NOW()
        WHERE id = $2
      `,
        [feedbackText, submissionId]
      );

      res.json({
        success: true,
        data: {
          feedback: {
            overall: feedbackText,
            score: submission.score || 75,
            positive: positiveMatch ? [positiveMatch[1].trim()] : [],
            improvements: improvementsMatch
              ? [improvementsMatch[1].trim()]
              : [],
            suggestions: suggestionsMatch ? [suggestionsMatch[1].trim()] : [],
          },
          submissionId: submission.id,
          generatedAt: new Date().toISOString(),
          wasTruncated: wasTruncated,
          originalLength: submission.submission_text?.length,
          processingTimeMs: processingTime,
        },
      });
    } catch (error) {
      console.error('Error generating submission feedback:', error);
      next(error);
    }
  },

  /**
   * Analyze a topic from user input
   * POST /api/ai/analyze-topic
   * Body: { userInput }
   */
  analyzeTopic: async (req, res, next) => {
    try {
      const { userInput } = req.body;
      const userId = req.user?.id;

      if (!userInput || !userInput.trim()) {
        return res.status(400).json({
          success: false,
          message: 'userInput is required',
        });
      }

      const analysis = await aiService.analyzeTopic(userInput, userId);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('Error analyzing topic:', error);
      next(error);
    }
  },

  /**
   * Generate a comprehensive study guide
   * POST /api/ai/study-guide
   * Body: { topic, questionTypes, questionCount, gradingMode, difficultyLevel, additionalContext }
   */
  generateStudyGuide: async (req, res, next) => {
    try {
      const {
        topic,
        questionTypes,
        questionCount,
        gradingMode,
        difficultyLevel,
        additionalContext,
      } = req.body;
      const userId = req.user?.id;

      // Validate required fields
      if (
        !topic ||
        !questionTypes ||
        !questionCount ||
        !gradingMode ||
        !difficultyLevel
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Missing required fields: topic, questionTypes, questionCount, gradingMode, difficultyLevel',
        });
      }

      if (!Array.isArray(questionTypes) || questionTypes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'questionTypes must be a non-empty array',
        });
      }

      const studyGuide = await aiService.generateStudyGuide(
        {
          topic,
          questionTypes,
          questionCount,
          gradingMode,
          difficultyLevel,
          additionalContext,
        },
        userId
      );

      res.json({
        success: true,
        data: studyGuide,
      });
    } catch (error) {
      console.error('Error generating study guide:', error);
      next(error);
    }
  },

  /**
   * Grade a student's answer using AI
   * POST /api/ai/grade-answer
   * Body: { question, correctAnswer, studentAnswer, questionType }
   */
  gradeAnswer: async (req, res, next) => {
    try {
      const { question, correctAnswer, studentAnswer, questionType } = req.body;
      const userId = req.user?.id;

      if (!question || !correctAnswer || !studentAnswer || !questionType) {
        return res.status(400).json({
          success: false,
          message:
            'Missing required fields: question, correctAnswer, studentAnswer, questionType',
        });
      }

      const gradeResult = await aiService.gradeAnswer(
        { question, correctAnswer, studentAnswer, questionType },
        userId
      );

      res.json({
        success: true,
        data: gradeResult,
      });
    } catch (error) {
      console.error('Error grading answer:', error);
      next(error);
    }
  },

  /**
   * Grade a challenge submission using AI and update stats
   * POST /api/ai/grade-submission/:submissionId
   * Body: { challengeContext: { title, description, requirements } }
   */
  gradeSubmissionWithAI: async (req, res, next) => {
    try {
      const { submissionId } = req.params;
      const { challengeContext } = req.body;
      const userId = req.user?.id;
      const submissionService = require('../services/submissionService');
      const aiFeedbackService = require('../services/aiFeedbackService');

      if (!challengeContext) {
        return res.status(400).json({
          success: false,
          message: 'challengeContext is required',
        });
      }

      // Get the submission
      const submission = await submissionService.getSubmissionById(
        submissionId
      );
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
      }

      // Verify ownership
      if (submission.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to grade this submission',
        });
      }

      // Generate AI feedback
      const feedbackResult = await aiService.generateFeedback(
        submission.submission_text,
        challengeContext,
        userId
      );

      // Parse the feedback to extract score and feedback text
      let score = 75; // Default score
      let feedbackText = feedbackResult.feedback || 'No feedback provided';

      try {
        // Try to parse the feedback to extract a score if it's in JSON format
        const parsed = JSON.parse(feedbackResult.feedback);
        if (parsed.score) {
          score = Math.min(100, Math.max(0, parseInt(parsed.score) || 75));
        }
        feedbackText =
          parsed.feedback || parsed.text || feedbackResult.feedback;
      } catch (e) {
        // If not JSON, try to extract a score from the text
        const scoreMatch = feedbackText.match(/score[:\s]+(\d+)/i);
        if (scoreMatch) {
          score = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
        }
      }

      // Grade the submission (this updates stats and streak)
      console.log(
        `[gradeSubmissionWithAI] Grading submission ${submissionId} with score ${score}`
      );
      const gradedSubmission = await submissionService.gradeSubmission(
        submissionId,
        { score, feedback: feedbackText },
        null // No specific grader ID for AI grading
      );

      // Store the AI feedback for reference
      await aiFeedbackService.createAIFeedback({
        submissionId: submissionId,
        prompt: JSON.stringify(challengeContext),
        response: feedbackText,
        feedbackType: 'auto_grade',
        confidenceScore: score,
        aiModel: 'gemini-2.5-flash',
      });

      res.json({
        success: true,
        data: {
          submission: gradedSubmission,
          feedback: feedbackText,
          score: score,
          message: 'Submission graded successfully',
        },
      });
    } catch (error) {
      console.error('Error grading submission:', error);
      next(error);
    }
  },
};

module.exports = aiController;
