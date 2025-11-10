// AI routes for feedback, hints, and learning analysis
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// Generate AI feedback for code submission
// POST /api/ai/feedback
// Body: { submissionText, challengeContext: { title, description, difficulty } }
router.post('/feedback', auth, aiController.generateFeedback);

// Get AI-generated hints for a challenge
// POST /api/ai/hints
// Body: { challengeTitle, challengeDescription, userProgress }
router.post('/hints', auth, aiController.getHints);

// Get personalized challenge suggestions
// POST /api/ai/suggestions
// Body: { skillLevel, completedTopics, languages, goals }
router.post('/suggestions', auth, aiController.suggestChallenges);

// Analyze learning progress and patterns
// POST /api/ai/analysis
// Body: { completedChallenges, successRate, strengths, weaknesses, recentActivity }
router.post('/analysis', auth, aiController.analyzeProgress);

// Generate practice questions for a learning goal
// POST /api/ai/practice-questions
// Body: { title, description, difficulty, category }
router.post('/practice-questions', auth, aiController.generatePracticeQuestions);

// Generate study plan for a learning goal
// POST /api/ai/study-plan
// Body: { title, description, difficulty, targetCompletionDate, currentProgress }
router.post('/study-plan', auth, aiController.generateStudyPlan);

module.exports = router;