
const nodemailer = require('nodemailer');

// Utility function to send an email
exports.sendEmail = (emailOptions) => {
  // transporter using nodemailer with email service provider settings
  const transporter = nodemailer.createTransport({
    service: 'email-service-provider', // we should use Gmail, Outlook e.t.c
    auth: {
      user: 'site-email', // to be replaced with actual email address
      pass: 'site-email-password', // to be replaced
    },
  });

  // Send the email
  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
