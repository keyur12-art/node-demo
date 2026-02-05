const express = require('express');
const router = express.Router();

// Auth routes
router.use('/auth', require('./auth'));

// Category routes
router.use('/categories', require('./categories'));

// Video routes
router.use('/', require('./videos'));

// Dashboard routes
router.use('/dashboard', require('../../../routes/dashboard'));

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
