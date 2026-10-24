import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Settings, 
  ExternalLink, 
  Globe2, 
  X,
  AlertTriangle
} from 'lucide-react';
import { dashboardApi, type DatabaseItem } from '../../services/dashboardApi';

interface DatabaseListPageProps {
  onSelectDatabase?: (db: DatabaseItem) => void;
  onNavigateTab: (tab: string) => void;
  isCreateModalOpen?: boolean;
  onCloseCreateModal?: () => void;
}

export const DatabaseListPage: React.FC<DatabaseListPageProps> = ({ 
  onSelectDatabase, 
  onNavigateTab,
  isCreateModalOpen: externalModalOpen,
  onCloseCreateModal: externalCloseModal
}) => {
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('Sovereign Primary (ap-south-1)');
  const [plan, setPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Pro');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showModal = externalModalOpen !== undefined ? externalModalOpen : isModalOpen;
  const closeModal = () => {
    if (externalCloseModal) externalCloseModal();
    setIsModalOpen(false);
  };

  useEffect(() => {
    setDatabases(dashboardApi.getDatabases());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    dashboardApi.createDatabase(name.trim(), region, plan);
    setDatabases(dashboardApi.getDatabases());
    setName('');
    closeModal();
  };

  const handleDelete = (id: string) => {
    dashboardApi.deleteDatabase(id);
    setDatabases(dashboardApi.getDatabases());
    setDeleteConfirmId(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
    return (bytes / 1048576).toFixed(0) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-[#1E3A8A]" />
            Managed PostgreSQL Databases
          </h1>
          <p className="text-[#475569] text-sm mt-1">
            Provision, manage, and scale serverless Postgres clusters distributed across India.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white hover:bg-[#172554] rounded-xl text-sm font-semibold shadow-xs transition-all duration-150 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Database</span>
        </button>
      </div>

      {/* Database Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {databases.map((db) => (
          <div
            key={db.id}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
          >
            {/* Top Card Info */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center border border-blue-100 font-bold group-hover:scale-105 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-base group-hover:text-[#1E3A8A] transition-colors line-clamp-1">
                      {db.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5">
                      <Globe2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{db.region}</span>
                    </div>
                  </div>
                </div>

                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  db.plan === 'Enterprise' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                  db.plan === 'Pro' ? 'bg-blue-50 text-[#1E3A8A] border border-blue-200' :
                  'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {db.plan}
                </span>
              </div>

              {/* Specs & Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9] text-xs">
                <div>
                  <span className="text-[#64748B] block">Status</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {db.status}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Storage</span>
                  <span className="font-semibold text-[#0F172A] mt-0.5 block font-mono">
                    {formatBytes(db.size_bytes)}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Tables</span>
                  <span className="font-semibold text-[#0F172A] mt-0.5 block font-mono">
                    {db.tablesCount || 3}
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#94A3B8] flex items-center justify-between">
                <span>Created: {new Date(db.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="font-mono">PostgreSQL 16.2</span>
              </div>
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
              <button
                onClick={() => {
                  if (onSelectDatabase) onSelectDatabase(db);
                  onNavigateTab('explorer');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:text-[#172554] transition-colors"
              >
                <span>View Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('settings')}
                  title="Database Settings"
                  className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(db.id)}
                  title="Delete Database"
                  className="p-1.5 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E2E8F0] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Delete Database?</h3>
                <p className="text-xs text-[#64748B]">This action is permanent and cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-[#475569]">
              Are you sure you want to drop this database cluster? All relational tables, rows, triggers, and storage attachments will be deleted.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#F1F5F9] rounded-xl border border-[#CBD5E1]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Database Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#1E3A8A]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Create New Database</h3>
                  <p className="text-xs text-[#64748B]">Deploy an enterprise-grade managed PostgreSQL instance</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Database Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. payment-ledger-db"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm font-medium"
                />
                <p className="text-xs text-[#64748B] mt-1">Lowercase letters, numbers, and hyphens only.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Region (Indian Data Sovereign Centers) *
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm font-medium bg-white"
                >
                  <option value="Sovereign Primary (ap-south-1)">Sovereign Primary (ap-south-1) - High Availability Zone</option>
                  <option value="Sovereign Secondary (ap-south-2)">Sovereign Secondary (ap-south-2) - Dual-AZ Standby</option>
                  <option value="Sovereign North (ap-north-1)">Sovereign North (ap-north-1) - Secure Data Corridor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Cluster Tier / Plan *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Free', 'Pro', 'Enterprise'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlan(p)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        plan === p
                          ? 'border-[#1E3A8A] bg-blue-50/50 text-[#1E3A8A] shadow-xs'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#475569]'
                      }`}
                    >
                      <span className="font-bold text-sm block">{p}</span>
                      <span className="text-xs text-[#64748B]">
                        {p === 'Free' ? '500 MB / Free' : p === 'Pro' ? '₹999 / mo' : '₹4,999 / mo'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F1F5F9] rounded-xl border border-[#CBD5E1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-xl shadow-xs transition-all"
                >
                  Provision Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
