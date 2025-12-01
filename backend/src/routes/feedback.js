// Feedback routes for retrieving stored AI feedback
const express = require('express');
const router = express.Router();
const aiFeedbackController = require('../controllers/aiFeedbackController');
const auth = require('../middleware/auth');

// GET /api/feedback/submission/:submissionId - Get all feedback for a submission
router.get(
  '/submission/:submissionId',
  auth,
  aiFeedbackController.getFeedbackBySubmission
);

// GET /api/feedback/submission/:submissionId/latest - Get latest feedback for a submission
router.get(
  '/submission/:submissionId/latest',
  auth,
  aiFeedbackController.getLatestFeedback
);

// GET /api/feedback/user - Get all feedback for the authenticated user
router.get('/user', auth, aiFeedbackController.getUserFeedback);

// DELETE /api/feedback/:feedbackId - Delete specific feedback
router.delete('/:feedbackId', auth, aiFeedbackController.deleteFeedback);

module.exports = router;
