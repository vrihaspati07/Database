/**
 * Hind DB - Storage Phase 2 & 3 Automated Test Suite
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import crypto from 'crypto';
import { storageController } from './controllers/storageController.js';
import { storageStore } from './services/storageStore.js';
import { r2Storage } from './services/r2StorageService.js';
import { apiKeyController, apiKeyStore } from './controllers/apiKeyController.js';
import { requireApiKey } from './middleware/apiKeyMiddleware.js';

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

async function runTests() {
  console.log('\n======================================================');
  console.log('📦 HIND DB - STORAGE PHASE 2 & 3 AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  const testProject = `proj_phase2_${Date.now()}`;
  const otherProject = `proj_isolated_${Date.now()}`;

  // =========================================================================
  // SUITE 1: Private Buckets & HMAC-SHA256 Signed URLs
  // =========================================================================
  console.log('--- 1. PRIVATE BUCKETS & HMAC-SHA256 SIGNED URLS ---');

  // 1.1 Create private bucket
  let createBucketResp = null;
  await storageController.createBucket(
    { body: { projectId: testProject, name: 'confidential-vault', is_public: false } },
    { status: () => ({ json: (d) => { createBucketResp = d; } }), json: (d) => { createBucketResp = d; } }
  );
  assert(createBucketResp.success === true, 'Private bucket created successfully');
  assert(createBucketResp.data.is_public === false, 'Bucket is strictly marked private (is_public: false)');

  // 1.2 Upload file to private bucket
  const fileContent = 'Top Secret Sovereign Sovereign Document: Hind DB Financials 2026';
  const fileBuffer = Buffer.from(fileContent);
  let uploadResp = null;
  await storageController.uploadFile(
    {
      params: { bucket: 'confidential-vault' },
      body: {
        projectId: testProject,
        name: 'financials-2026.pdf',
        content: `data:application/pdf;base64,${fileBuffer.toString('base64')}`,
        mime_type: 'application/pdf',
      },
      headers: {},
      ip: '127.0.0.1',
    },
    { status: () => ({ json: (d) => { uploadResp = d; } }), json: (d) => { uploadResp = d; } }
  );
  assert(uploadResp.success === true, 'File uploaded to private bucket');
  assert(!uploadResp.data.r2_key, 'Zero vendor leakage: r2_key is completely omitted from response');
  assert(uploadResp.data.isPublic === false, 'File record inherits private bucket status');

  // 1.3 Attempt direct access without signed URL => 403 Forbidden
  {
    let statusCode = 200;
    let resp = null;
    await storageController.servePublicFile(
      {
        params: { bucket: 'confidential-vault', filename: 'financials-2026.pdf' },
        query: { projectId: testProject },
        headers: {},
      },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 403, 'Direct access to private file without signed URL blocked with 403 Forbidden');
  }

  // 1.4 Generate HMAC-SHA256 Signed URL
  let signedUrlResp = null;
  await storageController.createSignedUrl(
    {
      params: { bucket: 'confidential-vault' },
      body: {
        projectId: testProject,
        filename: 'financials-2026.pdf',
        expiresIn: 3600,
      },
      headers: {},
      ip: '127.0.0.1',
    },
    { status: () => ({ json: (d) => { signedUrlResp = d; } }), json: (d) => { signedUrlResp = d; } }
  );
  assert(signedUrlResp.success === true, 'Signed URL generated successfully');
  assert(typeof signedUrlResp.data.token === 'string', 'Returns HMAC-SHA256 signature token');
  assert(signedUrlResp.data.token.length === 64, 'Token is a 64-character SHA-256 hex string');
  assert(signedUrlResp.data.expires > Math.floor(Date.now() / 1000), 'Expiration is set in the future');
  assert(signedUrlResp.data.signedUrl.startsWith('https://storage.hinddb.com/'), 'URL strictly uses https://storage.hinddb.com/ branding');

  const { token, expires } = signedUrlResp.data;

  // 1.5 Access with valid Signed URL
  {
    let statusCode = 200;
    let servedData = null;
    let headersSet = {};
    await storageController.servePublicFile(
      {
        params: { bucket: 'confidential-vault', filename: 'financials-2026.pdf' },
        query: { projectId: testProject, token, expires },
        headers: {},
      },
      {
        status: (code) => { statusCode = code; return { json: () => {}, end: () => {} }; },
        setHeader: (k, v) => { headersSet[k] = v; },
        send: (data) => { servedData = data; },
      }
    );
    assert(statusCode === 200, 'Valid signed URL serves private file with 200 OK');
    assert(servedData && servedData.toString() === fileContent, 'Correct binary file content returned');
    assert(headersSet['x-hind-storage-provider'] === 'Hind-DB-Sovereign-Storage', 'Sovereign Hind DB provider header present');
  }

  // 1.6 Access with tampered signature => 403 Forbidden
  {
    let statusCode = 200;
    let resp = null;
    const tamperedToken = token.substring(0, 60) + 'beef';
    await storageController.servePublicFile(
      {
        params: { bucket: 'confidential-vault', filename: 'financials-2026.pdf' },
        query: { projectId: testProject, token: tamperedToken, expires },
        headers: {},
      },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 403, 'Tampered signed URL signature rejected with 403 Forbidden');
    assert(resp.error === 'INVALID_SIGNATURE', 'Error code is INVALID_SIGNATURE');
  }

  // 1.7 Access with expired token => 401 Unauthorized
  {
    let statusCode = 200;
    let resp = null;
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 30; // 30s in the past
    const expiredToken = crypto
      .createHmac('sha256', process.env.STORAGE_SIGNING_SECRET || process.env.JWT_SECRET || 'hind_db_sovereign_storage_secret_key_2026')
      .update(`${testProject}:confidential-vault:financials-2026.pdf:${expiredTimestamp}`)
      .digest('hex');

    await storageController.servePublicFile(
      {
        params: { bucket: 'confidential-vault', filename: 'financials-2026.pdf' },
        query: { projectId: testProject, token: expiredToken, expires: expiredTimestamp },
        headers: {},
      },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 401, 'Expired signed URL rejected with 401 Unauthorized');
    assert(resp.error === 'EXPIRED_TOKEN', 'Error code is EXPIRED_TOKEN');
  }

  // =========================================================================
  // SUITE 2: API Key Scoped Authentication & Tenant Cloaking
  // =========================================================================
  console.log('\n--- 2. API KEY SCOPED REST API & TENANT ISOLATION ---');

  // Create API key for testProject
  const rawApiKey = `hk_live_${crypto.randomBytes(16).toString('hex')}`;
  const apiKeyRecord = {
    id: `key_${Date.now()}`,
    database_id: testProject,
    name: 'Backend Storage Key',
    role: 'service_role',
    key_prefix: `${rawApiKey.substring(0, 16)}...`,
    key_hash: crypto.createHash('sha256').update(rawApiKey).digest('hex'),
    created_at: new Date().toISOString(),
    revoked_at: null,
  };
  apiKeyStore.saveKey(apiKeyRecord);

  // 2.1 Authenticate with valid Bearer API key on private file
  {
    let statusCode = 200;
    let servedData = null;
    await storageController.servePublicFile(
      {
        params: { bucket: 'confidential-vault', filename: 'financials-2026.pdf' },
        apiKey: apiKeyRecord,
        headers: { authorization: `Bearer ${rawApiKey}` },
        query: { projectId: testProject },
      },
      {
        status: (code) => { statusCode = code; return { json: () => {}, end: () => {} }; },
        setHeader: () => {},
        send: (data) => { servedData = data; },
      }
    );
    assert(statusCode === 200, 'Project API key grants authenticated access to private bucket without token');
  }

  // 2.2 Cross-project access attempt using testProject's key on otherProject => 404
  {
    let statusCode = 200;
    let nextCalled = false;
    await requireApiKey(
      {
        headers: { authorization: `Bearer ${rawApiKey}` },
        params: { id: otherProject },
      },
      {
        status: (code) => { statusCode = code; return { json: () => {} }; },
        json: () => {},
      },
      () => { nextCalled = true; }
    );
    assert(!nextCalled && statusCode === 404, 'Cross-project API key access strictly returns 404 (cloaking tenant separation)');
  }

  // 2.3 Invalid API key => 401
  {
    let statusCode = 200;
    let nextCalled = false;
    await requireApiKey(
      {
        headers: { authorization: 'Bearer hk_live_invalidkey0000000000000000000' },
        params: { id: testProject },
      },
      {
        status: (code) => { statusCode = code; return { json: () => {} }; },
        json: () => {},
      },
      () => { nextCalled = true; }
    );
    assert(!nextCalled && statusCode === 401, 'Invalid API key rejected with 401');
  }

  // =========================================================================
  // SUITE 3: HTTP Range Header Streaming (Audio & Video Seeking)
  // =========================================================================
  console.log('\n--- 3. HTTP RANGE HEADER STREAMING (MEDIA SEEKABILITY) ---');

  // Create a 100-byte sample video/audio buffer
  const sampleMediaBuffer = Buffer.alloc(100);
  for (let i = 0; i < 100; i++) sampleMediaBuffer[i] = i;

  await storageController.uploadFile(
    {
      params: { bucket: 'confidential-vault' },
      body: {
        projectId: testProject,
        name: 'stream-sample.mp4',
        content: `data:video/mp4;base64,${sampleMediaBuffer.toString('base64')}`,
        mime_type: 'video/mp4',
      },
      headers: {},
      ip: '127.0.0.1',
    },
    { status: () => ({ json: () => {} }), json: () => {} }
  );

  // Request Range: bytes=0-9 (first 10 bytes)
  {
    let statusCode = 200;
    let headersSet = {};
    let sliceData = null;

    await storageController.servePublicFile(
      {
        params: { bucket: 'confidential-vault', filename: 'stream-sample.mp4' },
        apiKey: apiKeyRecord,
        headers: { range: 'bytes=0-9' },
      },
      {
        status: (code) => { statusCode = code; return { json: () => {}, end: () => {} }; },
        setHeader: (k, v) => { headersSet[k] = v; },
        send: (d) => { sliceData = d; },
      }
    );

    assert(statusCode === 206, 'Returns HTTP 206 Partial Content for Range request');
    assert(headersSet['Content-Range'] === 'bytes 0-9/100', 'Content-Range matches requested byte range: bytes 0-9/100');
    assert(headersSet['Content-Length'] === 10, 'Content-Length equals chunk size (10 bytes)');
    assert(headersSet['Accept-Ranges'] === 'bytes', 'Accept-Ranges: bytes advertised');
    assert(sliceData && sliceData.length === 10, 'Received exactly 10 bytes');
    assert(sliceData[0] === 0 && sliceData[9] === 9, 'Byte values match exact sliced range [0..9]');
  }

  // Request invalid out-of-bounds range => 416
  {
    let statusCode = 200;
    let headersSet = {};

    await storageController.servePublicFile(
      {
        params: { bucket: 'confidential-vault', filename: 'stream-sample.mp4' },
        apiKey: apiKeyRecord,
        headers: { range: 'bytes=200-300' },
      },
      {
        status: (code) => { statusCode = code; return { json: () => {}, end: () => {} }; },
        setHeader: (k, v) => { headersSet[k] = v; },
        end: () => {},
      }
    );
    assert(statusCode === 416, 'Out of bounds range returns 416 Range Not Satisfiable');
    assert(headersSet['Content-Range'] === 'bytes */100', 'Content-Range indicates total size: bytes */100');
  }

  // =========================================================================
  // SUITE 4: Storage Quotas & Overrides (storage_quota_override_bytes)
  // =========================================================================
  console.log('\n--- 4. PLAN QUOTAS & QUOTA OVERRIDES ---');

  const quotaProj = `quota_test_${Date.now()}`;

  // 4.1 Default Quota
  const initialUsage = storageStore.getProjectUsage(quotaProj);
  assert(initialUsage.quotaBytes === 1073741824, 'Default plan quota is 1GB');

  // 4.2 Set Quota Override to 500 bytes (testing strict limit)
  storageStore.setQuotaOverride(quotaProj, 500);
  const overriddenUsage = storageStore.getProjectUsage(quotaProj);
  assert(overriddenUsage.quotaBytes === 500, 'Quota override applied successfully: 500 bytes');

  // 4.3 Upload 300 bytes (fits under 500 bytes)
  let smallUploadStatus = 200;
  await storageController.uploadFile(
    {
      params: { bucket: 'quota-bucket' },
      body: {
        projectId: quotaProj,
        name: 'small.txt',
        content: `data:text/plain;base64,${Buffer.alloc(300).toString('base64')}`,
      },
      headers: {},
      ip: '127.0.0.1',
    },
    { status: (code) => { smallUploadStatus = code; return { json: () => {} }; }, json: () => {} }
  );
  assert(smallUploadStatus === 201, 'Upload within quota limit succeeds with 201');

  // 4.4 Upload another 300 bytes (total 600 > 500) => 400 rejected
  let overflowStatus = 200;
  let overflowResp = null;
  await storageController.uploadFile(
    {
      params: { bucket: 'quota-bucket' },
      body: {
        projectId: quotaProj,
        name: 'overflow.txt',
        content: `data:text/plain;base64,${Buffer.alloc(300).toString('base64')}`,
      },
      headers: {},
      ip: '127.0.0.1',
    },
    {
      status: (code) => { overflowStatus = code; return { json: (d) => { overflowResp = d; } }; },
      json: (d) => { overflowResp = d; },
    }
  );
  assert(overflowStatus === 400, 'Upload exceeding quota rejected with 400 Bad Request');
  assert(overflowResp.error.includes('Storage quota limit'), 'Error specifies storage quota exceeded');

  // 4.5 Reset Quota Override to 10MB => Now succeeds
  storageStore.setQuotaOverride(quotaProj, 10 * 1024 * 1024);
  let retryUploadStatus = 200;
  await storageController.uploadFile(
    {
      params: { bucket: 'quota-bucket' },
      body: {
        projectId: quotaProj,
        name: 'overflow.txt',
        content: `data:text/plain;base64,${Buffer.alloc(300).toString('base64')}`,
      },
      headers: {},
      ip: '127.0.0.1',
    },
    { status: (code) => { retryUploadStatus = code; return { json: () => {} }; }, json: () => {} }
  );
  assert(retryUploadStatus === 201, 'Increasing quota override immediately allows uploads again');

  // =========================================================================
  // SUITE 5: Project Upload Rate Limiting (100 uploads/hour)
  // =========================================================================
  console.log('\n--- 5. UPLOAD RATE LIMITING (100 UPLOADS / HOUR) ---');

  const rateProj = `rate_proj_${Date.now()}`;

  // Fill 100 uploads into project rate limiter
  for (let i = 0; i < 100; i++) {
    storageStore.checkUploadRateLimit(rateProj, 100);
  }

  // 101st upload attempt via controller => 429 Too Many Requests
  let rateStatus = 200;
  let rateResp = null;
  await storageController.uploadFile(
    {
      params: { bucket: 'rate-bucket' },
      body: {
        projectId: rateProj,
        name: 'blocked_101.txt',
        content: 'data:text/plain;base64,dGVzdA==',
      },
      headers: {},
      ip: '127.0.0.1',
    },
    {
      status: (code) => { rateStatus = code; return { json: (d) => { rateResp = d; } }; },
      json: (d) => { rateResp = d; },
    }
  );
  assert(rateStatus === 429, '101st upload rejected with HTTP 429 Too Many Requests');
  assert(rateResp.error === 'RATE_LIMIT_EXCEEDED', 'Error code is RATE_LIMIT_EXCEEDED');

  // =========================================================================
  // SUITE 6: Storage Audit Logging (Upload, Download, SignedUrl, Delete)
  // =========================================================================
  console.log('\n--- 6. STORAGE AUDIT LOGGING ---');

  const auditLogs = storageStore.getAuditLogs(testProject);
  assert(auditLogs.length >= 3, 'Audit logs recorded multiple storage operations for project');

  const actions = auditLogs.map((l) => l.action);
  assert(actions.includes('UPLOAD'), 'Audit log records UPLOAD action');
  assert(actions.includes('DOWNLOAD'), 'Audit log records DOWNLOAD action');
  assert(actions.includes('SIGNED_URL_CREATED'), 'Audit log records SIGNED_URL_CREATED action');

  // Perform delete and verify DELETE audit log
  await storageController.deleteFile(
    {
      params: { bucket: 'confidential-vault', fileId: 'financials-2026.pdf' },
      query: { projectId: testProject },
      headers: {},
    },
    { status: () => ({ json: () => {} }), json: () => {} }
  );

  const updatedLogs = storageStore.getAuditLogs(testProject);
  const deleteLog = updatedLogs.find((l) => l.action === 'DELETE' && l.file_name === 'financials-2026.pdf');
  assert(Boolean(deleteLog), 'Audit log records DELETE action with target filename');

  console.log('\n======================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error in storage test suite:', err);
  process.exit(1);
});

