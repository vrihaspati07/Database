/**
 * Hind DB - Prometheus Metrics Registry & Telemetry
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import client from 'prom-client';

// Create a custom registry
export const register = new client.Registry();

// Enable default Node.js process metrics
client.collectDefaultMetrics({
  register,
  prefix: 'hind_db_',
});

// Custom Telemetry Metrics

// 1. HTTP Request Duration Histogram
export const httpRequestDuration = new client.Histogram({
  name: 'hind_db_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// 2. HTTP Total Requests Counter
export const httpRequestsTotal = new client.Counter({
  name: 'hind_db_http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// 3. PostgreSQL Query Duration Histogram
export const dbQueryDuration = new client.Histogram({
  name: 'hind_db_query_duration_seconds',
  help: 'Latency of SQL database queries executed in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.0005, 0.001, 0.002, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

// 4. Active Connections Gauge
export const activeConnections = new client.Gauge({
  name: 'hind_db_active_connections',
  help: 'Current active client WebSocket and HTTP sessions',
  registers: [register],
});

// 5. Cache Hits & Misses Counters
export const cacheHitsTotal = new client.Counter({
  name: 'hind_db_cache_hits_total',
  help: 'Total Redis / memory cache hits',
  registers: [register],
});

export const cacheMissesTotal = new client.Counter({
  name: 'hind_db_cache_misses_total',
  help: 'Total Redis / memory cache misses',
  registers: [register],
});

// 6. Bull Queue Depth Gauge
export const queueJobCount = new client.Gauge({
  name: 'hind_db_queue_jobs_waiting',
  help: 'Number of background jobs waiting in Bull queue',
  labelNames: ['queue_name'],
  registers: [register],
});
