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

// GET /:id route for single challenge
router.get('/:id', challengeController.getChallengeById);

// GET /:id/statistics route for challenge statistics
router.get('/:id/statistics', challengeController.getChallengeStatistics);

// POST / route for creating challenge
router.post('/', auth, challengeController.createChallenge);

// POST /:id/link-goal route for linking challenge to goal
router.post('/:id/link-goal', auth, challengeController.linkChallengeToGoal);

// POST /submit/complete route for marking submission as complete (must come before /:id/submit)
router.post(
  '/submit/complete',
  auth,
  challengeController.markSubmissionComplete
);

// POST /:id/submit route for submitting a challenge solution
router.post('/:id/submit', auth, challengeController.submitChallenge);

// GET /:id/submissions route for getting challenge submissions
router.get(
  '/:id/submissions',
  auth,
  challengeController.getChallengeSubmissions
);

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
