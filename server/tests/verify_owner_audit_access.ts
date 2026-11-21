/**
 * SolarOS Owner Command Center Audit Trail Access & Immutability Verification Suite
 * 
 * Tests:
 * 1. Owner Authentication & Session Validation
 * 2. Owner Access to Company-Wide Audit Logs (GET /api/v1/audit-logs and /api/v1/audit -> 200 OK)
 * 3. Audit Log Schema & Payload Verification (All 11 metadata fields present)
 * 4. Multi-Field Server-Side Filtering (Department, Module, Action, Result, Actor, Date, Pagination)
 * 5. Strict Append-Only Immutability Enforcement (PUT/PATCH/DELETE -> 405 Method Not Allowed)
 * 6. RBAC checkActionPermission Immutability Enforcement (edit/delete/purge blocked for all roles including Owner)
 * 7. Administrative Separation: Owner does NOT gain unauthorized operational permissions
 * 8. Non-Admin Role Restrictions: All 6 non-admin roles denied company-wide audit logs (403 Forbidden)
 * 9. Frontend Route Access Verification (isRouteAllowedForRole for /activity-center, /audit, /audit-logs)
 * 10. Non-Circular Resilience & Dynamic Permission Update Invariance
 */

import { rbacService } from '../src/modules/rbac/rbac.service';
import { auditService } from '../src/modules/audit/audit.service';
import { checkActionPermission, isRouteAllowedForRole } from '../../src/utils/rbac';
import { INITIAL_ROLES_PERMISSIONS } from '../../src/data/mockData';
import { app } from '../src/app';
import { Server } from 'http';
import { UserRole } from '../src/config/constants';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string, details?: any) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message} ${details ? JSON.stringify(details) : ''}`);
  }
}

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    process.stdout.write(`• Testing: ${name}... `);
    await fn();
    results.push({ name, passed: true });
    console.log(`[PASS]`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.log(`[FAIL] -> ${err.message}`);
  }
}

async function startTestServer(): Promise<{ server: Server; baseUrl: string }> {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}/api/v1` });
    });
  });
}

async function main() {
  console.log('\n======================================================');
  console.log('SOLAROS OWNER AUDIT TRAIL ACCESS & RBAC VERIFICATION');
  console.log('======================================================\n');

  const { server, baseUrl } = await startTestServer();

  let ownerToken = '';
  const nonAdminTokens: Record<string, string> = {};

  const ownerProfile = {
    id: 'usr-1',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@sunpowersolutions.in',
    role: 'owner_admin' as any,
    roleTitle: 'Managing Director & Owner',
    department: 'Executive Management'
  };

  const nonAdminProfiles: Array<{ role: UserRole; email: string; name: string }> = [
    { role: 'accountant', email: 'ramesh.p@sunpowersolutions.in', name: 'Ramesh Patil' },
    { role: 'warehouse_mgr', email: 'ganesh.s@sunpowersolutions.in', name: 'Ganesh Shinde' },
    { role: 'sales_exec', email: 'pooja.k@sunpowersolutions.in', name: 'Pooja Kulkarni' },
    { role: 'survey_tech', email: 'suresh.m@sunpowersolutions.in', name: 'Suresh More' },
    { role: 'install_tech', email: 'amit.j@sunpowersolutions.in', name: 'Amit Jadhav' },
    { role: 'support_exec', email: 'sneha.d@sunpowersolutions.in', name: 'Sneha Deshpande' },
  ];

  try {
    // ------------------------------------------------------------------------
    // Test 1: Authentication & Session Token Acquisition
    // ------------------------------------------------------------------------
    await runTest('1. Authenticate Owner & Non-Admin Test Accounts', async () => {
      const ownerRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vikram.rao@sunpowersolutions.in',
          password: 'solaros2026',
          rememberMe: true
        })
      });
      const ownerBody = await ownerRes.json();
      assert(ownerRes.status === 200, 'Owner login failed', ownerBody);
      ownerToken = ownerBody.data.accessToken;
      assert(Boolean(ownerToken), 'Owner token missing');

      for (const p of nonAdminProfiles) {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: p.email,
            password: 'solaros2026',
            rememberMe: true
          })
        });
        const body = await res.json();
        assert(res.status === 200, `Login failed for ${p.role}`, body);
        nonAdminTokens[p.role] = body.data.accessToken;
      }
    });

    // ------------------------------------------------------------------------
    // Test 2: Owner Company-Wide Audit Access
    // ------------------------------------------------------------------------
    await runTest('2. Owner Can Access /api/v1/audit-logs and /api/v1/audit', async () => {
      // Test /audit-logs endpoint
      const resLogs = await fetch(`${baseUrl}/audit-logs`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const bodyLogs = await resLogs.json();
      assert(resLogs.status === 200, 'Owner denied /api/v1/audit-logs', bodyLogs);
      assert(Array.isArray(bodyLogs.data), 'Audit logs data should be an array');
      assert(bodyLogs.data.length > 0, 'Audit logs should contain records');

      // Test /audit alias endpoint
      const resAudit = await fetch(`${baseUrl}/audit`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const bodyAudit = await resAudit.json();
      assert(resAudit.status === 200, 'Owner denied /api/v1/audit alias', bodyAudit);
      assert(Array.isArray(bodyAudit.data), 'Audit alias data should be an array');
    });

    // ------------------------------------------------------------------------
    // Test 3: Comprehensive Audit Schema Inspection
    // ------------------------------------------------------------------------
    await runTest('3. Audit Log Contains All 11 Required Metadata Fields', async () => {
      const res = await fetch(`${baseUrl}/audit-logs?limit=5`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      assert(res.status === 200, 'Failed to fetch audit logs');

      const log = body.data[0];
      assert(Boolean(log.actorName), 'actorName field missing', log);
      assert(Boolean(log.actorId), 'actorId field missing', log);
      assert(Boolean(log.department), 'department field missing', log);
      assert(Boolean(log.actorRole), 'actorRole field missing', log);
      assert(Boolean(log.action), 'action field missing', log);
      assert(Boolean(log.module || log.entity), 'module/entity field missing', log);
      assert(Boolean(log.entityId || log.recordId), 'record identifier missing', log);
      assert(Boolean(log.timestamp), 'timestamp field missing', log);
      assert(Boolean(log.result), 'result field missing', log);
      assert(Boolean(log.ipAddress), 'ipAddress field missing', log);
      assert(log.previousState !== undefined, 'previousState field missing', log);
      assert(log.newState !== undefined, 'newState field missing', log);
    });

    // ------------------------------------------------------------------------
    // Test 4: Server-Side Filtering & Pagination
    // ------------------------------------------------------------------------
    await runTest('4. Server-Side Filtering by Department, Module, Action, Result & Pagination', async () => {
      // 4a. Department filter (Sales)
      const resDept = await fetch(`${baseUrl}/audit-logs?department=Sales`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const bodyDept = await resDept.json();
      assert(resDept.status === 200, 'Department filter failed');
      assert(bodyDept.data.every((l: any) => l.department === 'Sales'), 'Not all records match Sales department');

      // 4b. Module filter (Quotations)
      const resMod = await fetch(`${baseUrl}/audit-logs?module=Quotations`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const bodyMod = await resMod.json();
      assert(resMod.status === 200, 'Module filter failed');
      assert(bodyMod.data.every((l: any) => l.module === 'Quotations' || l.entity === 'Quotation'), 'Not all records match Quotations module');

      // 4c. Action filter (APPROVE)
      const resAction = await fetch(`${baseUrl}/audit-logs?action=APPROVE`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const bodyAction = await resAction.json();
      assert(resAction.status === 200, 'Action filter failed');
      assert(bodyAction.data.every((l: any) => l.action === 'APPROVE'), 'Not all records match APPROVE action');

      // 4d. Result filter (DENIED)
      const resResult = await fetch(`${baseUrl}/audit-logs?result=DENIED`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const bodyResult = await resResult.json();
      assert(resResult.status === 200, 'Result filter failed');
      assert(bodyResult.data.every((l: any) => l.result === 'DENIED'), 'Not all records match DENIED result');

      // 4e. Pagination
      const resPage = await fetch(`${baseUrl}/audit-logs?page=1&limit=2`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const bodyPage = await resPage.json();
      assert(resPage.status === 200, 'Pagination failed');
      assert(bodyPage.data.length <= 2, 'Page limit not respected');
      assert(bodyPage.meta.pagination.page === 1, 'Page metadata incorrect');
      assert(bodyPage.meta.pagination.limit === 2, 'Limit metadata incorrect');
    });

    // ------------------------------------------------------------------------
    // Test 5: Strict Append-Only Immutability Enforcement (HTTP Methods)
    // ------------------------------------------------------------------------
    await runTest('5. Immutability Enforcement: PUT/PATCH/DELETE on Audit Logs Blocked (405)', async () => {
      // 5a. PUT attempt
      const putRes = await fetch(`${baseUrl}/audit-logs/aud-001`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'tampered reason' })
      });
      assert(putRes.status === 405, `PUT /audit-logs should return 405, got ${putRes.status}`);

      // 5b. PATCH attempt
      const patchRes = await fetch(`${baseUrl}/audit-logs/aud-001`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ result: 'SUCCESS' })
      });
      assert(patchRes.status === 405, `PATCH /audit-logs should return 405, got ${patchRes.status}`);

      // 5c. DELETE attempt
      const delRes = await fetch(`${baseUrl}/audit-logs/aud-001`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      assert(delRes.status === 405, `DELETE /audit-logs should return 405, got ${delRes.status}`);
    });

    // ------------------------------------------------------------------------
    // Test 6: RBAC checkActionPermission Immutability Check
    // ------------------------------------------------------------------------
    await runTest('6. RBAC Permission Engine Forbids Audit Mutation for All Roles', async () => {
      // Owner can view & export
      assert(checkActionPermission(ownerProfile, 'audit', 'view', INITIAL_ROLES_PERMISSIONS) === true, 'Owner should have audit.view');
      assert(checkActionPermission(ownerProfile, 'audit', 'view_company_wide', INITIAL_ROLES_PERMISSIONS) === true, 'Owner should have audit.view_company_wide');
      assert(checkActionPermission(ownerProfile, 'audit', 'export', INITIAL_ROLES_PERMISSIONS) === true, 'Owner should have audit.export');

      // Owner CANNOT edit or delete audit
      assert(checkActionPermission(ownerProfile, 'audit', 'edit', INITIAL_ROLES_PERMISSIONS) === false, 'Owner MUST NOT have audit.edit');
      assert(checkActionPermission(ownerProfile, 'audit', 'delete', INITIAL_ROLES_PERMISSIONS) === false, 'Owner MUST NOT have audit.delete');
      assert(checkActionPermission(ownerProfile, 'audit', 'purge', INITIAL_ROLES_PERMISSIONS) === false, 'Owner MUST NOT have audit.purge');

      // Activity Center resource aliases also strictly immutable
      assert(checkActionPermission(ownerProfile, 'activity_center', 'view', INITIAL_ROLES_PERMISSIONS) === true, 'Owner should have activity_center.view');
      assert(checkActionPermission(ownerProfile, 'activity_center', 'edit', INITIAL_ROLES_PERMISSIONS) === false, 'Owner MUST NOT have activity_center.edit');
      assert(checkActionPermission(ownerProfile, 'activity_center', 'delete', INITIAL_ROLES_PERMISSIONS) === false, 'Owner MUST NOT have activity_center.delete');
    });

    // ------------------------------------------------------------------------
    // Test 7: Separation of Administrative vs Operational Permissions
    // ------------------------------------------------------------------------
    await runTest('7. Administrative Separation: Owner Forbidden from Direct Operational Execution', async () => {
      assert(checkActionPermission(ownerProfile, 'installations', 'execute') === false, 'Owner must NOT have installations.execute');
      assert(checkActionPermission(ownerProfile, 'surveys', 'submit_report') === false, 'Owner must NOT have surveys.submit_report');
      assert(checkActionPermission(ownerProfile, 'inventory', 'adjust') === false, 'Owner must NOT have inventory.adjust');
    });

    // ------------------------------------------------------------------------
    // Test 8: Non-Admin Roles Strictly Prohibited from Company-Wide Audit Logs
    // ------------------------------------------------------------------------
    await runTest('8. Non-Administrative Roles Denied Access to /api/v1/audit-logs (403)', async () => {
      for (const p of nonAdminProfiles) {
        const token = nonAdminTokens[p.role];
        const res = await fetch(`${baseUrl}/audit-logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const body = await res.json();
        assert(res.status === 403, `Role '${p.role}' should be denied (403), got ${res.status}`, body);
        assert(body.error?.code === 'INSUFFICIENT_ROLE_PERMISSIONS', `Expected INSUFFICIENT_ROLE_PERMISSIONS for ${p.role}`);
      }
    });

    // ------------------------------------------------------------------------
    // Test 9: Frontend Route Authorization
    // ------------------------------------------------------------------------
    await runTest('9. Frontend Route Guards Permit Owner and Block Non-Admin Roles', async () => {
      // Owner permitted
      assert(isRouteAllowedForRole('/activity-center', 'owner_admin', INITIAL_ROLES_PERMISSIONS) === true, 'Owner should be allowed /activity-center');
      assert(isRouteAllowedForRole('/audit', 'owner_admin', INITIAL_ROLES_PERMISSIONS) === true, 'Owner should be allowed /audit');
      assert(isRouteAllowedForRole('/audit-logs', 'owner_admin', INITIAL_ROLES_PERMISSIONS) === true, 'Owner should be allowed /audit-logs');

      // Non-admins blocked
      for (const p of nonAdminProfiles) {
        assert(isRouteAllowedForRole('/activity-center', p.role, INITIAL_ROLES_PERMISSIONS) === false, `Role '${p.role}' should be blocked from /activity-center`);
        assert(isRouteAllowedForRole('/audit', p.role, INITIAL_ROLES_PERMISSIONS) === false, `Role '${p.role}' should be blocked from /audit`);
        assert(isRouteAllowedForRole('/audit-logs', p.role, INITIAL_ROLES_PERMISSIONS) === false, `Role '${p.role}' should be blocked from /audit-logs`);
      }
    });

    // ------------------------------------------------------------------------
    // Test 10: Non-Circular Resilience & Dynamic Permission Update Invariance
    // ------------------------------------------------------------------------
    await runTest('10. Owner Retains Audit Access Even If Matrix Inadvertently Excludes Audit', async () => {
      const corruptedMatrix = JSON.parse(JSON.stringify(INITIAL_ROLES_PERMISSIONS));
      const ownerDef = corruptedMatrix.find((r: any) => r.roleKey === 'owner_admin');
      if (ownerDef) {
        delete ownerDef.permissions.audit;
        delete ownerDef.permissions.activity_center;
      }

      // Thanks to the bootstrap governance guarantee in checkActionPermission:
      assert(checkActionPermission(ownerProfile, 'audit', 'view', corruptedMatrix) === true, 'Owner should retain audit view via bootstrap');
      assert(checkActionPermission(ownerProfile, 'audit', 'edit', corruptedMatrix) === false, 'Owner still cannot edit audit even in bootstrap');
    });

  } finally {
    server.close();
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('TEST SUMMARY');
  console.log('======================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Total Tests : ${total}`);
  console.log(`Passed      : ${passed}`);
  console.log(`Failed      : ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(r => console.log(`- ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log('\nAll 10 test suites PASSED successfully!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner exception:', err);
  process.exit(1);
});
