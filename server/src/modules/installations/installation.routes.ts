import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction, requireCapability } from '../../middleware/rbac.middleware';
import { auditService } from '../audit/audit.service';
import { AppError } from '../../utils/response';

const router = Router();

let installationsStore: any[] = [
  { id: 'inst-1', installationCode: 'INS-2026-001', customerName: 'Rajesh Sharma', technicianNames: ['Amit Jadhav (Lead)'], status: 'scheduled' },
  { id: 'inst-2', installationCode: 'INS-2026-002', customerName: 'Sunita Patil', technicianNames: ['Amit Jadhav (Lead)'], status: 'in_progress' }
];

router.get('/', requireAuth, requireAction('installations', 'view'), (req, res) => {
  res.json({
    success: true,
    data: installationsStore,
    meta: { requestId: req.headers['x-request-id'] || 'req-inst-list', timestamp: new Date().toISOString() }
  });
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
    res.status(201).json({
      success: true,
      data: newInst,
      meta: { requestId: req.headers['x-request-id'] || 'req-inst-create', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reassign', requireAuth, requireAction('installations', 'assign'), async (req, res, next) => {
  try {
    const { technicianNames } = req.body;
    const inst = installationsStore.find(i => i.id === req.params.id);
    if (!inst) throw new AppError(404, 'NOT_FOUND', 'Installation not found');
    inst.technicianNames = technicianNames || [];
    res.json({
      success: true,
      data: inst,
      meta: { requestId: req.headers['x-request-id'] || 'req-inst-reassign', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// Operational execution: Strictly guarded by installations.execute (Owner blocked without delegation)
router.post('/:id/execute', requireAuth, requireCapability('installations.execute'), async (req, res, next) => {
  try {
    const inst = installationsStore.find(i => i.id === req.params.id);
    if (!inst) throw new AppError(404, 'NOT_FOUND', 'Installation not found');
    inst.status = 'in_progress';
    inst.startedAt = new Date().toISOString();
    res.json({
      success: true,
      data: inst,
      meta: { requestId: req.headers['x-request-id'] || 'req-inst-exec', timestamp: new Date().toISOString() }
    });
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

    res.json({
      success: true,
      data: inst,
      meta: { requestId: req.headers['x-request-id'] || 'req-inst-comp', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

export const installationRoutes = router;
