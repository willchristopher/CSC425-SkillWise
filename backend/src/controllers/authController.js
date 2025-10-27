// Authentication controller with login, register, logout, refresh token endpoints
const authService = require('../services/authService');
const { AppError } = require('../middleware/errorHandler');

const authController = {
  // Login endpoint
  login: async (req, res, next) => {
    try {
      const { email, password } = req.validated.body;

      const result = await authService.login(email, password);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        status: 'success',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(new AppError(error.message, 401, 'LOGIN_FAILED'));
    }
  },

  // Register endpoint  
  register: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.validated.body;

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
        status: 'success',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(new AppError(error.message, 400, 'REGISTRATION_FAILED'));
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
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(new AppError(error.message, 500, 'LOGOUT_FAILED'));
    }
  },

  // Refresh token endpoint
  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return next(new AppError('Refresh token not found', 401, 'NO_REFRESH_TOKEN'));
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        status: 'success',
        data: {
          accessToken: result.accessToken,
          user: result.user
        }
      });
    } catch (error) {
      // Clear invalid refresh token
      res.clearCookie('refreshToken');
      next(new AppError(error.message, 401, 'TOKEN_REFRESH_FAILED'));
    }
  }
};

module.exports = authController;