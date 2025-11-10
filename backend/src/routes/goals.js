const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

// Get user statistics
router.get('/stats', auth, goalController.getStats);

// Get all user goals
router.get('/', auth, goalController.getGoals);

// Get single goal by ID
router.get('/:id', auth, goalController.getGoalById);

// Create new goal
router.post('/', auth, validation.goalValidation, goalController.createGoal);

// Update goal
router.put('/:id', auth, goalController.updateGoal);

// Delete goal
router.delete('/:id', auth, goalController.deleteGoal);

module.exports = router;