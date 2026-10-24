import React from 'react';
import { Database, ShieldCheck, Heart, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onBackToHome?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  onBackToHome,
}) => {
  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex flex-col justify-between text-[#0F172A] relative selection:bg-[#1E3A8A]/15 selection:text-[#1E3A8A]">
      
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="hero-glow-blue top-0 left-1/2 -translate-x-1/2 opacity-70" />

      {/* Top Bar with Brand and Back Link */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <a href="/" onClick={(e) => { if (onBackToHome) { e.preventDefault(); onBackToHome(); } }} className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1E3A8A] text-white shadow-md shadow-blue-950/10 group-hover:scale-105 transition-transform">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#0F172A] font-sans">
            Hind <span className="text-[#1E3A8A]">DB</span>
          </span>
        </a>

        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#1E3A8A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center flex-1">
        <div className="w-full bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] shadow-xl p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight font-sans">
              {title}
            </h1>
            <p className="text-sm text-[#475569] mt-2 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Form / Content Slot */}
          {children}

        </div>

        {/* Security / DPDP Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-[#475569]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DPDP Act 2026 Sovereign Data Localization</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569]">
        <div>
          © 2026 Hind. A <strong className="text-[#0F172A] font-semibold">Hind India Private Limited</strong> Company.
        </div>

        <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>in India 🇮🇳</span>
        </div>
      </footer>

    </div>
  );
};
