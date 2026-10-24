import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Clock, 
  Database, 
  Terminal, 
  CheckCircle2, 
  Code, 
  Cpu,
  Table as TableIcon
} from 'lucide-react';

interface QueryPreset {
  id: string;
  name: string;
  category: 'Vector' | 'SQL' | 'KeyValue' | 'Analytics';
  description: string;
  query: string;
  latencyMs: number;
  rows: Array<Record<string, any>>;
  plan: string[];
}

export const Playground: React.FC = () => {
  const presets: QueryPreset[] = [
    {
      id: 'vector-hybrid',
      name: 'Hybrid Vector & Relational Query',
      category: 'Vector',
      description: 'Finds semantic nearest embeddings filtered by tenant and minimum customer loyalty score.',
      query: `SELECT 
    doc_id, 
    title, 
    author, 
    COSINE_SIMILARITY(embedding, VECTOR([0.18, 0.49, 0.88, ...])) AS score 
FROM documents 
WHERE tenant_id = 'acme_corp' 
  AND status = 'PUBLISHED' 
ORDER BY score DESC 
LIMIT 4;`,
      latencyMs: 0.38,
      rows: [
        { doc_id: 'doc_901', title: 'High-Throughput Raft Paper v2.1', author: 'Dr. V. Chaubey', score: '0.9842', status: 'PUBLISHED' },
        { doc_id: 'doc_442', title: 'NVMe Zero-Copy Architecture Spec', author: 'Distributed Systems Team', score: '0.9517', status: 'PUBLISHED' },
        { doc_id: 'doc_118', title: 'SIMD HNSW Optimization in Rust', author: 'Performance Core', score: '0.9280', status: 'PUBLISHED' },
        { doc_id: 'doc_763', title: 'Cross-Datacenter Replication CRDTs', author: 'Cloud Infra', score: '0.8941', status: 'PUBLISHED' },
      ],
      plan: [
        '1. HNSW Index Scan on `documents.embedding` (SIMD AVX-512)',
        '2. Filter evaluated in-memory on `tenant_id` & `status`',
        '3. Top-K Heap Selection (k=4)',
        '4. Output projection emitted in 0.38ms'
      ]
    },
    {
      id: 'acid-tx',
      name: 'Distributed ACID Multi-Shard Transfer',
      category: 'SQL',
      description: 'Performs multi-partition atomic ledger transfer with strict serializability.',
      query: `BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
UPDATE accounts SET balance = balance - 5000 WHERE id = 'acc_usr_99';
UPDATE accounts SET balance = balance + 5000 WHERE id = 'acc_merchant_41';
INSERT INTO audit_ledger (from_acc, to_acc, amount, state) 
VALUES ('acc_usr_99', 'acc_merchant_41', 5000, 'COMMITTED');
COMMIT;`,
      latencyMs: 0.62,
      rows: [
        { transaction_id: 'tx_vriha_9941a8', status: 'COMMITTED', isolation: 'STRICT_SERIALIZABLE', shards_involved: '3 (us-east-1, eu-central-1)', commit_epoch: '184920491' },
      ],
      plan: [
        '1. Multi-Raft Leader Quorum Consensus acquired across 3 shards',
        '2. Hybrid Logical Clock (HLC) timestamp assigned',
        '3. Write-Ahead-Log (WAL) flushed via Direct NVMe I/O',
        '4. Commit acknowledged without cross-region roundtrip locking'
      ]
    },
    {
      id: 'kv-cache',
      name: 'Ultra-Fast Point Lookup (Key-Value)',
      category: 'KeyValue',
      description: 'Fetches cached user session data directly from in-memory arena buffer.',
      query: `VRIHA.GET session:usr_live_884920
WITH OPTIONS (consistency = 'EVENTUAL', bypass_cache = false);`,
      latencyMs: 0.14,
      rows: [
        { key: 'session:usr_live_884920', user_id: 'usr_884920', role: 'ADMIN', last_active: '2026-09-27T18:24:00Z', ttl_remaining: '84200s' }
      ],
      plan: [
        '1. Hash Ring direct node lookup (O(1))',
        '2. Zero-Copy Arena memory buffer hit (Cache Ratio: 99.8%)',
        '3. Deserialized via FlatBuffers protocol'
      ]
    },
    {
      id: 'realtime-analytics',
      name: 'Streaming Timeseries Aggregation',
      category: 'Analytics',
      description: 'Aggregates 10 million telemetry events with SIMD vectorized columnar scan.',
      query: `SELECT 
    TIME_BUCKET('1 minute', timestamp) AS window_time,
    region,
    COUNT(*) AS total_requests,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) AS p99_latency
FROM api_metrics_stream
WHERE timestamp >= NOW() - INTERVAL '15 minutes'
GROUP BY window_time, region
ORDER BY window_time DESC;`,
      latencyMs: 1.12,
      rows: [
        { window_time: '18:25:00', region: 'us-east', total_requests: '3,849,200', p99_latency: '0.41ms' },
        { window_time: '18:24:00', region: 'us-east', total_requests: '4,102,950', p99_latency: '0.39ms' },
        { window_time: '18:25:00', region: 'eu-central', total_requests: '2,950,110', p99_latency: '0.44ms' },
        { window_time: '18:24:00', region: 'eu-central', total_requests: '2,890,400', p99_latency: '0.42ms' },
      ],
      plan: [
        '1. Columnar Chunk Pruning (Skipped 82% unneeded blocks)',
        '2. SIMD Vectorized Sum & Percentile reduction across 32 cores',
        '3. Distributed Aggregation tree merged at coordinator node'
      ]
    }
  ];

  const [selectedPreset, setSelectedPreset] = useState<QueryPreset>(presets[0]);
  const [customQuery, setCustomQuery] = useState<string>(presets[0].query);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'table' | 'json' | 'plan'>('table');
  const [executionStats, setExecutionStats] = useState({
    latency: presets[0].latencyMs,
    rowsScanned: '2,400,000',
    memoryUsed: '1.2 MB',
    cacheHit: '99.4%'
  });

  const handleSelectPreset = (preset: QueryPreset) => {
    setSelectedPreset(preset);
    setCustomQuery(preset.query);
    setExecutionStats({
      latency: preset.latencyMs,
      rowsScanned: preset.category === 'Analytics' ? '10,000,000' : preset.category === 'Vector' ? '850,000' : '1',
      memoryUsed: preset.category === 'Analytics' ? '4.8 MB' : '0.4 MB',
      cacheHit: preset.category === 'KeyValue' ? '100%' : '98.9%'
    });
  };

  const handleRunQuery = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      const variance = (Math.random() * 0.08 - 0.04);
      setExecutionStats(prev => ({
        ...prev,
        latency: Math.max(0.12, +(selectedPreset.latencyMs + variance).toFixed(2))
      }));
    }, 280);
  };

  return (
    <section id="playground" className="py-24 relative overflow-hidden bg-[#070b16]">
      {/* Glow Effects */}
      <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-blue-900/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-xs font-semibold text-blue-400 mb-4 font-mono">
            <Terminal className="w-3.5 h-3.5 text-orange-400" />
            <span>INTERACTIVE ENGINE PLAYGROUND</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
            Try the Engine in <span className="text-gradient-orange">Real Time</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Experience sub-millisecond query latency directly in your browser. Choose an execution workload below or execute native SQL queries against the VrihaDB sandbox cluster.
          </p>
        </div>

        {/* Preset Query Workload Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-4 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
                selectedPreset.id === preset.id
                  ? 'bg-slate-900/90 border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/40'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                  preset.category === 'Vector' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  preset.category === 'SQL' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  preset.category === 'KeyValue' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {preset.category}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  ~{preset.latencyMs}ms
                </span>
              </div>
              <div className="text-sm font-semibold text-white mb-1 line-clamp-1">
                {preset.name}
              </div>
              <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </div>
            </button>
          ))}
        </div>

        {/* Interactive Query Sandbox Window */}
        <div className="rounded-2xl bg-[#090f20] border border-slate-800/90 shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Top Bar with Run Button & Metrics */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-[#060a16] border-b border-slate-800 gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-mono font-medium text-slate-300">
                sandbox_cluster::node-01 [vrihadb-3.2]
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Telemetry badges */}
              <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <span>Latency: <strong className="text-orange-400 font-bold">{executionStats.latency}ms</strong></span>
                <span className="text-slate-700">|</span>
                <span>Scanned: <span className="text-slate-200">{executionStats.rowsScanned}</span></span>
                <span className="text-slate-700">|</span>
                <span>Buffer Hit: <span className="text-emerald-400">{executionStats.cacheHit}</span></span>
              </div>

              {/* Run Query Button */}
              <button
                onClick={handleRunQuery}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-semibold shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>
          </div>

          {/* Query Editor Area */}
          <div className="p-4 sm:p-5 bg-[#080d1a] border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">SQL & VECTOR DIALECT</span>
              <button
                onClick={() => setCustomQuery(selectedPreset.query)}
                className="text-xs font-mono text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Query
              </button>
            </div>
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              rows={4}
              className="w-full bg-[#050811] text-orange-200/90 font-mono text-xs sm:text-sm p-4 rounded-xl border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none leading-relaxed selection:bg-orange-500/30"
              spellCheck={false}
            />
          </div>

          {/* Results Header View Switcher */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-[#060a16] border-b border-slate-800/80">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveView('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                  activeView === 'table'
                    ? 'bg-blue-900/60 text-orange-400 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TableIcon className="w-3 h-3" />
                <span>Table View ({selectedPreset.rows.length})</span>
              </button>

              <button
                onClick={() => setActiveView('json')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                  activeView === 'json'
                    ? 'bg-blue-900/60 text-orange-400 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Raw JSON</span>
              </button>

              <button
                onClick={() => setActiveView('plan')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                  activeView === 'plan'
                    ? 'bg-blue-900/60 text-orange-400 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>Execution Plan</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Query OK in {executionStats.latency}ms</span>
            </span>
          </div>

          {/* Results Content */}
          <div className="p-4 sm:p-6 bg-[#070b16] min-h-[190px]">
            {activeView === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/40">
                      {Object.keys(selectedPreset.rows[0] || {}).map((col) => (
                        <th key={col} className="py-2.5 px-3 uppercase tracking-wider font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {selectedPreset.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        {Object.values(row).map((val: any, valIdx) => (
                          <td key={valIdx} className="py-2.5 px-3 text-slate-200">
                            {typeof val === 'string' && val.startsWith('0.') ? (
                              <span className="text-orange-400 font-semibold">{val}</span>
                            ) : val === 'COMMITTED' || val === 'PUBLISHED' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                                {val}
                              </span>
                            ) : (
                              val
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeView === 'json' && (
              <pre className="text-xs font-mono text-orange-300/90 bg-[#050811] p-4 rounded-xl overflow-x-auto border border-slate-800">
                <code>{JSON.stringify(selectedPreset.rows, null, 2)}</code>
              </pre>
            )}

            {activeView === 'plan' && (
              <div className="space-y-2 font-mono text-xs">
                {selectedPreset.plan.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
