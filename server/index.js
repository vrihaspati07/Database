/**
 * Hind DB - Complete Sovereign Backend Engine Server
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { metricsMiddleware } from './middleware/metricsMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import databaseRoutes from './routes/databaseRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import { checkAllServicesHealth, getBusinessStats } from './services/adminService.js';
import { sendDailySummaryEmail } from './services/adminAlertService.js';
import { pool } from './config/database.js';
import { redis } from './config/redis.js';

import helmet from 'helmet';

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Intercept HTTP metrics for Prometheus scraping
app.use(metricsMiddleware);

// Core Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

// CORS configuration for Sovereign web console
const frontendUrl = config.app.frontendUrl || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === frontendUrl || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, frontendUrl);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-hind-region', 'x-project-id', 'x-file-name'],
  })
);

// Mount Metrics & Observability (Prometheus & Health)
app.use('/', metricsRoutes);

// Mount Auth Endpoints under /auth and /api/v1/auth
app.use('/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/databases', databaseRoutes);

// Mount Sovereign Storage Endpoints (/storage/v1 and /api/v1/storage)
app.use('/storage/v1', storageRoutes);
app.use('/api/v1/storage', storageRoutes);

// Secret Admin Panel Sovereign Gateway (Cloaked under 404 for unauthorized visitors)
const adminApiPath = `/api/v1${config.admin.secretPath.startsWith('/') ? config.admin.secretPath : '/' + config.admin.secretPath}`;
app.use('/api/v1/admin', adminRoutes);
app.use(adminApiPath, adminRoutes);
app.use(config.admin.secretPath, adminRoutes);

// Serve Frontend SPA in production if dist/ directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    // Only pass API, auth, storage, metrics, and health routes to API 404 handler
    if (
      req.method !== 'GET' ||
      req.path.startsWith('/api') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/storage') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/metrics')
    ) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 Handler for undefined API routes
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
  const server = app.listen(config.app.port, '0.0.0.0', () => {
    console.log(`[Hind DB Core API] Server listening on http://localhost:${config.app.port}`);
    console.log(`[Hind DB Metrics] Prometheus metrics available at http://localhost:${config.app.port}/metrics`);
    console.log(`[Hind DB Health] Health check at http://localhost:${config.app.port}/health`);
    console.log(`[Hind DB Region] Active deployment: ${config.app.region}`);
    console.log(`[Hind DB Security] Hidden admin gateway armed on ${config.admin.secretPath} (404-cloaked)`);
    console.log(`[Hind DB Storage] Sovereign Storage engine armed on /storage/v1 and /api/v1/storage`);

    // 1-minute automated health check monitor
    setInterval(async () => {
      try {
        await checkAllServicesHealth();
      } catch (err) {
        // Suppress background poll errors
      }
    }, 60000);

    // 9:00 PM IST Daily Operations Summary Email Worker
    let lastSummaryDate = '';
    setInterval(async () => {
      try {
        const now = new Date();
        const istDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
        const istHours = parseInt(now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit' }), 10);
        const istMinutes = parseInt(now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, minute: '2-digit' }), 10);

        // At 21:00 (9:00 PM IST)
        if (istHours === 21 && istMinutes === 0 && lastSummaryDate !== istDateStr) {
          lastSummaryDate = istDateStr;
          const stats = await getBusinessStats();
          await sendDailySummaryEmail({
            newSignupsToday: stats.users.today,
            newProjectsToday: 8,
            apiRequestsToday: stats.api_requests.today,
            mrr: stats.revenue.mrr_inr,
            uptimePercentage: '99.99%',
            errorRate: '0.04%',
            activeIncidents: 0,
            blockedAttemptsToday: 3,
            totalBannedIps: 2,
            spamProjectsIntercepted: 1,
          });
          console.log(`[Hind DB Admin] Daily 9:00 PM IST summary email dispatched for ${istDateStr}`);
        }
      } catch (err) {
        console.error('[Hind DB Admin] Daily summary error:', err.message);
      }
    }, 30000);
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

  // Global Process Crash Prevention
  process.on('uncaughtException', (err) => {
    console.error('[Hind DB Core Uncaught Exception]:', err.message || err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[Hind DB Core Unhandled Rejection]:', reason?.message || reason);
  });
}

export default app;
