import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CTA: React.FC = () => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#F97316', '#3B82F6', '#10B981']
    });
  };

  return (
    <section className="py-24 sm:py-36 lg:py-44 relative overflow-hidden bg-[#FFFFFF]">
      <div className="w-[88%] lg:w-[83%] max-w-[1280px] mx-auto">
        
        {/* Contrasting Accent Callout Banner Card */}
        <div className="relative rounded-[36px] bg-gradient-to-br from-[#1a1a1a] via-[#1E293B] to-[#0F172A] border border-slate-700/50 p-10 sm:p-18 overflow-hidden shadow-2xl text-white">
          <Plus className="w-4 h-4 text-slate-500/40 absolute top-4 left-4 pointer-events-none" />
          <Plus className="w-4 h-4 text-slate-500/40 absolute top-4 right-4 pointer-events-none" />

          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-subtle-grid opacity-20 pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-xs font-mono font-semibold text-orange-400 mb-6 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INSTANT DATABASE DEPLOYMENT</span>
            </div>

            <h2 className="text-[32px] sm:text-[44px] lg:text-[48px] font-serif font-semibold text-white tracking-tight mb-5 leading-[1.12]">
              Ready to Deploy on <br />
              <span className="text-gradient-orange italic font-normal">India's Sovereign Cloud</span>?
            </h2>

            <p className="text-base sm:text-xl text-slate-300 mb-9 leading-relaxed font-sans max-w-2xl mx-auto">
              Get started with our forever-free tier (₹0/mo). Scale effortlessly to managed PostgreSQL with instant UPI billing and sub-millisecond edge latency.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-9">
              <a
                href="#pricing"
                onClick={triggerConfetti}
                className="btn-accent-3d w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold cursor-pointer"
              >
                <span>Deploy Free Project</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#features"
                className="btn-secondary-3d w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold"
              >
                <span>Explore Technical Docs</span>
              </a>
            </div>

            {/* Features check list */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-300 font-sans">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Instant 60-second database setup
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                DPDP Act 2026 Ready 🇮🇳
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
