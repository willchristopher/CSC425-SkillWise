const express = require('express');
const router = express.Router();
const peerReviewController = require('../controllers/peerReviewController');
const auth = require('../middleware/auth');

// Get review queue (submissions available to review)
router.get('/queue', auth, peerReviewController.getReviewQueue);

// Get review assignments for current user
router.get('/assignments', auth, peerReviewController.getReviewAssignments);

// Get current user's submissions with review info
router.get('/my-submissions', auth, peerReviewController.getMySubmissions);

// Get reviews received by current user
router.get('/received', auth, peerReviewController.getReceivedReviews);

// Get feedback received (with unread count)
router.get('/feedback', auth, peerReviewController.getReceivedFeedback);

// Mark feedback as read
router.put(
  '/feedback/:reviewId/read',
  auth,
  peerReviewController.markFeedbackRead
);

// Get review history (reviews given)
router.get('/history', auth, peerReviewController.getReviewHistory);

// Get submission details for review
router.get(
  '/submissions/:submissionId',
  auth,
  peerReviewController.getSubmissionDetails
);

// Get reviews for a specific submission
router.get(
  '/submissions/:submissionId/reviews',
  auth,
  peerReviewController.getSubmissionReviews
);

// Submit work for peer review (new work, not a challenge)
router.post('/submit-work', auth, peerReviewController.submitWorkForReview);

// Submit a peer review
router.post('/', auth, peerReviewController.submitReview);

// Submit review for a specific submission
router.post('/submissions/:submissionId/review', auth, (req, res, next) => {
  req.body.submissionId = req.params.submissionId;
  peerReviewController.submitReview(req, res, next);
});

// Update a submission (title, content, etc.)
router.put(
  '/submissions/:submissionId',
  auth,
  peerReviewController.updateSubmission
);

// Delete a submission
router.delete(
  '/submissions/:submissionId',
  auth,
  peerReviewController.deleteSubmission
);

// Update a review
router.put('/:id', auth, peerReviewController.updateReview);

module.exports = router;
