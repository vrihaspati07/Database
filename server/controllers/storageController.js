/**
 * Hind DB - Sovereign Storage Controller (Cloudflare R2 Backend)
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 *
 * NOTE: Cloudflare R2 serves as the underlying object storage infrastructure,
 * but ALL external interfaces, headers, error responses, URLs, and schemas are strictly
 * 100% "Hind DB Storage" (storage.hinddb.com). Zero vendor leakage.
 */

import { storageStore } from '../services/storageStore.js';
import { r2Storage } from '../services/r2StorageService.js';
import { logSecurityEvent } from '../services/adminService.js';

function resolveProjectId(req) {
  return (
    req.apiKey?.database_id ||
    req.projectId ||
    req.headers?.['x-project-id'] ||
    req.query?.projectId ||
    req.body?.projectId ||
    'default_project'
  );
}

export const storageController = {
  /**
   * 1. List Buckets for Project
   * GET /storage/v1/buckets
   */
  async listBuckets(req, res) {
    try {
      const projectId = resolveProjectId(req);
      const buckets = await storageStore.listBuckets(projectId);
      return res.json({ success: true, total: buckets.length, data: buckets });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 2. Create Storage Bucket
   * POST /storage/v1/buckets
   */
  async createBucket(req, res) {
    try {
      const projectId = resolveProjectId(req);
      const { name, is_public = true } = req.body || {};

      if (!name) {
        return res.status(400).json({ success: false, error: 'Bucket name is required.' });
      }

      const bucket = await storageStore.createBucket(projectId, { name, is_public });
      return res.status(201).json({
        success: true,
        message: `Bucket '${bucket.name}' created successfully.`,
        data: bucket,
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * 3. Delete Bucket
   * DELETE /storage/v1/buckets/:bucketName
   */
  async deleteBucket(req, res) {
    try {
      const projectId = resolveProjectId(req);
      const { bucketName } = req.params;

      await storageStore.deleteBucket(projectId, bucketName);
      return res.json({
        success: true,
        message: `Bucket '${bucketName}' and all stored assets deleted successfully.`,
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * 4. List Files in Bucket
   * GET /storage/v1/:bucket
   */
  async listFiles(req, res) {
    try {
      const projectId = resolveProjectId(req);
      const { bucket } = req.params;

      const rawFiles = await storageStore.listFiles(projectId, bucket);
      // Strip internal storage keys to ensure zero vendor leakage
      const sanitized = rawFiles.map((f) => storageStore.sanitizeFile(f));
      return res.json({ success: true, bucket, total: sanitized.length, data: sanitized });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 5. Upload File (Supports Multipart, Binary Buffer, and Base64 Payload)
   * POST /storage/v1/:bucket
   */
  async uploadFile(req, res) {
    try {
      const projectId = resolveProjectId(req);
      const { bucket } = req.params;

      // 1. Enforce Rate Limit: 100 uploads/hour per project
      const rateCheck = storageStore.checkUploadRateLimit(projectId, 100);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Upload rate limit exceeded: maximum 100 uploads per hour per project.',
          resetInSeconds: rateCheck.resetInSeconds,
        });
      }

      // 2. Ensure bucket exists or auto-create default
      let bucketRecord = await storageStore.getBucket(projectId, bucket);
      if (!bucketRecord) {
        bucketRecord = await storageStore.createBucket(projectId, { name: bucket, is_public: true });
      }

      // Check current project quota & status
      const usage = storageStore.getProjectUsage(projectId);
      if (usage.status === 'PAUSED') {
        return res.status(403).json({
          success: false,
          error: 'STORAGE_PAUSED',
          message: `Storage operations for project '${projectId}' are currently paused by platform administrator.`,
        });
      }

      let fileName = '';
      let fileBuffer = null;
      let mimeType = 'application/octet-stream';

      // Case A: JSON Payload with Base64 / Text content (SDK & Web direct upload)
      if (req.body && req.body.name && req.body.content) {
        fileName = req.body.name;
        mimeType = req.body.mime_type || req.body.mime || 'application/octet-stream';
        const rawContent = req.body.content;

        if (typeof rawContent === 'string' && rawContent.startsWith('data:')) {
          const parts = rawContent.split(';base64,');
          fileBuffer = Buffer.from(parts[1] || '', 'base64');
          if (parts[0]) mimeType = parts[0].replace('data:', '');
        } else if (typeof rawContent === 'string') {
          fileBuffer = Buffer.from(rawContent, 'base64');
        } else if (Buffer.isBuffer(rawContent)) {
          fileBuffer = rawContent;
        }
      }
      // Case B: Raw Binary Upload with headers (Content-Type + x-file-name)
      else if (req.body && Buffer.isBuffer(req.body)) {
        fileName = req.headers?.['x-file-name'] || req.query?.name || `file_${Date.now()}`;
        mimeType = req.headers?.['content-type'] || 'application/octet-stream';
        fileBuffer = req.body;
      }
      // Case C: Multipart parse fallback from multipart body parser
      else if (req.file) {
        fileName = req.file.originalname || req.file.name;
        mimeType = req.file.mimetype || 'application/octet-stream';
        fileBuffer = req.file.buffer;
      }

      if (!fileName || !fileBuffer || fileBuffer.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No file content received. Please attach a valid file buffer or base64 data.',
        });
      }

      // 3. Security & Quota Validations (enforcing plan limits & quota override)
      try {
        r2Storage.validateFile({
          name: fileName,
          size: fileBuffer.length,
          plan: usage.plan,
          currentUsageBytes: usage.usedBytes,
          quotaOverrideBytes: usage.quotaOverrideBytes,
        });
      } catch (validationErr) {
        // Log security blocked event if executable
        if (validationErr.message.includes('executable files')) {
          logSecurityEvent({
            event_type: 'MALICIOUS_UPLOAD_BLOCKED',
            severity: 'HIGH',
            description: `Blocked upload of executable file '${fileName}' to bucket '${bucket}'`,
            ip_address: req.ip || '127.0.0.1',
            metadata: { fileName, bucket, projectId },
          });
        }
        return res.status(400).json({ success: false, error: validationErr.message });
      }

      // 4. Generate Cloudflare R2 internal storage key (hidden from end-user)
      const r2Key = `${projectId}/${bucket}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      // Upload to R2 (or Sovereign Local Store fallback)
      await r2Storage.putObject({
        r2Key,
        buffer: fileBuffer,
        mimeType,
        size: fileBuffer.length,
      });

      // Hind DB public URL
      const publicUrl = r2Storage.formatHindDbUrl({ projectId, bucketName: bucket, fileName });
      const proxyUrl = r2Storage.formatProxyUrl({ bucketName: bucket, fileName });

      const fileRecord = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        projectId,
        bucket_name: bucket,
        name: fileName,
        path: `${bucket}/${fileName}`,
        size_bytes: fileBuffer.length,
        mime_type: mimeType,
        r2_key: r2Key,
        public_url: publicUrl,
        proxy_url: proxyUrl,
        is_public: bucketRecord.is_public,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await storageStore.saveFile(fileRecord);

      // 5. Audit Logging
      await storageStore.logAudit({
        projectId,
        bucketName: bucket,
        fileName,
        action: 'UPLOAD',
        bytes: fileBuffer.length,
        ipAddress: req.ip || req.headers?.['x-forwarded-for'] || '127.0.0.1',
        apiKeyId: req.apiKey?.id || null,
        userEmail: req.user?.email || null,
      });

      // Return sanitized object (ZERO vendor leakage)
      const sanitized = storageStore.sanitizeFile(fileRecord);

      return res.status(201).json({
        success: true,
        message: 'File successfully uploaded to Hind DB Storage.',
        data: sanitized,
      });
    } catch (err) {
      console.error('[StorageController Upload Error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 6. Download / View Public File Content (Supports HTTP Range for Media Streaming & Signed URLs for Private Buckets)
   * GET /storage/v1/:bucket/:filename
   */
  async servePublicFile(req, res) {
    try {
      const { bucket, filename } = req.params;
      const projectId = resolveProjectId(req);

      let fileRecord = await storageStore.findFileByName(projectId, bucket, filename);
      if (!fileRecord && projectId !== 'default_project') {
        fileRecord = await storageStore.findFileByName('default_project', bucket, filename);
      }

      if (!fileRecord) {
        return res.status(404).json({ success: false, error: 'File not found in this bucket.' });
      }

      // Check if private bucket
      if (!fileRecord.is_public) {
        // If caller is authenticated with an API key for this project, allow direct read
        const isApiKeyAuthorized = req.apiKey && req.apiKey.database_id === fileRecord.projectId;

        if (!isApiKeyAuthorized) {
          const { token, expires } = req.query;
          const verification = r2Storage.verifySignedUrl({
            projectId: fileRecord.projectId,
            bucketName: bucket,
            fileName: filename,
            token,
            expires,
          });

          if (!verification.valid) {
            const statusCode = verification.error === 'EXPIRED_TOKEN' ? 401 : 403;
            return res.status(statusCode).json({
              success: false,
              error: verification.error,
              message: verification.message,
            });
          }
        }
      }

      const fileData = await r2Storage.getObject({ r2Key: fileRecord.r2_key });
      if (!fileData) {
        return res.status(404).json({ success: false, error: 'File data unavailable on storage node.' });
      }

      const fileSize = fileData.size || fileRecord.size_bytes;
      const mimeType = fileData.mimeType || fileRecord.mime_type || 'application/octet-stream';

      // Audit Log Download
      storageStore.logAudit({
        projectId: fileRecord.projectId,
        bucketName: bucket,
        fileName: fileRecord.name,
        action: 'DOWNLOAD',
        bytes: fileSize,
        ipAddress: req.ip || req.headers?.['x-forwarded-for'] || '127.0.0.1',
        apiKeyId: req.apiKey?.id || null,
        userEmail: req.user?.email || null,
      });

      // HTTP Range Header Support (Audio/Video seekability)
      const range = req.headers?.range;
      if (range && typeof range === 'string' && range.startsWith('bytes=')) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (isNaN(start) || start >= fileSize || (parts[1] && (isNaN(end) || end < start || end >= fileSize))) {
          res.status(416);
          res.setHeader('Content-Range', `bytes */${fileSize}`);
          return res.end();
        }

        const chunkSize = end - start + 1;
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunkSize);
        res.setHeader('Content-Type', mimeType);
        res.setHeader('x-hind-storage-provider', 'Hind-DB-Sovereign-Storage');

        if (fileData.buffer) {
          return res.send(fileData.buffer.subarray(start, end + 1));
        } else if (fileData.stream) {
          return res.send(fileData.buffer ? fileData.buffer.subarray(start, end + 1) : null);
        }
      }

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', fileRecord.is_public ? 'public, max-age=31536000, immutable' : 'private, no-cache');
      res.setHeader('x-hind-storage-provider', 'Hind-DB-Sovereign-Storage');

      if (fileData.stream) {
        fileData.stream.pipe(res);
      } else {
        res.send(fileData.buffer);
      }
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 7. Generate Signed URL for Private Bucket File
   * POST /storage/v1/:bucket/signed-url
   */
  async createSignedUrl(req, res) {
    try {
      const projectId = resolveProjectId(req);
      const { bucket } = req.params;
      const { filename, fileName, expiresIn, expiresInSeconds } = req.body || {};

      const targetFileName = (filename || fileName || req.query.filename || '').trim();
      if (!targetFileName) {
        return res.status(400).json({
          success: false,
          error: 'Filename is required to generate a signed URL.',
        });
      }

      const duration = Number(expiresIn || expiresInSeconds) || 3600;

      const signedData = r2Storage.generateSignedUrl({
        projectId,
        bucketName: bucket,
        fileName: targetFileName,
        expiresInSeconds: duration,
      });

      // Audit Log Signed URL creation
      await storageStore.logAudit({
        projectId,
        bucketName: bucket,
        fileName: targetFileName,
        action: 'SIGNED_URL_CREATED',
        bytes: 0,
        ipAddress: req.ip || req.headers?.['x-forwarded-for'] || '127.0.0.1',
        apiKeyId: req.apiKey?.id || null,
        userEmail: req.user?.email || null,
      });

      return res.json({
        success: true,
        message: 'Signed URL generated successfully (valid for 1 hour).',
        data: signedData,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 8. Delete File
   * DELETE /storage/v1/:bucket/:fileId
   */
  async deleteFile(req, res) {
    try {
      const projectId = resolveProjectId(req);
      const { bucket, fileId } = req.params;

      // Check if fileId is an ID or filename
      let fileRecord = await storageStore.findFileById(projectId, fileId);
      if (!fileRecord) {
        fileRecord = await storageStore.findFileByName(projectId, bucket, fileId);
      }

      if (!fileRecord) {
        return res.status(404).json({ success: false, error: 'File not found or already deleted.' });
      }

      const deleted = await storageStore.deleteFile(projectId, fileRecord.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'File not found or already deleted.' });
      }

      // Audit Log Delete
      await storageStore.logAudit({
        projectId,
        bucketName: bucket,
        fileName: fileRecord.name,
        action: 'DELETE',
        bytes: fileRecord.size_bytes,
        ipAddress: req.ip || req.headers?.['x-forwarded-for'] || '127.0.0.1',
        apiKeyId: req.apiKey?.id || null,
        userEmail: req.user?.email || null,
      });

      return res.json({ success: true, message: 'File deleted from storage node.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 9. Storage Quota & Capacity Usage
   * GET /storage/v1/quota
   */
  async getStorageQuota(req, res) {
    try {
      const projectId = resolveProjectId(req);
      const usage = storageStore.getProjectUsage(projectId);
      return res.json({ success: true, data: usage });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 10. Storage Audit Logs
   * GET /storage/v1/audit-logs
   */
  async getAuditLogs(req, res) {
    try {
      const projectId = resolveProjectId(req);
      const limit = Number(req.query.limit) || 50;
      const logs = storageStore.getAuditLogs(projectId, limit);
      return res.json({ success: true, total: logs.length, data: logs });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 11. Set Project Quota Override (Admin / Service feature)
   * POST /storage/v1/quota/override
   */
  async setProjectQuotaOverride(req, res) {
    try {
      const projectId = resolveProjectId(req);
      const { quotaBytes } = req.body || {};

      if (!quotaBytes || Number(quotaBytes) <= 0) {
        return res.status(400).json({ success: false, error: 'Valid quotaBytes is required.' });
      }

      const updated = storageStore.setQuotaOverride(projectId, Number(quotaBytes));
      return res.json({
        success: true,
        message: `Storage quota override set to ${quotaBytes} bytes successfully.`,
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};
