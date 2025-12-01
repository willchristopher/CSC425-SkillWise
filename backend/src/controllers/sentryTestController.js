// Controller for testing Sentry error tracking
const {
  captureException,
  captureMessage,
  Sentry,
} = require('../config/sentry');

/**
 * Test endpoint to trigger a handled error
 */
const testHandledError = async (req, res) => {
  try {
    // Simulate an error
    throw new Error('Test handled error from backend');
  } catch (error) {
    // Manually capture the error
    captureException(error, {
      extra: {
        testType: 'handled-error',
        endpoint: '/api/sentry/test-handled-error',
        userId: req.user?.id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Handled error captured and sent to Sentry',
      sentryEnabled: !!Sentry.getCurrentHub().getClient(),
    });
  }
};

/**
 * Test endpoint to trigger an unhandled error
 */
const testUnhandledError = async () => {
  // This will be caught by Express error handler and Sentry middleware
  throw new Error('Test unhandled error from backend');
};

/**
 * Test endpoint to capture a message
 */
const testMessage = async (req, res) => {
  captureMessage('Test message from backend', 'info', {
    extra: {
      testType: 'message',
      endpoint: '/api/sentry/test-message',
      userId: req.user?.id,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Message sent to Sentry',
    sentryEnabled: !!Sentry.getCurrentHub().getClient(),
  });
};

/**
 * Test endpoint to trigger a 500 error
 */
const testServerError = async () => {
  // Simulate a database error
  const error = new Error('Database connection failed');
  error.code = 'ECONNREFUSED';
  error.statusCode = 500;

  throw error;
};

/**
 * Get Sentry status
 */
const getSentryStatus = async (req, res) => {
  const isEnabled = !!Sentry.getCurrentHub().getClient();

  res.status(200).json({
    success: true,
    sentry: {
      enabled: isEnabled,
      dsn: isEnabled ? 'configured' : 'not configured',
      environment: process.env.NODE_ENV || 'development',
    },
  });
};

module.exports = {
  testHandledError,
  testUnhandledError,
  testMessage,
  testServerError,
  getSentryStatus,
};
