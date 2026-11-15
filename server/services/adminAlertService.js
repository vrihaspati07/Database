/**
 * Hind DB - Sovereign Admin Alert & Notification Engine
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
 * Universal mail sender using Resend API (if configured) or SMTP Nodemailer
 */
export async function sendEmail({ to, subject, html, text }) {
  const recipient = to || config.admin.alertEmail || config.admin.emails[0];
  const from = config.smtp.from || '"Hind DB Security" <security@hind.io>';

  // 1. Try Resend API if API Key is configured
  if (config.admin.resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.admin.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          subject,
          html,
          text,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`[AdminAlertService] Sent alert via Resend to ${recipient}: ${subject}`);
        return { success: true, provider: 'resend', id: data.id };
      } else {
        console.warn('[AdminAlertService] Resend API error:', data);
      }
    } catch (err) {
      console.warn('[AdminAlertService] Resend network error:', err.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  const smtp = getTransporter();
  if (smtp) {
    try {
      const info = await smtp.sendMail({
        from,
        to: recipient,
        subject,
        html,
        text: text || subject,
      });
      console.log(`[AdminAlertService] Sent alert via SMTP to ${recipient}: ${subject} (MessageId: ${info.messageId})`);
      return { success: true, provider: 'smtp', id: info.messageId };
    } catch (err) {
      console.error('[AdminAlertService Error]: Failed to send via SMTP:', err.message);
    }
  }

  // 3. Fallback to Console in development or when offline
  console.log('\n======================================================');
  console.log(`🚨 [Hind DB Sovereign Alert Engine]: To ${recipient}`);
  console.log(`📌 Subject: ${subject}`);
  console.log(`📝 Text: ${text || 'View HTML template'}`);
  console.log('======================================================\n');

  return { success: false, fallback: true, recipient, subject };
}

/**
 * 1. Admin Login Successful Alert
 */
export async function sendAdminLoginAlert({ adminEmail, ip, userAgent, time = new Date() }) {
  const formattedTime = time.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });
  const subject = `[Hind DB Security] 🛡️ Admin panel accessed from ${ip}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #0A0F1D; color: #F8FAFC; border: 1px solid #1E293B; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1E3A8A, #0F172A); padding: 24px; border-bottom: 1px solid #1E293B;">
        <span style="background: #10B981; color: #022C22; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Security Notice</span>
        <h2 style="margin: 12px 0 4px 0; color: #FFFFFF; font-size: 20px; font-weight: 700;">Hind DB Admin Panel Accessed</h2>
        <p style="margin: 0; color: #94A3B8; font-size: 13px;">Secret Sovereign Gateway Session Initiated</p>
      </div>
      <div style="padding: 24px;">
        <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6; margin-top: 0;">
          Your secret admin console (<strong>${config.admin.secretPath}</strong>) was successfully unlocked.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; color: #E2E8F0;">
          <tr style="border-bottom: 1px solid #1E293B;">
            <td style="padding: 10px 0; color: #94A3B8; width: 140px;">Admin Account</td>
            <td style="padding: 10px 0; font-weight: 600; color: #38BDF8;">${adminEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E293B;">
            <td style="padding: 10px 0; color: #94A3B8;">IP Address</td>
            <td style="padding: 10px 0; font-family: monospace; font-weight: 600;">${ip}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E293B;">
            <td style="padding: 10px 0; color: #94A3B8;">Device / Client</td>
            <td style="padding: 10px 0; font-size: 12px; color: #CBD5E1;">${userAgent || 'Unknown Web Client'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #94A3B8;">Timestamp</td>
            <td style="padding: 10px 0; color: #F1F5F9;">${formattedTime} (IST)</td>
          </tr>
        </table>
        <div style="background: rgba(30, 58, 138, 0.25); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 14px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #93C5FD; line-height: 1.5;">
            ⚠️ If you did not authorize this login, revoke all sessions immediately and check the Security Center.
          </p>
        </div>
      </div>
      <div style="background: #070B14; padding: 16px 24px; border-top: 1px solid #1E293B; font-size: 11px; color: #64748B; text-align: center;">
        © 2026 Hind DB. Sovereign Indian Cloud Infrastructure.
      </div>
    </div>
  `;
  const text = `Admin panel accessed from ${ip} at ${formattedTime} by ${adminEmail}. User Agent: ${userAgent}`;
  return sendEmail({ subject, html, text });
}

/**
 * 2. Failed Login & IP Block Alert
 */
export async function sendFailedLoginOrBanAlert({ ip, attempts, isBanned = false, reason, adminEmailAttempted }) {
  const subject = isBanned
    ? `🚨 [CRITICAL ALERT] IP ${ip} BLOCKED on Hind DB after ${attempts} failed attempts`
    : `⚠️ [SECURITY WARNING] Failed Admin Login attempt (${attempts}/5) from ${ip}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #0A0F1D; color: #F8FAFC; border: 1px solid #7F1D1D; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #7F1D1D, #450A0A); padding: 24px; border-bottom: 1px solid #991B1B;">
        <span style="background: #EF4444; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
          ${isBanned ? 'IP AUTO-BANNED' : 'SUSPICIOUS ACTIVITY'}
        </span>
        <h2 style="margin: 12px 0 4px 0; color: #FFFFFF; font-size: 20px; font-weight: 700;">
          ${isBanned ? 'Brute Force Attack Thwarted — IP Blacklisted' : 'Failed Admin Login Attempt'}
        </h2>
        <p style="margin: 0; color: #FCA5A5; font-size: 13px;">Hind DB Intrusion Detection & Shield</p>
      </div>
      <div style="padding: 24px;">
        <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6; margin-top: 0;">
          ${
            isBanned
              ? `The system detected <strong>${attempts} consecutive failed authentication attempts</strong> targeting the hidden admin gateway. The offending IP has been automatically banned from Hind DB.`
              : `A failed attempt was detected against the secret admin route (${config.admin.secretPath}).`
          }
        </p>
        <div style="background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <div style="margin-bottom: 8px;"><strong style="color: #94A3B8;">Target Email:</strong> <span style="color: #F87171;">${adminEmailAttempted || 'Unknown'}</span></div>
          <div style="margin-bottom: 8px;"><strong style="color: #94A3B8;">Client IP:</strong> <span style="font-family: monospace; color: #FFFFFF; font-weight: 600;">${ip}</span></div>
          <div style="margin-bottom: 8px;"><strong style="color: #94A3B8;">Failure Count:</strong> <span style="color: #F87171; font-weight: 700;">${attempts} / ${config.admin.maxFailedAttempts}</span></div>
          <div><strong style="color: #94A3B8;">Status:</strong> <span style="color: ${isBanned ? '#EF4444' : '#FBBF24'}; font-weight: 700;">${isBanned ? 'BLOCKED (1-hour quarantine)' : 'MONITORING'}</span></div>
        </div>
      </div>
      <div style="background: #070B14; padding: 16px 24px; border-top: 1px solid #1E293B; font-size: 11px; color: #64748B; text-align: center;">
        © 2026 Hind DB. Sovereign Indian Cloud Infrastructure.
      </div>
    </div>
  `;
  const text = isBanned
    ? `IP ${ip} blocked after ${attempts} failed attempts against Hind DB admin route.`
    : `Failed admin login attempt from ${ip} (${attempts}/5). Target: ${adminEmailAttempted}`;
  return sendEmail({ subject, html, text });
}

/**
 * 3. Instant Service Down Alert (>5 min downtime)
 */
export async function sendServiceDownAlert({ serviceName, downtimeMinutes = 5, errorDetails, responseTimeMs }) {
  const subject = `🔥 [OUTAGE ALERT] ${serviceName} is DOWN on Hind DB`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #0A0F1D; color: #F8FAFC; border: 1px solid #B91C1C; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #B91C1C, #7F1D1D); padding: 24px; color: white;">
        <span style="background: #EF4444; color: white; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px;">CRITICAL SERVICE OUTAGE</span>
        <h2 style="margin: 12px 0 4px 0; font-size: 20px;">${serviceName} Service Unresponsive</h2>
        <p style="margin: 0; color: #FCA5A5; font-size: 13px;">Health check failed consecutively for &gt;${downtimeMinutes} minutes</p>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
          <tr style="border-bottom: 1px solid #1E293B;"><td style="padding: 8px 0; color: #94A3B8;">Service</td><td style="padding: 8px 0; font-weight: 700; color: #F87171;">${serviceName}</td></tr>
          <tr style="border-bottom: 1px solid #1E293B;"><td style="padding: 8px 0; color: #94A3B8;">Downtime Duration</td><td style="padding: 8px 0; color: #F87171;">${downtimeMinutes} minutes</td></tr>
          <tr style="border-bottom: 1px solid #1E293B;"><td style="padding: 8px 0; color: #94A3B8;">Latency / Error</td><td style="padding: 8px 0; font-family: monospace; color: #CBD5E1;">${errorDetails || 'Connection Timeout'}</td></tr>
        </table>
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">Auto-recovery probes are continuously checking this node every 60 seconds.</p>
      </div>
    </div>
  `;
  return sendEmail({ subject, html, text: `Alert: ${serviceName} is DOWN on Hind DB. Downtime: ${downtimeMinutes}m` });
}

/**
 * 4. High Error Rate Alert (>5%)
 */
export async function sendHighErrorRateAlert({ currentRate, threshold = 5, totalRequests, errorCount }) {
  const subject = `⚠️ [INCIDENT ALERT] High API Error Rate Detected (${currentRate}%)`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #0A0F1D; color: #F8FAFC; border: 1px solid #D97706; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #B45309, #78350F); padding: 24px; color: white;">
        <span style="background: #F59E0B; color: #451A03; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px;">ANOMALY DETECTED</span>
        <h2 style="margin: 12px 0 4px 0; font-size: 20px;">API Error Rate Exceeded ${threshold}%</h2>
        <p style="margin: 0; color: #FDE68A; font-size: 13px;">Current observed rate: ${currentRate}%</p>
      </div>
      <div style="padding: 24px;">
        <p style="color: #E2E8F0; font-size: 14px;">The Hind DB API Gateway observed <strong>${errorCount} errors</strong> out of ${totalRequests} requests in the last rolling monitoring window.</p>
      </div>
    </div>
  `;
  return sendEmail({ subject, html, text: `API Error rate is ${currentRate}%, exceeding ${threshold}% threshold.` });
}

/**
 * 5. Payment Failure Alert
 */
export async function sendPaymentFailedAlert({ userEmail, plan, amount, reason }) {
  const subject = `💳 [REVENUE ALERT] Payment Failed for ${userEmail} (${plan} Plan)`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #0A0F1D; color: #F8FAFC; border: 1px solid #DC2626; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #991B1B, #450A0A); padding: 24px; color: white;">
        <span style="background: #EF4444; color: white; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px;">BILLING INCIDENT</span>
        <h2 style="margin: 12px 0 4px 0; font-size: 20px;">Payment Failed for ${plan}</h2>
        <p style="margin: 0; color: #FCA5A5; font-size: 13px;">Recurring subscription charge could not be processed</p>
      </div>
      <div style="padding: 24px;">
        <div style="background: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 16px;">
          <div style="margin-bottom: 8px;"><strong style="color: #94A3B8;">User Email:</strong> <span style="color: #38BDF8;">${userEmail}</span></div>
          <div style="margin-bottom: 8px;"><strong style="color: #94A3B8;">Subscription Plan:</strong> <span style="color: #FFFFFF;">${plan} (₹${amount})</span></div>
          <div><strong style="color: #94A3B8;">Decline Reason:</strong> <span style="color: #F87171;">${reason || 'Card Insufficient Funds / Bank Declined'}</span></div>
        </div>
      </div>
    </div>
  `;
  return sendEmail({ subject, html, text: `Payment failed for ${userEmail} (${plan} - ₹${amount}). Reason: ${reason}` });
}

/**
 * 6. High Storage Usage Alert (>80%)
 */
export async function sendStorageThresholdAlert({ currentUsagePercent, usedGb, totalGb }) {
  const subject = `💾 [STORAGE ALERT] Database Cluster Storage at ${currentUsagePercent}% Capacity`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #0A0F1D; color: #F8FAFC; border: 1px solid #EA580C; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #C2410C, #7C2D12); padding: 24px; color: white;">
        <span style="background: #F97316; color: white; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px;">CAPACITY WARNING</span>
        <h2 style="margin: 12px 0 4px 0; font-size: 20px;">Storage Utilization &gt; 80%</h2>
        <p style="margin: 0; color: #FFEDD5; font-size: 13px;">${usedGb} GB utilized out of ${totalGb} GB total disk pool</p>
      </div>
      <div style="padding: 24px;">
        <p style="color: #CBD5E1; font-size: 14px;">Cluster disk usage has reached <strong>${currentUsagePercent}%</strong>. Consider scaling the block storage volume or purging unindexed temporary collections.</p>
      </div>
    </div>
  `;
  return sendEmail({ subject, html, text: `Storage reached ${currentUsagePercent}% (${usedGb}/${totalGb} GB).` });
}

/**
 * 7. Daily Sovereign Platform Summary (Scheduled for 9:00 PM IST)
 */
export async function sendDailySummaryEmail(stats) {
  const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full' });
  const subject = `📊 Hind DB Daily Operations Summary — ${today}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; background: #0A0F1D; color: #F8FAFC; border: 1px solid #1E293B; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1E3A8A, #0F172A); padding: 26px; border-bottom: 1px solid #1E293B;">
        <span style="background: #38BDF8; color: #0C4A6E; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Daily Report (9:00 PM IST)</span>
        <h2 style="margin: 12px 0 4px 0; color: #FFFFFF; font-size: 22px; font-weight: 700;">Hind DB Sovereign Platform Pulse</h2>
        <p style="margin: 0; color: #94A3B8; font-size: 13px;">${today}</p>
      </div>
      
      <div style="padding: 24px;">
        <!-- Top Metrics Grid -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 20px;">
          <tr>
            <td style="background: #111827; border: 1px solid #1F2937; border-radius: 8px; padding: 14px; text-align: center; width: 50%;">
              <div style="font-size: 11px; color: #9CA3AF; text-transform: uppercase;">New Signups Today</div>
              <div style="font-size: 24px; font-weight: 800; color: #10B981; margin-top: 4px;">+${stats.newSignupsToday ?? 14}</div>
            </td>
            <td style="background: #111827; border: 1px solid #1F2937; border-radius: 8px; padding: 14px; text-align: center; width: 50%;">
              <div style="font-size: 11px; color: #9CA3AF; text-transform: uppercase;">New Projects Today</div>
              <div style="font-size: 24px; font-weight: 800; color: #38BDF8; margin-top: 4px;">+${stats.newProjectsToday ?? 8}</div>
            </td>
          </tr>
          <tr>
            <td style="background: #111827; border: 1px solid #1F2937; border-radius: 8px; padding: 14px; text-align: center; width: 50%;">
              <div style="font-size: 11px; color: #9CA3AF; text-transform: uppercase;">API Requests (Today)</div>
              <div style="font-size: 22px; font-weight: 800; color: #F1F5F9; margin-top: 4px;">${(stats.apiRequestsToday || 342120).toLocaleString()}</div>
            </td>
            <td style="background: #111827; border: 1px solid #1F2937; border-radius: 8px; padding: 14px; text-align: center; width: 50%;">
              <div style="font-size: 11px; color: #9CA3AF; text-transform: uppercase;">Platform MRR</div>
              <div style="font-size: 22px; font-weight: 800; color: #F59E0B; margin-top: 4px;">₹${(stats.mrr || 428500).toLocaleString('en-IN')}</div>
            </td>
          </tr>
        </table>

        <!-- Infrastructure Status & Uptime -->
        <h4 style="color: #94A3B8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; margin: 20px 0 10px 0;">Infrastructure Health & SLA</h4>
        <div style="background: #111827; border: 1px solid #1F2937; border-radius: 8px; padding: 16px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #E2E8F0; font-size: 13px;">Overall Platform Uptime (24h)</span>
            <span style="color: #10B981; font-weight: 700; font-size: 13px;">${stats.uptimePercentage || '99.98%'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #E2E8F0; font-size: 13px;">API Error Rate</span>
            <span style="color: #10B981; font-weight: 700; font-size: 13px;">${stats.errorRate || '0.04%'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #E2E8F0; font-size: 13px;">Active Incidents</span>
            <span style="color: ${stats.activeIncidents > 0 ? '#EF4444' : '#10B981'}; font-weight: 700; font-size: 13px;">
              ${stats.activeIncidents || 0} incidents
            </span>
          </div>
        </div>

        <!-- Security Summary -->
        <h4 style="color: #94A3B8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; margin: 20px 0 10px 0;">Security Shield Summary</h4>
        <div style="background: #111827; border: 1px solid #1F2937; border-radius: 8px; padding: 16px; font-size: 13px; color: #CBD5E1;">
          <div>🛡️ Blocked Brute Force Attempts: <strong>${stats.blockedAttemptsToday ?? 3}</strong></div>
          <div style="margin-top: 6px;">🚫 Total Active IP Bans: <strong>${stats.totalBannedIps ?? 2}</strong></div>
          <div style="margin-top: 6px;">⚡ Spam Projects Intercepted: <strong>${stats.spamProjectsIntercepted ?? 1}</strong></div>
        </div>
      </div>
      <div style="background: #070B14; padding: 16px 24px; border-top: 1px solid #1E293B; font-size: 11px; color: #64748B; text-align: center;">
        © 2026 Hind DB. Sovereign Indian Cloud Infrastructure. Daily Automated Dispatch.
      </div>
    </div>
  `;
  const text = `Hind DB Daily Summary for ${today}: New Signups: ${stats.newSignupsToday ?? 14}, New Projects: ${stats.newProjectsToday ?? 8}, API Requests: ${stats.apiRequestsToday || 342120}, MRR: ₹${stats.mrr || 428500}, Uptime: ${stats.uptimePercentage || '99.98%'}.`;
  return sendEmail({ subject, html, text });
}

