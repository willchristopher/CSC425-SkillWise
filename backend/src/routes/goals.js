// Goal routes
const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

// GET / route for user goals (with optional filters)
router.get('/', auth, goalController.getGoals);

// GET /statistics route for goal statistics
router.get('/statistics', auth, goalController.getGoalStatistics);

// GET /categories route for popular categories
router.get('/categories', goalController.getPopularCategories);

// GET /:id route for single goal
router.get('/:id', auth, goalController.getGoalById);

// POST / route for creating goal
router.post('/', auth, validation.goalValidation, goalController.createGoal);

// PUT /:id route for updating goal
router.put('/:id', auth, goalController.updateGoal);

// PUT /:id/progress route for updating goal progress
router.put('/:id/progress', auth, goalController.updateProgress);

// DELETE /:id route for deleting goal
router.delete('/:id', auth, goalController.deleteGoal);

module.exports = router;
