import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  HardDrive, 
  Zap, 
  ArrowUpRight, 
  Plus, 
  BookOpen, 
  UserPlus, 
  ExternalLink,
  Clock
} from 'lucide-react';
import { dashboardApi } from '../../services/dashboardApi';

interface OverviewPageProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateTable?: () => void;
  onOpenInviteMember?: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ 
  onNavigateTab, 
  onOpenCreateTable, 
  onOpenInviteMember 
}) => {
  const [databases] = useState(() => dashboardApi.getDatabases());
  const activeDb = databases[0] || { name: 'production-ecommerce-cluster', region: 'Mumbai' };

  // 10 recent activity records
  const recentActivities = [
    { id: 1, action: 'Table Altered', detail: 'Added column `payment_mode` to `orders`', user: 'Aarav Sharma', timestamp: '2 minutes ago', type: 'schema' },
    { id: 2, action: 'Row Inserted', detail: 'New record created in `quick_commerce_orders`', user: 'API Gateway', timestamp: '5 minutes ago', type: 'write' },
    { id: 3, action: 'Function Deployed', detail: 'Deployed `razorpay-webhook-handler` v2.4', user: 'Priya Iyer', timestamp: '18 minutes ago', type: 'deploy' },
    { id: 4, action: 'File Uploaded', detail: '`kyc_documents/aadhaar_verify_992.pdf` (1.4 MB)', user: 'Storage Worker', timestamp: '42 minutes ago', type: 'storage' },
    { id: 5, action: 'API Key Created', detail: 'Generated `Next.js Production Anon Key`', user: 'Aarav Sharma', timestamp: '1 hour ago', type: 'security' },
    { id: 6, action: 'Backup Completed', detail: 'Automated snapshot taken (Mumbai ap-south-1)', user: 'Hind Automated Ops', timestamp: '2 hours ago', type: 'system' },
    { id: 7, action: 'RLS Policy Updated', detail: 'Enabled strict row isolation on `users` table', user: 'Vikram Malhotra', timestamp: '3 hours ago', type: 'schema' },
    { id: 8, action: 'Index Rebuilt', detail: 'GIN index optimized on `catalog_products.title`', user: 'Postgres Optimizer', timestamp: '4 hours ago', type: 'system' },
    { id: 9, action: 'Team Member Joined', detail: 'Priya Iyer accepted developer invite', user: 'Aarav Sharma', timestamp: '5 hours ago', type: 'team' },
    { id: 10, action: 'Database Scaled', detail: 'Compute allocated +2 vCPU auto-scale burst', user: 'AutoScaler', timestamp: '6 hours ago', type: 'system' },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Project Quick Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200">
              Active Database: {activeDb.name}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              Healthy (99.999% SLA)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2 tracking-tight">
            Database Overview
          </h1>
          <p className="text-[#475569] text-sm mt-1">
            Real-time analytics, database health metrics, and infrastructure telemetry from <span className="font-medium text-[#0F172A]">{activeDb.region}</span>.
          </p>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenCreateTable ? onOpenCreateTable() : onNavigateTab('explorer')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-xl shadow-xs transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Table</span>
          </button>
          <button
            onClick={() => onOpenInviteMember ? onOpenInviteMember() : onNavigateTab('team')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#0F172A] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl shadow-xs transition-all duration-150"
          >
            <UserPlus className="w-4 h-4 text-[#475569]" />
            <span>Invite Team</span>
          </button>
        </div>
      </div>

      {/* 1. Stats Cards (4 columns with number + trend %) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Requests */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Total Requests</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#1E3A8A]">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              142.8M
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                +14.2%
              </span>
              <span className="text-[#64748B] font-normal">vs last month</span>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-orange-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Active Users</span>
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#F97316]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              38,420
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                +8.7%
              </span>
              <span className="text-[#64748B] font-normal">vs last month</span>
            </div>
          </div>
        </div>

        {/* Database Size */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Database Size</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              23.4 GB
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-600">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                +2.1 GB
              </span>
              <span className="text-[#64748B] font-normal">of 100 GB tier</span>
            </div>
          </div>
        </div>

        {/* API Latency */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">API Latency (p99)</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              1.8 ms
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                ↓ -18.5%
              </span>
              <span className="text-[#64748B] font-normal">ultra-low latency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-3">
          Quick Actions & Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onOpenCreateTable ? onOpenCreateTable() : onNavigateTab('explorer')}
            className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#1E3A8A] hover:bg-blue-50/50 group transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-[#1E3A8A] group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Create New Table</p>
                <p className="text-xs text-[#64748B]">Add PostgreSQL relational table</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1E3A8A]" />
          </button>

          <a
            href="https://hind.io/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#1E3A8A] hover:bg-blue-50/50 group transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">View API Docs</p>
                <p className="text-xs text-[#64748B]">REST, GraphQL & SDK Guides</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1E3A8A]" />
          </a>

          <button
            onClick={() => onOpenInviteMember ? onOpenInviteMember() : onNavigateTab('team')}
            className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] hover:border-[#1E3A8A] hover:bg-blue-50/50 group transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 text-[#F97316] group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Invite Team Member</p>
                <p className="text-xs text-[#64748B]">Grant RBAC Admin or Dev access</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1E3A8A]" />
          </button>
        </div>
      </div>

      {/* 2. Recent Activity (10 Rows Table) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1E3A8A]" />
            <h2 className="text-base font-bold text-[#0F172A]">Recent Activity</h2>
          </div>
          <span className="text-xs text-[#64748B] font-medium">Last 10 audit events logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-white text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-5">Event</th>
                <th className="py-3 px-5">Details</th>
                <th className="py-3 px-5">Initiated By</th>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              {recentActivities.map((act) => (
                <tr key={act.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-[#0F172A] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        act.type === 'schema' ? 'bg-blue-500' :
                        act.type === 'write' ? 'bg-emerald-500' :
                        act.type === 'deploy' ? 'bg-purple-500' :
                        act.type === 'storage' ? 'bg-amber-500' :
                        act.type === 'security' ? 'bg-red-500' : 'bg-slate-400'
                      }`} />
                      {act.action}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#475569] max-w-md truncate">
                    {act.detail}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-[#0F172A] font-medium whitespace-nowrap">
                    {act.user}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-[#64748B] whitespace-nowrap">
                    {act.timestamp}
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Success
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infrastructure Telemetry Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 font-semibold">
            <span>CPU UTILIZATION</span>
            <span className="text-[#1E3A8A]">14.2%</span>
          </div>
          <div className="w-full bg-[#F1F5F9] rounded-full h-2">
            <div className="bg-[#1E3A8A] h-2 rounded-full" style={{ width: '14.2%' }} />
          </div>
          <p className="text-xs text-[#64748B] mt-2">8 vCPU Dedicated Intel Xeon</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 font-semibold">
            <span>MEMORY USAGE</span>
            <span className="text-[#F97316]">38.8%</span>
          </div>
          <div className="w-full bg-[#F1F5F9] rounded-full h-2">
            <div className="bg-[#F97316] h-2 rounded-full" style={{ width: '38.8%' }} />
          </div>
          <p className="text-xs text-[#64748B] mt-2">12.4 GB / 32 GB RAM active</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 font-semibold">
            <span>STORAGE IOPS</span>
            <span className="text-emerald-700">12,400 / 30,000</span>
          </div>
          <div className="w-full bg-[#F1F5F9] rounded-full h-2">
            <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '41.3%' }} />
          </div>
          <p className="text-xs text-[#64748B] mt-2">NVMe PCIe Gen4 Array (Mumbai)</p>
        </div>
      </div>
    </div>
  );
};
