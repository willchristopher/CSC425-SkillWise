import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/animations.css';
import App from './App.jsx';
import { initSentry } from './config/sentry';

// Initialize Sentry error tracking
initSentry();

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
