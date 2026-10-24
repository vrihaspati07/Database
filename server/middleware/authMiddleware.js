/**
 * Hind DB - JWT Bearer Authentication Middleware
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { verifyAccessToken } from '../services/security.js';
import { mockStore, query } from '../db/index.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Access token required. Please provide a valid Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or Expired Token',
      message: 'Your session has expired. Please refresh your token or log in again.',
    });
  }

  // Load user from database or mock store
  let user = null;
  const dbRes = await query('SELECT id, email, name, email_verified, mfa_enabled, role FROM users WHERE id = $1', [decoded.sub]);
  
  if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
    user = dbRes.rows[0];
  } else {
    user = mockStore.findUserById(decoded.sub);
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User Not Found',
      message: 'The user account associated with this token no longer exists.',
    });
  }

  req.user = user;
  next();
}
