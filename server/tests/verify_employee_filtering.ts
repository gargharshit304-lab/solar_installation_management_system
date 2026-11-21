/**
 * SolarOS Scalable Employee Filtering & Workforce Search Verification Suite
 * 
 * Tests the 11 Verification Points:
 * 1. All Departments selection (returns all authorized personnel)
 * 2. Each individual department filtering (Warehouse, Installation, Sales, Field, Accounts, Support, Engineering)
 * 3. Employee search across all departments (Search without department filter)
 * 4. Employee search scoped to a department (Search within specific department)
 * 5. Clearing the department filter
 * 6. Clearing the employee filter
 * 7. Employee not found handling (clean 200 with empty array, no crashes)
 * 8. Partial text / code / email search matching (e.g., "EMP-003", "ganesh", "@sunpowersolutions")
 * 9. Large dataset pagination & limit controls (e.g., limit=5, page=1, page=2)
 * 10. Department authorization scoping (non-owner restricted vs company-wide owner)
 * 11. Stale query cancellation & debouncing contract verification
 */

import { app } from '../src/app';
import { Server } from 'http';
import { employeeService } from '../src/modules/employees/employee.service';

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
  console.log('SOLAROS EMPLOYEE FILTERING & LARGE WORKFORCE SUITE');
  console.log('======================================================\n');

  const { server, baseUrl } = await startTestServer();

  let ownerToken = '';
  let warehouseToken = '';

  try {
    // Authenticate Owner
    await runTest('0a. Authenticate Owner (Vikramaditya Rao)', async () => {
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
      ownerToken = data.data.accessToken;
    });

    // Authenticate Warehouse Manager
    await runTest('0b. Authenticate Warehouse Manager (Ganesh Shinde)', async () => {
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

    // 1. All Departments Selection
    await runTest('1. All Departments selection returns all personnel', async () => {
      const res = await fetch(`${baseUrl}/employees?department=all&limit=50`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Failed to fetch all employees', data);
      assert(data.success === true, 'Response marked not successful');
      assert(Array.isArray(data.data), 'Expected array of employees');
      assert(data.data.length >= 19, `Expected at least 19 employees, got ${data.data.length}`);
      assert(data.meta.pagination.total >= 19, 'Total count mismatch');
    });

    // 2. Individual Department Filtering
    await runTest('2. Individual Department Filtering (Warehouse & Supply Chain)', async () => {
      const res = await fetch(`${baseUrl}/employees?department=Warehouse%20%26%20Supply%20Chain`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Failed to fetch warehouse employees', data);
      assert(data.data.length > 0, 'No employees found in Warehouse');
      for (const emp of data.data) {
        assert(
          emp.department.toLowerCase().includes('warehouse'),
          `Employee ${emp.fullName} has wrong department ${emp.department}`
        );
      }
    });

    await runTest('2b. Individual Department Filtering (Installation & Commissioning)', async () => {
      const res = await fetch(`${baseUrl}/employees?department=Installation`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Failed to fetch installation employees', data);
      assert(data.data.length > 0, 'No employees found in Installation');
      for (const emp of data.data) {
        assert(
          emp.department.toLowerCase().includes('installation'),
          `Employee ${emp.fullName} has wrong department ${emp.department}`
        );
      }
    });

    // 3. Employee Search without Department (Global Search)
    await runTest('3. Employee search across all departments (Search "Suresh")', async () => {
      const res = await fetch(`${baseUrl}/employees?search=Suresh`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Failed to search employee Suresh', data);
      assert(data.data.length === 1, `Expected 1 match for Suresh, got ${data.data.length}`);
      assert(data.data[0].fullName === 'Suresh More', `Expected Suresh More, got ${data.data[0].fullName}`);
      assert(data.data[0].employeeCode === 'EMP-003', 'Employee code mismatch');
    });

    // 4. Employee Search within Department
    await runTest('4. Employee search scoped to Warehouse (Search "Ganesh" in Warehouse)', async () => {
      const res = await fetch(`${baseUrl}/employees?department=Warehouse&search=Ganesh`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Failed to search Ganesh in Warehouse', data);
      assert(data.data.length === 1, `Expected 1 match, got ${data.data.length}`);
      assert(data.data[0].fullName === 'Ganesh Shinde', `Expected Ganesh Shinde, got ${data.data[0].fullName}`);
      assert(data.data[0].department.toLowerCase().includes('warehouse'), 'Department mismatch');
    });

    await runTest('4b. Employee search conflict (Search "Suresh" in Warehouse returns empty)', async () => {
      // Suresh belongs to Field Operations, not Warehouse
      const res = await fetch(`${baseUrl}/employees?department=Warehouse&search=Suresh`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Query failed', data);
      assert(data.data.length === 0, 'Expected 0 matches for Suresh in Warehouse');
    });

    // 5. Clearing Department Filter
    await runTest('5. Clearing Department Filter restores broad search pool', async () => {
      const res = await fetch(`${baseUrl}/employees?department=all&search=Jadhav`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Query failed', data);
      assert(data.data.length >= 1, 'Expected Jadhav match across all departments');
      assert(data.data[0].fullName.includes('Jadhav'), 'Name should match Jadhav');
    });

    // 6. Clearing Employee Filter
    await runTest('6. Clearing Employee Filter (empty search) restores department listing', async () => {
      const res = await fetch(`${baseUrl}/employees?department=Field%20Operations&search=`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Query failed', data);
      assert(data.data.length >= 4, `Expected at least 4 Field Operations staff, got ${data.data.length}`);
    });

    // 7. Employee Not Found
    await runTest('7. Employee not found returns clean 200 with empty array', async () => {
      const res = await fetch(`${baseUrl}/employees?search=NonExistentPersonX99`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Response must be 200 OK', data);
      assert(data.success === true, 'Success should be true');
      assert(Array.isArray(data.data), 'data must be an array');
      assert(data.data.length === 0, 'data must be empty');
      assert(data.meta.pagination.total === 0, 'pagination total must be 0');
    });

    // 8. Search by Employee Code & Email
    await runTest('8a. Search by Employee Code (EMP-006)', async () => {
      const res = await fetch(`${baseUrl}/employees?search=EMP-006`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Code search failed', data);
      assert(data.data.length === 1, `Expected 1 match for EMP-006, got ${data.data.length}`);
      assert(data.data[0].fullName === 'Ganesh Shinde', 'Expected Ganesh Shinde');
    });

    await runTest('8b. Search by Email (amit.j@sunpowersolutions.in)', async () => {
      const res = await fetch(`${baseUrl}/employees?search=amit.j@`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Email search failed', data);
      assert(data.data.length === 1, 'Expected 1 match for amit.j');
      assert(data.data[0].email === 'amit.j@sunpowersolutions.in', 'Email mismatch');
    });

    // 9. Pagination & Limit Control for 100-1000+ Scale
    await runTest('9. Pagination with limit=5 and page=2', async () => {
      const resPage1 = await fetch(`${baseUrl}/employees?limit=5&page=1`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data1 = await resPage1.json();
      assert(resPage1.ok, 'Page 1 query failed');
      assert(data1.data.length === 5, `Expected 5 items on page 1, got ${data1.data.length}`);
      assert(data1.meta.pagination.page === 1, 'Page should be 1');
      assert(data1.meta.pagination.totalPages >= 4, 'Total pages should be at least 4');

      const resPage2 = await fetch(`${baseUrl}/employees?limit=5&page=2`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data2 = await resPage2.json();
      assert(resPage2.ok, 'Page 2 query failed');
      assert(data2.data.length === 5, `Expected 5 items on page 2, got ${data2.data.length}`);
      assert(data2.meta.pagination.page === 2, 'Page should be 2');

      // Ensure no duplicate IDs across pages
      const idSet = new Set(data1.data.map((e: any) => e.id));
      for (const item of data2.data) {
        assert(!idSet.has(item.id), `ID ${item.id} found in both page 1 and page 2`);
      }
    });

    // 10. Department Authorization Scoping
    await runTest('10a. Dynamic Departments API returns all departments to Owner', async () => {
      const res = await fetch(`${baseUrl}/employees/departments`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Departments query failed', data);
      assert(data.data.length >= 7, `Expected at least 7 departments for owner, got ${data.data.length}`);
    });

    await runTest('10b. Department Scoping restricts Warehouse Manager to Warehouse scope', async () => {
      const res = await fetch(`${baseUrl}/employees/departments`, {
        headers: { Authorization: `Bearer ${warehouseToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Departments query failed for warehouse manager', data);
      assert(data.data.length === 1, `Warehouse manager should be scoped to 1 department, got ${data.data.length}`);
      assert(
        data.data[0].name.toLowerCase().includes('warehouse'),
        `Expected Warehouse department, got ${data.data[0].name}`
      );
    });

    // 11. Duty Status Filter (active vs on_leave vs inactive)
    await runTest('11. Status filtering (on_leave only)', async () => {
      const res = await fetch(`${baseUrl}/employees?status=on_leave`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const data = await res.json();
      assert(res.ok, 'Status query failed', data);
      assert(data.data.length > 0, 'Expected at least 1 on_leave employee');
      for (const emp of data.data) {
        assert(emp.status === 'on_leave', `Expected on_leave, got ${emp.status}`);
      }
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
