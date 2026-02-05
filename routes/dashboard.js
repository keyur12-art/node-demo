const express = require('express');
const { getUserDashboard, getUserProfile, updateUserProfile } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get user dashboard data
router.get('/', authMiddleware, getUserDashboard);

// Get user profile
router.get('/profile', authMiddleware, getUserProfile);

// Update user profile
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;