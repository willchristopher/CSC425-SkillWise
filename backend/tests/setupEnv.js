// Jest setup file - runs before any test modules are loaded
// This ensures environment variables are set before the app or database connection is imported

process.env.NODE_ENV = 'test';

// Use TEST_DATABASE_URL if provided, otherwise default to test database
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://skillwise_user:skillwise_pass@localhost:5432/skillwise_db';

// JWT secrets for testing
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
