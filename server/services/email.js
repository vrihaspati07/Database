/**
 * Hind DB - Email Notification Service (Resend & SendGrid)
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { config } from '../config.js';

export async function sendVerificationEmail({ to, name, token }) {
  const verifyUrl = `${config.appUrl}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 20px; }
          .card { max-width: 540px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); }
          .logo { font-size: 24px; font-weight: 800; color: #0F172A; text-decoration: none; display: inline-block; margin-bottom: 24px; }
          .logo span { color: #1E3A8A; }
          h1 { font-size: 22px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }
          p { font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px; }
          .btn { display: inline-block; background: #1E3A8A; color: #FFFFFF !important; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 9999px; margin: 8px 0 24px; }
          .footer { font-size: 12px; color: #94A3B8; text-align: center; margin-top: 32px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Hind <span>DB</span></div>
          <h1>Verify your email address</h1>
          <p>Hi ${name || 'there'},</p>
          <p>Welcome to <strong>Hind DB</strong> — India's First Managed Database Platform. Please click the button below to verify your email address and activate your sovereign cloud database workspace.</p>
          <a href="${verifyUrl}" class="btn">Verify Email Address</a>
          <p style="font-size: 13px; color: #64748B;">Or copy and paste this link into your browser:<br><a href="${verifyUrl}" style="color: #1E3A8A; word-break: break-all;">${verifyUrl}</a></p>
          <p style="font-size: 13px; color: #94A3B8;">This verification link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
          <div class="footer">
            © 2026 Hind. A Hind India Private Limited Company.<br>
            India • hind.io
          </div>
        </div>
      </body>
    </html>
  `;

  return deliverEmail({
    to,
    subject: 'Verify your email for Hind DB',
    html,
  });
}

export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = `${config.appUrl}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 20px; }
          .card { max-width: 540px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); }
          .logo { font-size: 24px; font-weight: 800; color: #0F172A; text-decoration: none; display: inline-block; margin-bottom: 24px; }
          .logo span { color: #1E3A8A; }
          h1 { font-size: 22px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }
          p { font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px; }
          .btn { display: inline-block; background: #1E3A8A; color: #FFFFFF !important; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 9999px; margin: 8px 0 24px; }
          .footer { font-size: 12px; color: #94A3B8; text-align: center; margin-top: 32px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Hind <span>DB</span></div>
          <h1>Reset your password</h1>
          <p>Hi ${name || 'there'},</p>
          <p>We received a request to reset the password for your Hind DB account. Click the button below to choose a new password.</p>
          <a href="${resetUrl}" class="btn">Reset Password</a>
          <p style="font-size: 13px; color: #64748B;">Or copy and paste this link into your browser:<br><a href="${resetUrl}" style="color: #1E3A8A; word-break: break-all;">${resetUrl}</a></p>
          <p style="font-size: 13px; color: #94A3B8;">This reset link will expire in 1 hour. If you did not make this request, please ensure your account is secure.</p>
          <div class="footer">
            © 2026 Hind. A Hind India Private Limited Company.<br>
            India • hind.io
          </div>
        </div>
      </body>
    </html>
  `;

  return deliverEmail({
    to,
    subject: 'Reset your Hind DB password',
    html,
  });
}

async function deliverEmail({ to, subject, html }) {
  // If in dev or keys are not set, log and return success
  if (config.nodeEnv === 'development' || !config.email.resendApiKey || config.email.resendApiKey.startsWith('re_mock')) {
    console.log(`[Email Service] Delivered to: ${to} | Subject: ${subject}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  try {
    // Send via Resend REST API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.email.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.email.fromEmail,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (err) {
    console.error('[Email Delivery Error]:', err);
    return { success: false, error: err.message };
  }
}
