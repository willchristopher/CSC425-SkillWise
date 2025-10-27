// Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validation = require('../middleware/validation');

// Public authentication routes
router.post('/login', validation.loginValidation, authController.login);
router.post('/register', validation.registerValidation, authController.register);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

module.exports = router;