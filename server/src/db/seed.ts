import { prisma } from './prisma';
import { hashPassword } from '../utils/password';
import { ROLE_DEFINITIONS, ROLE_CAPABILITIES, UserRole } from '../config/constants';

export const INITIAL_SYSTEM_USERS = [
  {
    id: 'usr-1',
    fullName: 'Vikramaditya Rao',
    email: 'vikram.rao@sunpowersolutions.in',
    phone: '+91 98220 12345',
    roleId: 'owner_admin' as UserRole,
    roleTitle: 'Managing Director & Owner',
    department: 'Executive Management',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    emailVerified: true
  },
  {
    id: 'usr-2',
    fullName: 'Pooja Kulkarni',
    email: 'pooja.k@sunpowersolutions.in',
    phone: '+91 98220 54321',
    roleId: 'sales_exec' as UserRole,
    roleTitle: 'Senior Solar Sales Consultant',
    department: 'Sales & Business Dev',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    emailVerified: true
  },
  {
    id: 'usr-3',
    fullName: 'Suresh More',
    email: 'suresh.m@sunpowersolutions.in',
    phone: '+91 98220 67890',
    roleId: 'survey_tech' as UserRole,
    roleTitle: 'Field Site Survey Specialist',
    department: 'Field Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    emailVerified: true
  },
  {
    id: 'usr-4',
    fullName: 'Ganesh Shinde',
    email: 'ganesh.s@sunpowersolutions.in',
    phone: '+91 98221 00917',
    roleId: 'warehouse_mgr' as UserRole,
    roleTitle: 'Central Warehouse & Logistics Manager',
    department: 'Supply Chain & Inventory',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    emailVerified: true
  },
  {
    id: 'usr-5',
    fullName: 'Amit Jadhav',
    email: 'amit.j@sunpowersolutions.in',
    phone: '+91 98220 98765',
    roleId: 'install_tech' as UserRole,
    roleTitle: 'Lead Solar Installation Engineer',
    department: 'Operations & Installations',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    emailVerified: true
  },
  {
    id: 'usr-6',
    fullName: 'Sneha Deshpande',
    email: 'sneha.d@sunpowersolutions.in',
    phone: '+91 98220 34567',
    roleId: 'support_exec' as UserRole,
    roleTitle: 'Client Care & Warranty Specialist',
    department: 'After-Sales & Customer Service',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    emailVerified: true
  },
  {
    id: 'usr-7',
    fullName: 'Ramesh Patil',
    email: 'ramesh.p@sunpowersolutions.in',
    phone: '+91 98220 45678',
    roleId: 'accountant' as UserRole,
    roleTitle: 'Chief Financial Accountant',
    department: 'Finance & Compliance',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    emailVerified: true
  },
  {
    id: 'usr-8',
    fullName: 'Mahesh Kadam',
    email: 'mahesh.k@sunpowersolutions.in',
    phone: '+91 98220 78901',
    roleId: 'survey_tech' as UserRole,
    roleTitle: 'Chief Survey Specialist & Team Lead',
    department: 'Field Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    emailVerified: true
  },
  {
    id: 'usr-9',
    fullName: 'Sandeep Patil',
    email: 'sandeep.p@sunpowersolutions.in',
    phone: '+91 98220 89012',
    roleId: 'engineering_lead' as UserRole,
    roleTitle: 'Lead Solar Design & Approvals Engineer',
    department: 'Engineering & Feasibility',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    emailVerified: true
  }
];

export const INITIAL_DELEGATIONS = [
  {
    id: 'del-1',
    delegationCode: 'DEL-2026-001',
    employeeId: 'usr-5',
    employeeName: 'Amit Jadhav',
    grantedPermission: 'installations.execute',
    departmentScope: 'Operations',
    authorizedBy: 'Vikramaditya Rao (MD)',
    justification: 'Certified Lead Installer authorized for autonomous safety commissioning and customer signoff signoff',
    effectiveFrom: new Date('2026-01-01'),
    effectiveTo: new Date('2026-12-31'),
    active: true
  }
];

export async function seedDatabase(): Promise<void> {
  console.log('--- Starting SolarOS Database Seed ---');
  const defaultPasswordHash = await hashPassword('solaros2026');

  // 1. Seed Roles & Capabilities
  for (const [roleKey, def] of Object.entries(ROLE_DEFINITIONS)) {
    const permissions = ROLE_CAPABILITIES[roleKey as UserRole] || [];
    try {
      await prisma.role.upsert({
        where: { id: roleKey },
        update: {
          name: def.title,
          description: def.description,
          permissions
        },
        create: {
          id: roleKey,
          name: def.title,
          description: def.description,
          permissions
        }
      });
      console.log(`✓ Seeded role: ${roleKey}`);
    } catch (e: any) {
      console.warn(`Could not seed role ${roleKey}:`, e.message);
    }
  }

  // 2. Seed System Users
  for (const u of INITIAL_SYSTEM_USERS) {
    try {
      await prisma.profile.upsert({
        where: { email: u.email },
        update: {
          fullName: u.fullName,
          phone: u.phone,
          roleId: u.roleId,
          roleTitle: u.roleTitle,
          department: u.department,
          avatarUrl: u.avatarUrl,
          isActive: u.isActive,
          emailVerified: u.emailVerified
        },
        create: {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          passwordHash: defaultPasswordHash,
          roleId: u.roleId,
          roleTitle: u.roleTitle,
          department: u.department,
          avatarUrl: u.avatarUrl,
          isActive: u.isActive,
          emailVerified: u.emailVerified
        }
      });
      console.log(`✓ Seeded profile: ${u.email}`);
    } catch (e: any) {
      console.warn(`Could not seed profile ${u.email}:`, e.message);
    }
  }

  console.log('--- SolarOS Database Seed Complete ---');
}
