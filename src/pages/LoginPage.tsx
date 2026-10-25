import React, { useState, useEffect } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleIcon } from '../components/Icons';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect logged-in users away from /login
  useEffect(() => {
    if (isAuthenticated || user) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, user, onNavigate]);

  // Read URL error query params (e.g. from Google OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get('error');
    if (errParam) {
      if (errParam === 'google_auth_failed') {
        setError('Google authentication was cancelled or failed. Please try again.');
      } else if (errParam === 'invalid_oauth_state') {
        setError('Google sign-in state expired. Please try again.');
      } else if (errParam === 'google_email_unverified') {
        setError('Your Google email address is unverified. Please verify your Google account first.');
      } else {
        setError('Failed to authenticate with Google. Please try again or use email.');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);

      if (res.success) {
        onNavigate('dashboard');
      } else {
        const errorMsg = res.message || res.error || 'Invalid email or password.';
        setError(errorMsg);

        // If email not verified, offer direct navigation to verify email
        if (res.error === 'EMAIL_NOT_VERIFIED' || errorMsg.toLowerCase().includes('verify your email')) {
          setTimeout(() => {
            onNavigate('verify-email');
          }, 2000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your sovereign PostgreSQL clusters & databases"
      onBackToHome={() => onNavigate('home')}
    >
      {/* Inline Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="leading-snug">{error}</div>
        </div>
      )}

      {/* Standard Login Form */}
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.in"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E3A8A] focus:bg-white text-sm text-[#0F172A] outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#0F172A] font-sans">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
          </div>

          {/* Sign in Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider: "or" */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-xs text-[#94A3B8] uppercase font-mono font-medium">or</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Continue with Google Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn-outline w-full py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2.5 cursor-pointer hover:bg-[#F8FAFC]"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Link to Signup */}
        <div className="mt-8 text-center text-xs text-[#475569]">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-bold text-[#1E3A8A] hover:underline cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
