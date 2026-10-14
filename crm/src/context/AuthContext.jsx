import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe, logoutUser, loginUser as apiLoginUser, switchUserAccount as apiSwitchUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('omw_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const normalizeUser = (user) => {
    if (!user) return null;
    let perms = user.permissions;
    if (typeof perms === 'string') {
      try { perms = JSON.parse(perms); } catch (e) { perms = []; }
    }
    return { ...user, permissions: Array.isArray(perms) ? perms : [] };
  };

  const loadSession = async () => {
    const hasSavedUser = !!localStorage.getItem('omw_user');
    if (!hasSavedUser) {
      setCurrentUser(null);
      setIsAuthLoading(false);
      return;
    }

    try {
      const res = await fetchMe();
      if (res && res.user) {
        const normalized = normalizeUser(res.user);
        setCurrentUser(normalized);
        localStorage.setItem('omw_user', JSON.stringify(normalized));
      } else {
        setCurrentUser(null);
        localStorage.removeItem('omw_user');
      }
    } catch (err) {
      const isUnauthenticated =
        err.status === 401 ||
        (err.message && (
          err.message.includes('401') ||
          err.message.includes('Access token required') ||
          err.message.includes('Not authenticated') ||
          err.message.includes('Invalid or expired token')
        ));

      if (isUnauthenticated) {
        setCurrentUser(null);
        localStorage.removeItem('omw_user');
      } else {
        console.error('Session load error:', err);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const login = async (email, password, type) => {
    const res = await apiLoginUser(email, password, type);
    if (res && res.user) {
      const normalized = normalizeUser(res.user);
      setCurrentUser(normalized);
      localStorage.setItem('omw_user', JSON.stringify(normalized));
      return normalized;
    }
    throw new Error('Login failed');
  };

  const switchUser = async (userId) => {
    const res = await apiSwitchUser(userId);
    if (res && res.user) {
      const normalized = normalizeUser(res.user);
      setCurrentUser(normalized);
      localStorage.setItem('omw_user', JSON.stringify(normalized));
      return normalized;
    }
    throw new Error('Switch user failed');
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
    setCurrentUser(null);
    localStorage.removeItem('omw_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthLoading, login, switchUser, logout, refreshSession: loadSession }}>
      {children}
    </AuthContext.Provider>
  );
};
