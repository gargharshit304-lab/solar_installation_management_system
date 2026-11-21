import { app } from '../src/app';
import http from 'http';
import { AddressInfo } from 'net';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪  SolarOS Backend Foundation Automated Test Suite');
  console.log('====================================================');

  const server = http.createServer(app);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  let passedTests = 0;
  let totalTests = 0;

  async function test(name: string, fn: () => Promise<void>) {
    totalTests++;
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passedTests++;
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`, err.cause || '');
    }
  }

  try {
    let ownerToken = '';
    let ownerRefreshToken = '';
    let salesToken = '';
    let installerToken = '';

    // 1. Health Endpoints
    await test('Health check returns 200 with system metadata', async () => {
      const res = await fetch(`${baseUrl}/health`);
      const body = await res.json();
      if (res.status !== 200 || body.data.status !== 'healthy') {
        throw new Error(`Expected 200 and healthy status, got ${res.status}`);
      }
      if (!body.meta?.requestId) throw new Error('Missing requestId in meta');
    });

    await test('Database health check probe returns engine status', async () => {
      const res = await fetch(`${baseUrl}/health/db`);
      const body = await res.json();
      if (!body.data?.engine) throw new Error('Missing database engine in response');
    });

    // 2. Authentication Flow
    await test('Login with valid Owner credentials succeeds & issues JWT + Cookie', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vikram.rao@sunpowersolutions.in',
          password: 'solaros2026',
          rememberMe: true
        })
      });
      const body = await res.json();
      if (res.status !== 200 || !body.success) {
        throw new Error(`Login failed with status ${res.status}: ${body.error?.message}`);
      }
      if (!body.data.accessToken || !body.data.refreshToken) {
        throw new Error('Access or refresh token missing');
      }
      ownerToken = body.data.accessToken;
      ownerRefreshToken = body.data.refreshToken;

      // Check cookie header
      const setCookie = res.headers.get('set-cookie');
      if (!setCookie || !setCookie.includes('solaros_session_token')) {
        throw new Error('solaros_session_token HttpOnly cookie was not set');
      }
    });

    await test('Login with invalid password returns 401 INVALID_CREDENTIALS', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vikram.rao@sunpowersolutions.in',
          password: 'wrong_password_123'
        })
      });
      const body = await res.json();
      if (res.status !== 401 || body.error?.code !== 'INVALID_CREDENTIALS') {
        throw new Error(`Expected 401 INVALID_CREDENTIALS, got ${res.status}`);
      }
    });

    await test('Login with Sales Executive credentials succeeds', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'pooja.k@sunpowersolutions.in',
          password: 'solaros2026'
        })
      });
      const body = await res.json();
      salesToken = body.data.accessToken;
      if (body.data.user.role !== 'sales_exec') {
        throw new Error(`Expected role sales_exec, got ${body.data.user.role}`);
      }
    });

    await test('Login with Installation Technician credentials succeeds', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'amit.j@sunpowersolutions.in',
          password: 'solaros2026'
        })
      });
      const body = await res.json();
      installerToken = body.data.accessToken;
      if (body.data.user.role !== 'install_tech') {
        throw new Error(`Expected role install_tech, got ${body.data.user.role}`);
      }
    });

    // 3. Session Verification & Token Rotation
    await test('Get active session with Bearer token restores user profile', async () => {
      const res = await fetch(`${baseUrl}/auth/session`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      if (res.status !== 200 || !body.data.authenticated) {
        throw new Error(`Expected active session, got ${res.status}`);
      }
      if (body.data.user.email !== 'vikram.rao@sunpowersolutions.in') {
        throw new Error('User profile email mismatch');
      }
    });

    await test('Refresh session rotates access and refresh tokens', async () => {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: ownerRefreshToken })
      });
      const body = await res.json();
      if (res.status !== 200 || !body.data.accessToken || !body.data.refreshToken) {
        throw new Error(`Refresh failed: ${body.error?.message}`);
      }
      ownerToken = body.data.accessToken;
      ownerRefreshToken = body.data.refreshToken;
    });

    // 4. Role-Based Access Control & Capability Separation
    await test('Get role definitions returns all 8 roles with authoritative capabilities', async () => {
      const res = await fetch(`${baseUrl}/rbac/roles`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      if (res.status !== 200 || body.data.length !== 8) {
        throw new Error(`Expected 8 roles, got ${body.data.length}`);
      }
    });

    await test('Audit logs endpoint accessible to Owner Admin (200)', async () => {
      const res = await fetch(`${baseUrl}/audit-logs`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      if (res.status !== 200 || !Array.isArray(body.data)) {
        throw new Error(`Expected 200 and audit array, got ${res.status}`);
      }
      if (body.data.length === 0) {
        throw new Error('Expected audit log entries from logins');
      }
    });

    await test('Audit logs endpoint blocked for Sales Executive with 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/audit-logs`, {
        headers: { Authorization: `Bearer ${salesToken}` }
      });
      const body = await res.json();
      if (res.status !== 403 || body.error?.code !== 'INSUFFICIENT_ROLE_PERMISSIONS') {
        throw new Error(`Expected 403 INSUFFICIENT_ROLE_PERMISSIONS, got ${res.status}`);
      }
    });

    // 5. Operational Delegations Governance
    await test('Owner Admin can create and assign an operational delegation', async () => {
      const res = await fetch(`${baseUrl}/rbac/delegations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`
        },
        body: JSON.stringify({
          employeeId: 'usr-5',
          employeeName: 'Amit Jadhav',
          grantedPermission: 'installations.execute',
          departmentScope: 'Operations',
          justification: 'Assigned for emergency industrial site commissioning in Bhosari',
          effectiveFrom: '2026-01-01',
          effectiveTo: '2026-12-31'
        })
      });
      const body = await res.json();
      if (res.status !== 201 || !body.data.delegationCode) {
        throw new Error(`Delegation creation failed: ${body.error?.message}`);
      }
    });

    await test('Sales Executive cannot create an operational delegation (403)', async () => {
      const res = await fetch(`${baseUrl}/rbac/delegations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${salesToken}`
        },
        body: JSON.stringify({
          employeeId: 'usr-3',
          employeeName: 'Suresh More',
          grantedPermission: 'inventory.adjust',
          departmentScope: 'Warehouse',
          justification: 'Unauthorized delegation attempt',
          effectiveFrom: '2026-01-01',
          effectiveTo: '2026-12-31'
        })
      });
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${res.status}`);
      }
    });

    // 6. Account Deactivation
    await test('Deactivating account revokes access and returns 403 on subsequent requests', async () => {
      // Deactivate sales account usr-2
      const deactRes = await fetch(`${baseUrl}/users/usr-2/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`
        },
        body: JSON.stringify({ active: false })
      });
      if (deactRes.status !== 200) throw new Error('Failed to deactivate user');

      // Now attempt to make an authenticated request using salesToken
      const testRes = await fetch(`${baseUrl}/auth/session`, {
        headers: { Authorization: `Bearer ${salesToken}` }
      });
      const body = await testRes.json();
      if (testRes.status !== 403 || body.error?.code !== 'ACCOUNT_DEACTIVATED') {
        throw new Error(`Expected 403 ACCOUNT_DEACTIVATED, got ${testRes.status}`);
      }

      // Re-activate sales account for cleanup
      await fetch(`${baseUrl}/users/usr-2/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`
        },
        body: JSON.stringify({ active: true })
      });
    });

    // 7. Validation & Error Handling
    await test('Zod validation middleware rejects invalid email with 422', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'solaros2026'
        })
      });
      const body = await res.json();
      if (res.status !== 422 || body.error?.code !== 'VALIDATION_ERROR') {
        throw new Error(`Expected 422 VALIDATION_ERROR, got ${res.status}`);
      }
    });

    await test('Non-existent route returns standard 404 ROUTE_NOT_FOUND error', async () => {
      const res = await fetch(`${baseUrl}/unknown-resource`);
      const body = await res.json();
      if (res.status !== 404 || body.error?.code !== 'ROUTE_NOT_FOUND') {
        throw new Error(`Expected 404 ROUTE_NOT_FOUND, got ${res.status}`);
      }
    });

    // 8. Logout & Session Revocation
    await test('Logout revokes session and clears session token', async () => {
      const res = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`
        },
        body: JSON.stringify({ refreshToken: ownerRefreshToken })
      });
      if (res.status !== 200) throw new Error('Logout request failed');

      // Attempting to refresh with the revoked token should now fail
      const refreshAttempt = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: ownerRefreshToken })
      });
      if (refreshAttempt.status !== 401) {
        throw new Error(`Expected 401 on revoked session refresh, got ${refreshAttempt.status}`);
      }
    });

  } finally {
    server.close();
  }

  console.log('====================================================');
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
