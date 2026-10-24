/**
 * Hind DB - Complete Sovereign Backend Engine Server
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { metricsMiddleware } from './middleware/metricsMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import databaseRoutes from './routes/databaseRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import { pool } from './config/database.js';
import { redis } from './config/redis.js';

const app = express();

// Intercept HTTP metrics for Prometheus scraping
app.use(metricsMiddleware);

// Core Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration for Sovereign web console
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins in dev or specific origins in production
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-hind-region'],
  })
);

// Mount Metrics & Observability (Prometheus & Health)
app.use('/', metricsRoutes);

// Mount API Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/databases', databaseRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} does not exist on Hind DB API.`,
    },
    meta: {
      timestamp: new Date().toISOString(),
      region: config.app.region,
      attribution: '© 2026 Hind. A Hind India Private Limited Company.',
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(config.app.port, () => {
    console.log(`[Hind DB Core API] Server listening on http://localhost:${config.app.port}`);
    console.log(`[Hind DB Metrics] Prometheus metrics available at http://localhost:${config.app.port}/metrics`);
    console.log(`[Hind DB Health] Health check at http://localhost:${config.app.port}/health`);
    console.log(`[Hind DB Region] Active deployment: ${config.app.region}`);
  });

  // Graceful Shutdown Handler
  const shutdown = async (signal) => {
    console.log(`\n[Hind DB] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('[Hind DB] HTTP server closed.');
      try {
        await pool.end();
        console.log('[Hind DB] PostgreSQL pool closed.');
        const redisClient = redis.getClient();
        if (redisClient) {
          await redisClient.quit();
          console.log('[Hind DB] Redis client disconnected.');
        }
      } catch (err) {
        console.error('[Hind DB] Error during teardown:', err);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default app;
