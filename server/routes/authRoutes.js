/**
 * Hind DB - Auth Router
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { Router } from 'express';
import {
  signup,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
} from '../controllers/authController.js';
import {
  validateBody,
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../middleware/validation.js';
import {
  loginLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
} from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// 1. Signup
router.post('/signup', signupLimiter, validateBody(signupSchema), signup);

// 2. Verify Email
router.post('/verify-email', validateBody(verifyEmailSchema), verifyEmail);

// 3. Resend Verification Link
router.post('/resend-verification', resendVerificationLimiter, validateBody(resendVerificationSchema), resendVerification);

// 4. Login
router.post('/login', loginLimiter, validateBody(loginSchema), login);

// 5. Token Refresh
router.post('/refresh', refresh);

// 6. Logout
router.post('/logout', logout);

// 7. Get Current User Profile (Protected)
router.get('/me', requireAuth, getMe);

// 8. Forgot Password & Reset Password
router.post('/forgot-password', forgotPasswordLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);

// 9. Google OAuth 2.0
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Mirror routes for OAuth backwards compatibility if needed
router.get('/oauth/google', googleAuth);
router.get('/oauth/google/callback', googleCallback);

export default router;
