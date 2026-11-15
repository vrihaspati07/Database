/**
 * Hind DB - Secret Sovereign Admin & Security Control Console
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Activity,
  Users,
  Database,
  DollarSign,
  FileText,
  Bell,
  RefreshCw,
  LogOut,
  Search,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
  Trash2,
  ExternalLink,
  Download,
  Zap,
  Clock,
  Send,
  Mail,
  ChevronRight,
  Play,
  Pause,
  HardDrive,
  Server,
  Sliders,
  AlertCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'health' | 'users' | 'projects' | 'storage' | 'security' | 'revenue' | 'logs' | 'alerts'
  >('overview');

  // Admin Session State
  const [adminUser] = useState<any>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('hind_admin_user') || '{}');
    } catch {
      return {};
    }
  });
  const [idleSeconds, setIdleSeconds] = useState<number>(1800); // 30 minutes = 1800s

  // Data States
  const [healthData, setHealthData] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState('ALL');

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [revealedProjects, setRevealedProjects] = useState<{ [id: string]: string }>({});
  const [revealingProjectId, setRevealingProjectId] = useState<string | null>(null);

  // Storage Phase 4 Data States
  const [storageData, setStorageData] = useState<any>(null);
  const [storageProjectSearch, setStorageProjectSearch] = useState('');
  const [selectedStorageProject, setSelectedStorageProject] = useState<any>(null);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [newQuotaGb, setNewQuotaGb] = useState('');

  const [securityData, setSecurityData] = useState<any>(null);
  const [newBanIp, setNewBanIp] = useState('');
  const [newBanReason, setNewBanReason] = useState('');

  const [revenueData, setRevenueData] = useState<any>(null);
  const [logsData, setLogsData] = useState<any>(null);
  const [logsCategory, setLogsCategory] = useState('all');

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper for auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('hind_admin_token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/v1/control-x7k9/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {}
    sessionStorage.removeItem('hind_admin_token');
    sessionStorage.removeItem('hind_admin_user');
    if (onLogout) onLogout();
    else onNavigate('home');
  }, [onLogout, onNavigate]);

  // 1. Idle Auto-Logout Tracker (30 min)
  useEffect(() => {
    const timer = setInterval(() => {
      setIdleSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    const resetIdle = () => {
      setIdleSeconds(1800); // Reset to 30m
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('scroll', resetIdle);
    window.addEventListener('touchstart', resetIdle);

    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('scroll', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
    };
  }, []);

  // Trigger logout when idle timer reaches zero
  useEffect(() => {
    if (idleSeconds === 0) {
      handleLogout();
    }
  }, [idleSeconds, handleLogout]);

  // 2. Fetch Core Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      // Parallel fetch with resilient individual error trapping
      const [hRes, sRes, uRes, pRes, secRes, revRes, logRes, stRes] = await Promise.all([
        fetch('/api/v1/control-x7k9/health', { headers }),
        fetch('/api/v1/control-x7k9/stats', { headers }),
        fetch('/api/v1/control-x7k9/users', { headers }),
        fetch('/api/v1/control-x7k9/projects', { headers }),
        fetch('/api/v1/control-x7k9/security', { headers }),
        fetch('/api/v1/control-x7k9/revenue', { headers }),
        fetch('/api/v1/control-x7k9/logs', { headers }),
        fetch('/api/v1/control-x7k9/storage', { headers }),
      ]);

      if (hRes.status === 404 && sRes.status === 404) {
        // Session invalid -> logout to 404
        handleLogout();
        return;
      }

      const [hData, sData, uData, pData, secData, revData, logData, stData] = await Promise.all([
        hRes.json().catch(() => ({})),
        sRes.json().catch(() => ({})),
        uRes.json().catch(() => ({})),
        pRes.json().catch(() => ({})),
        secRes.json().catch(() => ({})),
        revRes.json().catch(() => ({})),
        logRes.json().catch(() => ({})),
        stRes.json().catch(() => ({})),
      ]);

      if (hData?.success) setHealthData(hData.data);
      if (sData?.success) setStatsData(sData.data);
      if (uData?.success) setUsersList(uData.data || []);
      if (pData?.success) setProjectsList(pData.data || []);
      if (secData?.success) setSecurityData(secData.data);
      if (revData?.success) setRevenueData(revData.data);
      if (logData?.success) setLogsData(logData.data);
      if (stData?.success) setStorageData(stData.data);
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchData();
    // Auto refresh health & stats every 15s
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Health Probe Action
  const triggerHealthProbe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/control-x7k9/health/test-now', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setHealthData(data.data);
        showNotification('Live infrastructure health probe completed across all 5 nodes.');
      }
    } catch {
      showNotification('Health probe failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleUserAction = async (userId: string, action: string) => {
    try {
      const res = await fetch(`/api/v1/control-x7k9/users/${userId}/action`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.data?.message || `Action ${action} executed.`);
        if (action === 'impersonate' && data.data?.token) {
          // Open impersonated dashboard
          showNotification(`Impersonating ${data.data.user.email}. Action logged in audit trail.`);
        }
        fetchData();
        if (selectedUser?.id === userId) {
          viewUserDetail(userId);
        }
      } else {
        showNotification(data.error || 'User action failed', 'error');
      }
    } catch {
      showNotification('Request failed', 'error');
    }
  };

  const handleBulkUserAction = async (action: string) => {
    if (selectedUserIds.length === 0) return;
    try {
      const res = await fetch('/api/v1/control-x7k9/users/bulk-action', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, userIds: selectedUserIds }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Bulk ${action} executed on ${data.data?.affectedCount} users.`);
        setSelectedUserIds([]);
        fetchData();
      }
    } catch {
      showNotification('Bulk action failed', 'error');
    }
  };

  const viewUserDetail = async (userId: string) => {
    try {
      const res = await fetch(`/api/v1/control-x7k9/users/${userId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedUser(data.data);
        setUserModalOpen(true);
      }
    } catch {
      showNotification('Failed to load user details', 'error');
    }
  };

  // Project Actions
  const handleRevealConnection = async (projectId: string) => {
    try {
      const res = await fetch(`/api/v1/control-x7k9/projects/${projectId}/reveal-connection`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setRevealedProjects((prev) => ({
          ...prev,
          [projectId]: data.data.connection_uri,
        }));
        showNotification('Connection string revealed. Security audit record created.');
        setRevealingProjectId(null);
      }
    } catch {
      showNotification('Failed to reveal connection', 'error');
    }
  };

  const handleProjectAction = async (projectId: string, action: string, targetRegion?: string) => {
    try {
      const res = await fetch(`/api/v1/control-x7k9/projects/${projectId}/action`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, targetRegion }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Project ${action} executed successfully.`);
        fetchData();
      }
    } catch {
      showNotification('Action failed', 'error');
    }
  };

  const handleRetryProvisioning = async (projectId: string) => {
    try {
      const res = await fetch(`/api/v1/control-x7k9/projects/retry-provisioning/${projectId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Provisioning retry initiated successfully.');
        fetchData();
      }
    } catch {
      showNotification('Retry failed', 'error');
    }
  };

  // Storage Phase 4 Platform Admin Actions
  const handleStorageProjectAction = async (projectId: string, action: 'pause' | 'resume') => {
    try {
      const res = await fetch(`/api/v1/control-x7k9/storage/projects/${projectId}/action`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.data?.message || `Storage ${action} executed.`);
        fetchData();
      } else {
        showNotification(data.error || 'Failed to update storage project', 'error');
      }
    } catch {
      showNotification('Storage action failed', 'error');
    }
  };

  const handleUpdateStorageQuota = async (projectId: string, quotaGb: number) => {
    try {
      const res = await fetch(`/api/v1/control-x7k9/storage/projects/${projectId}/action`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'set_quota', quotaBytes: quotaGb * 1024 * 1024 * 1024 }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Quota for project '${projectId}' updated to ${quotaGb} GB.`);
        setQuotaModalOpen(false);
        setSelectedStorageProject(null);
        fetchData();
      } else {
        showNotification(data.error || 'Failed to update quota', 'error');
      }
    } catch {
      showNotification('Quota update failed', 'error');
    }
  };

  // Security IP Ban Actions
  const handleBanIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanIp) return;
    try {
      const res = await fetch('/api/v1/control-x7k9/security/banned-ips', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'ban', ip: newBanIp, reason: newBanReason || 'Manual Admin Ban' }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`IP ${newBanIp} has been blacklisted.`);
        setNewBanIp('');
        setNewBanReason('');
        fetchData();
      }
    } catch {
      showNotification('Failed to ban IP', 'error');
    }
  };

  const handleUnbanIp = async (ip: string) => {
    try {
      const res = await fetch('/api/v1/control-x7k9/security/banned-ips', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'unban', ip }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`IP ${ip} removed from blacklist.`);
        fetchData();
      }
    } catch {
      showNotification('Failed to unban IP', 'error');
    }
  };

  // Payment Retry
  const handleRetryPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/v1/control-x7k9/revenue/retry-payment/${paymentId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.data?.message || 'Payment re-attempt succeeded.');
        fetchData();
      }
    } catch {
      showNotification('Payment retry failed', 'error');
    }
  };

  // Trigger Manual Alert Emails
  const handleSendTestAlert = async () => {
    try {
      const res = await fetch('/api/v1/control-x7k9/alerts/test', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Test security alert dispatched to admin Gmail.');
      } else {
        showNotification(data.error || 'Alert dispatch failed', 'error');
      }
    } catch {
      showNotification('Failed to dispatch alert', 'error');
    }
  };

  const handleSendDailySummaryNow = async () => {
    try {
      const res = await fetch('/api/v1/control-x7k9/alerts/daily-summary', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('9:00 PM Daily summary report generated & sent to Gmail.');
      }
    } catch {
      showNotification('Failed to send summary', 'error');
    }
  };

  // CSV Export Download
  const downloadCsv = (type: 'users' | 'projects' | 'revenue' | 'audit') => {
    const token = sessionStorage.getItem('hind_admin_token') || '';
    window.open(`/api/v1/control-x7k9/export/${type}?token=${token}`, '_blank');
  };

  // Formatting helpers
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatIdleTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name.toLowerCase().includes(userSearch.toLowerCase());
    const matchesPlan = userPlanFilter === 'ALL' || u.plan.toUpperCase() === userPlanFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#1E3A8A]/40">
      {/* 1. TOP SOVEREIGN ADMIN BAR */}
      <header className="sticky top-0 z-40 bg-[#0A0F1D]/90 backdrop-blur-xl border-b border-[#1E293B] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1E3A8A] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#1E3A8A]/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Hind<span className="text-[#38BDF8]">DB</span> Control
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30 px-2 py-0.5 rounded uppercase">
                  ROOT ADMIN
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-[#94A3B8] border-l border-[#1E293B] pl-4">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-mono text-[11px] text-[#CBD5E1]">ap-south-1 (Sovereign Cloud)</span>
          </div>
        </div>

        {/* Right Tools & Idle Timer */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Idle Auto-Logout Pill */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
              idleSeconds < 300
                ? 'bg-[#7F1D1D]/30 border-[#EF4444] text-[#FCA5A5]'
                : 'bg-[#111827] border-[#1E293B] text-[#94A3B8]'
            }`}
            title="Auto logout after 30 minutes of idle inactivity"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Idle: {formatIdleTime(idleSeconds)}</span>
          </div>

          {/* Live Health Probe Action */}
          <button
            onClick={triggerHealthProbe}
            disabled={loading}
            className="hidden sm:flex items-center space-x-1.5 bg-[#111827] hover:bg-[#1E293B] text-[#E2E8F0] border border-[#1E293B] px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            title="Probe all 5 services live"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Probe Infrastructure</span>
          </button>

          {/* Export CSV Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-1.5 bg-[#111827] hover:bg-[#1E293B] text-[#E2E8F0] border border-[#1E293B] px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
              <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 mt-1 w-44 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl py-1 text-xs hidden group-hover:block z-50">
              <button
                onClick={() => downloadCsv('users')}
                className="w-full text-left px-3 py-2 text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white"
              >
                Users CSV Export
              </button>
              <button
                onClick={() => downloadCsv('projects')}
                className="w-full text-left px-3 py-2 text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white"
              >
                Projects CSV Export
              </button>
              <button
                onClick={() => downloadCsv('revenue')}
                className="w-full text-left px-3 py-2 text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white"
              >
                Revenue CSV Export
              </button>
              <button
                onClick={() => downloadCsv('audit')}
                className="w-full text-left px-3 py-2 text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white"
              >
                Audit Log CSV Export
              </button>
            </div>
          </div>

          {/* Admin Email Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-[#94A3B8] bg-[#111827] border border-[#1E293B] px-2.5 py-1 rounded-lg">
            <span className="text-[#38BDF8] font-mono">{adminUser.email || 'Admin'}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#F87171] border border-[#EF4444]/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            title="Terminate Admin Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Action Banner Notification */}
      {actionMessage && (
        <div
          className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
            actionMessage.type === 'error'
              ? 'bg-[#7F1D1D]/50 border-[#991B1B] text-[#FCA5A5]'
              : 'bg-[#064E3B]/50 border-[#047857] text-[#A7F3D0]'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* TOP LIVE SERVICE HEALTH CARDS (A. Real-time Status Cards) */}
      <div className="border-b border-[#1E293B] bg-[#0A0F1D]/60 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#38BDF8]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Live Infrastructure Health &amp; Sovereign Probes
            </h2>
          </div>
          <span className="text-[11px] text-[#64748B] font-mono">
            Auto-probed every 60s • 5m outage auto-triggers Gmail alert
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {healthData && healthData.services ? (
            Object.entries(healthData.services).map(([key, svc]: [string, any]) => {
              const isUp = svc.status === 'UP';
              const isDegraded = svc.status === 'DEGRADED';
              return (
                <div
                  key={key}
                  className={`bg-[#0F172A] border rounded-xl p-3.5 transition-all relative overflow-hidden ${
                    !isUp && !isDegraded
                      ? 'border-[#EF4444] shadow-lg shadow-[#EF4444]/10'
                      : isDegraded
                      ? 'border-[#F59E0B]/50'
                      : 'border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isUp ? 'bg-[#10B981]' : isDegraded ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                        } ${isUp ? 'animate-pulse' : ''}`}
                      />
                      <span className="font-semibold text-xs text-white uppercase tracking-tight">{key}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isUp
                          ? 'bg-[#10B981]/15 text-[#34D399]'
                          : isDegraded
                          ? 'bg-[#F59E0B]/15 text-[#FBBF24]'
                          : 'bg-[#EF4444]/20 text-[#F87171]'
                      }`}
                    >
                      {svc.status}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-[#94A3B8] font-mono truncate" title={svc.name}>
                    {svc.name}
                  </div>

                  <div className="mt-3 flex items-baseline justify-between text-xs font-mono">
                    <span className="text-[#64748B]">Latency:</span>
                    <span className="font-bold text-[#E2E8F0]">{svc.response_time_ms} ms</span>
                  </div>

                  <div className="mt-1 flex items-baseline justify-between text-[11px] font-mono">
                    <span className="text-[#64748B]">Uptime 24h:</span>
                    <span className="text-[#10B981] font-semibold">{svc.uptime_24h}%</span>
                  </div>

                  <div className="mt-1 flex items-baseline justify-between text-[10px] font-mono text-[#64748B]">
                    <span>7d / 30d:</span>
                    <span>
                      {svc.uptime_7d}% / {svc.uptime_30d}%
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-5 text-center py-4 text-xs text-[#64748B]">
              Loading sovereign cluster probes...
            </div>
          )}
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="border-b border-[#1E293B] bg-[#0A0F1D] px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5 no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Zap },
            { id: 'users', label: 'Users Management', icon: Users, badge: usersList.length },
            { id: 'projects', label: 'Projects & Clusters', icon: Database, badge: projectsList.length },
            {
              id: 'storage',
              label: 'Storage & Quotas',
              icon: HardDrive,
              badge: storageData?.projectsOverQuota?.length ? `${storageData.projectsOverQuota.length} Over Quota` : undefined,
            },
            {
              id: 'security',
              label: 'Security & Abuse',
              icon: Shield,
              badge: securityData?.banned_ips?.length ? `${securityData.banned_ips.length} Banned` : undefined,
            },
            { id: 'revenue', label: 'Revenue & Billing', icon: DollarSign },
            { id: 'logs', label: 'System Logs', icon: FileText },
            { id: 'alerts', label: 'Alerts & Gmail', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#111827]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#1E293B] text-[#94A3B8]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* MAIN TAB CONTENT */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ======================= TAB: OVERVIEW ======================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Business Stats Grid (B. Business Stats) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
                Platform Business &amp; Growth Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Users */}
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span>Total Users</span>
                    <span className="text-[#10B981] font-mono font-bold bg-[#10B981]/15 px-2 py-0.5 rounded text-[10px]">
                      +{statsData?.users?.growth_week_pct || 12.8}% wk
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-white font-mono">
                    {statsData?.users?.total?.toLocaleString() || '1,248'}
                  </div>
                  <div className="mt-2 text-[11px] text-[#64748B] flex items-center justify-between font-mono">
                    <span>Today: +{statsData?.users?.today || 19}</span>
                    <span>Month: +{statsData?.users?.this_month || 580}</span>
                  </div>
                </div>

                {/* 2. Total Projects & Active */}
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span>Projects &amp; Clusters</span>
                    <span className="text-[#38BDF8] font-mono font-bold bg-[#38BDF8]/15 px-2 py-0.5 rounded text-[10px]">
                      ACTIVE
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-[#38BDF8] font-mono">
                    {statsData?.projects?.active || 830}{' '}
                    <span className="text-xs text-[#64748B] font-normal">/ {statsData?.projects?.total || 848}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-[#64748B] flex items-center justify-between font-mono">
                    <span>Paused: {statsData?.projects?.paused || 8}</span>
                    <span className="text-[#EF4444]">Failed: {statsData?.projects?.failed_provisioning || 4}</span>
                  </div>
                </div>

                {/* 3. API Requests */}
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span>API Gateway Requests</span>
                    <span className="text-[#A855F7] font-mono font-bold bg-[#A855F7]/15 px-2 py-0.5 rounded text-[10px]">
                      REST + SQL
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-white font-mono">
                    {statsData?.api_requests?.today?.toLocaleString() || '482,910'}
                  </div>
                  <div className="mt-2 text-[11px] text-[#64748B] flex items-center justify-between font-mono">
                    <span>Week: {(statsData?.api_requests?.this_week || 3120400).toLocaleString()}</span>
                    <span>Err Rate: {statsData?.api_requests?.error_rate_pct || 0.04}%</span>
                  </div>
                </div>

                {/* 4. Revenue (MRR) */}
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span>Monthly Recurring Revenue</span>
                    <span className="text-[#F59E0B] font-mono font-bold bg-[#F59E0B]/15 px-2 py-0.5 rounded text-[10px]">
                      INR
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-[#F59E0B] font-mono">
                    ₹{(statsData?.revenue?.mrr_inr || 485000).toLocaleString('en-IN')}
                  </div>
                  <div className="mt-2 text-[11px] text-[#64748B] flex items-center justify-between font-mono">
                    <span>Paid Users: {statsData?.revenue?.paid_users || 89}</span>
                    <span>Conv: {statsData?.revenue?.free_to_paid_conversion_pct || 7.1}%</span>
                  </div>
                </div>
              </div>

              {/* Secondary Stats Row: Storage & Churned Users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#94A3B8]">Storage Utilized across Clusters</span>
                    <div className="text-xl font-black text-white font-mono mt-1">
                      {statsData?.storage?.used_gb || 184.5} GB{' '}
                      <span className="text-xs text-[#64748B] font-normal">/ {statsData?.storage?.total_allocated_gb || 500} GB</span>
                    </div>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-xs font-mono font-bold text-[#38BDF8]">
                      {statsData?.storage?.usage_percentage || 36.9}%
                    </span>
                    <div className="w-full bg-[#1E293B] rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-[#38BDF8] h-full rounded-full"
                        style={{ width: `${statsData?.storage?.usage_percentage || 36.9}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#94A3B8]">Churned Accounts (&gt;30 Days Inactive)</span>
                    <div className="text-xl font-black text-[#F87171] font-mono mt-1">
                      {statsData?.users?.churned_30d || 38} accounts
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs text-[#38BDF8] hover:underline font-mono"
                  >
                    View Inactive →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Security Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Security & Abuse Incidents */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-[#EF4444]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Recent Security Radar
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="text-xs text-[#38BDF8] hover:underline"
                  >
                    View Security Center →
                  </button>
                </div>

                <div className="space-y-3">
                  {securityData?.security_events?.slice(0, 3).map((event: any) => (
                    <div
                      key={event.id}
                      className="bg-[#111827] border border-[#1E293B] rounded-lg p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            event.severity === 'CRITICAL'
                              ? 'bg-[#EF4444]/20 text-[#F87171]'
                              : event.severity === 'HIGH'
                              ? 'bg-[#F97316]/20 text-[#FB923C]'
                              : 'bg-[#F59E0B]/20 text-[#FBBF24]'
                          }`}
                        >
                          {event.event_type}
                        </span>
                        <span className="text-[#64748B] font-mono text-[10px]">
                          {new Date(event.created_at).toLocaleTimeString('en-IN')}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[#CBD5E1] text-xs leading-relaxed">{event.description}</p>
                      <div className="mt-1 font-mono text-[10px] text-[#94A3B8]">
                        IP: <span className="text-white">{event.ip_address}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instant Alert Controls & Resend/SMTP Hub */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-[#F59E0B]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Instant Alerts &amp; Gmail Automation
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                  Real-time alerts are configured to automatically dispatch to your Gmail (
                  <span className="text-[#38BDF8] font-mono">{adminUser.email || 'Admin'}</span>) via Resend/SMTP
                  on outages (&gt;5m), error rates (&gt;5%), failed payments, and brute-force attempts.
                </p>

                <div className="space-y-2.5">
                  <button
                    onClick={handleSendTestAlert}
                    className="w-full flex items-center justify-between bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] px-3.5 py-2.5 rounded-lg text-xs text-white transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-[#38BDF8]" />
                      <span>Send Instant Test Security Alert to Gmail</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                  </button>

                  <button
                    onClick={handleSendDailySummaryNow}
                    className="w-full flex items-center justify-between bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] px-3.5 py-2.5 rounded-lg text-xs text-white transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[#F59E0B]" />
                      <span>Dispatch 9:00 PM Daily Operations Summary Now</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: USERS MANAGEMENT (C) ======================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search & Bulk Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F172A] border border-[#1E293B] p-4 rounded-xl">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name, email..."
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <select
                  value={userPlanFilter}
                  onChange={(e) => setUserPlanFilter(e.target.value)}
                  className="bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-[#CBD5E1] focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="ALL">All Plans</option>
                  <option value="FREE">Free</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedUserIds.length > 0 && (
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <span className="text-xs text-[#94A3B8] font-mono">
                    {selectedUserIds.length} selected:
                  </span>
                  <button
                    onClick={() => handleBulkUserAction('suspend')}
                    className="px-3 py-1.5 bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/30 rounded-lg text-xs font-semibold hover:bg-[#EF4444]/30 transition-all"
                  >
                    Bulk Suspend
                  </button>
                  <button
                    onClick={() => handleBulkUserAction('delete')}
                    className="px-3 py-1.5 bg-[#7F1D1D]/50 text-[#FCA5A5] border border-[#991B1B] rounded-lg text-xs font-semibold hover:bg-[#7F1D1D] transition-all"
                  >
                    Bulk Delete
                  </button>
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111827] text-[#94A3B8] border-b border-[#1E293B] font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) setSelectedUserIds(filteredUsers.map((u) => u.id));
                            else setSelectedUserIds([]);
                          }}
                          className="rounded border-[#1E293B]"
                        />
                      </th>
                      <th className="p-3">User &amp; Email</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3 text-center">Projects</th>
                      <th className="p-3 text-right">Storage</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {filteredUsers.map((user) => {
                      const isSuspended = user.status === 'suspended';
                      const isDeleted = user.status === 'deleted';
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-[#111827]/60 transition-colors cursor-pointer group"
                          onClick={() => viewUserDetail(user.id)}
                        >
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedUserIds((prev) => [...prev, user.id]);
                                else setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
                              }}
                              className="rounded border-[#1E293B]"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                              {user.name}
                            </div>
                            <div className="text-[#64748B] font-mono text-[11px]">{user.email}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                user.plan === 'Enterprise'
                                  ? 'bg-[#A855F7]/15 text-[#C084FC] border border-[#A855F7]/30'
                                  : user.plan === 'Pro'
                                  ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                                  : 'bg-[#64748B]/15 text-[#94A3B8]'
                              }`}
                            >
                              {user.plan}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-semibold text-white">
                            {user.projects_count || 1}
                          </td>
                          <td className="p-3 text-right font-mono text-[#CBD5E1]">
                            {formatBytes(user.storage_used_bytes)}
                          </td>
                          <td className="p-3 font-mono text-[#64748B] text-[11px]">
                            {new Date(user.last_active).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                isSuspended
                                  ? 'bg-[#EF4444]/20 text-[#F87171]'
                                  : isDeleted
                                  ? 'bg-[#7F1D1D] text-[#FCA5A5]'
                                  : 'bg-[#10B981]/15 text-[#34D399]'
                              }`}
                            >
                              {user.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleUserAction(user.id, isSuspended ? 'unsuspend' : 'suspend')}
                              className={`p-1.5 rounded hover:bg-[#1E293B] ${
                                isSuspended ? 'text-[#10B981]' : 'text-[#F59E0B]'
                              }`}
                              title={isSuspended ? 'Unsuspend User' : 'Suspend User'}
                            >
                              {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'impersonate')}
                              className="p-1.5 rounded hover:bg-[#1E293B] text-[#38BDF8]"
                              title="Impersonate Dashboard (Audit-logged)"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Detail Modal */}
            {userModalOpen && selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
                <div className="max-w-2xl w-full bg-[#0A0F1D] border border-[#1E293B] rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setUserModalOpen(false)}
                    className="absolute top-4 right-4 text-[#64748B] hover:text-white"
                  >
                    ✕
                  </button>

                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#1E3A8A] to-[#38BDF8] flex items-center justify-center text-white font-bold text-lg">
                      {selectedUser.user.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{selectedUser.user.name}</h3>
                      <p className="text-xs text-[#94A3B8] font-mono">{selectedUser.user.email}</p>
                      <span className="text-[10px] font-mono bg-[#1E293B] text-[#38BDF8] px-2 py-0.5 rounded border border-[#38BDF8]/20 mt-1 inline-block">
                        Plan: {selectedUser.user.plan}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap gap-2 mb-6 p-3 bg-[#111827] rounded-xl border border-[#1E293B]">
                    <button
                      onClick={() =>
                        handleUserAction(
                          selectedUser.user.id,
                          selectedUser.user.status === 'suspended' ? 'unsuspend' : 'suspend'
                        )
                      }
                      className="px-3 py-1.5 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#F87171] border border-[#EF4444]/30 rounded-lg text-xs font-semibold"
                    >
                      {selectedUser.user.status === 'suspended' ? 'Reactivate User' : 'Suspend Account'}
                    </button>

                    <button
                      onClick={() => handleUserAction(selectedUser.user.id, 'reset_password')}
                      className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white rounded-lg text-xs font-semibold"
                    >
                      Send Password Reset Link
                    </button>

                    <button
                      onClick={() => handleUserAction(selectedUser.user.id, 'impersonate')}
                      className="px-3 py-1.5 bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] border border-[#38BDF8]/30 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Impersonate Console</span>
                    </button>

                    <button
                      onClick={() => handleUserAction(selectedUser.user.id, 'delete')}
                      className="px-3 py-1.5 bg-[#7F1D1D]/40 hover:bg-[#7F1D1D] text-[#FCA5A5] border border-[#991B1B] rounded-lg text-xs font-semibold"
                    >
                      Delete Account
                    </button>
                  </div>

                  {/* User's Projects */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase text-[#94A3B8] tracking-wider mb-2">
                      User Database Projects ({selectedUser.projects?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {selectedUser.projects?.map((proj: any) => (
                        <div
                          key={proj.id}
                          className="p-3 bg-[#111827] border border-[#1E293B] rounded-lg flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-white">{proj.name}</span>
                            <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                              {proj.region} • Status: {proj.status}
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-[#38BDF8]">{formatBytes(proj.size_bytes)}</span>
                            <div className="text-[10px] text-[#64748B]">
                              {proj.api_calls_today?.toLocaleString() || 0} calls today
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Usage History Chart (7-day trend) */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#94A3B8] tracking-wider mb-2">
                      7-Day API Traffic Profile
                    </h4>
                    <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-3">
                      <div className="grid grid-cols-7 gap-2 text-center text-xs">
                        {selectedUser.usage_history?.map((h: any, i: number) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className="w-full bg-[#1E293B] rounded-t h-20 flex items-end justify-center p-1">
                              <div
                                className="w-full bg-gradient-to-t from-[#1E3A8A] to-[#38BDF8] rounded-t"
                                style={{ height: `${Math.min(100, (h.api_requests / 9000) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-[#94A3B8] mt-1">{h.date}</span>
                            <span className="text-[9px] font-mono text-[#38BDF8]">{h.api_requests}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: PROJECTS MANAGEMENT (D) ======================= */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F172A] border border-[#1E293B] p-4 rounded-xl">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Filter projects by name, owner..."
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="text-xs font-mono text-[#94A3B8]">
                Total: <span className="text-white font-bold">{projectsList.length}</span> Sovereign Databases
              </div>
            </div>

            {/* Projects Table */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111827] text-[#94A3B8] border-b border-[#1E293B] font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Project &amp; Owner</th>
                      <th className="p-3">Region</th>
                      <th className="p-3">Connection String (Masked)</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">DB Size</th>
                      <th className="p-3 text-right">API Calls</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {projectsList
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
                          p.owner_email.toLowerCase().includes(projectSearch.toLowerCase())
                      )
                      .map((proj) => {
                        const isRevealed = !!revealedProjects[proj.id];
                        const displayUri = isRevealed ? revealedProjects[proj.id] : proj.connection_uri_masked;
                        const isProvisionFailed = proj.status === 'PROVISION_FAILED';

                        return (
                          <tr key={proj.id} className="hover:bg-[#111827]/60 transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-white">{proj.name}</div>
                              <div className="text-[#64748B] font-mono text-[11px]">{proj.owner_email}</div>
                            </td>
                            <td className="p-3 font-mono text-[#94A3B8] text-[11px]">{proj.region}</td>
                            <td className="p-3 font-mono text-[11px]">
                              <div className="flex items-center space-x-2">
                                <span className={`truncate max-w-xs ${isRevealed ? 'text-[#38BDF8]' : 'text-[#64748B]'}`}>
                                  {displayUri}
                                </span>
                                {!isRevealed ? (
                                  <button
                                    onClick={() => setRevealingProjectId(proj.id)}
                                    className="p-1 text-[#64748B] hover:text-[#38BDF8] rounded hover:bg-[#1E293B]"
                                    title="Reveal connection string (audit logged)"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setRevealedProjects((prev) => {
                                        const next = { ...prev };
                                        delete next[proj.id];
                                        return next;
                                      })
                                    }
                                    className="p-1 text-[#38BDF8] hover:text-[#94A3B8] rounded hover:bg-[#1E293B]"
                                    title="Re-mask connection string"
                                  >
                                    <EyeOff className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  isProvisionFailed
                                    ? 'bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/30'
                                    : proj.status === 'PAUSED'
                                    ? 'bg-[#F59E0B]/20 text-[#FBBF24]'
                                    : 'bg-[#10B981]/15 text-[#34D399]'
                                }`}
                              >
                                {proj.status}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono text-[#CBD5E1]">
                              {formatBytes(proj.size_bytes)}
                            </td>
                            <td className="p-3 text-right font-mono text-[#38BDF8]">
                              {proj.api_calls_today?.toLocaleString() || 0}
                            </td>
                            <td className="p-3 text-right space-x-1">
                              {isProvisionFailed ? (
                                <button
                                  onClick={() => handleRetryProvisioning(proj.id)}
                                  className="px-2.5 py-1 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#F87171] border border-[#EF4444]/30 rounded text-[11px] font-semibold"
                                >
                                  Retry Provision
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      handleProjectAction(proj.id, proj.status === 'PAUSED' ? 'resume' : 'pause')
                                    }
                                    className="p-1.5 rounded hover:bg-[#1E293B] text-[#CBD5E1]"
                                    title={proj.status === 'PAUSED' ? 'Resume Project' : 'Pause Project'}
                                  >
                                    {proj.status === 'PAUSED' ? (
                                      <Play className="w-3.5 h-3.5 text-[#10B981]" />
                                    ) : (
                                      <Pause className="w-3.5 h-3.5 text-[#F59E0B]" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleProjectAction(proj.id, 'delete')}
                                    className="p-1.5 rounded hover:bg-[#1E293B] text-[#EF4444]"
                                    title="Delete Project"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reveal Confirmation Modal */}
            {revealingProjectId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
                <div className="max-w-md w-full bg-[#0A0F1D] border border-[#EF4444]/50 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#7F1D1D]/30 border border-[#991B1B] flex items-center justify-center text-[#F87171]">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Reveal Sensitive Database Secret</h4>
                      <p className="text-xs text-[#94A3B8]">Security Audit Action Required</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#CBD5E1] leading-relaxed mb-6">
                    Revealing this unmasked connection string will display live production database credentials. This action will be{' '}
                    <strong className="text-[#38BDF8]">strictly logged in the permanent audit trail</strong> with your admin identity and IP address.
                  </p>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setRevealingProjectId(null)}
                      className="px-4 py-2 bg-[#111827] hover:bg-[#1E293B] text-[#CBD5E1] rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRevealConnection(revealingProjectId)}
                      className="px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg text-xs font-semibold shadow-lg shadow-[#EF4444]/20"
                    >
                      I Understand, Reveal &amp; Log
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: STORAGE & QUOTAS (Phase 4) ======================= */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            {/* Top Storage Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total Platform Storage Used */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Total Platform Storage</span>
                  <HardDrive className="w-4 h-4 text-[#38BDF8]" />
                </div>
                <div className="mt-2 text-2xl font-black text-white font-mono">
                  {formatBytes(storageData?.overview?.totalStorageBytes || 0)}
                </div>
                <div className="mt-2 text-[11px] text-[#64748B] flex items-center justify-between font-mono">
                  <span>{storageData?.overview?.totalFiles || 0} total files</span>
                  <span>{storageData?.overview?.totalBuckets || 0} buckets</span>
                </div>
              </div>

              {/* 2. Active Projects */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Active Storage Projects</span>
                  <Server className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="mt-2 text-2xl font-black text-[#10B981] font-mono">
                  {storageData?.overview?.activeProjectsCount || 0}{' '}
                  <span className="text-xs text-[#64748B] font-normal">
                    / {storageData?.overview?.totalProjectsCount || 0} total
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-[#64748B] font-mono">
                  Projects with active media assets
                </div>
              </div>

              {/* 3. Projects Over Quota */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Projects Over Quota</span>
                  <AlertCircle
                    className={`w-4 h-4 ${
                      (storageData?.overview?.projectsOverQuotaCount || 0) > 0 ? 'text-[#EF4444]' : 'text-[#64748B]'
                    }`}
                  />
                </div>
                <div
                  className={`mt-2 text-2xl font-black font-mono ${
                    (storageData?.overview?.projectsOverQuotaCount || 0) > 0 ? 'text-[#EF4444]' : 'text-white'
                  }`}
                >
                  {storageData?.overview?.projectsOverQuotaCount || 0}
                </div>
                <div className="mt-2 text-[11px] text-[#64748B] font-mono">
                  {(storageData?.overview?.projectsOverQuotaCount || 0) > 0
                    ? 'Uploads blocked automatically'
                    : 'All projects operating within limits'}
                </div>
              </div>

              {/* 4. Monthly Infrastructure Cost */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Estimated Monthly Cost</span>
                  <DollarSign className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div className="mt-2 text-2xl font-black text-[#F59E0B] font-mono">
                  ₹{storageData?.overview?.estimatedMonthlyCostInr || '0.00'}
                </div>
                <div className="mt-2 text-[11px] text-[#64748B] font-mono flex items-center justify-between">
                  <span>Rate: ₹{storageData?.overview?.costPerGbInr || 1.25}/GB/mo</span>
                  <span className="text-[10px] text-[#38BDF8]">Sovereign Node</span>
                </div>
              </div>
            </div>

            {/* Quota Warning Banner if Projects Over Quota */}
            {(storageData?.projectsOverQuota || []).length > 0 && (
              <div className="bg-[#7F1D1D]/30 border border-[#EF4444]/50 rounded-2xl p-4 text-xs text-[#FCA5A5] flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {storageData.projectsOverQuota.length} Project(s) Exceeded Storage Quota
                    </h4>
                    <p className="mt-1 text-[#CBD5E1]">
                      These projects have hit 100% capacity and file uploads are currently blocked. You can increase their
                      quota below or pause their storage cluster.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {storageData.projectsOverQuota.map((p: any) => (
                        <span
                          key={p.projectId}
                          className="px-2 py-0.5 rounded bg-[#991B1B]/40 border border-[#EF4444]/40 font-mono text-[11px]"
                        >
                          {p.name} ({formatBytes(p.usedBytes)} / {formatBytes(p.quotaBytes)})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top 20 Projects Table */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-[#38BDF8]" />
                    Top 20 Projects by Storage Consumption
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Live usage metrics, quota controls, and cluster pause actions
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search storage projects..."
                    value={storageProjectSearch}
                    onChange={(e) => setStorageProjectSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#111827] border border-[#1E293B] rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-hidden focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] bg-[#111827]/70 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Storage Used</th>
                      <th className="py-3 px-4">Capacity / Quota</th>
                      <th className="py-3 px-4">Usage %</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] text-xs">
                    {(storageData?.top20Projects || [])
                      .filter(
                        (p: any) =>
                          p.name.toLowerCase().includes(storageProjectSearch.toLowerCase()) ||
                          p.projectId.toLowerCase().includes(storageProjectSearch.toLowerCase()) ||
                          p.ownerEmail.toLowerCase().includes(storageProjectSearch.toLowerCase())
                      )
                      .map((p: any) => {
                        const isPaused = p.status === 'PAUSED';
                        const pct = p.usedPercentage || 0;
                        return (
                          <tr key={p.projectId} className="hover:bg-[#111827]/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-white">{p.name}</div>
                              <div className="text-[10px] text-[#64748B] font-mono">{p.projectId}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[#94A3B8]">{p.ownerEmail}</td>
                            <td className="py-3.5 px-4">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/20">
                                {p.plan}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-white font-semibold">
                              {formatBytes(p.usedBytes)}
                              <div className="text-[10px] text-[#64748B] font-normal">{p.fileCount || 0} files</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[#94A3B8]">
                              <div className="flex items-center gap-1.5">
                                <span>{formatBytes(p.quotaBytes)}</span>
                                {p.quotaOverrideBytes && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 font-semibold">
                                    Override
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="w-28 space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span
                                    className={
                                      pct >= 100
                                        ? 'text-[#EF4444] font-bold'
                                        : pct >= 80
                                        ? 'text-[#F59E0B]'
                                        : 'text-[#10B981]'
                                    }
                                  >
                                    {pct}%
                                  </span>
                                </div>
                                <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      pct >= 100 ? 'bg-[#EF4444]' : pct >= 80 ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                                    }`}
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                  isPaused
                                    ? 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30'
                                    : 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStorageProjectAction(p.projectId, isPaused ? 'resume' : 'pause')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                    isPaused
                                      ? 'bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#34D399] border-[#10B981]/30'
                                      : 'bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#F87171] border-[#EF4444]/30'
                                  }`}
                                  title={isPaused ? 'Resume project storage' : 'Pause project storage'}
                                >
                                  {isPaused ? 'Resume' : 'Pause'}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedStorageProject(p);
                                    setNewQuotaGb(String(Math.round(p.quotaBytes / (1024 * 1024 * 1024))));
                                    setQuotaModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] transition-all"
                                  title="Increase or adjust project storage quota"
                                >
                                  Adjust Quota
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Storage Errors & Security Logs Table */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-[#1E293B]">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  Storage Security, Malicious Uploads &amp; Error Events
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Audit trail of blocked executables, quota breaches, and storage rate limit events
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] bg-[#111827]/70 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Event Type</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] text-xs">
                    {(storageData?.storageErrors || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#64748B]">
                          No storage errors or security incidents recorded. Cluster running smoothly.
                        </td>
                      </tr>
                    ) : (
                      (storageData?.storageErrors || []).map((err: any, idx: number) => (
                        <tr key={err.id || `storage-err-${idx}`} className="hover:bg-[#111827]/60 transition-colors">
                          <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                            {new Date(err.created_at).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-white text-[11px]">
                            {err.event_type || err.action}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                err.severity === 'CRITICAL' || err.severity === 'HIGH'
                                  ? 'bg-[#EF4444]/20 text-[#F87171]'
                                  : 'bg-[#F59E0B]/20 text-[#FBBF24]'
                              }`}
                            >
                              {err.severity || 'WARNING'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#CBD5E1] max-w-md truncate" title={err.description}>
                            {err.description || `Storage ${err.action} event on file ${err.file_name}`}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#94A3B8]">{err.ip_address || '127.0.0.1'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Set Storage Quota Modal */}
            {quotaModalOpen && selectedStorageProject && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                  <button
                    onClick={() => {
                      setQuotaModalOpen(false);
                      setSelectedStorageProject(null);
                    }}
                    className="absolute top-4 right-4 text-[#64748B] hover:text-white"
                  >
                    ✕
                  </button>

                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Adjust Project Storage Quota</h3>
                      <p className="text-xs text-[#94A3B8] font-mono">{selectedStorageProject.name}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#CBD5E1] leading-relaxed mb-4">
                    Set a custom sovereign storage quota limit for this project. This override will take effect
                    immediately and be recorded in the security audit logs.
                  </p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">New Quota Limit (in GB)</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={newQuotaGb}
                        onChange={(e) => setNewQuotaGb(e.target.value)}
                        className="w-full px-3 py-2 bg-[#111827] border border-[#1E293B] rounded-xl text-sm text-white font-mono focus:outline-hidden focus:border-[#38BDF8]"
                        placeholder="e.g. 25"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <span className="text-[11px] text-[#64748B] block mb-1.5 font-mono">Quick Presets:</span>
                      <div className="flex gap-2">
                        {[5, 10, 25, 50, 100].map((gb) => (
                          <button
                            key={gb}
                            type="button"
                            onClick={() => setNewQuotaGb(String(gb))}
                            className="px-2.5 py-1 text-xs bg-[#111827] hover:bg-[#1E293B] text-[#38BDF8] border border-[#1E293B] rounded-lg font-mono"
                          >
                            {gb}GB
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setQuotaModalOpen(false);
                        setSelectedStorageProject(null);
                      }}
                      className="px-4 py-2 bg-[#111827] hover:bg-[#1E293B] text-[#CBD5E1] rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateStorageQuota(selectedStorageProject.projectId, Number(newQuotaGb))}
                      disabled={!newQuotaGb || Number(newQuotaGb) <= 0}
                      className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#2563EB] text-white rounded-lg text-xs font-semibold shadow-lg shadow-[#1E3A8A]/30 disabled:opacity-50"
                    >
                      Save Quota Override
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: SECURITY & ABUSE (E) ======================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Top Security Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                <span className="text-xs text-[#94A3B8]">Active Blacklisted IPs</span>
                <div className="text-2xl font-black text-[#EF4444] font-mono mt-1">
                  {securityData?.banned_ips?.length || 2}
                </div>
                <span className="text-[10px] text-[#64748B] font-mono">1-hour auto quarantine</span>
              </div>

              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                <span className="text-xs text-[#94A3B8]">Suspicious IP Clusters</span>
                <div className="text-2xl font-black text-[#F59E0B] font-mono mt-1">
                  {securityData?.suspicious_clusters?.length || 2}
                </div>
                <span className="text-[10px] text-[#64748B] font-mono">Multiple accounts per IP</span>
              </div>

              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                <span className="text-xs text-[#94A3B8]">Spam Databases Flagged</span>
                <div className="text-2xl font-black text-[#38BDF8] font-mono mt-1">
                  {securityData?.spam_projects?.length || 1}
                </div>
                <span className="text-[10px] text-[#64748B] font-mono">Empty DB without queries</span>
              </div>
            </div>

            {/* Banned IPs Manager & Manual IP Ban */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Banned IPs */}
              <div className="lg:col-span-2 bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#EF4444]" />
                  <span>Banned IP Addresses (Intrusion Shield)</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#111827] text-[#94A3B8] font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">IP Address</th>
                        <th className="p-2.5">Ban Reason</th>
                        <th className="p-2.5">Banned At</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      {securityData?.banned_ips?.map((b: any) => (
                        <tr key={b.ip} className="hover:bg-[#111827]/40 font-mono text-[11px]">
                          <td className="p-2.5 font-bold text-[#F87171]">{b.ip}</td>
                          <td className="p-2.5 text-[#CBD5E1] truncate max-w-xs">{b.reason}</td>
                          <td className="p-2.5 text-[#64748B]">
                            {new Date(b.bannedAt).toLocaleTimeString('en-IN')}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleUnbanIp(b.ip)}
                              className="px-2 py-0.5 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#34D399] rounded font-semibold text-[10px]"
                            >
                              Unban IP
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Manual IP Ban */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                  Manual IP Quarantine
                </h4>
                <form onSubmit={handleBanIp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">Target IP Address</label>
                    <input
                      type="text"
                      required
                      placeholder="185.220.101.42"
                      value={newBanIp}
                      onChange={(e) => setNewBanIp(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#EF4444]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">Reason / Abuse Tag</label>
                    <input
                      type="text"
                      placeholder="Malicious scanning, SQL injection probe..."
                      value={newBanReason}
                      onChange={(e) => setNewBanReason(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#EF4444]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold py-2 rounded-lg text-xs transition-all shadow-md shadow-[#EF4444]/20"
                  >
                    Blacklist IP
                  </button>
                </form>
              </div>
            </div>

            {/* Suspicious Activity Radar */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Suspicious IP Clusters (Multi-Account Fingerprinting)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityData?.suspicious_clusters?.map((cluster: any) => (
                  <div
                    key={cluster.ip}
                    className="p-3.5 bg-[#111827] border border-[#1E293B] rounded-lg text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white">{cluster.ip}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#EF4444]/20 text-[#F87171]">
                        {cluster.risk_score} RISK
                      </span>
                    </div>
                    <p className="mt-1.5 text-[#CBD5E1] text-[11px]">{cluster.reason}</p>
                    <div className="mt-2 text-[10px] text-[#94A3B8] font-mono">
                      Associated Emails: {cluster.associated_emails?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: REVENUE & BILLING (F) ======================= */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Plan Breakdown Visual Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {revenueData?.plan_breakdown?.map((plan: any) => (
                <div key={plan.plan} className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{plan.plan} Tier</span>
                    <span className="font-mono text-[#38BDF8] text-[11px]">{plan.percentage}%</span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-white font-mono">
                    {plan.users_count}{' '}
                    <span className="text-xs text-[#64748B] font-normal">subscribers</span>
                  </div>
                  <div className="mt-2 text-xs font-mono text-[#10B981]">
                    ₹{(plan.revenue_inr || 0).toLocaleString('en-IN')}/mo
                  </div>
                </div>
              ))}
            </div>

            {/* Active Subscriptions Table */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Active Paid Subscriptions
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111827] text-[#94A3B8] font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">User</th>
                      <th className="p-2.5">Plan</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Cycle</th>
                      <th className="p-2.5">Next Renewal</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {revenueData?.subscriptions?.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-[#111827]/40 font-mono text-[11px]">
                        <td className="p-2.5 text-white font-sans font-medium">{sub.user_email}</td>
                        <td className="p-2.5 text-[#38BDF8] font-bold">{sub.plan}</td>
                        <td className="p-2.5 text-[#10B981]">₹{sub.amount.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-[#94A3B8] uppercase">{sub.billing_interval}</td>
                        <td className="p-2.5 text-[#64748B]">
                          {new Date(sub.current_period_end).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.status === 'active'
                                ? 'bg-[#10B981]/20 text-[#34D399]'
                                : 'bg-[#EF4444]/20 text-[#F87171]'
                            }`}
                          >
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Failed Payments & Retry Section */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                <span>Failed Payments &amp; Automatic Recovery</span>
              </h4>

              <div className="space-y-3">
                {revenueData?.failed_payments?.map((pay: any) => (
                  <div
                    key={pay.id}
                    className="p-3.5 bg-[#111827] border border-[#EF4444]/30 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{pay.user_email}</span>
                      <div className="text-[11px] text-[#F87171] mt-0.5 font-mono">
                        ₹{pay.amount} • {pay.failure_reason} (Attempts: {pay.retry_count})
                      </div>
                    </div>
                    <button
                      onClick={() => handleRetryPayment(pay.id)}
                      className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#2563EB] text-white rounded-lg text-xs font-semibold"
                    >
                      Retry Payment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: SYSTEM LOGS & AUDIT (G) ======================= */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="flex items-center space-x-2 bg-[#0F172A] border border-[#1E293B] p-3 rounded-xl overflow-x-auto text-xs">
              {['all', 'audit', 'errors', 'provisioning'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLogsCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-mono text-xs transition-colors ${
                    logsCategory === cat
                      ? 'bg-[#1E3A8A] text-white'
                      : 'text-[#94A3B8] hover:bg-[#111827] hover:text-white'
                  }`}
                >
                  {cat === 'audit' ? 'Admin Audit Trail' : cat === 'errors' ? 'System Errors' : cat}
                </button>
              ))}
            </div>

            {/* Audit Logs */}
            {(logsCategory === 'all' || logsCategory === 'audit') && (
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                  Sovereign Admin Audit Trail (Every Administrative Action)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#111827] text-[#94A3B8] font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Action</th>
                        <th className="p-2.5">Admin Email</th>
                        <th className="p-2.5">Target</th>
                        <th className="p-2.5">IP Address</th>
                        <th className="p-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B] font-mono text-[11px]">
                      {logsData?.audit_logs?.map((log: any) => (
                        <tr key={log.id} className="hover:bg-[#111827]/40">
                          <td className="p-2.5 font-bold text-[#38BDF8]">{log.action}</td>
                          <td className="p-2.5 text-[#CBD5E1]">{log.admin_email}</td>
                          <td className="p-2.5 text-[#94A3B8]">
                            {log.target_type} ({log.target_id})
                          </td>
                          <td className="p-2.5 text-[#64748B]">{log.ip_address}</td>
                          <td className="p-2.5 text-[#64748B]">
                            {new Date(log.created_at).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* System Error Logs */}
            {(logsCategory === 'all' || logsCategory === 'errors') && (
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  <span>Platform System Errors &amp; Stack Traces</span>
                </h4>
                <div className="space-y-3">
                  {logsData?.error_logs?.map((err: any) => (
                    <div
                      key={err.id}
                      className="p-3.5 bg-[#111827] border border-[#EF4444]/30 rounded-lg text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-[#EF4444]">
                          {err.method} {err.endpoint} ({err.status_code})
                        </span>
                        <span className="text-[#64748B]">
                          {new Date(err.created_at).toLocaleTimeString('en-IN')}
                        </span>
                      </div>
                      <p className="mt-1 text-white font-medium">{err.error_message}</p>
                      {err.stack_trace && (
                        <pre className="mt-2 p-2 bg-[#070B14] rounded font-mono text-[10px] text-[#94A3B8] overflow-x-auto">
                          {err.stack_trace}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: ALERTS & GMAIL SETTINGS ======================= */}
        {activeTab === 'alerts' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-6">
              <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-[#38BDF8]" />
                <span>Admin Alert Pipeline Configuration</span>
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-6">
                Hind DB delivers automated security and health alerts directly to your Gmail inbox.
                Instant alerts fire on critical service disruptions, while a daily pulse summary is
                dispatched at 9:00 PM IST.
              </p>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-[#111827] rounded-lg border border-[#1E293B] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">Recipient Gmail</span>
                    <p className="text-[11px] text-[#64748B] font-mono mt-0.5">
                      Configured in .env / config
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#38BDF8]">
                    {adminUser.email || 'tumhara@gmail.com'}
                  </span>
                </div>

                <div className="p-3.5 bg-[#111827] rounded-lg border border-[#1E293B] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">Daily Operations Pulse</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Automated platform summary at 9:00 PM IST
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded">
                    SCHEDULED 21:00 IST
                  </span>
                </div>

                <div className="p-3.5 bg-[#111827] rounded-lg border border-[#1E293B] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">Outage Trigger Threshold</span>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Consecutive downtime duration before firing emergency email
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#F59E0B]">5 Minutes</span>
                </div>
              </div>

              {/* Manual Trigger Buttons */}
              <div className="mt-6 pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSendTestAlert}
                  className="flex-1 py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#2563EB] text-white font-semibold rounded-lg text-xs transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Test Security Alert to Gmail</span>
                </button>

                <button
                  onClick={handleSendDailySummaryNow}
                  className="flex-1 py-2.5 px-4 bg-[#111827] hover:bg-[#1E293B] text-white font-semibold rounded-lg text-xs transition-all border border-[#1E293B] flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4 text-[#F59E0B]" />
                  <span>Send 9:00 PM Daily Summary Now</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
