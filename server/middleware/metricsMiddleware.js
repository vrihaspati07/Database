/**
 * Hind DB - Prometheus Metrics Interceptor Middleware
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { httpRequestDuration, httpRequestsTotal, activeConnections } from '../config/metrics.js';

export function metricsMiddleware(req, res, next) {
  // Ignore metrics scraping endpoint from tracing itself
  if (req.path === '/metrics' || req.path === '/favicon.ico') {
    return next();
  }

  activeConnections.inc();
  const start = performance.now();

  res.on('finish', () => {
    activeConnections.dec();
    const duration = (performance.now() - start) / 1000;
    
    // Normalize route to avoid high cardinality
    const route = req.baseUrl || req.route?.path || req.path || 'unknown';
    const method = req.method;
    const statusCode = res.statusCode ? res.statusCode.toString() : '500';

    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
  });

  next();
}
