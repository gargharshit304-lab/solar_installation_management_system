import { prisma } from '../../db/prisma';

export interface CreateAuditLogParams {
  actorId?: string;
  actorName: string;
  actorRole: string;
  permissionUsed?: string;
  action: string;
  entity: string;
  entityId?: string;
  previousState?: any;
  newState?: any;
  reason?: string;
  ipAddress?: string;
}

// In-memory fallback logs for testing and offline development
const inMemoryAuditLogs: any[] = [];

export class AuditService {
  async record(params: CreateAuditLogParams): Promise<any> {
    try {
      const log = await prisma.auditLog.create({
        data: {
          actorId: params.actorId,
          actorName: params.actorName,
          actorRole: params.actorRole,
          permissionUsed: params.permissionUsed,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          previousState: params.previousState ? JSON.stringify(params.previousState) : undefined,
          newState: params.newState ? JSON.stringify(params.newState) : undefined,
          reason: params.reason,
          ipAddress: params.ipAddress
        }
      });
      return log;
    } catch {
      // In-memory fallback
      const log = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ...params,
        timestamp: new Date()
      };
      inMemoryAuditLogs.unshift(log);
      return log;
    }
  }

  async getLogs(filters: {
    page?: number;
    limit?: number;
    entity?: string;
    action?: string;
    actorId?: string;
  }): Promise<{ logs: any[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    try {
      const where: any = {};
      if (filters.entity) where.entity = filters.entity;
      if (filters.action) where.action = filters.action;
      if (filters.actorId) where.actorId = filters.actorId;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { timestamp: 'desc' }
        }),
        prisma.auditLog.count({ where })
      ]);

      return { logs, total };
    } catch {
      let filtered = inMemoryAuditLogs;
      if (filters.entity) filtered = filtered.filter(l => l.entity === filters.entity);
      if (filters.action) filtered = filtered.filter(l => l.action === filters.action);
      if (filters.actorId) filtered = filtered.filter(l => l.actorId === filters.actorId);

      return {
        logs: filtered.slice(skip, skip + limit),
        total: filtered.length
      };
    }
  }
}

export const auditService = new AuditService();
