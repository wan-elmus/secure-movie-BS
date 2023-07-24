
const express = require('express');
const app = express();
const session = require('express-session');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const { csrfProtection } = require('./middleware/authenticationMiddleware'); // Import the CSRF protection middleware
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');
const emailUtils = require('./utils/emailUtils');

 // Configure Express to use EJS as the view engine
app.set('view engine', 'ejs');
 // Set the views directory
app.set('views', path.join(__dirname, 'views'));

// // Example usage of res.render() in a route handler
// app.get('/dashboard', (req, res) => {
//   const user = req.session.user;
//   res.render('index', { user }); // Pass the user data to the 'index.ejs' view for dynamic rendering
// });


// Set up session middleware
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Set secure to true if using HTTPS
  })
);

// Use the session middleware
app.use(sessionMiddleware);

// Use the CSRF protection middleware for all POST requests
app.post('*', csrfProtection);

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

// Send email example route
app.get('/send-email', (req, res) => {
  const emailOptions = {
    from: 'your-email', // Replace with your email address
    to: 'recipient-email', // Replace with the recipient's email address
    subject: 'Email Subject',
    text: 'Email Content',
  };

 

  emailUtils.sendEmail(emailOptions, (error, info) => {
    if (error) {s
      console.log('Error sending email:', error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent:', info.response);
      res.send('Email sent successfully!');
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
