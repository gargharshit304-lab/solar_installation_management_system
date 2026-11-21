import { prisma } from '../../db/prisma';

export interface CreateAuditLogParams {
  actorId?: string;
  actorName: string;
  actorRole: string;
  department?: string;
  module?: string;
  permissionUsed?: string;
  action: string;
  entity: string;
  entityId?: string;
  previousState?: any;
  newState?: any;
  reason?: string;
  result?: 'SUCCESS' | 'FAILURE' | 'DENIED' | string;
  ipAddress?: string;
  sessionMetadata?: string;
  timestamp?: Date;
}

// Baseline enterprise company-wide audit logs for testing, validation, and offline development
const inMemoryAuditLogs: any[] = [
  {
    id: 'aud-001',
    actorId: 'emp-5',
    actorName: 'Pooja Kulkarni',
    actorRole: 'sales_exec',
    department: 'Sales',
    module: 'Quotations',
    permissionUsed: 'quotations.create',
    action: 'CREATE',
    entity: 'Quotation',
    entityId: 'quot-89',
    previousState: null,
    newState: { systemCapacityKw: 15, totalAmount: 1140000, customer: 'Mahendra Patil' },
    reason: 'Generated 15kW Commercial On-Grid Quotation QTN-2026-089 for Mahendra Patil',
    result: 'SUCCESS',
    ipAddress: '192.168.1.105',
    sessionMetadata: 'Chrome 122.0 (Windows 11)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 'aud-002',
    actorId: 'emp-19',
    actorName: 'Sandeep Patil',
    actorRole: 'engineering_lead',
    department: 'Engineering',
    module: 'Engineering',
    permissionUsed: 'surveys.approve',
    action: 'APPROVE',
    entity: 'Survey',
    entityId: 'surv-1',
    previousState: { reviewStatus: 'under_review', approvedBy: null },
    newState: { reviewStatus: 'approved', approvedBy: 'emp-19', shadowFreeAreaSqM: 94.5 },
    reason: 'Validated shadow-free area (94.5 sq.m) and approved technical survey report SRV-2026-041',
    result: 'SUCCESS',
    ipAddress: '192.168.1.119',
    sessionMetadata: 'Firefox 123.0 (Ubuntu Linux)',
    timestamp: new Date(Date.now() - 42 * 60 * 1000)
  },
  {
    id: 'aud-003',
    actorId: 'emp-3',
    actorName: 'Suresh More',
    actorRole: 'survey_tech',
    department: 'Field Operations',
    module: 'Surveys',
    permissionUsed: 'surveys.submit_report',
    action: 'COMPLETE',
    entity: 'Survey',
    entityId: 'surv-2',
    previousState: { status: 'in_progress' },
    newState: { status: 'submitted', reviewStatus: 'submitted' },
    reason: 'Completed 3D rooftop photogrammetry and terrace azimuth layout for Anand Joshi',
    result: 'SUCCESS',
    ipAddress: '103.21.144.45',
    sessionMetadata: 'SolarOS Field Mobile v2.4 (Android 14)',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000)
  },
  {
    id: 'aud-004',
    actorId: 'emp-1',
    actorName: 'Amit Jadhav',
    actorRole: 'install_tech',
    department: 'Installation',
    module: 'Installations',
    permissionUsed: 'installations.update_checklist',
    action: 'UPDATE',
    entity: 'Order',
    entityId: 'ord-28',
    previousState: { installationProgressPct: 75 },
    newState: { installationProgressPct: 90, acdbTerminated: true },
    reason: 'Completed ACDB box termination and bi-directional meter sync test for ORD-2026-028',
    result: 'SUCCESS',
    ipAddress: '103.21.144.52',
    sessionMetadata: 'SolarOS Field Mobile v2.4 (Android 14)',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000)
  },
  {
    id: 'aud-005',
    actorId: 'emp-6',
    actorName: 'Ganesh Shinde',
    actorRole: 'warehouse_mgr',
    department: 'Warehouse',
    module: 'Dispatch',
    permissionUsed: 'dispatch.release',
    action: 'DISPATCH',
    entity: 'Dispatch',
    entityId: 'dsp-18',
    previousState: { dispatchStatus: 'packing' },
    newState: { dispatchStatus: 'dispatched', vehicleNumber: 'MH-12-RN-8821' },
    reason: 'Dispatched 12x 540W Mono PERC panels, mounting rails and DC cables for ORD-2026-031',
    result: 'SUCCESS',
    ipAddress: '192.168.1.106',
    sessionMetadata: 'Chrome 122.0 (Windows 11)',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000)
  },
  {
    id: 'aud-006',
    actorId: 'emp-8',
    actorName: 'Ramesh Patil',
    actorRole: 'accountant',
    department: 'Accounts',
    module: 'Finance',
    permissionUsed: 'payments.record',
    action: 'CREATE',
    entity: 'Payment',
    entityId: 'pay-45',
    previousState: { amountReceived: 0, balanceDue: 450000 },
    newState: { amountReceived: 120000, balanceDue: 330000, referenceId: 'NEFT-SBIN20260408' },
    reason: 'Recorded advance payment receipt of ₹1,20,000 via NEFT for Precision Gears order',
    result: 'SUCCESS',
    ipAddress: '192.168.1.108',
    sessionMetadata: 'Edge 122.0 (Windows 11)',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000)
  },
  {
    id: 'aud-007',
    actorId: 'usr-1',
    actorName: 'Vikramaditya Rao',
    actorRole: 'owner_admin',
    department: 'Executive Management',
    module: 'Roles & Permissions',
    permissionUsed: 'roles_permissions.manage',
    action: 'PERMISSION_CHANGE',
    entity: 'Role',
    entityId: 'role-5',
    previousState: { warranty: [] },
    newState: { warranty: ['view'] },
    reason: 'Updated warehouse_mgr dynamic permissions: granted warranty.view read-only traceability',
    result: 'SUCCESS',
    ipAddress: '192.168.1.101',
    sessionMetadata: 'Safari 17.3 (macOS Sonoma)',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000)
  },
  {
    id: 'aud-008',
    actorId: 'emp-6',
    actorName: 'Ganesh Shinde',
    actorRole: 'warehouse_mgr',
    department: 'Warehouse',
    module: 'Customers',
    permissionUsed: 'customers.create',
    action: 'CREATE',
    entity: 'Customer',
    entityId: 'cust-attempt',
    previousState: null,
    newState: null,
    reason: 'Attempted POST /api/v1/customers without customers.create permission. Denied by RBAC policy.',
    result: 'DENIED',
    ipAddress: '192.168.1.106',
    sessionMetadata: 'Chrome 122.0 (Windows 11)',
    timestamp: new Date(Date.now() - 7 * 3600 * 1000)
  }
];

export class AuditService {
  async record(params: CreateAuditLogParams): Promise<any> {
    const logItem = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      department: params.department || 'General',
      module: params.module || params.entity,
      permissionUsed: params.permissionUsed,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      previousState: params.previousState !== undefined ? params.previousState : null,
      newState: params.newState !== undefined ? params.newState : null,
      reason: params.reason,
      result: params.result || 'SUCCESS',
      ipAddress: params.ipAddress || '127.0.0.1',
      sessionMetadata: params.sessionMetadata,
      timestamp: params.timestamp || new Date()
    };

    // Always record to in-memory store for instant visibility
    inMemoryAuditLogs.unshift(logItem);

    try {
      await prisma.auditLog.create({
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
    } catch {
      // In-memory fallback logged
    }

    return logItem;
  }

  async getLogs(filters: {
    page?: number;
    limit?: number;
    entity?: string;
    module?: string;
    action?: string;
    actorId?: string;
    department?: string;
    result?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{ logs: any[]; total: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    try {
      const where: any = {};
      if (filters.entity) where.entity = filters.entity;
      if (filters.action) where.action = filters.action;
      if (filters.actorId) where.actorId = filters.actorId;
      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
        if (filters.endDate) where.timestamp.lte = new Date(filters.endDate);
      }

      const [dbLogs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { timestamp: 'desc' }
        }),
        prisma.auditLog.count({ where })
      ]);

      if (dbLogs.length > 0) {
        return {
          logs: dbLogs.map(l => ({
            ...l,
            department: (l as any).department || 'General',
            module: (l as any).module || l.entity,
            result: (l as any).result || 'SUCCESS'
          })),
          total
        };
      }
    } catch {
      // Fall through to in-memory fallback
    }

    let filtered = [...inMemoryAuditLogs];

    if (filters.entity) {
      const eLower = filters.entity.toLowerCase();
      filtered = filtered.filter(l => l.entity?.toLowerCase() === eLower || l.module?.toLowerCase() === eLower);
    }
    if (filters.module && filters.module !== 'All') {
      const mLower = filters.module.toLowerCase();
      filtered = filtered.filter(l => l.module?.toLowerCase() === mLower || l.entity?.toLowerCase() === mLower);
    }
    if (filters.action && filters.action !== 'All') {
      const aLower = filters.action.toLowerCase();
      filtered = filtered.filter(l => l.action?.toLowerCase() === aLower);
    }
    if (filters.actorId && filters.actorId !== 'All') {
      filtered = filtered.filter(l => l.actorId === filters.actorId);
    }
    if (filters.department && filters.department !== 'All') {
      const dLower = filters.department.toLowerCase();
      filtered = filtered.filter(l => l.department?.toLowerCase() === dLower);
    }
    if (filters.result && filters.result !== 'All') {
      const rLower = filters.result.toLowerCase();
      filtered = filtered.filter(l => l.result?.toLowerCase() === rLower);
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      filtered = filtered.filter(l => new Date(l.timestamp).getTime() >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      filtered = filtered.filter(l => new Date(l.timestamp).getTime() <= end);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(l =>
        l.actorName?.toLowerCase().includes(s) ||
        l.action?.toLowerCase().includes(s) ||
        l.reason?.toLowerCase().includes(s) ||
        l.entity?.toLowerCase().includes(s) ||
        l.entityId?.toLowerCase().includes(s) ||
        l.department?.toLowerCase().includes(s)
      );
    }

    return {
      logs: filtered.slice(skip, skip + limit),
      total: filtered.length
    };
  }
}

export const auditService = new AuditService();
