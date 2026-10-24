/**
 * Hind DB - Rate Limiting Middleware (100 req / hour per IP)
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { config } from '../config.js';

// In-memory sliding window rate limiter
const ipRequests = new Map();

export function rateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = config.rateLimit.windowMs; // 1 hour
  const maxRequests = config.rateLimit.max; // 100 requests

  let record = ipRequests.get(ip);

  if (!record) {
    record = { timestamps: [] };
    ipRequests.set(ip, record);
  }

  // Filter out timestamps older than the window
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

  // Check rate limit
  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000);

    res.setHeader('Retry-After', retryAfterSeconds);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', Math.ceil((oldestTimestamp + windowMs) / 1000));

    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded (100 requests per hour). Please try again later.',
      retryAfterSeconds,
    });
  }

  // Record current request
  record.timestamps.push(now);

  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', maxRequests - record.timestamps.length);

  next();
}
