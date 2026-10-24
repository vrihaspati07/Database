import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSubmitted(true);
      if (res.data?.debugResetToken) {
        setResetToken(res.data.debugResetToken);
      }
    } catch (err) {
      setSubmitted(true);
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
          : 'Enter the email address associated with your account and we’ll send you a link to reset your password.'
      }
      onBackToHome={() => onNavigate('home')}
    >
      {submitted ? (
        <div className="text-center py-2 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="text-xs text-[#475569] leading-relaxed">
            Click the link in the email to choose a new password. The link will remain valid for 60 minutes.
          </p>

          {/* Quick Demo Reset Trigger Button */}
          <button
            onClick={() => {
              sessionStorage.setItem('hind_reset_token', resetToken || 'demo_reset_tok');
              onNavigate('reset-password');
            }}
            className="btn-primary-blue w-full py-3.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Click to Open Reset Password Page</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-4 border-t border-[#E2E8F0]">
            <button
              onClick={() => onNavigate('login')}
              className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
              Email Address
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
              <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Sending link...' : 'Send reset link'}</span>
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
