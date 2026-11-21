import { prisma } from '../../db/prisma';
import { ROLE_DEFINITIONS, UserRole } from '../../config/constants';
import { auditService } from '../audit/audit.service';
import { AppError } from '../../utils/response';
import { INITIAL_DELEGATIONS } from '../../db/seed';

export interface DynamicRoleDefinition {
  id: string;
  roleKey: UserRole;
  name: string;
  department: string;
  description: string;
  permissions: Record<string, string[]>;
}

// Initial baseline matrix permissions matching INITIAL_ROLES_PERMISSIONS
const INITIAL_ROLE_MATRIX: Record<UserRole, Record<string, string[]>> = {
  owner_admin: {
    overview: ['view', 'manage', 'export'],
    customers: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
    enquiries: ['view', 'create', 'edit', 'delete', 'assign', 'manage', 'export'],
    follow_ups: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
    surveys: ['view', 'create', 'edit', 'delete', 'assign', 'approve', 'manage', 'export'],
    survey_review: ['view', 'approve', 'edit', 'manage'],
    quotations: ['view', 'create', 'edit', 'delete', 'approve', 'manage', 'export'],
    orders: ['view', 'create', 'edit', 'delete', 'approve', 'manage', 'export'],
    inventory: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
    dispatch: ['view', 'create', 'edit', 'approve', 'manage', 'export'],
    installations: ['view', 'create', 'edit', 'assign', 'approve', 'manage', 'export'],
    workforce: ['view', 'create', 'edit', 'delete', 'assign', 'approve', 'manage', 'export'],
    departments: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
    roles_permissions: ['view', 'create', 'edit', 'delete', 'manage'],
    roles: ['view', 'create', 'edit', 'delete', 'manage'],
    permissions: ['view', 'create', 'edit', 'delete', 'manage'],
    approvals: ['view', 'approve', 'edit', 'delete', 'manage'],
    finance: ['view', 'create', 'edit', 'approve', 'manage', 'export'],
    reports: ['view', 'manage', 'export'],
    ai_agents: ['view', 'create', 'edit', 'manage'],
    warranty: ['view', 'create', 'edit', 'approve', 'manage', 'export'],
    service: ['view', 'create', 'edit', 'delete', 'manage'],
    subsidies: ['view', 'create', 'edit', 'approve', 'manage', 'export'],
    activity_center: ['view', 'export'],
    audit: ['view', 'view_company_wide', 'export'],
    settings: ['view', 'edit', 'manage']
  },
  sales_exec: {
    overview: ['view'],
    customers: ['view', 'create', 'edit'],
    enquiries: ['view', 'create', 'edit'],
    follow_ups: ['view', 'create', 'edit'],
    surveys: ['view', 'create', 'assign'],
    quotations: ['view', 'create', 'edit', 'export'],
    orders: ['view', 'create'],
    subsidies: ['view', 'create'],
    reports: ['view']
  },
  survey_tech: {
    overview: ['view'],
    surveys: ['view', 'create', 'edit'],
    customers: ['view']
  },
  engineering_lead: {
    overview: ['view'],
    surveys: ['view', 'edit'],
    survey_review: ['view', 'approve', 'edit'],
    installations: ['view'],
    reports: ['view']
  },
  warehouse_mgr: {
    overview: ['view'],
    inventory: ['view', 'create', 'edit', 'manage', 'export'],
    dispatch: ['view', 'create', 'edit', 'manage', 'export'],
    warranty: ['view'], // Read-only warranty trace
    installations: ['view']
  },
  install_tech: {
    overview: ['view'],
    installations: ['view', 'edit'],
    service: ['view', 'edit'],
    inventory: ['view'],
    surveys: ['view']
  },
  support_exec: {
    overview: ['view'],
    service: ['view', 'create', 'edit', 'manage'],
    warranty: ['view', 'create', 'edit', 'approve', 'manage'],
    customers: ['view']
  },
  accountant: {
    overview: ['view'],
    finance: ['view', 'create', 'edit', 'approve', 'manage', 'export'],
    orders: ['view', 'edit', 'export'],
    subsidies: ['view', 'edit', 'approve'],
    reports: ['view', 'export'],
    approvals: ['view', 'create']
  }
};

// Dynamic in-memory store synchronized with DB
let inMemoryRoleMatrix: Record<string, Record<string, string[]>> = JSON.parse(JSON.stringify(INITIAL_ROLE_MATRIX));
let inMemoryDelegations: any[] = [...INITIAL_DELEGATIONS];

export class RbacService {
  async getRoleDefinitions(): Promise<DynamicRoleDefinition[]> {
    try {
      const dbRoles = await prisma.role.findMany();
      if (dbRoles.length > 0) {
        return dbRoles.map(r => {
          const roleKey = r.id as UserRole;
          const def = ROLE_DEFINITIONS[roleKey] || {
            title: r.name,
            department: 'General',
            description: r.description || ''
          };
          const permissions = (r.permissions && typeof r.permissions === 'object')
            ? (r.permissions as Record<string, string[]>)
            : inMemoryRoleMatrix[roleKey] || {};

          return {
            id: r.id,
            roleKey,
            name: r.name || def.title,
            department: def.department,
            description: r.description || def.description,
            permissions
          };
        });
      }
    } catch {
      // Fallback to in-memory store
    }

    return Object.entries(ROLE_DEFINITIONS).map(([key, val]) => ({
      id: key,
      roleKey: key as UserRole,
      name: val.title,
      department: val.department,
      description: val.description,
      permissions: inMemoryRoleMatrix[key] || {}
    }));
  }

  async getRoleByKey(roleKey: string): Promise<DynamicRoleDefinition | null> {
    const roles = await this.getRoleDefinitions();
    return roles.find(r => r.roleKey === roleKey || r.id === roleKey) || null;
  }

  async updateRolePermissions(
    roleKey: string,
    permissions: Record<string, string[]>,
    actor: any
  ): Promise<DynamicRoleDefinition> {
    if (roleKey === 'owner_admin') {
      // Ensure owner maintains core governance and append-only audit trail access
      permissions['roles_permissions'] = ['view', 'create', 'edit', 'delete', 'manage'];
      permissions['roles'] = ['view', 'create', 'edit', 'delete', 'manage'];
      permissions['permissions'] = ['view', 'create', 'edit', 'delete', 'manage'];
      permissions['approvals'] = ['view', 'approve', 'edit', 'delete', 'manage'];
      permissions['activity_center'] = ['view', 'export'];
      permissions['audit'] = ['view', 'view_company_wide', 'export'];
    }

    const previousRole = await this.getRoleByKey(roleKey);
    const previousPermissions = previousRole?.permissions || {};

    // 1. Update In-Memory cache immediately for zero latency
    inMemoryRoleMatrix[roleKey] = permissions;

    // 2. Persist to PostgreSQL / Prisma
    try {
      await prisma.role.upsert({
        where: { id: roleKey },
        update: { permissions },
        create: {
          id: roleKey,
          name: ROLE_DEFINITIONS[roleKey as UserRole]?.title || roleKey,
          description: ROLE_DEFINITIONS[roleKey as UserRole]?.description || '',
          permissions
        }
      });
    } catch {
      // Offline fallback: already updated in memory
    }

    // 3. Immutable Enterprise Audit Trail
    await auditService.record({
      actorId: actor?.id,
      actorName: actor?.name || 'Administrator',
      actorRole: actor?.role || 'owner_admin',
      permissionUsed: 'roles_permissions.manage',
      action: 'ROLE_PERMISSIONS_UPDATE',
      entity: 'Role',
      entityId: roleKey,
      previousState: previousPermissions,
      newState: permissions,
      reason: `Role permissions for '${roleKey}' updated by ${actor?.name || 'Administrator'}`
    });

    const updated = await this.getRoleByKey(roleKey);
    return updated!;
  }

  /**
   * Evaluates whether a role dynamically possesses an action or capability.
   * STRICT RULE: VIEW never implies CREATE, EDIT, DELETE, ASSIGN, APPROVE, EXPORT, MANAGE.
   */
  hasPermission(roleKey: string, permission: string): boolean {
    const rolePermissions = inMemoryRoleMatrix[roleKey] || {};

    // STRICT GOVERNANCE RULE: Owner cannot execute field installations directly
    if (roleKey === 'owner_admin' && permission.startsWith('installations.execute')) {
      return false;
    }

    // Parse module and action
    let moduleKey = '';
    let actionKey = '';

    if (permission.includes('.')) {
      const parts = permission.split('.');
      moduleKey = parts[0];
      actionKey = parts[1];
    } else if (permission.includes(':')) {
      const parts = permission.split(':');
      moduleKey = parts[0];
      actionKey = parts[1];
    } else {
      moduleKey = permission;
      actionKey = 'view';
    }

    // Normalize read synonyms strictly to view
    if (actionKey === 'read' || actionKey === 'view_all' || actionKey === 'view_company_wide' || actionKey === 'view_assigned' || actionKey === 'view_available') {
      actionKey = 'view';
    }

    // Strict Audit Log Immutability: Audit records are append-only.
    // No role, including owner_admin, may edit, delete, or modify audit records.
    if (['audit', 'activity_center', 'activity'].includes(moduleKey)) {
      if (['edit', 'delete', 'update', 'modify', 'purge'].includes(actionKey)) {
        return false;
      }
    }

    // Safe bootstrap for canonical Owner (owner_admin) administrative governance
    // Ensures owner can never be locked out of governance even if dynamic tables are empty
    if (roleKey === 'owner_admin') {
      const adminGovModules = ['roles', 'permissions', 'roles_permissions', 'workforce', 'employees', 'departments', 'approvals', 'settings', 'overview'];
      if (adminGovModules.includes(moduleKey)) {
        if (['view', 'create', 'edit', 'delete', 'assign', 'approve', 'manage', 'export'].includes(actionKey)) {
          return true;
        }
      }
      if (['audit', 'activity_center', 'activity'].includes(moduleKey)) {
        if (['view', 'view_all', 'view_company_wide', 'export', 'read'].includes(actionKey)) {
          return true;
        }
        return false;
      }
    }

    // Canonical module key alias resolution
    const moduleKeysToCheck = [moduleKey];
    if (moduleKey === 'roles' || moduleKey === 'permissions') {
      moduleKeysToCheck.push('roles_permissions', 'roles', 'permissions');
    } else if (moduleKey === 'roles_permissions') {
      moduleKeysToCheck.push('roles', 'permissions');
    } else if (moduleKey === 'workforce') {
      moduleKeysToCheck.push('employees');
    } else if (moduleKey === 'employees') {
      moduleKeysToCheck.push('workforce');
    } else if (moduleKey === 'audit' || moduleKey === 'activity_center' || moduleKey === 'activity') {
      moduleKeysToCheck.push('audit', 'activity_center', 'activity');
    }

    let grantedActions: string[] = [];
    for (const m of moduleKeysToCheck) {
      if (rolePermissions[m]) {
        grantedActions = [...grantedActions, ...rolePermissions[m]];
      }
    }

    // STRICT ENFORCEMENT: VIEW never implies any mutation or management
    if (actionKey === 'view') {
      return grantedActions.includes('view') || grantedActions.includes('manage');
    }

    // For any non-view action, it must be explicitly present in grantedActions
    if (grantedActions.includes(actionKey)) {
      return true;
    }

    // Direct string match fallback (e.g. specialized capability string)
    return grantedActions.includes(permission);
  }

  /**
   * Central Action-Authorization Service Methods
   * Evaluates authenticated user permissions at service and controller boundaries.
   */
  async checkActionPermission(
    user: any,
    resource: string,
    action: 'view' | 'create' | 'edit' | 'delete' | 'assign' | 'approve' | 'export' | 'manage' | string,
    context?: { entityId?: string; assignedStaff?: string[] }
  ): Promise<boolean> {
    if (!user || !user.role) return false;

    // Strict Audit Log Immutability: Audit records are append-only.
    // No role, including owner_admin, may edit, delete, or modify audit records.
    if (['audit', 'activity_center', 'activity'].includes(resource)) {
      if (['edit', 'delete', 'update', 'modify', 'purge'].includes(action)) {
        return false;
      }
    }

    // Strict Administrative Separation: Owner cannot execute field installations without explicit delegation
    if (user.role === 'owner_admin' && (action === 'execute' || resource === 'installations' && action.startsWith('execute'))) {
      const activeDelegations = await this.getActiveDelegationsForUser(user.id, 'installations.execute');
      return activeDelegations.length > 0;
    }

    // Canonical Owner Administrative Bootstrap: Non-circular governance guarantee
    if (user.role === 'owner_admin') {
      const adminGovResources = [
        'roles', 'permissions', 'roles_permissions',
        'workforce', 'employees', 'departments', 'approvals', 'settings', 'overview'
      ];
      if (adminGovResources.includes(resource)) {
        if (['view', 'create', 'edit', 'delete', 'assign', 'approve', 'manage', 'export'].includes(action)) {
          return true;
        }
      }
      if (['audit', 'activity_center', 'activity'].includes(resource)) {
        if (['view', 'view_all', 'view_company_wide', 'export', 'read'].includes(action)) {
          return true;
        }
        return false;
      }
    }

    const rolePermissions = inMemoryRoleMatrix[user.role] || {};

    // Canonical resource alias resolution
    const targetResources = [resource];
    if (resource === 'roles' || resource === 'permissions') {
      targetResources.push('roles_permissions', 'roles', 'permissions');
    } else if (resource === 'roles_permissions') {
      targetResources.push('roles', 'permissions');
    } else if (resource === 'workforce') {
      targetResources.push('employees');
    } else if (resource === 'employees') {
      targetResources.push('workforce');
    } else if (resource === 'audit' || resource === 'activity_center' || resource === 'activity') {
      targetResources.push('audit', 'activity_center', 'activity');
    }

    let moduleActions: string[] = [];
    for (const r of targetResources) {
      if (rolePermissions[r]) {
        moduleActions = [...moduleActions, ...rolePermissions[r]];
      }
    }

    // 1. Strict exact action match
    if (moduleActions.includes(action)) {
      return true;
    }

    // 2. View synonyms
    if (action === 'view' && (moduleActions.includes('read') || moduleActions.includes('view_all') || moduleActions.includes('manage'))) {
      return true;
    }

    // 3. Operational Delegations check
    const specificPerm = `${resource}.${action}`;
    const delegations = await this.getActiveDelegationsForUser(user.id, specificPerm);
    if (delegations.length > 0) {
      if (!context?.entityId) return true;
      const matching = delegations.find(d => !d.resourceId || d.resourceId === context.entityId);
      if (matching) return true;
    }

    return false;
  }

  async canView(user: any, resource: string): Promise<boolean> {
    return this.checkActionPermission(user, resource, 'view');
  }

  async canCreate(user: any, resource: string): Promise<boolean> {
    return this.checkActionPermission(user, resource, 'create');
  }

  async canEdit(user: any, resource: string, context?: any): Promise<boolean> {
    return this.checkActionPermission(user, resource, 'edit', context);
  }

  async canDelete(user: any, resource: string, context?: any): Promise<boolean> {
    return this.checkActionPermission(user, resource, 'delete', context);
  }

  async canAssign(user: any, resource: string, context?: any): Promise<boolean> {
    return this.checkActionPermission(user, resource, 'assign', context);
  }

  async canApprove(user: any, resource: string, context?: any): Promise<boolean> {
    return this.checkActionPermission(user, resource, 'approve', context);
  }

  async canExport(user: any, resource: string): Promise<boolean> {
    return this.checkActionPermission(user, resource, 'export');
  }

  async canManage(user: any, resource: string): Promise<boolean> {
    return this.checkActionPermission(user, resource, 'manage');
  }

  async canExecute(user: any, resource: string, action: string, context?: any): Promise<boolean> {
    return this.checkActionPermission(user, resource, action, context);
  }

  getEffectiveCapabilities(roleKey: string): string[] {
    const rolePermissions = inMemoryRoleMatrix[roleKey] || {};
    const capabilities: string[] = [];

    for (const [moduleKey, actions] of Object.entries(rolePermissions)) {
      for (const action of actions) {
        capabilities.push(`${moduleKey}.${action}`);
        if (action === 'view') {
          capabilities.push(`${moduleKey}.view_all`);
          capabilities.push(`${moduleKey}.read`);
        }
      }
    }

    return Array.from(new Set(capabilities));
  }

  async getActiveDelegationsForUser(userId: string, permission?: string): Promise<any[]> {
    try {
      const now = new Date();
      const where: any = {
        employeeId: userId,
        active: true,
        effectiveFrom: { lte: now },
        effectiveTo: { gte: now }
      };
      if (permission) {
        where.grantedPermission = permission;
      }
      return await prisma.operationalDelegation.findMany({ where });
    } catch {
      const now = new Date();
      return inMemoryDelegations.filter(d => 
        d.employeeId === userId &&
        d.active &&
        new Date(d.effectiveFrom) <= now &&
        new Date(d.effectiveTo) >= now &&
        (!permission || d.grantedPermission === permission)
      );
    }
  }

  async getAllDelegations(): Promise<any[]> {
    try {
      return await prisma.operationalDelegation.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch {
      return inMemoryDelegations;
    }
  }

  async createDelegation(data: {
    employeeId: string;
    employeeName: string;
    grantedPermission: string;
    departmentScope: string;
    resourceId?: string;
    authorizedBy: string;
    justification: string;
    effectiveFrom: string;
    effectiveTo: string;
  }, actor: any): Promise<any> {
    const delegationCode = `DEL-2026-${String(inMemoryDelegations.length + 1).padStart(3, '0')}`;

    try {
      const created = await prisma.operationalDelegation.create({
        data: {
          delegationCode,
          employeeId: data.employeeId,
          employeeName: data.employeeName,
          grantedPermission: data.grantedPermission,
          departmentScope: data.departmentScope,
          resourceId: data.resourceId,
          authorizedBy: actor.name || actor.email,
          justification: data.justification,
          effectiveFrom: new Date(data.effectiveFrom),
          effectiveTo: new Date(data.effectiveTo),
          active: true
        }
      });

      await auditService.record({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        permissionUsed: 'delegations.manage',
        action: 'DELEGATION_CREATE',
        entity: 'OperationalDelegation',
        entityId: created.id,
        newState: created,
        reason: data.justification
      });

      return created;
    } catch {
      const created = {
        id: `del-${Date.now()}`,
        delegationCode,
        ...data,
        authorizedBy: actor.name || actor.email,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: new Date(data.effectiveTo),
        active: true,
        createdAt: new Date()
      };
      inMemoryDelegations.unshift(created);

      await auditService.record({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        permissionUsed: 'delegations.manage',
        action: 'DELEGATION_CREATE',
        entity: 'OperationalDelegation',
        entityId: created.id,
        newState: created,
        reason: data.justification
      });

      return created;
    }
  }

  async revokeDelegation(id: string, actor: any): Promise<any> {
    try {
      const existing = await prisma.operationalDelegation.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError(404, 'NOT_FOUND', 'Operational delegation not found.');
      }

      const updated = await prisma.operationalDelegation.update({
        where: { id },
        data: { active: false }
      });

      await auditService.record({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        permissionUsed: 'delegations.manage',
        action: 'DELEGATION_REVOKE',
        entity: 'OperationalDelegation',
        entityId: id,
        previousState: existing,
        newState: updated,
        reason: 'Revoked by administrator'
      });

      return updated;
    } catch (e: any) {
      if (e instanceof AppError) throw e;
      const target = inMemoryDelegations.find(d => d.id === id);
      if (!target) {
        throw new AppError(404, 'NOT_FOUND', 'Operational delegation not found.');
      }
      target.active = false;

      await auditService.record({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        permissionUsed: 'delegations.manage',
        action: 'DELEGATION_REVOKE',
        entity: 'OperationalDelegation',
        entityId: id,
        reason: 'Revoked by administrator'
      });

      return target;
    }
  }
}

export const rbacService = new RbacService();
