import dotenv from 'dotenv';
dotenv.config();
import { employeeService } from '../src/modules/employees/employee.service';
import { pool } from '../src/db/prisma';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('======================================================');
  console.log('SOLAROS EMPLOYEE REGISTRATION & SUPABASE AUDIT SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  const testUser = {
    id: 'usr-1',
    name: 'Vikramaditya Rao',
    role: 'owner_admin',
    department: 'Executive Management'
  };

  const testEmpCode = `EMP-TEST-${Date.now().toString().slice(-4)}`;
  const testEmail = `rahul.deshmukh.${Date.now()}@sunpowersolutions.in`;

  try {
    // TEST 1: Verification of Total Seeded Employee Count (Phase 7)
    console.log('• Test 1: Verify PostgreSQL Employee Count (Resolves 20 vs 61 discrepancy)...');
    const searchRes = await employeeService.searchEmployees(testUser, { limit: 250 });
    console.log(`  Database employees returned: ${searchRes.employees.length}`);
    console.log(`  Total in pagination: ${searchRes.pagination.total}`);
    assert(searchRes.employees.length >= 61, `Returns all seeded employees (>= 61, actual: ${searchRes.employees.length})`);
    assert(searchRes.pagination.total >= 61, `Pagination total reflects all employees (>= 61, actual: ${searchRes.pagination.total})`);

    // TEST 2: Successful Employee Registration (Phase 2 & 3)
    console.log('\n• Test 2: Register New Employee with Full Relational Integrity...');
    const createdEmp = await employeeService.createEmployee(testUser, {
      fullName: 'Rahul Deshmukh',
      employeeCode: testEmpCode,
      email: testEmail,
      phone: '+91 98221 55667',
      department: 'Operations & Installations',
      designation: 'Senior Solar Commissioning Engineer',
      role: 'install_tech',
      hourlyRate: 350,
      skills: ['Three-Phase Inverters', 'HT/LT Wiring', 'Safety Auditing']
    });

    console.log('  Created Employee ID:', createdEmp.id);
    console.log('  Generated Temporary Password:', createdEmp.temporaryPassword);
    assert(!!createdEmp.id, 'Employee record has valid UUID');
    assert(createdEmp.employeeCode === testEmpCode, `Employee code matches (${testEmpCode})`);
    assert(createdEmp.fullName === 'Rahul Deshmukh', 'Full name matches');
    assert(createdEmp.email === testEmail, 'Email matches');
    assert(createdEmp.role === 'install_tech', 'Role matches install_tech');
    assert(typeof createdEmp.temporaryPassword === 'string' && createdEmp.temporaryPassword.length >= 8, 'Generated secure temporary password');

    // TEST 3: Verify Persistence in Supabase PostgreSQL (Profiles, Employees, Passwords)
    console.log('\n• Test 3: Verify Supabase Database Records & Password Security...');
    const client = await pool.connect();
    try {
      const empDb = await client.query('SELECT * FROM employees WHERE id = $1', [createdEmp.id]);
      assert(empDb.rowCount === 1, 'Employee found in Supabase employees table');
      assert(empDb.rows[0].department === 'Operations & Installations', 'Department accurately stored');

      const profDb = await client.query('SELECT * FROM profiles WHERE id = $1', [empDb.rows[0].profile_id]);
      assert(profDb.rowCount === 1, 'Profile record linked via profile_id foreign key');
      assert(profDb.rows[0].role_id === 'install_tech', 'Profile has canonical role_id');

      const passwordHash = profDb.rows[0].password_hash;
      assert(!!passwordHash && passwordHash.startsWith('$2'), 'Password stored as bcrypt hash ($2)');
      const passwordValid = await bcrypt.compare(createdEmp.temporaryPassword, passwordHash);
      assert(passwordValid, 'Temporary password verifies cleanly against bcrypt hash');

      // Check auth.users linkage
      if (profDb.rows[0].auth_user_id) {
        const authDb = await client.query('SELECT id, email FROM auth.users WHERE id = $1', [profDb.rows[0].auth_user_id]);
        assert(authDb.rowCount === 1, 'Supabase Auth user linked to profile');
      }
    } finally {
      client.release();
    }

    // TEST 4: Duplicate Employee Code Validation (409 Conflict)
    console.log('\n• Test 4: Verify Duplicate Employee Code Rejection (409 Conflict)...');
    try {
      await employeeService.createEmployee(testUser, {
        fullName: 'Another Person',
        employeeCode: testEmpCode, // Duplicate!
        email: `another.${Date.now()}@sunpowerdemo.in`,
        phone: '+91 99999 00000',
        department: 'Sales & Business Development',
        designation: 'Sales Executive',
        role: 'sales_exec'
      });
      assert(false, 'Should have rejected duplicate employee code');
    } catch (err: any) {
      assert(err.statusCode === 409 && err.code === 'DUPLICATE_EMPLOYEE_CODE', 'Rejected duplicate employee code with 409 DUPLICATE_EMPLOYEE_CODE');
    }

    // TEST 5: Duplicate Email Validation (409 Conflict)
    console.log('\n• Test 5: Verify Duplicate Email Rejection (409 Conflict)...');
    try {
      await employeeService.createEmployee(testUser, {
        fullName: 'Another Person',
        employeeCode: `EMP-DIFF-${Date.now().toString().slice(-4)}`,
        email: testEmail, // Duplicate!
        phone: '+91 99999 00000',
        department: 'Sales & Business Development',
        designation: 'Sales Executive',
        role: 'sales_exec'
      });
      assert(false, 'Should have rejected duplicate email');
    } catch (err: any) {
      assert(err.statusCode === 409 && err.code === 'DUPLICATE_EMAIL', 'Rejected duplicate email with 409 DUPLICATE_EMAIL');
    }

    // TEST 6: Validation Failures (422 Unprocessable Entity)
    console.log('\n• Test 6: Verify Form Validation Failures (422)...');
    try {
      await employeeService.createEmployee(testUser, {
        fullName: 'A', // Too short
        employeeCode: 'X',
        email: 'invalid-email',
        phone: '12',
        department: '',
        designation: '',
        role: 'invalid_role_xyz' as any,
        hourlyRate: -50 // Negative rate
      });
      assert(false, 'Should have rejected invalid fields');
    } catch (err: any) {
      assert(err.statusCode === 422, 'Rejected invalid payload with 422 VALIDATION_ERROR');
    }

    // Clean up test employee
    console.log('\n• Cleaning up test employee record...');
    const cleanupClient = await pool.connect();
    try {
      await cleanupClient.query('DELETE FROM employees WHERE employee_code = $1', [testEmpCode]);
      await cleanupClient.query('DELETE FROM profiles WHERE email = $1', [testEmail]);
      await cleanupClient.query('DELETE FROM auth.users WHERE email = $1', [testEmail]);
      console.log('✅ Cleaned up test record');
    } finally {
      cleanupClient.release();
    }

  } catch (err: any) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    await pool.end();
  }

  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
