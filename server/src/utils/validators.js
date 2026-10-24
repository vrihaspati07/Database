/**
 * Hind DB - Input Validation & Sanitization Helpers
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

export const validators = {
  isValidEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidIdentifier(name) {
    return typeof name === 'string' && /^[a-zA-Z_][a-zA-Z0-9_-]{1,63}$/.test(name);
  },

  sanitizeSqlIdentifier(identifier) {
    if (!this.isValidIdentifier(identifier)) {
      throw new Error(`Invalid SQL identifier: ${identifier}`);
    }
    return `"${identifier.replace(/"/g, '""')}"`;
  },
};
