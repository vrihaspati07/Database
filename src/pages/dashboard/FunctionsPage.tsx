import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Plus, 
  UploadCloud, 
  Check, 
  Zap, 
  Code2, 
  X,
  FileCode
} from 'lucide-react';
import { dashboardApi, type EdgeFunction } from '../../services/dashboardApi';

export const FunctionsPage: React.FC = () => {
  const [functions, setFunctions] = useState<EdgeFunction[]>([]);
  const [selectedFn, setSelectedFn] = useState<EdgeFunction | null>(null);
  const [code, setCode] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newFnName, setNewFnName] = useState('');
  const [newFnTrigger, setNewFnTrigger] = useState('HTTP Webhook');

  // Logs stream
  const [logs, setLogs] = useState<string[]>([
    '[2026-09-29 18:30:10.451] INFO: Edge Function worker boot initialized (Region: Mumbai ap-south-1)',
    '[2026-09-29 18:30:10.480] INFO: Runtime V8 Isolate initialized in 1.4ms',
    '[2026-09-29 18:31:02.100] HTTP POST /v1/functions/razorpay-webhook - 200 OK (2.8ms)',
    '[2026-09-29 18:34:15.912] HTTP POST /v1/functions/razorpay-webhook - 200 OK (2.4ms)',
  ]);

  useEffect(() => {
    const fns = dashboardApi.getFunctions();
    setFunctions(fns);
    if (fns.length > 0) {
      setSelectedFn(fns[0]);
      setCode(fns[0].code);
    }
  }, []);

  const handleSelectFn = (fn: EdgeFunction) => {
    setSelectedFn(fn);
    setCode(fn.code);
  };

  const handleDeploy = () => {
    if (!selectedFn) return;
    setDeploying(true);
    setTimeout(() => {
      dashboardApi.saveFunctionCode(selectedFn.id, code);
      setDeploying(false);
      setDeploySuccess(true);
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 23);
      setLogs((prev) => [
        `[${timestamp}] DEPLOY: Function '${selectedFn.slug}' compiled & distributed to 3 Edge PoPs in 180ms`,
        ...prev,
      ]);
      setTimeout(() => setDeploySuccess(false), 3000);
    }, 600);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFnName.trim()) return;

    const initialCode = `import { serve } from '@hind/functions';

serve(async (req) => {
  const { name } = await req.json().catch(() => ({ name: 'India' }));
  return new Response(JSON.stringify({ message: \`Hello from Hind DB Serverless, \${name}!\` }), {
    headers: { 'Content-Type': 'application/json' },
  });
});`;

    const newFn = dashboardApi.createFunction(newFnName.trim(), initialCode, newFnTrigger);
    const updated = dashboardApi.getFunctions();
    setFunctions(updated);
    setSelectedFn(newFn);
    setCode(newFn.code);
    setIsNewModalOpen(false);
    setNewFnName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-[#1E3A8A]" />
            Edge Serverless Functions
          </h1>
          <p className="text-[#475569] text-sm mt-1">
            Zero-cold-start TypeScript microservices executed on Hind Edge across Mumbai, Delhi, and Bangalore.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white hover:bg-[#172554] rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Function</span>
        </button>
      </div>

      {/* Main 2-Column Split: Function List & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Function Cards List */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Deployed Functions ({functions.length})
          </span>

          {functions.map((fn) => {
            const isSelected = selectedFn?.id === fn.id;
            return (
              <div
                key={fn.id}
                onClick={() => handleSelectFn(fn)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-[#1E3A8A] shadow-md ring-2 ring-[#1E3A8A]/10'
                    : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 text-[#1E3A8A]">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">{fn.name}</h4>
                      <p className="text-xs text-[#64748B] font-mono">{fn.runtime}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {fn.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#F1F5F9] text-xs text-[#64748B]">
                  <div>
                    <span>Invocations:</span>
                    <span className="font-semibold text-[#0F172A] ml-1 font-mono">{fn.invocations.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>Latency:</span>
                    <span className="font-semibold text-emerald-600 ml-1 font-mono">{fn.avg_latency_ms}ms</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: In-Browser Code Editor & Terminal */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col">
            {/* Editor Top Bar */}
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#1E3A8A]" />
                <span className="text-xs font-mono font-bold text-[#0F172A]">
                  {selectedFn?.name || 'function'}.ts
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A] font-semibold">
                  TypeScript 5.3
                </span>
              </div>

              <div className="flex items-center gap-2">
                {deploySuccess && (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> Deployed
                  </span>
                )}
                <button
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{deploying ? 'Building & Deploying...' : 'Deploy to Edge'}</span>
                </button>
              </div>
            </div>

            {/* Monaco-Style Code Editor */}
            <div className="relative">
              <textarea
                rows={14}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full font-mono text-xs p-5 bg-[#0F172A] text-[#E2E8F0] outline-none resize-none leading-relaxed selection:bg-blue-600"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Real-time Edge Logs Stream */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#1E3A8A]" />
                <h4 className="text-xs font-bold text-[#0F172A]">Live Real-time Invocation Logs</h4>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Listening to Mumbai Edge Stream
              </span>
            </div>

            <div className="p-4 bg-[#0F172A] text-slate-300 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
              {logs.map((l, i) => (
                <div key={i} className="leading-relaxed">
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Function Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-[#0F172A] text-base">Create Serverless Edge Function</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1.5 text-[#64748B] hover:bg-[#E2E8F0] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Function Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. upi-payment-validator"
                  value={newFnName}
                  onChange={(e) => setNewFnName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Trigger Type</label>
                <select
                  value={newFnTrigger}
                  onChange={(e) => setNewFnTrigger(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none"
                >
                  <option value="HTTP Webhook">HTTP Webhook (REST API Endpoint)</option>
                  <option value="Database Webhook">Database Webhook (On PostgreSQL Change)</option>
                  <option value="Cron Schedule">Cron Schedule (Periodic Job)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#475569] border border-[#CBD5E1] rounded-xl hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-xl shadow-xs"
                >
                  Create & Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
