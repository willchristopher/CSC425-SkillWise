import React from 'react';
import { Sentry } from '../sentry';

export default function SentryTestButton() {
  return (
    <button
      className="btn btn-danger"
      onClick={() => {
        try {
          throw new Error('Sentry FE test error');
        } catch (e) {
          Sentry.captureException(e);
          throw e; // still crash for global handler
        }
      }}
      style={{ margin: '1rem 0' }}
    >
      Trigger Sentry Error
    </button>
  );
}
