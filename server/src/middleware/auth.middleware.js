/**
 * Hind DB - Authentication Middleware
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { cryptoUtils } from '../utils/crypto.js';
import { responseUtils } from '../utils/response.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];

  if (apiKeyHeader) {
    req.user = { id: 'api_client', role: apiKeyHeader.includes('service_role') ? 'service_role' : 'anon' };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return responseUtils.error(res, 'Authentication required. Please provide a Bearer JWT or x-api-key.', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];
  const decoded = cryptoUtils.verifyJwt(token);

  if (!decoded) {
    return responseUtils.error(res, 'Invalid or expired token.', 401, 'INVALID_TOKEN');
  }

  req.user = decoded;
  next();
}
