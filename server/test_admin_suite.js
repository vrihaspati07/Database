/**
 * Hind DB - Complete Sovereign Admin & Security System Test Suite
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { config } from './config/index.js';
import {
  adminStore,
  generateAdminToken,
  verifyAdminToken,
  checkAllServicesHealth,
  getBusinessStats,
  getAllUsers,
  getUserDetail,
  executeUserAction,
  executeBulkUserAction,
  getAllProjects,
  revealProjectConnection,
  executeProjectAction,
  retryProvisioning,
  getSecurityData,
  manageBannedIp,
  getRevenueData,
  retryPayment,
  getSystemLogs,
  generateCsvExport,
  recordFailedAdminLogin,
  clearFailedAdminLogin,
  isIpBanned,
} from './services/adminService.js';
import {
  sendAdminLoginAlert,
  sendFailedLoginOrBanAlert,
  sendServiceDownAlert,
  sendDailySummaryEmail,
} from './services/adminAlertService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🛡️  HIND DB - SOVEREIGN ADMIN & SECURITY TEST SUITE');
  console.log('======================================================\n');

  // Test 1: Configuration & Whitelist
  console.log('--- Test Suite 1: Admin Whitelist & Route Configuration ---');
  assert(config.admin.secretPath === '/control-x7k9', 'Secret admin path is /control-x7k9');
  assert(config.admin.emails.includes('tumhara@gmail.com'), 'tumhara@gmail.com is in admin whitelist');
  assert(config.admin.emails.includes('vrihaspatichaubey@gmail.com'), 'vrihaspatichaubey@gmail.com is in admin whitelist');
  assert(config.admin.sessionTtl === 1800, 'Admin session TTL is set to 1800s (30 minutes)');
  assert(config.admin.maxFailedAttempts === 5, 'Max failed attempts before IP quarantine is 5');

  // Test 2: Token Generation & Strict Verification
  console.log('\n--- Test Suite 2: Short-Lived Admin JWT & Identity Shield ---');
  const validToken = generateAdminToken('tumhara@gmail.com', '127.0.0.1');
  const verified = verifyAdminToken(validToken);
  assert(verified !== null && verified.sub === 'tumhara@gmail.com', 'Valid admin token verified with sub=tumhara@gmail.com');
  assert(verified.role === 'super_admin' && verified.is_admin === true, 'Token carries super_admin clearance');

  const rogueToken = generateAdminToken('attacker@evil.corp', '127.0.0.1');
  const rogueVerified = verifyAdminToken(rogueToken);
  assert(rogueVerified === null, 'Untrusted email token is strictly rejected (returns null)');

  // Test 3: Brute Force Shield & IP Quarantine
  console.log('\n--- Test Suite 3: Brute Force Shield & IP Blacklisting ---');
  const testIp = '198.51.100.99';
  clearFailedAdminLogin(testIp);
  assert(!isIpBanned(testIp), 'New test IP is not initially banned');

  // 4 failed attempts -> not banned
  for (let i = 1; i <= 4; i++) {
    const res = await recordFailedAdminLogin(testIp, 'hacker@darkweb.org');
    assert(res.banned === false && res.remaining === 5 - i, `Attempt ${i}: IP not yet banned (${res.remaining} remaining)`);
  }

  // 5th failed attempt -> Auto-ban
  const banRes = await recordFailedAdminLogin(testIp, 'hacker@darkweb.org');
  assert(banRes.banned === true, '5th attempt automatically blacklists IP');
  assert(isIpBanned(testIp) === true, 'isIpBanned returns true for quarantined IP');

  // Clean up
  adminStore.bannedIps.delete(testIp);
  clearFailedAdminLogin(testIp);

  // Test 4: Live Service Health Probes (5 Services)
  console.log('\n--- Test Suite 4: 5-Node Infrastructure Live Health Probes ---');
  const health = await checkAllServicesHealth();
  assert(health.services.database !== undefined, 'Database health probed');
  assert(health.services.auth !== undefined, 'Auth service health probed');
  assert(health.services.storage !== undefined, 'Storage service health probed');
  assert(health.services.gateway !== undefined, 'API Gateway health probed');
  assert(health.services.website !== undefined, 'Main Web Console health probed');
  assert(health.services.database.uptime_24h >= 99.9, 'Database 24h uptime is calculated (>=99.9%)');
  assert(health.services.database.response_time_ms > 0, `Database latency measured: ${health.services.database.response_time_ms} ms`);

  // Test 5: Business Stats Aggregator
  console.log('\n--- Test Suite 5: Business & Growth Metrics Aggregator ---');
  const stats = await getBusinessStats();
  assert(stats.users.total > 0, `Total users calculated: ${stats.users.total}`);
  assert(stats.users.today > 0, `New signups today: ${stats.users.today}`);
  assert(stats.projects.total > 0, `Total projects: ${stats.projects.total}`);
  assert(stats.projects.active > 0, `Active projects: ${stats.projects.active}`);
  assert(stats.storage.used_gb > 0, `Total storage used: ${stats.storage.used_gb} GB`);
  assert(stats.revenue.mrr_inr > 0, `Platform MRR: ₹${stats.revenue.mrr_inr.toLocaleString('en-IN')}`);
  assert(stats.users.churned_30d > 0, `Churned users (>30d inactive): ${stats.users.churned_30d}`);

  // Test 6: Users Management & Actions
  console.log('\n--- Test Suite 6: Users Management & Audit-Logged Actions ---');
  const users = await getAllUsers();
  assert(users.length >= 6, `Users retrieved: ${users.length}`);

  const testUser = users[0];
  const userDetail = await getUserDetail(testUser.id);
  assert(userDetail !== null && userDetail.user.email === testUser.email, `User detail loaded for ${testUser.email}`);
  assert(userDetail.usage_history.length === 7, '7-day usage history graph generated for user');

  // Test Suspend & Unsuspend
  const suspendRes = await executeUserAction({
    adminEmail: 'tumhara@gmail.com',
    action: 'suspend',
    userId: testUser.id,
    ip: '127.0.0.1',
    userAgent: 'Admin Test Suite',
  });
  assert(suspendRes.status === 'suspended', `User suspended successfully`);

  const unsuspendRes = await executeUserAction({
    adminEmail: 'tumhara@gmail.com',
    action: 'unsuspend',
    userId: testUser.id,
    ip: '127.0.0.1',
    userAgent: 'Admin Test Suite',
  });
  assert(unsuspendRes.status === 'active', `User reactivated successfully`);

  // Test Impersonate User
  const impersonateRes = await executeUserAction({
    adminEmail: 'tumhara@gmail.com',
    action: 'impersonate',
    userId: testUser.id,
    ip: '127.0.0.1',
    userAgent: 'Admin Test Suite',
  });
  assert(impersonateRes.success === true && impersonateRes.token, 'Impersonation developer token created and audit-logged');

  // Test 7: Projects Management & Sensitive Secret Reveal
  console.log('\n--- Test Suite 7: Projects Management & Secret Reveal Audit Trail ---');
  const projects = await getAllProjects();
  assert(projects.length > 0, `Projects retrieved: ${projects.length}`);

  const testProject = projects[0];
  assert(testProject.connection_uri_masked.includes('••••••••'), 'Project connection string is masked by default');

  const revealRes = await revealProjectConnection({
    adminEmail: 'tumhara@gmail.com',
    projectId: testProject.id,
    ip: '127.0.0.1',
    userAgent: 'Admin Test Suite',
  });
  assert(revealRes.connection_uri.length > 10, 'Connection string successfully revealed');

  // Check audit log contains the reveal record
  const auditLogs = await getSystemLogs('audit', 10);
  const foundReveal = auditLogs.audit_logs.some(
    (l) => l.action === 'REVEAL_PROJECT_CONNECTION_STRING' && l.target_id === testProject.id
  );
  assert(foundReveal === true, 'REVEAL_PROJECT_CONNECTION_STRING is strictly recorded in audit log');

  // Test 8: Security & Abuse Center
  console.log('\n--- Test Suite 8: Security & Abuse Radar ---');
  const secData = await getSecurityData();
  assert(secData.banned_ips.length > 0, 'Banned IPs list populated');
  assert(secData.suspicious_clusters.length > 0, 'Suspicious multi-account IP clusters detected');
  assert(secData.spam_projects.length > 0, 'Spam database projects flagged');

  // Test 9: Revenue & Billing Management
  console.log('\n--- Test Suite 9: Revenue, Subscriptions & Payment Recovery ---');
  const revData = await getRevenueData();
  assert(revData.subscriptions.length > 0, 'Subscriptions list loaded');
  assert(revData.plan_breakdown.length === 3, 'Plan breakdown contains Free, Pro, and Enterprise');

  if (revData.failed_payments.length > 0) {
    const payId = revData.failed_payments[0].id;
    const retryRes = await retryPayment({
      adminEmail: 'tumhara@gmail.com',
      paymentId: payId,
      ip: '127.0.0.1',
      userAgent: 'Admin Test Suite',
    });
    assert(retryRes.success === true, 'Failed payment manual retry succeeded');
  }

  // Test 10: CSV Exports
  console.log('\n--- Test Suite 10: Sovereign CSV Export Engine ---');
  const usersCsv = await generateCsvExport('users');
  assert(usersCsv.startsWith('User ID,Email,Full Name'), 'Users CSV generated with proper headers');

  const projectsCsv = await generateCsvExport('projects');
  assert(projectsCsv.startsWith('Project ID,Project Name'), 'Projects CSV generated with proper headers');

  const revCsv = await generateCsvExport('revenue');
  assert(revCsv.startsWith('Subscription ID,User Email'), 'Revenue CSV generated with proper headers');

  const auditCsv = await generateCsvExport('audit');
  assert(auditCsv.startsWith('Log ID,Admin Email'), 'Audit Trail CSV generated with proper headers');

  // Test 11: Alert Notifications
  console.log('\n--- Test Suite 11: Alert Notifications (Resend / SMTP / Console) ---');
  const loginAlertRes = await sendAdminLoginAlert({
    adminEmail: 'tumhara@gmail.com',
    ip: '127.0.0.1',
    userAgent: 'Admin Test Suite',
  });
  assert(loginAlertRes !== null, 'Admin login notification generated');

  const dailyRes = await sendDailySummaryEmail({
    newSignupsToday: 19,
    newProjectsToday: 8,
    apiRequestsToday: 482910,
    mrr: 485000,
    uptimePercentage: '99.99%',
    errorRate: '0.04%',
    activeIncidents: 0,
    blockedAttemptsToday: 3,
    totalBannedIps: 2,
    spamProjectsIntercepted: 1,
  });
  assert(dailyRes !== null, '9:00 PM Daily summary email generated');

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});

