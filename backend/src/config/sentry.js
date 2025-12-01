// Sentry configuration for error tracking
const Sentry = require('@sentry/node');

/**
 * Initialize Sentry error tracking
 * @param {object} app - Express app instance
 */
function initSentry(app) {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  // Only initialize Sentry if DSN is provided and not the placeholder
  if (!dsn || dsn === 'your-sentry-dsn-url') {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment,

      // Set sample rate for performance monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

      // Integrations
      integrations: [
        // Enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),

        // Enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
      ], // Filter out health check requests
      beforeSend(event) {
        const url = event.request?.url;

        // Don't send errors from health checks
        if (url && url.includes('/healthz')) {
          return null;
        }

        return event;
      }, // Add additional context
      initialScope: {
        tags: {
          service: 'skillwise-backend',
          version: process.env.npm_package_version || '1.0.0',
        },
      },
    });

    console.log('✅ Sentry error tracking initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error.message);
  }
}

/**
 * Capture an exception manually
 * @param {Error} error - Error to capture
 * @param {object} context - Additional context
 */
function captureException(error, context = {}) {
  if (Sentry.getCurrentHub().getClient()) {
    Sentry.captureException(error, {
      contexts: context,
    });
  }
}

/**
 * Capture a message manually
 * @param {string} message - Message to capture
 * @param {string} level - Severity level (info, warning, error)
 * @param {object} context - Additional context
 */
function captureMessage(message, level = 'info', context = {}) {
  if (Sentry.getCurrentHub().getClient()) {
    Sentry.captureMessage(message, {
      level,
      contexts: context,
    });
  }
}

/**
 * Add user context to Sentry events
 * @param {object} user - User object
 */
function setUser(user) {
  if (Sentry.getCurrentHub().getClient() && user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
}

/**
 * Clear user context
 */
function clearUser() {
  if (Sentry.getCurrentHub().getClient()) {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 * @param {string} message - Breadcrumb message
 * @param {string} category - Category (navigation, http, etc.)
 * @param {object} data - Additional data
 */
function addBreadcrumb(message, category = 'default', data = {}) {
  if (Sentry.getCurrentHub().getClient()) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }
}

module.exports = {
  Sentry,
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
};
