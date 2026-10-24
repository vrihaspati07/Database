/**
 * Hind DB - Auth Router
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { Router } from 'express';
import {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  oauthGoogle,
  oauthGithub,
  refresh,
  logout,
  getMe,
} from '../controllers/authController.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Apply rate limiting (100 req/hour per IP) to all auth endpoints
router.use(rateLimiter);

// Core Authentication Endpoints
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// OAuth 2.0
router.get('/oauth/google', oauthGoogle);
router.get('/oauth/github', oauthGithub);

// Session Management
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
