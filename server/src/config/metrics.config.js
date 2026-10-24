/**
 * Hind DB - Prometheus Metrics Configuration
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import client from 'prom-client';

export const prometheusRegistry = new client.Registry();

client.collectDefaultMetrics({
  register: prometheusRegistry,
  prefix: 'hind_db_',
});

export const httpMetricDuration = new client.Histogram({
  name: 'hind_db_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [prometheusRegistry],
});

export const httpMetricTotal = new client.Counter({
  name: 'hind_db_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [prometheusRegistry],
});

export const dbQueryMetric = new client.Histogram({
  name: 'hind_db_query_duration_seconds',
  help: 'Latency of SQL database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [prometheusRegistry],
});
