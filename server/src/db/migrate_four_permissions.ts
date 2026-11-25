import { prisma } from './prisma';

const FOUR_PERM_ROLES: Record<string, { name: string; department: string; description: string; permissions: Record<string, string[]> }> = {
  owner_admin: {
    name: 'Owner & Managing Director',
    department: 'Executive Leadership',
    description: 'Unrestricted full enterprise access across all departments, financial approvals, workforce, AI agents, and system configurations.',
    permissions: {
      overview: ['view', 'create', 'edit', 'delete'],
      customers: ['view', 'create', 'edit', 'delete'],
      enquiries: ['view', 'create', 'edit', 'delete'],
      follow_ups: ['view', 'create', 'edit', 'delete'],
      surveys: ['view', 'create', 'edit', 'delete'],
      survey_review: ['view', 'create', 'edit', 'delete'],
      quotations: ['view', 'create', 'edit', 'delete'],
      orders: ['view', 'create', 'edit', 'delete'],
      inventory: ['view', 'create', 'edit', 'delete'],
      dispatch: ['view', 'create', 'edit', 'delete'],
      installations: ['view', 'create', 'edit', 'delete'],
      workforce: ['view', 'create', 'edit', 'delete'],
      departments: ['view', 'create', 'edit', 'delete'],
      roles_permissions: ['view', 'create', 'edit', 'delete'],
      roles: ['view', 'create', 'edit', 'delete'],
      permissions: ['view', 'create', 'edit', 'delete'],
      approvals: ['view', 'create', 'edit', 'delete'],
      finance: ['view', 'create', 'edit', 'delete'],
      reports: ['view', 'create', 'edit', 'delete'],
      ai_agents: ['view', 'create', 'edit', 'delete'],
      warranty: ['view', 'create', 'edit', 'delete'],
      service: ['view', 'create', 'edit', 'delete'],
      subsidies: ['view', 'create', 'edit', 'delete'],
      activity_center: ['view', 'create', 'edit', 'delete'],
      audit: ['view'],
      settings: ['view', 'create', 'edit', 'delete']
    }
  },
  sales_exec: {
    name: 'Senior Solar Sales Consultant',
    department: 'Commercial & Sales',
    description: 'Lead discovery, customer consultations, solar PV sizing, preliminary quotation drafting, and survey dispatch.',
    permissions: {
      overview: ['view'],
      customers: ['view', 'create', 'edit'],
      enquiries: ['view', 'create', 'edit'],
      follow_ups: ['view', 'create', 'edit'],
      surveys: ['view', 'create', 'edit'],
      quotations: ['view', 'create', 'edit'],
      orders: ['view', 'create'],
      subsidies: ['view', 'create'],
      reports: ['view']
    }
  },
  survey_tech: {
    name: 'Field Survey Specialist',
    department: 'Field Operations & Surveying',
    description: 'On-site rooftop measurements, shadow-free azimuth validation, distribution board inspection, and technical survey report submission.',
    permissions: {
      overview: ['view'],
      surveys: ['view', 'create', 'edit'],
      customers: ['view']
    }
  },
  engineering_lead: {
    name: 'Lead Solar Design & Approvals Engineer',
    department: 'Engineering & Design Quality',
    description: 'Engineering feasibility review, electrical single-line diagram (SLD) approval, CAD structural review, and DISCOM net-metering liaison.',
    permissions: {
      overview: ['view'],
      surveys: ['view', 'edit'],
      survey_review: ['view', 'edit'],
      installations: ['view'],
      reports: ['view']
    }
  },
  warehouse_mgr: {
    name: 'Central Warehouse & Logistics Manager',
    department: 'Supply Chain & Logistics',
    description: 'Tier-1 solar PV modules and hybrid inverter stock allocation, individual hardware serial number scanning, and dispatch kit generation.',
    permissions: {
      overview: ['view'],
      inventory: ['view', 'create', 'edit'],
      dispatch: ['view', 'create', 'edit'],
      warranty: ['view'],
      installations: ['view']
    }
  },
  install_tech: {
    name: 'Installation Technician & Crew Lead',
    department: 'Field Operations & Installations',
    description: 'Rooftop structure assembly, module interconnections, AC/DC inverter commissioning, 8-point electrical safety, and handover.',
    permissions: {
      overview: ['view'],
      installations: ['view', 'edit'],
      service: ['view', 'edit'],
      inventory: ['view'],
      surveys: ['view']
    }
  },
  support_exec: {
    name: 'Warranty & Client Care Officer',
    department: 'Customer Success & Warranty Support',
    description: 'Post-commissioning generation monitoring, preventive maintenance tickets, inverter alarm triage, and manufacturer warranty RMA processing.',
    permissions: {
      overview: ['view'],
      service: ['view', 'create', 'edit'],
      warranty: ['view', 'create', 'edit'],
      customers: ['view']
    }
  },
  accountant: {
    name: 'Chief Financial Accountant',
    department: 'Finance & Compliance',
    description: 'Project-level gross margin accounting, milestone invoicing, customer cash receipts, subsidy ledger audit, and tax compliance.',
    permissions: {
      overview: ['view'],
      finance: ['view', 'create', 'edit'],
      orders: ['view', 'edit'],
      subsidies: ['view', 'edit'],
      reports: ['view'],
      approvals: ['view', 'create', 'edit']
    }
  }
};

async function migrateFourPermissions() {
  console.log('🔄 Migrating all roles in Supabase PostgreSQL to 4-Permission Model (view, create, edit, delete)...');

  for (const [roleKey, def] of Object.entries(FOUR_PERM_ROLES)) {
    const updated = await prisma.role.upsert({
      where: { id: roleKey },
      update: {
        name: def.name,
        description: def.description,
        permissions: def.permissions,
        version: { increment: 1 },
        updatedAt: new Date()
      },
      create: {
        id: roleKey,
        name: def.name,
        description: def.description,
        permissions: def.permissions,
        version: 1,
        updatedAt: new Date()
      }
    });

    console.log(`  ✓ Migrated role '${roleKey}' (v${updated.version}) with 4 core permissions`);
  }

  console.log('✅ Supabase PostgreSQL role migration to 4 core permissions completed successfully!');
}

migrateFourPermissions()
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
