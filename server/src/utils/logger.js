/**
 * Hind DB - Structured Logger Utility
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

export const logger = {
  info(message, meta = {}) {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${timestamp}] [INFO] ${message}`, Object.keys(meta).length ? meta : '');
  },

  warn(message, meta = {}) {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.warn(`[${timestamp}] [WARN] ${message}`, Object.keys(meta).length ? meta : '');
  },

  error(message, error = null) {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.error(`[${timestamp}] [ERROR] ${message}`, error ? error.stack || error : '');
  },

  debug(message, meta = {}) {
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      console.log(`[${timestamp}] [DEBUG] ${message}`, meta);
    }
  },
};
