
const express = require('express');
const app = express();
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');
const crypto = require('crypto');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const { csrfProtection } = require('./middleware/authMiddleware');
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

// ... Rest of the code remains the same ...

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
  next(err); // Pass the error to the next error handling middleware
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
