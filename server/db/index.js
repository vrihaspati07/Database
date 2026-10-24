/**
 * Hind DB - PostgreSQL Database Pool & Query Adapter
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

// PostgreSQL Connection Pool
export const pool = new Pool({
  connectionString: config.database.connectionString,
  ssl: config.database.ssl,
  max: config.database.maxConnections,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Resilient in-memory store for development/preview when live Postgres server is not attached
class MockStore {
  constructor() {
    this.users = new Map();
    this.oauthAccounts = new Map();
    this.tokens = new Map();
    this.refreshTokens = new Map();
  }

  findUserByEmail(email) {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  findUserById(id) {
    return this.users.get(id) || null;
  }

  saveUser(user) {
    const id = user.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const record = {
      id,
      email: user.email,
      password_hash: user.password_hash || null,
      name: user.name,
      email_verified: user.email_verified || false,
      mfa_enabled: user.mfa_enabled || false,
      mfa_secret: user.mfa_secret || null,
      avatar_url: user.avatar_url || null,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.users.set(id, record);
    return record;
  }

  updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  saveToken(tokenRecord) {
    const id = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const record = { ...tokenRecord, id, created_at: new Date().toISOString() };
    this.tokens.set(record.token, record);
    return record;
  }

  findToken(token, type) {
    const rec = this.tokens.get(token);
    if (!rec) return null;
    if (type && rec.type !== type) return null;
    if (new Date(rec.expires_at) < new Date()) return null;
    return rec;
  }

  deleteToken(token) {
    this.tokens.delete(token);
  }

  saveRefreshToken(record) {
    this.refreshTokens.set(record.token_hash, record);
  }

  findRefreshToken(tokenHash) {
    return this.refreshTokens.get(tokenHash) || null;
  }

  revokeRefreshToken(tokenHash) {
    const rec = this.refreshTokens.get(tokenHash);
    if (rec) {
      rec.revoked = true;
      this.refreshTokens.set(tokenHash, rec);
    }
  }

  saveOAuthAccount(record) {
    const key = `${record.provider}:${record.provider_user_id}`;
    this.oauthAccounts.set(key, record);
  }

  findOAuthAccount(provider, providerUserId) {
    const key = `${provider}:${providerUserId}`;
    return this.oauthAccounts.get(key) || null;
  }
}

export const mockStore = new MockStore();

// Universal query runner with fallback
export async function query(text, params = []) {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      client.release();
    }
  } catch (err) {
    // Database connection fallback during development
    return null;
  }
}
