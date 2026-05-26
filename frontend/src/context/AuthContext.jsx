/**
 * Authentication Context
 * File: src/context/AuthContext.jsx
 */
import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const initAuth = async () => {
    try {
      const token = authService.getToken();

      if (!token) {
        setUser(null);
        return;
      }

      const data = await authService.getMe();
      setUser(data.user || null);
    } catch (error) {
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

   initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
