/**
 * Hind DB - Cryptographic Utility
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.config.js';

export const cryptoUtils = {
  hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
  },

  verifyPassword(password, salt, storedHash) {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  },

  generateJwt(payload, expiresIn = envConfig.app.jwtExpiresIn) {
    return jwt.sign(payload, envConfig.app.jwtSecret, { expiresIn });
  },

  verifyJwt(token) {
    try {
      return jwt.verify(token, envConfig.app.jwtSecret);
    } catch (err) {
      return null;
    }
  },

  generateApiKey(prefix = 'hind_anon') {
    const random = crypto.randomBytes(24).toString('hex');
    return `${prefix}_${random}`;
  },
};
