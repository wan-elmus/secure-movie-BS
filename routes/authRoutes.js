// authRoutes
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Registration route with input validation
router.post(
  '/register',
  [
    body('username').trim().notEmpty().isLength({ min: 3 }),
    body('email').trim().isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  authController.register
);

// 2FA enrollment route with input validation
router.post(
  '/enable-2fa',
  [
    // Add validation - to be modified  
  ],
  authController.enable2FA
);

// OTP verification during registration with input validation
router.post(
  '/verify-otp-registration',
  [
    body('email').trim().isEmail(),
    body('otp').isNumeric().isLength({ min: 6, max: 6 }),
  ],
  authController.verifyOTPRegistration
);

// OTP verification during 2FA enrollment with input validation
router.post(
  '/verify-otp-2fa-enrollment',
  [
    body('otp').isNumeric().isLength({ min: 6, max: 6 }),
  ],
  authController.verifyOTP2FAEnrollment
);

// Login route with input validation
router.post(
  '/login',
  [
    body('username').trim().notEmpty(),
    body('password').notEmpty(),
    
  ],
  authController.login
);

// Logout route
router.get('/logout', authController.logout);

module.exports = router;
