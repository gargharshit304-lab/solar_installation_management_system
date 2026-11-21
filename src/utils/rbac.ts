import { UserProfile, UserRole, CapabilityPermission, OperationalDelegation } from '../types';

/**
 * Authoritative Capability Permission Mapping for SolarOS
 * Strictly separates Administrative Governance from Operational Responsibility.
 */
export const ROLE_CAPABILITIES: Record<UserRole, CapabilityPermission[]> = {
  // 1. Owner & Managing Director (Administrative Authority ONLY)
  owner_admin: [
    // Governance & Settings
    'company.view_all',
    'company.manage_settings',
    'employees.view_all',
    'employees.create',
    'employees.update',
    'employees.deactivate',
    'employees.assign_roles',
    'departments.manage',
    'roles_permissions.manage',
    'approvals.view_all',
    'approvals.decide',
    'audit.view_all',
    'exceptions.authorize',
    'delegations.manage',

    // Installations Oversight (Read, monitor, assign, reschedule, flag issues — NO direct execution)
    'installations.view_all',
    'installations.monitor',
    'installations.assign',
    'installations.reassign',
    'installations.reschedule',
    'installations.flag_issue',

    // Site Surveys Oversight (Read, monitor, assign, reschedule — NO field measurements or engineering approval)
    'surveys.view_all',
    'surveys.monitor',
    'surveys.schedule',
    'surveys.assign',
    'surveys.reassign',

    // Warehouse & Logistics Oversight (Read inventory, track dispatches, authorize exceptions — NO manual scanning/release)
    'inventory.view_all',
    'dispatch.view_all',
    'dispatch.authorize_override',

    // Commercial & Sales Oversight
    'enquiries.view_all',
    'orders.view_all',

    // Finance Oversight (Read P&L, profitability, receivables — NO bookkeeping/cash receipts)
    'finance.view_all',
    'profitability.view_all',
    'subsidies.view',

    // Customer Service Oversight
    'warranty.view_all'
  ],

  // 2. Installation Technician (Operational Execution)
  install_tech: [
    'installations.view_assigned',
    'installations.execute',
    'installations.start',
    'installations.update_checklist',
    'installations.capture_signature',
    'installations.submit_report'
  ],

  // 3. Field Survey Specialist (Operational Field Inspections)
  survey_tech: [
    'surveys.view_assigned',
    'surveys.view_available',
    'surveys.claim',
    'surveys.start',
    'surveys.enter_measurements',
    'surveys.upload_photos',
    'surveys.submit_report'
  ],

  // 4. Engineering Lead (Technical Feasibility Quality Gate)
  engineering_lead: [
    'surveys.view_all',
    'surveys.review',
    'surveys.request_corrections',
    'surveys.approve',
    'surveys.reject'
  ],

  // 5. Central Warehouse & Logistics Manager (Operational Supply Chain)
  warehouse_mgr: [
    'inventory.view_all',
    'inventory.receive',
    'inventory.adjust',
    'inventory.scan_serial',
    'inventory.allocate_serial',
    'dispatch.view_all',
    'dispatch.prepare',
    'dispatch.release',
    'delivery.confirm'
  ],

  // 6. Chief Financial Accountant (Operational Bookkeeping & Compliance)
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

  // 7. Senior Solar Sales Consultant (Commercial Coordination)
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

  // 8. Client Care & Warranty Specialist (Support & Adjudication)
  support_exec: [
    'support.tickets.create',
    'support.tickets.update',
    'support.tickets.resolve',
    'warranty.view_all',
    'warranty.claims.create',
    'warranty.claims.adjudicate'
  ]
};

/**
 * Checks whether an authenticated user is authorized to perform a specific capability.
 * Takes into account:
 * 1. Base Role Capabilities.
 * 2. Active Operational Delegations explicitly granted to this employee.
 * 3. Specific operational assignment context (e.g. technician assigned to this installation).
 */
export function verifyCapability(
  user: UserProfile,
  permission: CapabilityPermission,
  delegations: OperationalDelegation[] = [],
  context?: { assignedTechnicians?: string[]; entityId?: string }
): { allowed: boolean; reason?: string } {
  // Check if role inherently possesses capability
  const rolePermissions = ROLE_CAPABILITIES[user.role] || [];
  const hasBasePermission = rolePermissions.includes(permission);

  // Check if there is an active explicit delegation
  const activeDelegation = delegations.find(
    d => d.active && 
         d.employeeId === user.id && 
         d.grantedPermission === permission &&
         (!d.resourceId || d.resourceId === context?.entityId) &&
         (!d.expiresDate || new Date(d.expiresDate) > new Date())
  );

  if (!hasBasePermission && !activeDelegation) {
    if (user.role === 'owner_admin' && permission.startsWith('installations.execute')) {
      return {
        allowed: false,
        reason: 'Administrative authority does not include operational job execution. Only assigned installation engineers can complete installations.'
      };
    }
    return {
      allowed: false,
      reason: `User role '${user.roleTitle}' lacks permission '${permission}'.`
    };
  }

  // If operational execution of installation, verify assignment
  if (permission === 'installations.execute' || permission === 'installations.submit_report') {
    if (context?.assignedTechnicians && context.assignedTechnicians.length > 0) {
      const isAssigned = context.assignedTechnicians.some(name => 
        name.toLowerCase().includes(user.name.split(' ')[0].toLowerCase()) ||
        user.name.toLowerCase().includes(name.toLowerCase())
      );
      if (!isAssigned && !activeDelegation) {
        return {
          allowed: false,
          reason: `Only assigned field engineers (${context.assignedTechnicians.join(', ')}) can execute this installation.`
        };
      }
    }
  }

  return { allowed: true };
}
