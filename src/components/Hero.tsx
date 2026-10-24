import React, { useState } from 'react';
import { 
  ArrowRight, 
  Play, 
  Database, 
  ShieldCheck, 
  Server, 
  Activity, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeroProps {
  onOpenDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemo }) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'pg' | 'pool' | 'realtime'>('all');
  const [liveQueryCount, setLiveQueryCount] = useState(14820);
  const [simulatedPing, setSimulatedPing] = useState(24);

  const triggerStartFree = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1E3A8A', '#3B82F6', '#F97316']
    });
  };

  const handleRefreshPing = () => {
    setSimulatedPing(Math.floor(18 + Math.random() * 12));
    setLiveQueryCount(prev => prev + Math.floor(10 + Math.random() * 25));
  };

  return (
    <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-[#FFFFFF] border-b border-[#E2E8F0]">
      
      {/* Background Soft Glow & Grid Pattern */}
      <div className="hero-glow-blue top-1/4 left-1/2 -translate-x-1/2" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Subheading & CTAs (Col 7) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-xs font-semibold text-[#1E3A8A]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E3A8A]" />
              </span>
              <span className="tracking-wide">🇮🇳 Sovereign Cloud Platform</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#475569] font-normal">Sub-millisecond Edge</span>
            </div>

            {/* H1: 56px Bold (38px on mobile, 48px on tablet, 56px on desktop) */}
            <h1 className="text-[38px] sm:text-[48px] lg:text-[56px] font-bold text-[#0F172A] leading-[1.12] tracking-tight font-sans">
              India's First Managed <br />
              <span className="text-gradient-blue">Database Platform</span>
            </h1>

            {/* Subheadline: "Managed PostgreSQL at ₹999/month" */}
            <p className="text-xl sm:text-2xl font-semibold text-[#0F172A]">
              Managed PostgreSQL at <span className="text-[#F97316]">₹999/month</span>
            </p>

            {/* Body: 18px, Regular */}
            <p className="text-[18px] text-[#475569] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              High-performance managed database with real-time WebSockets, auto-generated REST & GraphQL APIs, row-level security, and serverless edge functions. Hosted 100% natively in India with full DPDP Act compliance.
            </p>

            {/* CTAs: "Start Free" (blue), "View Demo" (outline) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#pricing"
                onClick={triggerStartFree}
                className="btn-primary-blue w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base cursor-pointer"
              >
                <span>Start Free</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenDemo}
                className="btn-outline w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base cursor-pointer"
              >
                <Play className="w-4 h-4 text-[#1E3A8A] fill-[#1E3A8A]" />
                <span>View Demo</span>
              </button>
            </div>

            {/* Feature Checkpoints */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[#475569]">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No Credit Card Required</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
                <span>DPDP Act 2026 Ready</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-medium text-[#F97316]">
                <Zap className="w-4 h-4" />
                <span>Instant Provisioning</span>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Database Illustration Visual (Col 5) */}
          <div className="lg:col-span-5 relative">
            
            {/* 3D Isometric / Layered Database Cluster Card */}
            <div className="relative rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xl p-6 overflow-hidden">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] font-sans">
                      hind-cluster-primary-01
                    </h3>
                    <p className="text-[11px] text-[#475569] font-mono">PostgreSQL 16.4 • pgvector</p>
                  </div>
                </div>

                <button 
                  onClick={handleRefreshPing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                  title="Click to ping cluster"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{simulatedPing}ms</span>
                </button>
              </div>

              {/* 3D Layered Architecture Visualization */}
              <div className="py-5 space-y-3">
                
                {/* Layer 1: Edge Router & Connection Pooler */}
                <div 
                  onClick={() => setActiveLayer(activeLayer === 'pool' ? 'all' : 'pool')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeLayer === 'pool' || activeLayer === 'all'
                      ? 'bg-blue-50/70 border-blue-200 shadow-sm'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#1E3A8A] text-white">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">Layer 1: Global Edge Routing & PgBouncer</span>
                        <span className="text-[11px] text-[#475569]">Handles 10,000+ pooled connections with zero drop</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1E3A8A]">
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Layer 2: PostgreSQL 16 Core Engine */}
                <div 
                  onClick={() => setActiveLayer(activeLayer === 'pg' ? 'all' : 'pg')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeLayer === 'pg' || activeLayer === 'all'
                      ? 'bg-orange-50/70 border-orange-200 shadow-sm'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#F97316] text-white">
                        <Server className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">Layer 2: Managed PostgreSQL 16 Engine</span>
                        <span className="text-[11px] text-[#475569]">ACID compliance + Row-Level Security (RLS) enabled</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                      ₹999/mo
                    </span>
                  </div>
                </div>

                {/* Layer 3: Real-Time WebSockets & Auto REST APIs */}
                <div 
                  onClick={() => setActiveLayer(activeLayer === 'realtime' ? 'all' : 'realtime')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeLayer === 'realtime' || activeLayer === 'all'
                      ? 'bg-purple-50/70 border-purple-200 shadow-sm'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">Layer 3: Real-Time CDC & Auto APIs</span>
                        <span className="text-[11px] text-[#475569]">Sub-4ms WebSocket sync & instant GraphQL endpoints</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                      LIVE
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Telemetry Bar */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono text-[#475569]">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AES-256 Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-[#1E3A8A]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>{liveQueryCount.toLocaleString('en-IN')} req/min</span>
                </div>
              </div>

            </div>

            {/* Floating Indian Datacenter Badge */}
            <div className="absolute -bottom-4 -right-2 sm:-right-4 p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-lg flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A]">
                  100% Indian Data Centers
                </div>
                <div className="text-[10px] text-[#475569] font-mono">
                  Sovereign Cloud Clusters
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

