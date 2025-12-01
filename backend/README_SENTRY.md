# Sentry Integration & Testing

## Setup

1. Add your Sentry DSN to environment files:
   - **Frontend:**
     - `.env` or `.env.local`:
       ```
       REACT_APP_SENTRY_DSN=your_sentry_dsn_here
       ```
   - **Backend:**
     - `.env`:
       ```
       SENTRY_DSN=your_sentry_dsn_here
       ```

2. Install Sentry SDKs:
   - Frontend: `npm install @sentry/react @sentry/tracing`
   - Backend: `npm install @sentry/node`

## Testing Sentry

### Frontend
- Start the frontend app.
- Click the "Trigger Sentry Error" button (visible on all pages).
- Check your Sentry dashboard for a new error event.

### Backend
- Start the backend server.
- Visit `http://localhost:3001/debug/sentry` in your browser or with curl:
  ```sh
  curl -i http://localhost:3001/debug/sentry
  ```
- You should receive a 500 error, and the error should appear in your Sentry dashboard.

## Notes
- Never commit real DSNs to the repository. Use `.env.example` for placeholders.
- Use different DSNs or environments for staging/production.
- Adjust `tracesSampleRate` for production (lower for cost).
- Sentry captures unhandled exceptions and promise rejections by default.

## Automated Test (Backend)
You can add a test like:
```js
const res = await request(app).get('/debug/sentry');
expect(res.status).toBe(500);
```
(You cannot assert Sentry event arrival in code; check the Sentry UI.)
