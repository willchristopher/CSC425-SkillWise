# Testing Guide

This document explains how to run all tests for the SkillWise application.

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for integration tests)
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

## Running Tests Locally

### 1. Unit Tests

#### Backend Unit Tests

```bash
cd backend
npm install
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

#### Frontend Unit Tests

```bash
cd frontend
npm install
npm test

# With coverage
npm run test:coverage
```

### 2. Integration Tests

Integration tests require the database to be running:

```bash
# Start services with Docker Compose
docker-compose up -d database redis

# Run backend integration tests
cd backend
npm test

# Stop services
docker-compose down
```

### 3. End-to-End (E2E) Tests with Cypress

E2E tests require both backend and frontend servers to be running:

#### Option 1: Manual Setup

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
cd frontend
PORT=3002 npm start

# Terminal 3: Run Cypress tests
cd frontend
npm run cypress:run

# Or open Cypress UI
npm run cypress:open
```

#### Option 2: Using Docker Compose

```bash
# Start all services
docker-compose up

# In another terminal, run Cypress
cd frontend
npm run cypress:run
```

### 4. Linting

#### Backend Linting

```bash
cd backend
npm run lint

# Auto-fix issues
npm run lint:fix
```

#### Frontend Linting

```bash
cd frontend
npm run lint

# Auto-fix issues
npm run lint:fix
```

## Test Coverage

### Backend Test Coverage

```bash
cd backend
npm run test:coverage
```

Coverage reports will be generated in `backend/coverage/`

### Frontend Test Coverage

```bash
cd frontend
npm run test:coverage
```

Coverage reports will be generated in `frontend/coverage/`

## Continuous Integration (CI)

All tests run automatically on GitHub Actions when:

- A pull request is opened to `main`
- Code is pushed to `main`

The CI pipeline includes:

1. **Linting** - Checks code style for backend and frontend
2. **Unit Tests** - Runs all unit tests with coverage
3. **E2E Tests** - Runs Cypress tests against a test environment

### CI Workflow

See `.github/workflows/ci.yml` for the complete CI configuration.

## Test Structure

```
backend/tests/
├── integration/          # Integration tests (API endpoints)
│   ├── auth.test.js
│   ├── goals.test.js
│   ├── challenges.test.js
│   └── ...
├── unit/                # Unit tests (services, controllers, utils)
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   └── utils/
└── setup.js            # Test configuration

frontend/
├── cypress/
│   ├── e2e/            # End-to-end tests
│   │   ├── complete-workflow.cy.js
│   │   └── challenge-flow.cy.js
│   └── support/        # Cypress support files
│       ├── commands.js
│       └── e2e.js
└── src/
    └── __tests__/      # Frontend unit tests
```

## Writing Tests

### Backend Unit Test Example

```javascript
describe('GoalService', () => {
  it('should create a goal', async () => {
    const goal = await goalService.createGoal({
      title: 'Learn React',
      userId: 1,
    });
    expect(goal.title).toBe('Learn React');
  });
});
```

### Frontend Unit Test Example

```javascript
import { render, screen } from '@testing-library/react';
import GoalCard from './GoalCard';

test('renders goal title', () => {
  render(<GoalCard goal={{ title: 'My Goal' }} />);
  expect(screen.getByText('My Goal')).toBeInTheDocument();
});
```

### Cypress E2E Test Example

```javascript
describe('Goal Creation', () => {
  it('should create a new goal', () => {
    cy.visit('/goals');
    cy.contains('Create New Goal').click();
    cy.get('input[id="title"]').type('Learn TypeScript');
    cy.get('button[type="submit"]').click();
    cy.contains('Learn TypeScript').should('be.visible');
  });
});
```

## Troubleshooting

### Tests Failing Locally

1. **Database connection errors**: Ensure PostgreSQL and Redis are running
2. **Port conflicts**: Check that ports 3000-3002, 5432, and 6379 are available
3. **Environment variables**: Copy `.env.example` to `.env` and fill in values

### Cypress Tests Failing

1. **Backend not running**: Ensure backend is accessible at `http://localhost:3001`
2. **Frontend not running**: Ensure frontend is accessible at `http://localhost:3002`
3. **Stale data**: Clear browser cookies and local storage between test runs
4. **Timing issues**: Increase timeout in `cypress.config.js` if needed

### CI Tests Failing

1. Check GitHub Actions logs for specific errors
2. Ensure all dependencies are listed in `package.json`
3. Verify database migrations run successfully in CI
4. Check for environment-specific issues (different Node versions, etc.)

## Test Environment Variables

### Backend Test Environment

```env
NODE_ENV=test
DATABASE_URL=postgresql://user:password@localhost:5432/skillwise_test
REDIS_URL=redis://localhost:6379
JWT_SECRET=test_secret
JWT_REFRESH_SECRET=test_refresh_secret
```

### Frontend Test Environment

```env
REACT_APP_API_URL=http://localhost:3001/api
CI=true  # Prevents interactive mode in CI
```

## Performance Tips

- Run specific test files: `npm test -- path/to/test.js`
- Skip slow tests during development: Use `.skip()` or `.only()`
- Use watch mode for rapid feedback: `npm run test:watch`
- Parallelize Cypress tests in CI (see Cypress parallelization docs)

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Library](https://testing-library.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
