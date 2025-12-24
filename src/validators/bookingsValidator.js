const { body, validationResult } = require('express-validator');

// Validation rules for booking creation
const createBookingValidation = [
  body('roomNumber')
    .notEmpty()
    .withMessage('Room number is required')
    .isInt({ min: 1 })
    .withMessage('Room number must be a positive integer'),
  
  body('checkin')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Check-in date must be in ISO 8601 format (YYYY-MM-DD)')
    .custom((value) => {
      const checkinDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkinDate < today) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),
  
  body('checkout')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Check-out date must be in ISO 8601 format (YYYY-MM-DD)')
    .custom((value, { req }) => {
      const checkinDate = new Date(req.body.checkin);
      const checkoutDate = new Date(value);
      if (checkoutDate <= checkinDate) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  
  body('guestName')
    .notEmpty()
    .withMessage('Guest name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Guest name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Guest name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('guestEmail')
    .notEmpty()
    .withMessage('Guest email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('guestPhone')
    .notEmpty()
    .withMessage('Guest phone is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED')
];

// Validation rules for booking update
const updateBookingValidation = [
  body('roomNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Room number must be a positive integer'),
  
  body('checkin')
    .optional()
    .isISO8601()
    .withMessage('Check-in date must be in ISO 8601 format (YYYY-MM-DD)'),
  
  body('checkout')
    .optional()
    .isISO8601()
    .withMessage('Check-out date must be in ISO 8601 format (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.body.checkin && value) {
        const checkinDate = new Date(req.body.checkin);
        const checkoutDate = new Date(value);
        if (checkoutDate <= checkinDate) {
          throw new Error('Check-out date must be after check-in date');
        }
      }
      return true;
    }),
  
  body('guestName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Guest name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Guest name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('guestEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('guestPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

module.exports = {
  createBookingValidation,
  updateBookingValidation,
  handleValidationErrors
};