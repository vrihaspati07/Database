import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Database, 
  Server, 
  Activity, 
  ShieldCheck, 
  Key, 
  Copy, 
  Check, 
  LogOut, 
  Play, 
  Lock, 
  Sparkles,
  QrCode,
  ArrowUpRight
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (page: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { user, logout, updateUser } = useAuth();

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [queryExecuting, setQueryExecuting] = useState(false);
  const [pingLatency, setPingLatency] = useState(2.3);


  const handleCopy = (text: string, type: 'key' | 'uri') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2000);
    }
  };

  const handleToggleMfa = () => {
    if (user?.mfaEnabled) {
      updateUser({ mfaEnabled: false });
    } else {
      setMfaModalOpen(true);
    }
  };

  const handleVerifyAndEnableMfa = () => {
    if (mfaCode.trim().length === 6) {
      updateUser({ mfaEnabled: true });
      setMfaModalOpen(false);
      setMfaCode('');
      setMfaError(null);
    } else {
      setMfaError('Please enter a valid 6-digit code (e.g. 123456).');
    }
  };

  const handleExecuteSandboxQuery = () => {
    setQueryExecuting(true);
    setTimeout(() => {
      setQueryExecuting(false);
      setPingLatency(+(1.8 + Math.random() * 0.8).toFixed(1));
    }, 250);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#1E3A8A]/15 selection:text-[#1E3A8A]">
      
      {/* Top Console Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand */}
          <div className="flex items-center gap-6">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1E3A8A] text-white shadow-xs">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0F172A] font-sans">
                Hind <span className="text-[#1E3A8A]">DB</span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PRIMARY CLUSTER-01 (ONLINE)</span>
            </div>
          </div>

          {/* Right: User profile badge & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-3 py-1 pr-1 bg-[#F8FAFC] rounded-full border border-[#E2E8F0]">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#0F172A] leading-tight">
                  {user?.name || 'Developer'}
                </div>
                <div className="text-[10px] text-[#475569] font-mono">
                  {user?.email || 'developer@hind.io'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#475569] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-[#E2E8F0]"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Sovereign Cloud Console • Project ID: prj_sovereign_8820</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight font-sans">
              Welcome, {user?.name || 'Developer'}! 👋
            </h1>
            <p className="text-sm text-[#475569] max-w-2xl">
              Your PostgreSQL 16 cluster is active with dual-AZ standby replication. Sub-4ms WebSocket channels and Row-Level Security policies are active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={handleExecuteSandboxQuery}
              disabled={queryExecuting}
              className="btn-primary-blue px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${queryExecuting ? 'animate-spin' : ''}`} />
              <span>{queryExecuting ? 'Pinging...' : 'Ping Cluster'}</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="btn-outline px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Landing Page</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#475569]">Edge Latency (Primary)</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0F172A] font-sans flex items-baseline gap-2">
              <span>{pingLatency}ms</span>
              <span className="text-xs text-emerald-600 font-mono font-medium">99.9% sub-5ms</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#475569]">Database Engine</span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-[#1E3A8A]">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0F172A] font-sans flex items-baseline gap-2">
              <span>Postgres 16.4</span>
              <span className="text-xs text-blue-600 font-mono font-medium">+pgvector</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#475569]">DPDP 2026 Residency</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0F172A] font-sans flex items-baseline gap-2">
              <span>100% India</span>
              <span className="text-xs text-emerald-600 font-mono font-medium">Audited</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#475569]">Two-Factor Auth (MFA)</span>
              <div className="p-1.5 rounded-lg bg-orange-50 text-[#F97316]">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0F172A] font-sans flex items-baseline gap-2">
              <span className={user?.mfaEnabled ? 'text-emerald-600' : 'text-[#475569]'}>
                {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={handleToggleMfa}
                className="text-xs text-[#1E3A8A] font-semibold hover:underline cursor-pointer"
              >
                {user?.mfaEnabled ? 'Manage' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        {/* Database Credentials & Connection String Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Connection URI & API Keys (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-7 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Database Connection URI</span>
                </h3>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Pooled (Port 6543)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Direct PostgreSQL Connection String (Prisma, Drizzle, TypeORM, psql)
                </label>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#0F172A] text-slate-100 font-mono text-xs border border-slate-800">
                  <code className="flex-1 overflow-x-auto text-emerald-400">
                    postgresql://hind_admin:••••••••••••@cluster-01.hind.io:6543/postgres?sslmode=require
                  </code>
                  <button
                    onClick={() => handleCopy('postgresql://hind_admin:hind_live_pass_2026@cluster-01.hind.io:6543/postgres?sslmode=require', 'uri')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
                    title="Copy Connection String"
                  >
                    {copiedUri ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Client Anonymous API Key (REST & GraphQL Gateways)
                </label>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#0F172A] text-slate-100 font-mono text-xs border border-slate-800">
                  <code className="flex-1 overflow-x-auto text-orange-300">
                    hind_anon_public_key_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                  </code>
                  <button
                    onClick={() => handleCopy('hind_anon_public_key_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_live_2026', 'key')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
                    title="Copy API Key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick SQL Query Sandbox */}
            <div className="p-7 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#F97316]" />
                  <span>Interactive SQL Query Console</span>
                </h3>
                <span className="text-xs font-mono text-[#475569]">RLS: Active</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#090E1F] text-slate-200 font-mono text-xs leading-relaxed border border-slate-800">
                <span className="text-blue-400 font-bold">SELECT</span> id, name, city, amount_inr <br />
                <span className="text-blue-400 font-bold">FROM</span> quick_commerce_orders <br />
                <span className="text-blue-400 font-bold">WHERE</span> status = <span className="text-emerald-400">'DELIVERED'</span> <span className="text-blue-400 font-bold">ORDER BY</span> created_at <span className="text-blue-400 font-bold">DESC LIMIT</span> 3;
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569]">
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">City</th>
                      <th className="py-2.5 px-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr>
                      <td className="py-2.5 px-3 text-[#475569]">ord_in_901</td>
                      <td className="py-2.5 px-3 font-semibold text-[#0F172A]">Aarav Sharma</td>
                      <td className="py-2.5 px-3 text-[#1E3A8A]">Delhi NCR</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">₹1,499</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-[#475569]">ord_in_902</td>
                      <td className="py-2.5 px-3 font-semibold text-[#0F172A]">Pooja Iyer</td>
                      <td className="py-2.5 px-3 text-[#1E3A8A]">Hyderabad</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">₹850</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Security Center & Account Settings (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Security Card */}
            <div className="p-7 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Security & DPDP Compliance</span>
              </h3>

              <div className="space-y-4 text-xs text-[#475569]">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div>
                    <span className="font-bold text-[#0F172A] block">Two-Factor Authentication</span>
                    <span className="text-[11px] text-[#475569]">Protect login with TOTP authenticator app</span>
                  </div>
                  <button
                    onClick={handleToggleMfa}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                      user?.mfaEnabled
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'btn-primary-blue text-white'
                    }`}
                  >
                    {user?.mfaEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div>
                    <span className="font-bold text-[#0F172A] block">Argon2id Hashing</span>
                    <span className="text-[11px] text-[#475569]">Memory-hard cryptographic security</span>
                  </div>
                  <span className="text-emerald-700 font-bold font-mono">ACTIVE</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div>
                    <span className="font-bold text-[#0F172A] block">Rate Limiting</span>
                    <span className="text-[11px] text-[#475569]">100 requests / hour per IP enforced</span>
                  </div>
                  <span className="text-emerald-700 font-bold font-mono">100/hr</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div>
                    <span className="font-bold text-[#0F172A] block">JWT Token Expiry</span>
                    <span className="text-[11px] text-[#475569]">15m Access Token + 7d Refresh</span>
                  </div>
                  <span className="text-blue-700 font-bold font-mono">15m / 7d</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-7 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#0F172A]">Need Support in IST?</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Our Indian cloud database engineering team is on-call 24/7 to assist with migration, sharding, and architecture.
              </p>
              <a
                href="mailto:hello@hind.io"
                className="btn-outline w-full py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-2"
              >
                <span>Contact hello@hind.io</span>
              </a>
            </div>

          </div>

        </div>

      </main>

      {/* MFA Setup Modal */}
      {mfaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-[#E2E8F0] shadow-2xl p-8 text-[#0F172A]">
            <h3 className="text-lg font-bold text-[#0F172A] mb-2 font-sans flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#1E3A8A]" />
              <span>Enable Two-Factor Authentication</span>
            </h3>
            
            <p className="text-xs text-[#475569] mb-4">
              Scan this QR code or enter the secret in your authenticator app (Google Authenticator, Microsoft Authenticator, Authy).
            </p>

            {/* Mock QR Visual */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center justify-center my-4">
              <div className="w-36 h-36 bg-white border-2 border-slate-900 p-2 rounded-xl flex items-center justify-center shadow-xs">
                <QrCode className="w-28 h-28 text-[#0F172A]" />
              </div>
              <span className="mt-3 text-[11px] font-mono text-[#475569] bg-white px-3 py-1 rounded-full border border-[#E2E8F0]">
                SECRET: HIND-INDIA-2026-SOVEREIGN
              </span>
            </div>

            {mfaError && (
              <p className="text-xs text-rose-600 mb-3 font-medium">
                {mfaError}
              </p>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#0F172A]">
                Enter 6-digit confirmation code:
              </label>
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-center font-mono text-lg tracking-widest outline-none focus:border-[#1E3A8A]"
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setMfaModalOpen(false)}
                  className="btn-outline flex-1 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAndEnableMfa}
                  className="btn-primary-blue flex-1 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Confirm & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
