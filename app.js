
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const { csrfProtection } = require('./middleware/authenticationMiddleware');
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');
const emailUtils = require('./utils/emailUtils');
const bcrypt = require('bcrypt'); // Import the bcrypt library

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(sessionMiddleware);

app.post('/enable-2fa', csrfProtection);
app.post('/verify-otp-registration', csrfProtection);
app.post('/verify-otp-2fa-enrollment', csrfProtection);
app.post('/create-post', csrfProtection);
app.post('/update-post/:postId', csrfProtection);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

// Hash and salt the user password before storing it in the database
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save the username, email, and hashedPassword in the database
    // ... (Your database interaction code here)

    // Redirect to the login page or homepage after successful registration
    res.redirect('/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Compare the hashed and salted password during login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Retrieve the hashed password from the database based on the provided username
    // ... (Your database interaction code here)

    // Compare the hashed password with the user-provided password
    const passwordMatch = await bcrypt.compare(password, hashedPasswordFromDatabase);

    if (passwordMatch) {
      // Passwords match, user is authenticated
      // Set up the user session and redirect to the dashboard or homepage
      req.session.isAuthenticated = true;
      // ... (Other session data you want to store)
      res.redirect('/dashboard');
    } else {
      // Passwords do not match, login failed
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Rest of the routes and server setup remains the same
// ...

// Error handling middleware for 404 Not Found
app.use((req, res, next) => {
  res.status(404).send('Page not found');
});

// Error handling middleware for 500 Internal Server Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

