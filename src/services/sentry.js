// Basic Sentry initialization for frontend
try {
  const Sentry = require('@sentry/react');
  const { BrowserTracing } = require('@sentry/tracing');

  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: parseFloat(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || '0.05'),
    });

    console.info('Sentry initialized (frontend)');
  }
} catch (err) {
  // If Sentry packages are not installed in this environment, fail silently
  // This keeps dev environment lightweight when Sentry isn't configured
  // eslint-disable-next-line no-console
  console.warn('Sentry init skipped (missing packages or not configured)');
}
