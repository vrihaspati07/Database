/**
 * Hind DB - Sovereign Storage Routes
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import express from 'express';
import { storageController } from '../controllers/storageController.js';
import { requireApiKey } from '../middleware/apiKeyMiddleware.js';

const router = express.Router();

/**
 * Storage Authentication Middleware
 * Validates API key (Authorization: Bearer hk_live_... or x-api-key).
 * If invalid key is supplied, returns 401.
 * If cross-project access attempted, returns 404.
 * Public asset CDN routes (GET /:bucket/:filename) allow unauthenticated access for public buckets or signed URLs.
 */
async function storageAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const xApiKey = req.headers['x-api-key'];

  const hasApiKey = Boolean((authHeader && authHeader.trim()) || (xApiKey && String(xApiKey).trim()));

  if (hasApiKey) {
    // Strictly validate API key
    return requireApiKey(req, res, next);
  }

  // If no API key provided:
  // 1. Allow public asset download route through (will check public bucket or signed URL)
  if (req.method === 'GET' && req.params.bucket && req.params.filename) {
    return next();
  }

  // 2. Allow if internal console session or test projectId provided
  const hasInternalContext = Boolean(
    req.user ||
    req.headers['x-project-id'] ||
    req.query?.projectId ||
    req.body?.projectId
  );

  if (hasInternalContext) {
    return next();
  }

  // Otherwise, require API key
  return res.status(401).json({
    success: false,
    error: 'UNAUTHORIZED',
    message: 'Missing or malformed API key. Please provide Authorization: Bearer hk_live_... or x-api-key header.',
  });
}

/**
 * Lightweight multipart parser helper for raw buffers
 */
function parseMultipartBuffer(buffer, boundary) {
  try {
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    let startIdx = buffer.indexOf(boundaryBuffer);
    if (startIdx === -1) return null;

    // Move past boundary and newline
    startIdx += boundaryBuffer.length + 2;

    const headerEndIdx = buffer.indexOf(Buffer.from('\r\n\r\n'), startIdx);
    if (headerEndIdx === -1) return null;

    const headerStr = buffer.slice(startIdx, headerEndIdx).toString('utf8');
    const contentDisposition = headerStr.split('\r\n').find((h) => h.toLowerCase().includes('content-disposition'));
    const contentTypeHeader = headerStr.split('\r\n').find((h) => h.toLowerCase().includes('content-type'));

    let filename = 'uploaded_file';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/) || contentDisposition.match(/filename=([^;]+)/);
      if (match && match[1]) filename = match[1].trim();
    }

    let mimeType = 'application/octet-stream';
    if (contentTypeHeader) {
      const match = contentTypeHeader.match(/content-type:\s*([^\r\n;]+)/i);
      if (match && match[1]) mimeType = match[1].trim();
    }

    const nextBoundary = buffer.indexOf(Buffer.from(`\r\n--${boundary}`), headerEndIdx + 4);
    const fileDataEnd = nextBoundary !== -1 ? nextBoundary : buffer.length;
    const fileBuffer = buffer.slice(headerEndIdx + 4, fileDataEnd);

    return { filename, mimeType, fileBuffer };
  } catch (e) {
    return null;
  }
}

// Raw body parser for file uploads
const rawBodyParser = express.raw({
  type: (req) => {
    const ct = req.headers['content-type'] || '';
    return (
      ct.includes('multipart/form-data') ||
      ct.includes('application/octet-stream') ||
      ct.startsWith('image/') ||
      ct.startsWith('video/') ||
      ct.startsWith('audio/') ||
      ct.includes('pdf')
    );
  },
  limit: '550mb', // Supports up to Business/Enterprise 500MB uploads
});

// Middleware to preprocess uploads (JSON base64 vs Raw vs Multipart)
const handleUploadParsing = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  if (Buffer.isBuffer(req.body)) {
    if (contentType.includes('multipart/form-data')) {
      const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
      if (boundaryMatch) {
        const boundary = boundaryMatch[1].trim();
        const parsed = parseMultipartBuffer(req.body, boundary);
        if (parsed) {
          req.file = {
            originalname: parsed.filename,
            mimetype: parsed.mimeType,
            buffer: parsed.fileBuffer,
            size: parsed.fileBuffer.length,
          };
        }
      }
    } else {
      // Raw binary stream upload
      const name = req.headers['x-file-name'] || req.query.name || `file_${Date.now()}`;
      req.file = {
        originalname: name,
        mimetype: contentType || 'application/octet-stream',
        buffer: req.body,
        size: req.body.length,
      };
    }
  }

  next();
};

// ==========================================
// 1. SPECIFIC ENDPOINTS (Must precede /:bucket)
// ==========================================

// Quota & Overrides
router.get('/quota', storageAuthMiddleware, storageController.getStorageQuota);
router.post('/quota/override', storageAuthMiddleware, storageController.setProjectQuotaOverride);

// Storage Audit Logs
router.get('/audit-logs', storageAuthMiddleware, storageController.getAuditLogs);

// Buckets Management
router.get('/buckets', storageAuthMiddleware, storageController.listBuckets);
router.post('/buckets', storageAuthMiddleware, storageController.createBucket);
router.delete('/buckets/:bucketName', storageAuthMiddleware, storageController.deleteBucket);

// ==========================================
// 2. PARAMETERIZED ENDPOINTS
// ==========================================

// Generate Signed URL for Private Bucket File (Must precede /:bucket/:filename)
router.post('/:bucket/signed-url', storageAuthMiddleware, storageController.createSignedUrl);

// List Files in Bucket
router.get('/:bucket', storageAuthMiddleware, storageController.listFiles);

// Upload File to Bucket (Supports Multipart, Binary, Base64)
router.post('/:bucket', storageAuthMiddleware, rawBodyParser, handleUploadParsing, storageController.uploadFile);

// Public / Proxy Serve File Content (CDN delivery + Range streaming + Signed URLs)
router.get('/:bucket/:filename', storageAuthMiddleware, storageController.servePublicFile);

// Delete File from Bucket
router.delete('/:bucket/:fileId', storageAuthMiddleware, storageController.deleteFile);

export default router;
