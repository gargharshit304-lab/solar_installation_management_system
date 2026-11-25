import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import jwt from 'jsonwebtoken';
import http from 'http';
import { app } from '../src/app';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'solaros_access_secret_sunpower_solutions_2026_super_secure_key';

function createTestToken(role = 'owner_admin'): string {
  return jwt.sign(
    {
      sub: 'usr-test-owner',
      name: 'Vikram Rao',
      email: 'vikram.rao@sunpowersolutions.in',
      role,
      roleTitle: 'Managing Director & Owner'
    },
    JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );
}

async function main() {
  console.log('===============================================================');
  console.log('SOLAROS LIVE HTTP ENDPOINTS PAGINATION VERIFICATION');
  console.log('===============================================================\n');

  // Start temporary test server on random port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  const token = createTestToken('owner_admin');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  try {
    // 1. Customers pagination
    console.log('Testing GET /customers with pagination...');
    const custRes = await fetch(`${baseUrl}/customers?page=1&pageSize=10`, { headers });
    const custJson: any = await custRes.json();
    assert(custRes.status === 200, 'GET /customers returned HTTP 200');
    assert(Array.isArray(custJson.data), 'GET /customers data is an array');
    assert(custJson.data.length <= 10, `GET /customers returned ${custJson.data.length} records (<= 10)`);
    assert(custJson.meta?.pagination?.page === 1, 'GET /customers pagination.page is 1');
    assert(custJson.meta?.pagination?.pageSize === 10, 'GET /customers pagination.pageSize is 10');
    assert(typeof custJson.meta?.pagination?.totalRecords === 'number', 'GET /customers has totalRecords count');

    // 2. Orders pagination
    console.log('\nTesting GET /orders with pagination...');
    const ordRes = await fetch(`${baseUrl}/orders?page=1&pageSize=10`, { headers });
    const ordJson: any = await ordRes.json();
    if (ordRes.status !== 200) {
      console.error('GET /orders failed with status:', ordRes.status, 'body:', ordJson);
    }
    assert(ordRes.status === 200, 'GET /orders returned HTTP 200');
    assert(Array.isArray(ordJson.data), 'GET /orders data is an array');
    assert(ordJson.meta?.pagination?.pageSize === 10, 'GET /orders pagination.pageSize is 10');

    // 3. Inventory pagination
    console.log('\nTesting GET /inventory with pagination...');
    const invRes = await fetch(`${baseUrl}/inventory?page=1&pageSize=2`, { headers });
    const invJson: any = await invRes.json();
    assert(invRes.status === 200, 'GET /inventory returned HTTP 200');
    assert(Array.isArray(invJson.data), 'GET /inventory data is an array');
    assert(invJson.data.length <= 2, `GET /inventory returned ${invJson.data.length} records (<= 2)`);
    assert(invJson.meta?.pagination?.pageSize === 2, 'GET /inventory pagination.pageSize is 2');

    // 4. Finance transactions pagination
    console.log('\nTesting GET /finance/transactions with pagination...');
    const finRes = await fetch(`${baseUrl}/finance/transactions?page=1&pageSize=5`, { headers });
    const finJson: any = await finRes.json();
    assert(finRes.status === 200, 'GET /finance/transactions returned HTTP 200');
    assert(Array.isArray(finJson.data), 'GET /finance/transactions data is an array');
    assert(finJson.data.length <= 5, 'GET /finance/transactions returned <= 5 records');
    assert(finJson.meta?.pagination?.pageSize === 5, 'GET /finance/transactions pagination.pageSize is 5');

    // 5. Surveys pagination
    console.log('\nTesting GET /surveys with pagination...');
    const survRes = await fetch(`${baseUrl}/surveys?page=1&pageSize=3`, { headers });
    const survJson: any = await survRes.json();
    assert(survRes.status === 200, 'GET /surveys returned HTTP 200');
    assert(Array.isArray(survJson.data), 'GET /surveys data is an array');
    assert(survJson.data.length <= 3, 'GET /surveys returned <= 3 records');
    assert(survJson.meta?.pagination?.pageSize === 3, 'GET /surveys pagination.pageSize is 3');

    // 6. Installations pagination
    console.log('\nTesting GET /installations with pagination...');
    const instRes = await fetch(`${baseUrl}/installations?page=1&pageSize=10`, { headers });
    const instJson: any = await instRes.json();
    assert(instRes.status === 200, 'GET /installations returned HTTP 200');
    assert(Array.isArray(instJson.data), 'GET /installations data is an array');
    assert(instJson.meta?.pagination !== undefined, 'GET /installations returns pagination meta');

    // 7. Dispatch pagination
    console.log('\nTesting GET /dispatch with pagination...');
    const dspRes = await fetch(`${baseUrl}/dispatch?page=1&pageSize=10`, { headers });
    const dspJson: any = await dspRes.json();
    assert(dspRes.status === 200, 'GET /dispatch returned HTTP 200');
    assert(Array.isArray(dspJson.data), 'GET /dispatch data is an array');
    assert(dspJson.meta?.pagination !== undefined, 'GET /dispatch returns pagination meta');

    // 8. Audit logs pagination
    console.log('\nTesting GET /audit-logs with pagination...');
    const audRes = await fetch(`${baseUrl}/audit-logs?page=1&limit=5`, { headers });
    const audJson: any = await audRes.json();
    assert(audRes.status === 200, 'GET /audit-logs returned HTTP 200');
    assert(Array.isArray(audJson.data), 'GET /audit-logs data is an array');
    assert(audJson.meta?.pagination?.pageSize === 5, 'GET /audit-logs pagination.pageSize is 5');

    // 9. Owner Superadmin Unrestricted Access (no 403)
    console.log('\nTesting Owner Superadmin Unrestricted Access...');
    const rolesRes = await fetch(`${baseUrl}/rbac/roles`, { headers });
    assert(rolesRes.status === 200, 'Owner can access /rbac/roles with 200 OK');

    const deptsRes = await fetch(`${baseUrl}/employees/departments`, { headers });
    assert(deptsRes.status === 200, 'Owner can access /employees/departments with 200 OK');

    console.log('\n===============================================================');
    console.log(`TOTAL HTTP CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('===============================================================');

  } finally {
    server.close();
  }

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
