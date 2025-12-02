const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, userController.getProfile);

// Update user profile
router.put('/profile', auth, userController.updateProfile);

// Get user statistics
router.get('/statistics', auth, userController.getStatistics);

// Get statistics for a specific user
router.get('/statistics/:userId', auth, userController.getStatistics);

// Change password
router.put('/change-password', auth, userController.changePassword);

// Delete user account
router.delete('/profile', auth, userController.deleteAccount);
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;
