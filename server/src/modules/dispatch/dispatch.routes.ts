import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { auditService } from '../audit/audit.service';
import { AppError } from '../../utils/response';

const router = Router();

let dispatchStore: any[] = [
  { id: 'dsp-1', dispatchNumber: 'DSP-2026-001', orderId: 'ord-101', customerName: 'Rajesh Sharma', paymentVerified: true, status: 'packed' },
  { id: 'dsp-2', dispatchNumber: 'DSP-2026-002', orderId: 'ord-102', customerName: 'Sunita Patil', paymentVerified: false, status: 'pending' }
];

router.get('/', requireAuth, requireAction('dispatch', 'view'), (req, res) => {
  res.json({
    success: true,
    data: dispatchStore,
    meta: { requestId: req.headers['x-request-id'] || 'req-dsp-list', timestamp: new Date().toISOString() }
  });
});

router.post('/', requireAuth, requireAction('dispatch', 'create'), async (req, res, next) => {
  try {
    const { orderId, customerName } = req.body;
    const newDsp = {
      id: `dsp-${Date.now()}`,
      dispatchNumber: `DSP-2026-${String(dispatchStore.length + 10).padStart(3, '0')}`,
      orderId: orderId || 'ord-new',
      customerName: customerName || 'Customer',
      paymentVerified: false,
      status: 'pending'
    };
    dispatchStore.unshift(newDsp);
    res.status(201).json({
      success: true,
      data: newDsp,
      meta: { requestId: req.headers['x-request-id'] || 'req-dsp-create', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// Release dispatch: Requires dispatch.edit AND workflow payment verification gate
router.post('/:id/release', requireAuth, requireAction('dispatch', 'edit'), async (req, res, next) => {
  try {
    const dsp = dispatchStore.find(d => d.id === req.params.id);
    if (!dsp) throw new AppError(404, 'NOT_FOUND', 'Dispatch order not found');

    // BUSINESS WORKFLOW GATE: Payment verification required before warehouse release
    if (!dsp.paymentVerified) {
      throw new AppError(422, 'PAYMENT_UNVERIFIED', 'Material release blocked: Order payment verification incomplete');
    }

    dsp.status = 'released';
    dsp.releasedAt = new Date().toISOString();
    dsp.releasedBy = req.user!.name;

    await auditService.record({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      permissionUsed: 'dispatch.edit',
      action: 'DISPATCH_RELEASE',
      entity: 'DispatchOrder',
      entityId: dsp.id,
      newState: dsp,
      reason: 'Material released from warehouse'
    });

    res.json({
      success: true,
      data: dsp,
      meta: { requestId: req.headers['x-request-id'] || 'req-dsp-rel', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/confirm-delivery', requireAuth, requireAction('dispatch', 'edit'), async (req, res, next) => {
  try {
    const dsp = dispatchStore.find(d => d.id === req.params.id);
    if (!dsp) throw new AppError(404, 'NOT_FOUND', 'Dispatch order not found');
    dsp.status = 'delivered';
    dsp.deliveredAt = new Date().toISOString();
    res.json({
      success: true,
      data: dsp,
      meta: { requestId: req.headers['x-request-id'] || 'req-dsp-del', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

export const dispatchRoutes = router;
