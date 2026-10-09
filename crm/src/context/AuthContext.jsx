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
        setCurrentUser(res.user);
        localStorage.setItem('omw_user', JSON.stringify(res.user));
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
      setCurrentUser(res.user);
      localStorage.setItem('omw_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error('Login failed');
  };

  const switchUser = async (userId) => {
    const res = await apiSwitchUser(userId);
    if (res && res.user) {
      setCurrentUser(res.user);
      localStorage.setItem('omw_user', JSON.stringify(res.user));
      return res.user;
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
