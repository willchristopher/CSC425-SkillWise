// Authentication routes implementation
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validation = require('../middleware/validation');

// POST /login route
router.post('/login', validation.loginValidation, authController.login);

// POST /signup route (alias for register to match user stories)
router.post('/signup', validation.registerValidation, authController.register);

// POST /register route
router.post('/register', validation.registerValidation, authController.register);

// POST /logout route
router.post('/logout', authController.logout);

// POST /refresh route
router.post('/refresh', authController.refreshToken);

// Future routes for password reset
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);

module.exports = router;