import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Search, 
  Trash2, 
  Smartphone, 
  Globe2
} from 'lucide-react';

export const AuthenticationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'providers' | 'users' | 'templates' | 'settings'>('providers');

  // Providers state
  const [emailAuthEnabled, setEmailAuthEnabled] = useState(true);
  const [magicLinkEnabled, setMagicLinkEnabled] = useState(true);
  const [phoneAuthEnabled, setPhoneAuthEnabled] = useState(true);
  const [smsGateway, setSmsGateway] = useState('MSG91 (India Sovereign SMS Route)');

  const [googleOauth, setGoogleOauth] = useState({ enabled: true, clientId: '819203912039-abc.apps.googleusercontent.com', clientSecret: '••••••••••••••••••••••••' });
  const [githubOauth, setGithubOauth] = useState({ enabled: true, clientId: 'Iv1.99a8b7c6d5e4f3a2', clientSecret: '••••••••••••••••••••••••' });
  const [microsoftOauth, setMicrosoftOauth] = useState({ enabled: false, clientId: '', clientSecret: '' });

  // Users state
  const [usersList, setUsersList] = useState([
    { id: 'usr_001', name: 'Aarav Sharma', email: 'aarav.sharma@quickmart.in', created_at: '2026-09-28', status: 'ACTIVE', provider: 'Google' },
    { id: 'usr_002', name: 'Priya Iyer', email: 'priya.iyer@finset.io', created_at: '2026-09-28', status: 'ACTIVE', provider: 'GitHub' },
    { id: 'usr_003', name: 'Rohan Gupta', email: 'rohan.g@bharatcart.in', created_at: '2026-09-27', status: 'ACTIVE', provider: 'Email' },
    { id: 'usr_004', name: 'Divya Reddy', email: 'divya.reddy@hyderabad.dev', created_at: '2026-09-26', status: 'UNVERIFIED', provider: 'Magic Link' },
    { id: 'usr_005', name: 'Vikram Malhotra', email: 'vikram.m@hind.io', created_at: '2026-09-25', status: 'ACTIVE', provider: 'Google' },
    { id: 'usr_006', name: 'Ananya Deshmukh', email: 'ananya.d@pune.org', created_at: '2026-09-24', status: 'ACTIVE', provider: 'Phone OTP' },
  ]);
  const [userSearch, setUserSearch] = useState('');

  // Template state
  const [templateType, setTemplateType] = useState<'verify' | 'reset' | 'magic'>('verify');
  const [emailSubject, setEmailSubject] = useState('Verify your email for Hind DB');

  const filteredUsers = usersList.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleDeleteUser = (id: string) => {
    setUsersList(usersList.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#1E3A8A]" />
            Authentication & User Identity
          </h1>
          <p className="text-[#475569] text-sm mt-1">
            Configure OAuth 2.0, OTP SMS verification, JWT sessions, and manage user identities.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          {(['providers', 'users', 'templates', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#1E3A8A] shadow-xs border border-[#CBD5E1]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Providers Tab */}
      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email / Password */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#1E3A8A]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">Email & Password Auth</h3>
                  <p className="text-xs text-[#64748B]">Allow signups using email & secure passwords</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAuthEnabled}
                onChange={(e) => setEmailAuthEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
            </div>
            <div className="text-xs text-[#475569] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-1">
              <p className="font-medium text-[#0F172A]">Enabled Security Rules:</p>
              <p>• Argon2id / bcrypt salted password hashing</p>
              <p>• Automatic rate-limiting on brute-force attempts</p>
            </div>
          </div>

          {/* Magic Links */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">Passwordless Magic Links</h3>
                  <p className="text-xs text-[#64748B]">One-click secure sign-in via tokenized email</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={magicLinkEnabled}
                onChange={(e) => setMagicLinkEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
            </div>
            <div className="text-xs text-[#475569] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-1">
              <p className="font-medium text-[#0F172A]">Token Lifespan:</p>
              <p>• 15-minute cryptographically signed nonces</p>
            </div>
          </div>

          {/* Phone Auth / SMS */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">Phone OTP Authentication</h3>
                  <p className="text-xs text-[#64748B]">Indian mobile OTP with SMS DLT routing</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={phoneAuthEnabled}
                onChange={(e) => setPhoneAuthEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                SMS Provider Route
              </label>
              <select
                value={smsGateway}
                onChange={(e) => setSmsGateway(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none"
              >
                <option value="MSG91 (India Sovereign SMS Route)">MSG91 (India Sovereign SMS Route)</option>
                <option value="Twilio Global">Twilio Global</option>
                <option value="Amazon SNS (ap-south-1)">Amazon SNS (ap-south-1)</option>
              </select>
            </div>
          </div>

          {/* Google OAuth */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#F97316]">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">Google OAuth 2.0</h3>
                  <p className="text-xs text-[#64748B]">One-tap login via Google Identity</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={googleOauth.enabled}
                onChange={(e) => setGoogleOauth({ ...googleOauth, enabled: e.target.checked })}
                className="w-5 h-5 rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Google Client ID"
                value={googleOauth.clientId}
                onChange={(e) => setGoogleOauth({ ...googleOauth, clientId: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#CBD5E1] outline-none"
              />
              <input
                type="password"
                placeholder="Google Client Secret"
                value={googleOauth.clientSecret}
                onChange={(e) => setGoogleOauth({ ...googleOauth, clientSecret: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#CBD5E1] outline-none"
              />
            </div>
          </div>

          {/* GitHub OAuth */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-[#0F172A]">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">GitHub OAuth 2.0</h3>
                  <p className="text-xs text-[#64748B]">Developer sign-in with GitHub authorization</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={githubOauth.enabled}
                onChange={(e) => setGithubOauth({ ...githubOauth, enabled: e.target.checked })}
                className="w-5 h-5 rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="GitHub Client ID"
                value={githubOauth.clientId}
                onChange={(e) => setGithubOauth({ ...githubOauth, clientId: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#CBD5E1] outline-none"
              />
              <input
                type="password"
                placeholder="GitHub Client Secret"
                value={githubOauth.clientSecret}
                onChange={(e) => setGithubOauth({ ...githubOauth, clientSecret: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#CBD5E1] outline-none"
              />
            </div>
          </div>

          {/* Microsoft OAuth */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#1E3A8A]">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">Microsoft Azure AD</h3>
                  <p className="text-xs text-[#64748B]">Enterprise Single Sign-On (SSO)</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={microsoftOauth.enabled}
                onChange={(e) => setMicrosoftOauth({ ...microsoftOauth, enabled: e.target.checked })}
                className="w-5 h-5 rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Azure AD Client ID"
                value={microsoftOauth.clientId}
                onChange={(e) => setMicrosoftOauth({ ...microsoftOauth, clientId: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#CBD5E1] outline-none"
              />
              <input
                type="password"
                placeholder="Azure AD Client Secret"
                value={microsoftOauth.clientSecret}
                onChange={(e) => setMicrosoftOauth({ ...microsoftOauth, clientSecret: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#CBD5E1] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search registered users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
            <span className="text-xs text-[#64748B] font-medium">
              Total registered users: {filteredUsers.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-white text-[#64748B] uppercase font-semibold">
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Provider</th>
                  <th className="py-3 px-5">Joined</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-semibold text-[#0F172A]">{u.name}</div>
                      <div className="text-[#64748B] text-[11px] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#1E3A8A] border border-blue-200">
                        {u.provider}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[#64748B] whitespace-nowrap">
                      {u.created_at}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-[#0F172A] text-base">Custom Transactional Email Templates</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Customize verification, magic links, and password reset email templates sent to your users.</p>
          </div>

          <div className="flex gap-2 border-b border-[#E2E8F0] pb-3">
            {[
              { id: 'verify', label: 'Email Verification' },
              { id: 'reset', label: 'Password Reset' },
              { id: 'magic', label: 'Magic Link' },
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setTemplateType(tmpl.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  templateType === tmpl.id
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Email Subject Line</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#CBD5E1] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">HTML Template Body</label>
              <textarea
                rows={6}
                defaultValue={`<h2>Welcome to Hind DB</h2>
<p>Click the link below to verify your sovereign account:</p>
<p><a href="{{ .ConfirmationURL }}">Verify My Account</a></p>
<hr />
<p style="font-size: 11px; color: #64748b;">© 2026 Hind. A Hind India Private Limited Company.</p>`}
                className="w-full font-mono text-xs p-4 rounded-xl border border-[#CBD5E1] bg-[#0F172A] text-emerald-400 outline-none"
              />
            </div>

            <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-semibold hover:bg-[#172554] shadow-xs">
              Save Template
            </button>
          </div>
        </div>
      )}

      {/* 4. Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-[#0F172A] text-base">Security & Session Policies</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Define global authentication policies and password complexity rules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2">
              <label className="block text-xs font-bold text-[#0F172A]">JWT Session Expiration</label>
              <select className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white outline-none">
                <option value="3600">1 Hour (Recommended for banking apps)</option>
                <option value="86400">24 Hours (Standard Web App)</option>
                <option value="604800">7 Days (Long-lived Session)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2">
              <label className="block text-xs font-bold text-[#0F172A]">Allow User Signups</label>
              <select className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white outline-none">
                <option value="open">Open (Public Registration)</option>
                <option value="invite">Invite Only (Admins manually invite)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
