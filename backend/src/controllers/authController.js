const authService = require('../services/authService');

const authController = {
  // Login endpoint
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Send access token and user data
      res.status(200).json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  // Register endpoint
  register: async (req, res, next) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      const result = await authService.register({
        firstName,
        lastName,
        email,
        password,
      });

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Send access token and user data
      res.status(201).json({
        message: 'Registration successful',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout endpoint
  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      await authService.logout(refreshToken);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        message: 'Logout successful',
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
        return res.status(401).json({
          message: 'Refresh token not provided',
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        message: 'Token refreshed successfully',
        accessToken: result.accessToken,
      });
    } catch (error) {
      // Clear invalid refresh token
      res.clearCookie('refreshToken');
      next(error);
    }
  },
};

module.exports = authController;