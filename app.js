
const express = require('express');
const app = express();
const session = require('express-session');
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');

// Set up session middleware
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true if using HTTPS
  })
);

// Set up body-parser middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes for user authentication and 2FA
app.post('/register', authController.register);
app.post('/enable-2fa', authController.enable2FA);
app.post('/verify-otp-registration', authController.verifyOTPRegistration);
app.post('/verify-otp-2fa-enrollment', authController.verifyOTP2FAEnrollment);
app.post('/login', authController.login);
app.get('/logout', authController.logout);

// Routes for post management
app.post('/create-post', postController.createPost);
app.get('/edit-post/:postId', postController.editPost);
app.post('/update-post/:postId', postController.updatePost);
app.get('/delete-post/:postId', postController.deletePost);

// Route for searching posts
app.get('/search', postController.searchPosts);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
