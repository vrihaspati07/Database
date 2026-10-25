/**
 * Hind DB - Protected Route Wrapper
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onNavigate }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      onNavigate('login');
    }
  }, [user, loading, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
          <p className="text-sm font-medium text-[#475569]">Loading Hind DB Console...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
