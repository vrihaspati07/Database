import React, { useState } from 'react';
import { X, Play, Database, CheckCircle2 } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState(`-- Query live Indian Postgres database with RLS
SELECT 
    order_id, 
    customer_name, 
    amount_inr, 
    payment_method, 
    delivery_city 
FROM quick_commerce_orders 
WHERE status = 'DELIVERED' 
ORDER BY created_at DESC 
LIMIT 4;`);

  const [isRunning, setIsRunning] = useState(false);
  const [latency, setLatency] = useState(2.3);

  if (!isOpen) return null;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setLatency(+(2.1 + Math.random() * 0.4).toFixed(1));
    }, 250);
  };

  const results = [
    { order_id: 'ord_in_9011', customer_name: 'Aarav Mehta', amount_inr: '₹1,490', payment_method: 'UPI / PhonePe', delivery_city: 'Delhi NCR' },
    { order_id: 'ord_in_4412', customer_name: 'Pooja Iyer', amount_inr: '₹840', payment_method: 'RuPay Card', delivery_city: 'Hyderabad' },
    { order_id: 'ord_in_7820', customer_name: 'Rohan Gupta', amount_inr: '₹3,200', payment_method: 'NetBanking / HDFC', delivery_city: 'Pune' },
    { order_id: 'ord_in_1109', customer_name: 'Divya Reddy', amount_inr: '₹950', payment_method: 'UPI / GPay', delivery_city: 'Chennai' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#090F22] border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100 font-mono text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#060A17] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <span>Hind DB Live Sandbox</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                  PRIMARY DC-01
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">PostgreSQL 16.4 • Sub-3ms sovereign edge</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Area */}
        <div className="p-5 bg-[#080D1A] border-b border-slate-800">
          <div className="flex items-center justify-between mb-2 text-slate-400">
            <span>SQL Query Editor:</span>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Execute Query'}</span>
            </button>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={5}
            className="w-full bg-[#050811] text-orange-200 p-3.5 rounded-xl border border-slate-800 focus:border-orange-500 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Results Area */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#060A16]">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Query Executed OK in <strong>{latency}ms</strong></span>
            </span>
            <span className="text-slate-500">4 rows retrieved</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                  <th className="py-2 px-3">Order ID</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Payment</th>
                  <th className="py-2 px-3">Delivery City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400">{r.order_id}</td>
                    <td className="py-2.5 px-3 text-white font-medium">{r.customer_name}</td>
                    <td className="py-2.5 px-3 text-orange-400 font-bold">{r.amount_inr}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{r.payment_method}</td>
                    <td className="py-2.5 px-3 text-slate-300">{r.delivery_city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#060A17] border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <span className="text-slate-400">Powered by Hind DB Sovereign Core Cluster</span>
          <span className="text-orange-400 font-bold">Managed PostgreSQL at ₹999/mo</span>
        </div>

      </div>
    </div>
  );
};
