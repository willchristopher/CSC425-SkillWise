// AI routes for Gemini API integration
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// POST /api/ai/generateChallenge - Generate a challenge using AI (Story 3.1, 3.2)
// Body: { skill, difficulty, category, topic }
router.post('/generateChallenge', auth, aiController.generateChallenge);

// POST /api/ai/submitForFeedback - Submit work for AI feedback (Story 3.4, 3.5)
// Body: { submissionText, challengeContext: { title, description }, submissionId? }
router.post('/submitForFeedback', auth, aiController.submitForFeedback);

// POST /api/ai/feedback - Generate AI feedback for a submission (legacy)
// Body: { submissionText, challengeContext: { title, description, requirements } }
router.post('/feedback', auth, aiController.generateFeedback);

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

module.exports = router;
