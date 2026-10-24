import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';



export const CodeSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'typescript' | 'python' | 'curl'>('typescript');
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(true);

  const codeSnippets = {
    typescript: {
      lang: 'TypeScript / Node.js',
      command: 'npm install @hind/client',
      code: `import { createClient } from '@hind/client';

// Initialize connection to Sovereign cluster
const hind = createClient(
  'https://cluster.hind.io',
  process.env.HIND_API_KEY
);

// 1. Query PostgreSQL with native Row-Level Security
const { data: orders, error } = await hind
  .from('orders')
  .select('id, customer_name, amount_inr, status')
  .eq('status', 'DELIVERED')
  .order('created_at', { ascending: false })
  .limit(3);

// 2. Subscribe to real-time database updates via WebSocket
hind
  .channel('live-orders')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
    console.log('New order received:', payload.new);
  })
  .subscribe();`,
      result: [
        { id: "ord_in_8921", customer_name: "Aarav Sharma", amount_inr: 1499, status: "DELIVERED", latency: "2.1ms" },
        { id: "ord_in_8922", customer_name: "Pooja Iyer", amount_inr: 850, status: "PROCESSING", latency: "2.4ms" },
        { id: "ord_in_8923", customer_name: "Rohan Gupta", amount_inr: 3200, status: "CONFIRMED", latency: "1.9ms" }
      ]
    },
    python: {
      lang: 'Python (FastAPI / Django)',
      command: 'pip install hind-db',
      code: `from hind import AsyncHindClient
import os
import asyncio

async def main():
    # Connect to Sovereign Indian Cluster
    db = AsyncHindClient(
        endpoint="https://cluster.hind.io",
        api_key=os.getenv("HIND_API_KEY")
    )
    
    # Execute query with automated connection pooling
    orders = await db.table("orders").select(
        "id, customer_name, amount_inr, status"
    ).filter("status", "eq", "DELIVERED").limit(3).execute()
    
    print(f"Retrieved {len(orders)} orders via Sovereign edge")

asyncio.run(main())`,
      result: [
        { id: "ord_in_8921", customer_name: "Aarav Sharma", amount_inr: 1499, status: "DELIVERED", latency: "2.1ms" },
        { id: "ord_in_8922", customer_name: "Pooja Iyer", amount_inr: 850, status: "PROCESSING", latency: "2.4ms" },
        { id: "ord_in_8923", customer_name: "Rohan Gupta", amount_inr: 3200, status: "CONFIRMED", latency: "1.9ms" }
      ]
    },
    curl: {
      lang: 'cURL / REST API',
      command: 'curl -X GET "https://cluster.hind.io/rest/v1/orders"',
      code: `curl -X GET "https://cluster.hind.io/rest/v1/orders?select=id,customer_name,amount_inr,status&status=eq.DELIVERED&limit=3" \\
  -H "apikey: hind_live_key_9941a8" \\
  -H "Authorization: Bearer hind_live_key_9941a8" \\
  -H "Content-Type: application/json"`,
      result: [
        { id: "ord_in_8921", customer_name: "Aarav Sharma", amount_inr: 1499, status: "DELIVERED", latency: "2.1ms" },
        { id: "ord_in_8922", customer_name: "Pooja Iyer", amount_inr: 850, status: "PROCESSING", latency: "2.4ms" },
        { id: "ord_in_8923", customer_name: "Rohan Gupta", amount_inr: 3200, status: "CONFIRMED", latency: "1.9ms" }
      ]
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code-section" className="py-20 lg:py-28 bg-[#F8FAFC] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-xs font-semibold text-[#1E3A8A] mb-4 uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5 text-[#F97316]" />
            <span>DEVELOPER EXPERIENCE</span>
          </div>
          
          <h2 className="text-[30px] sm:text-[36px] lg:text-[40px] font-semibold text-[#0F172A] tracking-tight font-sans">
            Add database to your app in minutes
          </h2>
          
          <p className="mt-4 text-[18px] text-[#475569] leading-relaxed">
            Connect in 3 lines of code with our official client libraries, standard PostgreSQL drivers, or auto-generated REST & GraphQL endpoints.
          </p>
        </div>

        {/* Code Showcase Panel */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
          
          {/* Top Bar: Tabs & Copy Button */}
          <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-[#0B132B] border-b border-slate-800 gap-4">
            
            {/* Language Tabs: TypeScript, Python, cURL */}
            <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('typescript')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  activeTab === 'typescript'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TypeScript
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  activeTab === 'python'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  activeTab === 'curl'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL
              </button>
            </div>

            {/* Right: Quick install command & Copy Button */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-[#F97316]" />
                <span>{codeSnippets[activeTab].command}</span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-white transition-colors cursor-pointer border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

          </div>

          {/* Syntax Highlighted Code Area */}
          <div className="p-6 sm:p-8 bg-[#090E1F] overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed selection:bg-blue-600/30">
            <pre className="text-slate-200">
              <code>{codeSnippets[activeTab].code}</code>
            </pre>
          </div>

          {/* Result Output Preview Toggle */}
          <div className="px-6 py-3 bg-[#0B132B] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResult(!showResult)}
                className="flex items-center gap-1.5 text-emerald-400 hover:underline cursor-pointer font-semibold"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{showResult ? 'Hide Response Preview' : 'Show Live Response'}</span>
              </button>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Execution time: ~2.1ms</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>RLS Enforced</span>
            </div>
          </div>

          {/* Live JSON Response Preview */}
          {showResult && (
            <div className="p-5 bg-[#060A17] border-t border-slate-800/80 font-mono text-xs overflow-x-auto">
              <div className="text-slate-400 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>HTTP 200 OK — JSON Response:</span>
              </div>
              <pre className="text-emerald-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <code>{JSON.stringify(codeSnippets[activeTab].result, null, 2)}</code>
              </pre>
            </div>
          )}

        </div>

        {/* Feature Badges below code */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
          <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold text-[#0F172A] block mb-1">Standard Postgres Driver</span>
            <span className="text-xs text-[#475569]">Works seamlessly with Prisma, Drizzle, TypeORM & DBeaver</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold text-[#0F172A] block mb-1">Sub-4ms Indian WebSockets</span>
            <span className="text-xs text-[#475569]">Zero infrastructure setup for live subscriptions & change data capture</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold text-[#0F172A] block mb-1">Type-Safe Autocomplete</span>
            <span className="text-xs text-[#475569]">Auto-generated TypeScript types matching your exact schema</span>
          </div>
        </div>

      </div>
    </section>
  );
};
