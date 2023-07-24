
const connection = require('../config/database');
const connection = require('..Utils/otpUtils');


// Post Management
exports.createPost = (req, res) => {
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
};

exports.editPost = (req, res) => {
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
};

exports.updatePost = (req, res) => {
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
};

exports.deletePost = (req, res) => {
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
};

exports.searchPosts = (req, res) => {
  const searchTerm = req.query.term;

  connection.query('SELECT * FROM posts WHERE title LIKE ?', `%${searchTerm}%`, (err, rows) => {
    if (err) throw err;
    res.render('search-results', { posts: rows });
  });
};
