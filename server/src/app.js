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

const app = express();

// Telemetry & Metrics Interceptor
app.use(metricsInterceptor);
app.use(requestLogger);

// Parsers & CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-hind-region'],
  })
);

// Metrics & Health
app.use('/', metricsRouter);

// API v1 Routes
app.use('/api/v1/auth', authRouter);
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
