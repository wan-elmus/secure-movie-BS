


// User Registration with OTP Verification:

// When a user registers on the website, generate an OTP and store it in the otp_verification table along with the user's ID and the verification type (registration). Send the OTP to the user's email for verification.

// User Registration
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
  
    // Generate and save the OTP for email verification during registration
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const expirationTime = new Date(Date.now() + 600000); // OTP valid for 10 minutes
  
    // Save the OTP information to the 'otp_verification' table
    const otpData = { user_id: null, otp, type: 'registration', expiration_time: expirationTime };
    connection.query('INSERT INTO otp_verification SET ?', otpData, (err, result) => {
      if (err) throw err;
  
      // Now, save the user data (including hashed password) to the 'users' table
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;
  
        // Save the user data (including hashed password) to the 'users' table
        const user = { username, email, password: hashedPassword, otp_enabled: false };
        connection.query('INSERT INTO users SET ?', user, (err, result) => {
          if (err) throw err;
          // Send the OTP to the user's email for verification
          sendOTPEmail(email, otp);
  
          res.send('Registration successful! Please check your email for the verification OTP.');
        });
      });
    });
  });

//  Enable 2FA with OTP Enrollment:

//   When a user chooses to enable 2FA, generate an OTP and store it in the otp_verification table along with the user's ID and the verification type (2fa_enrollment). Send the OTP to the user's email for 2FA enrollment.

  // Enable 2FA (Email OTP) for a user
app.post('/enable-2fa', (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.send('Please log in first.');
    }
  
    // Generate and save the OTP for email verification during 2FA enrollment
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const expirationTime = new Date(Date.now() + 600000); // OTP valid for 10 minutes
  
    // Save the OTP information to the 'otp_verification' table
    const otpData = { user_id: user.id, otp, type: '2fa_enrollment', expiration_time: expirationTime };
    connection.query('INSERT INTO otp_verification SET ?', otpData, (err, result) => {
      if (err) throw err;
  
      // Send the OTP to the user's email for 2FA enrollment
      sendOTPEmail(user.email, otp);
  
      res.send('Two-Factor Authentication (2FA) has been enabled for your account. Please check your email for the OTP.');
    });
  });

//     Verify OTP during Registration:

// Create an endpoint to handle OTP verification during the user registration process.

 // Verify OTP during registration
app.post('/verify-otp-registration', (req, res) => {
    const { email, otp } = req.body;
  
    // Check if the OTP is valid and within the valid time window for registration verification
    const currentTime = new Date();
    connection.query('SELECT * FROM otp_verification WHERE email = ? AND otp = ? AND type = ? AND expiration_time > ?', [email, otp, 'registration', currentTime], (err, rows) => {
      if (err) throw err;
  
      if (rows.length === 0) {
        return res.send('Invalid OTP or expired. Please try again.');
      }
  
      // OTP is valid, mark the user as verified in the 'users' table
      connection.query('UPDATE users SET otp_enabled = ? WHERE email = ?', [true, email], (err, result) => {
        if (err) throw err;
  
        // Delete the OTP entry from the 'otp_verification' table
        connection.query('DELETE FROM otp_verification WHERE email = ? AND type = ?', [email, 'registration'], (err, result) => {
          if (err) throw err;
          res.send('Email verification successful! You can now log in with your credentials.');
        });
      });
    });
  });

//     Verify OTP during 2FA Enrollment:

// Create an endpoint to handle OTP verification during the 2FA enrollment process.

  // Verify OTP during 2FA enrollment
app.post('/verify-otp-2fa-enrollment', (req, res) => {
    const { otp } = req.body;
    const user = req.session.user;
    if (!user) {
      return res.send('Please log in first.');
    }
  
    // Check if the OTP is valid and within the valid time window for 2FA enrollment verification
    const currentTime = new Date();
    connection.query('SELECT * FROM otp_verification WHERE user_id = ? AND otp = ? AND type = ? AND expiration_time > ?', [user.id, otp, '2fa_enrollment', currentTime], (err, rows) => {
      if (err) throw err;
  
      if (rows.length === 0) {
        return res.send('Invalid OTP or expired. Please try again.');
      }
  
      // OTP is valid, mark the user as 2FA-enabled in the 'users' table
      connection.query('UPDATE users SET otp_enabled = ? WHERE id = ?', [true, user.id], (err, result) => {
        if (err) throw err;
  
        // Delete the OTP entry from the 'otp_verification' table
        connection.query('DELETE FROM otp_verification WHERE user_id = ? AND type = ?', [user.id, '2fa_enrollment'], (err, result) => {
          if (err) throw err;
          res.send('Two-Factor Authentication (2FA) has been successfully enabled for your account.');
        });
      });
    });
  });


//     Session Management:

// Implement session management using the express-session middleware. Sessions will help keep track of user authentication status and enable users to stay logged in between page visits.

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
          req.session.isAuthenticated = true;
          req.session.user = user;
          return res.redirect('/dashboard'); // Redirect to dashboard page after successful login
      } else {
          return res.render('login', { error:       'Incorrect password.' }); // Render login page with error message
      }
      });
    });
  });
  
  // Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login'); // Redirect to login page after logout
});

  // Search for posts
app.get('/search', (req, res) => {
  const searchTerm = req.query.term;

  connection.query('SELECT * FROM posts WHERE title LIKE ?', `%${searchTerm}%`, (err, rows) => {
    if (err) throw err;
    res.render('search-results', { posts: rows });
  });
});


//     Authorization and Access Control:

// To ensure users can only modify their own posts, add authorization checks when handling post management.

  // Post Management
app.post('/create-post', (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.send('Please log in first.');
    }
  
    const { title, content } = req.body;
    const post = { title, content, author_id: user.id };
  
    connection.query('INSERT INTO posts SET ?', post, (err, result) => {
      if (err) throw err;
      res.send('Post created successfully!');
    });
  });
  
  app.get('/edit-post/:postId', (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.send('Please log in first.');
    }
  
    const postId = req.params.postId;
    connection.query('SELECT * FROM posts WHERE id = ?', postId, (err, rows) => {
      if (err) throw err;
      if (rows.length === 0) {
        return res.send('Post not found.');
      }
  
      const post = rows[0];
  
      if (post.author_id !== user.id) {
        return res.send('You are not authorized to edit this post.');
      }
  
      res.render('edit-post', { post });
    });
  });
  
  app.post('/update-post/:postId', (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.send('Please log in first.');
    }
  
    const postId = req.params.postId;
    const { title, content } = req.body;
  
    connection.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, postId], (err, result) => {
      if (err) throw err;
      res.send('Post updated successfully!');
    });
  });
  
  app.get('/delete-post/:postId', (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.send('Please log in first.');
    }
  
    const postId = req.params.postId;
    connection.query('SELECT * FROM posts WHERE id = ?', postId, (err, rows) => {
      if (err) throw err;
      if (rows.length === 0) {
        return res.send('Post not found.');
      }
  
      const post = rows[0];
  
      if (post.author_id !== user.id) {
        return res.send('You are not authorized to delete this post.');
      }
  
      connection.query('DELETE FROM posts WHERE id = ?', postId, (err, result) => {
        if (err) throw err;
        res.send('Post deleted successfully!');
      });
    });
  });
  
  