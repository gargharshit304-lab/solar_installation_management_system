export const USER_ROLES = [
  'owner_admin',
  'sales_exec',
  'survey_tech',
  'engineering_lead',
  'warehouse_mgr',
  'install_tech',
  'support_exec',
  'accountant'
] as const;

export type UserRole = typeof USER_ROLES[number];

export const ROLE_DEFINITIONS: Record<UserRole, { title: string; department: string; description: string }> = {
  owner_admin: {
    title: 'Managing Director & Owner',
    department: 'Executive Management',
    description: 'Company-wide administrative oversight, policy governance, approvals, and audit review.'
  },
  sales_exec: {
    title: 'Senior Solar Sales Consultant',
    department: 'Sales & Business Dev',
    description: 'Customer enquiries, consultative surveys booking, dynamic quotations, and order conversions.'
  },
  survey_tech: {
    title: 'Field Site Survey Specialist',
    department: 'Field Engineering',
    description: 'Technical rooftop inspections, terrace dimensions, shadow free measurements, and report submission.'
  },
  engineering_lead: {
    title: 'Lead Solar Design & Approvals Engineer',
    department: 'Engineering & Feasibility',
    description: 'Quality gate feasibility signoff, shadow analysis validation, and engineering approvals.'
  },
  warehouse_mgr: {
    title: 'Central Warehouse & Logistics Manager',
    department: 'Supply Chain & Inventory',
    description: 'Equipment catalogue, serial number traceability, physical stock counts, and dispatch packing.'
  },
  install_tech: {
    title: 'Lead Solar Installation Engineer',
    department: 'Operations & Installations',
    description: 'Field system execution, 8-point electrical safety checklist verification, and handover signatures.'
  },
  support_exec: {
    title: 'Client Care & Warranty Specialist',
    department: 'After-Sales & Customer Service',
    description: 'Customer warranty lookups, service complaint ticketing, and hardware claim adjudication.'
  },
  accountant: {
    title: 'Chief Financial Accountant',
    department: 'Finance & Compliance',
    description: 'Tax invoices, customer payment verification, installation expenses, and project-wise P&L audits.'
  }
};

/**
 * Authoritative Capability Permissions for SolarOS Backend
 * Strictly enforces Administrative Governance vs Operational Responsibility
 */
export const ROLE_CAPABILITIES: Record<UserRole, string[]> = {
  owner_admin: [
    'company.view_all',
    'company.manage_settings',
    'employees.view_all',
    'employees.create',
    'employees.update',
    'employees.deactivate',
    'employees.assign_roles',
    'departments.manage',
    'roles_permissions.manage',
    'roles_permissions.view',
    'roles_permissions.create',
    'roles_permissions.edit',
    'roles_permissions.delete',
    'roles.manage',
    'roles.view',
    'roles.create',
    'roles.edit',
    'roles.delete',
    'permissions.manage',
    'employee_roles.assign',
    'approvals.view_all',
    'approvals.decide',
    'audit.view_all',
    'exceptions.authorize',
    'delegations.manage',
    'installations.view_all',
    'installations.monitor',
    'installations.assign',
    'installations.reassign',
    'installations.reschedule',
    'installations.flag_issue',
    'surveys.view_all',
    'surveys.monitor',
    'surveys.schedule',
    'surveys.assign',
    'surveys.reassign',
    'inventory.view_all',
    'dispatch.view_all',
    'dispatch.authorize_override',
    'enquiries.view_all',
    'orders.view_all',
    'finance.view_all',
    'profitability.view_all',
    'subsidies.view',
    'warranty.view_all'
  ],
  install_tech: [
    'installations.view_assigned',
    'installations.execute',
    'installations.start',
    'installations.update_checklist',
    'installations.capture_signature',
    'installations.submit_report'
  ],
  survey_tech: [
    'surveys.view_assigned',
    'surveys.view_available',
    'surveys.claim',
    'surveys.start',
    'surveys.enter_measurements',
    'surveys.upload_photos',
    'surveys.submit_report'
  ],
  engineering_lead: [
    'surveys.view_all',
    'surveys.review',
    'surveys.request_corrections',
    'surveys.approve',
    'surveys.reject'
  ],
  warehouse_mgr: [
    'inventory.view_all',
    'inventory.receive',
    'inventory.adjust',
    'inventory.scan_serial',
    'inventory.allocate_serial',
    'dispatch.view_all',
    'dispatch.prepare',
    'dispatch.release',
    'delivery.confirm',
    'warranty.view_all' // Read-only warranty trace capability
  ],
  accountant: [
    'finance.view_all',
    'invoices.create',
    'payments.record',
    'payments.verify',
    'expenses.review',
    'profitability.view_all',
    'subsidies.view',
    'subsidies.manage',
    'orders.view_all'
  ],
  sales_exec: [
    'enquiries.view_all',
    'enquiries.create',
    'enquiries.update',
    'enquiries.mark_lost',
    'surveys.schedule',
    'surveys.assign',
    'quotations.create',
    'quotations.update',
    'quotations.send',
    'orders.create',
    'orders.view_all'
  ],
  support_exec: [
    'support.tickets.create',
    'support.tickets.update',
    'support.tickets.resolve',
    'warranty.view_all',
    'warranty.claims.create',
    'warranty.claims.adjudicate'
  ]
};
