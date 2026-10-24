/**
 * Hind DB - Server Configuration
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // App URLs
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:5000',

  // Database (PostgreSQL)
  database: {
    connectionString: process.env.DATABASE_URL || 'postgresql://hind_admin:hind_secret_2026@localhost:5432/hind_db',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    maxConnections: 20,
  },

  // JWT Security Tokens
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'hind_jwt_access_secret_sovereign_2026_primary_key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'hind_jwt_refresh_secret_sovereign_2026_secondary_key',
    accessExpiresIn: '15m', // 15 minutes as per specification
    refreshExpiresIn: '7d', // 7 days as per specification
  },

  // Rate Limiting (100 requests per hour per IP)
  rateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 requests per hour per IP
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again after 1 hour.',
    },
  },

  // Email Integration (Resend / SendGrid)
  email: {
    provider: process.env.EMAIL_PROVIDER || 'resend', // 'resend' | 'sendgrid' | 'mock'
    resendApiKey: process.env.RESEND_API_KEY || 're_mock_hind_2026_key',
    sendgridApiKey: process.env.SENDGRID_API_KEY || 'SG.mock_hind_2026_key',
    fromEmail: process.env.EMAIL_FROM || 'Hind DB <hello@hind.io>',
    replyTo: 'hello@hind.io',
  },

  // OAuth 2.0 Credentials
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock_google_client_id.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_google_client_secret',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/v1/auth/oauth/google/callback',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'mock_github_client_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock_github_client_secret',
      redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/v1/auth/oauth/github/callback',
    },
  },
};
