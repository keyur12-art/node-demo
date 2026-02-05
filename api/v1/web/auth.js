const express = require('express');
const { register, login, createAdmin, getAllUsers, getUserStats, deleteUser } = require('../../../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/authMiddleware');
const requireAdmin = require('../../../middleware/requireAdmin');
const { logoUpload } = require('../../../middleware/upload');
const router = express.Router();

// User routes
router.post('/register', logoUpload.single('logo'), validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Admin routes
router.get('/create-admin', createAdmin);
router.get('/users', authMiddleware, requireAdmin, getAllUsers);
router.delete('/users/:id', authMiddleware, requireAdmin, deleteUser);
router.get('/user-stats', authMiddleware, requireAdmin, getUserStats);

module.exports = router;
