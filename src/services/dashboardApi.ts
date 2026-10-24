/**
 * Hind DB - Complete Dashboard Client API
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

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
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  joined_at: string;
  avatar_url?: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  role: 'anon' | 'service_role';
  created_at: string;
  last_used_at: string;
}

// Initial default seed datasets
const SEED_DATABASES: DatabaseItem[] = [
  {
    id: 'db_sovereign_01',
    name: 'production-ecommerce-cluster',
    region: 'Sovereign (ap-south-1)',
    plan: 'Pro',
    status: 'ACTIVE',
    size_bytes: 4294967296, // 4.2 GB
    created_at: '2026-09-15T10:00:00Z',
    tablesCount: 3,
    rowsCount: 101470,
  },
  {
    id: 'db_sovereign_02',
    name: 'analytics-telemetry-engine',
    region: 'Sovereign (ap-south-2)',
    plan: 'Enterprise',
    status: 'ACTIVE',
    size_bytes: 18253611008, // 18.2 GB
    created_at: '2026-08-20T14:30:00Z',
    tablesCount: 5,
    rowsCount: 2450000,
  },
  {
    id: 'db_delhi_03',
    name: 'quick-commerce-delivery-dev',
    region: 'Delhi NCR',
    plan: 'Free',
    status: 'ACTIVE',
    size_bytes: 524288000, // 500 MB
    created_at: '2026-09-24T09:15:00Z',
    tablesCount: 2,
    rowsCount: 12000,
  },
];

const SEED_TABLES: TableItem[] = [
  {
    id: 'tbl_orders',
    name: 'quick_commerce_orders',
    row_count: 85940,
    rls_enabled: true,
    created_at: '2026-09-20T10:00:00Z',
    schema: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, default: 'gen_random_uuid()' },
      { name: 'customer_name', type: 'VARCHAR(255)', isPrimary: false, nullable: false, default: '' },
      { name: 'amount_inr', type: 'INTEGER', isPrimary: false, nullable: false, default: '0' },
      { name: 'payment_method', type: 'VARCHAR(50)', isPrimary: false, nullable: false, default: 'UPI' },
      { name: 'status', type: 'VARCHAR(50)', isPrimary: false, nullable: false, default: 'DELIVERED' },
      { name: 'city', type: 'VARCHAR(100)', isPrimary: false, nullable: false, default: 'Delhi NCR' },
      { name: 'created_at', type: 'TIMESTAMP', isPrimary: false, nullable: false, default: 'NOW()' },
    ],
  },
  {
    id: 'tbl_users',
    name: 'users',
    row_count: 14280,
    rls_enabled: true,
    created_at: '2026-09-18T12:00:00Z',
    schema: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, default: 'gen_random_uuid()' },
      { name: 'email', type: 'VARCHAR(255)', isPrimary: false, nullable: false, default: '' },
      { name: 'name', type: 'VARCHAR(255)', isPrimary: false, nullable: false, default: '' },
      { name: 'phone', type: 'VARCHAR(20)', isPrimary: false, nullable: true, default: '' },
      { name: 'city', type: 'VARCHAR(100)', isPrimary: false, nullable: false, default: 'Hyderabad' },
      { name: 'created_at', type: 'TIMESTAMP', isPrimary: false, nullable: false, default: 'NOW()' },
    ],
  },
  {
    id: 'tbl_catalog',
    name: 'catalog_products',
    row_count: 1250,
    rls_enabled: false,
    created_at: '2026-09-22T08:30:00Z',
    schema: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, default: 'gen_random_uuid()' },
      { name: 'title', type: 'VARCHAR(255)', isPrimary: false, nullable: false, default: '' },
      { name: 'sku', type: 'VARCHAR(100)', isPrimary: false, nullable: false, default: '' },
      { name: 'price_inr', type: 'INTEGER', isPrimary: false, nullable: false, default: '499' },
      { name: 'category', type: 'VARCHAR(100)', isPrimary: false, nullable: false, default: 'Electronics' },
    ],
  },
];

const SEED_ROWS: Record<string, any[]> = {
  quick_commerce_orders: [
    { id: 'ord_del_101', customer_name: 'Aarav Sharma', amount_inr: 1499, payment_method: 'UPI (PhonePe)', status: 'DELIVERED', city: 'Delhi NCR', created_at: '2026-09-29 18:30:10' },
    { id: 'ord_hyd_102', customer_name: 'Pooja Iyer', amount_inr: 850, payment_method: 'RuPay Card', status: 'PROCESSING', city: 'Hyderabad', created_at: '2026-09-29 18:31:42' },
    { id: 'ord_del_103', customer_name: 'Rohan Gupta', amount_inr: 3200, payment_method: 'NetBanking (HDFC)', status: 'CONFIRMED', city: 'Delhi NCR', created_at: '2026-09-29 18:34:05' },
    { id: 'ord_hyd_104', customer_name: 'Divya Reddy', amount_inr: 950, payment_method: 'UPI (GPay)', status: 'DELIVERED', city: 'Hyderabad', created_at: '2026-09-29 18:38:19' },
    { id: 'ord_pune_105', customer_name: 'Ananya Deshmukh', amount_inr: 2150, payment_method: 'UPI (Paytm)', status: 'IN_TRANSIT', city: 'Pune', created_at: '2026-09-29 18:41:00' },
    { id: 'ord_che_106', customer_name: 'Karthik Subramanian', amount_inr: 1800, payment_method: 'RuPay Card', status: 'DELIVERED', city: 'Chennai', created_at: '2026-09-29 18:45:22' },
  ],
  users: [
    { id: 'usr_in_101', email: 'aarav.s@quickmart.in', name: 'Aarav Sharma', phone: '+91 98201 44910', city: 'Delhi NCR', created_at: '2026-09-28 14:10:00' },
    { id: 'usr_in_102', email: 'pooja.iyer@finset.io', name: 'Pooja Iyer', phone: '+91 94481 22819', city: 'Hyderabad', created_at: '2026-09-28 15:20:15' },
    { id: 'usr_in_103', email: 'rohan.g@bharatcart.in', name: 'Rohan Gupta', phone: '+91 98110 55192', city: 'Delhi NCR', created_at: '2026-09-28 16:45:30' },
    { id: 'usr_in_104', email: 'divya.reddy@hyderabad.dev', name: 'Divya Reddy', phone: '+91 99890 11223', city: 'Hyderabad', created_at: '2026-09-28 18:05:00' },
  ],
  catalog_products: [
    { id: 'prod_901', title: 'Noise-Cancelling Wireless Earbuds', sku: 'EAR-BOM-01', price_inr: 2499, category: 'Audio' },
    { id: 'prod_902', title: 'Ergonomic Mechanical Keyboard', sku: 'KEY-BLR-02', price_inr: 4999, category: 'Peripherals' },
    { id: 'prod_903', title: 'Ultra-Fast GaN 65W Fast Charger', sku: 'CHG-DEL-03', price_inr: 1299, category: 'Accessories' },
  ],
};

const SEED_STORAGE_FILES: StorageFile[] = [
  { id: 'f1', name: 'user_avatars', type: 'folder', path: '/user_avatars', size: 524288000, itemsCount: 1420, modified: '2026-09-29T12:00:00Z' },
  { id: 'f2', name: 'kyc_documents', type: 'folder', path: '/kyc_documents', size: 1610612736, itemsCount: 4800, modified: '2026-09-29T14:20:00Z' },
  { id: 'f3', name: 'product_catalog_2026.pdf', type: 'file', path: '/product_catalog_2026.pdf', size: 4820000, mime: 'application/pdf', modified: '2026-09-28T09:15:00Z', publicUrl: 'https://storage.hind.io/production-assets/product_catalog_2026.pdf' },
  { id: 'f4', name: 'hero_database_banner.png', type: 'file', path: '/hero_database_banner.png', size: 1250000, mime: 'image/png', modified: '2026-09-27T16:30:00Z', publicUrl: 'https://storage.hind.io/production-assets/hero_database_banner.png' },
  { id: 'f5', name: 'gst_invoice_template.xlsx', type: 'file', path: '/gst_invoice_template.xlsx', size: 340000, mime: 'application/vnd.ms-excel', modified: '2026-09-26T11:00:00Z', publicUrl: 'https://storage.hind.io/production-assets/gst_invoice_template.xlsx' },
];

const SEED_FUNCTIONS: EdgeFunction[] = [
  {
    id: 'fn_razorpay',
    name: 'razorpay-webhook-handler',
    slug: 'razorpay-webhook',
    runtime: 'TypeScript',
    trigger_type: 'HTTP Webhook',
    status: 'DEPLOYED',
    invocations: 124800,
    avg_latency_ms: 2.8,
    created_at: '2026-09-20T10:00:00Z',
    code: `import { serve } from '@hind/functions';
import crypto from 'crypto';

serve(async (req) => {
  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.json();

  // Validate Razorpay Webhook HMAC
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET || 'secret')
    .update(JSON.stringify(body))
    .digest('hex');

  if (signature === expectedSignature) {
    // Atomically fulfill order in PostgreSQL with RLS
    return new Response(JSON.stringify({ status: 'payment_processed', order_id: body.payload.payment.entity.order_id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Invalid Signature', { status: 400 });
});`,
  },
  {
    id: 'fn_whatsapp',
    name: 'whatsapp-order-notifier',
    slug: 'whatsapp-notifier',
    runtime: 'TypeScript',
    trigger_type: 'Database Webhook',
    status: 'DEPLOYED',
    invocations: 85200,
    avg_latency_ms: 3.4,
    created_at: '2026-09-22T14:15:00Z',
    code: `import { onDatabaseChange } from '@hind/functions';

onDatabaseChange({ table: 'quick_commerce_orders', event: 'INSERT' }, async (event) => {
  const { customer_name, amount_inr, city } = event.record;
  console.log(\`Sending instant WhatsApp alert to \${customer_name} for ₹\${amount_inr} in \${city}\`);
  return { delivered: true };
});`,
  },
];

const SEED_TEAM: TeamMember[] = [
  { id: 'tm_1', name: 'Aarav Sharma', email: 'aarav.sharma@hind.io', role: 'admin', status: 'ACTIVE', joined_at: '2026-08-01', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80' },
  { id: 'tm_2', name: 'Priya Iyer', email: 'priya.iyer@hind.io', role: 'developer', status: 'ACTIVE', joined_at: '2026-08-15', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' },
  { id: 'tm_3', name: 'Vikram Malhotra', email: 'vikram.m@hind.io', role: 'developer', status: 'ACTIVE', joined_at: '2026-09-01', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { id: 'tm_4', name: 'Ananya Deshmukh', email: 'ananya.d@hind.io', role: 'viewer', status: 'INVITED', joined_at: '2026-09-25' },
];

const SEED_API_KEYS: ApiKeyItem[] = [
  { id: 'key_1', name: 'Next.js Frontend Public Key', key: 'hind_anon_public_key_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', role: 'anon', created_at: '2026-09-15', last_used_at: 'Just now' },
  { id: 'key_2', name: 'FastAPI Backend Service Role', key: 'hind_service_role_key_sec_9941a8b72c918273645019283746...', role: 'service_role', created_at: '2026-09-18', last_used_at: '2 mins ago' },
];

export const dashboardApi = {
  // Databases
  getDatabases(): DatabaseItem[] {
    const raw = localStorage.getItem('hind_databases');
    return raw ? JSON.parse(raw) : SEED_DATABASES;
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
    const raw = localStorage.getItem('hind_tables');
    return raw ? JSON.parse(raw) : SEED_TABLES;
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
    const raw = localStorage.getItem(`hind_rows_${tableName}`);
    if (raw) return JSON.parse(raw);
    return SEED_ROWS[tableName] || [];
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

    if (queryLower.includes('users')) {
      const rows = this.getTableRows('users');
      return {
        columns: ['id', 'email', 'name', 'phone', 'city', 'created_at'],
        rows,
        latencyMs: latency,
        count: rows.length,
      };
    }

    const rows = this.getTableRows('quick_commerce_orders');
    return {
      columns: ['id', 'customer_name', 'amount_inr', 'payment_method', 'status', 'city', 'created_at'],
      rows,
      latencyMs: latency,
      count: rows.length,
    };
  },

  // Storage
  getStorageFiles(): StorageFile[] {
    const raw = localStorage.getItem('hind_storage_files');
    return raw ? JSON.parse(raw) : SEED_STORAGE_FILES;
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

  // Functions
  getFunctions(): EdgeFunction[] {
    const raw = localStorage.getItem('hind_functions');
    return raw ? JSON.parse(raw) : SEED_FUNCTIONS;
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

  // Team
  getTeamMembers(): TeamMember[] {
    const raw = localStorage.getItem('hind_team');
    return raw ? JSON.parse(raw) : SEED_TEAM;
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

  // API Keys
  getApiKeys(): ApiKeyItem[] {
    const raw = localStorage.getItem('hind_api_keys');
    return raw ? JSON.parse(raw) : SEED_API_KEYS;
  },

  createApiKey(name: string, role: 'anon' | 'service_role'): ApiKeyItem {
    const keys = this.getApiKeys();
    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name,
      key: `hind_${role}_key_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
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
