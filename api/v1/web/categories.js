const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const requireAdmin = require('../../../middleware/requireAdmin');
const {
  listCategories,
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} = require('../../../controllers/categoryController');

const router = express.Router();

// Public: active categories for dropdowns
router.get('/', listCategories);

// Admin: manage categories
router.get('/admin', authMiddleware, requireAdmin, adminListCategories);
router.post('/admin', authMiddleware, requireAdmin, adminCreateCategory);
router.put('/admin/:id', authMiddleware, requireAdmin, adminUpdateCategory);
router.delete('/admin/:id', authMiddleware, requireAdmin, adminDeleteCategory);

module.exports = router;

