import React from 'react';
import { Database, Zap, ShieldCheck, Heart } from 'lucide-react';

export const Stats: React.FC = () => {
  const stats = [
    {
      value: '10M+',
      label: 'Rows served',
      description: 'Zero-lag transactional and analytical queries daily',
      icon: Database,
      accent: 'text-[#1E3A8A]',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      value: '<50ms',
      label: 'Latency',
      description: 'Ultra-low roundtrip to all major Indian metropolitan areas',
      icon: Zap,
      accent: 'text-[#F97316]',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
    },
    {
      value: '99.9%',
      label: 'Uptime SLA',
      description: 'Automated failover with dual-AZ synchronous replication',
      icon: ShieldCheck,
      accent: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      value: '100%',
      label: 'Made in India',
      description: 'Sovereign data hosting strictly within Mumbai & Bengaluru',
      icon: Heart,
      accent: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
  ];

  return (
    <section className="py-14 bg-[#F8FAFC] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.border} border`}>
                    <Icon className={`w-5 h-5 ${stat.accent}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono">0{idx + 1}</span>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight font-sans mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-[#0F172A] mb-1.5">
                    {stat.label}
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
