import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Avatar, IconButton,
  Container, Button, Skeleton, Alert, Tooltip, Chip,
  Menu, MenuItem, ListItemIcon, Fab,
} from '@mui/material';
import {
  Logout, Person, KeyboardArrowUp, Refresh,
} from '@mui/icons-material';
import { getPosts, deletePost } from '../api';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['#1565C0', '#6a1b9a', '#00695c', '#e65100', '#880e4f', '#1b5e20'];
  return colors[Math.abs(hash) % colors.length];
}

function PostSkeleton() {
  return (
    <Box mb={2} p={2} bgcolor="white" borderRadius={2}>
      <Box display="flex" gap={1.5} mb={1.5}>
        <Skeleton variant="circular" width={42} height={42} />
        <Box flex={1}>
          <Skeleton width="30%" height={18} />
          <Skeleton width="20%" height={14} />
        </Box>
      </Box>
      <Skeleton height={20} />
      <Skeleton height={20} width="80%" />
      <Skeleton height={150} sx={{ mt: 1, borderRadius: 1 }} />
    </Box>
  );
}

export default function FeedPage() {
  const { user, logoutUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPosts = useCallback(async (pageNum = 1, replace = false) => {
    try {
      const { data } = await getPosts(pageNum, 10);
      setPosts((prev) => (replace ? data.posts : [...prev, ...data.posts]));
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchPosts(page + 1);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchPosts(1, true);
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Nav */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(90deg, #1565C0, #0d47a1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1 }}>
            🌟 SocialHub
          </Typography>

          <Tooltip title="Refresh feed">
            <IconButton color="inherit" onClick={handleRefresh} size="small" sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Chip
            avatar={
              <Avatar sx={{ bgcolor: stringToColor(user?.username || 'U'), fontSize: 12 }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            }
            label={`@${user?.username}`}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              '& .MuiChip-avatar': { color: 'white' },
            }}
          />

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { mt: 1, minWidth: 160, borderRadius: 2 } }}
          >
            <MenuItem disabled>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              <Typography variant="body2">{user?.email}</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                logoutUser();
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Feed filters (decorative, matching TaskPlanet style) */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          overflowX: 'auto',
          px: 2,
          py: 1,
          display: 'flex',
          gap: 1,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {['All Posts', 'For You', 'Most Liked', 'Most Commented'].map((tab, i) => (
          <Button
            key={tab}
            size="small"
            variant={i === 0 ? 'contained' : 'outlined'}
            sx={{
              borderRadius: 20,
              px: 2,
              flexShrink: 0,
              ...(i !== 0 && { color: 'text.secondary', borderColor: 'divider' }),
            }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {/* Main content */}
      <Container maxWidth="sm" sx={{ py: 2 }}>
        <CreatePost onPostCreated={handlePostCreated} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Posts list */}
        {loading ? (
          [1, 2, 3].map((i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography fontSize={48}>📝</Typography>
            <Typography variant="h6" color="text.secondary" mt={1}>
              No posts yet
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Be the first to share something!
            </Typography>
          </Box>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
                onUpdate={(updated) =>
                  setPosts((prev) =>
                    prev.map((p) => (p._id === updated._id ? updated : p))
                  )
                }
              />
            ))}

            {hasMore && (
              <Box textAlign="center" mt={2} mb={3}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  sx={{ borderRadius: 20, px: 4 }}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}

            {!hasMore && posts.length > 0 && (
              <Typography
                textAlign="center"
                variant="body2"
                color="text.disabled"
                py={3}
              >
                You've seen all posts! 🎉
              </Typography>
            )}
          </>
        )}
      </Container>

      {/* Scroll to top */}
      {showScrollTop && (
        <Fab
          size="small"
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
}
