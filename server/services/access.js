/**
 * Hind DB - Access Control & Role Enforcement Service
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { query } from '../config/database.js';

export const ROLE_HIERARCHY = {
  viewer: 1,
  developer: 2,
  admin: 3,
  owner: 4,
};

// Resilient in-memory team store for development/offline fallback
class TeamStore {
  constructor() {
    this.members = new Map(); // key: memberId -> memberRecord
    this.invites = new Map(); // key: tokenHash -> inviteRecord
  }

  getMembersByDb(dbId) {
    const list = [];
    for (const m of this.members.values()) {
      if (m.database_id === dbId) list.push(m);
    }
    return list;
  }

  findMember(dbId, userIdOrEmail) {
    for (const m of this.members.values()) {
      if (m.database_id === dbId) {
        if (m.user_id && m.user_id === userIdOrEmail) return m;
        if (m.email && m.email.toLowerCase() === userIdOrEmail.toLowerCase()) return m;
      }
    }
    return null;
  }

  saveMember(member) {
    this.members.set(member.id, member);
    return member;
  }

  updateMember(memberId, updates) {
    const m = this.members.get(memberId);
    if (!m) return null;
    const updated = { ...m, ...updates };
    this.members.set(memberId, updated);
    return updated;
  }

  deleteMember(memberId) {
    return this.members.delete(memberId);
  }

  saveInvite(tokenHash, invite) {
    this.invites.set(tokenHash, invite);
  }

  findInvite(tokenHash) {
    return this.invites.get(tokenHash) || null;
  }

  deleteInvite(tokenHash) {
    return this.invites.delete(tokenHash);
  }
}

export const teamStore = new TeamStore();

// In-memory databases store fallback
export const memoryDatabases = new Map();

/**
 * Enforce role on /:id database routes
 * Unknown/non-member => 404 (Security by obscurity - never leak database existence to unauthorized users)
 * Insufficient role => 403
 */
export async function getDb(req, minRole = 'viewer') {
  const dbId = req.params.id || req.params.databaseId || req.query.databaseId;
  if (!dbId) {
    const err = new Error('Database identifier required');
    err.status = 404;
    throw err;
  }

  if (!req.user || !req.user.id) {
    const err = new Error('Authentication required');
    err.status = 401;
    throw err;
  }

  let db = null;

  // 1. Fetch Database Record
  try {
    const dbRes = await query('SELECT * FROM databases WHERE id = $1', [dbId]);
    if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
      db = dbRes.rows[0];
    }
  } catch (e) {}

  if (!db) {
    db = memoryDatabases.get(dbId);
  }

  // If database doesn't exist at all, return 404
  if (!db) {
    const err = new Error('Database cluster not found');
    err.status = 404;
    throw err;
  }

  // 2. Determine User Role
  let userRole = null;

  // A. Check if user is the database Owner
  if (db.user_id && String(db.user_id) === String(req.user.id)) {
    userRole = 'owner';
  } else {
    // B. Check team_members table
    let teamMember = null;
    try {
      const tmRes = await query(
        `SELECT * FROM team_members 
         WHERE database_id = $1 
           AND status = 'ACTIVE' 
           AND (user_id = $2 OR LOWER(email) = LOWER($3))`,
        [dbId, req.user.id, req.user.email]
      );
      if (tmRes && tmRes.rows && tmRes.rows.length > 0) {
        teamMember = tmRes.rows[0];
      }
    } catch (e) {}

    if (!teamMember) {
      teamMember = teamStore.findMember(dbId, req.user.id) || teamStore.findMember(dbId, req.user.email);
      if (teamMember && teamMember.status !== 'ACTIVE') {
        teamMember = null;
      }
    }

    if (teamMember) {
      userRole = teamMember.role;
    }
  }

  // Non-member => return 404
  if (!userRole) {
    const err = new Error('Database cluster not found');
    err.status = 404;
    throw err;
  }

  // 3. Enforce Role Level
  const userRank = ROLE_HIERARCHY[userRole] || 0;
  const requiredRank = ROLE_HIERARCHY[minRole] || 1;

  if (userRank < requiredRank) {
    const err = new Error(`Insufficient permissions. Required role: ${minRole}, your role: ${userRole}.`);
    err.status = 403;
    throw err;
  }

  return { db, role: userRole };
}

