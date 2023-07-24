
exports.requireAuth = (req, res, next) => {
    // Middleware to check if the user is authenticated
    if (!req.session.isAuthenticated) {
      return res.redirect('/login'); // Redirect to login page if not authenticated
    }
    next(); // Continue to the next middleware or route handler
  };
  