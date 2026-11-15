/**
 * Hind DB - Storage Feature Test Suite (Phase 1)
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { storageController } from './controllers/storageController.js';
import { storageStore } from './services/storageStore.js';
import { r2Storage } from './services/r2StorageService.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('  HIND DB - STORAGE ENGINE AUTOMATED TEST SUITE');
  console.log('  Attribution: © 2026 Hind. A Hind India Private Limited Company.');
  console.log('========================================================\n');

  const testProject = 'test_project_' + Date.now();

  // Test 1: Seed / initial buckets
  console.log('--- 1. BUCKET MANAGEMENT ---');
  let bucketsResponse = null;
  await storageController.listBuckets(
    { query: { projectId: testProject }, headers: {} },
    { json: (d) => { bucketsResponse = d; } }
  );
  assert(bucketsResponse.success === true, 'List buckets responds with success: true');
  assert(bucketsResponse.total === 0, 'New project starts with 0 custom buckets');

  // Test 2: Create a public bucket
  let createResp = null;
  await storageController.createBucket(
    { body: { projectId: testProject, name: 'user-uploads', is_public: true }, headers: {} },
    { status: () => ({ json: (d) => { createResp = d; } }), json: (d) => { createResp = d; } }
  );
  assert(createResp.success === true, 'Public bucket user-uploads created successfully');
  assert(createResp.data.name === 'user-uploads', 'Bucket name sanitized to user-uploads');
  assert(createResp.data.is_public === true, 'Bucket is marked as public');

  // Test 3: Create duplicate bucket fails
  let dupResp = null;
  let dupStatus = 200;
  await storageController.createBucket(
    { body: { projectId: testProject, name: 'user-uploads' }, headers: {} },
    {
      status: (code) => { dupStatus = code; return { json: (d) => { dupResp = d; } }; },
      json: (d) => { dupResp = d; },
    }
  );
  assert(dupStatus === 400 && dupResp.success === false, 'Duplicate bucket creation rejected with 400 error');

  // Test 4: Quota & Usage initial state
  console.log('\n--- 2. STORAGE QUOTA & USAGE ---');
  let quotaResp = null;
  await storageController.getStorageQuota(
    { query: { projectId: testProject }, headers: {} },
    { json: (d) => { quotaResp = d; } }
  );
  assert(quotaResp.success === true, 'Storage quota endpoint responds');
  assert(quotaResp.data.quotaBytes === 1073741824, 'Default plan offers 1GB (1073741824 bytes)');
  assert(quotaResp.data.plan === 'Free', 'Initial plan is Free');

  // Test 5: Upload valid file (image png)
  console.log('\n--- 3. FILE UPLOADS & BRANDING ---');
  const sampleBase64 = Buffer.from('Hind DB Sovereign Storage Content Mock PNG Binary').toString('base64');
  let uploadResp = null;
  let uploadStatus = 200;

  await storageController.uploadFile(
    {
      params: { bucket: 'user-uploads' },
      body: {
        projectId: testProject,
        name: 'profile-photo.png',
        content: `data:image/png;base64,${sampleBase64}`,
        mime_type: 'image/png',
      },
      headers: {},
      ip: '127.0.0.1',
    },
    {
      status: (code) => { uploadStatus = code; return { json: (d) => { uploadResp = d; } }; },
      json: (d) => { uploadResp = d; },
    }
  );

  assert(uploadStatus === 201 && uploadResp.success === true, 'Image uploaded successfully with status 201');
  assert(uploadResp.data.name === 'profile-photo.png', 'File name preserved correctly');
  assert(uploadResp.data.publicUrl.startsWith('https://storage.hinddb.com/'), 'Public URL strictly uses https://storage.hinddb.com/ (100% Hind DB sovereign branding)');
  assert(!uploadResp.data.publicUrl.includes('cloudflare') && !uploadResp.data.publicUrl.includes('r2'), 'No Cloudflare R2 internal naming exposed in public URL');

  // Test 6: Security - Executable file blocking
  console.log('\n--- 4. SECURITY & ABUSE SHIELD ---');
  let exeResp = null;
  let exeStatus = 200;
  await storageController.uploadFile(
    {
      params: { bucket: 'user-uploads' },
      body: {
        projectId: testProject,
        name: 'malicious-script.exe',
        content: Buffer.from('MZ...fake executable content').toString('base64'),
        mime_type: 'application/x-msdownload',
      },
      headers: {},
      ip: '127.0.0.1',
    },
    {
      status: (code) => { exeStatus = code; return { json: (d) => { exeResp = d; } }; },
      json: (d) => { exeResp = d; },
    }
  );
  assert(exeStatus === 400 && exeResp.success === false, 'Blocked .exe upload with 400 Bad Request');
  assert(exeResp.error.includes('executable files'), 'Security alert message cites prohibited executable extension');

  // Test 7: Max File Size Enforcement (> 50MB on Free plan)
  let largeFileError = null;
  try {
    r2Storage.validateFile({
      name: 'giant-archive.zip',
      size: 55 * 1024 * 1024, // 55MB (limit is 50MB)
      plan: 'Free',
      currentUsageBytes: 0,
    });
  } catch (err) {
    largeFileError = err.message;
  }
  assert(largeFileError !== null && largeFileError.includes('exceeds the maximum allowed size of 50MB'), 'Enforces 50MB max file size on Free plan');

  // Test 8: List files in bucket
  console.log('\n--- 5. FILE LISTING & RETRIEVAL ---');
  let listResp = null;
  await storageController.listFiles(
    { params: { bucket: 'user-uploads' }, query: { projectId: testProject }, headers: {} },
    { json: (d) => { listResp = d; } }
  );
  assert(listResp.success === true, 'List files returns success');
  assert(listResp.total === 1, 'Bucket contains exactly 1 active file');
  assert(listResp.data[0].name === 'profile-photo.png', 'Found uploaded file profile-photo.png');

  // Test 9: Public File Serve / Download
  let serveHeaders = {};
  let serveBody = null;
  let serveStatus = 200;
  await storageController.servePublicFile(
    {
      params: { bucket: 'user-uploads', filename: 'profile-photo.png' },
      query: { projectId: testProject },
    },
    {
      setHeader: (k, v) => { serveHeaders[k] = v; },
      status: (code) => { serveStatus = code; return { json: () => {} }; },
      send: (buf) => { serveBody = buf; },
    }
  );
  assert(serveStatus === 200, 'Public file served successfully with 200 OK');
  assert(serveHeaders['Content-Type'] === 'image/png', 'Correct Content-Type header served');
  assert(serveHeaders['x-hind-storage-provider'] === 'Hind-DB-Sovereign-Storage', 'Sovereign Hind DB provider header present');
  assert(serveBody !== null && serveBody.length > 0, 'File binary content received');

  // Test 10: Delete File
  console.log('\n--- 6. FILE DELETION ---');
  const fileIdToDelete = listResp.data[0].id;
  let delResp = null;
  await storageController.deleteFile(
    { params: { bucket: 'user-uploads', fileId: fileIdToDelete }, query: { projectId: testProject }, headers: {} },
    { json: (d) => { delResp = d; } }
  );
  assert(delResp.success === true, 'File deleted successfully');

  // Test 11: Verify file count is now 0
  let verifyListResp = null;
  await storageController.listFiles(
    { params: { bucket: 'user-uploads' }, query: { projectId: testProject }, headers: {} },
    { json: (d) => { verifyListResp = d; } }
  );
  assert(verifyListResp.total === 0, 'Bucket file count decremented to 0');

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

