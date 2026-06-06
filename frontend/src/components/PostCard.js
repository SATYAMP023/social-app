import React, { useState } from 'react';
import {
  Card, CardContent, CardActions, Box, Typography, Avatar,
  IconButton, TextField, Button, Collapse, Divider,
  Tooltip, CircularProgress,
} from '@mui/material';
import {
  Favorite, FavoriteBorder, ChatBubbleOutline, Delete,
  Send, AccessTime,
} from '@mui/icons-material';
import { likePost, addComment } from '../api';
import { useAuth } from '../context/AuthContext';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['#1565C0', '#6a1b9a', '#00695c', '#e65100', '#880e4f', '#1b5e20'];
  return colors[Math.abs(hash) % colors.length];
}

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(
    user ? post.likes?.some((id) => id === user._id || id?._id === user._id) : false
  );
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const handleLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    try {
      const { data } = await likePost(post._id);
      setLikes(data.likes);
      setLiked(data.liked);
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    try {
      const { data } = await addComment(post._id, commentText.trim());
      setComments((prev) => [...prev, data.comment]);
      setCommentText('');
      setShowComments(true);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const isAuthor = user && (post.author === user._id || post.author?._id === user._id);

  return (
    <Card sx={{ mb: 2, overflow: 'hidden' }}>
      <CardContent sx={{ pb: 1 }}>
        {/* Author row */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                bgcolor: stringToColor(post.username),
                width: 42,
                height: 42,
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {getInitials(post.username)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                {post.username}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <AccessTime sx={{ fontSize: 11, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled">
                  {timeAgo(post.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {isAuthor && (
              <Tooltip title="Delete post">
                <IconButton
                  size="small"
                  onClick={() => onDelete(post._id)}
                  sx={{ color: 'error.light' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Post text */}
        {post.text && (
          <Typography variant="body1" sx={{ mb: post.image ? 1.5 : 0, lineHeight: 1.6 }}>
            {post.text}
          </Typography>
        )}

        {/* Post image */}
        {post.image && (
          <Box
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              maxHeight: 400,
              display: 'flex',
              justifyContent: 'center',
              bgcolor: 'grey.100',
            }}
          >
            <img
              src={post.image}
              alt="Post"
              style={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'contain',
              }}
            />
          </Box>
        )}
      </CardContent>

      {/* Stats row */}
      <Box px={2} py={0.5} display="flex" gap={1.5}>
        {likes > 0 && (
          <Typography variant="caption" color="text.secondary">
            ❤️ {likes} {likes === 1 ? 'like' : 'likes'}
          </Typography>
        )}
        {comments.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => setShowComments(!showComments)}
          >
            💬 {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Action buttons */}
      <CardActions sx={{ px: 1, py: 0.5, gap: 0 }}>
        <Button
          startIcon={
            likeLoading ? (
              <CircularProgress size={16} />
            ) : liked ? (
              <Favorite fontSize="small" color="error" />
            ) : (
              <FavoriteBorder fontSize="small" />
            )
          }
          onClick={handleLike}
          disabled={!user || likeLoading}
          sx={{
            flex: 1,
            color: liked ? 'error.main' : 'text.secondary',
            fontWeight: liked ? 700 : 400,
          }}
          size="small"
        >
          Like
        </Button>
        <Button
          startIcon={<ChatBubbleOutline fontSize="small" />}
          onClick={() => setShowComments(!showComments)}
          sx={{ flex: 1, color: 'text.secondary' }}
          size="small"
        >
          Comment
        </Button>
      </CardActions>

      {/* Comment section */}
      <Collapse in={showComments}>
        <Box px={2} pb={2}>
          <Divider sx={{ mb: 1.5 }} />

          {/* Existing comments */}
          {comments.map((c, i) => (
            <Box key={c._id || i} display="flex" gap={1} mb={1.5}>
              <Avatar
                sx={{
                  bgcolor: stringToColor(c.username),
                  width: 30,
                  height: 30,
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {getInitials(c.username)}
              </Avatar>
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  flex: 1,
                }}
              >
                <Typography variant="caption" fontWeight={700} display="block">
                  {c.username}
                </Typography>
                <Typography variant="body2">{c.text}</Typography>
              </Box>
            </Box>
          ))}

          {/* Add comment */}
          {user && (
            <Box
              component="form"
              onSubmit={handleComment}
              display="flex"
              gap={1}
              alignItems="center"
              mt={1}
            >
              <Avatar
                sx={{
                  bgcolor: stringToColor(user.username),
                  width: 30,
                  height: 30,
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {getInitials(user.username)}
              </Avatar>
              <TextField
                fullWidth
                size="small"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    bgcolor: 'grey.100',
                  },
                }}
              />
              <IconButton
                type="submit"
                disabled={!commentText.trim() || commentLoading}
                color="primary"
                size="small"
              >
                {commentLoading ? (
                  <CircularProgress size={18} />
                ) : (
                  <Send fontSize="small" />
                )}
              </IconButton>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
}
