/**
 * Hind DB - Team Management & Invites Test Suite
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import crypto from 'crypto';
import { getDb, memoryDatabases, teamStore } from './services/access.js';
import { teamController } from './controllers/teamController.js';

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
  console.log('👥 HIND DB - TEAM RBAC & INVITES AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  // Setup mock users and database
  const ownerUser = {
    id: 'usr_owner_01',
    email: 'owner@hinddb.io',
    full_name: 'Priyanshu Owner',
  };

  const outsiderUser = {
    id: 'usr_outsider_02',
    email: 'attacker@evil.org',
    full_name: 'Evil Attacker',
  };

  const invitedUser = {
    id: 'usr_dev_03',
    email: 'vikram.dev@startup.in',
    full_name: 'Vikram Developer',
  };

  const wrongUser = {
    id: 'usr_wrong_04',
    email: 'sneaky@anothercompany.in',
    full_name: 'Sneaky User',
  };

  const testDb = {
    id: 'db_test_team_001',
    user_id: ownerUser.id,
    name: 'sovereign-team-cluster',
    region: 'Sovereign Primary (ap-south-1)',
    plan: 'Pro',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };

  memoryDatabases.set(testDb.id, testDb);

  // --- Suite 1: Access Control & Role Enforcement (getDb) ---
  console.log('--- 1. ACCESS CONTROL & ROLE ENFORCEMENT (getDb) ---');
  
  // Non-existent database => 404
  try {
    await getDb({ params: { id: 'db_nonexistent' }, user: ownerUser }, 'viewer');
    assert(false, 'Non-existent DB should throw 404');
  } catch (err) {
    assert(err.status === 404, 'Non-existent database returns 404');
  }

  // Non-member access => 404 (Security by obscurity)
  try {
    await getDb({ params: { id: testDb.id }, user: outsiderUser }, 'viewer');
    assert(false, 'Non-member access should throw 404');
  } catch (err) {
    assert(err.status === 404, 'Non-member access strictly cloaked as 404');
  }

  // Owner access => role 'owner'
  const ownerAccess = await getDb({ params: { id: testDb.id }, user: ownerUser }, 'viewer');
  assert(ownerAccess.role === 'owner', 'Database creator resolved as role "owner"');
  assert(ownerAccess.db.id === testDb.id, 'Returned correct database instance');

  // --- Suite 2: Team Listing (GET /:id/team) ---
  console.log('\n--- 2. TEAM LISTING & OWNER IMMUTABILITY ---');
  let listResp = null;
  await teamController.getTeam(
    { params: { id: testDb.id }, user: ownerUser },
    { json: (d) => { listResp = d; }, status: () => ({ json: () => {} }) }
  );

  assert(listResp.success === true, 'GET team returned success: true');
  assert(listResp.data.length >= 1, 'Team includes at least the owner');
  const ownerEntry = listResp.data[0];
  assert(ownerEntry.is_owner === true, 'First member is marked as is_owner: true');
  assert(ownerEntry.role === 'owner', 'Owner role is explicitly "owner"');
  assert(ownerEntry.email === ownerUser.email, 'Owner email matches creator email');

  // --- Suite 3: Team Invites (POST /:id/team/invites) ---
  console.log('\n--- 3. CRYPTOGRAPHIC TEAM INVITES ---');
  let inviteResp = null;
  let inviteStatus = 200;

  await teamController.inviteMember(
    {
      params: { id: testDb.id },
      user: ownerUser,
      body: {
        name: invitedUser.full_name,
        email: invitedUser.email,
        role: 'developer',
      },
    },
    {
      status: (code) => {
        inviteStatus = code;
        return { json: (d) => { inviteResp = d; } };
      },
      json: (d) => { inviteResp = d; },
    }
  );

  assert(inviteStatus === 201 && inviteResp.success === true, 'Invite created with status 201');
  assert(inviteResp.data.status === 'INVITED', 'New member starts in INVITED status');
  assert(inviteResp.data.role === 'developer', 'Assigned role is developer');
  assert(Boolean(inviteResp.devInviteLink), 'Returned devInviteLink for development');
  assert(inviteResp.devInviteLink.includes('/accept-invite?token='), 'devInviteLink points to /accept-invite?token=');

  // Extract raw token from invite link
  const rawToken = inviteResp.devInviteLink.split('token=')[1];
  assert(rawToken.length === 64, 'Raw token is 64-char hex string (32 random bytes)');

  // Duplicate invite rejection
  let dupStatus = 200;
  await teamController.inviteMember(
    {
      params: { id: testDb.id },
      user: ownerUser,
      body: { name: 'Duplicate', email: invitedUser.email, role: 'developer' },
    },
    {
      status: (code) => {
        dupStatus = code;
        return { json: () => {} };
      },
      json: () => {},
    }
  );
  assert(dupStatus === 400, 'Duplicate invite for same email is rejected with 400');

  // Inviting owner rejection
  let ownerInvStatus = 200;
  await teamController.inviteMember(
    {
      params: { id: testDb.id },
      user: ownerUser,
      body: { name: 'Owner Invite', email: ownerUser.email, role: 'admin' },
    },
    {
      status: (code) => {
        ownerInvStatus = code;
        return { json: () => {} };
      },
      json: () => {},
    }
  );
  assert(ownerInvStatus === 400, 'Attempting to invite database owner is rejected with 400');

  // --- Suite 4: Invite Acceptance & Email Binding (POST /invites/accept) ---
  console.log('\n--- 4. INVITE ACCEPTANCE & EMAIL BOUNDARY DEFENSE ---');

  // Wrong email acceptance attempt => 403 EMAIL_MISMATCH
  let wrongAcceptResp = null;
  let wrongAcceptStatus = 200;
  await teamController.acceptInvite(
    {
      user: wrongUser,
      body: { token: rawToken },
    },
    {
      status: (code) => {
        wrongAcceptStatus = code;
        return { json: (d) => { wrongAcceptResp = d; } };
      },
      json: (d) => { wrongAcceptResp = d; },
    }
  );
  assert(wrongAcceptStatus === 403, 'Accepting with wrong email returns 403 Forbidden');
  assert(wrongAcceptResp.error === 'EMAIL_MISMATCH', 'Error code is strictly EMAIL_MISMATCH');

  // Correct email acceptance
  let acceptResp = null;
  let acceptStatus = 200;
  await teamController.acceptInvite(
    {
      user: invitedUser,
      body: { token: rawToken },
    },
    {
      status: (code) => {
        acceptStatus = code;
        return { json: (d) => { acceptResp = d; } };
      },
      json: (d) => { acceptResp = d; },
    }
  );
  assert(acceptStatus === 200 && acceptResp.success === true, 'Accepting with correct email returns 200 Success');
  assert(acceptResp.databaseId === testDb.id, 'Returned target databaseId for active DB switch');
  assert(acceptResp.role === 'developer', 'Returned assigned role');

  // Single-use token invalidation check (replay attack prevention)
  let replayStatus = 200;
  await teamController.acceptInvite(
    {
      user: invitedUser,
      body: { token: rawToken },
    },
    {
      status: (code) => {
        replayStatus = code;
        return { json: () => {} };
      },
      json: () => {},
    }
  );
  assert(replayStatus === 400, 'Replay attack prevented: single-use token invalidated after acceptance');

  // Verify accepted member now has developer access via getDb
  const devAccess = await getDb({ params: { id: testDb.id }, user: invitedUser }, 'viewer');
  assert(devAccess.role === 'developer', 'Accepted member now has active role "developer"');

  // Developer cannot perform admin actions
  try {
    await getDb({ params: { id: testDb.id }, user: invitedUser }, 'admin');
    assert(false, 'Developer should not be allowed admin action');
  } catch (err) {
    assert(err.status === 403, 'Developer blocked from admin operations with 403');
  }

  // --- Suite 5: Member Role Updates & Owner Protection ---
  console.log('\n--- 5. ROLE UPDATES & OWNER PROTECTION ---');
  const invitedMemberId = inviteResp.data.id;

  // Cannot modify owner role
  let editOwnerStatus = 200;
  await teamController.updateRole(
    {
      params: { id: testDb.id, memberId: ownerEntry.id },
      user: ownerUser,
      body: { role: 'viewer' },
    },
    {
      status: (code) => {
        editOwnerStatus = code;
        return { json: () => {} };
      },
      json: () => {},
    }
  );
  assert(editOwnerStatus === 400, 'Attempting to edit owner role is blocked with 400');

  // Promote invited user to 'admin'
  let updateRoleResp = null;
  await teamController.updateRole(
    {
      params: { id: testDb.id, memberId: invitedMemberId },
      user: ownerUser,
      body: { role: 'admin' },
    },
    {
      status: () => ({ json: () => {} }),
      json: (d) => { updateRoleResp = d; },
    }
  );
  assert(updateRoleResp.success === true, 'Member role successfully updated to admin');
  assert(updateRoleResp.data.role === 'admin', 'Updated role reflected in response');

  // Verify member now has admin access
  const adminAccess = await getDb({ params: { id: testDb.id }, user: invitedUser }, 'admin');
  assert(adminAccess.role === 'admin', 'Promoted member now passes minRole = "admin" check');

  // --- Suite 6: Member Removal & Owner Protection ---
  console.log('\n--- 6. MEMBER REMOVAL & PERMISSION REVOCATION ---');

  // Cannot remove owner
  let delOwnerStatus = 200;
  await teamController.removeMember(
    {
      params: { id: testDb.id, memberId: ownerEntry.id },
      user: ownerUser,
    },
    {
      status: (code) => {
        delOwnerStatus = code;
        return { json: () => {} };
      },
      json: () => {},
    }
  );
  assert(delOwnerStatus === 400, 'Attempting to remove database owner is blocked with 400');

  // Remove member
  let delResp = null;
  await teamController.removeMember(
    {
      params: { id: testDb.id, memberId: invitedMemberId },
      user: ownerUser,
    },
    {
      status: () => ({ json: () => {} }),
      json: (d) => { delResp = d; },
    }
  );
  assert(delResp.success === true, 'Team member removed successfully');

  // Removed member can no longer access DB (returns 404 again)
  try {
    await getDb({ params: { id: testDb.id }, user: invitedUser }, 'viewer');
    assert(false, 'Removed member should not have access');
  } catch (err) {
    assert(err.status === 404, 'Removed member immediately loses access (returns 404)');
  }

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

