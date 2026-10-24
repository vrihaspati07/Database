/**
 * Hind DB - Prometheus Metrics & Health Controller
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { register } from '../config/metrics.js';
import { testDbConnection } from '../config/database.js';
import { redis } from '../config/redis.js';
import { storage } from '../config/minio.js';

export const metricsController = {
  /**
   * Scrape Prometheus Metrics endpoint
   * GET /metrics
   */
  async getMetrics(req, res) {
    try {
      res.set('Content-Type', register.contentType);
      const metricsData = await register.metrics();
      res.end(metricsData);
    } catch (err) {
      res.status(500).send(`Error scraping metrics: ${err.message}`);
    }
  },

  /**
   * Deep Infrastructure Health Check
   * GET /health or GET /api/v1/health
   */
  async getHealth(req, res) {
    const dbHealth = await testDbConnection();
    const redisHealth = await redis.getHealth();
    const storageHealth = await storage.getHealth();

    const isHealthy = dbHealth.status === 'UP' || redisHealth.mode;

    const payload = {
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      product: 'Hind DB Core Engine',
      version: '2.4.0',
      region: 'ap-south-1 (Mumbai)',
      sla: '99.999%',
      timestamp: new Date().toISOString(),
      services: {
        postgresql: dbHealth,
        redis_cache: redisHealth,
        s3_minio_storage: storageHealth,
      },
      attribution: '© 2026 Hind. A Hind India Private Limited Company.',
    };

    res.status(isHealthy ? 200 : 503).json(payload);
  },
};
