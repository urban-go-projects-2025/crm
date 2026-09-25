import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe, logoutUser, loginUser as apiLoginUser, switchUserAccount as apiSwitchUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const loadSession = async () => {
    try {
      const res = await fetchMe();
      if (res && res.user) {
        setCurrentUser(res.user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Session load error:', err);
      setCurrentUser(null);
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
      return res.user;
    }
    throw new Error('Login failed');
  };

  const switchUser = async (userId) => {
    const res = await apiSwitchUser(userId);
    if (res && res.user) {
      setCurrentUser(res.user);
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
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthLoading, login, switchUser, logout, refreshSession: loadSession }}>
      {children}
    </AuthContext.Provider>
  );
};
