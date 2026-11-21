import { prisma } from '../../db/prisma';
import { ROLE_DEFINITIONS, ROLE_CAPABILITIES, UserRole } from '../../config/constants';
import { auditService } from '../audit/audit.service';
import { AppError } from '../../utils/response';
import { INITIAL_DELEGATIONS } from '../../db/seed';

// In-memory fallback delegations for offline dev/tests
let inMemoryDelegations: any[] = [...INITIAL_DELEGATIONS];

export class RbacService {
  getRoleDefinitions() {
    return Object.entries(ROLE_DEFINITIONS).map(([key, val]) => ({
      roleKey: key as UserRole,
      title: val.title,
      department: val.department,
      description: val.description,
      capabilities: ROLE_CAPABILITIES[key as UserRole] || []
    }));
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
