
const connection = require('../config/database');

class OTPverification {
  constructor(data) {
    if (data) {
      this.id = data.id;
      this.user_id = data.user_id;
      this.otp = data.otp;
      this.type = data.type;
      this.expiration_time = data.expiration_time;
    }
  }

  static async create(otpData) {
    const query = 'INSERT INTO otp_verification SET ?';
    return new Promise((resolve, reject) => {
      connection.query(query, otpData, (err, result) => {
        if (err) reject(err);
        else resolve(result.insertId);
      });
    });
  }

  static async getByUserIdAndType(user_id, type) {
    const query = 'SELECT * FROM otp_verification WHERE user_id = ? AND type = ?';
    return new Promise((resolve, reject) => {
      connection.query(query, [user_id, type], (err, rows) => {
        if (err) reject(err);
        else {
          if (rows.length === 0) resolve(null);
          else resolve(new OTPverification(rows[0]));
        }
      });
    });
  }
}

module.exports = OTPverification;
