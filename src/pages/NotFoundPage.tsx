/**
 * Hind DB - 404 Not Found & Secret Admin Gatekeeper
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, ArrowLeft, Terminal, KeyRound, Sparkles } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
  isSecretRoute?: boolean;
  currentUser?: any;
  onAdminAuthenticated?: (token: string, admin: any) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigate,
  isSecretRoute = false,
  currentUser,
  onAdminAuthenticated,
}) => {
  // If on secret route /control-x7k9, gatekeeper opens directly
  const [showGatekeeper, setShowGatekeeper] = useState(isSecretRoute);
  const [email, setEmail] = useState(() => currentUser?.email || 'vrihaspatichaubey@gmail.com');
  const [password, setPassword] = useState('HindAdmin@2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Keyboard shortcut: Ctrl+Shift+A or Cmd+Shift+A opens secret gatekeeper
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowGatekeeper(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/v1/control-x7k9/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        if (response.status === 404) {
          setError('Access denied: Email is not in the authorized admin whitelist.');
        } else if (response.status === 502 || response.status === 504) {
          setError('Backend server is offline on port 4000. Please ensure "node server/index.js" is running.');
        } else {
          setError(data.message || 'Authentication rejected by security shield.');
          if (data.meta?.remainingAttempts !== undefined) {
            setRemainingAttempts(data.meta.remainingAttempts);
          }
        }
        return;
      }

      // Success: Save token to both sessionStorage and localStorage for persistence
      sessionStorage.setItem('hind_admin_token', data.token);
      sessionStorage.setItem('hind_admin_user', JSON.stringify(data.admin));
      localStorage.setItem('hind_admin_token', data.token);
      localStorage.setItem('hind_admin_user', JSON.stringify(data.admin));

      if (onAdminAuthenticated) {
        onAdminAuthenticated(data.token, data.admin);
      }
    } catch (err: any) {
      setError('Connection to backend failed. Please ensure "node server/index.js" is running on port 4000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#1E3A8A]/30">
      {/* Top Subtle Navbar */}
      <header className="border-b border-[#1E293B]/60 bg-[#0A0F1D]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center space-x-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center shadow-md">
            <span className="font-mono font-black text-white text-sm">H</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Hind<span className="text-[#38BDF8]">DB</span></span>
          <span className="text-[10px] font-mono bg-[#1E293B] text-[#94A3B8] px-2 py-0.5 rounded border border-[#334155]">
            SOVEREIGN
          </span>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1F2937]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </button>
      </header>

      {/* Main 404 Cloaking View */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* Clicking the 404 badge triggers the secret admin gate */}
          <div
            onClick={() => isSecretRoute && setShowGatekeeper(true)}
            onDoubleClick={() => isSecretRoute && setShowGatekeeper(true)}
            title={isSecretRoute ? "Click to open Sovereign Gatekeeper" : ""}
            className="inline-flex items-center justify-center cursor-pointer select-none group"
          >
            <span className="font-mono text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white via-[#94A3B8] to-[#475569] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              404
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="mt-2 text-sm text-[#94A3B8] leading-relaxed">
            The sovereign resource or endpoint you are looking for does not exist, has been revoked, or is shielded.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-all shadow-lg shadow-[#1E3A8A]/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back to Platform
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#111827] hover:bg-[#1F2937] text-[#E2E8F0] border border-[#1E293B] font-medium text-sm transition-all"
            >
              Developer Login
            </button>
          </div>

          {/* Secret Stealth Trigger Beacon (Only active on secret route) */}
          {isSecretRoute && (
            <div className="mt-8 flex flex-col items-center space-y-2">
              <button
                onClick={() => setShowGatekeeper(true)}
                className="inline-flex items-center space-x-2 text-xs font-mono text-[#38BDF8] bg-[#111827] border border-[#1E293B] hover:border-[#38BDF8]/40 px-3.5 py-1.5 rounded-lg transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Unlock Sovereign Admin Gatekeeper</span>
              </button>
              <button
                onClick={() => setShowGatekeeper(true)}
                className="opacity-40 hover:opacity-100 transition-opacity p-1 text-[#64748B] hover:text-[#38BDF8]"
                title="Sovereign Terminal Beacon"
                aria-label="Admin Beacon"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Secret Sovereign Gatekeeper Modal */}
      {showGatekeeper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0A0F1D] border border-[#1E293B] rounded-2xl shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => {
                setShowGatekeeper(false);
                setError(null);
              }}
              className="absolute top-4 right-4 text-[#64748B] hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/30 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Hind DB Gatekeeper</span>
                  <span className="text-[10px] font-mono bg-[#1E293B] text-[#38BDF8] px-2 py-0.5 rounded border border-[#38BDF8]/30">
                    AIR-GAPPED
                  </span>
                </h3>
                <p className="text-xs text-[#94A3B8]">Secret Administrative Access Gateway</p>
              </div>
            </div>

            {error && (
              <div className="mb-5 bg-[#7F1D1D]/30 border border-[#991B1B] text-[#FCA5A5] p-3 rounded-lg text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{error}</p>
                  {remainingAttempts !== null && remainingAttempts > 0 && (
                    <p className="mt-1 text-[#F87171]">
                      Warning: {remainingAttempts} attempts remaining before IP address is quarantined.
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider">
                    Admin Master Email
                  </label>
                  <span className="text-[10px] text-[#38BDF8] font-mono">Whitelisted</span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vrihaspatichaubey@gmail.com"
                  className="w-full bg-[#111827] border border-[#1F2937] focus:border-[#38BDF8] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider">
                    Security Passkey / Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword('HindAdmin@2026!')}
                    className="text-[10px] text-[#38BDF8] hover:underline font-mono flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Fill Default Passkey</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full bg-[#111827] border border-[#1F2937] focus:border-[#38BDF8] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none transition-colors font-mono pr-10"
                  />
                  <KeyRound className="w-4 h-4 absolute right-3 top-3 text-[#64748B]" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#1D4ED8] hover:to-[#3B82F6] text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-[#1E3A8A]/30 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authenticate Sovereign Session</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 text-center">
              <span className="text-[11px] text-[#64748B] font-mono">
                Admin session automatically expires after 30 minutes of idle inactivity.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#1E293B]/40 bg-[#0A0F1D]/60 py-4 px-6 text-center text-xs text-[#64748B]">
        © 2026 Hind DB. A Hind India Private Limited Company. All sovereign rights reserved.
      </footer>
    </div>
  );
};
