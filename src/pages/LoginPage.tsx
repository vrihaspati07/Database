import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { GoogleIcon, GithubIcon } from '../components/Icons';


interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, oauthLogin } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-Factor Authentication (MFA) Step
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password, mfaRequired ? mfaCode : undefined);

      if (res.mfaRequired) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      if (res.success) {
        onNavigate('dashboard');
      } else {
        setError(res.message || res.error || 'Failed to sign in. Please check your credentials.');
        if (res.error === 'Email Not Verified') {
          setTimeout(() => {
            onNavigate('verify-email');
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(true);
    try {
      const res = await oauthLogin(provider);
      if (res.success) {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(`Failed to sign in with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={mfaRequired ? 'Two-Factor Authentication' : 'Welcome back'}
      subtitle={
        mfaRequired
          ? 'Enter the 6-digit code from your authenticator app (e.g. Google Authenticator)'
          : 'Sign in to access your sovereign PostgreSQL clusters & databases'
      }
      onBackToHome={() => onNavigate('home')}
    >
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="leading-snug">{error}</div>
        </div>
      )}

      {/* MFA Verification Form */}
      {mfaRequired ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
              6-Digit Authenticator Code
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E3A8A] focus:bg-white text-center text-xl font-mono tracking-widest text-[#0F172A] outline-none transition-all"
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-2 text-[11px] text-[#475569] text-center font-mono">
              💡 Development test code: <strong className="text-[#1E3A8A]">123456</strong>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || mfaCode.length < 6}
            className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setMfaRequired(false)}
            className="w-full text-center text-xs text-[#475569] hover:text-[#0F172A] font-medium py-1 cursor-pointer"
          >
            ← Back to email & password
          </button>
        </form>
      ) : (
        /* Standard Login Form */
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
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Tip */}
          <div className="mt-4 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#475569] flex items-center justify-between">
            <span>Quick Sandbox: <strong className="text-[#0F172A]">developer@hind.io</strong></span>
            <button
              type="button"
              onClick={() => {
                setEmail('developer@hind.io');
                setPassword('HindDB@2026');
              }}
              className="text-[#1E3A8A] font-bold hover:underline cursor-pointer"
            >
              Auto-fill
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8] uppercase font-mono font-medium">Or continue with</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          {/* OAuth Buttons (Google, GitHub) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="btn-outline py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={loading}
              className="btn-outline py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Don't have an account link */}
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
      )}
    </AuthLayout>
  );
};
