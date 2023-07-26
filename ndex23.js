
const express = require('express');
const app = express();
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');
const crypto = require('crypto');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const { csrfProtection } = require('./middleware/authenticationMiddleware');
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');
const emailUtils = require('./utils/emailUtils');

app.set('views', path.join(__dirname, 'views'));

// Set up session middleware with secure options
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production when using HTTPS
      sameSite: 'strict',
    },
  })
);

// Use Helmet middleware to set security headers
app.use(helmet());

// Use the session middleware
app.use(sessionMiddleware);

// Use the CSRF protection middleware for all POST requests
app.post('*', csrfProtection);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.post('/register', authController.register);
app.post('/enable-2fa', authController.enable2FA);
app.post('/verify-otp-registration', authController.verifyOTPRegistration);
app.post('/verify-otp-2fa-enrollment', authController.verifyOTP2FAEnrollment);
app.post('/login', authController.login);
app.get('/logout', authController.logout);

// Routes for post management - Protect with authMiddleware
app.post('/create-post', authController.authMiddleware, postController.createPost);
app.get('/edit-post/:postId', authController.authMiddleware, postController.editPost);
app.post('/update-post/:postId', authController.authMiddleware, postController.updatePost);
app.get('/delete-post/:postId', authController.authMiddleware, postController.deletePost);

app.get('/search', postController.searchPosts);

// Send email verification token route
app.get('/send-verification-token', (req, res) => {
  const userEmail = req.session.userEmail; // Get the recipient email from the user's session

  if (!userEmail) {
    return res.status(400).send('Recipient email not found in session. Please sign up first.');
  }

  const { token, expirationTime } = generateVerificationToken(); // Generate the verification token and its expiration time

  // Save the verification token and its expiration time to the user's session
  req.session.verificationToken = token;
  req.session.verificationTokenExpiration = expirationTime;

  const emailOptions = {
    from: 'your-email@example.com', // Replace with your email address
    to: userEmail, // Use the recipient's email from the user's session
    subject: 'Email Verification',
    text: `Your email verification token is: ${token}`, // Include the verification token in the email
  };

  emailUtils.sendEmail(emailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent:', info.response);
      res.send('Email sent successfully!');
    }
  });
});

function generateVerificationToken() {
  const tokenLength = 32; // Set the desired token length (in bytes)
  const token = crypto.randomBytes(tokenLength).toString('hex');

  // Set the expiration time for the token (e.g., 1 hour from now)
  const expirationTime = Date.now() + 3600000; // 1 hour in milliseconds

  // Return the token and expiration time as an object
  return { token, expirationTime };
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

// 404 Not Found middleware
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
