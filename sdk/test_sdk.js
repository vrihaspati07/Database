/**
 * Hind DB - Standalone JavaScript SDK Automated Test Suite
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { createClient, HindDBClient, HindDBStorageClient, StorageBucketClient } from './index.js';

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

async function runSdkTests() {
  console.log('\n======================================================');
  console.log('📦 HIND DB - OFFICIAL JAVASCRIPT SDK TEST SUITE');
  console.log('======================================================\n');

  const testApiKey = 'hk_live_1234567890abcdef1234567890abcdef';
  const baseUrl = 'https://api.hinddb.com';

  // 1. Client Initialization
  console.log('--- 1. CLIENT INITIALIZATION ---');
  const db = createClient(baseUrl, testApiKey);
  assert(db instanceof HindDBClient, 'createClient returns HindDBClient instance');
  assert(db.storage instanceof HindDBStorageClient, 'db.storage initialized');
  assert(db.storage.baseUrl === baseUrl, 'baseUrl normalized correctly');
  assert(db.storage.apiKey === testApiKey, 'apiKey bound to storage client');

  // 2. Bucket Reference
  console.log('\n--- 2. BUCKET SELECTION & INTERFACE ---');
  const bucket = db.storage.from('avatars');
  assert(bucket instanceof StorageBucketClient, 'from() returns StorageBucketClient');
  assert(bucket.bucket === 'avatars', 'Target bucket name set to avatars');

  // 3. getPublicUrl
  console.log('\n--- 3. SYNCHRONOUS PUBLIC URL GENERATION ---');
  const urlObj = bucket.getPublicUrl('profile.png');
  assert(urlObj.publicUrl === 'https://storage.hinddb.com/avatars/profile.png', 'Generates correct sovereign publicUrl');
  assert(urlObj.proxyUrl === 'https://api.hinddb.com/storage/v1/avatars/profile.png', 'Generates correct sovereign proxyUrl');

  // 4. Mock Network Interceptor to Verify SDK Requests
  console.log('\n--- 4. SDK METHOD CALLS & PAYLOAD VALIDATION ---');
  const capturedRequests = [];

  // Mock global fetch to capture SDK wire payloads
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    capturedRequests.push({ url, options });

    const urlStr = String(url);

    // Mock: createBucket
    if (urlStr.includes('/storage/v1/buckets') && options.method === 'POST') {
      const parsedBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'bkt_123', name: parsedBody.name, is_public: parsedBody.is_public },
        }),
      };
    }

    // Mock: listBuckets
    if (urlStr.includes('/storage/v1/buckets') && options.method === 'GET') {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: [{ id: 'bkt_123', name: 'avatars', is_public: true }],
        }),
      };
    }

    // Mock: createSignedUrl (check before generic bucket upload)
    if (urlStr.includes('/storage/v1/avatars/signed-url') && options.method === 'POST') {
      const parsedBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            signedUrl: `https://storage.hinddb.com/avatars/${parsedBody.filename}?token=mock_hmac_sha256&expires=1793836800`,
            token: 'mock_hmac_sha256',
            expires: 1793836800,
          },
        }),
      };
    }

    // Mock: upload
    if (urlStr.endsWith('/storage/v1/avatars') && options.method === 'POST') {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'file_001',
            name: 'user-photo.png',
            bucket: 'avatars',
            size: 4096,
            publicUrl: 'https://storage.hinddb.com/avatars/user-photo.png',
          },
        }),
      };
    }

    // Mock: list files
    if (urlStr.endsWith('/storage/v1/avatars') && options.method === 'GET') {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: [{ id: 'file_001', name: 'user-photo.png', size: 4096 }],
        }),
      };
    }

    // Mock: remove
    if (options.method === 'DELETE') {
      return {
        ok: true,
        json: async () => ({
          success: true,
          message: 'File deleted from storage node.',
        }),
      };
    }

    // Mock: download
    if (options.method === 'GET') {
      return {
        ok: true,
        arrayBuffer: async () => new TextEncoder().encode('Binary file content from Hind DB Storage').buffer,
      };
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ success: false, error: 'Not found' }),
      text: async () => 'Not found',
    };
  };

  try {
    // 4.1 Create Bucket
    const bucketResp = await db.storage.createBucket('documents', false);
    assert(bucketResp.name === 'documents', 'createBucket creates target bucket');
    assert(capturedRequests[0].options.headers['Authorization'] === `Bearer ${testApiKey}`, 'Headers contain Bearer API key');
    assert(capturedRequests[0].options.headers['x-api-key'] === testApiKey, 'Headers contain x-api-key');

    // 4.2 List Buckets
    const bucketsList = await db.storage.listBuckets();
    assert(Array.isArray(bucketsList) && bucketsList.length === 1, 'listBuckets returns buckets array');

    // 4.3 Upload Buffer
    const testFileBuffer = Buffer.from('Image Buffer Data');
    const uploadResult = await db.storage.from('avatars').upload('user-photo.png', testFileBuffer, {
      contentType: 'image/png',
    });
    assert(uploadResult.name === 'user-photo.png', 'upload returns uploaded file name');
    assert(uploadResult.publicUrl.includes('https://storage.hinddb.com/'), 'publicUrl returned in upload result');

    // 4.4 List Files in Bucket
    const filesList = await db.storage.from('avatars').list();
    assert(Array.isArray(filesList) && filesList.length === 1, 'list returns array of files');

    // 4.5 Create Signed URL
    const signedObj = await db.storage.from('avatars').createSignedUrl('user-photo.png', 3600);
    assert(signedObj.token === 'mock_hmac_sha256', 'createSignedUrl returns HMAC signature token');
    assert(signedObj.signedUrl.includes('token='), 'signedUrl contains token query parameter');

    // 4.6 Download
    const downloadedBuf = await db.storage.from('avatars').download('user-photo.png');
    assert(downloadedBuf instanceof Buffer, 'download returns Buffer instance');
    assert(downloadedBuf.toString() === 'Binary file content from Hind DB Storage', 'downloaded buffer content matches expected');

    // 4.7 Remove
    const removeResult = await db.storage.from('avatars').remove('user-photo.png');
    assert(removeResult.success === true, 'remove deletes target file successfully');
  } finally {
    // Restore original fetch
    globalThis.fetch = originalFetch;
  }

  // 5. Error Handling in SDK
  console.log('\n--- 5. ERROR HANDLING ---');
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ success: false, error: 'UNAUTHORIZED', message: 'Invalid API Key' }),
  });

  try {
    try {
      await db.storage.from('avatars').list();
      assert(false, 'Should throw error on 401');
    } catch (err) {
      assert(err.status === 401, 'Propagates HTTP 401 status code');
      assert(err.message.includes('Invalid API Key') || err.message.includes('UNAUTHORIZED'), 'Preserves server error message');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log('\n======================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSdkTests().catch((err) => {
  console.error('Fatal error in SDK test suite:', err);
  process.exit(1);
});
