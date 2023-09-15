
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const connection = require('../config/database');

// Set up session options
const sessionOptions = {
  secret: 'site-secret-key', // a secure random string - should be replaced
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000, // Check every 15 minutes for expired sessions
    expiration: 86400000, // Session expires after 24 hours (in milliseconds)
    createDatabaseTable: true,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data',
      },
    },
  }),
};

// Middleware for session management
const sessionMiddleware = session(sessionOptions);

module.exports = sessionMiddleware;
