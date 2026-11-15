/**
 * Hind DB - API Key Management & Authentication Test Suite
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import crypto from 'crypto';
import { getDb, memoryDatabases, teamStore } from './services/access.js';
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
  console.log('🔑 HIND DB - API KEYS & AUTHENTICATION TEST SUITE');
  console.log('======================================================\n');

  // Setup test identities and database
  const ownerUser = {
    id: 'usr_key_owner_01',
    email: 'priyanshu@hinddb.io',
    full_name: 'Priyanshu Owner',
  };

  const outsiderUser = {
    id: 'usr_key_outsider_02',
    email: 'unauthorized@darknet.io',
    full_name: 'Unauthorized User',
  };

  const viewerUser = {
    id: 'usr_key_viewer_03',
    email: 'readonly@startup.in',
    full_name: 'Readonly Viewer',
  };

  const testDb = {
    id: 'db_test_apikeys_001',
    user_id: ownerUser.id,
    name: 'sovereign-production-cluster',
    region: 'Sovereign Primary (ap-south-1)',
    plan: 'Pro',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };

  const otherDb = {
    id: 'db_isolated_tenant_999',
    user_id: outsiderUser.id,
    name: 'other-tenant-cluster',
    region: 'Sovereign Primary (ap-south-1)',
    plan: 'Free',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };

  memoryDatabases.set(testDb.id, testDb);
  memoryDatabases.set(otherDb.id, otherDb);

  // Add viewerUser as a 'viewer' member in testDb
  teamStore.saveMember({
    id: 'tm_viewer_001',
    database_id: testDb.id,
    user_id: viewerUser.id,
    name: viewerUser.full_name,
    email: viewerUser.email,
    role: 'viewer',
    status: 'ACTIVE',
  });

  // =========================================================================
  // SUITE 1: Access Control & Role Gates on API Keys Endpoints
  // =========================================================================
  console.log('--- 1. ACCESS CONTROL & ROLE GATES (admin+) ---');

  // Outsider cannot access API keys (404 Cloaking)
  {
    let statusCode = 200;
    let resp = null;
    await apiKeyController.listKeys(
      { params: { id: testDb.id }, user: outsiderUser },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 404, 'Outsider accessing API keys gets 404 (cloaked)');
  }

  // Viewer cannot access API keys (403 Forbidden - requires admin+)
  {
    let statusCode = 200;
    let resp = null;
    await apiKeyController.listKeys(
      { params: { id: testDb.id }, user: viewerUser },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 403, 'Viewer accessing API keys gets 403 Forbidden (requires admin+)');
  }

  // Owner can access API keys
  {
    let statusCode = 200;
    let resp = null;
    await apiKeyController.listKeys(
      { params: { id: testDb.id }, user: ownerUser },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 200 && resp.success === true, 'Owner successfully accesses API keys list');
  }

  // =========================================================================
  // SUITE 2: API Key Generation (POST /:id/api-keys)
  // =========================================================================
  console.log('\n--- 2. API KEY GENERATION & STORAGE SECURITY ---');

  // Validation: Missing name
  {
    let statusCode = 200;
    let resp = null;
    await apiKeyController.createKey(
      { params: { id: testDb.id }, user: ownerUser, body: { name: '', role: 'anon' } },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 400, 'Rejects API key creation with empty name (400)');
  }

  // Validation: Invalid role
  {
    let statusCode = 200;
    let resp = null;
    await apiKeyController.createKey(
      { params: { id: testDb.id }, user: ownerUser, body: { name: 'Test Key', role: 'superadmin_hacker' } },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 400, 'Rejects invalid key role (400)');
  }

  // Successful Generation: anon key
  let createdAnonKey = null;
  let fullAnonSecret = null;
  {
    let statusCode = 200;
    let resp = null;
    await apiKeyController.createKey(
      { params: { id: testDb.id }, user: ownerUser, body: { name: 'Client App Anon Key', role: 'anon' } },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 201 && resp.success === true, 'Generates API key successfully with 201 Created');
    assert(typeof resp.data.key === 'string', 'Returns raw secret key in creation response');
    assert(resp.data.key.startsWith('hk_live_'), 'Key follows hk_live_ prefix pattern');
    assert(resp.data.key.length === 8 + 32, 'Key length is exactly hk_live_ (8) + 32 hex chars (40 total)');
    assert(resp.data.role === 'anon', 'Key role is anon');
    assert(resp.data.key_prefix.startsWith('hk_live_'), 'Key prefix formatted correctly');

    createdAnonKey = resp.data;
    fullAnonSecret = resp.data.key;
  }

  // Verify raw secret key is NOT stored in plain text
  {
    const storedRecord = apiKeyStore.findKeyById(createdAnonKey.id);
    assert(storedRecord !== null, 'Key stored in persistent key store');
    assert(!storedRecord.key, 'Raw secret key is NOT saved in stored record');
    assert(typeof storedRecord.key_hash === 'string' && storedRecord.key_hash.length === 64, 'Stored record contains 64-char SHA-256 hash');

    // Verify hash match
    const computedHash = crypto.createHash('sha256').update(fullAnonSecret).digest('hex');
    assert(computedHash === storedRecord.key_hash, 'Stored hash exactly matches SHA-256(secretKey)');
  }

  // Successful Generation: service_role key
  let createdServiceKey = null;
  let fullServiceSecret = null;
  {
    let statusCode = 200;
    let resp = null;
    await apiKeyController.createKey(
      { params: { id: testDb.id }, user: ownerUser, body: { name: 'Backend Microservice Key', role: 'service_role' } },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 201 && resp.success === true, 'Generates service_role API key successfully');
    createdServiceKey = resp.data;
    fullServiceSecret = resp.data.key;
  }

  // =========================================================================
  // SUITE 3: API Key Listing (GET /:id/api-keys)
  // =========================================================================
  console.log('\n--- 3. API KEY LISTING PRIVACY ---');
  {
    let resp = null;
    await apiKeyController.listKeys(
      { params: { id: testDb.id }, user: ownerUser },
      {
        status: () => ({ json: (d) => { resp = d; } }),
        json: (d) => { resp = d; },
      }
    );
    assert(resp.success === true, 'List keys succeeded');
    assert(resp.data.length >= 2, 'Returns both created keys');

    // Verify raw secret keys are NEVER leaked in list
    const leakedKey = resp.data.find((k) => k.key || (k.key_hash && k.key_hash === fullAnonSecret));
    assert(!leakedKey, 'Raw secret keys are NEVER leaked in list response');

    const listedAnon = resp.data.find((k) => k.id === createdAnonKey.id);
    assert(listedAnon && listedAnon.key_prefix.startsWith('hk_live_'), 'Lists key_prefix for identification');
  }

  // =========================================================================
  // SUITE 4: Authentication Middleware (requireApiKey)
  // =========================================================================
  console.log('\n--- 4. AUTHENTICATION MIDDLEWARE (requireApiKey) ---');

  // Test 4.1: Missing key (no headers)
  {
    let statusCode = 200;
    let resp = null;
    let nextCalled = false;
    await requireApiKey(
      { headers: {}, params: { id: testDb.id } },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      },
      () => { nextCalled = true; }
    );
    assert(!nextCalled && statusCode === 401, 'Missing API key rejected with 401 UNAUTHORIZED');
    assert(resp.error === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');
  }

  // Test 4.2: Malformed key (not starting with hk_live_)
  {
    let statusCode = 200;
    let resp = null;
    let nextCalled = false;
    await requireApiKey(
      { headers: { authorization: 'Bearer some_random_jwt_token_123' }, params: { id: testDb.id } },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      },
      () => { nextCalled = true; }
    );
    assert(!nextCalled && statusCode === 401, 'Malformed key without hk_live_ rejected with 401');
  }

  // Test 4.3: Invalid key (starts with hk_live_ but hash does not exist)
  {
    let statusCode = 200;
    let resp = null;
    let nextCalled = false;
    await requireApiKey(
      { headers: { authorization: 'Bearer hk_live_ffffffffffffffffffffffffffffffff' }, params: { id: testDb.id } },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      },
      () => { nextCalled = true; }
    );
    assert(!nextCalled && statusCode === 401, 'Non-existent API key rejected with 401 INVALID_API_KEY');
    assert(resp.error === 'INVALID_API_KEY', 'Error code is INVALID_API_KEY');
  }

  // Test 4.4: Valid key via Authorization: Bearer
  {
    let nextCalled = false;
    const req = {
      headers: { authorization: `Bearer ${fullAnonSecret}` },
      params: { id: testDb.id },
    };
    await requireApiKey(
      req,
      {
        status: () => ({ json: () => {} }),
        json: () => {},
      },
      () => { nextCalled = true; }
    );
    assert(nextCalled === true, 'Valid Bearer key invokes next() successfully');
    assert(req.projectId === testDb.id, 'Attaches req.projectId matching target database');
    assert(req.apiKey && req.apiKey.id === createdAnonKey.id, 'Attaches req.apiKey record');
    assert(req.project && req.project.role === 'anon', 'Attaches req.project with anon role');
  }

  // Test 4.5: Valid key via x-api-key header
  {
    let nextCalled = false;
    const req = {
      headers: { 'x-api-key': fullAnonSecret },
      params: { id: testDb.id },
    };
    await requireApiKey(
      req,
      {
        status: () => ({ json: () => {} }),
        json: () => {},
      },
      () => { nextCalled = true; }
    );
    assert(nextCalled === true, 'Valid x-api-key header invokes next() successfully');
  }

  // Test 4.6: Cross-project access attempt (Key for testDb used on otherDb)
  {
    let statusCode = 200;
    let resp = null;
    let nextCalled = false;
    await requireApiKey(
      {
        headers: { authorization: `Bearer ${fullAnonSecret}` },
        params: { id: otherDb.id }, // Target is otherDb!
      },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      },
      () => { nextCalled = true; }
    );
    assert(!nextCalled && statusCode === 404, 'Cross-project API key usage strictly returns 404 (cloaking tenant separation)');
  }

  // Test 4.7: Update last_used_at
  {
    const stored = apiKeyStore.findKeyById(createdAnonKey.id);
    assert(stored.last_used_at !== null, 'Middleware updates last_used_at timestamp on successful auth');
  }

  // =========================================================================
  // SUITE 5: API Key Revocation (DELETE /:id/api-keys/:keyId)
  // =========================================================================
  console.log('\n--- 5. API KEY REVOCATION & IMMEDIATE INOPERABILITY ---');

  // Revoke service key
  {
    let statusCode = 200;
    let resp = null;
    await apiKeyController.revokeKey(
      { params: { id: testDb.id, keyId: createdServiceKey.id }, user: ownerUser },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      }
    );
    assert(statusCode === 200 && resp.success === true, 'Revokes API key successfully');
  }

  // Attempt to authenticate using the revoked key
  {
    let statusCode = 200;
    let resp = null;
    let nextCalled = false;
    await requireApiKey(
      {
        headers: { authorization: `Bearer ${fullServiceSecret}` },
        params: { id: testDb.id },
      },
      {
        status: (code) => { statusCode = code; return { json: (d) => { resp = d; } }; },
        json: (d) => { resp = d; },
      },
      () => { nextCalled = true; }
    );
    assert(!nextCalled && statusCode === 401, 'Revoked API key rejected with 401');
    assert(resp.error === 'REVOKED_API_KEY', 'Error code is REVOKED_API_KEY');
  }

  console.log('\n======================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
