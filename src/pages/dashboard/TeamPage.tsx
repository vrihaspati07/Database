import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  X, 
  Search
} from 'lucide-react';
import { dashboardApi, type TeamMember } from '../../services/dashboardApi';

interface TeamPageProps {
  isInviteModalOpen?: boolean;
  onCloseInviteModal?: () => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  isInviteModalOpen: externalModalOpen,
  onCloseInviteModal: externalCloseModal,
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState('');
  const [isInviteModal, setIsInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('developer');

  const showInviteModal = externalModalOpen !== undefined ? externalModalOpen : isInviteModal;
  const closeInviteModal = () => {
    if (externalCloseModal) externalCloseModal();
    setIsInviteModal(false);
  };

  useEffect(() => {
    setMembers(dashboardApi.getTeamMembers());
  }, []);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    dashboardApi.inviteMember(inviteName.trim(), inviteEmail.trim(), inviteRole);
    setMembers(dashboardApi.getTeamMembers());
    setInviteName('');
    setInviteEmail('');
    closeInviteModal();
  };

  const handleRoleChange = (id: string, newRole: 'admin' | 'developer' | 'viewer') => {
    dashboardApi.updateMemberRole(id, newRole);
    setMembers(dashboardApi.getTeamMembers());
  };

  const handleRemove = (id: string) => {
    dashboardApi.removeMember(id);
    setMembers(dashboardApi.getTeamMembers());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#1E3A8A]" />
            Team Members & Access Control
          </h1>
          <p className="text-[#475569] text-sm mt-1">
            Manage database cluster permissions, invite engineers, and assign granular RBAC roles.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white hover:bg-[#172554] rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Team Members List Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search team members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>
          <span className="text-xs text-[#64748B] font-medium">
            {filteredMembers.length} active collaborators
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-white text-[#64748B] uppercase font-semibold">
                <th className="py-3 px-5">Member</th>
                <th className="py-3 px-5">Role Permission</th>
                <th className="py-3 px-5">Joined Date</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold text-xs">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#0F172A]">{m.name}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as any)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] font-medium outline-none"
                    >
                      <option value="admin">Admin (Full Access & Billing)</option>
                      <option value="developer">Developer (Read/Write SQL & Schemas)</option>
                      <option value="viewer">Viewer (Read-Only Queries)</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-5 text-[#64748B] whitespace-nowrap">
                    {m.joined_at}
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      m.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleRemove(m.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-[#0F172A] text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1E3A8A]" />
                Invite Team Collaborator
              </h3>
              <button onClick={closeInviteModal} className="p-1.5 text-[#64748B] hover:bg-[#E2E8F0] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Role & Permission Tier</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none"
                >
                  <option value="developer">Developer (Create tables, write queries, deploy functions)</option>
                  <option value="admin">Admin (Manage billing, team members, full access)</option>
                  <option value="viewer">Viewer (Read-only data explorer)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="px-4 py-2 text-xs font-medium text-[#475569] border border-[#CBD5E1] rounded-xl hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-xl shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
