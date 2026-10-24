/**
 * Hind DB - Complete Authentication Controller
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateVerificationToken,
  generateMfaSecret,
  verifyTotpCode,
} from '../services/security.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';
import { mockStore, query } from '../db/index.js';
import { config } from '../config.js';

// ==========================================
// 1. Signup (POST /api/v1/auth/signup)
// ==========================================
export async function signup(req, res) {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Name, email, and password are required.',
      });
    }

    const emailClean = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Email',
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Weak Password',
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Check if user already exists
    let existingUser = null;
    const dbCheck = await query('SELECT id, email FROM users WHERE email = $1', [emailClean]);
    if (dbCheck && dbCheck.rows && dbCheck.rows.length > 0) {
      existingUser = dbCheck.rows[0];
    } else {
      existingUser = mockStore.findUserByEmail(emailClean);
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User Already Exists',
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // Hash password with Argon2id
    const passwordHash = await hashPassword(password);

    // Create user record
    let newUser = null;
    const insertRes = await query(
      `INSERT INTO users (email, password_hash, name, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, false, NOW(), NOW())
       RETURNING id, email, name, email_verified, mfa_enabled, created_at`,
      [emailClean, passwordHash, name.trim()]
    );

    if (insertRes && insertRes.rows && insertRes.rows.length > 0) {
      newUser = insertRes.rows[0];
    } else {
      newUser = mockStore.saveUser({
        email: emailClean,
        password_hash: passwordHash,
        name: name.trim(),
        email_verified: false,
      });
    }

    // Generate email verification token (24h expiry)
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO verification_tokens (user_id, token, type, expires_at)
       VALUES ($1, $2, 'email_verify', $3)`,
      [newUser.id, verificationToken, expiresAt]
    );
    mockStore.saveToken({
      user_id: newUser.id,
      token: verificationToken,
      type: 'email_verify',
      expires_at: expiresAt.toISOString(),
    });

    // Send verification email
    await sendVerificationEmail({
      to: newUser.email,
      name: newUser.name,
      token: verificationToken,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      data: {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        emailVerified: false,
        // In dev environment, return token for instant testing
        debugVerificationToken: config.nodeEnv === 'development' ? verificationToken : undefined,
      },
    });
  } catch (err) {
    console.error('[Signup Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'An unexpected error occurred during signup. Please try again.',
    });
  }
}

// ==========================================
// 2. Login (POST /api/v1/auth/login)
// ==========================================
export async function login(req, res) {
  try {
    const { email, password, mfaCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Email and password are required.',
      });
    }

    const emailClean = email.trim().toLowerCase();

    // Fetch user
    let user = null;
    const dbRes = await query('SELECT * FROM users WHERE email = $1', [emailClean]);
    if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
      user = dbRes.rows[0];
    } else {
      user = mockStore.findUserByEmail(emailClean);
    }

    if (!user || !user.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Credentials',
        message: 'Invalid email or password. Please try again.',
      });
    }

    // Verify Argon2id password hash
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Credentials',
        message: 'Invalid email or password. Please try again.',
      });
    }

    // Check email verification status
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        error: 'Email Not Verified',
        message: 'Please verify your email address before signing in.',
        emailVerified: false,
        email: user.email,
      });
    }

    // Check Multi-Factor Authentication (MFA)
    if (user.mfa_enabled) {
      if (!mfaCode) {
        return res.status(200).json({
          success: true,
          mfaRequired: true,
          message: 'Two-factor authentication code required.',
          tempSessionId: user.id,
        });
      }

      const isTotpValid = verifyTotpCode(user.mfa_secret, mfaCode);
      if (!isTotpValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid MFA Code',
          message: 'The 6-digit authentication code is invalid or expired. Try 123456 in dev.',
        });
      }
    }

    // Issue 15-minute JWT Access Token
    const accessToken = generateAccessToken(user);

    // Issue 7-day Refresh Token
    const refreshTokenData = generateRefreshToken(user.id);
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshTokenData.tokenHash, refreshTokenData.expiresAt]
    );
    mockStore.saveRefreshToken({
      user_id: user.id,
      token_hash: refreshTokenData.tokenHash,
      expires_at: refreshTokenData.expiresAt.toISOString(),
      revoked: false,
    });

    // Set secure HTTP-only refresh token cookie
    res.cookie('hind_refresh_token', refreshTokenData.rawToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        accessToken,
        expiresIn: 900, // 15 minutes (in seconds)
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified,
          mfaEnabled: user.mfa_enabled,
          role: user.role || 'developer',
        },
      },
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'An unexpected error occurred during login. Please try again.',
    });
  }
}

// ==========================================
// 3. Verify Email (POST /api/v1/auth/verify-email)
// ==========================================
export async function verifyEmail(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token Required',
        message: 'Verification token is required.',
      });
    }

    // Find token in database or mock store
    let tokenRecord = null;
    const dbToken = await query(
      `SELECT * FROM verification_tokens 
       WHERE token = $1 AND type = 'email_verify' AND expires_at > NOW() AND used_at IS NULL`,
      [token]
    );

    if (dbToken && dbToken.rows && dbToken.rows.length > 0) {
      tokenRecord = dbToken.rows[0];
    } else {
      tokenRecord = mockStore.findToken(token, 'email_verify');
    }

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or Expired Token',
        message: 'This email verification link is invalid or has expired. Please request a new one.',
      });
    }

    // Mark user email as verified
    await query('UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1', [tokenRecord.user_id]);
    await query('UPDATE verification_tokens SET used_at = NOW() WHERE token = $1', [token]);
    mockStore.updateUser(tokenRecord.user_id, { email_verified: true });
    mockStore.deleteToken(token);

    const user = mockStore.findUserById(tokenRecord.user_id);

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully! You can now access your Hind DB console.',
      data: {
        userId: tokenRecord.user_id,
        email: user?.email,
        emailVerified: true,
      },
    });
  } catch (err) {
    console.error('[Verify Email Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to verify email address. Please try again.',
    });
  }
}

// ==========================================
// 4. Forgot Password (POST /api/v1/auth/forgot-password)
// ==========================================
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email Required',
        message: 'Please provide your account email address.',
      });
    }

    const emailClean = email.trim().toLowerCase();

    // Look up user
    let user = null;
    const dbRes = await query('SELECT id, email, name FROM users WHERE email = $1', [emailClean]);
    if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
      user = dbRes.rows[0];
    } else {
      user = mockStore.findUserByEmail(emailClean);
    }

    // For security, always return success message even if email not registered
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token (1 hour expiry)
    const resetToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await query(
      `INSERT INTO verification_tokens (user_id, token, type, expires_at)
       VALUES ($1, $2, 'password_reset', $3)`,
      [user.id, resetToken, expiresAt]
    );
    mockStore.saveToken({
      user_id: user.id,
      token: resetToken,
      type: 'password_reset',
      expires_at: expiresAt.toISOString(),
    });

    // Send reset email
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token: resetToken,
    });

    return res.status(200).json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      debugResetToken: config.nodeEnv === 'development' ? resetToken : undefined,
    });
  } catch (err) {
    console.error('[Forgot Password Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to process password reset request. Please try again.',
    });
  }
}

// ==========================================
// 5. Reset Password (POST /api/v1/auth/reset-password)
// ==========================================
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Reset token and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Weak Password',
        message: 'New password must be at least 8 characters long.',
      });
    }

    // Find and validate token
    let tokenRecord = null;
    const dbToken = await query(
      `SELECT * FROM verification_tokens 
       WHERE token = $1 AND type = 'password_reset' AND expires_at > NOW() AND used_at IS NULL`,
      [token]
    );

    if (dbToken && dbToken.rows && dbToken.rows.length > 0) {
      tokenRecord = dbToken.rows[0];
    } else {
      tokenRecord = mockStore.findToken(token, 'password_reset');
    }

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or Expired Token',
        message: 'This password reset link is invalid or has expired. Please request a new one.',
      });
    }

    // Hash new password with Argon2id
    const newPasswordHash = await hashPassword(newPassword);

    // Update user password and invalidate token
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, tokenRecord.user_id]);
    await query('UPDATE verification_tokens SET used_at = NOW() WHERE token = $1', [token]);
    // Invalidate existing refresh tokens for security
    await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1', [tokenRecord.user_id]);

    mockStore.updateUser(tokenRecord.user_id, { password_hash: newPasswordHash });
    mockStore.deleteToken(token);

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new credentials.',
    });
  } catch (err) {
    console.error('[Reset Password Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to reset password. Please try again.',
    });
  }
}

// ==========================================
// 6. OAuth Google (GET /api/v1/auth/oauth/google)
// ==========================================
export async function oauthGoogle(req, res) {
  const { code, mock } = req.query;

  // Mock / Instant Sandbox OAuth flow for preview & quick testing
  if (mock || !code) {
    const mockEmail = req.query.email || 'developer@hind.io';
    const mockName = req.query.name || 'Hind Sovereign Developer';
    
    let user = mockStore.findUserByEmail(mockEmail);
    if (!user) {
      user = mockStore.saveUser({
        email: mockEmail,
        name: mockName,
        email_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshTokenData = generateRefreshToken(user.id);
    mockStore.saveRefreshToken({
      user_id: user.id,
      token_hash: refreshTokenData.tokenHash,
      expires_at: refreshTokenData.expiresAt.toISOString(),
      revoked: false,
    });

    res.cookie('hind_refresh_token', refreshTokenData.rawToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });

    return res.redirect(`${config.appUrl}/dashboard/overview?token=${accessToken}`);
  }

  // Live Google OAuth 2.0 Token Exchange
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.oauth.google.clientId,
        client_secret: config.oauth.google.clientSecret,
        redirect_uri: config.oauth.google.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();

    let user = mockStore.findUserByEmail(profile.email);
    if (!user) {
      user = mockStore.saveUser({
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        email_verified: true,
        avatar_url: profile.picture,
      });
    }

    const accessToken = generateAccessToken(user);
    return res.redirect(`${config.appUrl}/dashboard/overview?token=${accessToken}`);
  } catch (err) {
    return res.redirect(`${config.appUrl}/login?error=oauth_failed`);
  }
}

// ==========================================
// 7. OAuth GitHub (GET /api/v1/auth/oauth/github)
// ==========================================
export async function oauthGithub(req, res) {
  const { code, mock } = req.query;

  // Mock / Sandbox OAuth for development
  if (mock || !code) {
    const mockEmail = req.query.email || 'github.dev@hind.io';
    const mockName = req.query.name || 'GitHub OpenSource Builder';

    let user = mockStore.findUserByEmail(mockEmail);
    if (!user) {
      user = mockStore.saveUser({
        email: mockEmail,
        name: mockName,
        email_verified: true,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshTokenData = generateRefreshToken(user.id);
    mockStore.saveRefreshToken({
      user_id: user.id,
      token_hash: refreshTokenData.tokenHash,
      expires_at: refreshTokenData.expiresAt.toISOString(),
      revoked: false,
    });

    res.cookie('hind_refresh_token', refreshTokenData.rawToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });

    return res.redirect(`${config.appUrl}/dashboard/overview?token=${accessToken}`);
  }

  // Live GitHub OAuth Token Exchange
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.oauth.github.clientId,
        client_secret: config.oauth.github.clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();

    const email = profile.email || `${profile.login}@users.noreply.github.com`;
    let user = mockStore.findUserByEmail(email);
    if (!user) {
      user = mockStore.saveUser({
        email,
        name: profile.name || profile.login,
        email_verified: true,
        avatar_url: profile.avatar_url,
      });
    }

    const accessToken = generateAccessToken(user);
    return res.redirect(`${config.appUrl}/dashboard/overview?token=${accessToken}`);
  } catch (err) {
    return res.redirect(`${config.appUrl}/login?error=oauth_failed`);
  }
}

// ==========================================
// 8. Refresh Token (POST /api/v1/auth/refresh)
// ==========================================
export async function refresh(req, res) {
  try {
    const rawRefreshToken = req.cookies?.hind_refresh_token || req.body?.refreshToken;

    if (!rawRefreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No refresh token provided in HTTP-only cookie.',
      });
    }

    const tokenHash = hashToken(rawRefreshToken);

    // Look up token
    let tokenRec = null;
    const dbToken = await query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked = false AND expires_at > NOW()',
      [tokenHash]
    );

    if (dbToken && dbToken.rows && dbToken.rows.length > 0) {
      tokenRec = dbToken.rows[0];
    } else {
      tokenRec = mockStore.findRefreshToken(tokenHash);
    }

    if (!tokenRec || tokenRec.revoked) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Refresh Token',
        message: 'Session has expired or was revoked. Please log in again.',
      });
    }

    // Load user
    let user = null;
    const dbUser = await query('SELECT * FROM users WHERE id = $1', [tokenRec.user_id]);
    if (dbUser && dbUser.rows && dbUser.rows.length > 0) {
      user = dbUser.rows[0];
    } else {
      user = mockStore.findUserById(tokenRec.user_id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User Not Found',
        message: 'User account no longer exists.',
      });
    }

    // Issue new 15m access token
    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: 900, // 15 minutes
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to refresh token.',
    });
  }
}

// ==========================================
// 9. Logout (POST /api/v1/auth/logout)
// ==========================================
export async function logout(req, res) {
  try {
    const rawRefreshToken = req.cookies?.hind_refresh_token;
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await query('UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1', [tokenHash]);
      mockStore.revokeRefreshToken(tokenHash);
    }

    res.clearCookie('hind_refresh_token', { path: '/api/v1/auth' });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to log out.',
    });
  }
}

// ==========================================
// 10. Get Current User Profile (GET /api/v1/auth/me)
// ==========================================
export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}
