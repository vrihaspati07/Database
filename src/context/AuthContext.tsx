/**
 * Hind DB - Global Authentication Context
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, type User } from '../services/api';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, mfaCode?: string) => Promise<any>;
  signup: (name: string, email: string, password: string) => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, newPassword: string) => Promise<any>;
  oauthLogin: (provider: 'google' | 'github') => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check existing stored user session
    const currentUser = authApi.getCurrentUser();
    const token = authApi.getToken();
    if (currentUser && token) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, mfaCode?: string) => {
    const res = await authApi.login(email, password, mfaCode);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const signup = async (name: string, email: string, password: string) => {
    return await authApi.signup(name, email, password);
  };

  const verifyEmail = async (token: string) => {
    const res = await authApi.verifyEmail(token);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const forgotPassword = async (email: string) => {
    return await authApi.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return await authApi.resetPassword(token, newPassword);
  };

  const oauthLogin = async (provider: 'google' | 'github') => {
    const res = await authApi.oauthSignIn(provider);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedFields };
      setUser(newUser);
      localStorage.setItem('hind_db_current_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        verifyEmail,
        forgotPassword,
        resetPassword,
        oauthLogin,
        logout,
        updateUser,
      }}
    >
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
