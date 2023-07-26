
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { generateOTP, sendOTPEmail } = require('../utils/otpUtils');
const { Op } = require('sequelize');


// Sequelize Models for users
const OTPverification = require('../models/OTPverification');
const Users = require('../models/Users');

// User Registration
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Generate and save the OTP for email verification during registration
    const otp = generateOTP(); // Generate a 6-digit OTP
    const expirationTime = new Date(Date.now() + 600000); // OTP valid for 10 minutes

    // Save the OTP information to the 'otp_verification' table using OTPverification model
    const otpData = { user_id: null, otp, type: 'registration', expiration_time: expirationTime };
    const insertedId = await OTPverification.create(otpData);

    // Now, save the user data (including hashed password) to the 'users' table using Users model
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, email, password: hashedPassword, otp_enabled: false };
    const createdUser = await Users.create(user);

    // Send the OTP to the user's email for verification
    sendOTPEmail(email, otp);

    res.render('register', { message: 'Registration successful! Please check your email for the verification OTP.' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Enable 2FA (Email OTP) for a user
exports.enable2FA = async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.send('Please log in first.');
  }

  try {
    // Generate and save the OTP for email verification during 2FA enrollment
    const otp = generateOTP(); // Generate a 6-digit OTP
    const expirationTime = new Date(Date.now() + 600000); // OTP valid for 10 minutes

    // Save the OTP information to the 'otp_verification' table using OTPverification model
    const otpData = { user_id: user.id, otp, type: '2fa_enrollment', expiration_time: expirationTime };
    const insertedId = await OTPverification.create(otpData);

    // Send the OTP to the user's email for 2FA enrollment
    sendOTPEmail(user.email, otp);

    res.render('enable-2fa', { message: 'Two-Factor Authentication (2FA) has been enabled for your account. Please check your email for the OTP.' });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Verify OTP during registration with input validation
exports.verifyOTPRegistration = async (req, res) => {
  const { email, otp } = req.body;

  // Check if the OTP is valid and within the valid time window for registration verification
  const currentTime = new Date();
  try {
    const otpVerification = await OTPverification.findAll({
      where: {
        email,
        otp,
        type: 'registration',
        expiration_time: { [Op.gt]: currentTime },
      },
    });

    if (otpVerification.length === 0) {
      return res.send('Invalid OTP or expired. Please try again.');
    }

    // OTP is valid, mark the user as verified in the 'users' table
    await Users.update({ otp_enabled: true }, { where: { email } });

    // Delete the OTP entry from the 'otp_verification' table
    await OTPverification.destroy({ where: { email, type: 'registration' } });

    res.render('verify-otp-registration', { message: 'Email verification successful! You can now log in with your credentials.' });
  } catch (error) {
    console.error('Error verifying OTP during registration:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Verify OTP during 2FA enrollment with input validation
exports.verifyOTP2FAEnrollment = async (req, res) => {
  const { otp } = req.body;
  const user = req.session.user;
  if (!user) {
    return res.send('Please log in first.');
  }

  // Check if the OTP is valid and within the valid time window for 2FA enrollment verification
  const currentTime = new Date();
  try {
    const otpVerification = await OTPverification.findAll({
      where: {
        user_id: user.id,
        otp,
        type: '2fa_enrollment',
        expiration_time: { [Op.gt]: currentTime },
      },
    });

    if (otpVerification.length === 0) {
      return res.send('Invalid OTP or expired. Please try again.');
    }

    // OTP is valid, mark the user as 2FA-enabled in the 'users' table
    await Users.update({ otp_enabled: true }, { where: { id: user.id } });

    // Delete the OTP entry from the 'otp_verification' table
    await OTPverification.destroy({ where: { user_id: user.id, type: '2fa_enrollment' } });

    res.render('verify-otp-2fa-enrollment', { message: 'Two-Factor Authentication (2FA) has been successfully enabled for your account.' });
  } catch (error) {
    console.error('Error verifying OTP during 2FA enrollment:', error);
    res.status(500).send('Internal Server Error');
  }
};

// User Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Users.findOne({ where: { username } });

    if (!user) {
      return res.render('login', { error: 'User not found. Please register first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Password matches, create a session for the user
      req.session.isAuthenticated = true;
      req.session.user = user;
      return res.redirect('/dashboard'); // Redirect to dashboard page after successful login
    } else {
      return res.render('login', { error: 'Incorrect password.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login'); // Redirect to login page after logout
};
