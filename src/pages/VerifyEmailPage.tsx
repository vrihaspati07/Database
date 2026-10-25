import React, { useState, useEffect } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

interface VerifyEmailPageProps {
  onNavigate: (page: string) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onNavigate }) => {
  const { verifyEmail, resendVerification } = useAuth();

  const [token] = useState<string | null>(() => {
    return new URLSearchParams(window.location.search).get('token');
  });
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend form state
  const [emailToResend, setEmailToResend] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleVerify = async (tokenToVerify: string) => {
    setVerifying(true);
    setError(null);

    try {
      const res = await verifyEmail(tokenToVerify);
      if (res.success) {
        setVerified(true);
      } else {
        setError(res.message || res.error || 'Verification token is invalid or has expired.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while verifying your email.');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, []);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToResend) return;

    setResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      const res = await resendVerification(emailToResend);
      if (res.success) {
        setResendSuccess(true);
      } else {
        setError(res.message || 'Failed to resend verification link.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title={verified ? 'Email verified!' : 'Verify your email'}
      subtitle={
        verified
          ? 'Your account has been activated. You can now access your database clusters.'
          : 'Confirming your Hind DB sovereign credentials'
      }
      onBackToHome={() => onNavigate('home')}
    >
      {/* 1. Verifying State */}
      {verifying && (
        <div className="py-12 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#1E3A8A] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#0F172A]">
            Validating your verification token...
          </p>
          <p className="text-xs text-[#64748B]">
            Securing cryptographic records on sovereign cluster
          </p>
        </div>
      )}

      {/* 2. Success State */}
      {verified && (
        <div className="py-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0F172A]">
              Account Successfully Verified!
            </h3>
            <p className="text-sm text-[#475569]">
              Thank you for verifying your email address. You now have full access to create PostgreSQL databases and edge functions.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('login')}
              className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-950/10"
            >
              <span>Continue to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Error / Manual Input State */}
      {!verifying && !verified && (
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {token && (
            <button
              onClick={() => handleVerify(token)}
              className="btn-primary-blue w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry verification</span>
            </button>
          )}

          {/* Resend Verification Form */}
          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#1E3A8A]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-sans">
                Request a new verification link
              </h4>
            </div>

            {resendSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>If an account with this email exists, a fresh link has been dispatched!</span>
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  required
                  value={emailToResend}
                  onChange={(e) => setEmailToResend(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] focus:border-[#1E3A8A] text-sm text-[#0F172A] outline-none"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full btn-outline py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send verification link</span>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="text-center text-xs text-[#475569]">
            Remember your credentials?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-bold text-[#1E3A8A] hover:underline cursor-pointer"
            >
              Back to Sign in
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
