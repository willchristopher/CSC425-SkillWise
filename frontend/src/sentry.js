// src/sentry.js
import * as Sentry from '@sentry/react';

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN || import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || import.meta.env.MODE,
    tracesSampleRate: 0.1, // Lower for dev, raise for prod
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
  });

  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    Sentry.captureException(event.error || event.reason || event);
  });
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason);
  });
}

export { Sentry };
