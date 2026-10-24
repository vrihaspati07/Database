import React from 'react';
import { Database, Mail, Globe, Heart } from 'lucide-react';
import { TwitterIcon, GithubIcon, DiscordIcon, LinkedinIcon } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0] text-[#475569] text-xs sm:text-sm pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid: Brand Info + 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          
          {/* Brand & Parent Company (Span 4) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1E3A8A] text-white shadow-xs">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0F172A] font-sans">
                Hind <span className="text-[#1E3A8A]">DB</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-sm">
              India's First Managed Database Platform. Production-ready Managed PostgreSQL, Real-time WebSockets, Auto APIs, Auth, and Storage at ₹999/month.
            </p>

            {/* Parent Company & Contact details */}
            <div className="space-y-2 pt-2 text-xs font-mono text-[#475569]">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Website: <a href="https://hind.io" className="text-[#0F172A] hover:text-[#1E3A8A] font-medium">hind.io</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Email: <a href="mailto:hello@hind.io" className="text-[#0F172A] hover:text-[#1E3A8A] font-medium">hello@hind.io</a></span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://twitter.com/hind"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter @hind"
                className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:text-[#1E3A8A] hover:bg-white transition-colors"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:text-[#1E3A8A] hover:bg-white transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:text-[#1E3A8A] hover:bg-white transition-colors"
              >
                <DiscordIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:text-[#1E3A8A] hover:bg-white transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 4 Columns (Span 8: 2 cols each on desktop) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            
            {/* Column 1: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">Company</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Hind India Private Limited</a></li>
                <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Careers <span className="text-[10px] text-[#F97316] font-mono font-bold ml-1">WE'RE HIRING</span></a></li>
                <li><a href="mailto:hello@hind.io" className="hover:text-[#1E3A8A] transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Brand Assets</a></li>
              </ul>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">Product</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><a href="#features" className="hover:text-[#1E3A8A] transition-colors">Managed PostgreSQL</a></li>
                <li><a href="#features" className="hover:text-[#1E3A8A] transition-colors">Real-time Database</a></li>
                <li><a href="#features" className="hover:text-[#1E3A8A] transition-colors">Auto APIs (REST + GraphQL)</a></li>
                <li><a href="#features" className="hover:text-[#1E3A8A] transition-colors">Row-Level Security</a></li>
                <li><a href="#features" className="hover:text-[#1E3A8A] transition-colors">File Storage</a></li>
                <li><a href="#features" className="hover:text-[#1E3A8A] transition-colors">Edge Functions</a></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">Resources</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><a href="#code-section" className="hover:text-[#1E3A8A] transition-colors">Documentation</a></li>
                <li><a href="#code-section" className="hover:text-[#1E3A8A] transition-colors">SDKs & Client Libraries</a></li>
                <li><a href="#faq" className="hover:text-[#1E3A8A] transition-colors">Blog & Guides</a></li>
                <li><a href="#pricing" className="hover:text-[#1E3A8A] transition-colors">Pricing (₹999/mo)</a></li>
                <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">System Status (99.9%)</a></li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">Legal</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">DPDP Act 2026 Compliance</a></li>
                <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Security & Encryption</a></li>
                <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">SLA Agreement</a></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#475569]">
          <div className="text-center sm:text-left">
            © 2026 Hind. A <strong className="text-[#0F172A] font-semibold">Hind India Private Limited</strong> Company. All rights reserved.
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-semibold text-[#0F172A]">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>in India 🇮🇳</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

