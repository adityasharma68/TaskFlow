// src/context/AuthContext.jsx
// ============================================================
// AuthContext – Provides auth state (user, token) globally.
// Wraps the entire app so any component can call useAuth().
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as authSvc from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => authSvc.getUser());
  const [token,   setToken]   = useState(() => authSvc.getToken());
  const [loading, setLoading] = useState(false);

  // Validate stored token on mount
  useEffect(() => {
    if (!token) return;
    authSvc.getMeRequest()
      .then((res) => setUser(res.data))
      .catch(() => {
        // Token invalid/expired – clear everything
        authSvc.removeToken();
        authSvc.removeUser();
        setToken(null);
        setUser(null);
      });
  }, []); // run once on mount

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authSvc.loginRequest(email, password);
      authSvc.saveToken(res.data.token);
      authSvc.saveUser(res.data.user);
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Register ──────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authSvc.registerRequest(name, email, password);
      authSvc.saveToken(res.data.token);
      authSvc.saveUser(res.data.user);
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success(`Account created! Welcome, ${res.data.user.name}!`);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    authSvc.removeToken();
    authSvc.removeUser();
    setToken(null);
    setUser(null);
    toast.success('Logged out.');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
