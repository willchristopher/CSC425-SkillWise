// User routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// GET /profile route
router.get('/profile', auth, userController.getProfile);

// PUT /profile route
router.put('/profile', auth, userController.updateProfile);

// GET /statistics route
router.get('/statistics', auth, userController.getStatistics);

// DELETE /account route
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;