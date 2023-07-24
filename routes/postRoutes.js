
const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');

router.post('/create-post', postController.createPost);
router.get('/edit-post/:postId', postController.editPost);
router.post('/update-post/:postId', postController.updatePost);
router.get('/delete-post/:postId', postController.deletePost);
router.get('/search', postController.searchPosts);

module.exports = router;
