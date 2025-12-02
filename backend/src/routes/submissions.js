const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');

// Submit work for a challenge
router.post('/', auth, submissionController.submitWork);

// Get submission by ID
router.get('/:id', auth, submissionController.getSubmission);

// Get user submissions
router.get('/user/:userId', auth, submissionController.getUserSubmissions);

// Get current user's submissions
router.get('/my/submissions', auth, (req, res, next) => {
  req.params.userId = req.user.id;
  submissionController.getUserSubmissions(req, res, next);
});

// Get submissions for a challenge
router.get(
  '/challenge/:challengeId',
  auth,
  submissionController.getChallengeSubmissions
);

// Update submission
router.put('/:id', auth, submissionController.updateSubmission);

// Delete submission
router.delete('/:id', auth, submissionController.deleteSubmission);

module.exports = router;
