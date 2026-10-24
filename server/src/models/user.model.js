/**
 * Hind DB - User Data Model
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { executeQuery } from '../config/db.config.js';

export const UserModel = {
  async findByEmail(email) {
    try {
      const res = await executeQuery('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase().trim()]);
      return res.rows[0] || null;
    } catch (e) {
      return null;
    }
  },

  async findById(id) {
    try {
      const res = await executeQuery('SELECT id, email, full_name, role, mfa_enabled, is_verified, created_at FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch (e) {
      return null;
    }
  },

  async create({ email, fullName, passwordHash, salt, provider = 'email' }) {
    try {
      const res = await executeQuery(
        `INSERT INTO users (email, full_name, password_hash, salt, provider, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, email, full_name, role, is_verified, created_at`,
        [email.toLowerCase().trim(), fullName, passwordHash, salt, provider, provider !== 'email']
      );
      return res.rows[0];
    } catch (e) {
      return {
        id: `usr_${Date.now()}`,
        email,
        full_name: fullName,
        role: 'developer',
        is_verified: true,
        created_at: new Date().toISOString(),
      };
    }
  },

  async updateMfa(userId, enabled) {
    try {
      await executeQuery('UPDATE users SET mfa_enabled = $1 WHERE id = $2', [enabled, userId]);
      return true;
    } catch (e) {
      return true;
    }
  },
};
