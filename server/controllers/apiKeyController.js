/**
 * Hind DB - API Key Management Controller
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import crypto from 'crypto';
import { getDb } from '../services/access.js';
import { query } from '../config/database.js';

// In-Memory store for API keys (fallback & speed)
class ApiKeyStore {
  constructor() {
    this.keys = new Map(); // keyId -> keyRecord
  }

  getKeysByDb(dbId) {
    const list = [];
    for (const k of this.keys.values()) {
      if (k.database_id === dbId) list.push(k);
    }
    return list;
  }

  findKeyById(keyId) {
    return this.keys.get(keyId) || null;
  }

  findByHash(hash) {
    for (const k of this.keys.values()) {
      if (k.key_hash === hash) return k;
    }
    return null;
  }

  saveKey(keyRecord) {
    this.keys.set(keyRecord.id, keyRecord);
    return keyRecord;
  }

  revokeKey(keyId) {
    const k = this.keys.get(keyId);
    if (!k) return null;
    k.revoked_at = new Date().toISOString();
    this.keys.set(keyId, k);
    return k;
  }

  updateLastUsed(keyId) {
    const k = this.keys.get(keyId);
    if (k) {
      k.last_used_at = new Date().toISOString();
      this.keys.set(keyId, k);
    }
  }
}

export const apiKeyStore = new ApiKeyStore();

export const apiKeyController = {
  /**
   * 1. GET /api/v1/databases/:id/api-keys
   * List all API keys for a database (admin+)
   * Raw keys are NEVER returned here, only prefix & metadata
   */
  async listKeys(req, res) {
    try {
      const { db } = await getDb(req, 'admin');

      let keys = [];
      try {
        const dbRes = await query(
          'SELECT id, database_id, name, role, key_prefix, last_used_at, revoked_at, created_by, created_at FROM api_keys WHERE database_id = $1 ORDER BY created_at DESC',
          [db.id]
        );
        if (dbRes && dbRes.rows) {
          keys = dbRes.rows;
        }
      } catch (e) {}

      // Combine with memory store
      const memKeys = apiKeyStore.getKeysByDb(db.id);
      for (const m of memKeys) {
        if (!keys.some((k) => k.id === m.id)) {
          keys.push({
            id: m.id,
            database_id: m.database_id,
            name: m.name,
            role: m.role,
            key_prefix: m.key_prefix,
            last_used_at: m.last_used_at,
            revoked_at: m.revoked_at,
            created_by: m.created_by,
            created_at: m.created_at,
          });
        }
      }

      return res.json({
        success: true,
        total: keys.length,
        data: keys,
      });
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ success: false, error: err.message });
    }
  },

  /**
   * 2. POST /api/v1/databases/:id/api-keys
   * Generate a new API key (admin+)
   * Format: hk_live_<32 random chars>
   * Shown ONCE on creation, only hash is stored
   */
  async createKey(req, res) {
    try {
      const { db } = await getDb(req, 'admin');
      const { name, role } = req.body || {};

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Key name is required.' });
      }

      const validRoles = ['anon', 'service_role', 'admin', 'developer'];
      const targetRole = (role || 'anon').toLowerCase();
      if (!validRoles.includes(targetRole)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role '${role}'. Must be one of: ${validRoles.join(', ')}.`,
        });
      }

      // Generate random 32 hex chars for key
      const randomChars = crypto.randomBytes(16).toString('hex'); // 32 chars
      const fullKey = `hk_live_${randomChars}`;
      const keyPrefix = `${fullKey.substring(0, 16)}...`;
      const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

      const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const createdAt = new Date().toISOString();
      const createdBy = req.user?.id || 'admin';

      const keyRecord = {
        id: keyId,
        database_id: db.id,
        name: name.trim(),
        role: targetRole,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        last_used_at: null,
        revoked_at: null,
        created_by: createdBy,
        created_at: createdAt,
      };

      // Persist in DB
      try {
        await query(
          `INSERT INTO api_keys (id, database_id, name, role, key_prefix, key_hash, created_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [keyRecord.id, keyRecord.database_id, keyRecord.name, keyRecord.role, keyRecord.key_prefix, keyRecord.key_hash, keyRecord.created_by, keyRecord.created_at]
        );
      } catch (e) {}

      // Persist in memory store
      apiKeyStore.saveKey(keyRecord);

      return res.status(201).json({
        success: true,
        message: 'API Key generated successfully. Save this secret key now; it will NEVER be displayed again.',
        data: {
          id: keyRecord.id,
          name: keyRecord.name,
          role: keyRecord.role,
          key_prefix: keyRecord.key_prefix,
          key: fullKey, // SHOWN ONCE ON CREATION
          created_at: keyRecord.created_at,
          last_used_at: keyRecord.last_used_at,
        },
      });
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ success: false, error: err.message });
    }
  },

  /**
   * 3. DELETE /api/v1/databases/:id/api-keys/:keyId
   * Revoke an API key (admin+)
   */
  async revokeKey(req, res) {
    try {
      const { db } = await getDb(req, 'admin');
      const { keyId } = req.params;

      const now = new Date().toISOString();

      try {
        await query(
          'UPDATE api_keys SET revoked_at = $1 WHERE id = $2 AND database_id = $3',
          [now, keyId, db.id]
        );
      } catch (e) {}

      const revoked = apiKeyStore.revokeKey(keyId);

      return res.json({
        success: true,
        message: 'API key revoked successfully. It can no longer be used to access project APIs.',
      });
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ success: false, error: err.message });
    }
  },
};

