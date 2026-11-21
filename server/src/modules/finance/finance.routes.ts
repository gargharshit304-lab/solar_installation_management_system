import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { financeService } from './finance.service';
import { AppError } from '../../utils/response';

const router = Router();

// 1. Finance Overview / Summary KPIs
router.get(['/', '/summary'], requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const summary = await financeService.getFinancialSummary();
    const payments = await financeService.getPayments();
    res.json({
      success: true,
      data: {
        ...summary,
        payments
      },
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-summary', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 2. Project Profitability List
router.get('/projects', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const projects = await financeService.getProjectsProfitability();
    res.json({
      success: true,
      data: projects,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-projects', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 3. Project Financial Detail Workspace Drilldown (7 sections)
router.get('/projects/:projectId', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const detail = await financeService.getProjectDetail(req.params.projectId);
    res.json({
      success: true,
      data: detail,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-proj-detail', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 4. Financial Transaction Ledger History
router.get('/transactions', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const { projectId, type, category, status, search, startDate, endDate } = req.query as Record<string, string>;
    const transactions = await financeService.getTransactions({
      projectId,
      type,
      category,
      status,
      search,
      startDate,
      endDate
    });
    res.json({
      success: true,
      data: transactions,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-txns', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 5. Direct Expenses List
router.get('/expenses', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const { projectId, orderId } = req.query as Record<string, string>;
    const expenses = await financeService.getExpenses({ projectId, orderId });
    res.json({
      success: true,
      data: expenses,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-exp-list', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 6. Record Direct Expense
router.post('/expenses', requireAuth, requireAction('finance', 'create'), async (req, res, next) => {
  try {
    const user = {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    };
    const newExpense = await financeService.recordExpense(req.body, user);
    res.status(201).json({
      success: true,
      data: newExpense,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-exp-create', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 7. Approve Direct Expense
router.post('/expenses/:id/approve', requireAuth, requireAction('finance', 'approve'), async (req, res, next) => {
  try {
    const user = {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    };
    const approvedExpense = await financeService.approveExpense(req.params.id, user);
    res.json({
      success: true,
      data: approvedExpense,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-exp-approve', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 8. Payments List
router.get('/payments', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const { orderId } = req.query as Record<string, string>;
    const payments = await financeService.getPayments({ orderId });
    res.json({
      success: true,
      data: payments,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-payments', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 9. Record Payment Receipt
router.post('/payments', requireAuth, requireAction('finance', 'create'), async (req, res, next) => {
  try {
    const user = {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    };
    const newPayment = await financeService.recordPayment(req.body, user);
    res.status(201).json({
      success: true,
      data: newPayment,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-pay-create', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 10. Verify Payment (Bank Reconciliation)
router.post('/verify', requireAuth, requireAction('finance', 'approve'), async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) throw new AppError(422, 'VALIDATION_FAILED', 'paymentId is required');
    const user = {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    };
    const verifiedPayment = await financeService.verifyPayment(paymentId, user);
    res.json({
      success: true,
      data: verifiedPayment,
      meta: { requestId: req.headers['x-request-id'] || 'req-fin-pay-verify', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// 11. Export Ledger CSV
router.get('/export', requireAuth, requireAction('finance', 'export'), (req, res) => {
  res.json({
    success: true,
    data: {
      exportUrl: '/downloads/financial_ledger_2026.csv',
      format: 'CSV',
      exportedAt: new Date().toISOString(),
      rowCount: 14
    },
    meta: { requestId: req.headers['x-request-id'] || 'req-fin-export', timestamp: new Date().toISOString() }
  });
});

export { router as financeRoutes };
export default router;
