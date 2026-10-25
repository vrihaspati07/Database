/**
 * Hind DB - Security & Cryptographic Service
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import crypto from 'crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// ==========================================
// 1. Password Hashing (Argon2id)
// ==========================================
export async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  try {
    return await argon2.verify(storedHash, password);
  } catch (err) {
    return false;
  }
}

// ==========================================
// 2. Hash Helper (SHA-256)
// ==========================================
export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

// ==========================================
// 3. Random Token Generators
// ==========================================
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

// ==========================================
// 4. JWT Access Tokens (15 min expiry)
// ==========================================
export function generateAccessToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.full_name || user.name,
    role: user.role || 'developer',
  };

  return jwt.sign(payload, config.app.jwtAccessSecret, {
    expiresIn: config.app.jwtExpiresIn || '15m',
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.app.jwtAccessSecret);
  } catch (err) {
    return null;
  }
}
