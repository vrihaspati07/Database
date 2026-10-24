import React, { useState } from 'react';
import { 
  Layers, 
  Workflow, 
  Clock,
  Plus
} from 'lucide-react';

interface ArchitectureProps {
  language?: 'en' | 'hi';
}

export const Architecture: React.FC<ArchitectureProps> = () => {
  const [activeScenario, setActiveScenario] = useState<number>(1);

  const scenarios = [
    {
      id: 1,
      title: 'Scenario 1: Developer Creates a Project',
      time: '< 2 minutes',
      steps: [
        'Developer signs up via Email / GitHub / Indian Mobile OTP',
        'Auth service verifies identity & generates isolated tenant vault key',
        'Control plane provisions dedicated PostgreSQL schema & S3 storage bucket',
        'Default auth, users, and audit tables created automatically',
        'Developer receives connection string + API keys ready for production'
      ]
    },
    {
      id: 2,
      title: 'Scenario 2: End-User Makes Live API Request',
      time: '20-40ms (Mumbai Server)',
      steps: [
        'End-user hits yourapp.hindindia.io/api/users',
        'Kong/Envoy API Gateway in Mumbai applies rate limiting & JWT verification',
        'FastAPI backend service queries PostgreSQL via PgBouncer pooling',
        'Redis 7 cache hit returns JSON response with zero delay',
        'Request logged & metered transparently without cold starts'
      ]
    },
    {
      id: 3,
      title: 'Scenario 3: Auto-Generated REST API',
      time: 'Instant (Saves 4-6 hrs/table)',
      steps: [
        'Developer creates table products with columns: id, title, price_inr',
        'API Generator automatically compiles endpoints: GET, POST, PUT, DELETE',
        'OpenAPI Swagger documentation generated in real time',
        'Frontend / Mobile devs consume endpoints immediately with zero backend code'
      ]
    }
  ];

  return (
    <section id="architecture" className="py-24 sm:py-36 lg:py-44 relative overflow-hidden bg-[#F5F5F7] border-b border-[#E5E5E5]">
      <div className="w-[88%] lg:w-[83%] max-w-[1280px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-mono font-semibold text-blue-700 mb-4 tracking-wider uppercase">
            <Workflow className="w-3.5 h-3.5 text-orange-500" />
            <span>SYSTEM ARCHITECTURE & FLOW</span>
          </div>
          <h2 className="text-[28px] sm:text-[34px] lg:text-[36px] font-serif font-semibold tracking-[-0.02em] text-[#1a1a1a] leading-[1.15]">
            Engineered for <br />
            <span className="text-gradient-orange italic font-normal">Sub-Millisecond Edge Latency</span>
          </h2>
          <p className="mt-4 text-lg sm:text-xl font-medium text-[#1a1a1a] font-sans leading-relaxed">
            A battle-tested open-source stack powered by Next.js, Python FastAPI, PostgreSQL 16, Redis 7, and Kong Gateway.
          </p>
        </div>

        {/* High-Level Architecture Stack Diagram (4 Columns) */}
        <div className="p-8 sm:p-12 rounded-[32px] bg-white border border-[#E5E5E5] shadow-sm mb-16 relative">
          <Plus className="w-3.5 h-3.5 text-slate-300 absolute top-3 right-3 pointer-events-none" />

          <h3 className="text-xs font-mono uppercase text-[#6b6b6b] font-bold mb-8 flex items-center gap-2 tracking-wider">
            <Layers className="w-4 h-4 text-orange-500" />
            <span>Layered System Architecture</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="p-6 rounded-2xl bg-[#F8F8FA] border border-[#E5E5E5]">
              <span className="text-[11px] font-mono uppercase text-[#6b6b6b] block mb-1">Layer 1: Frontend</span>
              <h4 className="text-base font-bold text-[#1a1a1a] font-sans">Next.js 14 Dashboard</h4>
              <p className="text-xs text-[#6b6b6b] mt-1.5 font-sans">React, TypeScript & Tailwind</p>
              <span className="inline-block mt-4 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-[11px] font-mono font-semibold">
                Instant provisioning
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F8FA] border border-[#E5E5E5]">
              <span className="text-[11px] font-mono uppercase text-[#6b6b6b] block mb-1">Layer 2: Ingress</span>
              <h4 className="text-base font-bold text-[#1a1a1a] font-sans">Kong Gateway</h4>
              <p className="text-xs text-[#6b6b6b] mt-1.5 font-sans">Rate limiting & JWT Routing</p>
              <span className="inline-block mt-4 px-3 py-1 rounded-full bg-orange-500/10 text-orange-700 text-[11px] font-mono font-semibold">
                WAF & DDoS Protected
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F8FA] border border-[#E5E5E5]">
              <span className="text-[11px] font-mono uppercase text-[#6b6b6b] block mb-1">Layer 3: Services</span>
              <h4 className="text-base font-bold text-[#1a1a1a] font-sans">Python FastAPI Core</h4>
              <p className="text-xs text-[#6b6b6b] mt-1.5 font-sans">Auth, Storage, Auto REST, WS</p>
              <span className="inline-block mt-4 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 text-[11px] font-mono font-semibold">
                Async high-throughput
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F8FA] border border-[#E5E5E5]">
              <span className="text-[11px] font-mono uppercase text-[#6b6b6b] block mb-1">Layer 4: Data Layer</span>
              <h4 className="text-base font-bold text-[#1a1a1a] font-sans">Postgres 16 + Redis 7</h4>
              <p className="text-xs text-[#6b6b6b] mt-1.5 font-sans">Mumbai & Bangalore Edge</p>
              <span className="inline-block mt-4 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-mono font-semibold">
                MinIO S3 + PgBouncer
              </span>
            </div>

          </div>
        </div>

        {/* Data Flow Scenarios Tabs (Pill shaped buttons) */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeScenario === s.id
                    ? 'btn-accent-3d text-white'
                    : 'btn-secondary-3d'
                }`}
              >
                {s.title.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Scenario Details Box */}
          {(() => {
            const cur = scenarios.find(s => s.id === activeScenario) || scenarios[0];
            return (
              <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-[#E5E5E5] shadow-md relative">
                <Plus className="w-3.5 h-3.5 text-slate-300 absolute top-3 right-3 pointer-events-none" />

                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5E5E5]">
                  <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] font-sans">
                    {cur.title}
                  </h3>
                  <span className="px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-600 font-mono text-xs font-semibold border border-orange-500/20 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{cur.time}</span>
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs sm:text-sm">
                  {cur.steps.map((st, i) => (
                    <div key={i} className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F8F8FA] border border-[#E5E5E5]">
                      <span className="w-6 h-6 rounded-full bg-blue-500/15 text-blue-700 border border-blue-500/30 flex items-center justify-center text-xs shrink-0 font-bold font-mono">
                        {i + 1}
                      </span>
                      <span className="text-[#1a1a1a] leading-snug mt-0.5 font-sans">{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

      </div>
    </section>
  );
};
