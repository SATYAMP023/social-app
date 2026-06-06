const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (paginated, newest first)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text && !image) {
      return res.status(400).json({ message: 'Post must have text or an image' });
    }

    const post = await Post.create({
      author: req.user._id,
      username: req.user.username,
      text: text || '',
      image: image || '',
    });

    res.status(201).json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post (only by author)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Toggle like on a post
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const username = req.user.username;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
      post.likedUsernames = post.likedUsernames.filter((u) => u !== username);
    } else {
      // Like
      post.likes.push(userId);
      post.likedUsernames.push(username);
    }

    await post.save();

    res.json({
      likes: post.likes.length,
      likedUsernames: post.likedUsernames,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Error toggling like' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      user: req.user._id,
      username: req.user.username,
      text: text.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      comment: addedComment,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// @route   GET /api/posts/:id/comments
// @desc    Get all comments for a post
// @access  Public
router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('comments').lean();

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json({ comments: post.comments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

module.exports = router;
