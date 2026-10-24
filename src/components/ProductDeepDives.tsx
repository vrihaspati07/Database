import React from 'react';
import { 
  Database, 
  Radio, 
  ShieldCheck, 
  Check, 
  Terminal, 
  Zap, 
  Lock, 
  Globe,
  Plus
} from 'lucide-react';

export const ProductDeepDives: React.FC = () => {
  return (
    <section className="py-24 sm:py-36 lg:py-44 relative overflow-hidden bg-[#FFFFFF] border-b border-[#E5E5E5]">
      <div className="w-[88%] lg:w-[83%] max-w-[1280px] mx-auto space-y-32 sm:space-y-44">

        {/* Deep Dive 1: Managed PostgreSQL & pgvector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text Left */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pastel Tint Badge: Indigo */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-mono font-semibold text-blue-700 tracking-wider uppercase">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>CORE DATABASE ENGINE</span>
            </div>

            {/* Section H2 in warm editorial serif display font (28px -> 36px) */}
            <h2 className="text-[28px] sm:text-[34px] lg:text-[36px] font-serif font-semibold tracking-[-0.02em] text-[#1a1a1a] leading-[1.15]">
              Enterprise PostgreSQL 16 <br />
              <span className="text-gradient-orange italic font-normal">with Zero Configuration</span>
            </h2>

            {/* Sub-heading / Tagline under H2 (18px -> 20px) */}
            <p className="text-lg sm:text-xl font-medium text-[#1a1a1a] font-sans leading-relaxed">
              Standard connection string with automated connection pooling and pgvector AI embeddings.
            </p>

            {/* Body text (16px -> 18-20px) */}
            <p className="text-base sm:text-lg text-[#4a4a4a] leading-relaxed font-sans">
              Every Hind DB project provisions a dedicated, fully managed PostgreSQL database with built-in pgvector extension, connection pooling via PgBouncer, and daily automated encrypted backups stored strictly on Indian soil.
            </p>

            <div className="space-y-3.5 pt-2 text-sm sm:text-base text-[#4a4a4a] font-sans">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-orange-500/15 text-orange-600 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-[#1a1a1a]">Direct SQL Access:</strong> Connect using Prisma, Drizzle, psql, SQLAlchemy, or native drivers.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-orange-500/15 text-orange-600 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-[#1a1a1a]">pgvector for AI:</strong> Store and query vector embeddings for semantic search and LLMs directly in SQL.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-orange-500/15 text-orange-600 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-[#1a1a1a]">Automated Scaling:</strong> Read replicas and dynamic compute scaling that grows with your user base.</span>
              </div>
            </div>
          </div>

          {/* Contrasting Code Block Accent Card with Corner Markers */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-[28px] bg-[#0B132B] border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs relative text-slate-100">
              <Plus className="w-3.5 h-3.5 text-slate-600 absolute top-3 left-3 pointer-events-none" />
              <Plus className="w-3.5 h-3.5 text-slate-600 absolute top-3 right-3 pointer-events-none" />

              <div className="flex items-center justify-between px-5 py-3.5 bg-[#060A17] border-b border-slate-800 text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-semibold text-[12px]">schema.sql</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  PostgreSQL 16.4
                </span>
              </div>

              <div className="p-6 text-slate-300 space-y-2.5 overflow-x-auto leading-relaxed">
                <p className="text-slate-500">-- Enable vector embeddings & full-text search</p>
                <p><span className="text-purple-400">CREATE EXTENSION IF NOT EXISTS</span> <span className="text-orange-300">vector</span>;</p>
                <p className="pt-2"><span className="text-purple-400">CREATE TABLE</span> <span className="text-blue-400">products</span> (</p>
                <p className="pl-4">id <span className="text-amber-400">UUID PRIMARY KEY DEFAULT</span> gen_random_uuid(),</p>
                <p className="pl-4">title <span className="text-amber-400">TEXT NOT NULL</span>,</p>
                <p className="pl-4">price_inr <span className="text-amber-400">NUMERIC(10,2) NOT NULL</span>,</p>
                <p className="pl-4">embedding <span className="text-amber-400">vector(1536)</span>,</p>
                <p className="pl-4">created_at <span className="text-amber-400">TIMESTAMPTZ DEFAULT</span> now()</p>
                <p>);</p>
                <p className="pt-2 text-slate-500">-- Enable secure Row-Level Security</p>
                <p><span className="text-purple-400">ALTER TABLE</span> <span className="text-blue-400">products</span> <span className="text-purple-400">ENABLE ROW LEVEL SECURITY</span>;</p>
              </div>
            </div>
          </div>

        </div>


        {/* Deep Dive 2: Sub-4ms Real-Time WebSockets CDC (Alternating Side-by-Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Visual Left - White Card with thin border & shadow */}
          <div className="lg:col-span-6 order-2 lg:order-1 relative">
            <div className="rounded-[28px] bg-white border border-[#E5E5E5] shadow-lg p-6 font-mono text-xs space-y-4 relative">
              <Plus className="w-3.5 h-3.5 text-slate-400 absolute top-3 left-3 pointer-events-none" />
              <Plus className="w-3.5 h-3.5 text-slate-400 absolute top-3 right-3 pointer-events-none" />

              <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5] text-[#6b6b6b]">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="text-[#1a1a1a] font-semibold text-[12px]">Real-Time Event Stream</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  Latency: 2.4ms (Primary Edge)
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5E5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-orange-600 uppercase font-bold block">ORDER_CREATED</span>
                    <span className="text-[#1a1a1a] font-sans font-medium text-xs">order_id: #ORD-9821 (₹2,499)</span>
                  </div>
                  <span className="text-[10px] text-[#6b6b6b]">12ms ago</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5E5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">UPI_PAYMENT_SUCCESS</span>
                    <span className="text-[#1a1a1a] font-sans font-medium text-xs">txn_ref: pay_29a0f9b18</span>
                  </div>
                  <span className="text-[10px] text-[#6b6b6b]">Just now</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5E5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-700 uppercase font-bold block">DELIVERY_LOCATION_PING</span>
                    <span className="text-[#1a1a1a] font-sans font-medium text-xs">lat: 19.0760, lng: 72.8777</span>
                  </div>
                  <span className="text-[10px] text-[#6b6b6b]">Realtime</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            {/* Pastel Tint Badge: Emerald */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono font-semibold text-emerald-700 tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>REAL-TIME CDC ENGINE</span>
            </div>

            {/* Section H2 */}
            <h2 className="text-[28px] sm:text-[34px] lg:text-[36px] font-serif font-semibold tracking-[-0.02em] text-[#1a1a1a] leading-[1.15]">
              Sub-4ms Live Sync <br />
              <span className="text-gradient-orange italic font-normal">via WebSockets & CDC</span>
            </h2>

            {/* Sub-heading */}
            <p className="text-lg sm:text-xl font-medium text-[#1a1a1a] font-sans leading-relaxed">
              Listen to database row changes instantly in your React, Flutter, or Node apps.
            </p>

            {/* Body text */}
            <p className="text-base sm:text-lg text-[#4a4a4a] leading-relaxed font-sans">
              Our low-latency sovereign edge nodes stream database change data capture (CDC) directly to connected clients without heavy polling, slashing server compute by up to 90%.
            </p>

            <div className="space-y-3.5 pt-2 text-sm sm:text-base text-[#4a4a4a] font-sans">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-orange-500/15 text-orange-600 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-[#1a1a1a]">Zero Polling Overhead:</strong> Event-driven architecture pushes data instantly to clients.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-orange-500/15 text-orange-600 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-[#1a1a1a]">Presence & State Sync:</strong> Multi-user live cursors, typing indicators, and online status channels.</span>
              </div>
            </div>
          </div>

        </div>


        {/* Deep Dive 3: Sovereign Indian Infrastructure & Commerce */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text Left */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pastel Tint Badge: Orange */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-xs font-mono font-semibold text-orange-600 tracking-wider uppercase">
              <Globe className="w-3.5 h-3.5 text-orange-500" />
              <span>DATA SOVEREIGNTY & COMMERCE</span>
            </div>

            {/* Section H2 */}
            <h2 className="text-[28px] sm:text-[34px] lg:text-[36px] font-serif font-semibold tracking-[-0.02em] text-[#1a1a1a] leading-[1.15]">
              Sovereign Indian Data Residency <br />
              <span className="text-gradient-orange italic font-normal">& Native UPI Integrations</span>
            </h2>

            {/* Sub-heading */}
            <p className="text-lg sm:text-xl font-medium text-[#1a1a1a] font-sans leading-relaxed">
              100% compliance with India's DPDP Act 2026 regulations with zero offshore data transfers.
            </p>

            {/* Body text */}
            <p className="text-base sm:text-lg text-[#4a4a4a] leading-relaxed font-sans">
              Keep user data strictly inside Indian borders. Eliminate third-party integration friction with native plug-and-play modules for UPI QR codes, Razorpay webhooks, and WhatsApp OTP verification.
            </p>

            <div className="space-y-3.5 pt-2 text-sm sm:text-base text-[#4a4a4a] font-sans">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-orange-500/15 text-orange-600 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-[#1a1a1a]">DPDP Act 2026 Ready:</strong> All user records, databases, and object files stored strictly in sovereign Indian cloud facilities.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-orange-500/15 text-orange-600 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span><strong className="text-[#1a1a1a]">Native UPI & WhatsApp:</strong> Verify users via WhatsApp OTP and accept UPI payments with 0 setup hassle.</span>
              </div>
            </div>
          </div>

          {/* Feature Badge Cards Right: Clean White cards with subtle borders */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm relative">
              <Plus className="w-3 h-3 text-slate-300 absolute top-2.5 right-2.5" />
              <span className="text-orange-600 font-bold block mb-1">SOVEREIGN EDGE</span>
              <span className="text-2xl font-bold text-[#1a1a1a] font-sans">20ms - 40ms</span>
              <p className="text-[#6b6b6b] text-xs mt-2 font-sans">Ultra-low latency across all Indian cities.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm relative">
              <Plus className="w-3 h-3 text-slate-300 absolute top-2.5 right-2.5" />
              <span className="text-emerald-700 font-bold block mb-1">LOCAL COMPLIANCE</span>
              <span className="text-2xl font-bold text-[#1a1a1a] font-sans">100% India</span>
              <p className="text-[#6b6b6b] text-xs mt-2 font-sans">Strict sovereign cloud data residency.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm relative">
              <Plus className="w-3 h-3 text-slate-300 absolute top-2.5 right-2.5" />
              <span className="text-blue-700 font-bold block mb-1">INR BILLING</span>
              <span className="text-2xl font-bold text-[#1a1a1a] font-sans">₹999 / mo</span>
              <p className="text-[#6b6b6b] text-xs mt-2 font-sans">UPI, RuPay & NetBanking with GST invoices.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm relative">
              <Plus className="w-3 h-3 text-slate-300 absolute top-2.5 right-2.5" />
              <span className="text-purple-700 font-bold block mb-1">DEVELOPER FIRST</span>
              <span className="text-2xl font-bold text-[#1a1a1a] font-sans">Auto REST</span>
              <p className="text-[#6b6b6b] text-xs mt-2 font-sans">OpenAPI Swagger REST & GraphQL generated in real time.</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
