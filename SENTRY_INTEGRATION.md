# Sentry Error Tracking Integration

This document explains how to use Sentry for error tracking in the SkillWise application.

## Overview

Sentry has been integrated into both frontend and backend to capture and track errors, exceptions, and performance issues.

### Features

- ✅ **Automatic Error Capture**: Unhandled errors are automatically sent to Sentry
- ✅ **Manual Error Reporting**: Use helper functions to capture specific errors
- ✅ **User Context**: Errors are tagged with user information when logged in
- ✅ **Performance Monitoring**: Track API response times and frontend rendering
- ✅ **Breadcrumbs**: See what led up to an error
- ✅ **Environment Filtering**: Separate dev/staging/production errors

## Setup

### 1. Get Sentry DSN

1. Sign up at [sentry.io](https://sentry.io/)
2. Create a new project
3. Copy your DSN URL

### 2. Configure Environment Variables

**Backend (.env)**

```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**Frontend**
Add to `.env` or docker-compose.yml:

```bash
REACT_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
REACT_APP_VERSION=1.0.0
```

### 3. Restart Services

```bash
docker-compose restart backend frontend
```

## Usage

### Backend (Node.js/Express)

#### Automatic Error Capture

Unhandled errors and exceptions are automatically captured:

```javascript
// This error will be automatically sent to Sentry
app.get('/some-route', async (req, res) => {
  throw new Error('Something went wrong!');
});
```

#### Manual Error Capture

```javascript
const { captureException, captureMessage } = require('../config/sentry');

// Capture an exception
try {
  // ... some code
} catch (error) {
  captureException(error, {
    extra: {
      userId: req.user?.id,
      action: 'processing-payment',
    },
  });
}

// Capture a message
captureMessage('User completed onboarding', 'info', {
  extra: {
    userId: req.user?.id,
    duration: 120,
  },
});
```

#### Add User Context

User information is automatically added when they log in via the AuthContext:

```javascript
const { setUser, clearUser } = require('../config/sentry');

// Set user (done automatically in login)
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// Clear user (done automatically in logout)
clearUser();
```

### Frontend (React)

#### Automatic Error Capture

Unhandled errors are automatically captured:

```jsx
// This error will be sent to Sentry
function MyComponent() {
  throw new Error('Component render failed!');
}
```

#### Manual Error Capture

```javascript
import { captureException, captureMessage } from '../config/sentry';

// Capture an exception
try {
  // ... some code
} catch (error) {
  captureException(error, {
    extra: {
      component: 'PaymentForm',
      amount: 99.99,
    },
  });
}

// Capture a message
captureMessage('User viewed pricing page', 'info');
```

#### Add Breadcrumbs

```javascript
import { addBreadcrumb } from '../config/sentry';

// Add a breadcrumb
addBreadcrumb('User clicked submit button', 'ui', {
  formData: { email: 'user@example.com' },
});
```

## Testing

### Backend Testing Endpoints

Test Sentry integration using these endpoints:

```bash
# Check Sentry status
curl http://localhost:3001/api/sentry/status

# Test handled error
curl http://localhost:3001/api/sentry/test-handled-error

# Test unhandled error
curl http://localhost:3001/api/sentry/test-unhandled-error

# Test message capture
curl http://localhost:3001/api/sentry/test-message

# Test server error (500)
curl http://localhost:3001/api/sentry/test-server-error
```

### Frontend Testing Component

Add the `SentryTestComponent` to your app:

```jsx
import SentryTestComponent from './components/SentryTestComponent';

function App() {
  return (
    <div>
      {/* Other components */}
      <SentryTestComponent />
    </div>
  );
}
```

The component provides buttons to test:

- Handled errors
- Unhandled errors
- Message capture
- Render errors

## Best Practices

### 1. Error Context

Always provide context when capturing errors:

```javascript
captureException(error, {
  extra: {
    userId: user?.id,
    action: 'what-user-was-doing',
    data: relevantData,
  },
});
```

### 2. Severity Levels

Use appropriate severity levels for messages:

```javascript
captureMessage('User logged in', 'info');
captureMessage('High memory usage detected', 'warning');
captureMessage('Payment processing failed', 'error');
```

### 3. PII (Personal Identifiable Information)

**⚠️ DO NOT send sensitive data to Sentry:**

```javascript
// ❌ BAD - Contains password
captureException(error, {
  extra: {
    formData: { email, password }, // Never do this!
  },
});

// ✅ GOOD - Sanitized data
captureException(error, {
  extra: {
    email: email,
    hasPassword: !!password,
  },
});
```

### 4. Performance Monitoring

Set appropriate sample rates:

**Production**:

```javascript
tracesSampleRate: 0.1; // 10% of transactions
```

**Development**:

```javascript
tracesSampleRate: 1.0; // 100% of transactions
```

### 5. Filter Noise

Don't send errors that are expected or not actionable:

```javascript
beforeSend(event) {
  // Don't send 404 errors
  if (event.request?.url?.includes('/health')) {
    return null;
  }

  // Don't send network errors (handled separately)
  if (event.exception?.values?.[0]?.value?.includes('Network Error')) {
    return null;
  }

  return event;
}
```

## Monitoring

### Sentry Dashboard

1. Log in to [sentry.io](https://sentry.io/)
2. Select your project
3. View:
   - **Issues**: All captured errors
   - **Performance**: API and page load times
   - **Releases**: Track errors by version
   - **Alerts**: Configure notifications

### Common Views

- **Issues by Count**: Which errors occur most frequently
- **Issues by User**: Which users experience the most errors
- **Performance by Endpoint**: Slowest API endpoints
- **Error Trends**: Are errors increasing or decreasing

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN Configuration**

   ```bash
   # Backend
   docker-compose exec backend node -e "console.log(process.env.SENTRY_DSN)"

   # Frontend
   docker-compose exec frontend node -e "console.log(process.env.REACT_APP_SENTRY_DSN)"
   ```

2. **Check Initialization**

   - Backend logs should show: `✅ Sentry error tracking initialized`
   - Frontend console should show: `✅ Sentry error tracking initialized`

3. **Verify Endpoint**

   ```bash
   curl http://localhost:3001/api/sentry/status
   ```

   Should return `"enabled": true`

4. **Check beforeSend Filter**
   - Make sure your error isn't being filtered out
   - Check the `beforeSend` function in config

### High Error Volume

If you're sending too many errors:

1. **Increase sample rate filtering**:

   ```javascript
   tracesSampleRate: 0.01; // 1% instead of 10%
   ```

2. **Add more filters in beforeSend**
3. **Fix common errors** shown in Sentry dashboard
4. **Use breadcrumbs** instead of messages for tracking

## Development vs Production

### Development

```bash
SENTRY_DSN=your-dev-dsn
NODE_ENV=development
```

- 100% trace sample rate
- Verbose error reporting
- All errors sent to Sentry

### Production

```bash
SENTRY_DSN=your-prod-dsn
NODE_ENV=production
```

- 10% trace sample rate
- Filtered error reporting
- Only actionable errors sent

## Support

For questions about Sentry integration:

1. Check [Sentry Documentation](https://docs.sentry.io/)
2. Review this guide
3. Contact the development team

## Related Files

- **Backend Config**: `backend/src/config/sentry.js`
- **Backend Controller**: `backend/src/controllers/sentryTestController.js`
- **Backend Routes**: `backend/src/routes/sentry.js`
- **Frontend Config**: `frontend/src/config/sentry.js`
- **Frontend Test Component**: `frontend/src/components/SentryTestComponent.jsx`
- **Error Handler**: `backend/src/middleware/errorHandler.js`
- **Auth Context**: `frontend/src/contexts/AuthContext.jsx`
