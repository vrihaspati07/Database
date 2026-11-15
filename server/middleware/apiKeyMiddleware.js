/**
 * Hind DB - API Key Authentication Middleware
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import crypto from 'crypto';
import { apiKeyStore } from '../controllers/apiKeyController.js';
import { query } from '../config/database.js';

/**
 * Middleware: requireApiKey
 * Enforces Authorization: Bearer hk_live_... or x-api-key: hk_live_...
 * Wrong/missing/revoked key => 401
 * Resolves project and attaches req.projectId and req.databaseId
 * Cross-project access => 404
 */
export async function requireApiKey(req, res, next) {
  let rawKey = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    rawKey = authHeader.substring(7).trim();
  } else if (req.headers['x-api-key']) {
    rawKey = String(req.headers['x-api-key']).trim();
  }

  // 1. Check Missing or Malformed API Key
  if (!rawKey || !rawKey.startsWith('hk_live_')) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or malformed API key. Please provide Authorization: Bearer hk_live_... or x-api-key header.',
    });
  }

  // 2. Compute SHA-256 Hash
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  let keyRecord = null;
  try {
    const dbRes = await query(
      'SELECT id, database_id, name, role, key_prefix, key_hash, last_used_at, revoked_at, created_at FROM api_keys WHERE key_hash = $1',
      [keyHash]
    );
    if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
      keyRecord = dbRes.rows[0];
    }
  } catch (e) {}

  if (!keyRecord) {
    keyRecord = apiKeyStore.findByHash(keyHash);
  }

  // 3. Verify Key Existence
  if (!keyRecord) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_API_KEY',
      message: 'The provided API key is invalid.',
    });
  }

  // 4. Verify Revocation
  if (keyRecord.revoked_at) {
    return res.status(401).json({
      success: false,
      error: 'REVOKED_API_KEY',
      message: 'This API key has been revoked and can no longer be used.',
    });
  }

  // 5. Cross-Project Isolation Check (Cross-project access must return 404)
  const routeProjectId = req.params.id || req.params.projectId || req.query.projectId || req.headers['x-project-id'];
  if (routeProjectId && String(routeProjectId) !== String(keyRecord.database_id)) {
    return res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Project resource not found.',
    });
  }

  // 6. Update last_used_at in background
  apiKeyStore.updateLastUsed(keyRecord.id);
  query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [keyRecord.id]).catch(() => {});

  // 7. Attach Resolved Project & Key context
  req.apiKey = keyRecord;
  req.databaseId = keyRecord.database_id;
  req.projectId = keyRecord.database_id;
  req.project = {
    id: keyRecord.database_id,
    role: keyRecord.role,
  };

  next();
}

