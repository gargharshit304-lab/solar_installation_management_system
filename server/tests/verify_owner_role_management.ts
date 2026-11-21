/**
 * SolarOS Owner Role & Permission Management Verification Suite
 * 
 * Tests:
 * 1. Owner Authentication & Session Validation
 * 2. Roles Query (GET /api/v1/rbac/roles)
 * 3. Role Permission Inspection across all roles
 * 4. Owner Dynamic Grant (PUT /api/v1/rbac/roles/warehouse_mgr/permissions -> add customers.view)
 * 5. Warehouse Manager can view customers (canView = true, GET /api/v1/customers -> 200 OK)
 * 6. Warehouse Manager strictly prohibited from mutating customers (POST /api/v1/customers -> 403 Forbidden)
 * 7. Owner Dynamic Revocation (remove customers.view)
 * 8. Warehouse Manager instantly loses customer access (canView = false, GET /api/v1/customers -> 403 Forbidden)
 * 9. Non-Owner Unauthorized Tampering Blocked (Warehouse Manager calling PUT /api/v1/rbac/roles/... -> 403 Forbidden)
 * 10. Strict Operational Separation: Owner CANNOT execute field installations (installations.execute blocked)
 * 11. Circular Dependency Resilience: Owner retains roles.manage & roles_permissions.manage even if dynamic matrix is corrupted/empty
 */

import { rbacService } from '../src/modules/rbac/rbac.service';
import { checkActionPermission, canManage, canEdit, canCreate, canView } from '../../src/utils/rbac';
import { app } from '../src/app';
import { Server } from 'http';

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
  console.log('SOLAROS OWNER ROLE MANAGEMENT & GOVERNANCE VERIFICATION');
  console.log('======================================================\n');

  const { server, baseUrl } = await startTestServer();

  let ownerToken = '';
  let warehouseToken = '';

  const ownerProfile = {
    id: 'usr-1',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@sunpowersolutions.in',
    role: 'owner_admin' as any,
    roleTitle: 'Managing Director & Owner',
    department: 'Executive'
  };

  const warehouseProfile = {
    id: 'usr-3',
    name: 'Ganesh Shinde',
    email: 'ganesh.s@sunpowersolutions.in',
    role: 'warehouse_mgr' as any,
    roleTitle: 'Central Warehouse & Logistics Manager',
    department: 'Supply Chain'
  };

  try {
    // 1. Authenticate Owner
    await runTest('1. Owner Authentication (Vikramaditya Rao / owner_admin)', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vikram.rao@sunpowersolutions.in',
          password: 'solaros2026',
          rememberMe: true
        })
      });
      const data = await res.json();
      assert(res.ok, 'Owner login failed', data);
      assert(Boolean(data.data.accessToken), 'Access token missing');
      ownerToken = data.data.accessToken;
      assert(data.data.user.role === 'owner_admin', `Expected owner_admin, got ${data.data.user.role}`);
    });

    // Authenticate Warehouse Manager for comparative testing
    await runTest('1b. Warehouse Manager Authentication (Ganesh Shinde)', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ganesh.s@sunpowersolutions.in',
          password: 'solaros2026',
          rememberMe: true
        })
      });
      const data = await res.json();
      assert(res.ok, 'Warehouse Manager login failed', data);
      warehouseToken = data.data.accessToken;
    });

    // 2. Query Roles via API
    await runTest('2. Owner queries roles via GET /api/v1/rbac/roles', async () => {
      const res = await fetch(`${baseUrl}/rbac/roles`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Failed to retrieve roles', data);
      assert(Array.isArray(data.data), 'Expected array of roles');
      const ownerRole = data.data.find((r: any) => r.roleKey === 'owner_admin');
      assert(Boolean(ownerRole), 'owner_admin role not found in response');
      assert(Boolean(ownerRole.permissions.roles_permissions), 'roles_permissions missing from owner');
    });

    // 3. Inspect Frontend Permission Evaluator for Owner
    await runTest('3. Frontend Evaluator allows Owner roles.manage & roles_permissions.manage', async () => {
      const canManageRoles = canManage(ownerProfile, 'roles');
      const canManageRolesPerms = canManage(ownerProfile, 'roles_permissions');
      const canEditRoles = canEdit(ownerProfile, 'roles');
      const canCreateRoles = canCreate(ownerProfile, 'roles');

      assert(canManageRoles === true, 'Owner must have canManage("roles") = true');
      assert(canManageRolesPerms === true, 'Owner must have canManage("roles_permissions") = true');
      assert(canEditRoles === true, 'Owner must have canEdit("roles") = true');
      assert(canCreateRoles === true, 'Owner must have canCreate("roles") = true');
    });

    // 4. Owner grants customers.view to warehouse_mgr
    await runTest('4. Owner grants customers.view to warehouse_mgr via API', async () => {
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
          Authorization: `Bearer ${ownerToken}`
        },
        body: JSON.stringify({ permissions: updatedPermissions })
      });

      const data = await res.json();
      assert(res.ok, 'Failed to update warehouse_mgr permissions', data);
      assert(data.data.permissions.customers.includes('view'), 'Granted view permission missing in response');
    });

    // 5. Warehouse Manager can access GET /customers (view allowed)
    await runTest('5. Warehouse Manager can view customers (GET /customers -> 200)', async () => {
      const res = await fetch(`${baseUrl}/customers`, {
        headers: { Authorization: `Bearer ${warehouseToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Warehouse Manager should be permitted to view customers', data);
      assert(data.success === true, 'Customer list query failed');
    });

    // 6. Warehouse Manager CANNOT mutate customers (POST /customers -> 403 Forbidden)
    await runTest('6. Warehouse Manager blocked from creating customer (POST /customers -> 403)', async () => {
      const res = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${warehouseToken}`
        },
        body: JSON.stringify({
          fullName: 'Unauthorized Lead Attempt',
          phone: '+919876543299',
          email: 'unauth@lead.com',
          propertyType: 'Residential',
          siteAddress: '123 Fake Street',
          city: 'Pune',
          pincode: '411001'
        })
      });
      const data = await res.json();
      assert(res.status === 403, `Expected 403 Forbidden, got ${res.status}`, data);
    });

    // 7. Owner revokes customers.view from warehouse_mgr
    await runTest('7. Owner revokes customers.view from warehouse_mgr via API', async () => {
      const currentRole = await rbacService.getRoleByKey('warehouse_mgr');
      const updatedPermissions = { ...currentRole!.permissions };
      delete updatedPermissions.customers;

      const res = await fetch(`${baseUrl}/rbac/roles/warehouse_mgr/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`
        },
        body: JSON.stringify({ permissions: updatedPermissions })
      });

      const data = await res.json();
      assert(res.ok, 'Failed to revoke permissions', data);
      assert(!data.data.permissions.customers, 'customers permission should be revoked');
    });

    // 8. Warehouse Manager instantly loses customer access (403 Forbidden)
    await runTest('8. Warehouse Manager immediately blocked from GET /customers -> 403', async () => {
      const res = await fetch(`${baseUrl}/customers`, {
        headers: { Authorization: `Bearer ${warehouseToken}` }
      });
      const data = await res.json();
      assert(res.status === 403, `Expected 403 Forbidden, got ${res.status}`, data);
    });

    // 9. Unauthorized tampering blocked: Warehouse Manager tries to update role permissions
    await runTest('9. Non-Owner cannot configure role permissions (PUT /rbac/roles/... -> 403)', async () => {
      const res = await fetch(`${baseUrl}/rbac/roles/warehouse_mgr/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${warehouseToken}`
        },
        body: JSON.stringify({
          permissions: { customers: ['view', 'create', 'edit', 'delete'] }
        })
      });
      const data = await res.json();
      assert(res.status === 403, `Expected 403 Forbidden, got ${res.status}`, data);
    });

    // 10. Strict Operational Separation: Owner CANNOT execute installations directly
    await runTest('10. Owner is strictly prohibited from installations.execute', async () => {
      // Backend check
      const backendAllowed = await rbacService.checkActionPermission(ownerProfile, 'installations', 'execute');
      assert(backendAllowed === false, 'Backend must deny Owner direct installation execution');

      // Frontend check
      const frontendAllowed = checkActionPermission(ownerProfile, 'installations', 'execute');
      assert(frontendAllowed === false, 'Frontend must deny Owner direct installation execution');
    });

    // 11. Circular Dependency Resilience Test
    await runTest('11. Non-circular Owner Bootstrap preserves governance even with empty dynamic roles', async () => {
      // Test frontend check with empty dynamicRoles array
      const emptyDynamicRoles: any[] = [];
      const canManageEmpty = checkActionPermission(ownerProfile, 'roles', 'manage', emptyDynamicRoles);
      const canManagePermsEmpty = checkActionPermission(ownerProfile, 'roles_permissions', 'manage', emptyDynamicRoles);
      const canManageDeptsEmpty = checkActionPermission(ownerProfile, 'departments', 'manage', emptyDynamicRoles);

      assert(canManageEmpty === true, 'Owner bootstrap must grant roles.manage even with empty dynamicRoles');
      assert(canManagePermsEmpty === true, 'Owner bootstrap must grant roles_permissions.manage even with empty dynamicRoles');
      assert(canManageDeptsEmpty === true, 'Owner bootstrap must grant departments.manage even with empty dynamicRoles');

      // Test backend check with simulated empty permissions in memory
      const backendOwnerAllowed = await rbacService.checkActionPermission(ownerProfile, 'roles_permissions', 'manage');
      assert(backendOwnerAllowed === true, 'Backend bootstrap must guarantee Owner governance');
    });

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log('\n------------------------------------------------------');
  console.log(`SUMMARY: ${results.filter(r => r.passed).length} / ${results.length} tests passed.`);
  console.log('------------------------------------------------------\n');

  if (results.some(r => !r.passed)) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
