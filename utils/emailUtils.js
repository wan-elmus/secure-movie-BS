
const nodemailer = require('nodemailer');

// Utility function to send an email
exports.sendEmail = (emailOptions) => {
  // Create a transporter using nodemailer with your email service provider settings
  const transporter = nodemailer.createTransport({
    service: 'your-email-service-provider', // Replace with your email service provider (e.g., Gmail, Outlook, etc.)
    auth: {
      user: 'your-email', // Replace with your email address
      pass: 'your-email-password', // Replace with your email password or an app-specific password
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
