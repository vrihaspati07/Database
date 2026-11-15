/**
 * Hind DB - Serverless Functions & Sandbox Automated Test Suite
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { functionRunner } from './services/functionRunner.js';
import { functionsController, functionStore } from './controllers/functionsController.js';
import { memoryDatabases } from './services/access.js';

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
  console.log('⚡ HIND DB - SERVERLESS FUNCTIONS AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  // Setup test users & database
  const ownerUser = {
    id: 'usr_fn_owner_01',
    email: 'fnowner@hinddb.io',
    full_name: 'Functions Owner',
  };

  const outsiderUser = {
    id: 'usr_fn_outsider_02',
    email: 'hacker@darkweb.org',
    full_name: 'Dark Hacker',
  };

  const testDb = {
    id: 'db_functions_test_001',
    user_id: ownerUser.id,
    name: 'serverless-edge-cluster',
    region: 'Sovereign Primary (ap-south-1)',
    plan: 'Pro',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };

  memoryDatabases.set(testDb.id, testDb);

  // --- Suite 1: Compiler Diagnostics & Validation ---
  console.log('--- 1. COMPILER & DIAGNOSTICS (functionRunner.compile) ---');
  
  // Valid TypeScript
  const validTs = `
    const multiply = (a: number, b: number): number => a * b;
    console.log("Result:", multiply(6, 7));
  `;
  const compiled = await functionRunner.compile(validTs);
  assert(typeof compiled === 'string' && compiled.length > 0, 'Valid TypeScript compiles successfully');

  // Syntax error detection
  let compileErrorCaught = false;
  try {
    await functionRunner.compile('const broken = ;');
  } catch (err) {
    compileErrorCaught = true;
    assert(err.name === 'CompileError', 'Syntax error identified as CompileError');
    assert(Boolean(err.details), 'Provides detailed compiler diagnostics');
  }
  assert(compileErrorCaught, 'CompileError thrown on invalid code');

  // --- Suite 2: Child Process Sandbox & Execution ---
  console.log('\n--- 2. CHILD PROCESS SANDBOX & NODE PERMISSION MODEL ---');

  const sampleFunctionCode = `
    import { serve } from '@hind/functions';

    serve(async (req) => {
      const body = await req.json();
      console.log("Processing payload for:", body.city);
      return {
        status: 200,
        body: JSON.stringify({
          acknowledged: true,
          cityReceived: body.city,
          region: "ap-south-1"
        })
      };
    });
  `;

  const runResult = await functionRunner.run({
    code: sampleFunctionCode,
    method: 'POST',
    body: { city: 'Pune' },
  });

  assert(runResult.status === 200, 'Function returned status 200');
  assert(runResult.response.acknowledged === true, 'Response body parsed correctly');
  assert(runResult.response.cityReceived === 'Pune', 'Input JSON payload accessed by function');
  assert(runResult.consoleLogs.some(l => l.includes('Processing payload for: Pune')), 'Console log output captured in runner');
  assert(runResult.durationMs >= 0, 'Latency measured in milliseconds');

  // --- Suite 3: 5-Second Timeout Enforcement ---
  console.log('\n--- 3. 5-SECOND TIMEOUT ENFORCEMENT ---');
  const infiniteLoopCode = `
    import { serve } from '@hind/functions';
    serve(async () => {
      while(true) {}
    });
  `;

  console.log('  ⏳ Testing 5s timeout enforcement on infinite loop (will wait 5s)...');
  const timeoutResult = await functionRunner.run({
    code: infiniteLoopCode,
    body: {},
  });

  assert(timeoutResult.status === 504, 'Infinite loop terminated with HTTP 504 Gateway Timeout');
  assert(timeoutResult.durationMs >= 4800, 'Process killed after 5 seconds');
  assert(timeoutResult.consoleLogs.some(l => l.includes('timed out')), 'Timeout logged in execution errors');

  // --- Suite 4: Controller Endpoints & RBAC ---
  console.log('\n--- 4. FUNCTIONS CONTROLLER ENDPOINTS & RBAC ---');

  // Non-member access => 404
  let nonMemberStatus = 200;
  await functionsController.listFunctions(
    { params: { id: testDb.id }, user: outsiderUser },
    {
      status: (code) => { nonMemberStatus = code; return { json: () => {} }; },
      json: () => {},
    }
  );
  assert(nonMemberStatus === 404, 'Non-member access to functions returns 404 (cloaked)');

  // Create Function (POST /:id/functions)
  let createResp = null;
  let createStatus = 200;
  await functionsController.createFunction(
    {
      params: { id: testDb.id },
      user: ownerUser,
      body: {
        name: 'order-processor',
        code: sampleFunctionCode,
        trigger_type: 'HTTP Webhook',
      },
    },
    {
      status: (code) => { createStatus = code; return { json: (d) => { createResp = d; } }; },
      json: (d) => { createResp = d; },
    }
  );

  assert(createStatus === 201 && createResp.success === true, 'Function created with status 201');
  assert(createResp.data.slug === 'order-processor', 'Slug auto-generated as order-processor');
  assert(createResp.data.status === 'DEPLOYED', 'Initial status is DEPLOYED');
  const fnId = createResp.data.id;

  // List Functions (GET /:id/functions)
  let listResp = null;
  await functionsController.listFunctions(
    { params: { id: testDb.id }, user: ownerUser },
    { json: (d) => { listResp = d; } }
  );
  assert(listResp.success === true, 'List functions returned success: true');
  assert(listResp.total >= 1, 'Functions list contains newly created function');

  // Deploy to Edge / Update (PUT /:id/functions/:fnId)
  // Negative test: Compile error on bad code
  let badDeployStatus = 200;
  let badDeployResp = null;
  await functionsController.updateFunction(
    {
      params: { id: testDb.id, fnId },
      user: ownerUser,
      body: { code: 'const badSyntax = ;' },
    },
    {
      status: (code) => { badDeployStatus = code; return { json: (d) => { badDeployResp = d; } }; },
      json: (d) => { badDeployResp = d; },
    }
  );
  assert(badDeployStatus === 400, 'Deploying invalid code returns 400 Bad Request');
  assert(badDeployResp.error === 'CompileError', 'Returns CompileError for inline display');

  // Positive test: Update with valid code
  const updatedCode = `
    import { serve } from '@hind/functions';
    serve(async (req) => {
      return { status: 200, body: JSON.stringify({ version: "2.0.0" }) };
    });
  `;
  let updateResp = null;
  await functionsController.updateFunction(
    {
      params: { id: testDb.id, fnId },
      user: ownerUser,
      body: { code: updatedCode },
    },
    {
      status: () => ({ json: () => {} }),
      json: (d) => { updateResp = d; },
    }
  );
  assert(updateResp.success === true, 'Deploy to Edge (PUT) succeeded');
  assert(updateResp.data.status === 'DEPLOYED', 'Status confirmed DEPLOYED');

  // Invoke Function (POST /:id/functions/:fnId/invoke)
  let invokeResp = null;
  await functionsController.invokeFunction(
    {
      params: { id: testDb.id, fnId },
      user: ownerUser,
      body: { method: 'POST', body: {} },
    },
    { json: (d) => { invokeResp = d; } }
  );
  assert(invokeResp.success === true, 'Invoke function returned success: true');
  assert(invokeResp.status === 200, 'Invocation returned status 200');
  assert(invokeResp.data.version === '2.0.0', 'Executed updated version of code');

  // Get Logs (GET /:id/functions/:fnId/logs)
  let logsResp = null;
  await functionsController.getLogs(
    { params: { id: testDb.id, fnId }, user: ownerUser },
    { json: (d) => { logsResp = d; } }
  );
  assert(logsResp.success === true, 'GET logs returned success: true');
  assert(logsResp.data.length >= 2, 'Logs buffer contains deployment and invocation records');
  assert(logsResp.data.some(l => l.includes('DEPLOY')), 'Deployment event logged in history');
  assert(logsResp.data.some(l => l.includes('/v1/functions/')), 'Invocation event logged in history');

  // Delete Function (DELETE /:id/functions/:fnId)
  let delResp = null;
  await functionsController.deleteFunction(
    { params: { id: testDb.id, fnId }, user: ownerUser },
    { json: (d) => { delResp = d; } }
  );
  assert(delResp.success === true, 'Function deleted successfully');

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

