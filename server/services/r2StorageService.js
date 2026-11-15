/**
 * Hind DB - Sovereign Storage Engine (Cloudflare R2 Backend)
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 *
 * NOTE: Cloudflare R2 is the underlying infrastructure, but all external branding,
 * URLs, headers, and dashboard interfaces are strictly 100% "Hind DB Storage".
 */

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import * as Minio from 'minio';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_STORAGE_DIR = path.resolve(__dirname, '../storage_data');

// Ensure local fallback directory exists
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  try {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  } catch (e) {}
}

let r2Client = null;
let isR2Connected = false;

// Initialize Cloudflare R2 Client via S3-Compatible protocol
function getR2Client() {
  if (r2Client) return r2Client;

  const { accountId, accessKeyId, secretAccessKey, endpoint } = config.r2;

  if (accountId && accessKeyId && secretAccessKey) {
    try {
      const r2Endpoint = endpoint
        ? endpoint.replace(/^https?:\/\//, '').split('/')[0]
        : `${accountId}.r2.cloudflarestorage.com`;

      r2Client = new Minio.Client({
        endPoint: r2Endpoint,
        port: 443,
        useSSL: true,
        accessKey: accessKeyId,
        secretKey: secretAccessKey,
        region: 'auto',
      });
      isR2Connected = true;
      console.log(`[Hind DB Storage] Cloudflare R2 S3 adapter initialized at ${r2Endpoint}`);
    } catch (err) {
      console.warn('[Hind DB Storage] R2 initialization notice:', err.message);
      isR2Connected = false;
    }
  }

  return r2Client;
}

// In-Memory & Local Disk Fallback Store (Sovereign Storage)
class LocalObjectStore {
  constructor() {
    this.memoryFiles = new Map(); // r2Key -> { buffer, mimeType, size, name }
  }

  async put(r2Key, buffer, mimeType) {
    this.memoryFiles.set(r2Key, {
      buffer,
      mimeType,
      size: buffer.length,
      savedAt: new Date().toISOString(),
    });

    // Also persist to disk if possible
    try {
      const sanitizedKey = r2Key.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = path.join(LOCAL_STORAGE_DIR, sanitizedKey);
      fs.writeFileSync(filePath, buffer);
    } catch (e) {}

    return { etag: `hind_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`, size: buffer.length };
  }

  async get(r2Key) {
    const memoryItem = this.memoryFiles.get(r2Key);
    if (memoryItem) return memoryItem;

    try {
      const sanitizedKey = r2Key.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = path.join(LOCAL_STORAGE_DIR, sanitizedKey);
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        return { buffer, mimeType: 'application/octet-stream', size: buffer.length };
      }
    } catch (e) {}

    return null;
  }

  async delete(r2Key) {
    this.memoryFiles.delete(r2Key);
    try {
      const sanitizedKey = r2Key.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = path.join(LOCAL_STORAGE_DIR, sanitizedKey);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {}
    return true;
  }
}

export const localStore = new LocalObjectStore();

export const r2Storage = {
  /**
   * Put Object to R2 or Sovereign Local Store
   */
  async putObject({ r2Key, buffer, mimeType = 'application/octet-stream', size }) {
    const client = getR2Client();
    const bucketName = config.r2.bucketName || 'hind-db-storage';

    if (client && isR2Connected) {
      try {
        await client.putObject(bucketName, r2Key, buffer, size || buffer.length, {
          'Content-Type': mimeType,
          'x-amz-meta-provider': 'Hind-DB-Storage',
        });
        return { success: true, provider: 'cloudflare_r2', r2Key };
      } catch (err) {
        console.warn(`[Hind DB Storage] R2 upload fallback triggered: ${err.message}`);
      }
    }

    // Fallback to Sovereign local/memory store
    await localStore.put(r2Key, buffer, mimeType);
    return { success: true, provider: 'sovereign_local', r2Key };
  },

  /**
   * Get Object Stream or Buffer from R2 or Local Store
   */
  async getObject({ r2Key }) {
    const client = getR2Client();
    const bucketName = config.r2.bucketName || 'hind-db-storage';

    if (client && isR2Connected) {
      try {
        const stream = await client.getObject(bucketName, r2Key);
        const stat = await client.statObject(bucketName, r2Key);
        return {
          stream,
          mimeType: stat.metaData?.['content-type'] || 'application/octet-stream',
          size: stat.size,
        };
      } catch (err) {
        console.warn(`[Hind DB Storage] R2 getObject fallback triggered: ${err.message}`);
      }
    }

    // Local Store
    const file = await localStore.get(r2Key);
    if (!file) return null;

    return {
      buffer: file.buffer,
      mimeType: file.mimeType || 'application/octet-stream',
      size: file.size,
    };
  },

  /**
   * Delete Object from R2 or Local Store
   */
  async deleteObject({ r2Key }) {
    const client = getR2Client();
    const bucketName = config.r2.bucketName || 'hind-db-storage';

    if (client && isR2Connected) {
      try {
        await client.removeObject(bucketName, r2Key);
      } catch (err) {
        console.warn(`[Hind DB Storage] R2 removeObject fallback triggered: ${err.message}`);
      }
    }

    await localStore.delete(r2Key);
    return true;
  },

  /**
   * Format Hind DB Branded URL
   * Example: https://storage.hinddb.com/{projectId}/{bucket}/{filename}
   * Local Proxy: /storage/v1/{bucket}/{filename}
   */
  formatHindDbUrl({ projectId = 'default_project', bucketName, fileName }) {
    const cleanFile = encodeURIComponent(fileName);
    const publicDomain = config.r2.publicBaseUrl.replace(/\/$/, '');
    return `${publicDomain}/${projectId}/${bucketName}/${cleanFile}`;
  },

  /**
   * Format Direct Proxy Serving URL (accessible immediately in development and web console)
   */
  formatProxyUrl({ bucketName, fileName }) {
    const cleanFile = encodeURIComponent(fileName);
    return `/storage/v1/${bucketName}/${cleanFile}`;
  },

  /**
   * Generate HMAC-SHA256 Signed URL for Private Buckets (1 hour default expiry)
   * Hind DB Branded URL: https://storage.hinddb.com/{projectId}/{bucket}/{filename}?token=...&expires=...
   */
  generateSignedUrl({ projectId = 'default_project', bucketName, fileName, expiresInSeconds = 3600 }) {
    const secret = process.env.STORAGE_SIGNING_SECRET || process.env.JWT_SECRET || 'hind_db_sovereign_storage_secret_key_2026';
    const expires = Math.floor(Date.now() / 1000) + (Number(expiresInSeconds) || 3600);
    const payload = `${projectId}:${bucketName}:${fileName}:${expires}`;
    const token = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const publicDomain = (config.r2?.publicBaseUrl || 'https://storage.hinddb.com').replace(/\/$/, '');
    const cleanFile = encodeURIComponent(fileName);
    const cleanProject = encodeURIComponent(projectId);
    const cleanBucket = encodeURIComponent(bucketName);

    const signedUrl = `${publicDomain}/${cleanProject}/${cleanBucket}/${cleanFile}?token=${token}&expires=${expires}`;
    const proxyUrl = `/storage/v1/${cleanBucket}/${cleanFile}?token=${token}&expires=${expires}&projectId=${cleanProject}`;

    return {
      signedUrl,
      proxyUrl,
      token,
      expires,
      expiresIn: Number(expiresInSeconds) || 3600,
    };
  },

  /**
   * Verify HMAC-SHA256 Signed URL for Private Buckets
   */
  verifySignedUrl({ projectId = 'default_project', bucketName, fileName, token, expires }) {
    if (!token || !expires) {
      return {
        valid: false,
        error: 'MISSING_SIGNATURE',
        message: 'Access denied: A valid signed URL token and expiration are required to view this private file.',
      };
    }

    const now = Math.floor(Date.now() / 1000);
    if (now > Number(expires)) {
      return {
        valid: false,
        error: 'EXPIRED_TOKEN',
        message: 'Signed URL has expired. Please request a new signed URL.',
      };
    }

    const secret = process.env.STORAGE_SIGNING_SECRET || process.env.JWT_SECRET || 'hind_db_sovereign_storage_secret_key_2026';
    const payload = `${projectId}:${bucketName}:${fileName}:${expires}`;
    const expectedToken = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    try {
      const tokenBuf = Buffer.from(String(token), 'hex');
      const expectedBuf = Buffer.from(expectedToken, 'hex');
      if (tokenBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
        return {
          valid: false,
          error: 'INVALID_SIGNATURE',
          message: 'Invalid signed URL signature.',
        };
      }
    } catch (e) {
      return {
        valid: false,
        error: 'INVALID_SIGNATURE',
        message: 'Invalid signed URL signature format.',
      };
    }

    return { valid: true };
  },

  /**
   * Security & Quota Validations
   */
  validateFile({ name, size, plan = 'Free', currentUsageBytes = 0, quotaOverrideBytes = null }) {
    const ext = path.extname(name || '').toLowerCase();

    // 1. Block executable / dangerous extensions
    const blocked = config.storage.blockedExtensions || ['.exe', '.sh', '.bat', '.cmd', '.msi'];
    if (blocked.includes(ext)) {
      throw new Error(`File upload blocked for security: executable files with extension '${ext}' are not permitted.`);
    }

    // 2. Enforce Max File Size per Plan
    // Free: 50MB, Pro: 200MB, Business/Enterprise: 500MB
    let maxSize = 50 * 1024 * 1024; // 50MB Free default
    if (plan === 'Pro') maxSize = 200 * 1024 * 1024; // 200MB
    if (plan === 'Business' || plan === 'Enterprise') maxSize = 500 * 1024 * 1024; // 500MB

    if (size > maxSize) {
      const maxMb = Math.round(maxSize / (1024 * 1024));
      throw new Error(`File exceeds the maximum allowed size of ${maxMb}MB for your ${plan} plan.`);
    }

    // 3. Storage Quota Check (with optional storage_quota_override_bytes)
    let quotaLimit = 1 * 1024 * 1024 * 1024; // 1GB Free default
    if (plan === 'Pro') quotaLimit = 10 * 1024 * 1024 * 1024; // 10GB
    if (plan === 'Business' || plan === 'Enterprise') quotaLimit = 100 * 1024 * 1024 * 1024; // 100GB

    // Apply storage quota override if set
    if (quotaOverrideBytes !== null && quotaOverrideBytes !== undefined && Number(quotaOverrideBytes) > 0) {
      quotaLimit = Number(quotaOverrideBytes);
    }

    if (currentUsageBytes + size > quotaLimit) {
      const quotaGb = (quotaLimit / (1024 * 1024 * 1024)).toFixed(0);
      throw new Error(`Storage quota limit (${quotaGb}GB) exceeded. Please upgrade your plan to upload more files.`);
    }

    return true;
  },
};

