// Routes for testing Sentry error tracking
const express = require('express');
const router = express.Router();
const sentryTestController = require('../controllers/sentryTestController');
const asyncHandler = require('../utils/asyncHandler');

// Get Sentry status
router.get('/status', asyncHandler(sentryTestController.getSentryStatus));

// Test handled error
router.get(
  '/test-handled-error',
  asyncHandler(sentryTestController.testHandledError)
);

// Test unhandled error
router.get(
  '/test-unhandled-error',
  asyncHandler(sentryTestController.testUnhandledError)
);

// Test message
router.get('/test-message', asyncHandler(sentryTestController.testMessage));

// Test server error
router.get(
  '/test-server-error',
  asyncHandler(sentryTestController.testServerError)
);

module.exports = router;
