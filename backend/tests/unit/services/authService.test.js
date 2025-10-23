// Unit tests for authentication service
const authService = require('../../../src/services/authService');
const { query } = require('../../../src/database/connection');
const bcrypt = require('bcryptjs');
const jwt = require('../../../src/utils/jwt');

// Mock dependencies
jest.mock('../../../src/database/connection');
jest.mock('bcryptjs');
jest.mock('../../../src/utils/jwt');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('should authenticate valid user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        is_verified: false
      };

      query.mockResolvedValueOnce({ rows: [mockUser] }); // User lookup
      query.mockResolvedValueOnce({ rows: [] }); // Update last login
      query.mockResolvedValueOnce({ rows: [] }); // Store refresh token
      
      bcrypt.compare.mockResolvedValue(true);
      jwt.generateToken.mockReturnValue('access_token');
      jwt.generateRefreshToken.mockReturnValue('refresh_token');

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toEqual({
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          is_active: true,
          is_verified: false
        },
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      });

      expect(query).toHaveBeenCalledWith(
        'SELECT id, email, password_hash, first_name, last_name, is_active, is_verified FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
    });

    test('should reject invalid password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        is_verified: false
      };

      query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow('Invalid email or password');
    });

    test('should reject non-existent user', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await expect(authService.login('test@example.com', 'password123'))
        .rejects
        .toThrow('Invalid email or password');
    });

    test('should reject inactive user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        is_active: false,
        is_verified: false
      };

      query.mockResolvedValueOnce({ rows: [mockUser] });

      await expect(authService.login('test@example.com', 'password123'))
        .rejects
        .toThrow('Account is deactivated');
    });
  });

  describe('register', () => {
    test('should create new user account', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const mockNewUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        is_verified: false,
        created_at: new Date()
      };

      query.mockResolvedValueOnce({ rows: [] }); // Check existing user
      query.mockResolvedValueOnce({ rows: [mockNewUser] }); // Create user
      query.mockResolvedValueOnce({ rows: [] }); // Store refresh token

      bcrypt.hash.mockResolvedValue('hashedpassword');
      jwt.generateToken.mockReturnValue('access_token');
      jwt.generateRefreshToken.mockReturnValue('refresh_token');

      const result = await authService.register(userData);

      expect(result).toEqual({
        user: mockNewUser,
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    test('should hash password securely', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      query.mockResolvedValueOnce({ rows: [] }); // Check existing user
      query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Create user
      query.mockResolvedValueOnce({ rows: [] }); // Store refresh token

      bcrypt.hash.mockResolvedValue('$2b$12$hashedpassword');
      jwt.generateToken.mockReturnValue('access_token');
      jwt.generateRefreshToken.mockReturnValue('refresh_token');

      await authService.register(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    test('should reject duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // User exists

      await expect(authService.register(userData))
        .rejects
        .toThrow('User with this email already exists');
    });
  });

  describe('refreshToken', () => {
    test('should refresh valid token', async () => {
      const mockTokenData = {
        id: 1,
        user_id: 1,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        is_revoked: false,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true
      };

      jwt.verifyRefreshToken.mockReturnValue({ userId: 1 });
      query.mockResolvedValueOnce({ rows: [mockTokenData] });
      jwt.generateToken.mockReturnValue('new_access_token');

      const result = await authService.refreshToken('valid_refresh_token');

      expect(result).toEqual({
        accessToken: 'new_access_token'
      });

      expect(jwt.verifyRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
    });

    test('should reject invalid refresh token', async () => {
      jwt.verifyRefreshToken.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await expect(authService.refreshToken('invalid_token'))
        .rejects
        .toThrow('Invalid refresh token');
    });

    test('should reject expired refresh token', async () => {
      jwt.verifyRefreshToken.mockReturnValue({ userId: 1 });
      query.mockResolvedValueOnce({ rows: [] }); // No valid token found

      await expect(authService.refreshToken('expired_token'))
        .rejects
        .toThrow('Invalid or expired refresh token');
    });
  });

  describe('logout', () => {
    test('should logout successfully', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const result = await authService.logout('refresh_token');

      expect(result).toEqual({ success: true });
      expect(query).toHaveBeenCalledWith(
        'UPDATE refresh_tokens SET is_revoked = true, updated_at = CURRENT_TIMESTAMP WHERE token = $1',
        ['refresh_token']
      );
    });

    test('should handle logout without refresh token', async () => {
      const result = await authService.logout(null);

      expect(result).toEqual({ success: true });
      expect(query).not.toHaveBeenCalled();
    });
  });
});

module.exports = {};