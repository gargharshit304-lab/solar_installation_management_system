import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { auditService } from '../audit/audit.service';
import { AppError, sendSuccess } from '../../utils/response';
import { parsePaginationParams, buildPaginationMeta } from '../../utils/pagination';

const router = Router();

let dispatchStore: any[] = [
  { id: 'dsp-1', dispatchNumber: 'DSP-2026-001', orderId: 'ord-101', customerName: 'Rajesh Sharma', paymentVerified: true, status: 'packed' },
  { id: 'dsp-2', dispatchNumber: 'DSP-2026-002', orderId: 'ord-102', customerName: 'Sunita Patil', paymentVerified: false, status: 'pending' }
];

router.get('/', requireAuth, requireAction('dispatch', 'view'), (req, res, next) => {
  try {
    const params = parsePaginationParams(req.query, 20);
    const { status, all } = req.query as Record<string, string>;

    let filtered = dispatchStore;
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(d =>
        d.dispatchNumber.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.orderId.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(d => d.status === status);
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
    sendSuccess(res, newDsp, 201, undefined, 'Dispatch created successfully');
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

    sendSuccess(res, dsp, 200, undefined, 'Material released from warehouse');
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
    sendSuccess(res, dsp, 200, undefined, 'Delivery confirmed successfully');
  } catch (err) {
    next(err);
  }
});

export const dispatchRoutes = router;
