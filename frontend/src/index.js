import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App.jsx';

// Initialize Sentry for frontend error tracking (Story 3.8)
if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
  console.log('Sentry initialized for frontend error tracking');
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
