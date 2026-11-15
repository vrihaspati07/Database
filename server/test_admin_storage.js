/**
 * Hind DB - Sovereign Admin Storage & Quota Management Test Suite (Task 5)
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { config } from './config/index.js';
import {
  generateAdminToken,
  verifyAdminToken,
  getStorageAdminOverview,
  executeStorageProjectAction,
  recordFailedAdminLogin,
  clearFailedAdminLogin,
  adminStore,
} from './services/adminService.js';
import { storageStore } from './services/storageStore.js';
import { storageController } from './controllers/storageController.js';
import { adminController } from './controllers/adminController.js';
import { requireAdminAuth } from './middleware/adminSecurity.js';
import { generateAccessToken } from './services/security.js';

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

async function runStorageAdminTests() {
  console.log('\n======================================================');
  console.log('🛡️  HIND DB - STORAGE ADMIN & QUOTA TEST SUITE (TASK 5)');
  console.log('======================================================\n');

  const testProjectA = `proj_admin_test_a_${Date.now()}`;
  const testProjectB = `proj_admin_test_b_${Date.now()}`;

  // =========================================================================
  // 1. Cloaked 404 Security Enforcement
  // =========================================================================
  console.log('--- 1. CLOAKED 404 SECURITY & ACCESS GUARD ---');

  // Helper to test middleware
  const testMiddleware = async (req) => {
    let statusCode = null;
    let jsonBody = null;
    let nextCalled = false;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonBody = data;
        return this;
      },
    };

    const next = () => {
      nextCalled = true;
    };

    await requireAdminAuth(req, res, next);
    return { statusCode, jsonBody, nextCalled };
  };

  // 1.1 Missing Token -> 404
  const resNoToken = await testMiddleware({
    method: 'GET',
    originalUrl: '/api/v1/control-x7k9/storage',
    headers: {},
  });
  assert(resNoToken.statusCode === 404, 'Unauthenticated request receives HTTP 404 (NOT 401/403)');
  assert(resNoToken.jsonBody?.error?.code === 'NOT_FOUND', 'Response error code is NOT_FOUND for cloaking');

  // 1.2 Invalid Token -> 404
  const resInvalidToken = await testMiddleware({
    method: 'GET',
    originalUrl: '/api/v1/control-x7k9/storage',
    headers: { authorization: 'Bearer invalid_garbage_token' },
  });
  assert(resInvalidToken.statusCode === 404, 'Invalid token receives HTTP 404');

  // 1.3 Non-Admin Platform User -> 404
  const regularUserToken = generateAccessToken({
    id: 'usr_regular_developer',
    email: 'dev@regularuser.com',
    role: 'user',
  });
  const resRegularUser = await testMiddleware({
    method: 'GET',
    originalUrl: '/api/v1/control-x7k9/storage',
    headers: { authorization: `Bearer ${regularUserToken}` },
  });
  assert(resRegularUser.statusCode === 404, 'Regular user access token strictly receives HTTP 404');

  // 1.4 Valid Admin Session Token -> Next Called
  const adminSessionToken = generateAdminToken('tumhara@gmail.com', '127.0.0.1');
  const reqAdminSession = {
    method: 'GET',
    originalUrl: '/api/v1/control-x7k9/storage',
    headers: { authorization: `Bearer ${adminSessionToken}` },
  };
  const resAdminSession = await testMiddleware(reqAdminSession);
  assert(resAdminSession.nextCalled === true, 'Dedicated admin session token successfully passes requireAdminAuth');
  assert(reqAdminSession.admin?.email === 'tumhara@gmail.com', 'req.admin email populated from session token');

  // 1.5 Whitelisted Admin User Access Token -> Next Called
  const whitelistedUserToken = generateAccessToken({
    id: 'usr_admin_whitelisted',
    email: 'vrihaspatichaubey@gmail.com',
    role: 'user',
  });
  const reqWhitelisted = {
    method: 'GET',
    originalUrl: '/api/v1/control-x7k9/storage',
    headers: { authorization: `Bearer ${whitelistedUserToken}` },
  };
  const resWhitelisted = await testMiddleware(reqWhitelisted);
  assert(resWhitelisted.nextCalled === true, 'Whitelisted email user access token successfully passes requireAdminAuth');

  // 1.6 Explicit Role 'admin' User Access Token -> Next Called
  const roleAdminUserToken = generateAccessToken({
    id: 'usr_role_admin',
    email: 'ops@hinddb.io',
    role: 'admin',
  });
  const reqRoleAdmin = {
    method: 'GET',
    originalUrl: '/api/v1/control-x7k9/storage',
    headers: { authorization: `Bearer ${roleAdminUserToken}` },
  };
  const resRoleAdmin = await testMiddleware(reqRoleAdmin);
  assert(resRoleAdmin.nextCalled === true, "User token with role='admin' successfully passes requireAdminAuth");

  // =========================================================================
  // 2. Storage Overview & Infrastructure Cost Aggregator
  // =========================================================================
  console.log('\n--- 2. STORAGE AGGREGATOR & ZERO-LEAKAGE COST INTELLIGENCE ---');

  // Seed storage files for test projects
  await storageController.uploadFile(
    {
      params: { bucket: 'assets' },
      body: {
        projectId: testProjectA,
        name: 'test-document.pdf',
        content: `data:application/pdf;base64,${Buffer.from('A'.repeat(50000)).toString('base64')}`,
      },
      headers: {},
    },
    { status: () => ({ json: () => {} }), json: () => {} }
  );

  const overviewData = await getStorageAdminOverview();
  assert(overviewData.overview !== undefined, 'Storage admin overview structure is present');
  assert(overviewData.overview.totalStorageBytes > 0, `Total platform storage bytes computed: ${overviewData.overview.totalStorageBytes} bytes`);
  assert(overviewData.overview.totalFiles > 0, `Total platform files counted: ${overviewData.overview.totalFiles} files`);
  assert(overviewData.overview.totalBuckets > 0, `Total platform buckets counted: ${overviewData.overview.totalBuckets} buckets`);
  assert(overviewData.overview.costPerGbInr === 1.25, `Configured sovereign storage rate is ₹1.25/GB/mo`);
  assert(overviewData.overview.estimatedMonthlyCostInr >= 0, `Estimated monthly infrastructure cost computed: ₹${overviewData.overview.estimatedMonthlyCostInr}`);
  assert(Array.isArray(overviewData.top20Projects), 'top20Projects is an array');
  assert(overviewData.top20Projects.length > 0, `top20Projects contains ${overviewData.top20Projects.length} projects`);
  assert(overviewData.top20Projects[0].usedBytes >= (overviewData.top20Projects[1]?.usedBytes || 0), 'top20Projects sorted descending by usedBytes');

  // Verify Zero Vendor Leakage in Returned Metadata
  const serialized = JSON.stringify(overviewData);
  assert(!serialized.includes('cloudflare'), 'Zero vendor leakage: "cloudflare" is not exposed');
  assert(!serialized.includes('r2.cloudflarestorage'), 'Zero vendor leakage: R2 bucket endpoints not exposed');
  assert(!serialized.includes('aws'), 'Zero vendor leakage: AWS references not exposed');

  // =========================================================================
  // 3. Project Storage Actions (Pause / Resume / Set Quota)
  // =========================================================================
  console.log('\n--- 3. PROJECT STORAGE ADMIN ACTIONS & AUDIT TRAILS ---');

  // 3.1 Pause project storage
  const pauseResult = await executeStorageProjectAction({
    adminEmail: 'tumhara@gmail.com',
    projectId: testProjectA,
    action: 'pause',
    ip: '127.0.0.1',
    userAgent: 'HindAdminEngine/1.0',
  });
  assert(pauseResult.status === 'PAUSED', 'executeStorageProjectAction pause returns status PAUSED');
  assert(storageStore.getProjectUsage(testProjectA).status === 'PAUSED', 'storageStore usage record reflects PAUSED state');

  // 3.2 Verify file upload is BLOCKED when paused
  let pausedUploadStatus = null;
  let pausedUploadBody = null;
  await storageController.uploadFile(
    {
      params: { bucket: 'assets' },
      body: {
        projectId: testProjectA,
        name: 'blocked-file.png',
        content: `data:image/png;base64,${Buffer.from('PNGDATA').toString('base64')}`,
      },
      headers: {},
    },
    {
      status: (code) => ({
        json: (data) => {
          pausedUploadStatus = code;
          pausedUploadBody = data;
        },
      }),
      json: (data) => {
        pausedUploadBody = data;
      },
    }
  );
  assert(pausedUploadStatus === 403, 'File upload to PAUSED project rejected with HTTP 403');
  assert(pausedUploadBody?.error === 'STORAGE_PAUSED', 'Error code is STORAGE_PAUSED');

  // 3.3 Resume project storage
  const resumeResult = await executeStorageProjectAction({
    adminEmail: 'tumhara@gmail.com',
    projectId: testProjectA,
    action: 'resume',
    ip: '127.0.0.1',
    userAgent: 'HindAdminEngine/1.0',
  });
  assert(resumeResult.status === 'ACTIVE', 'executeStorageProjectAction resume returns status ACTIVE');
  assert(storageStore.getProjectUsage(testProjectA).status === 'ACTIVE', 'storageStore usage record reflects ACTIVE state');

  // 3.4 Verify file upload succeeds after resume
  let resumedUploadStatus = null;
  let resumedUploadBody = null;
  await storageController.uploadFile(
    {
      params: { bucket: 'assets' },
      body: {
        projectId: testProjectA,
        name: 'resumed-file.png',
        content: `data:image/png;base64,${Buffer.from('PNGDATA').toString('base64')}`,
      },
      headers: {},
    },
    {
      status: (code) => ({
        json: (data) => {
          resumedUploadStatus = code;
          resumedUploadBody = data;
        },
      }),
      json: (data) => {
        resumedUploadStatus = 200;
        resumedUploadBody = data;
      },
    }
  );
  assert(resumedUploadBody?.success === true, 'File upload succeeds immediately after resuming storage cluster');

  // 3.5 Set custom storage quota override (e.g. 25 GB)
  const quotaBytes = 25 * 1024 * 1024 * 1024;
  const quotaResult = await executeStorageProjectAction({
    adminEmail: 'tumhara@gmail.com',
    projectId: testProjectA,
    action: 'set_quota',
    quotaBytes,
    ip: '127.0.0.1',
    userAgent: 'HindAdminEngine/1.0',
  });
  assert(quotaResult.quotaBytes === quotaBytes, 'executeStorageProjectAction set_quota updates quotaBytes');
  assert(storageStore.getProjectUsage(testProjectA).quotaOverrideBytes === quotaBytes, 'storageStore quotaOverrideBytes is set');
  assert(storageStore.getProjectUsage(testProjectA).quotaBytes === quotaBytes, 'storageStore quotaBytes is updated');

  // 3.6 Reject invalid storage action
  let invalidActionError = null;
  try {
    await executeStorageProjectAction({
      adminEmail: 'tumhara@gmail.com',
      projectId: testProjectA,
      action: 'unsupported_action',
    });
  } catch (err) {
    invalidActionError = err.message;
  }
  assert(invalidActionError?.includes("Unknown storage admin action 'unsupported_action'"), 'Invalid action throws clear descriptive error');

  // =========================================================================
  // 4. Admin Controller HTTP Handler Integration
  // =========================================================================
  console.log('\n--- 4. ADMIN CONTROLLER HTTP HANDLERS ---');

  // 4.1 adminController.getStorageAdmin
  let controllerStorageResp = null;
  await adminController.getStorageAdmin(
    { admin: { email: 'tumhara@gmail.com', role: 'super_admin', ip: '127.0.0.1' }, headers: {} },
    {
      status: (code) => ({ json: (d) => { controllerStorageResp = { status: code, ...d }; } }),
      json: (d) => { controllerStorageResp = { status: 200, ...d }; },
    }
  );
  assert(controllerStorageResp?.success === true, 'adminController.getStorageAdmin returns success: true');
  assert(controllerStorageResp?.data?.overview?.totalStorageBytes > 0, 'Overview contains totalStorageBytes');

  // 4.2 adminController.executeStorageProjectAction
  let actionResp = null;
  await adminController.executeStorageProjectAction(
    {
      params: { id: testProjectB },
      body: { action: 'set_quota', quotaBytes: 50 * 1024 * 1024 * 1024 },
      admin: { email: 'tumhara@gmail.com', role: 'super_admin', ip: '127.0.0.1' },
      headers: { 'user-agent': 'HindTestHarness/1.0' },
    },
    {
      status: (code) => ({ json: (d) => { actionResp = { status: code, ...d }; } }),
      json: (d) => { actionResp = { status: 200, ...d }; },
    }
  );
  assert(actionResp?.success === true, 'adminController.executeStorageProjectAction returns success: true');
  assert(actionResp?.data?.quotaBytes === 50 * 1024 * 1024 * 1024, 'New quota applied to testProjectB');

  // =========================================================================
  // 5. Audit Log Trail Verification
  // =========================================================================
  console.log('\n--- 5. AUDIT LOG RECORDING & SECURITY LOG VERIFICATION ---');

  const auditLogs = adminStore.auditLogs;
  const storagePauseAudit = auditLogs.find((l) => l.action === 'STORAGE_PAUSE' && l.target_id === testProjectA);
  const storageResumeAudit = auditLogs.find((l) => l.action === 'STORAGE_RESUME' && l.target_id === testProjectA);
  const storageQuotaAudit = auditLogs.find((l) => l.action === 'STORAGE_SET_QUOTA' && l.target_id === testProjectA);

  assert(storagePauseAudit !== undefined, 'STORAGE_PAUSE action recorded in admin audit logs');
  assert(storageResumeAudit !== undefined, 'STORAGE_RESUME action recorded in admin audit logs');
  assert(storageQuotaAudit !== undefined, 'STORAGE_SET_QUOTA action recorded in admin audit logs');
  assert(storageQuotaAudit?.admin_email === 'tumhara@gmail.com', 'Audit log records executor admin email');

  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStorageAdminTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

