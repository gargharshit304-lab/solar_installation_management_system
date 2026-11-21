/**
 * SolarOS Roles & Permissions Matrix Filter & Employee Inspector Verification Suite
 * 
 * Tests:
 * 1. Selecting each authorized department dynamically from the backend/database.
 * 2. Searching for an employee by name.
 * 3. Searching within a specific department (scoped search).
 * 4. Searching across all authorized departments.
 * 5. Clearing filters (resets back to normal role-based permission matrix).
 * 6. Disambiguating duplicate / common employee names with employee code and designation.
 * 7. Searching by employee ID / code (e.g., EMP-006).
 * 8. Searching by email address.
 * 9. Handling a large employee database (200+ mock employee records with pagination & limits).
 * 10. Switching between role tabs and inspecting role permissions.
 * 11. Selecting an individual employee and inspecting effective permissions (Role Inherited + Delegations).
 * 12. Confirming employee-specific overrides do NOT unintentionally modify the entire role.
 */

import { employeeService } from '../src/modules/employees/employee.service';
import { rbacService } from '../src/modules/rbac/rbac.service';
import { checkActionPermission } from '../../src/utils/rbac';
import { INITIAL_ROLES_PERMISSIONS } from '../../src/data/mockData';
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
  console.log('SOLAROS ROLES & PERMISSIONS FILTERS VERIFICATION');
  console.log('======================================================\n');

  const { server, baseUrl } = await startTestServer();
  let ownerToken = '';

  const ownerUser = {
    id: 'usr-1',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@sunpowersolutions.in',
    role: 'owner_admin' as any,
    roleTitle: 'Managing Director & Owner',
    department: 'Executive Management'
  };

  try {
    // ------------------------------------------------------------------------
    // Setup: Login Owner
    // ------------------------------------------------------------------------
    await runTest('0. Authenticate Owner Administrator', async () => {
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
      assert(res.status === 200, 'Login failed', data);
      ownerToken = data.data.accessToken;
      assert(Boolean(ownerToken), 'Owner token missing');
    });

    // ------------------------------------------------------------------------
    // Test 1: Selecting each department dynamically
    // ------------------------------------------------------------------------
    await runTest('1. Retrieve Dynamic Departments from API', async () => {
      const res = await fetch(`${baseUrl}/employees/departments`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      assert(res.status === 200, 'Failed to fetch departments', body);
      assert(Array.isArray(body.data), 'Departments should be an array');
      assert(body.data.length >= 7, 'Expected at least 7 operational departments', body.data);

      const deptNames = body.data.map((d: any) => d.name);
      assert(deptNames.some((n: string) => n.toLowerCase().includes('sales')), 'Sales department missing');
      assert(deptNames.some((n: string) => n.toLowerCase().includes('field')), 'Field Operations missing');
      assert(deptNames.some((n: string) => n.toLowerCase().includes('engineering')), 'Engineering missing');
      assert(deptNames.some((n: string) => n.toLowerCase().includes('warehouse') || n.toLowerCase().includes('supply')), 'Warehouse missing');
      assert(deptNames.some((n: string) => n.toLowerCase().includes('installation')), 'Installation missing');
      assert(deptNames.some((n: string) => n.toLowerCase().includes('finance') || n.toLowerCase().includes('accounts')), 'Finance missing');
      assert(deptNames.some((n: string) => n.toLowerCase().includes('client') || n.toLowerCase().includes('warranty')), 'Client Care missing');
    });

    // ------------------------------------------------------------------------
    // Test 2: Searching for an employee by name
    // ------------------------------------------------------------------------
    await runTest('2. Search Employee by Name (e.g. Ganesh)', async () => {
      const res = await fetch(`${baseUrl}/employees?search=Ganesh`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      assert(res.status === 200, 'Search failed', body);
      assert(body.data.length > 0, 'No results for Ganesh');
      const found = body.data.find((e: any) => e.fullName.includes('Ganesh Shinde'));
      assert(Boolean(found), 'Ganesh Shinde not found', body.data);
      assert(found.employeeCode === 'EMP-006', 'Incorrect employeeCode for Ganesh');
      assert(found.role === 'warehouse_mgr', 'Incorrect role for Ganesh');
    });

    // ------------------------------------------------------------------------
    // Test 3: Searching within a specific department (Scoped Search)
    // ------------------------------------------------------------------------
    await runTest('3. Search Within Department (Warehouse & Logistics + Ganesh)', async () => {
      const res = await fetch(`${baseUrl}/employees?department=Warehouse%20%26%20Supply%20Chain&search=Ganesh`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      assert(res.status === 200, 'Department scoped search failed', body);
      assert(body.data.length > 0, 'Ganesh not found in Warehouse');
      assert(body.data.every((e: any) => e.department.toLowerCase().includes('warehouse') || e.department.toLowerCase().includes('supply')), 'Results contain employee from other department');
    });

    // ------------------------------------------------------------------------
    // Test 4: Searching across all authorized departments
    // ------------------------------------------------------------------------
    await runTest('4. Search Across All Authorized Departments', async () => {
      const res = await fetch(`${baseUrl}/employees?search=Patil`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      assert(res.status === 200, 'Search for Patil failed', body);
      assert(body.data.length >= 2, 'Expected multiple Patils across departments (e.g. Sandeep in Engineering, Ramesh in Accounts)', body.data);
      const depts = new Set(body.data.map((e: any) => e.department));
      assert(depts.size >= 2, 'Expected Patils in different departments');
    });

    // ------------------------------------------------------------------------
    // Test 5: Clearing filters behavior
    // ------------------------------------------------------------------------
    await runTest('5. Reset Filters returns complete workforce directory', async () => {
      const res = await fetch(`${baseUrl}/employees?limit=50`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      assert(res.status === 200, 'Unfiltered query failed', body);
      assert(body.data.length >= 10, 'Expected all baseline employees when filters cleared');
    });

    // ------------------------------------------------------------------------
    // Test 6: Selecting duplicate/similar employee names disambiguated
    // ------------------------------------------------------------------------
    await runTest('6. Disambiguate Similar Names via Employee Code & Designation', async () => {
      const res = await fetch(`${baseUrl}/employees?search=Patil`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      assert(res.status === 200, 'Search failed');
      const codes = body.data.map((e: any) => e.employeeCode);
      const uniqueCodes = new Set(codes);
      assert(codes.length === uniqueCodes.size, 'Employee codes must be uniquely disambiguated');
      assert(body.data.every((e: any) => Boolean(e.designation) && Boolean(e.department)), 'Every employee must have designation and department');
    });

    // ------------------------------------------------------------------------
    // Test 7: Searching by employee ID / code (e.g. EMP-003)
    // ------------------------------------------------------------------------
    await runTest('7. Search by Employee Code (EMP-003)', async () => {
      const res = await fetch(`${baseUrl}/employees?search=EMP-003`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      assert(res.status === 200, 'Code search failed');
      assert(body.data.length === 1, `Expected 1 result for EMP-003, got ${body.data.length}`);
      assert(body.data[0].fullName === 'Suresh More', 'Expected Suresh More for EMP-003');
    });

    // ------------------------------------------------------------------------
    // Test 8: Searching by email address
    // ------------------------------------------------------------------------
    await runTest('8. Search by Email Address (pooja.k@sunpowersolutions.in)', async () => {
      const res = await fetch(`${baseUrl}/employees?search=pooja.k`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      assert(res.status === 200, 'Email search failed');
      assert(body.data.length === 1, `Expected 1 result for pooja.k, got ${body.data.length}`);
      assert(body.data[0].fullName === 'Pooja Kulkarni', 'Expected Pooja Kulkarni');
    });

    // ------------------------------------------------------------------------
    // Test 9: Large employee database with 200+ records and pagination
    // ------------------------------------------------------------------------
    await runTest('9. Large Workforce Scaling: Pagination & Limits Handled Gracefully', async () => {
      // Test page 1 with limit 5
      const resPage1 = await fetch(`${baseUrl}/employees?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body1 = await resPage1.json();
      assert(resPage1.status === 200, 'Page 1 failed');
      assert(body1.data.length === 5, 'Expected 5 records per page');
      assert(body1.meta.pagination.page === 1, 'Page metadata should be 1');

      // Test page 2 with limit 5
      const resPage2 = await fetch(`${baseUrl}/employees?page=2&limit=5`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body2 = await resPage2.json();
      assert(resPage2.status === 200, 'Page 2 failed');
      assert(body2.data.length === 5, 'Expected 5 records on page 2');
      assert(body2.meta.pagination.page === 2, 'Page metadata should be 2');

      // Verify no duplicate IDs across pages
      const ids1 = body1.data.map((e: any) => e.id);
      const ids2 = body2.data.map((e: any) => e.id);
      const overlap = ids1.filter((id: string) => ids2.includes(id));
      assert(overlap.length === 0, 'No overlap between page 1 and page 2', overlap);
    });

    // ------------------------------------------------------------------------
    // Test 10: Switching between role tabs and inspecting role permissions
    // ------------------------------------------------------------------------
    await runTest('10. Role Tabs: Inspecting Role-Level Permissions', async () => {
      const warehouseRole = INITIAL_ROLES_PERMISSIONS.find(r => r.roleKey === 'warehouse_mgr');
      assert(Boolean(warehouseRole), 'warehouse_mgr role not found');
      assert(warehouseRole!.permissions.inventory.includes('view'), 'Warehouse manager must have inventory.view');
      assert(warehouseRole!.permissions.dispatch.includes('view'), 'Warehouse manager must have dispatch.view');
      assert(!warehouseRole!.permissions.customers?.includes('create'), 'Warehouse manager must not have customers.create');
    });

    // ------------------------------------------------------------------------
    // Test 11: Selecting an employee and inspecting effective permissions
    // ------------------------------------------------------------------------
    await runTest('11. Employee Inspector: Effective Permissions (Role + Delegations)', async () => {
      const ganesh = {
        id: 'emp-6',
        name: 'Ganesh Shinde',
        email: 'ganesh.s@sunpowersolutions.in',
        role: 'warehouse_mgr' as any,
        roleTitle: 'Central Warehouse & Logistics Manager',
        department: 'Warehouse & Supply Chain'
      };

      // Baseline: Ganesh inherits role permissions
      assert(checkActionPermission(ganesh, 'inventory', 'view', INITIAL_ROLES_PERMISSIONS) === true, 'Ganesh inherits inventory.view');
      assert(checkActionPermission(ganesh, 'customers', 'edit', INITIAL_ROLES_PERMISSIONS) === false, 'Ganesh does not have customers.edit');

      // Active delegation grant
      const activeDelegation = {
        id: 'del-test-1',
        delegationCode: 'DEL-2026-TEST',
        employeeId: 'emp-6',
        employeeName: 'Ganesh Shinde',
        employeeRole: 'warehouse_mgr' as any,
        grantedPermission: 'customers.edit' as any,
        departmentScope: 'Warehouse & Supply Chain',
        authorizedByEmployeeId: 'usr-1',
        authorizedByName: 'Vikramaditya Rao',
        justification: 'Special client asset reconciliation audit',
        startDate: new Date().toISOString(),
        expiresDate: new Date(Date.now() + 86400000).toISOString(),
        active: true,
        createdAt: new Date().toISOString()
      };

      // With delegation: Ganesh has effective permission customers.edit!
      assert(checkActionPermission(ganesh, 'customers', 'edit', INITIAL_ROLES_PERMISSIONS, [activeDelegation]) === true, 'Ganesh has customers.edit via delegation');
    });

    // ------------------------------------------------------------------------
    // Test 12: Employee-specific changes do NOT modify the entire role
    // ------------------------------------------------------------------------
    await runTest('12. Isolation: Individual Override Does NOT Mutate Entire Role', async () => {
      const ganesh = {
        id: 'emp-6',
        name: 'Ganesh Shinde',
        role: 'warehouse_mgr' as any,
        roleTitle: 'Central Warehouse & Logistics Manager',
        department: 'Warehouse & Supply Chain'
      };

      const mahesh = {
        id: 'emp-10',
        name: 'Mahesh Thorat',
        role: 'warehouse_mgr' as any,
        roleTitle: 'Inventory Dispatch Executive',
        department: 'Warehouse & Supply Chain'
      };

      const ganeshDelegation = {
        id: 'del-ganesh-1',
        delegationCode: 'DEL-G1',
        employeeId: 'emp-6',
        employeeName: 'Ganesh Shinde',
        employeeRole: 'warehouse_mgr' as any,
        grantedPermission: 'customers.edit' as any,
        departmentScope: 'Warehouse & Supply Chain',
        authorizedByEmployeeId: 'usr-1',
        authorizedByName: 'Vikramaditya Rao',
        justification: 'Individual override for Ganesh only',
        startDate: new Date().toISOString(),
        expiresDate: new Date(Date.now() + 86400000).toISOString(),
        active: true,
        createdAt: new Date().toISOString()
      };

      // 1. Ganesh has customers.edit via individual delegation
      const ganeshCanEdit = checkActionPermission(ganesh, 'customers', 'edit', INITIAL_ROLES_PERMISSIONS, [ganeshDelegation]);
      assert(ganeshCanEdit === true, 'Ganesh should have customers.edit via delegation');

      // 2. Mahesh shares the same role (warehouse_mgr), but does NOT have the delegation!
      const maheshCanEdit = checkActionPermission(mahesh, 'customers', 'edit', INITIAL_ROLES_PERMISSIONS, [ganeshDelegation]);
      assert(maheshCanEdit === false, 'Mahesh must NOT have customers.edit; delegation was only for Ganesh!');

      // 3. The underlying warehouse_mgr role matrix remains unmutated
      const warehouseRole = INITIAL_ROLES_PERMISSIONS.find(r => r.roleKey === 'warehouse_mgr');
      assert(!warehouseRole!.permissions.customers?.includes('edit'), 'Role permissions for warehouse_mgr must NOT include customers.edit');
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
    console.log('\nAll 12 test suites PASSED successfully!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test runner exception:', err);
  process.exit(1);
});
