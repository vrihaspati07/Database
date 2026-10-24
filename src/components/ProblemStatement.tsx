import React from 'react';
import { 
  AlertTriangle, 
  DollarSign, 
  Server, 
  CreditCard, 
  BookOpen, 
  CheckCircle2, 
  Quote,
  Plus
} from 'lucide-react';

interface ProblemStatementProps {
  language?: 'en' | 'hi';
}

export const ProblemStatement: React.FC<ProblemStatementProps> = ({ language = 'en' }) => {
  const problems = [
    {
      id: 1,
      title: language === 'hi' ? '1. विदेशी क्लाउड की महंगी USD बिलिंग' : '1. Unpredictable USD Billing & Forex Spikes',
      tag: 'Expensive USD Invoicing',
      icon: DollarSign,
      color: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
      founder: 'Rahul, Startup Founder (Bangalore)',
      quote: `"Foreign cloud databases charge $25-500/month (₹2,000-40,000). For an early-stage Indian startup, currency fluctuations and international credit card fees eat up 30% of seed capital."`,
      data: 'Startups waste significant runway on foreign exchange conversion fees and rigid dollar-denominated tiers.',
      solution: 'Hind DB provides managed PostgreSQL with predictable local INR pricing starting at ₹999/month with zero forex overhead.'
    },
    {
      id: 2,
      title: language === 'hi' ? '2. इंडिया में डेटा सेंटर्स की कमी' : '2. Offshore Data Centers & Compliance Hurdles',
      tag: 'DPDP Act Compliance Risk',
      icon: Server,
      color: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
      founder: 'Amit, Fintech Architect (Mumbai)',
      quote: `"Offshore servers route traffic through Singapore or US-East, introducing 150ms+ latency and failing RBI & DPDP Act 2026 data localization compliance audits."`,
      data: '60% of Indian fintech and healthtech startups face data residency audit hurdles.',
      solution: 'All Hind DB clusters are deployed exclusively in Mumbai & Bangalore data centers with full DPDP 2026 compliance.'
    },
    {
      id: 3,
      title: language === 'hi' ? '3. कोई नेटिव इंडियन इंटीग्रेशन नहीं' : '3. Zero Native Indian Integrations',
      tag: 'No UPI / WhatsApp / Razorpay',
      icon: CreditCard,
      color: 'bg-purple-500/10 text-purple-600 border border-purple-500/20',
      founder: 'Priya, Full-Stack Lead (Delhi NCR)',
      quote: `"We need UPI QR payments, Razorpay webhooks, and WhatsApp OTP verification. Building custom proxy adapters takes 2-3 weeks of engineering time."`,
      data: 'WhatsApp has 530M+ users in India (vs 150M email). UPI processes 11B+ transactions monthly.',
      solution: 'Native plug-and-play modules for UPI QR codes, Razorpay/Cashfree webhooks, and WhatsApp OTP verification.'
    },
    {
      id: 4,
      title: language === 'hi' ? '4. इंग्लिश-ओनली सपोर्ट और डॉक्स' : '4. English-Only Documentation & US Timezones',
      tag: 'Language & Timezone Barrier',
      icon: BookOpen,
      color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
      founder: 'Sneha, Engineering Lead (Patna)',
      quote: `"Technical documentation and obscure error codes in complex English slow down junior developers. Having Hindi explanations speeds up debugging by 3x."`,
      data: 'Over 60% of Indian engineering students and regional developers face language friction with technical docs.',
      solution: 'First database platform offering comprehensive Hindi + English bilingual documentation, tutorials, and local IST support.'
    }
  ];

  return (
    <section id="problems" className="py-24 sm:py-36 lg:py-44 relative overflow-hidden bg-[#F5F5F7] border-b border-[#E5E5E5]">
      <div className="w-[88%] lg:w-[83%] max-w-[1280px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-xs font-mono font-semibold text-rose-700 mb-4 tracking-wider uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>REAL DEVELOPER CHALLENGES</span>
          </div>
          <h2 className="text-[28px] sm:text-[34px] lg:text-[36px] font-serif font-semibold tracking-[-0.02em] text-[#1a1a1a] leading-[1.15]">
            Developer Infrastructure Challenges <br />
            <span className="text-rose-600 italic font-normal">Solved Directly by Hind DB</span>
          </h2>
          <p className="mt-4 text-lg sm:text-xl font-medium text-[#1a1a1a] font-sans leading-relaxed">
            Eliminating currency conversion fees, high latency, and foreign residency risks.
          </p>
        </div>

        {/* 4 Real-Life Problem Cards Grid (2x2 on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {problems.map((prob) => {
            const Icon = prob.icon;

            return (
              <div
                key={prob.id}
                className="p-8 sm:p-10 rounded-[28px] bg-white border border-[#E5E5E5] shadow-sm flex flex-col justify-between hover:border-orange-500/40 hover:shadow-md transition-all duration-300 relative group"
              >
                <Plus className="w-3.5 h-3.5 text-slate-300 absolute top-3 right-3 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl ${prob.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#F5F5F7] text-[#4a4a4a] border border-[#E5E5E5]">
                        {prob.tag}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold text-[#1a1a1a] mb-4 font-sans">
                    {prob.title}
                  </h3>

                  {/* Real Developer Quote Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F8FA] border border-[#E5E5E5] mb-4">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-orange-600 mb-2 font-semibold">
                      <Quote className="w-3.5 h-3.5 shrink-0" />
                      <span>{prob.founder}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#4a4a4a] italic leading-relaxed font-sans">
                      {prob.quote}
                    </p>
                  </div>

                  {/* Market Data */}
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-800 mb-6">
                    <strong className="text-rose-700">Context:</strong> {prob.data}
                  </div>
                </div>

                {/* The Hind DB Solution */}
                <div className="pt-4 border-t border-[#E5E5E5]">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-mono text-emerald-700 font-bold uppercase tracking-wider block">
                        The Hind DB Fix:
                      </span>
                      <p className="text-xs sm:text-sm text-[#4a4a4a] mt-0.5 leading-relaxed font-sans">
                        {prob.solution}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
