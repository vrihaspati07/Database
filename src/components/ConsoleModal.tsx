import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Server
} from 'lucide-react';

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsoleModal: React.FC<ConsoleModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'logs' | 'metrics'>('nodes');
  const [queryInput, setQueryInput] = useState('SHOW CLUSTER STATUS;');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Connected to VrihaDB Cloud Gateway v3.2-enterprise',
    'Raft Quorum: 5/5 healthy nodes (us-east-1, us-west-2, eu-central-1, ap-southeast-1, sa-east-1)',
    'Type standard SQL or VRIHA commands. Enter "HELP;" for documentation.'
  ]);

  if (!isOpen) return null;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    const cmd = queryInput.trim();
    let res = '';

    if (cmd.toUpperCase().includes('SHOW CLUSTER')) {
      res = `OK - 5 nodes online | 0 lag | Active Raft Leader: node-us-east-1a (HLC: 184920.4901)`;
    } else if (cmd.toUpperCase().includes('SELECT') || cmd.toUpperCase().includes('VECTOR')) {
      res = `Executed in 0.28ms | 4 tuples returned | 0 lock waits`;
    } else if (cmd.toUpperCase() === 'HELP' || cmd.toUpperCase() === 'HELP;') {
      res = `Available Commands: SHOW CLUSTER STATUS, SELECT * FROM tables, VRIHA.GET [key], VECTOR.SEARCH [table] [dim]`;
    } else {
      res = `Command '${cmd}' acknowledged by Raft Leader in 0.31ms.`;
    }

    setTerminalOutput(prev => [...prev, `$ ${cmd}`, res]);
    setQueryInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#090f20] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#060a16] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <span>VrihaDB Cloud Console</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  LIVE CLUSTER
                </span>
              </h3>
              <p className="text-[11px] font-mono text-slate-400">cluster-prod-01.vrihadb.io:5432</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close console"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center px-6 bg-[#070c1a] border-b border-slate-800 gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`py-3 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'nodes' ? 'text-orange-400 border-orange-500' : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Cluster Topology (5 Nodes)
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'logs' ? 'text-orange-400 border-orange-500' : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Interactive Terminal
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'metrics' ? 'text-orange-400 border-orange-500' : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Live Hardware Stats
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'nodes' && (
            <div className="space-y-3">
              {[
                { name: 'node-us-east-1a', role: 'Raft Leader', qps: '482k', latency: '0.28ms', cpu: '28%', status: 'HEALTHY' },
                { name: 'node-us-west-2b', role: 'Follower', qps: '390k', latency: '0.34ms', cpu: '22%', status: 'HEALTHY' },
                { name: 'node-eu-central-1a', role: 'Follower', qps: '410k', latency: '0.31ms', cpu: '26%', status: 'HEALTHY' },
                { name: 'node-ap-southeast-1', role: 'Follower', qps: '310k', latency: '0.39ms', cpu: '19%', status: 'HEALTHY' },
                { name: 'node-sa-east-1', role: 'Follower', qps: '250k', latency: '0.42ms', cpu: '18%', status: 'HEALTHY' },
              ].map((node, i) => (
                <div key={i} className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-white font-semibold flex items-center gap-2">
                        <span>{node.name}</span>
                        {node.role === 'Raft Leader' && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                            LEADER
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px]">{node.role} • Multi-Raft Partition 0-255</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-300">
                    <span>QPS: <strong className="text-orange-400">{node.qps}</strong></span>
                    <span>P99: <strong className="text-blue-400">{node.latency}</strong></span>
                    <span>CPU: <strong className="text-slate-200">{node.cpu}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      {node.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="flex flex-col h-full space-y-4">
              <div className="p-4 rounded-xl bg-[#050811] border border-slate-800 text-slate-300 min-h-[220px] max-h-[280px] overflow-y-auto space-y-1.5">
                {terminalOutput.map((line, idx) => (
                  <div key={idx} className={line.startsWith('$') ? 'text-orange-400 font-bold' : line.startsWith('OK') ? 'text-emerald-400' : 'text-slate-300'}>
                    {line}
                  </div>
                ))}
              </div>

              <form onSubmit={handleExecute} className="flex items-center gap-2">
                <span className="text-orange-400 font-bold text-sm">$</span>
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Enter command (e.g. SHOW CLUSTER STATUS;)"
                  className="flex-1 bg-[#050811] text-white p-2.5 rounded-xl border border-slate-800 focus:border-orange-500 outline-none text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-xs hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  Execute
                </button>
              </form>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Global Active QPS</div>
                <div className="text-xl font-bold text-white">1,842,910</div>
                <div className="text-[10px] text-emerald-400 mt-1">▲ +12% vs last hour</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">P99 Read Latency</div>
                <div className="text-xl font-bold text-orange-400">0.34ms</div>
                <div className="text-[10px] text-slate-400 mt-1">SIMD Cache Pass</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Direct NVMe IOPS</div>
                <div className="text-xl font-bold text-blue-400">540,200</div>
                <div className="text-[10px] text-slate-400 mt-1">io_uring bypass active</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Active Vectors Indexed</div>
                <div className="text-xl font-bold text-purple-400">12,490,100</div>
                <div className="text-[10px] text-slate-400 mt-1">HNSW 1536-dim</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Raft Quorum Health</div>
                <div className="text-xl font-bold text-emerald-400">100%</div>
                <div className="text-[10px] text-slate-400 mt-1">0 lost heartbeats</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Memory Arena Used</div>
                <div className="text-xl font-bold text-white">4.8 GB / 64 GB</div>
                <div className="text-[10px] text-emerald-400 mt-1">Zero GC Trashing</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#060a16] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Connected via TLS 1.3
          </span>
          <span>Region: us-east-1 (N. Virginia)</span>
        </div>

      </div>
    </div>
  );
};
