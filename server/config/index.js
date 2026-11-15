/**
 * Hind DB - Global Infrastructure Configuration
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    name: 'Hind DB Core Engine',
    version: '2.4.0',
    port: parseInt(process.env.PORT || '4000', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'hind_db_super_access_secret_2026_india_sovereign_key',
    jwtSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'hind_db_super_access_secret_2026_india_sovereign_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'hind_db_refresh_secret_2026',
    refreshExpiresIn: '7d',
    region: process.env.HIND_REGION || 'ap-south-1 (Sovereign)',
  },

  db: {
    databaseUrl: process.env.DATABASE_URL || 'postgresql://hind_admin:hind_secure_pass_2026@localhost:5432/hind_db_production',
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    user: process.env.PG_USER || 'hind_admin',
    password: process.env.PG_PASSWORD || 'hind_secure_pass_2026',
    database: process.env.PG_DATABASE || 'hind_db_production',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.PG_MAX_POOL || '25', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },

  redis: {
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: 'hind_db:',
    defaultTtl: 3600, // 1 hour in seconds
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:4000'}/auth/google/callback`,
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || '"Hind DB" <noreply@hind.io>',
  },

  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'hind_minio_admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'hind_minio_secret_key_2026',
    bucketName: process.env.MINIO_BUCKET || 'hind-assets',
    region: 'ap-south-1',
  },

  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'hind-db-storage',
    endpoint: process.env.R2_BUCKET_ENDPOINT || '',
    publicBaseUrl: process.env.STORAGE_PUBLIC_URL || 'https://storage.hinddb.com',
  },

  storage: {
    freeQuotaBytes: 1024 * 1024 * 1024, // 1 GB free storage
    proQuotaBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    businessQuotaBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    maxFileSizeBytes: 50 * 1024 * 1024, // 50 MB for free plan
    blockedExtensions: ['.exe', '.sh', '.bat', '.cmd', '.msi', '.vbs', '.scr', '.ps1', '.jar', '.com', '.pif'],
  },

  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
  },

  metrics: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    path: '/metrics',
  },

  admin: {
    emails: Array.from(
      new Set(
        [
          ...(process.env.ADMIN_EMAILS || 'tumhara@gmail.com,vrihaspatichaubey@gmail.com')
            .replace(/["']/g, '')
            .split(',')
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean),
          (process.env.SMTP_USER || '').trim().toLowerCase(),
        ].filter(Boolean)
      )
    ),
    secretKey: process.env.ADMIN_SECRET_KEY || 'HindAdmin@2026!',
    secretPath: process.env.ADMIN_SECRET_PATH || '/control-x7k9',
    sessionTtl: parseInt(process.env.ADMIN_SESSION_TTL || '1800', 10), // 30 minutes in seconds
    maxFailedAttempts: parseInt(process.env.ADMIN_MAX_FAILED_ATTEMPTS || '5', 10),
    banDurationMs: parseInt(process.env.ADMIN_BAN_DURATION_MS || '3600000', 10), // 1 hour ban
    jwtSecret: process.env.ADMIN_JWT_SECRET || 'hind_db_sovereign_admin_panel_x7k9_secret_key_2026',
    alertEmail: process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_USER || 'vrihaspatichaubey@gmail.com',
    resendApiKey: process.env.RESEND_API_KEY || '',
  },
};
