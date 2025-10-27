// Authentication business logic
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const db = require('../database/connection');
const { AppError } = require('../middleware/errorHandler');

const authService = {
  // User login logic
  login: async (email, password) => {
    try {
      // Find user by email
      const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
      const result = await db.query(query, [email.toLowerCase()]);
      
      if (result.rows.length === 0) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const user = result.rows[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Update last login
      await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

      // Generate tokens
      const accessToken = jwt.generateToken({ 
        id: user.id, 
        email: user.email,
        role: user.role 
      });
      
      const refreshToken = jwt.generateRefreshToken({ 
        id: user.id, 
        email: user.email 
      });

      // Store refresh token in database
      await db.query(
        'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
        [refreshToken, user.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 days
      );

      // Remove password hash from user object
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
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
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1', 
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('User with this email already exists', 409, 'USER_EXISTS');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const insertQuery = `
        INSERT INTO users (email, password_hash, first_name, last_name) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, email, first_name, last_name, role, created_at
      `;
      
      const result = await db.query(insertQuery, [
        email.toLowerCase(),
        passwordHash,
        firstName,
        lastName
      ]);

      const newUser = result.rows[0];

      // Generate tokens
      const accessToken = jwt.generateToken({ 
        id: newUser.id, 
        email: newUser.email,
        role: newUser.role 
      });
      
      const refreshToken = jwt.generateRefreshToken({ 
        id: newUser.id, 
        email: newUser.email 
      });

      // Store refresh token in database
      await db.query(
        'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
        [refreshToken, newUser.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      );

      return {
        user: newUser,
        accessToken,
        refreshToken
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Registration failed', 500, 'REGISTRATION_ERROR');
    }
  },

  // Token refresh
  refreshToken: async (refreshToken) => {
    try {
      // Verify refresh token
      const decoded = jwt.verifyRefreshToken(refreshToken);

      // Check if refresh token exists and is not revoked
      const tokenQuery = `
        SELECT rt.*, u.email, u.role 
        FROM refresh_tokens rt 
        JOIN users u ON rt.user_id = u.id 
        WHERE rt.token = $1 AND rt.is_revoked = false AND rt.expires_at > NOW()
      `;
      
      const result = await db.query(tokenQuery, [refreshToken]);

      if (result.rows.length === 0) {
        throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      const tokenData = result.rows[0];

      // Generate new access token
      const newAccessToken = jwt.generateToken({
        id: tokenData.user_id,
        email: tokenData.email,
        role: tokenData.role
      });

      return {
        accessToken: newAccessToken
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Token refresh failed', 500, 'TOKEN_REFRESH_ERROR');
    }
  },

  // Logout and revoke refresh token
  logout: async (refreshToken) => {
    try {
      if (refreshToken) {
        await db.query(
          'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
          [refreshToken]
        );
      }
      return { success: true };
    } catch (error) {
      throw new AppError('Logout failed', 500, 'LOGOUT_ERROR');
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const query = 'SELECT id, email, first_name, last_name, role, profile_image, bio, created_at FROM users WHERE id = $1 AND is_active = true';
      const result = await db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user', 500, 'GET_USER_ERROR');
    }
  }
};

module.exports = authService;