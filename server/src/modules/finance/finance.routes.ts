import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { auditService } from '../audit/audit.service';
import { AppError } from '../../utils/response';

const router = Router();

let paymentsStore: any[] = [
  { id: 'pay-1', paymentNumber: 'PAY-2026-001', customerName: 'Rajesh Sharma', amount: 125000, status: 'verified' },
  { id: 'pay-2', paymentNumber: 'PAY-2026-002', customerName: 'Sunita Patil', amount: 80000, status: 'pending' }
];

router.get('/', requireAuth, requireAction('finance', 'view'), (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 4850000,
      monthlyExpenses: 2150000,
      receivables: 650000,
      payments: paymentsStore
    },
    meta: { requestId: req.headers['x-request-id'] || 'req-fin-list', timestamp: new Date().toISOString() }
  });
});

router.post('/payments', requireAuth, requireAction('finance', 'create'), async (req, res, next) => {
  try {
    const { customerName, amount, orderId } = req.body;
    if (!amount) throw new AppError(422, 'VALIDATION_FAILED', 'Payment amount is required');
    const newPay = {
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-2026-${String(paymentsStore.length + 10).padStart(3, '0')}`,
      customerName: customerName || 'Customer',
      orderId: orderId || 'ord-101',
      amount: Number(amount),
      status: 'pending',
      recordedAt: new Date().toISOString()
    };
    paymentsStore.unshift(newPay);

    await auditService.record({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      permissionUsed: 'finance.create',
      action: 'PAYMENT_RECORD',
      entity: 'Payment',
      entityId: newPay.id,
      newState: newPay,
      reason: 'Payment transaction entered into ledger'
    });

    res.status(201).json({
      success: true,
      data: newPay,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-pay', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify', requireAuth, requireAction('finance', 'approve'), async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const pay = paymentsStore.find(p => p.id === paymentId);
    if (!pay) throw new AppError(404, 'NOT_FOUND', 'Payment record not found');
    pay.status = 'verified';
    pay.verifiedAt = new Date().toISOString();
    pay.verifiedBy = req.user!.name;

    await auditService.record({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      permissionUsed: 'finance.approve',
      action: 'PAYMENT_VERIFY',
      entity: 'Payment',
      entityId: pay.id,
      newState: pay,
      reason: 'Bank clearance reconciliation confirmed'
    });

    res.json({
      success: true,
      data: pay,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-ver', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/export', requireAuth, requireAction('finance', 'export'), (req, res) => {
  res.json({
    success: true,
    data: { exportUrl: '/downloads/financial_ledger_2026.csv', exportedAt: new Date().toISOString() },
    meta: { requestId: req.headers['x-request-id'] || 'req-fin-exp', timestamp: new Date().toISOString() }
  });
});

export const financeRoutes = router;
