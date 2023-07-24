
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/enable-2fa', authController.enable2FA);
router.post('/verify-otp-registration', authController.verifyOTPRegistration);
router.post('/verify-otp-2fa-enrollment', authController.verifyOTP2FAEnrollment);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
