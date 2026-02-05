const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('businessName').optional().trim(),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('businessDescription').optional().trim(),
  body('address').optional().trim(),
  body('category').trim().notEmpty().withMessage('Business category is required'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  handleValidationErrors
};
