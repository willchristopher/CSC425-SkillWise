import React from 'react';
import { Alert, Button, Card } from '../components/ui';
import { generateTestError, captureMessage } from '../services/sentry';

const ErrorTestPage = () => {
  const handleTestError = () => {
    try {
      generateTestError();
      alert('Test error sent to Sentry! Check your Sentry dashboard.');
    } catch (error) {
      console.error('Failed to send test error:', error);
    }
  };

  const handleTestMessage = () => {
    captureMessage('Test message from SkillWise error test page', 'info', {
      feature: 'error-testing',
      timestamp: new Date().toISOString(),
      userAction: 'test-message-button'
    });
    alert('Test message sent to Sentry!');
  };

  const handleThrowError = () => {
    // This will be caught by Sentry's global error handler
    throw new Error('Intentional error for Sentry testing');
  };

  return (
    <div className="page error-test-page">
      <div className="page-header">
        <h1 className="page-title">Sentry Error Testing</h1>
        <p className="page-subtitle">
          Test error tracking and monitoring functionality
        </p>
      </div>

      <Alert variant="warning" className="mb-6">
        <strong>Development Tool:</strong> This page is for testing error tracking functionality. 
        Use these buttons to verify that Sentry is properly capturing errors and messages.
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3>Manual Error Capture</h3>
          </Card.Header>
          <Card.Content>
            <p className="mb-4">
              Send a controlled test error with context to Sentry. This demonstrates 
              manual error reporting with custom metadata.
            </p>
            <Button onClick={handleTestError} variant="outline">
              Send Test Error
            </Button>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3>Message Capture</h3>
          </Card.Header>
          <Card.Content>
            <p className="mb-4">
              Send a test message to Sentry. This is useful for logging important 
              events or user actions.
            </p>
            <Button onClick={handleTestMessage} variant="outline">
              Send Test Message
            </Button>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3>Unhandled Error</h3>
          </Card.Header>
          <Card.Content>
            <p className="mb-4">
              Throw an unhandled error that will be automatically captured by 
              Sentry's global error handler.
            </p>
            <Button onClick={handleThrowError} variant="error">
              Throw Error
            </Button>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3>Error Information</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Sentry DSN:</strong> {process.env.REACT_APP_SENTRY_DSN ? '✓ Configured' : '✗ Not configured'}</p>
              <p><strong>Version:</strong> {process.env.REACT_APP_VERSION || '1.0.0'}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card className="mt-6">
        <Card.Header>
          <h3>Setup Instructions</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Frontend Setup (Complete):</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>✅ @sentry/react dependency added</li>
                <li>✅ Sentry service initialized</li>
                <li>✅ Error boundary integration ready</li>
                <li>✅ Manual error capture functions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Backend Setup (Already Complete):</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>✅ @sentry/node dependency installed</li>
                <li>✅ Sentry initialized in app.js</li>
                <li>✅ Error handler middleware configured</li>
                <li>✅ Performance monitoring enabled</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Environment Variables Needed:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>REACT_APP_SENTRY_DSN (frontend)</li>
                <li>SENTRY_DSN (backend)</li>
                <li>REACT_APP_SENTRY_TRACES_SAMPLE_RATE (optional)</li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ErrorTestPage;