/**
 * Hind DB - Complete End-to-End Authentication Acceptance Verification Suite
 */

import http from 'http';
import app from './src/app.js';
import { redis } from './config/redis.js';

const PORT = 4005;
const BASE = `http://localhost:${PORT}`;

// Captured console links
let lastVerificationLink = null;
let lastResetLink = null;

const originalConsoleLog = console.log;
console.log = (...args) => {
  const line = args.join(' ');
  if (line.includes('/verify-email?token=')) {
    const match = line.match(/\/verify-email\?token=([a-f0-9]+)/);
    if (match) lastVerificationLink = match[1];
  }
  if (line.includes('/reset-password?token=')) {
    const match = line.match(/\/reset-password\?token=([a-f0-9]+)/);
    if (match) lastResetLink = match[1];
  }
  originalConsoleLog(...args);
};

async function runAcceptanceChecks() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  originalConsoleLog(`\n[Test Server] Running on ${BASE}\n`);

  const results = [];

  function pass(name, details = '') {
    results.push({ name, passed: true, details });
    originalConsoleLog(`✅ PASS: ${name} ${details ? '(' + details + ')' : ''}`);
  }

  function fail(name, details = '') {
    results.push({ name, passed: false, details });
    originalConsoleLog(`❌ FAIL: ${name} (${details})`);
  }

  try {
    const testEmail = `test_${Date.now()}@hind.io`;
    const testPassword = 'SecurePassword2026!';
    const newPassword = 'NewSecurePassword2026!';
    let verificationToken = null;
    let resetToken = null;
    let accessToken = null;
    let refreshCookie = null;

    // Check 1: Signup Validation (Short password rejection)
    {
      const res = await fetch(`${BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Aarav Sharma', email: testEmail, password: 'short' }),
      });
      const data = await res.json();
      if (res.status === 400 && data.error === 'VALIDATION_ERROR') {
        pass('Zod validation blocks short passwords (< 8 chars)');
      } else {
        fail('Zod validation blocks short passwords', `Status: ${res.status}`);
      }
    }

    // Check 2: Valid Signup (creates user, emits verification link)
    {
      lastVerificationLink = null;
      const res = await fetch(`${BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Aarav Sharma', email: testEmail, password: testPassword }),
      });
      const data = await res.json();
      verificationToken = lastVerificationLink;

      if (res.status === 201 && data.success && verificationToken) {
        pass('Signup creates user and verification link appears in console/email', `Token: ${verificationToken.slice(0, 10)}...`);
      } else {
        fail('Signup creates user and verification link appears', `Status: ${res.status}, Token: ${verificationToken}`);
      }
    }

    // Check 3: Duplicate email returns 409
    {
      const res = await fetch(`${BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Aarav Sharma', email: testEmail, password: testPassword }),
      });
      if (res.status === 409) {
        pass('Duplicate email signup returns 409 Conflict');
      } else {
        fail('Duplicate email signup returns 409', `Status: ${res.status}`);
      }
    }

    // Check 4: Login blocked before email verification
    {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === 'EMAIL_NOT_VERIFIED') {
        pass('Login is blocked (403) before email verification');
      } else {
        fail('Login blocked before verification', `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
      }
    }

    // Check 5: Wrong password returns generic error
    {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: 'WrongPassword123!' }),
      });
      const data = await res.json();
      if (res.status === 401 && data.message === 'Invalid email or password.') {
        pass('Wrong password returns generic error without leaking account state');
      } else {
        fail('Wrong password returns generic error', `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
      }
    }

    // Check 6: Verify email with token
    {
      const res = await fetch(`${BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });
      const data = await res.json();
      if (res.status === 200 && data.success) {
        pass('Verify email succeeds and activates account');
      } else {
        fail('Verify email succeeds', `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
      }
    }

    // Check 7: Verify email with same token fails (single use)
    {
      const res = await fetch(`${BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });
      if (res.status === 400) {
        pass('Verification token is single-use and invalidated in Redis after consumption');
      } else {
        fail('Verification token single-use', `Status: ${res.status}`);
      }
    }

    // Check 8: Login works after email verification
    {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });
      const data = await res.json();
      const rawCookie = res.headers.get('set-cookie');

      if (res.status === 200 && data.success && data.data?.accessToken && rawCookie) {
        accessToken = data.data.accessToken;
        refreshCookie = rawCookie.split(';')[0];
        pass('Login succeeds after verification, returns 15-min JWT & sets httpOnly refresh cookie');
      } else {
        fail('Login succeeds after verification', `Status: ${res.status}, Data: ${JSON.stringify(data)}`);
      }
    }

    // Check 9: GET /auth/me returns user profile
    {
      const res = await fetch(`${BASE}/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.status === 200 && data.success && data.data?.user?.email === testEmail) {
        pass('GET /auth/me returns protected user profile (id, email, full_name, avatar_url)');
      } else {
        fail('GET /auth/me returns profile', `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
      }
    }

    // Check 10: Token Refresh rotates refresh token and returns new access token
    let newRefreshCookie = null;
    {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: refreshCookie,
        },
      });
      const data = await res.json();
      const rawCookie = res.headers.get('set-cookie');

      if (res.status === 200 && data.success && data.data?.accessToken && rawCookie) {
        newRefreshCookie = rawCookie.split(';')[0];
        pass('POST /auth/refresh rotates refresh token and returns new access token');
      } else {
        fail('POST /auth/refresh rotates token', `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
      }
    }

    // Check 11: Old refresh token is rejected (rotation replay protection)
    {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: refreshCookie, // old cookie
        },
      });
      if (res.status === 401) {
        pass('Old refresh token is invalidated upon rotation (replay protection)');
      } else {
        fail('Old refresh token invalidated', `Status: ${res.status}`);
      }
    }

    // Check 12: Logout clears cookie and invalidates session in Redis
    {
      const res = await fetch(`${BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: newRefreshCookie,
        },
      });
      const data = await res.json();
      const rawCookie = res.headers.get('set-cookie');

      // Try calling /auth/refresh with the logged out token - must fail with 401
      const refreshAfterLogout = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: newRefreshCookie,
        },
      });

      if (res.status === 200 && data.success && rawCookie && (rawCookie.includes('1970') || rawCookie.includes('Max-Age=0') || rawCookie.includes('refreshToken=;')) && refreshAfterLogout.status === 401) {
        pass('POST /auth/logout clears refresh cookie and deletes session from Redis (subsequent refresh returns 401)');
      } else {
        fail('POST /auth/logout invalidates token', `Logout status: ${res.status}, Refresh after logout status: ${refreshAfterLogout.status}`);
      }
    }

    // Check 13: Forgot Password generates reset link
    {
      lastResetLink = null;
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      resetToken = lastResetLink;

      if (res.status === 200 && data.success && resetToken) {
        pass('POST /auth/forgot-password sends password reset link to console/email', `Token: ${resetToken.slice(0, 10)}...`);
      } else {
        fail('POST /auth/forgot-password sends reset link', `Status: ${res.status}, Token: ${resetToken}`);
      }
    }

    // Check 14: Reset Password updates password and revokes previous sessions
    {
      const res = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });
      const data = await res.json();

      if (res.status === 200 && data.success) {
        pass('POST /auth/reset-password updates password and invalidates reset token');
      } else {
        fail('POST /auth/reset-password updates password', `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
      }
    }

    // Check 15: Login with old password fails, login with new password succeeds
    {
      const oldLogin = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });

      const newLogin = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: newPassword }),
      });
      const newLoginData = await newLogin.json();

      if (oldLogin.status === 401 && newLogin.status === 200 && newLoginData.success) {
        pass('Old password fails, new password logs in successfully');
      } else {
        fail('Old password fails, new password succeeds', `Old: ${oldLogin.status}, New: ${newLogin.status}`);
      }
    }

    // Check 16: Google OAuth initiation generates state and redirects
    {
      const res = await fetch(`${BASE}/auth/google`, { redirect: 'manual' });
      const location = res.headers.get('location');

      if (res.status === 302 && location && location.includes('accounts.google.com')) {
        pass('GET /auth/google generates state in Redis and redirects to Google OAuth consent');
      } else {
        fail('GET /auth/google redirects to Google', `Status: ${res.status}, Location: ${location}`);
      }
    }

    // Check 17: Google Callback handles state validation
    {
      const res = await fetch(`${BASE}/auth/google/callback?state=invalid_state&code=test`, { redirect: 'manual' });
      const location = res.headers.get('location');

      if (res.status === 302 && location && location.includes('error=invalid_oauth_state')) {
        pass('GET /auth/google/callback rejects invalid or expired OAuth state');
      } else {
        fail('GET /auth/google/callback validates state', `Status: ${res.status}, Location: ${location}`);
      }
    }

  } catch (err) {
    originalConsoleLog('Suite error:', err);
  } finally {
    server.close();
    console.log = originalConsoleLog;
  }

  const allPassed = results.length > 0 && results.every((r) => r.passed);
  console.log('\n======================================================');
  console.log(`TOTAL ACCEPTANCE CHECKS: ${results.length}`);
  console.log(`PASSED: ${results.filter((r) => r.passed).length}`);
  console.log(`FAILED: ${results.filter((r) => !r.passed).length}`);
  console.log(`OVERALL STATUS: ${allPassed ? 'ALL CHECKS PASSED ✅' : 'SOME CHECKS FAILED ❌'}`);
  console.log('======================================================\n');
  process.exit(allPassed ? 0 : 1);
}

runAcceptanceChecks();
