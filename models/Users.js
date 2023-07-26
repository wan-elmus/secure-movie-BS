
const connection = require('../config/database');
const bcrypt = require('bcrypt');

class Users {
  constructor(data) {
    if (data) {
      this.id = data.id;
      this.username = data.username;
      this.email = data.email;
      this.password = data.password;
      this.otp_secret = data.otp_secret;
      this.otp_enabled = data.otp_enabled;
    }
  }

  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    const query = 'INSERT INTO users SET ?';
    return new Promise((resolve, reject) => {
      connection.query(query, userData, (err, result) => {
        if (err) reject(err);
        else resolve(result.insertId);
      });
    });
  }

  static async getByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    return new Promise((resolve, reject) => {
      connection.query(query, username, (err, rows) => {
        if (err) reject(err);
        else {
          if (rows.length === 0) resolve(null);
          else resolve(new Users(rows[0]));
        }
      });
    });
  }

  static async getById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    return new Promise((resolve, reject) => {
      connection.query(query, id, (err, rows) => {
        if (err) reject(err);
        else {
          if (rows.length === 0) resolve(null);
          else resolve(new Users(rows[0]));
        }
      });
    });
  }
}

module.exports = Users;
