const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const auth = require('../middleware/auth');

// Get global leaderboard
router.get('/', auth, leaderboardController.getLeaderboard);

// Also support /global for frontend compatibility
router.get('/global', auth, leaderboardController.getLeaderboard);

// Get current user's ranking
router.get('/ranking', auth, leaderboardController.getUserRanking);

// Also support /user-rank for frontend compatibility
router.get('/user-rank', auth, leaderboardController.getUserRanking);

// Get points breakdown
router.get('/points', auth, leaderboardController.getPointsBreakdown);

// Get user's achievements
router.get('/achievements', auth, leaderboardController.getAchievements);

// Get all available achievements
router.get('/achievements/all', auth, leaderboardController.getAllAchievements);

// Get user stats
router.get('/stats', auth, leaderboardController.getUserStats);

// Get user stats by ID
router.get('/stats/:userId', auth, leaderboardController.getUserStats);

// Get top performers by category
router.get('/top', auth, leaderboardController.getTopPerformers);

// Award points (admin/system use)
router.post('/award', auth, leaderboardController.awardPoints);

module.exports = router;
