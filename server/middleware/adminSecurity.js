/**
 * Hind DB - Sovereign Admin Security & 404 Cloaking Middleware
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { isIpBanned, verifyAdminToken } from '../services/adminService.js';
import { verifyAccessToken } from '../services/security.js';
import { query } from '../config/database.js';
import { mockStore } from '../db/index.js';
import { config } from '../config/index.js';

/**
 * Standard 404 Cloaking Responder
 * Returns an identical 404 payload to undefined routes to prevent information leakage
 */
export function sendCloaked404(req, res) {
  return res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} does not exist on Hind DB API.`,
    },
    meta: {
      timestamp: new Date().toISOString(),
      region: config.app.region,
      attribution: '© 2026 Hind. A Hind India Private Limited Company.',
    },
  });
}

/**
 * IP Shield: Blocks access if IP has been blacklisted for brute force
 */
export function checkBannedIp(req, res, next) {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.socket?.remoteAddress || '127.0.0.1';
  if (isIpBanned(clientIp)) {
    // Deliver stealth 404 even to banned IPs to maintain total obscurity
    return sendCloaked404(req, res);
  }
  next();
}

/**
 * Require Valid Admin Token or Deliver Stealth 404
 * Server-side check:
 * 1. Dedicated Admin Session Token (verifyAdminToken)
 * 2. User Access Token with users.role = 'admin' or admin email whitelist
 * Unauthorized / non-admin access returns cloaked 404
 */
export async function requireAdminAuth(req, res, next) {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.socket?.remoteAddress || '127.0.0.1';

  if (isIpBanned(clientIp)) {
    return sendCloaked404(req, res);
  }

  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.hind_admin_session;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return sendCloaked404(req, res);
  }

  // 1. Verify dedicated Admin session token
  const adminDecoded = verifyAdminToken(token);
  if (adminDecoded) {
    req.admin = {
      email: adminDecoded.sub,
      role: adminDecoded.role || 'super_admin',
      ip: clientIp,
    };
    return next();
  }

  // 2. Verify platform user access token with users.role = 'admin'
  const userDecoded = verifyAccessToken(token);
  if (userDecoded) {
    const userEmail = (userDecoded.email || '').toLowerCase();
    const isWhitelistedEmail = config.admin.emails.includes(userEmail);

    let user = null;
    try {
      const dbRes = await query(
        'SELECT id, email, full_name, avatar_url, role, email_verified FROM users WHERE id = $1',
        [userDecoded.sub]
      );
      if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
        user = dbRes.rows[0];
      }
    } catch (e) {}

    if (!user) {
      user = mockStore.findUserById(userDecoded.sub);
    }

    const hasAdminRole = userDecoded.role === 'admin' || (user && user.role === 'admin') || isWhitelistedEmail;

    if (hasAdminRole) {
      req.admin = {
        id: userDecoded.sub,
        email: userEmail || user?.email || 'admin@hind.io',
        role: 'admin',
        ip: clientIp,
      };
      return next();
    }
  }

  // Any non-admin or invalid token strictly receives stealth 404
  return sendCloaked404(req, res);
}

