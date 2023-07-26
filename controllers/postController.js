const { Op } = require('sequelize');
const connection = require('../config/database');
const { validationResult } = require('express-validator');

// Sequelize Models for users and posts
// const { User, Post } = require('../models');

const OTPverification = require('../models/OTPverification');
const Users = require('../models/Users');
const Post = require('../models/post');


// Post Management - Create a Post
exports.createPost = async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.send('Please log in first.');
  }

  const { title, content } = req.body;
  const post = { title, content, authorId: user.id };

  try {
    const createdPost = await Post.create(post);
    res.render('create-post', { message: 'Post created successfully!' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Post Management - Edit a Post
exports.editPost = async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.send('Please log in first.');
  }

  const postId = req.params.postId;
  try {
    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      return res.send('Post not found.');
    }

    if (post.authorId !== user.id) {
      return res.send('You are not authorized to edit this post.');
    }

    res.render('edit-post', { post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Post Management - Update a Post
exports.updatePost = async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.send('Please log in first.');
  }

  const postId = req.params.postId;
  const { title, content } = req.body;

  try {
    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      return res.send('Post not found.');
    }

    if (post.authorId !== user.id) {
      return res.send('You are not authorized to edit this post.');
    }

    post.title = title;
    post.content = content;
    await post.save();

    res.render('edit-post', { post, message: 'Post updated successfully!' });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Post Management - Delete a Post
exports.deletePost = async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.send('Please log in first.');
  }

  const postId = req.params.postId;
  try {
    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      return res.send('Post not found.');
    }

    if (post.authorId !== user.id) {
      return res.send('You are not authorized to delete this post.');
    }

    await post.destroy();

    res.render('index', { message: 'Post deleted successfully!' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Search Posts
exports.searchPosts = async (req, res) => {
  const searchTerm = req.query.term;

  try {
    const posts = await Post.findAll({
      where: {
        title: {
          [Op.like]: `%${searchTerm}%`,
        },
      },
    });

    res.render('search-results', { posts });
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).send('Internal Server Error');
  }
};
