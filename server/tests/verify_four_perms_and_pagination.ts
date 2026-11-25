import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { prisma } from '../src/db/prisma';
import { rbacService } from '../src/modules/rbac/rbac.service';
import { parsePaginationParams, buildPaginationMeta } from '../src/utils/pagination';

async function runTests() {
  console.log('===============================================================');
  console.log('SOLAROS ENTERPRISE RBAC & PAGINATION VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

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

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Supabase Database 4 Core Permissions Verification
  // --------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: PostgreSQL Roles Table Perms Verification ---');
  const roles = await prisma.role.findMany();
  assert(roles.length >= 8, `Found ${roles.length} roles in Supabase PostgreSQL`);

  const ALLOWED_PERMS = new Set(['view', 'create', 'edit', 'delete']);
  let allClean = true;

  for (const role of roles) {
    const perms = (role.permissions || {}) as Record<string, string[]>;
    for (const [module, actions] of Object.entries(perms)) {
      if (!Array.isArray(actions)) continue;
      for (const act of actions) {
        if (!ALLOWED_PERMS.has(act)) {
          allClean = false;
          console.error(`Role ${role.id} has disallowed action '${act}' in module '${module}'`);
        }
      }
    }
  }
  assert(allClean, 'All roles in PostgreSQL strictly use only the 4 canonical permissions (view, create, edit, delete)');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Owner Superadmin Full Access Guarantee
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Owner Superadmin Full Access Guarantee ---');
  const ownerUser = { id: 'usr-owner-test', name: 'Vikram Rao', role: 'owner_admin' };
  const modules = [
    'customers', 'orders', 'inventory', 'finance', 'surveys',
    'installations', 'dispatch', 'workforce', 'roles_permissions', 'audit'
  ];

  let ownerAllModulesAllowed = true;
  for (const mod of modules) {
    const canV = await rbacService.canView(ownerUser, mod);
    const canC = await rbacService.canCreate(ownerUser, mod);
    const canE = await rbacService.canEdit(ownerUser, mod);
    const canD = await rbacService.canDelete(ownerUser, mod);

    const isAudit = mod === 'audit';
    if (!canV || !canC || (!isAudit && !canE) || (!isAudit && !canD)) {
      ownerAllModulesAllowed = false;
      console.error(`Owner failed CRUD check on ${mod}: V=${canV}, C=${canC}, E=${canE}, D=${canD}`);
    }
  }
  assert(ownerAllModulesAllowed, 'Owner Superadmin has unrestricted CRUD across all modules');

  // Verify legacy synonyms map to 4 permissions
  const canAssign = await rbacService.canAssign(ownerUser, 'surveys');
  const canApprove = await rbacService.canApprove(ownerUser, 'surveys');
  assert(canAssign && canApprove, 'Owner legacy actions (assign, approve) map to edit and succeed');

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Role Restrictions Under 4 Core Permissions
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Role Restrictions Under 4 Core Permissions ---');
  const salesUser = { id: 'usr-sales-test', name: 'Pooja Kulkarni', role: 'sales_exec' };
  const warehouseUser = { id: 'usr-wh-test', name: 'Ganesh Shinde', role: 'warehouse_mgr' };

  const salesCanViewCust = await rbacService.canView(salesUser, 'customers');
  const salesCanCreateCust = await rbacService.canCreate(salesUser, 'customers');
  const salesCanDeleteCust = await rbacService.canDelete(salesUser, 'customers');
  const salesCanEditRoles = await rbacService.canEdit(salesUser, 'roles_permissions');

  assert(salesCanViewCust && salesCanCreateCust, 'Sales Executive can view and create customers');
  assert(!salesCanDeleteCust, 'Sales Executive is strictly denied customer deletion');
  assert(!salesCanEditRoles, 'Sales Executive is strictly denied roles & permissions modification');

  const whCanViewInv = await rbacService.canView(warehouseUser, 'inventory');
  const whCanEditInv = await rbacService.canEdit(warehouseUser, 'inventory');
  const whCanEditFinance = await rbacService.canEdit(warehouseUser, 'finance');

  assert(whCanViewInv && whCanEditInv, 'Warehouse Manager can view and edit inventory');
  assert(!whCanEditFinance, 'Warehouse Manager is strictly denied finance editing');

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Pagination Utilities & Math Correctness
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Pagination Utilities & Math Correctness ---');

  // Page 1 of 248 records with pageSize 10
  const meta1 = buildPaginationMeta(1, 10, 248);
  assert(meta1.page === 1, 'Meta1 page is 1');
  assert(meta1.pageSize === 10, 'Meta1 pageSize is 10');
  assert(meta1.totalRecords === 248, 'Meta1 totalRecords is 248');
  assert(meta1.totalPages === 25, 'Meta1 totalPages is 25 (ceil of 248/10)');
  assert(meta1.hasNextPage === true, 'Meta1 hasNextPage is true');
  assert(meta1.hasPreviousPage === false, 'Meta1 hasPreviousPage is false');

  // Page 25 of 248 records with pageSize 10
  const meta25 = buildPaginationMeta(25, 10, 248);
  assert(meta25.page === 25, 'Meta25 page is 25');
  assert(meta25.hasNextPage === false, 'Meta25 hasNextPage is false');
  assert(meta25.hasPreviousPage === true, 'Meta25 hasPreviousPage is true');

  // 0 records boundary condition
  const meta0 = buildPaginationMeta(1, 20, 0);
  assert(meta0.totalRecords === 0, 'Meta0 totalRecords is 0');
  assert(meta0.totalPages === 1, 'Meta0 totalPages is 1');
  assert(meta0.hasNextPage === false, 'Meta0 hasNextPage is false');
  assert(meta0.hasPreviousPage === false, 'Meta0 hasPreviousPage is false');

  // Query parameter parsing
  const params1 = parsePaginationParams({ page: '3', pageSize: '50', search: '  Solar PV  ' }, 20);
  assert(params1.page === 3, 'parsePaginationParams page is 3');
  assert(params1.pageSize === 50, 'parsePaginationParams pageSize is 50');
  assert(params1.offset === 100, 'parsePaginationParams offset is 100 ((3-1)*50)');
  assert(params1.limit === 50, 'parsePaginationParams limit is 50');
  assert(params1.search === 'Solar PV', 'parsePaginationParams trimmed search correctly');

  // Disallowed pageSize falls back to default
  const paramsInvalidSize = parsePaginationParams({ pageSize: '999' }, 20);
  assert(paramsInvalidSize.pageSize === 20, 'Invalid pageSize correctly falls back to default 20');

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
