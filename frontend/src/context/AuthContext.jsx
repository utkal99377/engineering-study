import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [entitlement, setEntitlement] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEntitlement = async () => {
    try {
      const ent = await api.getMyEntitlement();
      setEntitlement(ent);
    } catch (e) {
      console.warn('Failed to fetch user entitlement:', e);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('btech_token');
    if (!token) {
      setUser(null);
      setEntitlement(null);
      setLoading(false);
      return;
    }

    try {
      api.setToken(token);
      const profile = await api.getMe();
      setUser(profile);
      await fetchEntitlement();
    } catch (err) {
      console.error('Session validation failed:', err);
      api.setToken(null);
      setUser(null);
      setEntitlement(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password, admin_passcode = null) => {
    const res = await api.login(email, password, admin_passcode);
    api.setToken(res.access_token);
    setUser(res.user);
    await fetchEntitlement();
    return res;
  };

  const adminLogin = async (email, password, admin_passcode) => {
    const res = await api.adminLogin(email, password, admin_passcode);
    api.setToken(res.access_token);
    setUser(res.user);
    await fetchEntitlement();
    return res;
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    api.setToken(res.access_token);
    setUser(res.user);
    await fetchEntitlement();
    return res;
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setEntitlement(null);
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'content_manager');

  return (
    <AuthContext.Provider
      value={{
        user,
        entitlement,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        adminLogin,
        register,
        logout,
        refreshEntitlement: fetchEntitlement,
        refreshUser: checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
