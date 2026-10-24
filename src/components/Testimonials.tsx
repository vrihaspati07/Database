import React from 'react';
import { Star, Heart, Quote, CheckCircle2 } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Aarav Sharma',
      role: 'CTO & Co-Founder',
      company: 'QuickMart India',
      city: 'India',
      quote: 'Hind DB brought our API latencies down from 180ms to under 25ms. Having managed PostgreSQL hosted on sovereign high-performance infrastructure with native WhatsApp OTP authentication made our launch effortless.',
      metrics: '22ms avg latency • 500k daily orders',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
    },
    {
      name: 'Priya Iyer',
      role: 'Principal Backend Engineer',
      company: 'FinSet Technologies',
      city: 'India',
      quote: 'Native sovereign data residency solved all our DPDP Act 2026 compliance audits on day one. The ₹999/month Pro tier gives us enterprise PostgreSQL power at a fraction of typical cloud costs.',
      metrics: '100% DPDP compliant • Zero egress fee',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    },
    {
      name: 'Vikram Malhotra',
      role: 'Head of Engineering',
      company: 'BharatLogistics Core',
      city: 'Delhi NCR',
      quote: 'The real-time WebSockets and auto-generated REST APIs allowed our team of 4 developers to build a real-time fleet delivery tracker in just two weeks without maintaining custom WebSocket servers.',
      metrics: '99.99% uptime SLA • 12k drivers live',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-4 uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>DEVELOPER LOVE</span>
          </div>
          
          <h2 className="text-[30px] sm:text-[36px] lg:text-[40px] font-semibold text-[#0F172A] tracking-tight font-sans">
            Loved by Developers Across <br />
            <span className="text-gradient-blue">India's Tech Ecosystem</span>
          </h2>
          
          <p className="mt-4 text-[18px] text-[#475569] leading-relaxed">
            See how high-growth startups and engineering teams are building reliable products on Hind DB.
          </p>
        </div>

        {/* 3 Columns Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between relative group hover:-translate-y-1"
            >
              <Quote className="w-10 h-10 text-blue-100 absolute top-6 right-6 pointer-events-none group-hover:text-blue-200 transition-colors" />

              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-[#F97316] mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm sm:text-base text-[#334155] leading-relaxed mb-6 font-normal">
                  "{t.quote}"
                </p>
              </div>

              <div>
                {/* Metrics pill */}
                <div className="mb-5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#1E3A8A] flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.metrics}</span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-[#F1F5F9]">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 shadow-xs"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A] font-sans">
                      {t.name}
                    </h4>
                    <p className="text-xs text-[#475569]">
                      {t.role}, <span className="font-semibold text-[#1E3A8A]">{t.company}</span>
                    </p>
                    <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                      📍 {t.city}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

