import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  CreditCard, 
  Key, 
  ShieldCheck, 
  Users, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  Download, 
  AlertTriangle, 
  X
} from 'lucide-react';
import { dashboardApi, type ApiKeyItem, type TeamMember } from '../../services/dashboardApi';

interface SettingsPageProps {
  onOpenInviteMember?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenInviteMember }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'team' | 'api-keys' | 'security'>('general');

  // General tab state
  const [projectName, setProjectName] = useState('Production Core Platform');
  const [projectRegion, setProjectRegion] = useState('Mumbai (ap-south-1)');
  const [savedGeneral, setSavedGeneral] = useState(false);

  // Billing tab state
  const [currentPlan, setCurrentPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Pro');
  const invoices = [
    { id: 'INV-2026-09', date: '2026-09-01', amount: '₹999.00', status: 'PAID', pdf: 'invoice_sep_2026.pdf' },
    { id: 'INV-2026-08', date: '2026-08-01', amount: '₹999.00', status: 'PAID', pdf: 'invoice_aug_2026.pdf' },
    { id: 'INV-2026-07', date: '2026-07-01', amount: '₹999.00', status: 'PAID', pdf: 'invoice_jul_2026.pdf' },
  ];

  // Team tab state
  const [team, setTeam] = useState<TeamMember[]>([]);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRole, setNewKeyRole] = useState<'anon' | 'service_role'>('anon');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Security tab state
  const [mfaActive, setMfaActive] = useState(true);
  const activeSessions = [
    { id: 's1', device: 'Chrome on macOS (Mumbai)', ip: '49.37.12.89', lastActive: 'Just now (Current Session)', current: true },
    { id: 's2', device: 'Hind CLI v2.4 (Bengaluru Server)', ip: '103.21.244.0', lastActive: '12 minutes ago', current: false },
    { id: 's3', device: 'Safari on iPhone 15 Pro (Delhi)', ip: '157.34.88.12', lastActive: '4 hours ago', current: false },
  ];

  const auditLogs = [
    { id: 'l1', event: 'API Key Generated', user: 'aarav.sharma@hind.io', time: '2026-09-29 18:10' },
    { id: 'l2', event: 'MFA Security Enabled', user: 'aarav.sharma@hind.io', time: '2026-09-28 11:24' },
    { id: 'l3', event: 'Database Snapshot Exported', user: 'system_backup_cron', time: '2026-09-27 04:00' },
  ];

  useEffect(() => {
    setTeam(dashboardApi.getTeamMembers());
    setApiKeys(dashboardApi.getApiKeys());
  }, []);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedGeneral(true);
    setTimeout(() => setSavedGeneral(false), 2500);
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    dashboardApi.createApiKey(newKeyName.trim(), newKeyRole);
    setApiKeys(dashboardApi.getApiKeys());
    setIsKeyModalOpen(false);
    setNewKeyName('');
  };

  const handleRevokeKey = (id: string) => {
    dashboardApi.revokeApiKey(id);
    setApiKeys(dashboardApi.getApiKeys());
  };

  const handleCopyKey = (key: ApiKeyItem) => {
    navigator.clipboard.writeText(key.key);
    setCopiedKeyId(key.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#1E3A8A]" />
            Project Settings & Security
          </h1>
          <p className="text-[#475569] text-sm mt-1">
            Manage billing, API credentials, team members, and enterprise security policies.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-x-auto max-w-full">
          {[
            { id: 'general', label: 'General', icon: SettingsIcon },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'api-keys', label: 'API Keys', icon: Key },
            { id: 'security', label: 'Security', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-[#1E3A8A] shadow-xs border border-[#CBD5E1]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveGeneral} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">General Project Configuration</h3>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full max-w-md px-3.5 py-2 text-xs rounded-xl border border-[#CBD5E1] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Primary Sovereign Region</label>
              <select
                value={projectRegion}
                onChange={(e) => setProjectRegion(e.target.value)}
                className="w-full max-w-md px-3.5 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none"
              >
                <option value="Mumbai (ap-south-1)">Mumbai (ap-south-1)</option>
                <option value="Bangalore (ap-south-2)">Bangalore (ap-south-2)</option>
                <option value="Delhi NCR (ap-north-1)">Delhi NCR (ap-north-1)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-semibold hover:bg-[#172554] shadow-xs"
              >
                Save Project Changes
              </button>
              {savedGeneral && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Settings saved successfully
                </span>
              )}
            </div>
          </form>

          {/* Danger Zone */}
          <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h3>
            <p className="text-xs text-[#64748B]">
              Deleting this project cluster will permanently wipe all relational PostgreSQL tables, edge functions, storage objects, and OAuth credentials.
            </p>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs">
              Delete Project
            </button>
          </div>
        </div>
      )}

      {/* 2. Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-[#64748B]">Current Subscription</span>
              <h3 className="text-xl font-bold text-[#0F172A] mt-1 flex items-center gap-2">
                Hind {currentPlan} Cluster ({currentPlan === 'Enterprise' ? '₹4,999' : currentPlan === 'Pro' ? '₹999' : 'Free'} / month)
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </h3>
              <p className="text-xs text-[#64748B] mt-1">Next invoice billing date: October 1, 2026</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPlan('Enterprise')}
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-semibold hover:bg-[#172554] shadow-xs"
              >
                Upgrade to Enterprise
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">GST Invoices & Payment History</h4>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-white text-[#64748B] font-semibold">
                  <th className="py-3 px-5">Invoice ID</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Amount (INR)</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-5 font-mono font-semibold text-[#0F172A]">{inv.id}</td>
                    <td className="py-3.5 px-5 text-[#64748B]">{inv.date}</td>
                    <td className="py-3.5 px-5 font-semibold text-[#0F172A]">{inv.amount}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button className="text-[#1E3A8A] hover:underline flex items-center gap-1 justify-end ml-auto">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Team Tab */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Project Collaborators ({team.length})</h4>
            <button
              onClick={() => onOpenInviteMember?.()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E3A8A] text-white rounded-xl text-xs font-semibold hover:bg-[#172554] shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-white text-[#64748B] font-semibold">
                <th className="py-3 px-5">Member</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {team.map((m) => (
                <tr key={m.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#0F172A]">{m.name}</div>
                    <div className="text-[11px] text-[#64748B]">{m.email}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="capitalize px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A] font-medium border border-blue-200">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-[#64748B]">{m.joined_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#0F172A] text-base">Project API Keys</h3>
              <p className="text-xs text-[#64748B] mt-0.5">Use anonymous keys for frontend and service role keys in backend servers.</p>
            </div>
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-semibold hover:bg-[#172554] shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create API Key</span>
            </button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((k) => (
              <div key={k.id} className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0F172A]">{k.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      k.role === 'service_role' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-[#1E3A8A] border border-blue-200'
                    }`}>
                      {k.role === 'service_role' ? 'SERVICE ROLE (SECRET)' : 'ANON (PUBLIC)'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRevokeKey(k.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Revoke Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={k.key}
                    className="w-full font-mono text-xs px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155]"
                  />
                  <button
                    onClick={() => handleCopyKey(k)}
                    className="p-2 border border-[#CBD5E1] rounded-xl hover:bg-[#F1F5F9] text-[#475569]"
                    title="Copy API Key"
                  >
                    {copiedKeyId === k.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Created: {k.created_at}</span>
                  <span>Last used: {k.last_used_at}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {isKeyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-[#0F172A]">Generate New API Key</h3>
                  <button onClick={() => setIsKeyModalOpen(false)}>
                    <X className="w-4 h-4 text-[#64748B]" />
                  </button>
                </div>
                <form onSubmit={handleCreateApiKey} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Key Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mobile App Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Role Type</label>
                    <select
                      value={newKeyRole}
                      onChange={(e) => setNewKeyRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none"
                    >
                      <option value="anon">Anon (Client-safe, uses RLS)</option>
                      <option value="service_role">Service Role (Admin, bypasses RLS)</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsKeyModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-[#475569] border rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-xl"
                    >
                      Generate Key
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* MFA Toggle */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0F172A]">Multi-Factor Authentication (MFA / TOTP)</h4>
                <p className="text-xs text-[#64748B]">Require Google Authenticator or hardware YubiKey on every login.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={mfaActive}
              onChange={(e) => setMfaActive(e.target.checked)}
              className="w-5 h-5 rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
            />
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Active Authorized Sessions</h4>
            </div>
            <div className="divide-y divide-[#F1F5F9] p-2 text-xs">
              {activeSessions.map((s) => (
                <div key={s.id} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#0F172A] flex items-center gap-2">
                      {s.device}
                      {s.current && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-[#64748B] font-mono text-[11px] mt-0.5">IP: {s.ip} • {s.lastActive}</div>
                  </div>
                  {!s.current && (
                    <button className="text-xs text-red-600 hover:underline">Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security Audit Logs */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Security & Compliance Audit Logs</h4>
            </div>
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-[#F1F5F9]">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-5 font-semibold text-[#0F172A]">{l.event}</td>
                    <td className="py-3 px-5 text-[#64748B]">{l.user}</td>
                    <td className="py-3 px-5 text-right font-mono text-[#64748B]">{l.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
