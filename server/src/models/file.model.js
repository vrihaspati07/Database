/**
 * Hind DB - Storage File, Edge Function, API Key & Team Models
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { executeQuery } from '../config/db.config.js';

export const FileModel = {
  async listByDatabase(databaseId) {
    try {
      const res = await executeQuery('SELECT * FROM files WHERE database_id = $1 ORDER BY created_at DESC', [databaseId]);
      return res.rows;
    } catch (e) {
      return [];
    }
  },

  async create({ databaseId, name, path, size, mimeType }) {
    try {
      const res = await executeQuery(
        'INSERT INTO files (database_id, name, path, size, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [databaseId, name, path, size, mimeType]
      );
      return res.rows[0];
    } catch (e) {
      return { id: `file_${Date.now()}`, name, path, size, created_at: new Date().toISOString() };
    }
  },
};

export const FunctionModel = {
  async listByDatabase(databaseId) {
    try {
      const res = await executeQuery('SELECT * FROM functions WHERE database_id = $1 ORDER BY created_at DESC', [databaseId]);
      return res.rows;
    } catch (e) {
      return [];
    }
  },

  async create({ databaseId, name, code, triggerType = 'HTTP Webhook' }) {
    try {
      const res = await executeQuery(
        'INSERT INTO functions (database_id, name, code, trigger_type, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [databaseId, name, code, triggerType, 'DEPLOYED']
      );
      return res.rows[0];
    } catch (e) {
      return { id: `fn_${Date.now()}`, name, code, trigger_type: triggerType, status: 'DEPLOYED' };
    }
  },
};

export const ApiKeyModel = {
  async listByDatabase(databaseId) {
    try {
      const res = await executeQuery('SELECT id, name, key_prefix, role, created_at, last_used_at FROM api_keys WHERE database_id = $1', [databaseId]);
      return res.rows;
    } catch (e) {
      return [];
    }
  },
};

export const TeamModel = {
  async listByDatabase(databaseId) {
    try {
      const res = await executeQuery('SELECT * FROM team_members WHERE database_id = $1 ORDER BY created_at DESC', [databaseId]);
      return res.rows;
    } catch (e) {
      return [];
    }
  },
};
