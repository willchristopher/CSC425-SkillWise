// AI routes for OpenAI integration
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// POST /api/ai/feedback - Generate AI feedback for an existing submission
// Body: { submissionId }
router.post('/feedback', auth, aiController.generateSubmissionFeedback);

// POST /api/ai/feedback/direct - Generate AI feedback for direct code input (tutor mode)
// Body: { submissionText, challengeContext: { title, description, requirements } }
router.post('/feedback/direct', auth, aiController.generateFeedback);

// POST /api/ai/hints/:challengeId - Get hints for a challenge
// Body: { challenge: { title, description, difficulty } }
// Query: ?attempts=0&lastAttempt=...
router.post('/hints/:challengeId', auth, aiController.getHints);

// POST /api/ai/suggestions - Get personalized challenge suggestions
// Body: { userProfile: { skillLevel, completedCount, interests, goals, etc. } }
router.post('/suggestions', auth, aiController.suggestChallenges);

// POST /api/ai/analysis - Analyze learning progress
// Body: { userId, learningData: { completedChallenges, successRate, etc. } }
router.post('/analysis', auth, aiController.analyzeProgress);

// POST /api/ai/generateChallenge - Generate a challenge using AI
// Body: { category, difficulty, topic (optional), requirements (optional) }
router.post('/generateChallenge', auth, aiController.generateChallenge);

// POST /api/ai/analyze-topic - Analyze a topic from user input
// Body: { userInput }
router.post('/analyze-topic', auth, aiController.analyzeTopic);

// POST /api/ai/study-guide - Generate a comprehensive study guide
// Body: { topic, questionTypes, questionCount, gradingMode, difficultyLevel, additionalContext }
router.post('/study-guide', auth, aiController.generateStudyGuide);

// POST /api/ai/grade-answer - Grade a student's answer using AI
// Body: { question, correctAnswer, studentAnswer, questionType }
router.post('/grade-answer', auth, aiController.gradeAnswer);

module.exports = router;
