/**
 * Hind DB - Centralized API Error Handling Middleware
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

export function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Hind DB Error] [${req.method} ${req.url}]:`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
      cluster: 'ap-south-1 (Sovereign)',
      attribution: '© 2026 Hind. A Hind India Private Limited Company.',
    },
  });
}
