/**
 * Hind DB - JWT Bearer Authentication Middleware
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { verifyAccessToken } from '../services/security.js';
import { query } from '../config/database.js';
import { mockStore } from '../db/index.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Access token required. Please provide a valid Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Your session has expired. Please refresh your token or log in again.',
    });
  }

  // Load user from database or mock store
  let user = null;
  try {
    const dbRes = await query(
      'SELECT id, email, full_name, avatar_url, role, email_verified FROM users WHERE id = $1',
      [decoded.sub]
    );
    if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
      user = dbRes.rows[0];
    }
  } catch (err) {}

  if (!user) {
    user = mockStore.findUserById(decoded.sub);
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'USER_NOT_FOUND',
      message: 'The user account associated with this token no longer exists.',
    });
  }

  req.user = user;
  next();
}
