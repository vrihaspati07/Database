import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CreditCard, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  annual: boolean;
  onNavigate?: (page: string) => void;
  onOpenSignup?: () => void;
}

export const ProCheckoutModal: React.FC<ProCheckoutModalProps> = ({
  isOpen,
  onClose,
  annual,
  onNavigate,
  onOpenSignup
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [gstin, setGstin] = useState('');
  const [includeGst, setIncludeGst] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [txnId, setTxnId] = useState('');

  if (!isOpen) return null;

  const basePrice = annual ? 829 : 999;
  const billingPeriod = annual ? 'billed annually (₹9,948/yr)' : 'billed monthly';
  const gstAmount = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + (includeGst ? gstAmount : 0);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setIsPaid(true);
      const generatedId = 'HIND_TXN_' + Math.floor(100000 + Math.random() * 900000);
      setTxnId(generatedId);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#1E3A8A', '#F97316', '#10B981']
      });
    }, 1200);
  };

  const handleClose = () => {
    setIsPaid(false);
    setProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-white border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#0F172A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-[#F1F5F9] bg-gradient-to-r from-blue-50/60 via-white to-orange-50/40 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/80 hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] text-xs font-bold w-fit mb-3 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
            <span>PRO TIER CHECKOUT • ZERO FX FEES</span>
          </div>

          <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Upgrade to Hind DB Pro
          </h3>
          <p className="text-sm text-[#475569] mt-1">
            Supercharge your cloud apps with 10GB storage, 1M rows, real-time CDC, and Indian data sovereignty.
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0F172A]">₹{basePrice.toLocaleString('en-IN')}</span>
            <span className="text-sm text-[#64748B] font-medium">/ month</span>
            <span className="text-xs text-[#64748B] ml-2">({billingPeriod})</span>
            {annual && (
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F97316] text-xs font-bold border border-orange-200">
                Save 17% (2 Months Free)
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        {isPaid ? (
          /* Payment Success State */
          <div className="p-8 sm:p-10 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                PAYMENT CONFIRMED
              </span>
              <h4 className="text-2xl font-black text-[#0F172A] mt-2">
                Welcome to Hind DB Pro!
              </h4>
              <p className="text-sm text-[#475569] mt-1 max-w-md mx-auto">
                Your sovereign PostgreSQL compute cluster has been provisioned. A tax invoice has been generated.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Transaction Reference:</span>
                <span className="font-mono font-bold text-[#0F172A]">{txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Plan Upgraded:</span>
                <span className="font-semibold text-[#1E3A8A]">Hind DB Pro (10GB / 1M Rows)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Amount Paid:</span>
                <span className="font-bold text-[#0F172A]">₹{totalAmount.toLocaleString('en-IN')} INR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Payment Gateway:</span>
                <span className="text-emerald-700 font-medium">Razorpay Sovereign Node (India)</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  handleClose();
                  if (onNavigate) onNavigate('dashboard');
                  else if (onOpenSignup) onOpenSignup();
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-bold shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Database Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handlePay} className="p-6 sm:p-7 overflow-y-auto space-y-6">
            
            {/* Quick Specs Pill Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="font-black text-[#0F172A] block text-sm">10 GB</span>
                <span className="text-[11px] text-[#64748B]">SSD Database</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="font-black text-[#0F172A] block text-sm">1M Rows</span>
                <span className="text-[11px] text-[#64748B]">Fast Relational</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="font-black text-[#0F172A] block text-sm">Real-time</span>
                <span className="text-[11px] text-[#64748B]">WebSockets & CDC</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="font-black text-[#0F172A] block text-sm">24/7 IST</span>
                <span className="text-[11px] text-[#64748B]">Priority Support</span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2.5">
                Select Indian Payment Method:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-[#1E3A8A] bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === 'upi' ? 'bg-[#1E3A8A] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">UPI / QR Code</span>
                    <span className="text-[11px] text-[#64748B]">GPay, PhonePe, Paytm</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[#1E3A8A] bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === 'card' ? 'bg-[#1E3A8A] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Cards & NetBanking</span>
                    <span className="text-[11px] text-[#64748B]">RuPay, Visa, MC</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Specific Input Fields */}
            {paymentMethod === 'upi' ? (
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Dynamic QR Code mockup */}
                  <div className="p-3 bg-white rounded-xl border border-[#CBD5E1] shadow-xs shrink-0 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-900 to-blue-900 rounded-lg flex items-center justify-center text-white font-mono text-[10px] p-2 leading-tight">
                      [SCAN TO PAY ₹{totalAmount}]
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 block mt-1.5">
                      • Instant Auto-Verify
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="block text-xs font-semibold text-[#475569]">
                      Or enter UPI VPA / ID:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@okhdfcbank or user@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-500/20"
                    />

                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['@okhdfcbank', '@paytm', '@ybl', '@okaxis'].map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          onClick={() => setUpiId((prev) => (prev ? prev.split('@')[0] + handle : 'developer' + handle))}
                          className="px-2 py-0.5 rounded-lg bg-white border border-[#CBD5E1] text-[10px] text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                        >
                          {handle}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[#64748B] pt-1">
                  <span className="px-2 py-1 rounded bg-white border border-[#E2E8F0]">PhonePe</span>
                  <span className="px-2 py-1 rounded bg-white border border-[#E2E8F0]">Google Pay</span>
                  <span className="px-2 py-1 rounded bg-white border border-[#E2E8F0]">Paytm</span>
                  <span className="px-2 py-1 rounded bg-white border border-[#E2E8F0]">BHIM UPI</span>
                  <span className="px-2 py-1 rounded bg-white border border-[#E2E8F0]">Cred UPI</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Name on Card</label>
                  <input
                    type="text"
                    placeholder="e.g. Vikramaditya Sharma"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>
            )}

            {/* Indian GST Billing Option */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#475569]">
                <input
                  type="checkbox"
                  checked={includeGst}
                  onChange={(e) => setIncludeGst(e.target.checked)}
                  className="rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <span>Generate compliant GST invoice for 18% Input Tax Credit</span>
              </label>

              {includeGst && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="Enter 15-digit GSTIN (e.g. 27AABCU9603R1ZM)"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    maxLength={15}
                    className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-[#64748B]">
                <span>Base Subscription ({billingPeriod}):</span>
                <span className="font-semibold text-[#0F172A]">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              {includeGst && (
                <div className="flex justify-between text-[#64748B]">
                  <span>GST (18% Input Credit):</span>
                  <span className="font-semibold text-[#0F172A]">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-[#0F172A] pt-1.5 border-t border-slate-200">
                <span>Total Due Now:</span>
                <span className="text-[#1E3A8A]">₹{totalAmount.toLocaleString('en-IN')} INR</span>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted Sovereign Checkout</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-full border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="w-1/2 sm:w-auto px-6 py-2.5 rounded-full bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-bold shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{totalAmount.toLocaleString('en-IN')} & Activate</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
