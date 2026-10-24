import React, { useState, useEffect } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';

interface VerifyEmailPageProps {
  onNavigate: (page: string) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onNavigate }) => {
  const { verifyEmail } = useAuth();
  
  const [email, setEmail] = useState<string>('developer@company.in');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('hind_verification_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);


  const handleOpenEmailApp = () => {
    // Determine provider if possible
    if (email.includes('gmail.com')) {
      window.open('https://mail.google.com', '_blank');
    } else if (email.includes('outlook.com') || email.includes('hotmail.com')) {
      window.open('https://outlook.live.com', '_blank');
    } else if (email.includes('yahoo.com')) {
      window.open('https://mail.yahoo.com', '_blank');
    } else {
      window.location.href = `mailto:${email}`;
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(45);
    setResendMessage('A fresh verification link has been sent to your email.');
    setTimeout(() => setResendMessage(null), 5000);
  };

  // Instant 1-click verification simulation for demo purposes
  const handleSimulateVerification = async () => {
    setVerifying(true);
    const token = sessionStorage.getItem('hind_debug_token') || 'demo-token';
    const res = await verifyEmail(token);
    setVerifying(false);
    if (res.success) {
      setVerified(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1500);
    }
  };

  return (
    <AuthLayout
      title={verified ? 'Email Verified!' : 'Verify your email'}
      subtitle={
        verified
          ? 'Your account has been activated. Redirecting to sovereign console...'
          : `We sent a verification link to ${email}`
      }
      onBackToHome={() => onNavigate('home')}
    >
      <div className="text-center py-2 space-y-6">
        
        {/* Animated Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E3A8A] shadow-sm">
            {verified ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-in zoom-in" />
            ) : (
              <Mail className="w-10 h-10 text-[#1E3A8A]" />
            )}
          </div>
          {!verified && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#1E3A8A]" />
            </span>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2 text-sm text-[#475569]">
          <p>
            Please check your inbox and click the verification link to activate your managed PostgreSQL cluster and access the Hind DB console.
          </p>
          <p className="text-xs text-[#94A3B8]">
            Can't find it? Check your spam or promotions folder.
          </p>
        </div>

        {resendMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            {resendMessage}
          </div>
        )}

        {/* Primary CTA: "Open email app" button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleOpenEmailApp}
            className="btn-primary-blue w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open Email App</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Instant One-Click Verification Simulation Button */}
          <button
            onClick={handleSimulateVerification}
            disabled={verifying || verified}
            className="btn-outline w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
            <span>{verifying ? 'Verifying token...' : 'Click to Verify Email Instantly'}</span>
          </button>
        </div>

        {/* Resend email link */}
        <div className="pt-4 border-t border-[#E2E8F0] flex flex-col items-center justify-center gap-2 text-xs text-[#475569]">
          <div>
            Didn't receive an email?{' '}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={`font-bold transition-colors cursor-pointer ${
                resendCooldown > 0 ? 'text-[#94A3B8] cursor-not-allowed' : 'text-[#1E3A8A] hover:underline'
              }`}
            >
              {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend email'}
            </button>
          </div>

          <button
            onClick={() => onNavigate('login')}
            className="text-xs text-[#475569] hover:text-[#0F172A] font-medium mt-2 cursor-pointer"
          >
            ← Back to sign in
          </button>
        </div>

      </div>
    </AuthLayout>
  );
};
