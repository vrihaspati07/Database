import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/dashboardApi';
import { Users, CheckCircle, AlertTriangle, Loader2, ArrowRight, LogIn, LogOut } from 'lucide-react';

interface AcceptInvitePageProps {
  onNavigate: (page: string) => void;
}

export const AcceptInvitePage: React.FC<AcceptInvitePageProps> = ({ onNavigate }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    databaseId: string;
    databaseName: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    // 1. Extract token from URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token') || sessionStorage.getItem('pending_invite_token');

    if (!urlToken) {
      setError('No invitation token found in the URL. Please verify the invitation link sent to your email.');
      setLoading(false);
      return;
    }

    setToken(urlToken);

    // 2. If not authenticated, store token in sessionStorage and prompt login
    if (!isAuthenticated) {
      sessionStorage.setItem('pending_invite_token', urlToken);
      setLoading(false);
      return;
    }

    // 3. User is authenticated, attempt to accept invite
    const processAccept = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await dashboardApi.acceptInvite(urlToken);

        if (res.success) {
          sessionStorage.removeItem('pending_invite_token');
          if (res.databaseId) {
            dashboardApi.setActiveDbId(res.databaseId);
          }
          setSuccessData({
            databaseId: res.databaseId,
            databaseName: res.databaseName || 'Database Cluster',
            role: res.role,
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to accept invitation.');
      } finally {
        setLoading(false);
      }
    };

    processAccept();
  }, [isAuthenticated]);

  const handleGoToLogin = () => {
    if (token) sessionStorage.setItem('pending_invite_token', token);
    onNavigate('login');
  };

  const handleGoToSignup = () => {
    if (token) sessionStorage.setItem('pending_invite_token', token);
    onNavigate('signup');
  };

  const handleOpenConsole = () => {
    onNavigate('console');
  };

  const handleSwitchAccount = async () => {
    if (token) sessionStorage.setItem('pending_invite_token', token);
    await logout();
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-8 text-center space-y-6">
        {/* Brand / Icon */}
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center mx-auto shadow-xs border border-blue-100">
          <Users className="w-7 h-7" />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-3 py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A] mx-auto" />
            <h2 className="text-lg font-bold text-[#0F172A]">Accepting Invitation...</h2>
            <p className="text-xs text-[#64748B]">
              Verifying your secure token and granting cluster role access.
            </p>
          </div>
        )}

        {/* Not Logged In State */}
        {!loading && !isAuthenticated && !error && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Team Invitation</h2>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                You've been invited to collaborate on a sovereign Hind DB database cluster. Please sign in or create an account with the invited email address to accept.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleGoToLogin}
                className="w-full py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-xl text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Accept</span>
              </button>
              <button
                onClick={handleGoToSignup}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#CBD5E1] rounded-xl text-sm font-semibold transition-all"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!loading && successData && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Invitation Accepted!</h2>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                You have successfully joined <strong className="text-[#0F172A]">{successData.databaseName}</strong> as a{' '}
                <strong className="text-[#1E3A8A] capitalize">{successData.role || 'Member'}</strong>.
              </p>
            </div>

            <button
              onClick={handleOpenConsole}
              className="w-full py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-xl text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <span>Open Database Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">Unable to Accept Invite</h2>
              <div className="mt-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-left leading-relaxed">
                {error}
              </div>
            </div>

            <div className="pt-2 space-y-2">
              {isAuthenticated && (
                <button
                  onClick={handleSwitchAccount}
                  className="w-full py-2.5 px-4 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Account / Sign Out ({user?.email})</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('home')}
                className="w-full py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-xl text-xs font-semibold"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

