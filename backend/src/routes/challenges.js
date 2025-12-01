// Challenge routes
const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const auth = require('../middleware/auth');

// GET / route for all challenges with filtering
router.get('/', challengeController.getChallenges);

// GET /categories route for popular categories (public)
router.get('/categories', challengeController.getPopularCategories);

// GET /my route for user's created challenges
router.get('/my', auth, challengeController.getUserChallenges);

// GET /recommended route for personalized recommendations
router.get('/recommended', auth, challengeController.getRecommendedChallenges);

// GET /by-goal/:goalId route for challenges linked to a specific goal
router.get('/by-goal/:goalId', auth, challengeController.getChallengesByGoal);

// GET /goal/:goalId route for challenges for a goal with progress
router.get('/goal/:goalId', auth, challengeController.getGoalChallenges);

// GET /:id route for single challenge
router.get('/:id', challengeController.getChallengeById);

// GET /:id/statistics route for challenge statistics
router.get('/:id/statistics', challengeController.getChallengeStatistics);

// POST / route for creating challenge
router.post('/', auth, challengeController.createChallenge);

// POST /from-ai route for creating challenge from AI content
router.post('/from-ai', auth, challengeController.createFromAI);

// POST /:id/submit route for submitting work to a challenge
router.post('/:id/submit', auth, challengeController.submitChallenge);

// POST /:id/complete route for completing a challenge
router.post('/:id/complete', auth, challengeController.completeChallenge);

// POST /:id/link-goal route for linking challenge to goal
router.post('/:id/link-goal', auth, challengeController.linkToGoal);

// PUT /:id route for updating challenge
router.put('/:id', auth, challengeController.updateChallenge);

// DELETE /:id route for deleting challenge
router.delete('/:id', auth, challengeController.deleteChallenge);

// DELETE /:id/unlink-goal route for unlinking challenge from goal
router.delete(
  '/:id/unlink-goal',
  auth,
  challengeController.unlinkChallengeFromGoal
);

module.exports = router;
