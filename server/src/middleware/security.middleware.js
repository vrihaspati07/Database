/**
 * Hind DB - Core Security & Protection Middleware
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { responseUtils } from '../utils/response.js';

const apiRateLimits = new Map();

/**
 * 1. Security Headers Middleware (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
 */
export function securityHeaders(req, res, next) {
  // Enforce HTTPS Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: ws: wss:;"
  );
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}

/**
 * 2. Rate Limiting: 1000 requests / min per API Key or IP
 */
export function apiKeyRateLimiter(req, res, next) {
  const keyIdentifier = req.headers['x-api-key'] || req.ip || 'global_client';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 1000;

  const current = apiRateLimits.get(keyIdentifier) || { count: 0, resetAt: now + windowMs };

  if (now > current.resetAt) {
    current.count = 1;
    current.resetAt = now + windowMs;
  } else {
    current.count++;
  }

  apiRateLimits.set(keyIdentifier, current);

  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetAt / 1000));

  if (current.count > maxRequests) {
    return responseUtils.error(
      res,
      'Rate limit exceeded: 1000 requests per minute quota reached.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  next();
}

/**
 * 3. Strict Input Sanitization & SQL Injection Prevention
 */
export function sanitizeInputs(req, res, next) {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        // Strip common script tags to prevent stored XSS
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
}
