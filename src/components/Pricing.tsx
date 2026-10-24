import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  CreditCard,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';


export const Pricing: React.FC = () => {
  const [annual, setAnnual] = useState(false);

  const triggerSelectPlan = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1E3A8A', '#F97316', '#10B981']
    });
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      subtitle: 'For developers, students & hobby projects',
      highlight: false,
      badge: 'Starter',
      specs: '1GB Database • 10K Rows',
      features: [
        '1GB High-Speed Database Storage',
        '10K Database Rows Included',
        'Auto-Generated REST APIs',
        '50,000 Monthly API Requests',
        '1GB File Storage Bucket',
        'Community Forum & Docs Support',
        'Standard Sovereign Region Access'
      ],
      btnText: 'Start Free Forever',
      btnStyle: 'btn-outline',
    },
    {
      name: 'Pro',
      price: 999,
      subtitle: 'For fast-growing startups, SaaS & apps',
      highlight: true,
      badge: 'Most Popular',
      specs: '10GB Database • 1M Rows',
      features: [
        '10GB High-Speed Database Storage',
        '1M Database Rows Included',
        'Real-time WebSockets & CDC',
        'Auto REST + GraphQL APIs',
        'Row-Level Security (RLS) & Auth',
        '10GB S3-Compatible File Storage',
        'Serverless Edge Functions',
        'Daily Automated Backups',
        'Priority Email & Chat Support (IST)'
      ],
      btnText: 'Upgrade to Pro (₹999/mo)',
      btnStyle: 'btn-primary-blue',
    },
    {
      name: 'Enterprise',
      price: 9999,
      subtitle: 'For high-scale apps, fintech & enterprises',
      highlight: false,
      badge: 'Dedicated VPC',
      specs: '100GB Database • Unlimited Rows',
      features: [
        '100GB Dedicated Database Cluster',
        'Unlimited Database Rows',
        'Isolated Dedicated Sovereign VPC',
        '99.9% Uptime SLA Guarantee',
        'Custom pgvector & AI Acceleration',
        '100GB+ S3 File Storage Bandwidth',
        '24/7 Phone, WhatsApp & Slack On-Call',
        'DPDP Act 2026 Audit Compliance Report',
        'Custom BAA & Enterprise MSA'
      ],
      btnText: 'Choose Enterprise',
      btnStyle: 'btn-outline',
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-xs font-semibold text-[#1E3A8A] mb-4 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#F97316]" />
            <span>TRANSPARENT INR PRICING</span>
          </div>
          
          <h2 className="text-[30px] sm:text-[36px] lg:text-[40px] font-semibold text-[#0F172A] tracking-tight font-sans">
            Simple, Predictable Plans for <br />
            <span className="text-gradient-blue">Every Stage of Growth</span>
          </h2>
          
          <p className="mt-4 text-[18px] text-[#475569] leading-relaxed">
            Transparent pricing billed directly in Indian Rupees (INR) with zero foreign transaction fees.
          </p>

          {/* Billing Switch (Monthly / Annual) */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? 'text-[#0F172A] font-bold' : 'text-[#475569]'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="w-14 h-8 rounded-full bg-[#E2E8F0] p-1 relative transition-colors focus:outline-none border border-[#CBD5E1] cursor-pointer"
              aria-label="Toggle annual billing"
            >
              <div
                className={`w-6 h-6 rounded-full bg-[#1E3A8A] transition-transform shadow-md ${
                  annual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium flex items-center gap-2 ${annual ? 'text-[#0F172A] font-bold' : 'text-[#475569]'}`}>
              <span>Annual</span>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F97316] text-xs font-mono font-bold border border-orange-200">
                2 Months Free
              </span>
            </span>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {plans.map((p, idx) => {
            const finalPrice = p.price === 0 ? 0 : Math.round(annual ? p.price * 0.83 : p.price);

            return (
              <div
                key={idx}
                className={`p-8 sm:p-10 rounded-3xl bg-white flex flex-col justify-between transition-all duration-300 relative ${
                  p.highlight
                    ? 'border-2 border-[#1E3A8A] shadow-xl lg:-translate-y-2 ring-4 ring-blue-500/10'
                    : 'border border-[#E2E8F0] shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Most Popular Badge for Pro Tier */}
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#1E3A8A] text-white text-xs font-bold uppercase shadow-md flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    <span>{p.badge}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xl font-bold font-sans ${p.highlight ? 'text-[#1E3A8A]' : 'text-[#0F172A]'}`}>
                      {p.name}
                    </span>
                    {!p.highlight && (
                      <span className="px-3 py-0.5 rounded-full bg-[#F8FAFC] text-xs font-mono text-[#475569] border border-[#E2E8F0]">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
                      ₹{finalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-[#475569] font-medium">/ month</span>
                  </div>

                  {/* Key specs highlight */}
                  <div className="inline-block px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 text-xs font-semibold text-[#1E3A8A] mb-3">
                    {p.specs}
                  </div>

                  <p className="text-xs text-[#475569] mb-6">{p.subtitle}</p>

                  {/* Features List */}
                  <div className="space-y-3.5 pt-6 border-t border-[#F1F5F9] text-sm text-[#475569]">
                    {p.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${p.highlight ? 'text-[#1E3A8A] font-bold' : 'text-emerald-600'}`} />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-8 mt-6 border-t border-[#F1F5F9]">
                  <button
                    onClick={triggerSelectPlan}
                    className={`w-full py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${p.btnStyle}`}
                  >
                    <span>{p.btnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indian Payment Methods Banner */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-6 max-w-4xl mx-auto shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#1E3A8A]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#0F172A] block">
                Zero Foreign Exchange Fees:
              </span>
              <span className="text-xs text-[#475569]">
                Billed 100% in INR with compliant Indian GST invoicing
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              UPI (GPay, PhonePe, Paytm)
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200">
              RuPay & NetBanking
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-orange-50 text-[#F97316] border border-orange-200">
              GST Input Credit Available
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

