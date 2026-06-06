import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Posts
export const getPosts = (page = 1, limit = 10) =>
  API.get(`/posts?page=${page}&limit=${limit}`);
export const createPost = (data) => API.post('/posts', data);
export const deletePost = (id) => API.delete(`/posts/${id}`);
export const likePost = (id) => API.put(`/posts/${id}/like`);
export const addComment = (id, text) =>
  API.post(`/posts/${id}/comment`, { text });
export const getComments = (id) => API.get(`/posts/${id}/comments`);

export default API;
