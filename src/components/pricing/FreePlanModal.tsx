import { X, Check, Database, ArrowRight, Zap } from 'lucide-react';

interface FreePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignup?: () => void;
  onOpenLogin?: () => void;
}

export const FreePlanModal: React.FC<FreePlanModalProps> = ({
  isOpen,
  onClose,
  onOpenSignup,
  onOpenLogin
}) => {
  if (!isOpen) return null;

  const freePerks = [
    '1 GB High-Speed PostgreSQL Database Storage',
    '10,000 Relational Database Rows Included',
    'Auto-Generated REST & GraphQL APIs',
    '50,000 Monthly API Requests with zero throttling',
    '1 GB S3-Compatible File Storage Bucket',
    'Standard Sovereign Region Access (Mumbai ap-south-1)',
    'Community Forum, Discord & Documentation Support',
    'Zero foreign exchange or hidden maintenance fees'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-white border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#0F172A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 sm:p-7 border-b border-[#F1F5F9] bg-gradient-to-r from-emerald-50/50 via-white to-blue-50/40 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/80 hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold w-fit mb-3 font-mono">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>STARTER PLAN • 100% FREE FOREVER</span>
          </div>

          <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <span>Hind DB Developer Starter</span>
          </h3>
          <p className="text-sm text-[#475569] mt-1">
            Build, test, and ship your next project without spending a single Rupee. No credit card required.
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0F172A]">₹0</span>
            <span className="text-sm text-[#64748B] font-medium">/ forever</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              No Expiry
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
              Included in the Free Plan:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {freePerks.map((perk, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#334155] p-2 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-tight">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border border-blue-200 text-[#1E3A8A] shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-[#0F172A] block">Instant PostgreSQL 16.4 Cluster</span>
              <span className="text-[#475569]">
                Ready in under 30 seconds with auto-generated connection string and REST endpoints.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-[#F1F5F9] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#64748B] text-center sm:text-left">
            <span>Already have an account? </span>
            <button
              onClick={() => {
                onClose();
                if (onOpenLogin) onOpenLogin();
              }}
              className="text-[#1E3A8A] font-semibold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-full border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenSignup) onOpenSignup();
              }}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-full bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-bold shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
