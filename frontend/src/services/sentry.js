import * as Sentry from '@sentry/react';

// Initialize Sentry for error tracking
export const initSentry = () => {
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: parseFloat(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      // Capture unhandled promise rejections
      captureUnhandledRejections: true,
      // Set user context
      beforeSend(event) {
        // Filter out development errors
        if (process.env.NODE_ENV === 'development') {
          return null;
        }
        return event;
      },
    });

    // Set up performance monitoring
    Sentry.addGlobalEventProcessor((event) => {
      // Add additional context to all events
      event.contexts = {
        ...event.contexts,
        app: {
          name: 'SkillWise Frontend',
          version: process.env.REACT_APP_VERSION || '1.0.0',
        },
      };
      return event;
    });

    console.log('Sentry initialized for error tracking');
  } else {
    console.log('Sentry not initialized - missing DSN or not in production');
  }
};

// Error boundary for React components
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Manual error capture functions
export const captureError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      contexts: { additional: context },
    });
  } else {
    console.error('Error captured:', error, context);
  }
};

export const captureMessage = (message, level = 'info', context = {}) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level, {
      contexts: { additional: context },
    });
  } else {
    console.log(`Message captured (${level}):`, message, context);
  }
};

// Set user context for error tracking
export const setUserContext = (user) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    firstName: user.firstName || user.first_name,
    lastName: user.lastName || user.last_name,
  });
};

// Clear user context on logout
export const clearUserContext = () => {
  Sentry.setUser(null);
};

// Add breadcrumb for tracking user actions
export const addBreadcrumb = (message, category = 'user', level = 'info', data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

// Performance monitoring
export const startTransaction = (name, op = 'navigation') => {
  return Sentry.startTransaction({ name, op });
};

// Test error generation for development
export const generateTestError = () => {
  const error = new Error('Test error from SkillWise frontend');
  error.name = 'TestError';
  captureError(error, { 
    test: true, 
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
  
  // Also test message capture
  captureMessage('Test error message generated', 'warning', {
    test: true,
    feature: 'error-tracking'
  });
  
  console.log('Test error and message sent to Sentry');
  return error;
};

export default Sentry;