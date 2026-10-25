/**
 * Hind DB - Express Application Bootstrap
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { envConfig } from './config/env.config.js';
import { metricsInterceptor, requestLogger, globalErrorHandler } from './middleware/rateLimiter.middleware.js';
import { authRouter, databaseRouter, storageRouter, metricsRouter } from './routes/index.js';

import helmet from 'helmet';
import authRoutes from '../routes/authRoutes.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Telemetry & Metrics Interceptor
app.use(metricsInterceptor);
app.use(requestLogger);

// Parsers & CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
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
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-hind-region'],
  })
);

// Metrics & Health
app.use('/', metricsRouter);

// Auth Routes under /auth and /api/v1/auth
app.use('/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/databases', databaseRouter);
app.use('/api/v1/storage', storageRouter);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Path ${req.method} ${req.originalUrl} not found.`,
    },
    meta: {
      attribution: '© 2026 Hind. A Hind India Private Limited Company.',
    },
  });
});

// Centralized Error Handling
app.use(globalErrorHandler);

export default app;
