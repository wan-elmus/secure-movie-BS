
const connection = require('../config/database');

class Post {
  constructor(data) {
    if (data) {
      this.id = data.id;
      this.title = data.title;
      this.content = data.content;
      this.author_id = data.author_id;
      this.created_at = data.created_at;
    }
  }

  static async create(postData) {
    const query = 'INSERT INTO posts SET ?';
    return new Promise((resolve, reject) => {
      connection.query(query, postData, (err, result) => {
        if (err) reject(err);
        else resolve(result.insertId);
      });
    });
  }

  static async getById(id) {
    const query = 'SELECT * FROM posts WHERE id = ?';
    return new Promise((resolve, reject) => {
      connection.query(query, id, (err, rows) => {
        if (err) reject(err);
        else {
          if (rows.length === 0) resolve(null);
          else resolve(new Post(rows[0]));
        }
      });
    });
  }
}

module.exports = Post;
