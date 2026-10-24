import React, { useState } from 'react';
import { X, Database, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
    } else {
      setLoggedIn(true);
      setTimeout(() => {
        setLoggedIn(false);
        setOtpSent(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-[#E2E8F0] shadow-2xl overflow-hidden p-8 text-[#0F172A]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-[#1E3A8A] text-white shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] font-sans">
              Hind <span className="text-[#1E3A8A]">DB</span> Console
            </h3>
            <p className="text-xs text-[#475569]">Hind India Private Limited</p>
          </div>
        </div>

        {loggedIn ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Welcome to Hind DB!</h4>
            <p className="text-xs text-[#475569] font-mono">Redirecting to Mumbai Cloud Console...</p>
          </div>
        ) : (
          <div>
            {/* Tab switch (Phone OTP / Email) */}
            <div className="flex rounded-xl bg-[#F8FAFC] p-1 mb-6 border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => { setMethod('phone'); setOtpSent(false); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  method === 'phone' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                🇮🇳 Phone OTP (Instant)
              </button>
              <button
                type="button"
                onClick={() => { setMethod('email'); setOtpSent(false); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  method === 'email' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                Email Magic Link
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {method === 'phone' ? (
                <div>
                  <label className="block text-xs font-mono text-[#475569] mb-1.5">Indian Mobile Number</label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#475569]">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98200 12345"
                      disabled={otpSent}
                      className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white rounded-xl p-2.5 text-xs text-[#0F172A] outline-none font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono text-[#475569] mb-1.5">Work Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@company.in"
                    disabled={otpSent}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1E3A8A] focus:bg-white rounded-xl p-2.5 text-xs text-[#0F172A] outline-none font-mono"
                  />
                </div>
              )}

              {otpSent && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-mono text-[#F97316] mb-1.5">
                    Enter 4-Digit OTP sent via WhatsApp / SMS (Code: 7789)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="7789"
                    className="w-full bg-[#F8FAFC] border border-orange-300 rounded-xl p-2.5 text-center text-sm font-mono tracking-widest text-[#0F172A] outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl btn-primary-blue text-xs font-bold shadow-md shadow-blue-900/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{otpSent ? 'Verify & Launch Console' : 'Send WhatsApp / SMS OTP'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-center gap-2 text-[11px] font-mono text-[#475569]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>DPDP 2026 Encrypted & Stored in Mumbai</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

