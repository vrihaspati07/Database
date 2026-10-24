import React, { useState } from 'react';
import { Database, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Docs', href: '#code-section' },
    { name: 'Blog', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 h-[72px] w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E2E8F0] transition-colors duration-200">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Brand Logo ("Hind DB" + blue icon) */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1E3A8A] text-white shadow-md shadow-blue-950/10 group-hover:scale-105 transition-transform duration-200">
            <Database className="w-5 h-5 text-white" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#0F172A] font-sans">
              Hind <span className="text-[#1E3A8A]">DB</span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] border border-[#1E3A8A]/20 font-mono">
              🇮🇳 India
            </span>
          </div>
        </a>

        {/* Center: Nav Links (Features, Pricing, Docs, Blog) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[15px] font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: CTAs - Login (outline), Get Started (filled, blue) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Login CTA (outline) */}
          <button
            onClick={onOpenLogin}
            className="btn-outline px-5 py-2 text-sm cursor-pointer"
          >
            Login
          </button>

          {/* Get Started CTA (filled, blue #1E3A8A) */}
          <a
            href="#pricing"
            className="btn-primary-blue inline-flex items-center gap-2 px-5 py-2 text-sm cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#0F172A]" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-base font-medium text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl"
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 text-[#94A3B8]" />
              </a>
            ))}
            <div className="pt-4 mt-2 border-t border-[#E2E8F0] flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="btn-outline w-full py-2.5 text-center text-sm"
              >
                Login
              </button>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary-blue w-full py-2.5 text-center text-sm inline-flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

