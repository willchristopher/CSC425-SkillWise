// Authentication controller with login, register, logout, refresh token endpoints
const authService = require('../services/authService');
const { AppError } = require('../middleware/errorHandler');

const authController = {
  // Login endpoint
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new AppError('Email and password are required', 400, 'MISSING_CREDENTIALS'));
      }

      const result = await authService.login(email, password);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken
        },
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  },

  // Register endpoint  
  register: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return next(new AppError('All fields are required', 400, 'MISSING_FIELDS'));
      }

      // Basic password validation
      if (password.length < 8) {
        return next(new AppError('Password must be at least 8 characters long', 400, 'WEAK_PASSWORD'));
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName
      });

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken
        },
        message: 'Account created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout endpoint
  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Refresh token endpoint
  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return next(new AppError('Refresh token not provided', 401, 'NO_REFRESH_TOKEN'));
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken
        },
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user profile
  getProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const user = await authService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;