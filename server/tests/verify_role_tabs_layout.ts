import fs from 'fs';
import path from 'path';
import { INITIAL_ROLES_PERMISSIONS } from '../../src/data/mockData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

console.log('======================================================');
console.log('VERIFY ROLES & PERMISSIONS TABS RESPONSIVE LAYOUT');
console.log('======================================================\n');

const rolesPermissionsPath = path.resolve(process.cwd(), 'src/pages/owner/RolesPermissionsPage.tsx');
assert(fs.existsSync(rolesPermissionsPath), 'RolesPermissionsPage.tsx exists');

const fileContent = fs.readFileSync(rolesPermissionsPath, 'utf-8');

// 1. Verify overflow-x-auto removed from role tabs container
console.log('• Testing: 1. Verify no overflow-x-auto on role tabs container...');
const roleTabsSectionMatch = fileContent.match(/{\/\* 4\. Role Selector Tabs[\s\S]*?{\/\* 5\. Permissions Matrix/);
assert(!!roleTabsSectionMatch, 'Found Section 4 Role Selector Tabs');

const roleTabsSection = roleTabsSectionMatch![0];
assert(!roleTabsSection.includes('overflow-x-auto'), 'Role tabs section does NOT contain overflow-x-auto');
assert(!roleTabsSection.includes('overflow-x'), 'Role tabs section does NOT contain any overflow-x scrollbar triggering class');

// 2. Verify flex-wrap and responsive gap are present
console.log('• Testing: 2. Verify flex flex-wrap and responsive gap on role tabs container...');
assert(roleTabsSection.includes('flex flex-wrap'), 'Role tabs container has flex flex-wrap');
assert(roleTabsSection.includes('gap-2'), 'Role tabs container has responsive gap-2');

// 3. Verify whitespace-nowrap and shrink-0 removed from tab buttons
console.log('• Testing: 3. Verify whitespace-nowrap and shrink-0 removed from role buttons...');
// Extract the button inside Section 4
const buttonClassMatch = roleTabsSection.match(/<button[\s\S]*?className=\{`([\s\S]*?)`\}/);
assert(!!buttonClassMatch, 'Found button className in Section 4');
const buttonClasses = buttonClassMatch![1];

assert(!buttonClasses.includes('whitespace-nowrap'), 'Role button does NOT enforce whitespace-nowrap');
assert(!buttonClasses.includes('shrink-0'), 'Role button does NOT enforce shrink-0 (allowing responsive flex wrapping)');

// 4. Verify role names are NOT clipped, hidden, or truncated
console.log('• Testing: 4. Verify no truncate or clipping on role names...');
assert(!roleTabsSection.includes('truncate') || !roleTabsSection.includes('role.name}</span>'), 'role.name is rendered in full without truncate class');
assert(roleTabsSection.includes('<span>{role.name}</span>'), 'Role name span rendered cleanly: <span>{role.name}</span>');

// 5. Verify active role styling and selection functionality preserved
console.log('• Testing: 5. Verify active role styling preserved...');
assert(roleTabsSection.includes("bg-navy text-white border-navy shadow-xs"), 'Selected role has bg-navy text-white styling');
assert(roleTabsSection.includes("setSelectedRoleId(role.id)"), 'onClick handler setSelectedRoleId(role.id) is intact');

// 6. Verify role count and custom / assigned badges preserved
console.log('• Testing: 6. Verify role userCount, custom badge, and assigned badge preserved...');
assert(roleTabsSection.includes('{role.userCount}'), 'Role userCount badge is intact');
assert(roleTabsSection.includes('role.isCustom'), 'role.isCustom check is intact');
assert(roleTabsSection.includes('isEmployeeRole'), 'isEmployeeRole assigned badge is intact');

// 7. Verify all existing roles (standard, long names, and custom roles)
console.log('• Testing: 7. Verify all initial roles and long names handled...');
const roleNames = INITIAL_ROLES_PERMISSIONS.map(r => r.name);
console.log(`  Identified ${roleNames.length} canonical roles in mockData:`);
roleNames.forEach(name => console.log(`   - ${name} (length: ${name.length})`));

const hasLongRole = roleNames.some(name => name.length > 25);
assert(hasLongRole, 'At least one role has a long name (> 25 characters, e.g. "Lead Solar Design & Approvals Engineer")');

// 8. Verify Department and Employee filters were NOT modified or broken
console.log('• Testing: 8. Verify Department and Employee filters intact in Section 2...');
assert(fileContent.includes('Department Filter'), 'Department Filter remains intact');
assert(fileContent.includes('Employee Filter & Permission Inspector'), 'Employee Filter remains intact');
assert(fileContent.includes('handleClearAllFilters'), 'handleClearAllFilters remains intact');

// 9. Verify Permissions Matrix Table alignment intact in Section 5
console.log('• Testing: 9. Verify Permissions Matrix Table remains intact in Section 5...');
assert(fileContent.includes('Permissions Matrix Table'), 'Section 5 Permissions Matrix Table remains intact');
assert(fileContent.includes('Access Matrix for'), 'Access Matrix heading remains intact');

console.log('\n======================================================');
console.log('ALL ROLE TABS RESPONSIVE LAYOUT CHECKS PASSED!');
console.log('======================================================');
