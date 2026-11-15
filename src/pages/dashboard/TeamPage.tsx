import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  X, 
  Search,
  Shield,
  Crown,
  Check,
  Copy,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { dashboardApi, type TeamMember } from '../../services/dashboardApi';

interface TeamPageProps {
  databaseId?: string;
  isInviteModalOpen?: boolean;
  onCloseInviteModal?: () => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  databaseId: propDatabaseId,
  isInviteModalOpen: externalModalOpen,
  onCloseInviteModal: externalCloseModal,
}) => {
  const [databaseId, setDatabaseId] = useState<string>(() => {
    return propDatabaseId || dashboardApi.getActiveDbId() || 'default_project';
  });
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  
  // Modals & Forms
  const [isInviteModal, setIsInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('developer');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  
  // Feedback & Dev Invite Link
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devInviteLink, setDevInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const showInviteModal = externalModalOpen !== undefined ? externalModalOpen : isInviteModal;
  const closeInviteModal = () => {
    if (externalCloseModal) externalCloseModal();
    setIsInviteModal(false);
    setError(null);
  };

  // Determine active database ID
  useEffect(() => {
    if (propDatabaseId) {
      setDatabaseId(propDatabaseId);
    } else {
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
    }
  }, [propDatabaseId]);

  // Load team members
  const fetchTeam = async (targetDbId: string) => {
    try {
      setLoading(true);
      setError(null);
      const teamList = await dashboardApi.getTeam(targetDbId);
      setMembers(teamList);
    } catch (err: any) {
      setError(err.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (databaseId) {
      fetchTeam(databaseId);
    }
  }, [databaseId]);

  const filteredMembers = members.filter((m) =>
    (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase())
  );

  // Invite member submit
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    try {
      setSubmittingInvite(true);
      setError(null);
      const result = await dashboardApi.inviteTeamMember(databaseId, {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      // Update team list
      await fetchTeam(databaseId);

      setInviteName('');
      setInviteEmail('');
      closeInviteModal();

      setSuccessMsg(`Invitation sent to ${inviteEmail.trim()}.`);
      setTimeout(() => setSuccessMsg(null), 4000);

      // Show dev link if returned
      if (result.devInviteLink) {
        setDevInviteLink(result.devInviteLink);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send invite.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  // Role change
  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'developer' | 'viewer') => {
    try {
      setError(null);
      await dashboardApi.updateTeamMemberRole(databaseId, memberId, newRole);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      setSuccessMsg('Member role updated.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update member role.');
    }
  };

  // Remove member
  const handleRemove = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this database team?`)) {
      return;
    }

    try {
      setError(null);
      await dashboardApi.deleteTeamMember(databaseId, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setSuccessMsg(`Removed ${memberName} from the team.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove team member.');
    }
  };

  const copyDevLink = () => {
    if (!devInviteLink) return;
    navigator.clipboard.writeText(devInviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
          onClick={() => { setError(null); setIsInviteModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white hover:bg-[#172554] rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Inline Error Alert */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dev Invite Link Banner (Visible in development) */}
      {devInviteLink && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>Development Invite Link (Generated)</span>
            </div>
            <button onClick={() => setDevInviteLink(null)} className="text-blue-400 hover:text-blue-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-blue-800">
            Since email delivery may be disabled in local dev, you can use this direct single-use link to accept the invitation:
          </p>
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-blue-200">
            <input
              type="text"
              readOnly
              value={devInviteLink}
              className="w-full text-xs font-mono text-[#0F172A] bg-transparent outline-none truncate"
            />
            <button
              onClick={copyDevLink}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold hover:bg-[#172554] shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={devInviteLink}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-blue-100 text-[#1E3A8A] rounded-lg text-xs font-semibold hover:bg-blue-200 shrink-0"
            >
              Open Link
            </a>
          </div>
        </div>
      )}

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
            {filteredMembers.length} collaborator{filteredMembers.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1E3A8A]" />
              <p className="text-xs">Loading team collaborators...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-white text-[#64748B] uppercase font-semibold">
                  <th className="py-3 px-5">Member</th>
                  <th className="py-3 px-5">Role Permission</th>
                  <th className="py-3 px-5">Joined / Invited</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                {filteredMembers.map((m) => {
                  const isOwner = m.is_owner || m.role === 'owner';
                  return (
                    <tr key={m.id} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isOwner 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : 'bg-blue-100 text-[#1E3A8A]'
                          }`}>
                            {isOwner ? <Crown className="w-4 h-4 text-purple-600" /> : (m.name ? m.name.charAt(0).toUpperCase() : 'U')}
                          </div>
                          <div>
                            <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                              {m.name}
                              {isOwner && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  Owner
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#64748B] font-mono">{m.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Permission */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {isOwner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                            <Shield className="w-3.5 h-3.5" /> Owner (Full Cluster Admin)
                          </span>
                        ) : (
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.id, e.target.value as any)}
                            className="px-2.5 py-1 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] font-medium outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                          >
                            <option value="admin">Admin (Full Access & Billing)</option>
                            <option value="developer">Developer (Read/Write SQL & Schemas)</option>
                            <option value="viewer">Viewer (Read-Only Queries)</option>
                          </select>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-5 text-[#64748B] whitespace-nowrap">
                        {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : 'Pending'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                          m.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.status === 'INVITED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {m.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {m.status === 'INVITED' && <Clock className="w-3 h-3 text-amber-500" />}
                          {m.status === 'INVITED' ? 'INVITED' : m.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        {!isOwner && (
                          <button
                            onClick={() => handleRemove(m.id, m.name)}
                            className="p-1.5 text-[#94A3B8] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1E3A8A]" />
                Invite Team Member
              </h3>
              <button onClick={closeInviteModal} className="text-[#94A3B8] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyanshu Verma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="priyanshu@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
                <p className="text-[11px] text-[#64748B] mt-1">
                  An email invitation with a secure single-use access link will be sent.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  RBAC Role Permission
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <option value="admin">Admin — Full project management, team management & billing</option>
                  <option value="developer">Developer — Read & write SQL queries, table schemas, edge functions</option>
                  <option value="viewer">Viewer — Read-only querying and metrics inspection</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInvite}
                  className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-semibold hover:bg-[#172554] shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submittingInvite ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Invite...</span>
                    </>
                  ) : (
                    <span>Send Invite</span>
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
