import React from 'react';
import { 
  Radio, 
  Code2, 
  ShieldCheck, 
  KeyRound, 
  HardDrive, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      name: 'Real-time Database',
      description: 'Stream PostgreSQL changes instantly over sub-4ms WebSockets. Subscribe to INSERT, UPDATE, and DELETE events without polling or complex backend infrastructure.',
      icon: Radio,
      badge: 'Sub-4ms WebSockets',
      benefit: 'Live updates for quick commerce, live tracking, and chat applications',
      color: 'bg-blue-50 text-[#1E3A8A] border-blue-100',
    },
    {
      name: 'Auto APIs (REST + GraphQL)',
      description: 'Instant production-grade REST and GraphQL endpoints generated directly from your PostgreSQL schema, complete with OpenAPI specs and filtering.',
      icon: Code2,
      badge: 'Zero Boilerplate',
      benefit: 'Create tables and query immediately without writing CRUD code',
      color: 'bg-orange-50 text-[#F97316] border-orange-100',
    },
    {
      name: 'Row-Level Security',
      description: 'Enterprise-grade granular authorization powered natively by PostgreSQL policies. Protect multi-tenant rows and user records at the database level.',
      icon: ShieldCheck,
      badge: 'Postgres RLS',
      benefit: 'Bulletproof security so clients can safely query the DB directly',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      name: 'Authentication (Email, OAuth, Phone)',
      description: 'Built-in identity platform with Indian Mobile Phone OTP, WhatsApp verification, Email Magic Links, and OAuth (Google, GitHub, Apple).',
      icon: KeyRound,
      badge: 'WhatsApp / Phone OTP',
      benefit: 'Ready-to-use user management with JWT tokens and custom claims',
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      name: 'File Storage (S3-compatible)',
      description: 'High-speed object storage hosted directly in Mumbai and Bengaluru with automatic image resizing, CDN caching, and RLS bucket permissions.',
      icon: HardDrive,
      badge: 'S3 API Compatible',
      benefit: 'Upload media and documents with zero dollar egress penalties',
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      name: 'Edge Functions (Serverless)',
      description: 'Deploy TypeScript & JavaScript serverless functions that run at the Indian cloud edge right next to your PostgreSQL database with sub-5ms cold starts.',
      icon: Cpu,
      badge: 'Serverless Edge',
      benefit: 'Execute custom backend logic, payment webhooks, and cron jobs',
      color: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-xs font-semibold text-[#1E3A8A] mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
            <span>CORE PLATFORM CAPABILITIES</span>
          </div>
          
          {/* H2: 40px SemiBold */}
          <h2 className="text-[30px] sm:text-[36px] lg:text-[40px] font-semibold text-[#0F172A] tracking-tight font-sans leading-tight">
            Everything You Need to Build <br />
            <span className="text-gradient-blue">Modern Indian Applications</span>
          </h2>
          
          <p className="mt-4 text-[18px] text-[#475569] leading-relaxed">
            A complete suite of managed backend primitives designed to eliminate repetitive infrastructure work and accelerate your engineering team.
          </p>
        </div>

        {/* Features Section (3x2 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${feat.color} border shadow-xs group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#0F172A] mb-3 group-hover:text-[#1E3A8A] transition-colors font-sans">
                    {feat.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#475569] leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                {/* Benefit Highlight */}
                <div className="pt-5 border-t border-[#F1F5F9]">
                  <div className="flex items-start gap-2 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{feat.benefit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Bottom Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="hidden sm:flex p-3 rounded-2xl bg-[#1E3A8A] text-white">
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#0F172A]">Need custom enterprise extensions or high-capacity sharding?</h4>
              <p className="text-xs text-[#475569]">Our engineering team deploys dedicated VPC clusters in Mumbai & Bengaluru within 24 hours.</p>
            </div>
          </div>

          <a
            href="#pricing"
            className="btn-outline px-6 py-2.5 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-2"
          >
            <span>Explore Enterprise Tier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};

