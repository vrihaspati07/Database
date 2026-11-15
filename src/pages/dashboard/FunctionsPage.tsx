import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Plus, 
  UploadCloud, 
  Check, 
  Zap, 
  Code2, 
  X,
  FileCode,
  Play,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { dashboardApi, type EdgeFunction } from '../../services/dashboardApi';

export const FunctionsPage: React.FC = () => {
  const [databaseId, setDatabaseId] = useState<string>(() => {
    return dashboardApi.getActiveDbId() || 'default_project';
  });

  const [functions, setFunctions] = useState<EdgeFunction[]>([]);
  const [selectedFn, setSelectedFn] = useState<EdgeFunction | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [deploying, setDeploying] = useState<boolean>(false);
  const [deploySuccess, setDeploySuccess] = useState<boolean>(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  // Test Run State
  const [testMethod, setTestMethod] = useState<string>('POST');
  const [testBody, setTestBody] = useState<string>('{\n  "name": "Hind DB Developer"\n}');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: number;
    data: any;
    consoleLogs: string[];
    durationMs: number;
    timestamp: string;
  } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Logs stream
  const [logs, setLogs] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);

  // New Function Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newFnName, setNewFnName] = useState('');
  const [newFnTrigger, setNewFnTrigger] = useState('HTTP Webhook');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // 1. Initial Load of Database and Functions
  useEffect(() => {
    const activeId = dashboardApi.getActiveDbId();
    if (activeId) {
      setDatabaseId(activeId);
    } else {
      const dbs = dashboardApi.getDatabases();
      if (dbs.length > 0) {
        setDatabaseId(dbs[0].id);
        dashboardApi.setActiveDbId(dbs[0].id);
      }
    }
  }, []);

  const loadFunctions = async (targetDbId: string, selectFnId?: string) => {
    try {
      setLoading(true);
      const fns = await dashboardApi.getEdgeFunctions(targetDbId);
      setFunctions(fns);

      if (fns.length > 0) {
        const toSelect = (selectFnId && fns.find(f => f.id === selectFnId)) || fns[0];
        setSelectedFn(toSelect);
        setCode(toSelect.code);
        loadLogs(targetDbId, toSelect.id);
      } else {
        setSelectedFn(null);
        setCode('');
        setLogs([]);
      }
    } catch (err: any) {
      console.error('[FunctionsPage] Failed to load functions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (targetDbId: string, fnId: string) => {
    try {
      setLogsLoading(true);
      const realLogs = await dashboardApi.getEdgeFunctionLogs(targetDbId, fnId);
      setLogs(realLogs);
    } catch (e) {
      console.warn('Could not load function logs:', e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (databaseId) {
      loadFunctions(databaseId);
    }
  }, [databaseId]);

  const handleSelectFn = (fn: EdgeFunction) => {
    setSelectedFn(fn);
    setCode(fn.code);
    setCompileError(null);
    setTestResult(null);
    setTestError(null);
    loadLogs(databaseId, fn.id);
  };

  // 2. Deploy to Edge (PUT request)
  const handleDeploy = async () => {
    if (!selectedFn) return;
    try {
      setDeploying(true);
      setCompileError(null);
      setDeploySuccess(false);

      const updated = await dashboardApi.deployEdgeFunction(databaseId, selectedFn.id, {
        code,
      });

      setSelectedFn(updated);
      setFunctions(prev => prev.map(f => f.id === updated.id ? updated : f));
      setDeploySuccess(true);
      await loadLogs(databaseId, selectedFn.id);
      setTimeout(() => setDeploySuccess(false), 3500);
    } catch (err: any) {
      setCompileError(err.details || err.message || 'Compilation & Deployment Failed.');
    } finally {
      setDeploying(false);
    }
  };

  // 3. Test Run (POST /:id/functions/:fnId/invoke)
  const handleTestRun = async () => {
    if (!selectedFn) return;
    try {
      setTesting(true);
      setTestError(null);
      setTestResult(null);

      let parsedBody: any = {};
      if (testBody.trim()) {
        try {
          parsedBody = JSON.parse(testBody);
        } catch {
          parsedBody = testBody;
        }
      }

      const res = await dashboardApi.invokeEdgeFunction(databaseId, selectedFn.id, {
        method: testMethod,
        body: parsedBody,
      });

      setTestResult(res);
      // Refresh invocation history logs
      loadLogs(databaseId, selectedFn.id);
    } catch (err: any) {
      setTestError(err.message || 'Execution failed.');
    } finally {
      setTesting(false);
    }
  };

  // 4. Create New Function
  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFnName.trim()) return;

    try {
      setCreating(true);
      setCreateError(null);

      const created = await dashboardApi.createEdgeFunction(databaseId, {
        name: newFnName.trim(),
        trigger_type: newFnTrigger,
      });

      setFunctions(prev => [created, ...prev]);
      setSelectedFn(created);
      setCode(created.code);
      setIsNewModalOpen(false);
      setNewFnName('');
      loadLogs(databaseId, created.id);
    } catch (err: any) {
      setCreateError(err.details || err.message || 'Failed to create function.');
    } finally {
      setCreating(false);
    }
  };

  // 5. Delete Function
  const handleDeleteFn = async (fnId: string, fnName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete function '${fnName}' from the Edge?`)) {
      return;
    }

    try {
      await dashboardApi.deleteEdgeFunction(databaseId, fnId);
      const remaining = functions.filter(f => f.id !== fnId);
      setFunctions(remaining);
      if (remaining.length > 0) {
        handleSelectFn(remaining[0]);
      } else {
        setSelectedFn(null);
        setCode('');
        setLogs([]);
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-[#1E3A8A]" />
            Edge Serverless Functions
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200 font-semibold">
              V8 Engine • Sovereign Node
            </span>
          </h1>
          <p className="text-[#475569] text-sm mt-1">
            Zero-cold-start TypeScript microservices executed on Hind Edge across sovereign distributed nodes with Node permission model sandboxing.
          </p>
        </div>

        <button
          onClick={() => { setCreateError(null); setIsNewModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white hover:bg-[#172554] rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Function</span>
        </button>
      </div>

      {/* Main 3-Column Split: Function List & Editor & Test Run */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Function Cards List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Edge Functions ({functions.length})
            </span>
            <button
              onClick={() => loadFunctions(databaseId, selectedFn?.id)}
              className="text-xs text-[#1E3A8A] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#64748B] space-y-2 bg-white rounded-2xl border border-[#E2E8F0] p-4">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#1E3A8A]" />
              <p className="text-xs">Loading edge functions...</p>
            </div>
          ) : functions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 text-center space-y-2 shadow-xs">
              <FileCode className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <p className="text-xs font-semibold text-[#0F172A]">No functions created yet.</p>
              <p className="text-[11px] text-[#64748B]">Click "New Function" to deploy your first TypeScript edge endpoint.</p>
            </div>
          ) : (
            functions.map((fn) => {
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
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-blue-50 text-[#1E3A8A] shrink-0">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-sm text-[#0F172A] truncate">{fn.name}</h4>
                        <p className="text-xs text-[#64748B] font-mono truncate">/{fn.slug || fn.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFn(fn.id, fn.name);
                      }}
                      className="p-1 text-[#94A3B8] hover:text-red-600 rounded-lg transition-colors ml-1"
                      title="Delete Function"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#F1F5F9] text-xs text-[#64748B]">
                    <div>
                      <span>Calls:</span>
                      <span className="font-semibold text-[#0F172A] ml-1 font-mono">
                        {(fn.invocations || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span>Latency:</span>
                      <span className="font-semibold text-emerald-600 ml-1 font-mono">
                        {fn.avg_latency_ms || 2.4}ms
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (3 cols): Editor, Test Run, and Real Invocation Logs */}
        <div className="lg:col-span-3 space-y-4">
          {/* A. Monaco-Style TypeScript Code Editor Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col">
            {/* Editor Top Bar */}
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#1E3A8A]" />
                <span className="text-xs font-mono font-bold text-[#0F172A]">
                  {selectedFn?.slug || selectedFn?.name || 'function'}.ts
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A] font-semibold border border-blue-200">
                  TypeScript ES2022
                </span>
              </div>

              <div className="flex items-center gap-2">
                {deploySuccess && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> Deployed to Edge
                  </span>
                )}
                <button
                  onClick={handleDeploy}
                  disabled={deploying || !selectedFn}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {deploying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compiling & Deploying...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Deploy to Edge</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Inline Compile Error Banner */}
            {compileError && (
              <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Compilation & Build Diagnostic Errors</span>
                </div>
                <pre className="p-2.5 rounded-lg bg-rose-100/70 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap text-rose-950">
                  {compileError}
                </pre>
              </div>
            )}

            {/* Code Editor */}
            <div className="relative">
              <textarea
                rows={14}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (compileError) setCompileError(null);
                }}
                disabled={!selectedFn}
                placeholder="// Select a function on the left or create one to start coding..."
                className="w-full font-mono text-xs p-5 bg-[#0F172A] text-[#E2E8F0] outline-none resize-none leading-relaxed selection:bg-blue-600 disabled:opacity-50"
                spellCheck={false}
              />
            </div>
          </div>

          {/* B. Test Run Box */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#1E3A8A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Test Run Sandbox
                </h3>
                <span className="text-[10px] text-[#64748B] font-mono">5s Timeout • Empty Env</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] font-semibold outline-none"
                >
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <button
                  onClick={handleTestRun}
                  disabled={testing || !selectedFn}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Input JSON Body */}
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1">
                Request Payload (JSON Body)
              </label>
              <textarea
                rows={3}
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                className="w-full font-mono text-xs p-3 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                placeholder='{ "key": "value" }'
              />
            </div>

            {/* Test Error */}
            {testError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{testError}</span>
              </div>
            )}

            {/* Test Execution Output */}
            {testResult && (
              <div className="p-4 rounded-xl bg-[#0F172A] text-slate-100 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      testResult.status < 400
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {testResult.status} {testResult.status === 200 ? 'OK' : testResult.status === 504 ? 'GATEWAY TIMEOUT' : 'ERROR'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Duration:</span>
                    <span className="text-emerald-400 font-bold">{testResult.durationMs}ms</span>
                  </div>
                </div>

                {/* Response Data */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Response Body:</span>
                  <pre className="p-2.5 rounded-lg bg-slate-900 overflow-x-auto text-emerald-300">
                    {typeof testResult.data === 'object'
                      ? JSON.stringify(testResult.data, null, 2)
                      : String(testResult.data)}
                  </pre>
                </div>

                {/* Console Logs */}
                {testResult.consoleLogs && testResult.consoleLogs.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Captured Console Output:</span>
                    <div className="p-2.5 rounded-lg bg-slate-900 space-y-1 text-slate-300 text-[11px]">
                      {testResult.consoleLogs.map((log, idx) => (
                        <div key={idx} className={log.includes('ERROR') ? 'text-rose-400' : 'text-slate-300'}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* C. Real-time Edge Invocation Logs Panel */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#1E3A8A]" />
                <h4 className="text-xs font-bold text-[#0F172A]">Real-time Invocation History</h4>
                {selectedFn && (
                  <span className="text-[10px] font-mono text-[#64748B]">({selectedFn.name})</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectedFn && loadLogs(databaseId, selectedFn.id)}
                  disabled={logsLoading || !selectedFn}
                  className="text-xs text-[#1E3A8A] hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${logsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Logs</span>
                </button>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Edge Telemetry
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#0F172A] text-slate-300 font-mono text-xs space-y-1 max-h-56 overflow-y-auto">
              {logsLoading ? (
                <div className="py-4 text-center text-slate-500">Refreshing logs...</div>
              ) : logs.length === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  No invocation logs yet. Click "Run Test" or send requests to see live execution history.
                </div>
              ) : (
                logs.map((l, i) => (
                  <div key={i} className={`leading-relaxed ${l.includes('DEPLOY') ? 'text-amber-300' : l.includes('500') || l.includes('504') ? 'text-rose-400' : 'text-slate-300'}`}>
                    {l}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Function Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-[#0F172A] text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                Create Serverless Edge Function
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1.5 text-[#64748B] hover:bg-[#E2E8F0] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Function Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. upi-payment-validator"
                  value={newFnName}
                  onChange={(e) => setNewFnName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
                <p className="text-[11px] text-[#64748B] mt-1">
                  Will be deployed as <code className="text-[#1E3A8A]">/v1/functions/{newFnName.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'name'}</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Trigger Type</label>
                <select
                  value={newFnTrigger}
                  onChange={(e) => setNewFnTrigger(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] outline-none focus:ring-2 focus:ring-[#1E3A8A]"
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
                  disabled={creating}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-xl shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create & Open</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
