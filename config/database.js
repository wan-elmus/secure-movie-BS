
const mysql = require('mysql');


const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', // 
  // password: process.env.DB_PASS || 'input-mysql-password', 
  database: process.env.DB_NAME || 'movie_blog', 
  port: process.env.DB_PORT || 3306, 
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
