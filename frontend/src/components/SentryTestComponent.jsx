import React, { useState } from 'react';
import { captureException, captureMessage } from '../config/sentry';

/**
 * Component for testing Sentry error tracking
 * This component provides buttons to trigger different types of errors
 */
function SentryTestComponent() {
  const [status, setStatus] = useState(null);

  // Test handled error
  const testHandledError = () => {
    try {
      throw new Error('Test handled error from frontend');
    } catch (error) {
      captureException(error, {
        extra: {
          testType: 'handled-error',
          component: 'SentryTestComponent',
        },
      });
      setStatus('Handled error sent to Sentry');
    }
  };

  // Test unhandled error
  const testUnhandledError = () => {
    // This will be caught by Sentry's error boundary
    throw new Error('Test unhandled error from frontend');
  };

  // Test message
  const testMessage = () => {
    captureMessage('Test message from frontend', 'info', {
      extra: {
        testType: 'message',
        component: 'SentryTestComponent',
      },
    });
    setStatus('Message sent to Sentry');
  };

  // Test render error
  const TestErrorComponent = () => {
    throw new Error('Test render error from frontend');
  };

  const [showErrorComponent, setShowErrorComponent] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Sentry Error Tracking Test</h2>

      <div className="space-y-4">
        {/* Status message */}
        {status && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {status}
          </div>
        )}

        {/* Test buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testHandledError}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Handled Error
          </button>

          <button
            onClick={testUnhandledError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Test Unhandled Error
          </button>

          <button
            onClick={testMessage}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Message
          </button>

          <button
            onClick={() => setShowErrorComponent(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Test Render Error
          </button>
        </div>

        {/* Render error component if toggled */}
        {showErrorComponent && <TestErrorComponent />}

        {/* Info section */}
        <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded">
          <h3 className="font-semibold mb-2">Test Information:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <strong>Handled Error:</strong> Manually captured and sent to
              Sentry
            </li>
            <li>
              <strong>Unhandled Error:</strong> Will be automatically caught by
              Sentry
            </li>
            <li>
              <strong>Message:</strong> Sends an info message to Sentry
            </li>
            <li>
              <strong>Render Error:</strong> Triggers an error during component
              render
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SentryTestComponent;
