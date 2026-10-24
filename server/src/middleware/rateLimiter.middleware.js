/**
 * Hind DB - Rate Limiting, Logging, Metrics & Error Middleware
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { httpMetricDuration, httpMetricTotal } from '../config/metrics.config.js';
import { logger } from '../utils/logger.js';
import { responseUtils } from '../utils/response.js';

const rateLimitMap = new Map();

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 300;

  const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
  } else {
    record.count++;
  }

  rateLimitMap.set(ip, record);

  if (record.count > maxRequests) {
    return responseUtils.error(res, 'Too many requests. Please slow down.', 429, 'RATE_LIMIT_EXCEEDED');
  }

  next();
}

export function requestLogger(req, res, next) {
  const start = performance.now();
  res.on('finish', () => {
    const duration = (performance.now() - start).toFixed(1);
    logger.info(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });
  next();
}

export function metricsInterceptor(req, res, next) {
  if (req.path === '/metrics') return next();
  const start = performance.now();
  res.on('finish', () => {
    const duration = (performance.now() - start) / 1000;
    const method = req.method;
    const route = req.baseUrl || req.path || 'unknown';
    const statusCode = res.statusCode ? res.statusCode.toString() : '500';

    httpMetricDuration.observe({ method, route, status_code: statusCode }, duration);
    httpMetricTotal.inc({ method, route, status_code: statusCode });
  });
  next();
}

export function globalErrorHandler(err, req, res, next) {
  logger.error(`Unhandled error at ${req.method} ${req.url}:`, err);
  const status = err.status || 500;
  return responseUtils.error(res, err.message || 'Internal server error', status, err.code || 'INTERNAL_ERROR');
}
