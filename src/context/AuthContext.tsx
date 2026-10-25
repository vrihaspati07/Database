/**
 * Hind DB - Global Authentication Context
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, type User, type AuthResponse } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (name: string, email: string, password: string) => Promise<AuthResponse>;
  verifyEmail: (token: string) => Promise<AuthResponse>;
  resendVerification: (email: string) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (fields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        // Attempt session restore via httpOnly refresh cookie
        const res = await authApi.refresh();
        if (isMounted) {
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const signup = async (name: string, email: string, password: string) => {
    return await authApi.signup(name, email, password);
  };

  const verifyEmail = async (token: string) => {
    return await authApi.verifyEmail(token);
  };

  const resendVerification = async (email: string) => {
    return await authApi.resendVerification(email);
  };

  const forgotPassword = async (email: string) => {
    return await authApi.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return await authApi.resetPassword(token, newPassword);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateUser = (fields: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...fields });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading: isLoading,
        isLoading,
        login,
        signup,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
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
