// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('peoplehub_token');
      if (token) {
        try {
          const userData = await apiService.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Invalid token or session expired', err);
          localStorage.removeItem('peoplehub_token');
          localStorage.removeItem('peoplehub_currentUser');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiService.login(email, password);
      if (data.token) {
        localStorage.setItem('peoplehub_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('peoplehub_currentUser', JSON.stringify(data.user));
      }
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const data = await apiService.signup(userData);
      if (data.token) {
        localStorage.setItem('peoplehub_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('peoplehub_currentUser', JSON.stringify(data.user));
      }
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('peoplehub_token');
    localStorage.removeItem('peoplehub_currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
