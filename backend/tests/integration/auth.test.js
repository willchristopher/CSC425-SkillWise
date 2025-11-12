// Authentication flow integration tests
const request = require('supertest');
const app = require('../../src/app');
const { query } = require('../../src/database/connection');

describe('Authentication Integration', () => {
  let testUser;
  let authToken;
  let refreshToken;

  beforeAll(async () => {
    // Clean up any existing test data
    await query('DELETE FROM users WHERE email = $1', ['test@example.com']);
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await query('DELETE FROM users WHERE id = $1', [testUser.id]);
    }
  });

  describe('POST /api/auth/register', () => {
    test('should register new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.first_name).toBe(userData.firstName);
      expect(response.body.data.accessToken).toBeDefined();

      // Store for cleanup
      testUser = response.body.data.user;
      authToken = response.body.data.accessToken;

      // Check that refresh token is set as cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const refreshCookie = response.headers['set-cookie'].find(cookie =>
        cookie.startsWith('refreshToken='),
      );
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
    });

    test('should fail registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBeUndefined();
      expect(response.body.message).toContain('Invalid email format');
    });

    test('should fail registration with weak password', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('Password must be at least 8 characters');
    });

    test('should fail registration with mismatched passwords', async () => {
      const userData = {
        email: 'test3@example.com',
        password: 'TestPassword123',
        confirmPassword: 'DifferentPassword123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('Passwords don\'t match');
    });

    test('should fail registration with duplicate email', async () => {
      const userData = {
        email: 'test@example.com', // Same as first test
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login registered user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.accessToken).toBeDefined();

      // Store for refresh test
      authToken = response.body.data.accessToken;

      // Check that refresh token is set as cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const refreshCookie = response.headers['set-cookie'].find(cookie =>
        cookie.startsWith('refreshToken='),
      );
      expect(refreshCookie).toBeDefined();

      // Extract refresh token for testing
      refreshToken = refreshCookie.split('refreshToken=')[1].split(';')[0];
    });

    test('should fail login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should fail login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should fail login with missing fields', async () => {
      const loginData = {
        email: 'test@example.com',
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toContain('Password is required');
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('should refresh valid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.accessToken).not.toBe(authToken); // Should be different token
    });

    test('should fail refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body.message).toBe('Refresh token not provided');
    });

    test('should fail refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid_token'])
        .expect(401);

      expect(response.body.message).toBe('Invalid refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');

      // Check that refresh token cookie is cleared
      expect(response.headers['set-cookie']).toBeDefined();
      const clearCookie = response.headers['set-cookie'].find(cookie =>
        cookie.startsWith('refreshToken=;'),
      );
      expect(clearCookie).toBeDefined();
    });

    test('should logout even without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('JWT Session Handling', () => {
    test('should persist session on token refresh', async () => {
      // First login to get fresh tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123',
        })
        .expect(200);

      const newRefreshToken = loginResponse.headers['set-cookie']
        .find(cookie => cookie.startsWith('refreshToken='))
        .split('refreshToken=')[1].split(';')[0];

      // Refresh the token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${newRefreshToken}`])
        .expect(200);

      expect(refreshResponse.body.data.accessToken).toBeDefined();

      // Verify the new token works (this would require a protected route)
      // For now, just verify the token format
      expect(refreshResponse.body.data.accessToken.split('.').length).toBe(3); // JWT format
    });
  });
});

module.exports = {};
