// Sentry configuration for React frontend
import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking
 */
export function initSentry() {
  const dsn = process.env.REACT_APP_SENTRY_DSN;
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

      // Set sample rate for session replay
      replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0, // Always replay on error

      // Integrations
      integrations: [
        // Enable browser tracing
        Sentry.browserTracingIntegration(),

        // Enable session replay
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],

      // Filter out certain errors
      beforeSend(event, hint) {
        const error = hint.originalException;

        // Don't send errors from browser extensions
        if (error && error.message && error.message.includes('Extension')) {
          return null;
        }

        // Don't send errors from network issues (handled by axios interceptors)
        if (error && error.message && error.message.includes('Network Error')) {
          return null;
        }

        return event;
      },

      // Add additional context
      initialScope: {
        tags: {
          service: 'skillwise-frontend',
          version: process.env.REACT_APP_VERSION || '1.0.0',
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
export function captureException(error, context = {}) {
  if (Sentry.getClient()) {
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
export function captureMessage(message, level = 'info', context = {}) {
  if (Sentry.getClient()) {
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
export function setUser(user) {
  if (Sentry.getClient() && user) {
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
export function clearUser() {
  if (Sentry.getClient()) {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 * @param {string} message - Breadcrumb message
 * @param {string} category - Category (navigation, http, etc.)
 * @param {object} data - Additional data
 */
export function addBreadcrumb(message, category = 'default', data = {}) {
  if (Sentry.getClient()) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }
}

export default Sentry;
