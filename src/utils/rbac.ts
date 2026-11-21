import { UserProfile, UserRole, CapabilityPermission, OperationalDelegation, RoleDefinition } from '../types';

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
    'delivery.confirm',
    // Read-only equipment warranty traceability
    'warranty.view_all'
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
  permission: CapabilityPermission | string,
  delegations: OperationalDelegation[] = [],
  context?: { assignedTechnicians?: string[]; entityId?: string },
  dynamicRoles?: RoleDefinition[]
): { allowed: boolean; reason?: string } {
  // STRICT GOVERNANCE RULE: Owner cannot execute field installations without explicit delegation
  if (user.role === 'owner_admin' && permission.startsWith('installations.execute')) {
    const activeDelegation = delegations.find(
      d => d.active && 
           d.employeeId === user.id && 
           d.grantedPermission === permission &&
           (!d.resourceId || d.resourceId === context?.entityId) &&
           (!d.expiresDate || new Date(d.expiresDate) > new Date())
    );
    if (!activeDelegation) {
      return {
        allowed: false,
        reason: 'Administrative authority does not include operational job execution. Only assigned installation engineers can complete installations.'
      };
    }
  }

  // 1. Check dynamic role matrix if provided
  let hasDynamicPermission = false;
  if (dynamicRoles && dynamicRoles.length > 0) {
    const roleDef = dynamicRoles.find(r => r.roleKey === user.role || r.id === user.role);
    if (roleDef && roleDef.permissions) {
      let moduleKey = '';
      let actionKey = '';
      if (permission.includes('.')) {
        [moduleKey, actionKey] = permission.split('.');
      } else if (permission.includes(':')) {
        [moduleKey, actionKey] = permission.split(':');
      }
      if (actionKey === 'read' || actionKey === 'view_all' || actionKey === 'view_assigned' || actionKey === 'view_available') {
        actionKey = 'view';
      }
      if (actionKey === 'write' || actionKey === 'update' || actionKey === 'adjust') {
        actionKey = 'edit';
      }
      const actions = roleDef.permissions[moduleKey] || [];
      if (actions.includes(actionKey as any) || actions.includes('manage')) {
        hasDynamicPermission = true;
      }
    }
  }

  // 2. Check if role inherently possesses capability
  const rolePermissions = ROLE_CAPABILITIES[user.role] || [];
  const hasBasePermission = rolePermissions.includes(permission as CapabilityPermission);

  // 3. Check if there is an active explicit delegation
  const activeDelegation = delegations.find(
    d => d.active && 
         d.employeeId === user.id && 
         d.grantedPermission === permission &&
         (!d.resourceId || d.resourceId === context?.entityId) &&
         (!d.expiresDate || new Date(d.expiresDate) > new Date())
  );

  if (!hasDynamicPermission && !hasBasePermission && !activeDelegation) {
    return {
      allowed: false,
      reason: `User role '${user.roleTitle}' lacks permission '${permission}'.`
    };
  }

  // If operational execution of installation, verify technician assignment
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

/**
 * Authoritative Route Permission Configuration for SolarOS
 * Acts as the single source of truth for both Route Guards and Sidebar Navigation.
 */
export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  requiredCapability?: CapabilityPermission;
  readOnlyRoles?: UserRole[];
  description: string;
}

export const ALL_ROLES: UserRole[] = [
  'owner_admin',
  'sales_exec',
  'survey_tech',
  'engineering_lead',
  'warehouse_mgr',
  'install_tech',
  'support_exec',
  'accountant'
];

export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  '/': {
    path: '/',
    allowedRoles: ALL_ROLES,
    description: 'Role-specific default dashboard router'
  },
  '/overview': {
    path: '/overview',
    allowedRoles: ALL_ROLES,
    description: 'Company overview or role dashboard'
  },
  '/sales-overview': {
    path: '/sales-overview',
    allowedRoles: ['owner_admin', 'sales_exec'],
    description: 'Sales performance dashboard'
  },
  '/enquiries': {
    path: '/enquiries',
    allowedRoles: ['owner_admin', 'sales_exec'],
    requiredCapability: 'enquiries.view_all',
    description: 'Customer enquiries and lead capture'
  },
  '/customers': {
    path: '/customers',
    allowedRoles: ['owner_admin', 'sales_exec', 'support_exec'],
    description: 'Customer directory and CRM'
  },
  '/follow-ups': {
    path: '/follow-ups',
    allowedRoles: ['owner_admin', 'sales_exec'],
    description: 'Sales follow-ups and schedule'
  },
  '/surveys': {
    path: '/surveys',
    allowedRoles: ['owner_admin', 'sales_exec'],
    requiredCapability: 'surveys.schedule',
    description: 'Site survey dispatch and schedule'
  },
  '/quotations': {
    path: '/quotations',
    allowedRoles: ['owner_admin', 'sales_exec'],
    description: 'Solar system quotations and estimates'
  },
  '/orders': {
    path: '/orders',
    allowedRoles: ['owner_admin', 'sales_exec', 'accountant'],
    requiredCapability: 'orders.view_all',
    description: 'Customer orders and payments'
  },
  '/subsidies': {
    path: '/subsidies',
    allowedRoles: ['owner_admin', 'sales_exec', 'accountant'],
    requiredCapability: 'subsidies.view',
    description: 'PM Surya Ghar national portal tracking'
  },
  '/field': {
    path: '/field',
    allowedRoles: ['owner_admin', 'survey_tech'],
    requiredCapability: 'surveys.view_assigned',
    description: 'Field survey specialist workspace'
  },
  '/field/dashboard': {
    path: '/field/dashboard',
    allowedRoles: ['owner_admin', 'survey_tech'],
    requiredCapability: 'surveys.view_assigned',
    description: 'Field survey specialist dashboard'
  },
  '/field/assignments': {
    path: '/field/assignments',
    allowedRoles: ['owner_admin', 'survey_tech'],
    requiredCapability: 'surveys.view_assigned',
    description: 'Assigned field inspections'
  },
  '/field/available-surveys': {
    path: '/field/available-surveys',
    allowedRoles: ['owner_admin', 'survey_tech'],
    requiredCapability: 'surveys.view_available',
    description: 'Available unassigned surveys to claim'
  },
  '/field/schedule': {
    path: '/field/schedule',
    allowedRoles: ['owner_admin', 'survey_tech'],
    description: 'Technician visit schedule'
  },
  '/field/reports': {
    path: '/field/reports',
    allowedRoles: ['owner_admin', 'survey_tech'],
    description: 'Survey inspection reports'
  },
  '/field/team': {
    path: '/field/team',
    allowedRoles: ['owner_admin', 'survey_tech'],
    description: 'Survey specialist team directory'
  },
  '/engineering': {
    path: '/engineering',
    allowedRoles: ['owner_admin', 'engineering_lead'],
    requiredCapability: 'surveys.view_all',
    description: 'Engineering feasibility review'
  },
  '/engineering/dashboard': {
    path: '/engineering/dashboard',
    allowedRoles: ['owner_admin', 'engineering_lead'],
    requiredCapability: 'surveys.view_all',
    description: 'Engineering lead dashboard'
  },
  '/engineering/review': {
    path: '/engineering/review',
    allowedRoles: ['owner_admin', 'engineering_lead'],
    requiredCapability: 'surveys.review',
    description: 'Technical feasibility review queue'
  },
  '/engineering/approved': {
    path: '/engineering/approved',
    allowedRoles: ['owner_admin', 'engineering_lead'],
    description: 'Approved feasibility plans'
  },
  '/inventory': {
    path: '/inventory',
    allowedRoles: ['owner_admin', 'warehouse_mgr'],
    requiredCapability: 'inventory.view_all',
    description: 'Warehouse inventory and stock movements'
  },
  '/dispatch': {
    path: '/dispatch',
    allowedRoles: ['owner_admin', 'warehouse_mgr'],
    requiredCapability: 'dispatch.view_all',
    description: 'Order dispatch packing and delivery'
  },
  '/installations': {
    path: '/installations',
    allowedRoles: ['owner_admin', 'install_tech'],
    description: 'Installation operations and site execution'
  },
  '/workforce': {
    path: '/workforce',
    allowedRoles: ['owner_admin'],
    requiredCapability: 'employees.view_all',
    description: 'Company workforce directory'
  },
  '/activity-center': {
    path: '/activity-center',
    allowedRoles: ['owner_admin'],
    requiredCapability: 'audit.view_all',
    description: 'Employee activity and audit stream'
  },
  '/departments': {
    path: '/departments',
    allowedRoles: ['owner_admin'],
    requiredCapability: 'departments.manage',
    description: 'Departments and team structure'
  },
  '/roles-permissions': {
    path: '/roles-permissions',
    allowedRoles: ['owner_admin'],
    requiredCapability: 'roles_permissions.manage',
    description: 'Access control and role management'
  },
  '/approvals': {
    path: '/approvals',
    allowedRoles: ['owner_admin'],
    requiredCapability: 'approvals.view_all',
    description: 'Executive approval requests'
  },
  '/ai-agents': {
    path: '/ai-agents',
    allowedRoles: ['owner_admin'],
    description: 'AI voice agent orchestration'
  },
  '/warranty': {
    path: '/warranty',
    allowedRoles: ['owner_admin', 'support_exec', 'warehouse_mgr'],
    requiredCapability: 'warranty.view_all',
    readOnlyRoles: ['warehouse_mgr'],
    description: 'Warranty traceability and hardware coverage lookup'
  },
  '/service': {
    path: '/service',
    allowedRoles: ['owner_admin', 'support_exec', 'install_tech'],
    description: 'Customer service complaints and repairs'
  },
  '/finance': {
    path: '/finance',
    allowedRoles: ['owner_admin', 'accountant'],
    requiredCapability: 'finance.view_all',
    description: 'Financial ledger, P&L, and accounts'
  },
  '/reports': {
    path: '/reports',
    allowedRoles: ['owner_admin', 'accountant'],
    description: 'Business analytics and executive reporting'
  },
  '/ai': {
    path: '/ai',
    allowedRoles: ['owner_admin'],
    description: 'AI Command Center'
  },
  '/agent-activity': {
    path: '/agent-activity',
    allowedRoles: ['owner_admin'],
    description: 'Autonomous agent runtime monitoring'
  },
  '/notifications': {
    path: '/notifications',
    allowedRoles: ALL_ROLES,
    description: 'User notification center'
  },
  '/profile': {
    path: '/profile',
    allowedRoles: ALL_ROLES,
    description: 'Employee profile details'
  },
  '/settings': {
    path: '/settings',
    allowedRoles: ALL_ROLES,
    description: 'Application and account preferences'
  }
};

export const ROUTE_TO_MODULE_MAP: Record<string, string> = {
  '/': 'overview',
  '/overview': 'overview',
  '/sales-overview': 'overview',
  '/enquiries': 'enquiries',
  '/customers': 'customers',
  '/follow-ups': 'follow_ups',
  '/surveys': 'surveys',
  '/quotations': 'quotations',
  '/orders': 'orders',
  '/subsidies': 'subsidies',
  '/field': 'surveys',
  '/field/dashboard': 'surveys',
  '/field/assignments': 'surveys',
  '/field/available-surveys': 'surveys',
  '/field/schedule': 'surveys',
  '/field/reports': 'surveys',
  '/field/team': 'surveys',
  '/engineering': 'survey_review',
  '/engineering/dashboard': 'survey_review',
  '/engineering/review': 'survey_review',
  '/engineering/approved': 'survey_review',
  '/inventory': 'inventory',
  '/dispatch': 'dispatch',
  '/installations': 'installations',
  '/workforce': 'workforce',
  '/activity-center': 'activity_center',
  '/departments': 'departments',
  '/roles-permissions': 'roles_permissions',
  '/approvals': 'approvals',
  '/ai-agents': 'ai_agents',
  '/warranty': 'warranty',
  '/service': 'service',
  '/finance': 'finance',
  '/reports': 'reports',
  '/ai': 'ai_agents',
  '/agent-activity': 'ai_agents'
};

/**
 * Authoritatively checks whether a route is accessible for a user's role.
 * Dynamically evaluates dynamic role definitions first if supplied.
 */
export function isRouteAllowedForRole(
  path: string, 
  role: UserRole, 
  dynamicRoles?: RoleDefinition[]
): boolean {
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');

  // Universal routes allowed for all authenticated users
  if (['/notifications', '/profile', '/settings'].includes(normalizedPath)) {
    return true;
  }

  // Home routes always resolve to role-specific workspace
  if (normalizedPath === '/' || normalizedPath === '/overview') {
    return true;
  }

  // Find corresponding module key
  let moduleKey = ROUTE_TO_MODULE_MAP[normalizedPath];
  if (!moduleKey) {
    const parentKey = Object.keys(ROUTE_TO_MODULE_MAP).find(
      key => key !== '/' && normalizedPath.startsWith(key)
    );
    if (parentKey) {
      moduleKey = ROUTE_TO_MODULE_MAP[parentKey];
    }
  }

  // If dynamicRoles matrix provided and route maps to a module, evaluate dynamic permissions
  if (dynamicRoles && dynamicRoles.length > 0 && moduleKey) {
    const roleDef = dynamicRoles.find(r => r.roleKey === role || r.id === role);
    if (roleDef && roleDef.permissions) {
      const moduleActions = roleDef.permissions[moduleKey] || [];
      // If user has view or manage permission on this module, route access is GRANTED
      if (moduleActions.includes('view') || moduleActions.includes('manage')) {
        return true;
      }
      // If module is configured in dynamic permissions and view is NOT granted, deny access
      return false;
    }
  }

  // Fallback to static ROUTE_PERMISSIONS
  const permission = ROUTE_PERMISSIONS[normalizedPath];
  if (!permission) {
    const parentKey = Object.keys(ROUTE_PERMISSIONS).find(
      key => key !== '/' && normalizedPath.startsWith(key)
    );
    if (parentKey) {
      return ROUTE_PERMISSIONS[parentKey].allowedRoles.includes(role);
    }
    return true;
  }
  return permission.allowedRoles.includes(role);
}

/**
 * Checks whether a role has read-only access to a specific route
 */
export function isRouteReadOnlyForRole(
  path: string, 
  role: UserRole, 
  dynamicRoles?: RoleDefinition[]
): boolean {
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');

  let moduleKey = ROUTE_TO_MODULE_MAP[normalizedPath];
  if (!moduleKey) {
    const parentKey = Object.keys(ROUTE_TO_MODULE_MAP).find(
      key => key !== '/' && normalizedPath.startsWith(key)
    );
    if (parentKey) {
      moduleKey = ROUTE_TO_MODULE_MAP[parentKey];
    }
  }

  if (dynamicRoles && dynamicRoles.length > 0 && moduleKey) {
    const roleDef = dynamicRoles.find(r => r.roleKey === role || r.id === role);
    if (roleDef && roleDef.permissions) {
      const moduleActions = roleDef.permissions[moduleKey] || [];
      const hasView = moduleActions.includes('view') || moduleActions.includes('manage');
      const hasWrite = moduleActions.some(a => ['create', 'edit', 'delete', 'manage', 'assign', 'approve'].includes(a));
      // Read-only if user can view but has no write actions
      return hasView && !hasWrite;
    }
  }

  const permission = ROUTE_PERMISSIONS[normalizedPath];
  return permission?.readOnlyRoles?.includes(role) || false;
}

