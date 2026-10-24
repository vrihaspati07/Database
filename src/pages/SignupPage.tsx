import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordStrengthIndicator } from '../components/auth/PasswordStrengthIndicator';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { GoogleIcon, GithubIcon } from '../components/Icons';


interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup, oauthLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedTerms) {
      setError('Please agree to the Terms of Service and DPDP Privacy Policy.');
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
        // Store target email for verification page
        sessionStorage.setItem('hind_verification_email', email);
        if (res.data?.debugVerificationToken) {
          sessionStorage.setItem('hind_debug_token', res.data.debugVerificationToken);
        }
        onNavigate('verify-email');
      } else {
        setError(res.message || res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.');
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
      setError(`Failed to sign up with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

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
              placeholder="Create a strong password"
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
              I agree to the <a href="#" className="text-[#1E3A8A] font-semibold hover:underline">Terms of Service</a> and acknowledge the <a href="#" className="text-[#1E3A8A] font-semibold hover:underline">DPDP Act 2026 Privacy Policy</a>.
            </span>
          </label>
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          <span>{loading ? 'Creating account...' : 'Create account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

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
