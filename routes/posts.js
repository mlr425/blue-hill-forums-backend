const express = require('express')
const auth = require('../middleware/auth.js')
const {getPosts, getPost, createPost, updatePost, deletePost, likePost, commentPost, getPostsFromUserId} = require('../controllers/posts.js')

const router = express.Router();

router.post('/',auth, createPost);
router.get('/', getPosts);
router.get('/profile/:id',getPostsFromUserId)
router.get('/:id', getPost);
router.patch('/:id',auth, updatePost);
router.delete('/:id',auth, deletePost);


router.patch('/:id/likePost',auth ,likePost)
router.post('/:id/commentPost',auth ,commentPost)

module.exports = router;