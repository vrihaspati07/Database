import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message || 'Failed to request password reset. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={submitted ? 'Check your email' : 'Forgot your password?'}
      subtitle={
        submitted
          ? `We have sent password reset instructions to ${email}`
          : 'Enter your email address and we will send you a secure link to reset your password.'
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

      {submitted ? (
        <div className="text-center py-2 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#0F172A]">
              Password Reset Link Dispatched
            </p>
            <p className="text-xs text-[#475569] leading-relaxed">
              If an account is associated with <strong className="text-[#0F172A]">{email}</strong>, you will receive an email shortly with instructions to reset your password. The link is valid for 1 hour.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={() => onNavigate('login')}
              className="btn-primary-blue w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-950/10"
            >
              <span>Back to Sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
              Work Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.in"
                className="w-full px-4 py-3 pl-11 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#1E3A8A] focus:bg-white text-sm text-[#0F172A] outline-none transition-all placeholder:text-slate-400"
              />
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending instructions...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
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
              <span>Return to sign in</span>
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
