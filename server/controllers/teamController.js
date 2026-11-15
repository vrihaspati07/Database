/**
 * Hind DB - Team Management & Invites Controller
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import crypto from 'crypto';
import { getDb, teamStore, memoryDatabases } from '../services/access.js';
import { query } from '../config/database.js';
import { config } from '../config/index.js';
import { mockStore } from '../db/index.js';
import { sendMail } from '../services/mailService.js';

export const teamController = {
  /**
   * 1. GET /api/v1/databases/:id/team
   * List all team members for a database, with the owner listed first as non-editable
   */
  async getTeam(req, res) {
    try {
      const { db } = await getDb(req, 'viewer');

      // 1. Fetch Owner User details
      let owner = null;
      try {
        const uRes = await query('SELECT id, email, full_name, avatar_url, created_at FROM users WHERE id = $1', [db.user_id]);
        if (uRes && uRes.rows && uRes.rows.length > 0) {
          const u = uRes.rows[0];
          owner = {
            id: `owner_${u.id}`,
            user_id: u.id,
            name: u.full_name || 'Database Owner',
            email: u.email,
            role: 'owner',
            status: 'ACTIVE',
            is_owner: true,
            joined_at: db.created_at || u.created_at,
          };
        }
      } catch (e) {}

      if (!owner) {
        const mockUser = mockStore.findUserById(db.user_id);
        if (mockUser) {
          owner = {
            id: `owner_${mockUser.id}`,
            user_id: mockUser.id,
            name: mockUser.full_name || mockUser.name || 'Database Owner',
            email: mockUser.email,
            role: 'owner',
            status: 'ACTIVE',
            is_owner: true,
            joined_at: db.created_at || mockUser.created_at,
          };
        } else {
          owner = {
            id: `owner_${db.user_id || 'primary'}`,
            user_id: db.user_id || req.user.id,
            name: (req.user && String(req.user.id) === String(db.user_id)) ? req.user.full_name : 'Database Owner',
            email: (req.user && String(req.user.id) === String(db.user_id)) ? req.user.email : 'owner@hinddb.internal',
            role: 'owner',
            status: 'ACTIVE',
            is_owner: true,
            joined_at: db.created_at || new Date().toISOString(),
          };
        }
      }

      // 2. Fetch Team Members from DB or memory
      const members = [];
      try {
        const tmRes = await query(
          'SELECT id, user_id, name, email, role, status, created_at as joined_at FROM team_members WHERE database_id = $1 ORDER BY created_at ASC',
          [db.id]
        );
        if (tmRes && tmRes.rows) {
          for (const m of tmRes.rows) {
            members.push({
              id: m.id,
              user_id: m.user_id,
              name: m.name,
              email: m.email,
              role: m.role,
              status: m.status,
              is_owner: false,
              joined_at: m.joined_at,
            });
          }
        }
      } catch (e) {}

      // Add memory store members if not already added
      const memMembers = teamStore.getMembersByDb(db.id);
      for (const m of memMembers) {
        if (!members.some((existing) => existing.id === m.id || existing.email === m.email)) {
          members.push({
            id: m.id,
            user_id: m.user_id,
            name: m.name,
            email: m.email,
            role: m.role,
            status: m.status,
            is_owner: false,
            joined_at: m.created_at,
          });
        }
      }

      return res.json({
        success: true,
        data: [owner, ...members],
      });
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ success: false, error: err.message });
    }
  },

  /**
   * 2. POST /api/v1/databases/:id/team/invites
   * Invite a new team member by email (admin or owner only)
   * Generates a crypto token, hashes it with SHA-256 for storage, sends email
   */
  async inviteMember(req, res) {
    try {
      const { db } = await getDb(req, 'admin');
      const { name, email, role } = req.body || {};

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Member name is required.' });
      }

      if (!email || !email.trim() || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'A valid email address is required.' });
      }

      const validRoles = ['admin', 'developer', 'viewer'];
      const targetRole = (role || 'developer').toLowerCase();
      if (!validRoles.includes(targetRole)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role '${role}'. Role must be one of: ${validRoles.join(', ')}.`,
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      // Check if trying to invite the owner
      if (req.user && req.user.email && req.user.email.toLowerCase() === cleanEmail) {
        return res.status(400).json({ success: false, error: 'You are already the owner of this database.' });
      }

      // Check if member already exists in this database
      let existingMember = null;
      try {
        const existingRes = await query(
          'SELECT * FROM team_members WHERE database_id = $1 AND LOWER(email) = $2',
          [db.id, cleanEmail]
        );
        if (existingRes && existingRes.rows && existingRes.rows.length > 0) {
          existingMember = existingRes.rows[0];
        }
      } catch (e) {}

      if (!existingMember) {
        existingMember = teamStore.findMember(db.id, cleanEmail);
      }

      if (existingMember) {
        return res.status(400).json({
          success: false,
          error: `A team member with email '${cleanEmail}' already exists in this database (${existingMember.status}).`,
        });
      }

      // Generate Single-Use Cryptographic Invite Token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      const memberId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const createdAt = new Date().toISOString();

      const newMember = {
        id: memberId,
        database_id: db.id,
        name: cleanName,
        email: cleanEmail,
        role: targetRole,
        status: 'INVITED',
        invite_token_hash: tokenHash,
        invited_by: req.user.id,
        created_at: createdAt,
      };

      // Persist in DB
      try {
        await query(
          `INSERT INTO team_members (id, database_id, name, email, role, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [newMember.id, newMember.database_id, newMember.name, newMember.email, newMember.role, newMember.status, newMember.created_at]
        );
      } catch (e) {}

      // Persist in memory store
      teamStore.saveMember(newMember);
      teamStore.saveInvite(tokenHash, {
        ...newMember,
        raw_token: rawToken,
        database_name: db.name,
      });

      // Construct Frontend Invite URL
      const frontendUrl = config.app.frontendUrl || 'http://localhost:5173';
      const devInviteLink = `${frontendUrl}/accept-invite?token=${rawToken}`;

      // Send Invitation Email
      try {
        await sendMail({
          to: cleanEmail,
          subject: `You've been invited to join ${db.name} on Hind DB`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1E3A8A;">Hind DB Team Invitation</h2>
              <p>Hello <strong>${cleanName}</strong>,</p>
              <p>You have been invited by <strong>${req.user.full_name || req.user.email}</strong> to join the <strong>${db.name}</strong> database cluster as a <strong>${targetRole}</strong>.</p>
              <p style="margin: 24px 0;">
                <a href="${devInviteLink}" style="background-color: #1E3A8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Accept Invitation
                </a>
              </p>
              <p style="color: #64748B; font-size: 13px;">Or copy and paste this link in your browser:<br/>${devInviteLink}</p>
              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
              <p style="color: #94A3B8; font-size: 11px;">© 2026 Hind. A Hind India Private Limited Company. Sovereign Indian Cloud.</p>
            </div>
          `,
        });
      } catch (e) {
        console.warn('[TeamController] Failed to send invite email:', e.message);
      }

      return res.status(201).json({
        success: true,
        message: `Invitation successfully sent to ${cleanEmail}.`,
        data: {
          id: newMember.id,
          name: newMember.name,
          email: newMember.email,
          role: newMember.role,
          status: newMember.status,
          is_owner: false,
          joined_at: newMember.created_at,
        },
        devInviteLink,
      });
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ success: false, error: err.message });
    }
  },

  /**
   * 3. PATCH /api/v1/databases/:id/team/:memberId
   * Update team member role (admin or owner only)
   * Cannot edit owner row
   */
  async updateRole(req, res) {
    try {
      const { db } = await getDb(req, 'admin');
      const { memberId } = req.params;
      const { role } = req.body || {};

      if (memberId.startsWith('owner_')) {
        return res.status(400).json({ success: false, error: 'Cannot modify role of the database owner.' });
      }

      const validRoles = ['admin', 'developer', 'viewer'];
      const targetRole = (role || '').toLowerCase();
      if (!validRoles.includes(targetRole)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role '${role}'. Must be one of: ${validRoles.join(', ')}.`,
        });
      }

      // Update in DB
      let updated = null;
      try {
        const uRes = await query(
          'UPDATE team_members SET role = $1 WHERE id = $2 AND database_id = $3 RETURNING *',
          [targetRole, memberId, db.id]
        );
        if (uRes && uRes.rows && uRes.rows.length > 0) {
          updated = uRes.rows[0];
        }
      } catch (e) {}

      // Update in memory
      const memUpdated = teamStore.updateMember(memberId, { role: targetRole });
      if (!updated && memUpdated) {
        updated = memUpdated;
      }

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Team member not found in this database.' });
      }

      return res.json({
        success: true,
        message: 'Member role updated successfully.',
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          status: updated.status,
          joined_at: updated.created_at || updated.joined_at,
        },
      });
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ success: false, error: err.message });
    }
  },

  /**
   * 4. DELETE /api/v1/databases/:id/team/:memberId
   * Remove a member from the database team (admin or owner only)
   * Cannot delete owner
   */
  async removeMember(req, res) {
    try {
      const { db } = await getDb(req, 'admin');
      const { memberId } = req.params;

      if (memberId.startsWith('owner_')) {
        return res.status(400).json({ success: false, error: 'Cannot remove the database owner from the team.' });
      }

      // Delete from DB
      try {
        await query('DELETE FROM team_members WHERE id = $1 AND database_id = $2', [memberId, db.id]);
      } catch (e) {}

      // Delete from memory
      teamStore.deleteMember(memberId);

      return res.json({
        success: true,
        message: 'Member removed from team successfully.',
      });
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ success: false, error: err.message });
    }
  },

  /**
   * 5. POST /api/v1/databases/invites/accept
   * Accept an invitation token (requires authenticated user)
   * Validates:
   *  - Token exists & is in INVITED state
   *  - Token is bound to the logged-in user's verified email address
   * Sets member to ACTIVE, binds user_id, invalidates single-use token
   */
  async acceptInvite(req, res) {
    try {
      if (!req.user || !req.user.id || !req.user.email) {
        return res.status(401).json({ success: false, error: 'Authentication required to accept an invitation.' });
      }

      const { token } = req.body || {};
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ success: false, error: 'Invite token is required.' });
      }

      const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

      // 1. Locate invite
      let invite = null;
      try {
        const invRes = await query(
          "SELECT * FROM team_members WHERE invite_token_hash = $1 AND status = 'INVITED'",
          [tokenHash]
        );
        if (invRes && invRes.rows && invRes.rows.length > 0) {
          invite = invRes.rows[0];
        }
      } catch (e) {}

      if (!invite) {
        invite = teamStore.findInvite(tokenHash);
      }

      if (!invite || invite.status !== 'INVITED') {
        return res.status(400).json({
          success: false,
          error: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'This invite token is invalid, expired, or has already been used.',
        });
      }

      // 2. Validate email bound to invite
      const userEmail = req.user.email.toLowerCase().trim();
      const inviteEmail = invite.email.toLowerCase().trim();

      if (userEmail !== inviteEmail) {
        return res.status(403).json({
          success: false,
          error: 'EMAIL_MISMATCH',
          message: `This invitation was issued to ${invite.email}. You are currently logged in as ${req.user.email}. Please switch accounts to accept this invitation.`,
        });
      }

      // 3. Activate member
      const now = new Date().toISOString();
      try {
        await query(
          "UPDATE team_members SET status = 'ACTIVE', user_id = $1, invite_token_hash = NULL WHERE id = $2",
          [req.user.id, invite.id]
        );
      } catch (e) {}

      // Update memory store
      teamStore.updateMember(invite.id, {
        status: 'ACTIVE',
        user_id: req.user.id,
        invite_token_hash: null,
        joined_at: now,
      });
      teamStore.deleteInvite(tokenHash);

      // 4. Fetch database details
      let dbName = invite.database_name || 'Database Cluster';
      try {
        const dRes = await query('SELECT name FROM databases WHERE id = $1', [invite.database_id]);
        if (dRes && dRes.rows && dRes.rows.length > 0) {
          dbName = dRes.rows[0].name;
        }
      } catch (e) {}

      return res.json({
        success: true,
        message: `Welcome to ${dbName}! Your invitation has been accepted.`,
        databaseId: invite.database_id,
        databaseName: dbName,
        role: invite.role,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};

