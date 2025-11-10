const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const pool = require('../database/connection');
const crypto = require('crypto');

const authService = {
  // User registration
  register: async (userData) => {
    const { firstName, lastName, email, password } = userData;

    // Check if user already exists
    const existingUserResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertResult = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email, role, created_at`,
      [firstName, lastName, email, hashedPassword, 'student']
    );

    const user = insertResult.rows[0];

    // Generate tokens
    const accessToken = jwt.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = jwt.generateRefreshToken({
      id: user.id,
    });

    // Store refresh token in database
    await pool.query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [refreshToken, user.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 days
    );

    return {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  },

  // User login
  login: async (email, password) => {
    // Find user by email
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, password_hash, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = jwt.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = jwt.generateRefreshToken({
      id: user.id,
    });

    // Store refresh token in database
    await pool.query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [refreshToken, user.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    return {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  },

  // Token refresh
  refreshToken: async (refreshToken) => {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    // Verify refresh token
    const payload = jwt.verifyRefreshToken(refreshToken);

    // Check if token exists in database and is not revoked
    const tokenResult = await pool.query(
      'SELECT user_id, is_revoked, expires_at FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid refresh token');
    }

    const tokenData = tokenResult.rows[0];

    if (tokenData.is_revoked) {
      throw new Error('Refresh token has been revoked');
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      throw new Error('Refresh token has expired');
    }

    // Get user data
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [tokenData.user_id]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Generate new access token
    const newAccessToken = jwt.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: newAccessToken,
    };
  },

  // Logout - revoke refresh token
  logout: async (refreshToken) => {
    if (!refreshToken) {
      return; // Nothing to revoke
    }

    // Revoke the refresh token
    await pool.query(
      'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
      [refreshToken]
    );
  },

  // Password reset (placeholder for future implementation)
  resetPassword: async (email) => {
    throw new Error('Password reset not yet implemented');
  },
};

module.exports = authService;