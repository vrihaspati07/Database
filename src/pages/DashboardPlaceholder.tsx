/**
 * Hind DB - Protected Dashboard Welcome Screen
 * Product: Hind DB
 * Theme: Navy blue primary (#1E3A8A), orange accent (#F97316), Inter UI, JetBrains Mono code
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, LogOut, CheckCircle2, User as UserIcon, Shield, ArrowRight } from 'lucide-react';

interface DashboardPlaceholderProps {
  onNavigate: (page: string) => void;
  onOpenFullConsole?: () => void;
}

export const DashboardPlaceholder: React.FC<DashboardPlaceholderProps> = ({ 
  onNavigate,
  onOpenFullConsole
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Developer';

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A] font-sans flex flex-col selection:bg-[#1E3A8A]/15 selection:text-[#1E3A8A]">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full border-b border-[#E2E8F0] bg-[#FFFFFF]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo */}
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1E3A8A] text-white shadow-md shadow-blue-950/10 group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0F172A] font-sans">
              Hind <span className="text-[#1E3A8A]">DB</span>
            </span>
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="w-7 h-7 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-[#0F172A] max-w-[180px] truncate">
                {displayName}
              </span>
            </div>

            <button
              id="dashboard-logout-btn"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FEE2E2] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-900/5">
          
          {/* Greeting Header */}
          <div className="flex items-start justify-between flex-wrap gap-4 pb-6 border-b border-[#E2E8F0]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Session Active & Authenticated</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                Welcome to Hind DB, <span className="text-[#1E3A8A]">{displayName}</span>
              </h1>
              <p className="text-[#475569] text-base mt-2">
                Your sovereign PostgreSQL cluster and developer environment are ready.
              </p>
            </div>

            {user?.avatar_url && (
              <img 
                src={user.avatar_url} 
                alt={displayName} 
                className="w-16 h-16 rounded-2xl border-2 border-[#1E3A8A]/20 shadow-md object-cover" 
              />
            )}
          </div>

          {/* User Account Details Card */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-mono">
              Account Credentials & Security
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-1">
                  <UserIcon className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Full Name</span>
                </div>
                <p className="text-base font-semibold text-[#0F172A]">
                  {user?.full_name || user?.name || '—'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-1">
                  <Shield className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Email Address</span>
                </div>
                <p className="text-base font-semibold text-[#0F172A] truncate">
                  {user?.email || '—'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#64748B] block mb-1">User Identifier</span>
                    <span className="font-mono text-xs text-[#0F172A] select-all bg-[#FFFFFF] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                      {user?.id || '—'}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Email Verified</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="text-sm font-semibold text-[#475569] hover:text-[#1E3A8A] transition-colors cursor-pointer"
            >
              ← Back to Landing Page
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {onOpenFullConsole && (
                <button
                  onClick={onOpenFullConsole}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white font-semibold text-sm hover:bg-[#1E3A8A]/90 transition-all shadow-md shadow-blue-950/10 cursor-pointer"
                >
                  <span>Open Database Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-sm transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[#64748B]" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-[#94A3B8] border-t border-[#F1F5F9]">
        © 2026 Hind. A Hind India Private Limited Company. All data stored securely.
      </footer>
    </div>
  );
};
