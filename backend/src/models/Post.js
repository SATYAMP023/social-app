const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: { type: String, required: true },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: { type: String, required: true },
    text: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    image: {
      type: String, // base64 or URL
      default: '',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likedUsernames: [{ type: String }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Ensure at least text or image is present
postSchema.pre('validate', function (next) {
  if (!this.text && !this.image) {
    this.invalidate('text', 'Post must have either text or an image');
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
