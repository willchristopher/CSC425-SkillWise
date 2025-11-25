// AI routes for OpenAI integration
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// POST /api/ai/feedback - Generate AI feedback for a submission
// Body: { submissionText, challengeContext: { title, description, requirements } }
router.post('/feedback', aiController.generateFeedback);

// POST /api/ai/submitForFeedback - Submit work and persist AI feedback
// Body: { submissionId (optional), submissionText, challengeContext }
router.post('/submitForFeedback', aiController.submitForFeedback);

// POST /api/ai/generateChallenge - Generate a new challenge from AI
// Body: { topic (optional), difficulty (optional) }
router.post('/generateChallenge', aiController.generateChallenge);

// POST /api/ai/hints/:challengeId - Get hints for a challenge
// Body: { challenge: { title, description, difficulty } }
// Query: ?attempts=0&lastAttempt=...
router.post('/hints/:challengeId', aiController.getHints);

// POST /api/ai/suggestions - Get personalized challenge suggestions
// Body: { userProfile: { skillLevel, completedCount, interests, goals, etc. } }
router.post('/suggestions', aiController.suggestChallenges);

// POST /api/ai/analysis - Analyze learning progress
// Body: { userId, learningData: { completedChallenges, successRate, etc. } }
router.post('/analysis', aiController.analyzeProgress);

module.exports = router;
