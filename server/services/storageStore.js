/**
 * Hind DB - Sovereign Storage Data Store & Metadata Manager
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { query } from '../config/database.js';
import { config } from '../config/index.js';
import { r2Storage } from './r2StorageService.js';

class StorageMetadataStore {
  constructor() {
    this.buckets = new Map(); // key: `${projectId}:${bucketName}` -> bucket obj
    this.files = new Map(); // key: fileId -> file obj
    this.usage = new Map(); // key: projectId -> { usedBytes, quotaBytes, fileCount, plan }
    this.auditLogs = []; // recent audit logs
    this.rateLimits = new Map(); // key: projectId -> [timestamp, ...]
    this.quotaOverrides = new Map(); // key: projectId -> overrideBytes

    this.initSeedData();
  }

  initSeedData() {
    const defaultProj = 'default_project';

    // Seed Default 1GB Free Storage Quota
    this.usage.set(defaultProj, {
      projectId: defaultProj,
      usedBytes: 49283072, // ~47 MB
      quotaBytes: config.storage.freeQuotaBytes || 1073741824, // 1 GB
      fileCount: 4,
      plan: 'Free',
    });

    // Seed Buckets
    const defaultBuckets = [
      {
        id: 'bkt_public_01',
        projectId: defaultProj,
        name: 'assets',
        is_public: true,
        file_count: 3,
        size_bytes: 47185920,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'bkt_docs_02',
        projectId: defaultProj,
        name: 'documents',
        is_public: true,
        file_count: 1,
        size_bytes: 2097152,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];

    for (const b of defaultBuckets) {
      this.buckets.set(`${b.projectId}:${b.name}`, b);
    }

    // Seed Files
    const seedFiles = [
      {
        id: 'file_001',
        projectId: defaultProj,
        bucket_name: 'assets',
        name: 'hero-banner.png',
        path: 'assets/hero-banner.png',
        size_bytes: 3145728, // 3MB
        mime_type: 'image/png',
        r2_key: `${defaultProj}/assets/hero-banner.png`,
        public_url: r2Storage.formatHindDbUrl({ projectId: defaultProj, bucketName: 'assets', fileName: 'hero-banner.png' }),
        proxy_url: r2Storage.formatProxyUrl({ bucketName: 'assets', fileName: 'hero-banner.png' }),
        is_public: true,
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'file_002',
        projectId: defaultProj,
        bucket_name: 'assets',
        name: 'brand-logo.svg',
        path: 'assets/brand-logo.svg',
        size_bytes: 524288, // 512KB
        mime_type: 'image/svg+xml',
        r2_key: `${defaultProj}/assets/brand-logo.svg`,
        public_url: r2Storage.formatHindDbUrl({ projectId: defaultProj, bucketName: 'assets', fileName: 'brand-logo.svg' }),
        proxy_url: r2Storage.formatProxyUrl({ bucketName: 'assets', fileName: 'brand-logo.svg' }),
        is_public: true,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'file_003',
        projectId: defaultProj,
        bucket_name: 'assets',
        name: 'app-demo.mp4',
        path: 'assets/app-demo.mp4',
        size_bytes: 43515904, // 41.5MB
        mime_type: 'video/mp4',
        r2_key: `${defaultProj}/assets/app-demo.mp4`,
        public_url: r2Storage.formatHindDbUrl({ projectId: defaultProj, bucketName: 'assets', fileName: 'app-demo.mp4' }),
        proxy_url: r2Storage.formatProxyUrl({ bucketName: 'assets', fileName: 'app-demo.mp4' }),
        is_public: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'file_004',
        projectId: defaultProj,
        bucket_name: 'documents',
        name: 'hind-db-whitepaper.pdf',
        path: 'documents/hind-db-whitepaper.pdf',
        size_bytes: 2097152, // 2MB
        mime_type: 'application/pdf',
        r2_key: `${defaultProj}/documents/hind-db-whitepaper.pdf`,
        public_url: r2Storage.formatHindDbUrl({ projectId: defaultProj, bucketName: 'documents', fileName: 'hind-db-whitepaper.pdf' }),
        proxy_url: r2Storage.formatProxyUrl({ bucketName: 'documents', fileName: 'hind-db-whitepaper.pdf' }),
        is_public: true,
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ];

    for (const f of seedFiles) {
      this.files.set(f.id, f);
    }
  }

  // --- BUCKETS ---
  async listBuckets(projectId = 'default_project') {
    const result = [];
    for (const b of this.buckets.values()) {
      if (b.projectId === projectId) {
        result.push(b);
      }
    }
    return result;
  }

  async getBucket(projectId = 'default_project', bucketName) {
    return this.buckets.get(`${projectId}:${bucketName}`) || null;
  }

  async createBucket(projectId = 'default_project', { name, is_public = true }) {
    const cleanName = (name || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!cleanName) throw new Error('Bucket name is required');

    const key = `${projectId}:${cleanName}`;
    if (this.buckets.has(key)) {
      throw new Error(`Bucket '${cleanName}' already exists in this project.`);
    }

    const bucket = {
      id: `bkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      name: cleanName,
      is_public: Boolean(is_public),
      file_count: 0,
      size_bytes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.buckets.set(key, bucket);

    try {
      await query(
        `INSERT INTO storage_buckets (id, project_id, name, is_public, file_count, size_bytes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (project_id, name) DO NOTHING`,
        [bucket.id, bucket.projectId, bucket.name, bucket.is_public, 0, 0, bucket.created_at, bucket.updated_at]
      );
    } catch (e) {}

    return bucket;
  }

  async deleteBucket(projectId = 'default_project', bucketName) {
    const key = `${projectId}:${bucketName}`;
    const bucket = this.buckets.get(key);
    if (!bucket) throw new Error(`Bucket '${bucketName}' not found`);

    // Remove all files inside bucket
    for (const [id, f] of this.files.entries()) {
      if (f.projectId === projectId && f.bucket_name === bucketName) {
        await r2Storage.deleteObject({ r2Key: f.r2_key });
        this.files.delete(id);
      }
    }

    this.buckets.delete(key);

    try {
      await query('DELETE FROM storage_buckets WHERE project_id = $1 AND name = $2', [projectId, bucketName]);
    } catch (e) {}

    return true;
  }

  // --- FILES ---
  async listFiles(projectId = 'default_project', bucketName) {
    const result = [];
    for (const f of this.files.values()) {
      if (f.projectId === projectId && f.bucket_name === bucketName) {
        result.push(f);
      }
    }
    // Sort newest first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }

  async findFileByName(projectId = 'default_project', bucketName, fileName) {
    for (const f of this.files.values()) {
      if (f.projectId === projectId && f.bucket_name === bucketName && f.name.toLowerCase() === fileName.toLowerCase()) {
        return f;
      }
    }
    return null;
  }

  async saveFile(fileRecord) {
    this.files.set(fileRecord.id, fileRecord);

    // Update bucket stats
    const bKey = `${fileRecord.projectId}:${fileRecord.bucket_name}`;
    const bucket = this.buckets.get(bKey);
    if (bucket) {
      bucket.file_count += 1;
      bucket.size_bytes += fileRecord.size_bytes;
      bucket.updated_at = new Date().toISOString();
    }

    // Update project usage
    const usage = this.getProjectUsage(fileRecord.projectId);
    usage.usedBytes += fileRecord.size_bytes;
    usage.fileCount += 1;
    this.usage.set(fileRecord.projectId, usage);

    try {
      await query(
        `INSERT INTO storage_files (id, project_id, bucket_name, name, path, size_bytes, mime_type, r2_key, public_url, is_public, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          fileRecord.id,
          fileRecord.projectId,
          fileRecord.bucket_name,
          fileRecord.name,
          fileRecord.path,
          fileRecord.size_bytes,
          fileRecord.mime_type,
          fileRecord.r2_key,
          fileRecord.public_url,
          fileRecord.is_public,
          fileRecord.created_at,
          fileRecord.updated_at,
        ]
      );
    } catch (e) {}

    return fileRecord;
  }

  async deleteFile(projectId = 'default_project', fileId) {
    const file = this.files.get(fileId);
    if (!file || file.projectId !== projectId) return false;

    await r2Storage.deleteObject({ r2Key: file.r2_key });
    this.files.delete(fileId);

    // Update bucket stats
    const bKey = `${file.projectId}:${file.bucket_name}`;
    const bucket = this.buckets.get(bKey);
    if (bucket) {
      bucket.file_count = Math.max(0, bucket.file_count - 1);
      bucket.size_bytes = Math.max(0, bucket.size_bytes - file.size_bytes);
    }

    // Update project usage
    const usage = this.getProjectUsage(file.projectId);
    usage.usedBytes = Math.max(0, usage.usedBytes - file.size_bytes);
    usage.fileCount = Math.max(0, usage.fileCount - 1);
    this.usage.set(file.projectId, usage);

    try {
      await query('DELETE FROM storage_files WHERE id = $1 AND project_id = $2', [fileId, projectId]);
    } catch (e) {}

    return true;
  }

  async findFileById(projectId = 'default_project', fileId) {
    const f = this.files.get(fileId);
    if (f && f.projectId === projectId) return f;
    return null;
  }

  // Sanitize file object to ensure ZERO vendor leakage (strip r2_key)
  sanitizeFile(f) {
    if (!f) return null;
    return {
      id: f.id,
      name: f.name,
      bucket: f.bucket_name,
      path: f.path,
      size: f.size_bytes,
      mimeType: f.mime_type,
      publicUrl: f.public_url,
      proxyUrl: f.proxy_url,
      isPublic: Boolean(f.is_public),
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    };
  }

  // --- RATE LIMITING (100 uploads/hour per project) ---
  checkUploadRateLimit(projectId = 'default_project', maxPerHour = 100) {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    let timestamps = this.rateLimits.get(projectId) || [];
    timestamps = timestamps.filter((t) => t > oneHourAgo);

    if (timestamps.length >= maxPerHour) {
      const resetInSeconds = Math.ceil((timestamps[0] + 3600000 - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.max(1, resetInSeconds),
      };
    }

    timestamps.push(now);
    this.rateLimits.set(projectId, timestamps);
    return {
      allowed: true,
      remaining: maxPerHour - timestamps.length,
    };
  }

  // --- AUDIT LOGGING ---
  async logAudit({
    projectId = 'default_project',
    bucketName = '',
    fileName = '',
    action = 'UNKNOWN',
    bytes = 0,
    ipAddress = null,
    apiKeyId = null,
    userEmail = null,
  }) {
    const logEntry = {
      id: `sa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      project_id: projectId,
      bucket_name: bucketName,
      file_name: fileName,
      action,
      bytes: Number(bytes) || 0,
      ip_address: ipAddress || '127.0.0.1',
      api_key_id: apiKeyId || null,
      user_email: userEmail || null,
      created_at: new Date().toISOString(),
    };

    this.auditLogs.unshift(logEntry);
    if (this.auditLogs.length > 2000) {
      this.auditLogs.length = 2000;
    }

    try {
      await query(
        `INSERT INTO storage_audit_logs (id, project_id, bucket_name, file_name, action, bytes, ip_address, api_key_id, user_email, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          logEntry.id,
          logEntry.project_id,
          logEntry.bucket_name,
          logEntry.file_name,
          logEntry.action,
          logEntry.bytes,
          logEntry.ip_address,
          logEntry.api_key_id,
          logEntry.user_email,
          logEntry.created_at,
        ]
      );
    } catch (e) {}

    return logEntry;
  }

  getAuditLogs(projectId = null, limit = 50) {
    let logs = this.auditLogs;
    if (projectId) {
      logs = logs.filter((l) => l.project_id === projectId);
    }
    return logs.slice(0, limit);
  }

  // --- QUOTA OVERRIDES ---
  setQuotaOverride(projectId = 'default_project', overrideBytes) {
    const bytes = Number(overrideBytes) || 0;
    this.quotaOverrides.set(projectId, bytes);
    const usage = this.getProjectUsage(projectId);
    usage.quotaBytes = bytes > 0 ? bytes : 1073741824;
    this.usage.set(projectId, usage);
    return usage;
  }

  // --- USAGE & QUOTA ---
  getProjectUsage(projectId = 'default_project') {
    let u = this.usage.get(projectId);
    if (!u) {
      u = {
        projectId,
        usedBytes: 0,
        quotaBytes: config.storage.freeQuotaBytes || 1073741824, // 1GB
        fileCount: 0,
        plan: 'Free',
      };
      this.usage.set(projectId, u);
    }

    // Check if quota override exists
    let effectiveQuota = u.quotaBytes || config.storage.freeQuotaBytes || 1073741824;
    if (this.quotaOverrides.has(projectId) && this.quotaOverrides.get(projectId) > 0) {
      effectiveQuota = this.quotaOverrides.get(projectId);
    }

    const percentage = Number(((u.usedBytes / effectiveQuota) * 100).toFixed(1));

    return {
      ...u,
      quotaBytes: effectiveQuota,
      usedPercentage: percentage,
      isNearLimit: percentage >= 90.0,
      isQuotaExceeded: u.usedBytes >= effectiveQuota,
      quotaOverrideBytes: this.quotaOverrides.get(projectId) || null,
    };
  }
}

export const storageStore = new StorageMetadataStore();

