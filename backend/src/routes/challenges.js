const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const auth = require('../middleware/auth');

// Seed challenges (dev endpoint) - MUST come before /:id routes
router.post('/seed', challengeController.seedChallenges);

// Get all challenges with optional filters
router.get('/', auth, challengeController.getChallenges);

// Get single challenge by ID
router.get('/:id', auth, challengeController.getChallengeById);

// Start a challenge (create submission)
router.post('/:id/start', auth, challengeController.startChallenge);

module.exports = router;