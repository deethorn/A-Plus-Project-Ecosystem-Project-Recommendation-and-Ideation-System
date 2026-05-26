/**
 * Authentication Service
 * File: src/services/authService.js
 */
import api from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Validate current session with backend
  getMe: async () => {
    const response = await api.get('/auth/me');
    if (response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }
};

export default authService;
