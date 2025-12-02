const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// Get user progress overview
router.get('/', auth, progressController.getProgress);

// Also support /overview for frontend compatibility
router.get('/overview', auth, progressController.getOverview);

// Get skill progress
router.get('/skills', auth, progressController.getSkills);

// Get activity feed
router.get('/activity', auth, progressController.getActivity);

// Get progress analytics
router.get('/analytics', auth, progressController.getAnalytics);

// Get milestones
router.get('/milestones', auth, progressController.getMilestones);

// Get user stats
router.get('/stats', auth, progressController.getStats);

// Get streak information
router.get('/streak', auth, progressController.getStreak);

// Track a progress event
router.post('/event', auth, progressController.updateProgress);

module.exports = router;
