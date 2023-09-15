
// authMiddleware.js

const csurf = require('csurf');
const connection = require('../config/database');

const csrfProtection = csurf({ cookie: true });

const requireAuth = (req, res, next) => {
  // Middleware to check if the user is authenticated
  if (!req.session.isAuthenticated) {
    return res.redirect('/login'); // Redirect to login page if not authenticated
  }

  const user = req.session.user;
  if (!user) {
    return res.redirect('/login'); // Redirect to login page if user data is not available in the session
  }

  // Check if 2FA is enabled for the user and handle 2FA verification if required
  if (user.otp_enabled && !user.is2FAVerified) {
    return res.redirect('/verify-2fa'); // Redirect to 2FA verification page if 2FA is enabled but not verified
  }

  next(); // Continue to the next middleware or route handler
};

const verify2FA = (req, res, next) => {
  // Middleware to verify 2FA OTP entered by the user
  const user = req.session.user;
  if (!user) {
    return res.redirect('/login'); // Redirect to login page if user data is not available in the session
  }

  const otp = req.body.otp; // Get the OTP entered by the user

  // Check if the OTP is valid and within the valid time window for 2FA verification
  const currentTime = new Date();
  connection.query(
    'SELECT * FROM otp_verification WHERE user_id = ? AND otp = ? AND type = ? AND expiration_time > ?',
    [user.id, otp, '2fa_enrollment', currentTime],
    (err, rows) => {
      if (err) throw err;

      if (rows.length === 0) {
        return res.render('verify-2fa', { error: 'Invalid OTP or expired. Please try again.' }); // Render 2FA verification page with error message
      }

      // OTP is valid, mark the user as 2FA verified in the session
      req.session.user.is2FAVerified = true;
      next(); 
    }
  );
};

module.exports = {
  csrfProtection,
  requireAuth,
  verify2FA,
};
