
// config/otpUtils.js

const nodemailer = require('nodemailer');

// Utility functions for generating and sending OTPs
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
};

exports.sendOTPEmail = (connection, email, otp) => {
  // transporter using nodemailer with email service provider settings
  const transporter = nodemailer.createTransport({
    service: 'site-email-service-provider',
    auth: {
      user: 'site-email',
      pass: 'site-email-password',
    },
  });

  // Email content
  const mailOptions = {
    from: 'site-email',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP for verification is: ${otp}`,
  };

  // Send the email with the OTP
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending OTP:', error);
    } else {
      console.log('OTP sent:', info.response);
    }
  });
};

