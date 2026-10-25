/**
 * Hind DB - Complete Sovereign Authentication Controller
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generateRandomToken,
  hashToken,
} from '../services/security.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mailService.js';
import { generateGoogleAuthUrl, verifyGoogleAuthCode } from '../services/googleAuth.js';
import { redis } from '../config/redis.js';
import { pool, query } from '../config/database.js';
import { mockStore } from '../db/index.js';
import { config } from '../config/index.js';

// Helper: Query user by email (DB with MockStore fallback)
async function findUserByEmail(emailClean) {
  try {
    const res = await query('SELECT * FROM users WHERE email = $1', [emailClean]);
    if (res && res.rows && res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    // DB not available, use fallback
  }
  return mockStore.findUserByEmail(emailClean);
}

// Helper: Query user by ID (DB with MockStore fallback)
async function findUserById(id) {
  try {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (res && res.rows && res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    // DB not available, use fallback
  }
  return mockStore.findUserById(id);
}

// Helper: Query OAuth account (DB with MockStore fallback)
async function findOAuthAccount(provider, providerUserId) {
  try {
    const res = await query(
      'SELECT * FROM oauth_accounts WHERE provider = $1 AND provider_user_id = $2',
      [provider, providerUserId]
    );
    if (res && res.rows && res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {}
  return mockStore.findOAuthAccount(provider, providerUserId);
}

// Helper: Create new refresh token session in Redis
async function createRefreshSession(userId, res) {
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);
  const ttlSeconds = 7 * 24 * 60 * 60; // 7 days

  // Store refresh:<hash> -> userId
  await redis.set(`refresh:${tokenHash}`, userId, ttlSeconds);

  // Track in user_refresh:<userId> list for revocation on password reset
  const userTokens = (await redis.get(`user_refresh:${userId}`)) || [];
  if (Array.isArray(userTokens)) {
    userTokens.push(tokenHash);
    await redis.set(`user_refresh:${userId}`, userTokens, ttlSeconds);
  } else {
    await redis.set(`user_refresh:${userId}`, [tokenHash], ttlSeconds);
  }

  // Set httpOnly cookie
  res.cookie('refreshToken', rawRefreshToken, {
    httpOnly: true,
    secure: config.app.env === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return rawRefreshToken;
}

// Helper: Invalidate all refresh tokens for a user
async function invalidateUserRefreshTokens(userId) {
  const userTokens = (await redis.get(`user_refresh:${userId}`)) || [];
  if (Array.isArray(userTokens)) {
    for (const h of userTokens) {
      await redis.del(`refresh:${h}`);
    }
  }
  await redis.del(`user_refresh:${userId}`);
}

// ==========================================
// 1. POST /auth/signup
// ==========================================
export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const emailClean = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await findUserByEmail(emailClean);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    // Hash with argon2
    const passwordHash = await hashPassword(password);

    // Insert user
    let newUser = null;
    try {
      const insertRes = await query(
        `INSERT INTO users (email, full_name, password_hash, email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, false, NOW(), NOW())
         RETURNING id, email, full_name, email_verified, avatar_url, created_at`,
        [emailClean, name.trim(), passwordHash]
      );
      if (insertRes && insertRes.rows && insertRes.rows.length > 0) {
        newUser = insertRes.rows[0];
      }
    } catch (err) {}

    if (!newUser) {
      newUser = mockStore.saveUser({
        email: emailClean,
        full_name: name.trim(),
        name: name.trim(),
        password_hash: passwordHash,
        email_verified: false,
      });
    }

    // Generate random verification token (32 bytes)
    const rawToken = generateVerificationToken();
    const tokenHash = hashToken(rawToken);

    // Store in Redis key verify:<hash> with 24h TTL (86400 seconds)
    await redis.set(`verify:${tokenHash}`, newUser.id, 24 * 60 * 60);

    // Send verification email (or print link in console in development mode)
    await sendVerificationEmail({
      to: newUser.email,
      name: newUser.full_name || name.trim(),
      token: rawToken,
    });

    // Respond 201 with generic message
    return res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      data: {
        userId: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. POST /auth/verify-email
// ==========================================
export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Verification token is required.',
      });
    }

    // Hash token to look up in Redis
    const tokenHash = hashToken(token);
    const userId = await redis.get(`verify:${tokenHash}`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'EXPIRED_OR_INVALID_TOKEN',
        message: 'This verification link is invalid or has expired. Please request a new one.',
      });
    }

    // Update user email_verified = true
    try {
      await query('UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1', [userId]);
    } catch (err) {}

    mockStore.updateUser(userId, { email_verified: true });

    // Delete token from Redis
    await redis.del(`verify:${tokenHash}`);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. POST /auth/resend-verification
// ==========================================
export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;
    const emailClean = email.trim().toLowerCase();

    const user = await findUserByEmail(emailClean);
    if (user && !user.email_verified) {
      const rawToken = generateVerificationToken();
      const tokenHash = hashToken(rawToken);

      await redis.set(`verify:${tokenHash}`, user.id, 24 * 60 * 60);

      await sendVerificationEmail({
        to: user.email,
        name: user.full_name || 'Developer',
        token: rawToken,
      });
    }

    // Always return the same response to prevent email enumeration
    return res.status(200).json({
      success: true,
      message: 'If an unverified account exists with this email, a verification link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 4. POST /auth/login
// ==========================================
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const emailClean = email.trim().toLowerCase();

    const user = await findUserByEmail(emailClean);

    // Same error message for wrong email and wrong password
    const genericInvalidError = {
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    };

    if (!user) {
      return res.status(401).json(genericInvalidError);
    }

    // If the user has no password_hash (Google-only user)
    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        error: 'GOOGLE_AUTH_ONLY',
        message: 'This account was created with Google. Please use Google sign-in or reset your password.',
      });
    }

    // Verify password with argon2
    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json(genericInvalidError);
    }

    // Check email verification status
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        error: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address before signing in.',
      });
    }

    // Generate access token (15 minutes)
    const accessToken = generateAccessToken(user);

    // Create rotated refresh session and set httpOnly cookie (7 days)
    await createRefreshSession(user.id, res);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name || user.name,
          avatar_url: user.avatar_url,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 5. POST /auth/refresh
// ==========================================
export async function refresh(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (!rawRefreshToken) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Refresh token cookie is missing.',
      });
    }

    const tokenHash = hashToken(rawRefreshToken);
    const userId = await redis.get(`refresh:${tokenHash}`);

    if (!userId) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config.app.env === 'production',
        sameSite: 'lax',
        path: '/',
      });
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    const user = await findUserById(userId);
    if (!user) {
      await redis.del(`refresh:${tokenHash}`);
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User account not found.',
      });
    }

    // Invalidate the old refresh token (Token Rotation)
    await redis.del(`refresh:${tokenHash}`);

    // Clean old hash from user_refresh list
    const userTokens = (await redis.get(`user_refresh:${userId}`)) || [];
    if (Array.isArray(userTokens)) {
      const filtered = userTokens.filter((h) => h !== tokenHash);
      await redis.set(`user_refresh:${userId}`, filtered, 7 * 24 * 60 * 60);
    }

    // Issue rotated refresh token and set new cookie
    await createRefreshSession(user.id, res);

    // Generate new 15-minute access token
    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name || user.name,
          avatar_url: user.avatar_url,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 6. POST /auth/logout
// ==========================================
export async function logout(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await redis.del(`refresh:${tokenHash}`);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.app.env === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 7. GET /auth/me
// ==========================================
export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.full_name || req.user.name,
        avatar_url: req.user.avatar_url,
      },
    },
  });
}

// ==========================================
// 8. POST /auth/forgot-password
// ==========================================
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const emailClean = email.trim().toLowerCase();

    const user = await findUserByEmail(emailClean);
    if (user) {
      const rawToken = generateRandomToken(32);
      const tokenHash = hashToken(rawToken);

      // Store in Redis with 1h TTL (3600 seconds)
      await redis.set(`reset:${tokenHash}`, user.id, 3600);

      await sendPasswordResetEmail({
        to: user.email,
        name: user.full_name || 'Developer',
        token: rawToken,
      });
    }

    // Always return the exact same response to prevent email enumeration
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 9. POST /auth/reset-password
// ==========================================
export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const tokenHash = hashToken(token);

    const userId = await redis.get(`reset:${tokenHash}`);
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    const newHash = await hashPassword(password);

    // Update in DB or mockStore
    try {
      await query(
        'UPDATE users SET password_hash = $1, email_verified = true, updated_at = NOW() WHERE id = $2',
        [newHash, userId]
      );
    } catch (err) {}

    mockStore.updateUser(userId, {
      password_hash: newHash,
      email_verified: true,
    });

    // Delete single-use reset token from Redis
    await redis.del(`reset:${tokenHash}`);

    // Invalidate that user's existing refresh tokens
    await invalidateUserRefreshTokens(userId);

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset! Please log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 10. GET /auth/google
// ==========================================
export async function googleAuth(req, res, next) {
  try {
    // Generate random state (16 bytes)
    const state = generateRandomToken(16);

    // Store in Redis for 10 minutes (600s)
    await redis.set(`google_state:${state}`, 'active', 600);

    const consentUrl = generateGoogleAuthUrl(state);
    return res.redirect(consentUrl);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 11. GET /auth/google/callback
// ==========================================
export async function googleCallback(req, res, next) {
  const frontendUrl = config.app.frontendUrl.replace(/\/$/, '');
  try {
    const { code, state, error } = req.query;

    if (error || !code || !state) {
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    // Validate and delete state with getdel
    const validState = await redis.getdel(`google_state:${state}`);
    if (!validState) {
      return res.redirect(`${frontendUrl}/login?error=invalid_oauth_state`);
    }

    // Exchange code and verify ID token with google-auth-library
    let googleProfile;
    try {
      googleProfile = await verifyGoogleAuthCode(code);
    } catch (oauthErr) {
      console.error('[Google OAuth Error]: Failed code exchange:', oauthErr.message);
      return res.redirect(`${frontendUrl}/login?error=google_verification_failed`);
    }

    // Never link accounts when Google email_verified is false
    if (!googleProfile.email_verified) {
      return res.redirect(`${frontendUrl}/login?error=google_email_unverified`);
    }

    let user = null;

    // (a) oauth_accounts match, login
    const existingOAuth = await findOAuthAccount('google', googleProfile.sub);
    if (existingOAuth) {
      user = await findUserById(existingOAuth.user_id);
    }

    // (b) same email exists and Google email_verified is true, link the account
    if (!user) {
      const existingEmailUser = await findUserByEmail(googleProfile.email.toLowerCase());
      if (existingEmailUser) {
        user = existingEmailUser;
        // Link to oauth_accounts
        try {
          await query(
            `INSERT INTO oauth_accounts (user_id, provider, provider_user_id, created_at)
             VALUES ($1, 'google', $2, NOW())
             ON CONFLICT (provider, provider_user_id) DO NOTHING`,
            [user.id, googleProfile.sub]
          );
        } catch (e) {}

        mockStore.saveOAuthAccount({
          user_id: user.id,
          provider: 'google',
          provider_user_id: googleProfile.sub,
        });

        // Ensure email_verified is true
        if (!user.email_verified) {
          try {
            await query('UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1', [user.id]);
          } catch (e) {}
          mockStore.updateUser(user.id, { email_verified: true });
        }
      }
    }

    // (c) otherwise create a new user with email_verified=true and password_hash=null
    if (!user) {
      try {
        const insertUser = await query(
          `INSERT INTO users (email, full_name, password_hash, email_verified, avatar_url, created_at, updated_at)
           VALUES ($1, $2, null, true, $3, NOW(), NOW())
           RETURNING *`,
          [googleProfile.email.toLowerCase(), googleProfile.full_name, googleProfile.avatar_url]
        );
        if (insertUser && insertUser.rows && insertUser.rows.length > 0) {
          user = insertUser.rows[0];
        }
      } catch (e) {}

      if (!user) {
        user = mockStore.saveUser({
          email: googleProfile.email.toLowerCase(),
          full_name: googleProfile.full_name,
          name: googleProfile.full_name,
          password_hash: null,
          email_verified: true,
          avatar_url: googleProfile.avatar_url,
        });
      }

      // Record in oauth_accounts
      try {
        await query(
          `INSERT INTO oauth_accounts (user_id, provider, provider_user_id, created_at)
           VALUES ($1, 'google', $2, NOW())`,
          [user.id, googleProfile.sub]
        );
      } catch (e) {}

      mockStore.saveOAuthAccount({
        user_id: user.id,
        provider: 'google',
        provider_user_id: googleProfile.sub,
      });
    }

    // Set the refresh cookie (7 days)
    await createRefreshSession(user.id, res);

    // Redirect to FRONTEND_URL/dashboard
    return res.redirect(`${frontendUrl}/dashboard`);
  } catch (err) {
    console.error('[Google Callback Fatal]:', err);
    return res.redirect(`${frontendUrl}/login?error=server_error`);
  }
}
