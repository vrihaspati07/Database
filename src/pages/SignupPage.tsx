import React, { useState, useEffect } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordStrengthIndicator } from '../components/auth/PasswordStrengthIndicator';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle, Mail, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { GoogleIcon } from '../components/Icons';

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, signup, resendVerification } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state: renders "Check your email" screen
  const [isSuccess, setIsSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Redirect logged-in users away from /signup
  useEffect(() => {
    if (isAuthenticated || user) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, user, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to create your account.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await signup(name, email, password);

      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.message || res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    try {
      await resendVerification(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleGoogleSignUp = () => {
    setError(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    window.location.href = `${backendUrl}/auth/google`;
  };

  // Render "Check your email" screen on success
  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="Verification link has been sent"
        onBackToHome={() => onNavigate('home')}
      >
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center mx-auto shadow-inner">
            <Mail className="w-8 h-8 text-[#1E3A8A]" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-[#475569] leading-relaxed">
              We've sent an account verification email to:
            </p>
            <p className="text-base font-bold text-[#0F172A] font-mono bg-[#F8FAFC] py-2 px-4 rounded-xl border border-[#E2E8F0] inline-block">
              {email}
            </p>
            <p className="text-xs text-[#64748B] pt-2">
              Please click the link inside the email to activate your account and start using your database.
            </p>
          </div>

          {resendSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>A new verification link has been sent!</span>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full btn-outline py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Resending...' : "Didn't receive it? Resend link"}</span>
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="w-full btn-primary-blue py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building with India's sovereign managed database platform"
      onBackToHome={() => onNavigate('home')}
    >
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="leading-snug">{error}</div>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aarav Sharma"
            className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E3A8A] focus:bg-white text-sm text-[#0F172A] outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
            Work Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@company.in"
            className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E3A8A] focus:bg-white text-sm text-[#0F172A] outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Password Input with Strength Indicator */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Real-time Password Strength Indicator */}
          <PasswordStrengthIndicator password={password} />
        </div>

        {/* Terms Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#475569] leading-relaxed">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
            />
            <span>
              I agree to the <a href="#" className="text-[#1E3A8A] font-semibold hover:underline">Terms of Service</a> and acknowledge the <a href="#" className="text-[#1E3A8A] font-semibold hover:underline">Privacy Policy</a>.
            </span>
          </label>
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E2E8F0]" />
        <span className="text-xs text-[#94A3B8] uppercase font-mono font-medium">or</span>
        <div className="flex-1 h-px bg-[#E2E8F0]" />
      </div>

      {/* Google Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="btn-outline w-full py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2.5 cursor-pointer hover:bg-[#F8FAFC]"
        >
          <GoogleIcon className="w-4 h-4" />
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Already have an account link */}
      <div className="mt-8 text-center text-xs text-[#475569]">
        Already have an account?{' '}
        <button
          onClick={() => onNavigate('login')}
          className="font-bold text-[#1E3A8A] hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </AuthLayout>
  );
};
