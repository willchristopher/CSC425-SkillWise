// Authentication flow integration tests
const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database/connection');

describe('Authentication Integration', () => {
  // Clean up test data before each test
  beforeEach(async () => {
    // Clean up test users
    await db.query("DELETE FROM users WHERE email LIKE 'test%@example.com'");
  });

  // Close database connection after all tests
  afterAll(async () => {
    await db.closePool();
  });

  describe('POST /api/auth/register', () => {
    test('should register new user successfully', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'Test1234',
        confirmPassword: 'Test1234',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.firstName).toBe(newUser.firstName);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should reject registration with invalid email', async () => {
      const newUser = {
        email: 'invalid-email',
        password: 'Test1234',
        confirmPassword: 'Test1234',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should reject registration with weak password', async () => {
      const newUser = {
        email: 'test2@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should reject duplicate email registration', async () => {
      const newUser = {
        email: 'test3@example.com',
        password: 'Test1234',
        confirmPassword: 'Test1234',
        firstName: 'Test',
        lastName: 'User'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const testUser = {
        email: 'testlogin@example.com',
        password: 'Test1234',
        confirmPassword: 'Test1234',
        firstName: 'Login',
        lastName: 'Test'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    test('should login registered user successfully', async () => {
      const credentials = {
        email: 'testlogin@example.com',
        password: 'Test1234'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(credentials.email);
    });

    test('should reject login with invalid password', async () => {
      const credentials = {
        email: 'testlogin@example.com',
        password: 'WrongPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    test('should reject login with non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'Test1234'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });
});

module.exports = {};