
const mysql = require('mysql');

// Use environment variables to store sensitive information
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', // Replace with your MySQL username
  // password: process.env.DB_PASS || 'your-mysql-password', // Replace with your MySQL password
  database: process.env.DB_NAME || 'movie_blog', // Replace with your database name
  port: process.env.DB_PORT || 3306, // Replace with the port number for your MySQL server
});

// Establish the connection to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

module.exports = connection;
