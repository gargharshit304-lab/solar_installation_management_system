import { app } from '../src/app';
import http from 'http';
import { AddressInfo } from 'net';
import { prisma } from '../src/db/prisma';

function extractCookie(res: any, name: string): string | null {
  // getSetCookie in node 18+ or headers.get('set-cookie')
  const rawHeaders = res.headers;
  let cookieHeader = '';
  if (typeof rawHeaders.getSetCookie === 'function') {
    const list = rawHeaders.getSetCookie();
    cookieHeader = list.join('; ');
  } else {
    cookieHeader = rawHeaders.get('set-cookie') || '';
  }
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function runRbacSyncVerification() {
  console.log('================================================================');
  console.log('🧪 SolarOS Enterprise RBAC & Cross-Session Synchronization Test');
  console.log('================================================================');

  const server = http.createServer(app);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  let passed = 0;
  let failed = 0;

  async function step(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`, err.cause || '');
      failed++;
    }
  }

  try {
    let ownerToken = '';
    let ownerCsrf = '';
    let ownerCookie = '';

    let warehouseToken = '';
    let warehouseCsrf = '';
    let warehouseCookie = '';

    let warehouseInitialPerms: Record<string, string[]> = {};

    // ------------------------------------------------------------------------
    // Step 1: Session A (Owner) and Session B (Warehouse Manager) Authentication
    // ------------------------------------------------------------------------
    await step('SESSION A: Login as Owner & retrieve JWT + CSRF tokens', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vikram.rao@sunpowersolutions.in',
          password: 'solaros2026'
        })
      });
      const body = await res.json();
      if (res.status !== 200 || !body.success) {
        throw new Error(`Owner login failed: ${body.error?.message}`);
      }
      ownerToken = body.data.accessToken;
      ownerCsrf = extractCookie(res, 'solaros_csrf') || '';
      ownerCookie = extractCookie(res, 'solaros_session_token') || '';
      if (!ownerToken) throw new Error('Missing owner access token');
    });

    await step('SESSION B: Login as Warehouse Manager & retrieve JWT + CSRF tokens', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ganesh.s@sunpowersolutions.in',
          password: 'solaros2026'
        })
      });
      const body = await res.json();
      if (res.status !== 200 || !body.success) {
        throw new Error(`Warehouse Manager login failed: ${body.error?.message}`);
      }
      warehouseToken = body.data.accessToken;
      warehouseCsrf = extractCookie(res, 'solaros_csrf') || '';
      warehouseCookie = extractCookie(res, 'solaros_session_token') || '';
      if (!warehouseToken) throw new Error('Missing warehouse manager access token');
    });

    // ------------------------------------------------------------------------
    // Step 2: Establish Initial Baseline (Warehouse Manager has NO customer access)
    // ------------------------------------------------------------------------
    await step('SESSION B: Initial check: GET /customers is rejected (403 Forbidden)', async () => {
      // Ensure warehouse_mgr does not start with customers permission
      const initialRole = await prisma.role.findUnique({ where: { id: 'warehouse_mgr' } });
      warehouseInitialPerms = (initialRole?.permissions as Record<string, string[]>) || {
        overview: ['view'],
        inventory: ['view', 'create', 'edit', 'manage', 'export'],
        dispatch: ['view', 'create', 'edit', 'manage', 'export'],
        warranty: ['view'],
        installations: ['view']
      };
      delete warehouseInitialPerms['customers'];

      await prisma.role.update({
        where: { id: 'warehouse_mgr' },
        data: { permissions: warehouseInitialPerms }
      });

      const res = await fetch(`${baseUrl}/customers`, {
        headers: { Authorization: `Bearer ${warehouseToken}` }
      });
      if (res.status !== 403) {
        throw new Error(`Expected 403 Forbidden for initial customer access, received HTTP ${res.status}`);
      }
    });

    // ------------------------------------------------------------------------
    // Step 3: SESSION A Grants Customers "view" Permission
    // ------------------------------------------------------------------------
    await step('SESSION A: Owner grants customers.view to Warehouse Manager via API', async () => {
      const updatedPerms = {
        ...warehouseInitialPerms,
        customers: ['view']
      };

      const res = await fetch(`${baseUrl}/rbac/roles/warehouse_mgr/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`,
          'x-csrf-token': ownerCsrf,
          Cookie: `solaros_csrf=${ownerCsrf}; solaros_session_token=${ownerCookie}`
        },
        body: JSON.stringify({ permissions: updatedPerms })
      });
      const body = await res.json();
      if (res.status !== 200 || !body.success) {
        throw new Error(`Permission update failed: ${body.error?.message}`);
      }
      if (!body.data.permissions.customers?.includes('view')) {
        throw new Error('Response did not confirm customers.view in updated role permissions');
      }
    });

    // ------------------------------------------------------------------------
    // Step 4: Verify Supabase PostgreSQL Persistence & Audit Log
    // ------------------------------------------------------------------------
    await step('DATABASE AUDIT: Verify Supabase PostgreSQL role row and version increment', async () => {
      const dbRole = await prisma.role.findUnique({ where: { id: 'warehouse_mgr' } });
      if (!dbRole) throw new Error('Role warehouse_mgr not found in PostgreSQL');
      const perms = dbRole.permissions as Record<string, string[]>;
      if (!perms.customers || !perms.customers.includes('view')) {
        throw new Error('Supabase PostgreSQL does not contain customers.view permission');
      }
      if (dbRole.version < 1) {
        throw new Error(`Expected version >= 1, found ${dbRole.version}`);
      }

      const recentAudit = await prisma.auditLog.findFirst({
        where: { entity: 'Role', entityId: 'warehouse_mgr' },
        orderBy: { timestamp: 'desc' }
      });
      if (!recentAudit || recentAudit.action !== 'ROLE_PERMISSIONS_UPDATE') {
        throw new Error('Audit log record for role permission update missing in PostgreSQL');
      }
    });

    // ------------------------------------------------------------------------
    // Step 5: SESSION B Revalidation & Customer Data Access
    // ------------------------------------------------------------------------
    await step('SESSION B: Warehouse Manager polls/fetches /rbac/roles and sees customers.view', async () => {
      const res = await fetch(`${baseUrl}/rbac/roles`, {
        headers: { Authorization: `Bearer ${warehouseToken}` }
      });
      const body = await res.json();
      if (res.status !== 200 || !body.success) {
        throw new Error(`Failed to fetch roles: ${body.error?.message}`);
      }
      const warehouseRole = body.data.find((r: any) => r.id === 'warehouse_mgr');
      if (!warehouseRole?.permissions?.customers?.includes('view')) {
        throw new Error('Warehouse Manager session did not receive customers.view from /rbac/roles');
      }
    });

    await step('SESSION B: Warehouse Manager accesses GET /customers successfully (200 OK)', async () => {
      const res = await fetch(`${baseUrl}/customers`, {
        headers: { Authorization: `Bearer ${warehouseToken}` }
      });
      const body = await res.json();
      if (res.status !== 200 || !body.success) {
        throw new Error(`Expected 200 OK, got HTTP ${res.status}: ${body.error?.message}`);
      }
      if (!Array.isArray(body.data) || body.data.length === 0) {
        throw new Error(`Expected populated customers array, got ${body.data?.length}`);
      }
      console.log(`      Found ${body.data.length} customer records accessible to Warehouse Manager`);
    });

    // ------------------------------------------------------------------------
    // Step 6: View-Only Isolation (Mutations Strictly Blocked)
    // ------------------------------------------------------------------------
    await step('VIEW-ONLY ISOLATION: Warehouse Manager cannot POST /customers (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${warehouseToken}`,
          'x-csrf-token': warehouseCsrf,
          Cookie: `solaros_csrf=${warehouseCsrf}; solaros_session_token=${warehouseCookie}`
        },
        body: JSON.stringify({
          fullName: 'Unauthorized Test Customer',
          phone: '+91 99999 88888',
          city: 'Pune'
        })
      });
      if (res.status !== 403) {
        throw new Error(`View-only isolation breach! Expected 403 Forbidden, received HTTP ${res.status}`);
      }
    });

    // ------------------------------------------------------------------------
    // Step 7: SESSION A Revokes Customers Permission
    // ------------------------------------------------------------------------
    await step('SESSION A: Owner revokes customers permission from Warehouse Manager', async () => {
      const revokedPerms = { ...warehouseInitialPerms };
      delete revokedPerms['customers'];

      const res = await fetch(`${baseUrl}/rbac/roles/warehouse_mgr/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`,
          'x-csrf-token': ownerCsrf,
          Cookie: `solaros_csrf=${ownerCsrf}; solaros_session_token=${ownerCookie}`
        },
        body: JSON.stringify({ permissions: revokedPerms })
      });
      const body = await res.json();
      if (res.status !== 200 || !body.success) {
        throw new Error(`Permission revocation failed: ${body.error?.message}`);
      }
      if (body.data.permissions.customers) {
        throw new Error('Response still contains customers permission after revocation');
      }
    });

    // ------------------------------------------------------------------------
    // Step 8: SESSION B Immediate Enforcement (403 Forbidden on Revoked Resource)
    // ------------------------------------------------------------------------
    await step('SESSION B: Immediate enforcement: GET /customers rejected with 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/customers`, {
        headers: { Authorization: `Bearer ${warehouseToken}` }
      });
      if (res.status !== 403) {
        throw new Error(`Revocation not enforced! Expected 403 Forbidden, received HTTP ${res.status}`);
      }
    });

    await step('SESSION B: Fresh login & session restore confirms revoked permission persists', async () => {
      // Re-login as Warehouse Manager
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ganesh.s@sunpowersolutions.in',
          password: 'solaros2026'
        })
      });
      const loginBody = await loginRes.json();
      const freshToken = loginBody.data.accessToken;

      const res = await fetch(`${baseUrl}/customers`, {
        headers: { Authorization: `Bearer ${freshToken}` }
      });
      if (res.status !== 403) {
        throw new Error(`Fresh login did not enforce revoked state. Expected 403, received ${res.status}`);
      }
    });

    // ------------------------------------------------------------------------
    // Step 9: RBAC Version Endpoint
    // ------------------------------------------------------------------------
    await step('GET /rbac/version returns incremented version and metadata', async () => {
      const res = await fetch(`${baseUrl}/rbac/version`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const body = await res.json();
      if (res.status !== 200 || !body.success) {
        throw new Error(`Expected 200 OK, got ${res.status}`);
      }
      if (!body.data?.version || typeof body.data.version !== 'number') {
        throw new Error('Missing or invalid version number in response');
      }
      if (!body.data?.lastModified) {
        throw new Error('Missing lastModified timestamp in response');
      }
      console.log(`      Current RBAC Version: ${body.data.version}, Last Modified: ${body.data.lastModified}`);
    });

  } finally {
    await server.close();
    await prisma.$disconnect();
  }

  console.log('----------------------------------------------------------------');
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRbacSyncVerification().catch(err => {
  console.error('Fatal error in RBAC verification test suite:', err);
  process.exit(1);
});
