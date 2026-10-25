import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordStrengthIndicator } from '../components/auth/PasswordStrengthIndicator';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigate: (page: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();

  const [token, setToken] = useState<string>(() => {
    return new URLSearchParams(window.location.search).get('token') || '';
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Password reset token is missing. Please use the link provided in your email.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, newPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else {
        setError(res.message || res.error || 'Failed to reset password. The link may have expired.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={success ? 'Password updated!' : 'Set new password'}
      subtitle={
        success
          ? 'Your password has been reset securely. Redirecting to sign in...'
          : 'Create a strong, new password for your Hind DB sovereign account'
      }
      onBackToHome={() => onNavigate('home')}
    >
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="leading-snug">{error}</div>
        </div>
      )}

      {success ? (
        <div className="py-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0F172A]">
              Password Reset Complete!
            </h3>
            <p className="text-sm text-[#475569]">
              All existing sessions have been revoked. You can now sign in with your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('login')}
              className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-950/10"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!token && (
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
                Reset Token (from email)
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                placeholder="Paste token here"
                className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E3A8A] focus:bg-white text-sm text-[#0F172A] outline-none font-mono"
              />
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 pr-12 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E3A8A] focus:bg-white text-sm text-[#0F172A] outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E3A8A] focus:bg-white text-sm text-[#0F172A] outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#1E3A8A] font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
