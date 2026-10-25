/**
 * Hind DB - Sovereign Email Service (Nodemailer)
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { host, port, user, pass } = config.smtp;
  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail({ to, name, token }) {
  const frontendUrl = config.app.frontendUrl.replace(/\/$/, '');
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;
  const mailTransporter = getTransporter();

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: config.smtp.from,
        to,
        subject: 'Verify your Hind DB Account',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; rounded: 12px;">
            <h2 style="color: #0F172A; margin-bottom: 16px;">Welcome to Hind DB, ${name || 'Developer'}!</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              Please verify your email address to complete your registration and activate your database cluster.
            </p>
            <div style="margin: 28px 0;">
              <a href="${verificationLink}" style="background-color: #1E3A8A; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #64748B; font-size: 13px;">Or copy and paste this link in your browser:</p>
            <p style="color: #1E3A8A; font-size: 13px; word-break: break-all;">${verificationLink}</p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
            <p style="color: #94A3B8; font-size: 12px;">© 2026 Hind. A Hind India Private Limited Company. Sovereign Cloud Platform.</p>
          </div>
        `,
      });
      return { sent: true };
    } catch (err) {
      console.error('[MailService Error]: Failed to send verification email via SMTP:', err.message);
    }
  }

  // Fallback in development: Print verification link to console
  if (config.app.env === 'development' || !mailTransporter) {
    console.log('\n======================================================');
    console.log(`[Hind DB MailService (Dev Mode)]: Verification Link for ${to}`);
    console.log(`==> ${verificationLink}`);
    console.log('======================================================\n');
  }

  return { sent: false, fallback: true, link: verificationLink };
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail({ to, name, token }) {
  const frontendUrl = config.app.frontendUrl.replace(/\/$/, '');
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  const mailTransporter = getTransporter();

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: config.smtp.from,
        to,
        subject: 'Reset your Hind DB Password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; rounded: 12px;">
            <h2 style="color: #0F172A; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              We received a request to reset your password for your Hind DB account.
            </p>
            <div style="margin: 28px 0;">
              <a href="${resetLink}" style="background-color: #1E3A8A; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #64748B; font-size: 13px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            <p style="color: #1E3A8A; font-size: 13px; word-break: break-all;">${resetLink}</p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
            <p style="color: #94A3B8; font-size: 12px;">© 2026 Hind. A Hind India Private Limited Company. Sovereign Cloud Platform.</p>
          </div>
        `,
      });
      return { sent: true };
    } catch (err) {
      console.error('[MailService Error]: Failed to send password reset email via SMTP:', err.message);
    }
  }

  // Fallback in development: Print reset link to console
  if (config.app.env === 'development' || !mailTransporter) {
    console.log('\n======================================================');
    console.log(`[Hind DB MailService (Dev Mode)]: Password Reset Link for ${to}`);
    console.log(`==> ${resetLink}`);
    console.log('======================================================\n');
  }

  return { sent: false, fallback: true, link: resetLink };
}
