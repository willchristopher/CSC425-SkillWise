const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');

// Get all submissions for current user
router.get('/', auth, submissionController.getUserSubmissions);

// Submit work for a challenge
router.post('/', auth, submissionController.submitWork);

// Get single submission by ID
router.get('/:id', auth, submissionController.getSubmission);

// Update submission
router.put('/:id', auth, submissionController.updateSubmission);

module.exports = router;