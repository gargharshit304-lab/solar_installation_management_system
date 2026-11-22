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
  version?: number;
  updatedAt?: string | Date;
}

// Initial baseline matrix permissions matching the simplified 4-permission model (view, create, edit, delete)
const INITIAL_ROLE_MATRIX: Record<UserRole, Record<string, string[]>> = {
  owner_admin: {
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
  },
  sales_exec: {
    overview: ['view'],
    customers: ['view', 'create', 'edit'],
    enquiries: ['view', 'create', 'edit'],
    follow_ups: ['view', 'create', 'edit'],
    surveys: ['view', 'create', 'edit'],
    quotations: ['view', 'create', 'edit'],
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
    survey_review: ['view', 'edit'],
    installations: ['view'],
    reports: ['view']
  },
  warehouse_mgr: {
    overview: ['view'],
    inventory: ['view', 'create', 'edit'],
    dispatch: ['view', 'create', 'edit'],
    warranty: ['view'],
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
    service: ['view', 'create', 'edit'],
    warranty: ['view', 'create', 'edit'],
    customers: ['view']
  },
  accountant: {
    overview: ['view'],
    finance: ['view', 'create', 'edit'],
    orders: ['view', 'edit'],
    subsidies: ['view', 'edit'],
    reports: ['view'],
    approvals: ['view', 'create', 'edit']
  }
};

// Dynamic in-memory store synchronized with DB
let inMemoryRoleMatrix: Record<string, Record<string, string[]>> = JSON.parse(JSON.stringify(INITIAL_ROLE_MATRIX));
let inMemoryDelegations: any[] = [...INITIAL_DELEGATIONS];

export class RbacService {
  private lastSyncedAt: number = 0;
  private maxVersion: number = 1;
  private latestUpdatedAt: Date = new Date();

  async ensureLatestPermissions(force: boolean = false): Promise<void> {
    const now = Date.now();
    if (!force && this.lastSyncedAt > 0 && (now - this.lastSyncedAt) < 5000) {
      return;
    }

    try {
      const dbRoles = await prisma.role.findMany({ orderBy: { id: 'asc' } });
      if (dbRoles && dbRoles.length > 0) {
        let maxV = 1;
        let latestUp = new Date(0);
        for (const r of dbRoles) {
          const roleKey = r.id;
          let perms: Record<string, string[]> = {};
          if (r.permissions && typeof r.permissions === 'object' && !Array.isArray(r.permissions)) {
            perms = r.permissions as Record<string, string[]>;
          } else if (inMemoryRoleMatrix[roleKey]) {
            perms = inMemoryRoleMatrix[roleKey];
          }
          inMemoryRoleMatrix[roleKey] = perms;
          if (r.version && r.version > maxV) maxV = r.version;
          if (r.updatedAt && new Date(r.updatedAt) > latestUp) latestUp = new Date(r.updatedAt);
        }
        this.maxVersion = maxV;
        this.latestUpdatedAt = latestUp;
        this.lastSyncedAt = now;
      }
    } catch (err) {
      console.error('Failed to sync permissions from database:', err);
    }
  }

  async getRbacVersion(): Promise<{ version: number; lastModified: string }> {
    await this.ensureLatestPermissions();
    return {
      version: this.maxVersion,
      lastModified: this.latestUpdatedAt.toISOString()
    };
  }

  async getRoleDefinitions(): Promise<DynamicRoleDefinition[]> {
    try {
      const dbRoles = await prisma.role.findMany({ orderBy: { id: 'asc' } });
      if (dbRoles.length > 0) {
        let maxV = 1;
        let latestUp = new Date(0);
        const list = dbRoles.map(r => {
          const roleKey = r.id as UserRole;
          const def = ROLE_DEFINITIONS[roleKey] || {
            title: r.name,
            department: 'General',
            description: r.description || ''
          };
          let permissions: Record<string, string[]> = {};
          if (r.permissions && typeof r.permissions === 'object' && !Array.isArray(r.permissions)) {
            permissions = r.permissions as Record<string, string[]>;
          } else if (inMemoryRoleMatrix[roleKey]) {
            permissions = inMemoryRoleMatrix[roleKey];
          }

          // Keep in-memory cache synchronized with PostgreSQL
          inMemoryRoleMatrix[roleKey] = permissions;
          if (r.version && r.version > maxV) maxV = r.version;
          if (r.updatedAt && new Date(r.updatedAt) > latestUp) latestUp = new Date(r.updatedAt);

          return {
            id: r.id,
            roleKey,
            name: r.name || def.title,
            department: def.department,
            description: r.description || def.description,
            permissions,
            version: r.version,
            updatedAt: r.updatedAt
          };
        });

        this.maxVersion = maxV;
        this.latestUpdatedAt = latestUp;
        this.lastSyncedAt = Date.now();
        return list;
      }
    } catch (err) {
      console.error('Failed to query roles from database, using cached matrix:', err);
    }

    return Object.entries(ROLE_DEFINITIONS).map(([key, val]) => ({
      id: key,
      roleKey: key as UserRole,
      name: val.title,
      department: val.department,
      description: val.description,
      permissions: inMemoryRoleMatrix[key] || {},
      version: 1,
      updatedAt: new Date().toISOString()
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
      // SUPERADMIN — FULL ACCESS: Owner maintains full CRUD across all current and future modules
      for (const mod of Object.keys(INITIAL_ROLE_MATRIX.owner_admin)) {
        permissions[mod] = mod === 'audit' ? ['view'] : ['view', 'create', 'edit', 'delete'];
      }
    } else {
      // Sanitize permissions strictly to the 4 canonical permissions: view, create, edit, delete
      const sanitized: Record<string, string[]> = {};
      for (const [mod, acts] of Object.entries(permissions)) {
        if (Array.isArray(acts)) {
          const mapped = new Set<string>();
          for (const a of acts) {
            if (a === 'view' || a === 'read' || a === 'view_all' || a === 'view_company_wide' || a === 'export') {
              mapped.add('view');
            } else if (a === 'create') {
              mapped.add('create');
            } else if (a === 'edit' || a === 'assign' || a === 'approve' || a === 'manage' || a === 'update') {
              mapped.add('edit');
            } else if (a === 'delete') {
              mapped.add('delete');
            }
          }
          sanitized[mod] = Array.from(mapped);
        }
      }
      permissions = sanitized;
    }

    const previousRole = await this.getRoleByKey(roleKey);
    const previousPermissions = previousRole?.permissions || {};

    // 1. Persist directly to Supabase PostgreSQL without silent catch
    try {
      await prisma.role.upsert({
        where: { id: roleKey },
        update: { 
          permissions,
          version: { increment: 1 },
          updatedAt: new Date()
        },
        create: {
          id: roleKey,
          name: ROLE_DEFINITIONS[roleKey as UserRole]?.title || roleKey,
          description: ROLE_DEFINITIONS[roleKey as UserRole]?.description || '',
          permissions,
          version: 1,
          updatedAt: new Date()
        }
      });
    } catch (err: any) {
      console.error(`PostgreSQL role upsert failed for '${roleKey}':`, err);
      throw new AppError(500, 'DATABASE_ERROR', `Failed to persist role permissions to database: ${err.message}`);
    }

    // 2. Synchronize in-memory cache and timestamp
    inMemoryRoleMatrix[roleKey] = permissions;
    this.lastSyncedAt = Date.now();

    // 3. Immutable Enterprise Audit Trail
    await auditService.record({
      actorId: actor?.id,
      actorName: actor?.name || 'Administrator',
      actorRole: actor?.role || 'owner_admin',
      permissionUsed: 'roles_permissions.edit',
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
   * STRICT 4-PERMISSION MODEL: VIEW, CREATE, EDIT, DELETE.
   */
  async hasPermission(roleKey: string, permission: string): Promise<boolean> {
    await this.ensureLatestPermissions();

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

    // Superadmin Guarantee: Owner has unrestricted access to all modules and operations
    if (roleKey === 'owner_admin') {
      if (['audit', 'activity_center', 'activity'].includes(moduleKey)) {
        if (['edit', 'delete', 'update', 'modify', 'purge'].includes(actionKey)) {
          return false;
        }
        return true;
      }
      return true;
    }

    // Map legacy action synonyms to the 4 canonical permissions
    if (actionKey === 'read' || actionKey === 'view_all' || actionKey === 'view_company_wide' || actionKey === 'view_assigned' || actionKey === 'view_available' || actionKey === 'export') {
      actionKey = 'view';
    } else if (actionKey === 'assign' || actionKey === 'approve' || actionKey === 'manage' || actionKey === 'update') {
      actionKey = 'edit';
    }

    const rolePermissions = inMemoryRoleMatrix[roleKey] || {};

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

    // Strict 4-permission check
    return grantedActions.includes(actionKey);
  }

  /**
   * Central Action-Authorization Service Methods
   * Evaluates authenticated user permissions at service and controller boundaries.
   */
  async checkActionPermission(
    user: any,
    resource: string,
    action: 'view' | 'create' | 'edit' | 'delete' | string,
    context?: { entityId?: string; assignedStaff?: string[] }
  ): Promise<boolean> {
    if (!user || !user.role) return false;

    await this.ensureLatestPermissions();

    // Superadmin Guarantee: Owner & Managing Director has unrestricted access
    // across every module and every operation in the entire application
    if (user.role === 'owner_admin') {
      // Immutable Audit Log Protection: Audit records are append-only
      if (['audit', 'activity_center', 'activity'].includes(resource)) {
        if (['edit', 'delete', 'update', 'modify', 'purge'].includes(action)) {
          return false;
        }
        return true;
      }
      return true;
    }

    // Normalize incoming action to the 4 core permissions: view, create, edit, delete
    let canonicalAction = action;
    if (['read', 'view_all', 'view_company_wide', 'export'].includes(action)) {
      canonicalAction = 'view';
    } else if (['assign', 'approve', 'manage', 'update', 'status'].includes(action)) {
      canonicalAction = 'edit';
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

    // Exact check against the 4 core permissions
    if (moduleActions.includes(canonicalAction)) {
      return true;
    }

    // Operational Delegations check
    const specificPerm = `${resource}.${canonicalAction}`;
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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (!isUuid) {
        const now = new Date();
        return inMemoryDelegations.filter(d => 
          d.employeeId === userId &&
          d.active &&
          new Date(d.effectiveFrom) <= now &&
          new Date(d.effectiveTo) >= now &&
          (!permission || d.grantedPermission === permission)
        );
      }

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
