import React, { useState, useRef } from 'react';
import {
  Card, CardContent, Box, TextField, Button, Avatar,
  Divider, IconButton, Typography, CircularProgress,
  Chip,
} from '@mui/material';
import { PhotoCamera, Send, Close } from '@mui/icons-material';
import { createPost } from '../api';
import { useAuth } from '../context/AuthContext';

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['#1565C0', '#6a1b9a', '#00695c', '#e65100', '#880e4f', '#1b5e20'];
  return colors[Math.abs(hash) % colors.length];
}

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim() && !image) {
      setError('Please write something or add an image');
      return;
    }

    setLoading(true);
    try {
      const { data } = await createPost({ text: text.trim(), image });
      onPostCreated(data.post);
      setText('');
      removeImage();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={1.5}>
          <Avatar
            sx={{
              bgcolor: stringToColor(user.username),
              width: 40,
              height: 40,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>

          <Box flex={1}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={6}
              placeholder={`What's on your mind, ${user.username}?`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'grey.50',
                },
              }}
              inputProps={{ maxLength: 1000 }}
            />

            {image && (
              <Box mt={1.5} position="relative" display="inline-block">
                <img
                  src={image}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 8,
                    objectFit: 'contain',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={removeImage}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            )}

            {error && (
              <Typography variant="caption" color="error" display="block" mt={0.5}>
                {error}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" gap={0.5}>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <IconButton color="primary" onClick={() => fileRef.current?.click()} size="small">
              <PhotoCamera />
            </IconButton>

            {text.length > 0 && (
              <Chip
                label={`${text.length}/1000`}
                size="small"
                color={text.length > 900 ? 'error' : 'default'}
                variant="outlined"
                sx={{ alignSelf: 'center', height: 24 }}
              />
            )}
          </Box>

          <Button
            variant="contained"
            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
            onClick={handleSubmit}
            disabled={loading || (!text.trim() && !image)}
            sx={{ px: 3 }}
          >
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}