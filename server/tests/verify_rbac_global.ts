/**
 * SolarOS Master Global RBAC Verification Suite
 * 
 * Tests the entire end-to-end Dynamic Role-Based Access Control System:
 * 1. Initial State & Baseline Authorization
 * 2. Owner Dynamic Permission Grant (PUT /api/v1/rbac/roles/:roleKey/permissions)
 * 3. Database Persistence & Instant Effective Capability Propagation
 * 4. Enterprise Audit Logging Verification
 * 5. Cross-Role Isolation (zero permission leakage to other roles)
 * 6. Strict Governance: Administrative vs Operational Execution Separation
 * 7. Operational Delegations lifecycle
 * 8. Dynamic Revocation & Immediate Session Propagation
 */

import { rbacService } from '../src/modules/rbac/rbac.service';
import { prisma } from '../src/db/prisma';
import { app } from '../src/app';
import { Server } from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
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
    results.push({ name, passed: false, error: err.message, details: err.stack });
    console.log(`[FAIL] -> ${err.message}`);
  }
}

async function startTestServer(): Promise<{ server: Server; port: number; baseUrl: string }> {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      const port = address.port;
      const baseUrl = `http://127.0.0.1:${port}/api/v1`;
      resolve({ server, port, baseUrl });
    });
  });
}

async function main() {
  console.log('\n======================================================');
  console.log('   SOLAROS GLOBAL RBAC ARCHITECTURE VERIFICATION');
  console.log('======================================================\n');

  const { server, baseUrl } = await startTestServer();

  try {
    // 1. Authenticate Owner to get Bearer Access Token
    let ownerToken = '';
    await runTest('Owner Authentication & JWT Generation', async () => {
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vikram.rao@sunpowersolutions.in',
          password: 'solaros2026',
          rememberMe: true
        })
      });
      const data = await loginRes.json();
      assert(loginRes.ok, 'Owner login failed', data);
      assert(data.success === true, 'Response marked not successful');
      assert(Boolean(data.data.accessToken), 'Access token missing');
      ownerToken = data.data.accessToken;
    });

    // 2. Initial State Verification: Warehouse Manager initially lacks customers.view
    await runTest('Initial State: warehouse_mgr lacks customers.view', async () => {
      const hasInitialPermission = rbacService.hasPermission('warehouse_mgr', 'customers.view');
      assert(hasInitialPermission === false, 'Warehouse manager should not possess customers.view initially');
      
      const capabilities = rbacService.getEffectiveCapabilities('warehouse_mgr');
      assert(!capabilities.includes('customers.view'), 'Effective capabilities must not include customers.view initially');
    });

    // 3. Owner Dynamic Grant: Add customers.view to warehouse_mgr
    await runTest('Dynamic Grant: Owner updates warehouse_mgr permissions via API', async () => {
      const currentRole = await rbacService.getRoleByKey('warehouse_mgr');
      assert(Boolean(currentRole), 'warehouse_mgr role not found');

      const updatedPermissions = {
        ...currentRole!.permissions,
        customers: ['view']
      };

      const res = await fetch(`${baseUrl}/rbac/roles/warehouse_mgr/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ownerToken}`
        },
        body: JSON.stringify({ permissions: updatedPermissions })
      });

      const body = await res.json();
      assert(res.ok, 'PUT /rbac/roles/warehouse_mgr/permissions returned non-200', body);
      assert(body.success === true, 'Response marked not successful');
      assert(Array.isArray(body.data.permissions.customers), 'Permissions.customers must be an array');
      assert(body.data.permissions.customers.includes('view'), 'Permissions.customers must contain "view"');
    });

    // 4. Instant In-Memory & Database Propagation
    await runTest('Instant Propagation: rbacService reflects customers.view without restart', async () => {
      const hasGrantedPermission = rbacService.hasPermission('warehouse_mgr', 'customers.view');
      assert(hasGrantedPermission === true, 'rbacService.hasPermission must be true immediately');

      const capabilities = rbacService.getEffectiveCapabilities('warehouse_mgr');
      assert(capabilities.includes('customers.view'), 'Effective capabilities must include customers.view');

      // Check role permissions via rbacService & API
      const role = await rbacService.getRoleByKey('warehouse_mgr');
      assert(Boolean(role), 'Role record missing');
      assert(Array.isArray(role!.permissions.customers) && role!.permissions.customers.includes('view'), 'Role permissions must persist customers.view');
    });

    // 5. Enterprise Audit Trail Verification
    await runTest('Audit Trail: Dynamic permission modification recorded with actor metadata', async () => {
      const res = await fetch(`${baseUrl}/audit-logs`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      assert(res.ok, 'Failed to retrieve audit logs', body);
      assert(Array.isArray(body.data) && body.data.length > 0, 'Audit logs must contain recorded events');
      
      const log = body.data.find((l: any) => l.action === 'ROLE_PERMISSIONS_UPDATE' && l.entityId === 'warehouse_mgr');
      assert(Boolean(log), 'ROLE_PERMISSIONS_UPDATE audit entry for warehouse_mgr not found in audit trail');
      assert(log.actorRole === 'owner_admin', 'Actor role must be owner_admin');
      assert(log.entity === 'Role', 'Entity must be Role');
    });

    // 6. Cross-Role Isolation: Verify install_tech and accountant are NOT affected
    await runTest('Cross-Role Isolation: Other roles do not inherit customers.view', async () => {
      assert(rbacService.hasPermission('install_tech', 'customers.view') === false, 'install_tech must not have customers.view');
      assert(rbacService.hasPermission('accountant', 'customers.view') === false, 'accountant must not have customers.view');
      assert(rbacService.hasPermission('survey_tech', 'customers.view') === true, 'survey_tech default read permission intact');
    });

    // 7. Strict Governance: Administrative Authority vs Operational Execution
    await runTest('Strict Governance: Owner cannot execute field installations without delegation', async () => {
      const ownerExecutionAllowed = rbacService.hasPermission('owner_admin', 'installations.execute');
      assert(ownerExecutionAllowed === false, 'Owner direct operational execution must be blocked');

      const ownerOversightAllowed = rbacService.hasPermission('owner_admin', 'installations.view');
      assert(ownerOversightAllowed === true, 'Owner administrative oversight must be permitted');
    });

    // 8. Operational Delegations Lifecycle
    await runTest('Operational Delegations: Temporary delegation authorization', async () => {
      const actor = { id: 'usr-owner-01', name: 'Vikramaditya Rao', role: 'owner_admin' };
      const delegation = await rbacService.createDelegation({
        employeeId: 'emp-tech-01',
        employeeName: 'Amit Jadhav',
        grantedPermission: 'installations.execute',
        departmentScope: 'Operations',
        resourceId: 'inst-test-101',
        authorizedBy: 'Vikramaditya Rao',
        justification: 'Emergency site lead coverage for high-capacity rooftop commissioning',
        effectiveFrom: new Date(Date.now() - 3600000).toISOString(),
        effectiveTo: new Date(Date.now() + 86400000).toISOString()
      }, actor);

      assert(Boolean(delegation.id), 'Delegation not created');
      const activeDelegations = await rbacService.getActiveDelegationsForUser('emp-tech-01', 'installations.execute');
      assert(activeDelegations.length > 0, 'Delegation not found in active query');

      // Revoke delegation
      const revoked = await rbacService.revokeDelegation(delegation.id, actor);
      assert(revoked.active === false, 'Delegation not revoked');
    });

    // 9. Dynamic Revocation: Remove customers.view from warehouse_mgr
    await runTest('Dynamic Revocation: Owner revokes customers.view and verifies instant restriction', async () => {
      const currentRole = await rbacService.getRoleByKey('warehouse_mgr');
      const revokedPermissions = { ...currentRole!.permissions };
      delete revokedPermissions.customers;

      const res = await fetch(`${baseUrl}/rbac/roles/warehouse_mgr/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ownerToken}`
        },
        body: JSON.stringify({ permissions: revokedPermissions })
      });

      const body = await res.json();
      assert(res.ok, 'Revocation PUT returned non-200');
      assert(!body.data.permissions.customers, 'Customers module should no longer exist on warehouse_mgr');

      // Instant verification
      assert(rbacService.hasPermission('warehouse_mgr', 'customers.view') === false, 'Permission must be revoked immediately');
      const capabilities = rbacService.getEffectiveCapabilities('warehouse_mgr');
      assert(!capabilities.includes('customers.view'), 'Effective capabilities must no longer contain customers.view');
    });

    // 10. Non-Owner Unauthorized Tampering Rejection
    await runTest('Security: Non-Owner cannot alter role permissions (403 Forbidden)', async () => {
      // Authenticate Sales Executive
      const salesLogin = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'pooja.k@sunpowersolutions.in',
          password: 'solaros2026'
        })
      });
      const salesData = await salesLogin.json();
      const salesToken = salesData.data.accessToken;

      const attempt = await fetch(`${baseUrl}/rbac/roles/sales_exec/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${salesToken}`
        },
        body: JSON.stringify({ permissions: { finance: ['manage'] } })
      });

      assert(attempt.status === 403, `Expected status 403 Forbidden, got ${attempt.status}`);
      const errBody = await attempt.json();
      assert(errBody.error.code === 'INSUFFICIENT_ROLE_PERMISSIONS', 'Expected INSUFFICIENT_ROLE_PERMISSIONS error code');
    });

  } finally {
    server.close();
  }

  // Summary Report
  console.log('\n======================================================');
  console.log('   RBAC GLOBAL TEST EXECUTION SUMMARY');
  console.log('======================================================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.error('\nFAILURES:');
    results.filter(r => !r.passed).forEach(r => {
      console.error(`- ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\nALL GLOBAL RBAC TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
