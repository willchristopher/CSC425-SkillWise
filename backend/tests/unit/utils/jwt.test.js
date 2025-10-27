// JWT utility unit tests
const jwt = require('../../../src/utils/jwt');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

describe('JWT Utils', () => {
  const testPayload = {
    id: 1,
    email: 'test@example.com',
    role: 'student'
  };

  describe('generateToken', () => {
    test('should generate valid JWT token', () => {
      const token = jwt.generateToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should include correct payload', () => {
      const token = jwt.generateToken(testPayload);
      const decoded = jwt.decodeToken(token);
      
      expect(decoded.id).toBe(testPayload.id);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate valid refresh token', () => {
      const refreshToken = jwt.generateRefreshToken(testPayload);
      
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token', () => {
      const token = jwt.generateToken(testPayload);
      const verified = jwt.verifyToken(token);
      
      expect(verified.id).toBe(testPayload.id);
      expect(verified.email).toBe(testPayload.email);
      expect(verified.role).toBe(testPayload.role);
    });

    test('should reject tampered token', () => {
      const token = jwt.generateToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      
      expect(() => {
        jwt.verifyToken(tamperedToken);
      }).toThrow();
    });

    test('should reject token with wrong secret', () => {
      // Create token with different secret
      const jsonwebtoken = require('jsonwebtoken');
      const invalidToken = jsonwebtoken.sign(testPayload, 'wrong-secret');
      
      expect(() => {
        jwt.verifyToken(invalidToken);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify valid refresh token', () => {
      const refreshToken = jwt.generateRefreshToken(testPayload);
      const verified = jwt.verifyRefreshToken(refreshToken);
      
      expect(verified.id).toBe(testPayload.id);
      expect(verified.email).toBe(testPayload.email);
    });
  });

  describe('decodeToken', () => {
    test('should decode token without verification', () => {
      const token = jwt.generateToken(testPayload);
      const decoded = jwt.decodeToken(token);
      
      expect(decoded.id).toBe(testPayload.id);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    test('should return null for invalid token format', () => {
      const decoded = jwt.decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });
});

module.exports = {};