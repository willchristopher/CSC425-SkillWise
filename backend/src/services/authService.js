// Authentication business logic implementation
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const { query } = require('../database/connection');
const { AppError } = require('../middleware/errorHandler');

const authService = {
  // User login logic
  login: async (email, password) => {
    try {
      // Find user by email
      const userResult = await query(
        'SELECT id, email, password_hash, first_name, last_name, is_active, is_verified FROM users WHERE email = $1',
        [email.toLowerCase()],
      );

      if (userResult.rows.length === 0) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const user = userResult.rows[0];

      // Check if user is active
      if (!user.is_active) {
        throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Update last login
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id],
      );

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      };

      const accessToken = jwt.generateToken(tokenPayload);
      const refreshToken = jwt.generateRefreshToken({ userId: user.id });

      // Store refresh token in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await query(
        'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
        [refreshToken, user.id, expiresAt],
      );

      // Return user data and tokens (excluding password)
      const { password_hash, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500, 'LOGIN_ERROR');
    }
  },

  // User registration
  register: async (userData) => {
    try {
      const { email, password, firstName, lastName } = userData;

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()],
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('User with this email already exists', 409, 'USER_EXISTS');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userResult = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, first_name, last_name, is_active, is_verified, created_at`,
        [email.toLowerCase(), passwordHash, firstName, lastName],
      );

      const newUser = userResult.rows[0];

      // Generate tokens
      const tokenPayload = {
        userId: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
      };

      const accessToken = jwt.generateToken(tokenPayload);
      const refreshToken = jwt.generateRefreshToken({ userId: newUser.id });

      // Store refresh token in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await query(
        'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
        [refreshToken, newUser.id, expiresAt],
      );

      return {
        user: newUser,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new AppError('User with this email already exists', 409, 'USER_EXISTS');
      }
      throw new AppError('Registration failed', 500, 'REGISTRATION_ERROR');
    }
  },

  // Token refresh
  refreshToken: async (refreshToken) => {
    try {
      // Verify refresh token
      const decoded = jwt.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database and is not revoked
      const tokenResult = await query(
        `SELECT rt.id, rt.user_id, rt.expires_at, rt.is_revoked,
                u.email, u.first_name, u.last_name, u.is_active
         FROM refresh_tokens rt
         JOIN users u ON rt.user_id = u.id
         WHERE rt.token = $1 AND rt.is_revoked = false AND rt.expires_at > CURRENT_TIMESTAMP`,
        [refreshToken],
      );

      if (tokenResult.rows.length === 0) {
        throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      const tokenData = tokenResult.rows[0];

      // Check if user is still active
      if (!tokenData.is_active) {
        throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
      }

      // Generate new access token
      const tokenPayload = {
        userId: tokenData.user_id,
        email: tokenData.email,
        firstName: tokenData.first_name,
        lastName: tokenData.last_name,
      };

      const newAccessToken = jwt.generateToken(tokenPayload);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
      }
      throw new AppError('Token refresh failed', 500, 'TOKEN_REFRESH_ERROR');
    }
  },

  // Logout - revoke refresh token
  logout: async (refreshToken) => {
    try {
      if (!refreshToken) {
        return { success: true }; // No token to revoke
      }

      // Revoke refresh token
      await query(
        'UPDATE refresh_tokens SET is_revoked = true, updated_at = CURRENT_TIMESTAMP WHERE token = $1',
        [refreshToken],
      );

      return { success: true };
    } catch (error) {
      throw new AppError('Logout failed', 500, 'LOGOUT_ERROR');
    }
  },

  // Password reset (placeholder for future implementation)
  resetPassword: async (email) => {
    // Implementation needed for future sprint
    throw new AppError('Password reset not implemented yet', 501, 'NOT_IMPLEMENTED');
  },
};

module.exports = authService;
