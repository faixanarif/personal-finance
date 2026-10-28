import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => api.getToken());
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate user profile on application mount if token is saved
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = api.getToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await api.getMe();
        if (isMounted && response.success && response.user) {
          setUser(response.user);
          setToken(storedToken);
        }
      } catch (err) {
        console.warn('[Auth] Token validation failed:', err.message);
        api.clearToken();
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for unauthorized events from API client interceptor
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  /**
   * Authenticate with email & password
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      if (response.success && response.token) {
        api.setToken(response.token);
        setToken(response.token);
        setUser(response.user);
        return response;
      }
      throw new Error(response.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user account
   */
  const register = useCallback(async (username, email, password) => {
    setIsLoading(true);
    try {
      const response = await api.register(username, email, password);
      if (response.success && response.token) {
        api.setToken(response.token);
        setToken(response.token);
        setUser(response.user);
        return response;
      }
      throw new Error(response.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log out and wipe credentials
   */
  const logout = useCallback(() => {
    api.clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
