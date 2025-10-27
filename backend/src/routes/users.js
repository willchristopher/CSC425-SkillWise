// User routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// All user routes require authentication
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/statistics', auth, userController.getStatistics);
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;