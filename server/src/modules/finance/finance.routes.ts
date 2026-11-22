import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { financeService } from './finance.service';
import { AppError, sendSuccess } from '../../utils/response';
import { parsePaginationParams, buildPaginationMeta } from '../../utils/pagination';

const router = Router();

// 1. Finance Overview / Summary KPIs
router.get(['/', '/summary'], requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const summary = await financeService.getFinancialSummary();
    const payments = await financeService.getPayments();
    sendSuccess(res, {
      ...summary,
      payments
    });
  } catch (err) {
    next(err);
  }
});

// 2. Project Profitability List
router.get('/projects', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const params = parsePaginationParams(req.query, 20);
    const { all } = req.query as Record<string, string>;
    const projects = await financeService.getProjectsProfitability();

    let filtered = projects;
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.projectCode.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.orderNumber.toLowerCase().includes(q)
      );
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

// 3. Project Financial Detail Workspace Drilldown (7 sections)
router.get('/projects/:projectId', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const detail = await financeService.getProjectDetail(String(req.params.projectId));
    sendSuccess(res, detail);
  } catch (err) {
    next(err);
  }
});

// 4. Financial Transaction Ledger History
router.get('/transactions', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const params = parsePaginationParams(req.query, 20);
    const { projectId, type, category, status, search, startDate, endDate, all } = req.query as Record<string, string>;
    const transactions = await financeService.getTransactions({
      projectId,
      type,
      category,
      status,
      search: search || params.search,
      startDate,
      endDate
    });

    const totalRecords = transactions.length;
    const isAll = all === 'true' || req.query.pageSize === 'all';
    const paged = isAll ? transactions : transactions.slice(params.offset, params.offset + params.limit);
    const pagination = buildPaginationMeta(params.page, isAll ? totalRecords : params.pageSize, totalRecords);

    sendSuccess(res, paged, 200, pagination);
  } catch (err) {
    next(err);
  }
});

// 5. Direct Expenses List
router.get('/expenses', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const params = parsePaginationParams(req.query, 20);
    const { projectId, orderId, all } = req.query as Record<string, string>;
    const expenses = await financeService.getExpenses({ projectId, orderId });

    let filtered = expenses;
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.expenseNumber.toLowerCase().includes(q) ||
        (e.vendor && e.vendor.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
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

// 6. Record Direct Expense
router.post('/expenses', requireAuth, requireAction('finance', 'create'), async (req, res, next) => {
  try {
    const user = {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    };
    const newExpense = await financeService.recordExpense(req.body, user);
    sendSuccess(res, newExpense, 201, undefined, 'Expense recorded successfully');
  } catch (err) {
    next(err);
  }
});

// 7. Approve Direct Expense (RBAC Action: edit)
router.post('/expenses/:id/approve', requireAuth, requireAction('finance', 'edit'), async (req, res, next) => {
  try {
    const user = {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    };
    const approvedExpense = await financeService.approveExpense(String(req.params.id), user);
    sendSuccess(res, approvedExpense, 200, undefined, 'Expense approved successfully');
  } catch (err) {
    next(err);
  }
});

// 8. Payments List
router.get('/payments', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const params = parsePaginationParams(req.query, 20);
    const { orderId, all } = req.query as Record<string, string>;
    const payments = await financeService.getPayments({ orderId });

    let filtered = payments;
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.paymentNumber.toLowerCase().includes(q) ||
        p.orderNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        (p.transactionReference && p.transactionReference.toLowerCase().includes(q))
      );
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

// 9. Record Milestone Payment
router.post('/payments', requireAuth, requireAction('finance', 'create'), async (req, res, next) => {
  try {
    const user = {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    };
    const payment = await financeService.recordPayment(req.body, user);
    sendSuccess(res, payment, 201, undefined, 'Payment recorded successfully');
  } catch (err) {
    next(err);
  }
});

// 10. Verify / Reconcile Payment (RBAC Action: edit)
router.post('/verify', requireAuth, requireAction('finance', 'edit'), async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      throw new AppError(400, 'BAD_REQUEST', 'Payment ID is required');
    }
    const user = {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    };
    const verified = await financeService.verifyPayment(paymentId, user);
    sendSuccess(res, verified, 200, undefined, 'Payment verified successfully');
  } catch (err) {
    next(err);
  }
});

// 11. Export Financial Ledger (RBAC Action: view)
router.get('/export', requireAuth, requireAction('finance', 'view'), async (req, res, next) => {
  try {
    const transactions = await financeService.getTransactions();
    const csvRows = [
      'Transaction ID,Date,Type,Category,Project,Customer,Amount,Status,Reference,Recorded By'
    ];
    for (const t of transactions) {
      csvRows.push(`"${t.transactionNumber}","${t.date}","${t.type}","${t.category}","${t.projectCode || ''}","${t.customerName || ''}",${t.amount},"${t.status}","${t.referenceNumber || ''}","${t.recordedBy || ''}"`);
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="solaros-financial-ledger.csv"');
    res.send(csvRows.join('\n'));
  } catch (err) {
    next(err);
  }
});

export const financeRoutes = router;
