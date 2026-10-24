import React, { useState } from 'react';
import { 
  Database, 
  Activity, 
  Table2, 
  ShieldCheck, 
  HardDrive, 
  Zap, 
  Settings, 
  Users, 
  Bell, 
  LogOut, 
  ChevronDown, 
  Menu, 
  Globe2, 
  ChevronRight, 
  Check, 
  PanelLeftClose, 
  PanelLeftOpen 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, type DatabaseItem } from '../../services/dashboardApi';

interface DashboardLayoutProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onNavigateLanding?: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onNavigateTab,
  onNavigateLanding,
  children,
}) => {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [databases] = useState<DatabaseItem[]>(() => dashboardApi.getDatabases());
  const [activeDatabase, setActiveDatabase] = useState<DatabaseItem>(
    () => databases[0] || { id: 'db_1', name: 'production-ecommerce-cluster', region: 'Sovereign-01', plan: 'Pro' }
  );
  const [dbDropdownOpen, setDbDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, text: 'Auto-snapshot Primary Cluster complete (4.2 GB)', time: '10m ago', unread: true },
    { id: 2, text: 'Function razorpay-webhook deployed successfully', time: '18m ago', unread: true },
    { id: 3, text: 'New login detected (Chrome / macOS)', time: '1h ago', unread: false },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity, badge: null },
    { id: 'databases', label: 'Database', icon: Database, badge: `${databases.length}` },
    { id: 'explorer', label: 'Database Explorer', icon: Table2, badge: 'SQL' },
    { id: 'auth', label: 'Authentication', icon: ShieldCheck, badge: null },
    { id: 'storage', label: 'Storage', icon: HardDrive, badge: 'S3' },
    { id: 'functions', label: 'Functions', icon: Zap, badge: 'Edge' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
    { id: 'team', label: 'Team', icon: Users, badge: null },
  ];

  const handleLogout = async () => {
    await logout();
    if (onNavigateLanding) onNavigateLanding();
  };

  const getBreadcrumbTitle = (tab: string) => {
    const item = navItems.find((n) => n.id === tab);
    return item ? item.label : 'Console';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col selection:bg-[#1E3A8A]/15 selection:text-[#1E3A8A]">
      
      <div className="flex-1 flex">
        {/* =========================================================================
            1. SIDEBAR (256px, collapsible, Light Theme)
            ========================================================================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-[#E2E8F0] shadow-xs flex flex-col justify-between transition-all duration-300 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          {/* Sidebar Top: Logo + Database Selector */}
          <div className="p-4 space-y-4">
            {/* Logo */}
            <div className="flex items-center justify-between">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateLanding) onNavigateLanding();
                }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Database className="w-5 h-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div className="truncate">
                    <span className="text-lg font-bold tracking-tight text-[#0F172A]">
                      Hind <span className="text-[#1E3A8A]">DB</span>
                    </span>
                    <span className="block text-[10px] text-[#64748B] font-mono leading-none">
                      Console v2.4
                    </span>
                  </div>
                )}
              </a>

              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </div>

            {/* Database Switcher Dropdown */}
            {!sidebarCollapsed && (
              <div className="relative">
                <button
                  onClick={() => setDbDropdownOpen(!dbDropdownOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#1E3A8A] text-left transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#0F172A] truncate font-mono">
                        {activeDatabase.name}
                      </p>
                      <p className="text-[10px] text-[#64748B] truncate">
                        {activeDatabase.region}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0 ml-1" />
                </button>

                {dbDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      Select Database
                    </div>
                    {databases.map((db) => (
                      <button
                        key={db.id}
                        onClick={() => {
                          setActiveDatabase(db);
                          setDbDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between ${
                          activeDatabase.id === db.id
                            ? 'bg-blue-50 text-[#1E3A8A] font-semibold'
                            : 'hover:bg-[#F8FAFC] text-[#334155]'
                        }`}
                      >
                        <span className="truncate font-mono">{db.name}</span>
                        {activeDatabase.id === db.id && <Check className="w-3.5 h-3.5 text-[#1E3A8A]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigateTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#475569]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Bottom: User Profile + Logout */}
          <div className="p-3 border-t border-[#E2E8F0] bg-[#FFFFFF]">
            <div className={`flex items-center gap-3 p-2 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] ${
              sidebarCollapsed ? 'justify-center p-1.5' : ''
            }`}>
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.charAt(0) : 'H'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#0F172A] truncate">
                    {user?.name || 'Aarav Sharma'}
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate">
                    {user?.email || 'aarav@hind.io'}
                  </p>
                </div>
              )}
              {!sidebarCollapsed && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
          />
        )}

        {/* =========================================================================
            2. TOP BAR (64px) + MAIN CONTENT CONTAINER
            ========================================================================= */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
          }`}
        >
          {/* Top Bar (64px) */}
          <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between shadow-xs">
            {/* Left: Mobile Menu Toggle + Breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span className="font-semibold text-[#0F172A]">Hind DB</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span className="font-mono hidden sm:inline">{activeDatabase.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:inline" />
                <span className="text-[#1E3A8A] font-bold">{getBreadcrumbTitle(currentTab)}</span>
              </div>
            </div>

            {/* Right: Search, Region Indicator, Notifications, Profile */}
            <div className="flex items-center gap-3">
              {/* Region Pill */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200 text-xs font-medium">
                <Globe2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>ap-south-1 (Sovereign)</span>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl relative transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F97316] rounded-full ring-2 ring-white" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                      <span className="text-xs font-bold text-[#0F172A]">Cluster Notifications</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">All Systems Normal</span>
                    </div>
                    <div className="space-y-2">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] text-xs">
                          <p className="font-medium text-[#0F172A]">{n.text}</p>
                          <span className="text-[10px] text-[#94A3B8]">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold text-xs border border-blue-200">
                  {user?.name ? user.name.charAt(0) : 'A'}
                </div>
                <span className="text-xs font-bold text-[#0F172A] hidden sm:inline">
                  {user?.name || 'Aarav'}
                </span>
              </div>
            </div>
          </header>

          {/* Dynamic Main Content Slot */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* =========================================================================
              3. FOOTER (Light theme with required copyright)
              ========================================================================= */}
          <footer className="bg-white border-t border-[#E2E8F0] py-4 px-6 text-center text-xs text-[#64748B]">
            <p className="font-medium">
              © 2026 Hind. A Hind India Private Limited Company.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};
