import dotenv from 'dotenv';
dotenv.config();
import { app } from '../src/app';
import { Server } from 'http';
import { pool } from '../src/db/prisma';

async function main() {
  console.log('======================================================');
  console.log('TESTING SOLAROS LIVE HTTP API ENDPOINTS');
  console.log('======================================================\n');

  const server: Server = await new Promise(resolve => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

  try {
    // 1. Login
    console.log('1. Attempting Login as Owner...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vikram.rao@sunpowersolutions.in',
        password: 'solaros2026',
        rememberMe: true
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status, loginData.success ? 'SUCCESS' : 'FAILED');
    if (!loginData.success) {
      console.error('Login error:', loginData);
      process.exit(1);
    }
    const token = loginData.data?.accessToken || loginData.data?.token;
    console.log('Obtained token:', token ? token.substring(0, 25) + '...' : 'NONE');

    // 2. Fetch Employees
    console.log('\n2. Fetching /employees?limit=250...');
    const empRes = await fetch(`${baseUrl}/employees?limit=250`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const empData = await empRes.json();
    console.log('Employees HTTP Status:', empRes.status);
    console.log('Employees Success:', empData.success);
    console.log('Employees Data Count:', Array.isArray(empData.data) ? empData.data.length : 'NOT ARRAY');
    console.log('Employees Pagination Total:', empData.meta?.pagination?.total);

    // 3. Fetch Customers
    console.log('\n3. Fetching /customers...');
    const custRes = await fetch(`${baseUrl}/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const custData = await custRes.json();
    console.log('Customers HTTP Status:', custRes.status);
    console.log('Customers Success:', custData.success);
    console.log('Customers Data Count:', Array.isArray(custData.data) ? custData.data.length : 'NOT ARRAY');
    console.log('Customers Meta Total:', custData.meta?.total);

    // 4. Fetch Departments
    console.log('\n4. Fetching /employees/departments...');
    const deptRes = await fetch(`${baseUrl}/employees/departments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const deptData = await deptRes.json();
    console.log('Departments HTTP Status:', deptRes.status);
    console.log('Departments Count:', Array.isArray(deptData.data) ? deptData.data.length : 'NOT ARRAY');
    console.log('Departments:', deptData.data?.map((d: any) => `${d.name} (${d.employeeCount})`));

    console.log('\n======================================================');
    console.log('ALL API ENDPOINT CHECKS COMPLETE');
    console.log('======================================================');
  } finally {
    server.close();
    await pool.end();
  }
}

main().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
