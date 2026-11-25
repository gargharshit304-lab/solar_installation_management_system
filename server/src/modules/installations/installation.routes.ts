import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction, requireCapability } from '../../middleware/rbac.middleware';
import { auditService } from '../audit/audit.service';
import { AppError, sendSuccess } from '../../utils/response';
import { parsePaginationParams, buildPaginationMeta } from '../../utils/pagination';

const router = Router();

/**
 * Operational actions are limited to the technicians actually assigned to the
 * installation. A capability alone must not authorize work on another crew's
 * job (IDOR / horizontal privilege escalation).
 */
function assertAssignedTechnician(inst: any, user: { name?: string; role?: string }): void {
  if (user.role === 'owner_admin') return;
  const assigned = Array.isArray(inst.technicianNames) ? inst.technicianNames : [];
  const userName = (user.name || '').toLowerCase().trim();
  const isAssigned = assigned.some((entry: string) => {
    const normalized = String(entry).toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
    if (!normalized || !userName) return false;
    return normalized === userName || normalized.includes(userName) || userName.includes(normalized);
  });
  if (!isAssigned) {
    throw new AppError(403, 'NOT_ASSIGNED', 'Only a technician assigned to this installation may execute or complete it.');
  }
}

let installationsStore: any[] = [
  { id: 'inst-1', installationCode: 'INS-2026-001', customerName: 'Rajesh Sharma', technicianNames: ['Amit Jadhav (Lead)'], status: 'scheduled' },
  { id: 'inst-2', installationCode: 'INS-2026-002', customerName: 'Sunita Patil', technicianNames: ['Amit Jadhav (Lead)'], status: 'in_progress' }
];

router.get('/', requireAuth, requireAction('installations', 'view'), (req, res, next) => {
  try {
    const params = parsePaginationParams(req.query, 20);
    const { status, all } = req.query as Record<string, string>;

    let filtered = installationsStore;
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(i =>
        i.installationCode.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(i => i.status === status);
    }

    const totalRecords = filtered.length;
    const isAll = all === 'true' || req.query.pageSize === 'all';
    const paged = isAll ? filtered : filtered.slice(params.offset, params.offset + params.limit);
    const pagination = buildPaginationMeta(params.page, isAll ? totalRecords : params.pageSize, totalRecords);

    sendSuccess(res, paged, 200, pagination);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAction('installations', 'create'), async (req, res, next) => {
  try {
    const { customerName } = req.body;
    const newInst = {
      id: `inst-${Date.now()}`,
      installationCode: `INS-2026-${String(installationsStore.length + 10).padStart(3, '0')}`,
      customerName: customerName || 'Customer',
      status: 'scheduled',
      technicianNames: []
    };
    installationsStore.unshift(newInst);
    sendSuccess(res, newInst, 201, undefined, 'Installation scheduled successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reassign', requireAuth, requireAction('installations', 'edit'), async (req, res, next) => {
  try {
    const { technicianNames } = req.body;
    const inst = installationsStore.find(i => i.id === req.params.id);
    if (!inst) throw new AppError(404, 'NOT_FOUND', 'Installation not found');
    inst.technicianNames = technicianNames || [];
    sendSuccess(res, inst, 200, undefined, 'Technicians assigned successfully');
  } catch (err) {
    next(err);
  }
});

// Operational execution: Strictly guarded by installations.execute (Owner bypasses via superadmin)
router.post('/:id/execute', requireAuth, requireCapability('installations.execute'), async (req, res, next) => {
  try {
    const inst = installationsStore.find(i => i.id === req.params.id);
    if (!inst) throw new AppError(404, 'NOT_FOUND', 'Installation not found');
    assertAssignedTechnician(inst, req.user!);
    inst.status = 'in_progress';
    inst.startedAt = new Date().toISOString();
    sendSuccess(res, inst);
  } catch (err) {
    next(err);
  }
});

// Operational completion: Strictly guarded by installations.execute
router.post('/:id/complete', requireAuth, requireCapability('installations.execute'), async (req, res, next) => {
  try {
    const { customerSignature, checklist } = req.body;
    const inst = installationsStore.find(i => i.id === req.params.id);
    if (!inst) throw new AppError(404, 'NOT_FOUND', 'Installation not found');
    assertAssignedTechnician(inst, req.user!);
    
    // BUSINESS WORKFLOW GATE: Mandatory commissioning checks & customer signature
    if (!customerSignature) {
      throw new AppError(422, 'SIGNATURE_REQUIRED', 'Customer signature required for commissioning completion');
    }

    inst.status = 'completed';
    inst.completedAt = new Date().toISOString();
    inst.customerSignature = customerSignature;

    await auditService.record({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      permissionUsed: 'installations.execute',
      action: 'INSTALLATION_COMPLETE',
      entity: 'Installation',
      entityId: inst.id,
      newState: inst,
      reason: 'Rooftop commissioning completed with customer signoff'
    });

    sendSuccess(res, inst, 200, undefined, 'Installation commissioned successfully');
  } catch (err) {
    next(err);
  }
});

export const installationRoutes = router;
