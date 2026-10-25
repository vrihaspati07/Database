/**
 * Hind DB - Express Rate Limiters backed by Redis
 * Product: Hind DB
 */

import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis.js';

function createStore(prefix) {
  const client = redis.getClient();
  if (redis.isAvailable() && client) {
    try {
      return new RedisStore({
        sendCommand: (...args) => client.call(...args),
        prefix: `rl:${prefix}:`,
      });
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// Strict limiter for Login (10 attempts per 15 minutes per IP)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('login'),
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

// Strict limiter for Signup (5 attempts per 15 minutes per IP)
export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('signup'),
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many account creation attempts. Please try again after 15 minutes.',
  },
});

// Strict limiter for Forgot Password (5 attempts per 15 minutes per IP)
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('forgot_pw'),
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many password reset requests. Please try again after 15 minutes.',
  },
});

// Strict limiter for Resend Verification (3 attempts per 15 minutes per IP)
export const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('resend_verify'),
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many verification email requests. Please wait 15 minutes before requesting another.',
  },
});

// General API Rate Limiter (100 requests per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('api'),
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests. Please slow down.',
  },
});
