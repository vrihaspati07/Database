import React, { useState, useEffect } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordStrengthIndicator } from '../components/auth/PasswordStrengthIndicator';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigate: (page: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();

  const [token, setToken] = useState<string>('demo_token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('hind_reset_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        setError(res.message || 'Failed to reset password. Token may have expired.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={success ? 'Password Reset Successful!' : 'Set new password'}
      subtitle={
        success
          ? 'Your password has been updated. Redirecting to login...'
          : 'Please choose a strong, unique password to secure your Hind DB account.'
      }
      onBackToHome={() => onNavigate('home')}
    >
      {success ? (
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="text-sm text-[#475569]">
            You can now sign in with your updated credentials.
          </p>

          <button
            onClick={() => onNavigate('login')}
            className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Go to Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* New Password Input with Strength Indicator */}
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
                placeholder="Enter new password"
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

            {/* Password Strength Indicator */}
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className={`w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border focus:bg-white text-sm text-[#0F172A] outline-none transition-all placeholder:text-slate-400 ${
                confirmPassword && confirmPassword !== newPassword
                  ? 'border-rose-300 focus:border-rose-500'
                  : 'border-[#CBD5E1] focus:border-[#1E3A8A]'
              }`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Reset Password Button */}
          <button
            type="submit"
            disabled={loading || !newPassword || newPassword !== confirmPassword}
            className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Resetting password...' : 'Reset password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-4 border-t border-[#E2E8F0] text-center">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
