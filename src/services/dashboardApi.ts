/**
 * Hind DB - Complete Dashboard Client API
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { apiFetch } from './api';

export interface DatabaseItem {
  id: string;
  name: string;
  region: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  status: 'ACTIVE' | 'PROVISIONING' | 'MAINTENANCE';
  size_bytes: number;
  created_at: string;
  tablesCount: number;
  rowsCount: number;
}

export interface ColumnDefinition {
  name: string;
  type: string;
  isPrimary?: boolean;
  nullable?: boolean;
  default?: string;
}

export interface TableItem {
  id: string;
  name: string;
  row_count: number;
  rls_enabled: boolean;
  schema: ColumnDefinition[];
  created_at: string;
}

export interface StorageFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  size: number;
  mime?: string;
  itemsCount?: number;
  modified: string;
  publicUrl?: string;
}

export interface EdgeFunction {
  id: string;
  name: string;
  slug: string;
  runtime: string;
  trigger_type: string;
  status: 'DEPLOYED' | 'BUILDING' | 'FAILED';
  invocations: number;
  avg_latency_ms: number;
  created_at: string;
  code: string;
}

export interface TeamMember {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  joined_at: string;
  is_owner?: boolean;
  avatar_url?: string;
}

export interface ApiKeyItem {
  id: string;
  database_id?: string;
  name: string;
  key?: string; // only present once upon creation
  key_prefix: string;
  role: 'anon' | 'service_role' | 'admin' | 'developer';
  created_at: string;
  last_used_at: string | null;
  revoked_at?: string | null;
  created_by?: string;
}

// Initial default datasets (Clean - no fake mock data)
const SEED_DATABASES: DatabaseItem[] = [];
const SEED_TABLES: TableItem[] = [];
const SEED_ROWS: Record<string, any[]> = {};
const SEED_STORAGE_FILES: StorageFile[] = [];
const SEED_FUNCTIONS: EdgeFunction[] = [];
const SEED_TEAM: TeamMember[] = [];
const SEED_API_KEYS: ApiKeyItem[] = [];

// Helper to sanitize and load localStorage, purging legacy mock data
function getCleanStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  if (
    raw.includes('db_sovereign_01') ||
    raw.includes('production-ecommerce-cluster') ||
    raw.includes('quick_commerce_orders') ||
    raw.includes('aarav.sharma@hind.io') ||
    raw.includes('fn_razorpay') ||
    raw.includes('production-assets-sovereign')
  ) {
    localStorage.removeItem(key);
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export const dashboardApi = {
  // Databases
  getDatabases(): DatabaseItem[] {
    return getCleanStorage('hind_databases', SEED_DATABASES);
  },

  createDatabase(name: string, region: string, plan: 'Free' | 'Pro' | 'Enterprise'): DatabaseItem {
    const dbs = this.getDatabases();
    const newDb: DatabaseItem = {
      id: `db_${Date.now()}`,
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      region,
      plan,
      status: 'ACTIVE',
      size_bytes: 10485760,
      created_at: new Date().toISOString(),
      tablesCount: 0,
      rowsCount: 0,
    };
    const updated = [newDb, ...dbs];
    localStorage.setItem('hind_databases', JSON.stringify(updated));
    return newDb;
  },

  deleteDatabase(id: string) {
    const dbs = this.getDatabases().filter((d) => d.id !== id);
    localStorage.setItem('hind_databases', JSON.stringify(dbs));
  },

  // Tables
  getTables(): TableItem[] {
    return getCleanStorage('hind_tables', SEED_TABLES);
  },

  createTable(name: string, schema: ColumnDefinition[], rlsEnabled: boolean = true): TableItem {
    const tables = this.getTables();
    const newTable: TableItem = {
      id: `tbl_${Date.now()}`,
      name: name.trim().toLowerCase().replace(/\s+/g, '_'),
      row_count: 0,
      rls_enabled: rlsEnabled,
      schema,
      created_at: new Date().toISOString(),
    };
    const updated = [...tables, newTable];
    localStorage.setItem('hind_tables', JSON.stringify(updated));
    return newTable;
  },

  // Rows & Data
  getTableRows(tableName: string): any[] {
    return getCleanStorage(`hind_rows_${tableName}`, SEED_ROWS[tableName] || []);
  },

  insertRow(tableName: string, rowData: any): any {
    const rows = this.getTableRows(tableName);
    const newRow = {
      id: rowData.id || `row_${Date.now()}`,
      ...rowData,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    const updated = [newRow, ...rows];
    localStorage.setItem(`hind_rows_${tableName}`, JSON.stringify(updated));
    return newRow;
  },

  updateRow(tableName: string, rowId: string, updates: any): any {
    const rows = this.getTableRows(tableName);
    const updated = rows.map((r) => (r.id === rowId ? { ...r, ...updates } : r));
    localStorage.setItem(`hind_rows_${tableName}`, JSON.stringify(updated));
    return updates;
  },

  deleteRow(tableName: string, rowId: string) {
    const rows = this.getTableRows(tableName).filter((r) => r.id !== rowId);
    localStorage.setItem(`hind_rows_${tableName}`, JSON.stringify(rows));
  },

  // SQL Query Runner
  executeSql(queryStr: string): { columns: string[]; rows: any[]; latencyMs: number; count: number } {
    const latency = +(1.2 + Math.random() * 1.5).toFixed(2);
    const queryLower = queryStr.toLowerCase();
    const match = queryLower.match(/from\s+([a-zA-Z0-9_]+)/);
    const tableName = match ? match[1] : '';
    const rows = tableName ? this.getTableRows(tableName) : [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : ['id', 'created_at'];
    return {
      columns,
      rows,
      latencyMs: latency,
      count: rows.length,
    };
  },

  // Storage
  getStorageFiles(): StorageFile[] {
    return getCleanStorage('hind_storage_files', SEED_STORAGE_FILES);
  },

  uploadFile(file: { name: string; size: number; mime?: string }): StorageFile {
    const files = this.getStorageFiles();
    const newFile: StorageFile = {
      id: `f_${Date.now()}`,
      name: file.name,
      type: 'file',
      path: `/${file.name}`,
      size: file.size,
      mime: file.mime || 'application/octet-stream',
      modified: new Date().toISOString(),
      publicUrl: `https://storage.hind.io/production-assets/${file.name}`,
    };
    const updated = [newFile, ...files];
    localStorage.setItem('hind_storage_files', JSON.stringify(updated));
    return newFile;
  },

  deleteFile(id: string) {
    const files = this.getStorageFiles().filter((f) => f.id !== id);
    localStorage.setItem('hind_storage_files', JSON.stringify(files));
  },

  // Functions (Real Authenticated API)
  async getEdgeFunctions(databaseId: string): Promise<EdgeFunction[]> {
    try {
      const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/functions`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || 'Failed to fetch functions');
      }
      return json.data || [];
    } catch (err: any) {
      console.warn('[dashboardApi.getEdgeFunctions fallback to local]:', err.message);
      return this.getFunctions();
    }
  },

  async createEdgeFunction(
    databaseId: string, 
    payload: { name: string; code?: string; trigger_type?: string }
  ): Promise<EdgeFunction> {
    const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/functions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      const err: any = new Error(json.details || json.error || json.message || 'Failed to create function');
      err.details = json.details;
      throw err;
    }
    return json.data;
  },

  async deployEdgeFunction(
    databaseId: string, 
    fnId: string, 
    payload: { code: string; name?: string; trigger_type?: string }
  ): Promise<EdgeFunction> {
    const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/functions/${encodeURIComponent(fnId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      const err: any = new Error(json.details || json.error || json.message || 'Failed to deploy function');
      err.details = json.details;
      throw err;
    }
    return json.data;
  },

  async deleteEdgeFunction(databaseId: string, fnId: string): Promise<void> {
    const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/functions/${encodeURIComponent(fnId)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to delete function');
    }
  },

  async invokeEdgeFunction(
    databaseId: string, 
    fnId: string, 
    payload: { method?: string; body?: any; headers?: any } = {}
  ): Promise<{
    status: number;
    data: any;
    consoleLogs: string[];
    durationMs: number;
    timestamp: string;
  }> {
    const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/functions/${encodeURIComponent(fnId)}/invoke`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to invoke function');
    }
    return json;
  },

  async getEdgeFunctionLogs(databaseId: string, fnId: string): Promise<string[]> {
    try {
      const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/functions/${encodeURIComponent(fnId)}/logs`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || 'Failed to fetch function logs');
      }
      return json.data || [];
    } catch (err: any) {
      console.warn('[dashboardApi.getEdgeFunctionLogs fallback]:', err.message);
      return [];
    }
  },

  // Functions (Legacy LocalStorage Fallbacks)
  getFunctions(): EdgeFunction[] {
    return getCleanStorage('hind_functions', SEED_FUNCTIONS);
  },

  createFunction(name: string, code: string, triggerType: string): EdgeFunction {
    const fns = this.getFunctions();
    const newFn: EdgeFunction = {
      id: `fn_${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      runtime: 'TypeScript',
      trigger_type: triggerType,
      status: 'DEPLOYED',
      invocations: 0,
      avg_latency_ms: 2.2,
      created_at: new Date().toISOString(),
      code,
    };
    const updated = [newFn, ...fns];
    localStorage.setItem('hind_functions', JSON.stringify(updated));
    return newFn;
  },

  saveFunctionCode(id: string, code: string) {
    const fns = this.getFunctions();
    const updated = fns.map((f) => (f.id === id ? { ...f, code } : f));
    localStorage.setItem('hind_functions', JSON.stringify(updated));
  },

  // Active Database ID
  getActiveDbId(): string | null {
    return localStorage.getItem('hind_active_db_id') || sessionStorage.getItem('hind_active_db_id') || null;
  },

  setActiveDbId(id: string): void {
    localStorage.setItem('hind_active_db_id', id);
    sessionStorage.setItem('hind_active_db_id', id);
  },

  // Team (Real Authenticated API)
  async getTeam(databaseId: string): Promise<TeamMember[]> {
    try {
      const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/team`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || 'Failed to fetch team members');
      }
      return json.data || [];
    } catch (err: any) {
      console.warn('[dashboardApi.getTeam fallback to local]:', err.message);
      return this.getTeamMembers();
    }
  },

  async inviteTeamMember(
    databaseId: string, 
    payload: { name: string; email: string; role: 'admin' | 'developer' | 'viewer' }
  ): Promise<{ member: TeamMember; devInviteLink?: string }> {
    const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/team/invites`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to send invitation');
    }
    return {
      member: json.data,
      devInviteLink: json.devInviteLink,
    };
  },

  async updateTeamMemberRole(
    databaseId: string, 
    memberId: string, 
    role: 'admin' | 'developer' | 'viewer'
  ): Promise<TeamMember> {
    const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/team/${encodeURIComponent(memberId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to update member role');
    }
    return json.data;
  },

  async deleteTeamMember(databaseId: string, memberId: string): Promise<void> {
    const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/team/${encodeURIComponent(memberId)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to remove member');
    }
  },

  async acceptInvite(token: string): Promise<{ success: boolean; databaseId: string; databaseName?: string; role?: string }> {
    const res = await apiFetch('/api/v1/databases/invites/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || json.error || 'Failed to accept invitation');
    }
    return json;
  },

  // Team (Legacy LocalStorage Fallbacks)
  getTeamMembers(): TeamMember[] {
    return getCleanStorage('hind_team', SEED_TEAM);
  },

  inviteMember(name: string, email: string, role: 'admin' | 'developer' | 'viewer'): TeamMember {
    const team = this.getTeamMembers();
    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      name,
      email,
      role,
      status: 'INVITED',
      joined_at: new Date().toISOString().substring(0, 10),
    };
    const updated = [...team, newMember];
    localStorage.setItem('hind_team', JSON.stringify(updated));
    return newMember;
  },

  removeMember(id: string) {
    const team = this.getTeamMembers().filter((m) => m.id !== id);
    localStorage.setItem('hind_team', JSON.stringify(team));
  },

  updateMemberRole(id: string, role: 'admin' | 'developer' | 'viewer') {
    const team = this.getTeamMembers().map((m) => (m.id === id ? { ...m, role } : m));
    localStorage.setItem('hind_team', JSON.stringify(team));
  },

  // API Keys (Real Authenticated API)
  async getProjectApiKeys(databaseId: string): Promise<ApiKeyItem[]> {
    try {
      const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/api-keys`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || 'Failed to fetch API keys');
      }
      return json.data || [];
    } catch (err: any) {
      console.warn('[dashboardApi.getProjectApiKeys fallback to local]:', err.message);
      return this.getApiKeys();
    }
  },

  async createProjectApiKey(
    databaseId: string,
    payload: { name: string; role: 'anon' | 'service_role' | 'admin' | 'developer' }
  ): Promise<{ keyItem: ApiKeyItem; fullKey: string }> {
    const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/api-keys`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to generate API key');
    }
    return {
      keyItem: json.data,
      fullKey: json.data.key,
    };
  },

  async revokeProjectApiKey(databaseId: string, keyId: string): Promise<void> {
    const res = await apiFetch(`/api/v1/databases/${encodeURIComponent(databaseId)}/api-keys/${encodeURIComponent(keyId)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to revoke API key');
    }
  },

  // API Keys (Legacy LocalStorage Fallbacks)
  getApiKeys(): ApiKeyItem[] {
    return getCleanStorage('hind_api_keys', SEED_API_KEYS);
  },

  createApiKey(name: string, role: 'anon' | 'service_role'): ApiKeyItem {
    const keys = this.getApiKeys();
    const generatedKey = `hk_live_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name,
      key: generatedKey,
      key_prefix: `${generatedKey.substring(0, 16)}...`,
      role,
      created_at: new Date().toISOString().substring(0, 10),
      last_used_at: 'Never',
    };
    const updated = [newKey, ...keys];
    localStorage.setItem('hind_api_keys', JSON.stringify(updated));
    return newKey;
  },

  revokeApiKey(id: string) {
    const keys = this.getApiKeys().filter((k) => k.id !== id);
    localStorage.setItem('hind_api_keys', JSON.stringify(keys));
  },
};
