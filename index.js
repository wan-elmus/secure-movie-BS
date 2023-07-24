
// includes the necessary packages and code for user authentication, password hashing, email OTP generation, and session management

// endpoints for user registration, login, enabling 2FA (email OTP), verifying OTP during login, and logging out. Used bcrypt for password hashing, speakeasy for OTP generation and verification, and nodemailer for sending OTP emails.

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');

const app = express();
const port = 3000; // Change this to your desired port number

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-session-key',
  resave: false,
  saveUninitialized: false
}));

// Database connection
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your-mysql-username',
  password: 'your-mysql-password',
  database: 'movie_blog'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database');
});

// Helper function to send OTP via email
async function sendOTPEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      // Configure your email service provider here (e.g., Gmail)
    });

    const mailOptions = {
      from: 'your-email@example.com',
      to: email,
      subject: 'Movie Blog - One-Time Password (OTP)',
      text: `Your OTP for Movie Blog is: ${otp}`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
}

// User Registration
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // Hash and salt the user's password before storing it in the database
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) throw err;

    // Save the user data (including hashed password) to the 'users' table
    const user = { username, email, password: hashedPassword, otp_enabled: false };
    connection.query('INSERT INTO users SET ?', user, (err, result) => {
      if (err) throw err;
      res.send('Registration successful! Please log in.');
    });
  });
});

// User Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  connection.query('SELECT * FROM users WHERE username = ?', username, (err, rows) => {
    if (err) throw err;
    if (rows.length === 0) {
      return res.send('User not found. Please register first.');
    }

    const user = rows[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        // Password matches, create a session for the user
        req.session.user = user;
        return res.send('Login successful!');
      } else {
        return res.send('Incorrect password.');
      }
    });
  });
});

// Enable 2FA (Email OTP) for a user
app.post('/enable-2fa', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.send('Please log in first.');
  }

  // Generate and save the OTP secret key for the user
  const otpSecret = speakeasy.generateSecret({ length: 16 }).base32;
  connection.query('UPDATE users SET otp_secret = ?, otp_enabled = ? WHERE id = ?', [otpSecret, true, user.id], (err, result) => {
    if (err) throw err;

    // Send the OTP secret key to the user's email
    sendOTPEmail(user.email, otpSecret);

    res.send('Two-Factor Authentication (2FA) has been enabled for your account. Please check your email for the OTP secret key.');
  });
});

// Verify OTP (during login with 2FA)
app.post('/verify-otp', (req, res) => {
  const { otp } = req.body;
  const user = req.session.user;
  if (!user) {
    return res.send('Please log in first.');
  }

  // Fetch the user's OTP secret key from the database
  connection.query('SELECT otp_secret FROM users WHERE id = ?', user.id, (err, rows) => {
    if (err) throw err;
    if (rows.length === 0) {
      return res.send('User not found.');
    }

    const otpSecret = rows[0].otp_secret;
    const verified = speakeasy.totp.verify({ secret: otpSecret, encoding: 'base32', token: otp });

    if (verified) {
      // OTP is valid, log in the user
      req.session.isAuthenticated = true;
      res.send('Two-Factor Authentication (2FA) verification successful. You are now logged in.');
    } else {
      res.send('Invalid OTP. Please try again.');
    }
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('You have been logged out.');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
