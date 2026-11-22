import { Router } from 'express';
import { db } from '../../db/pg';
import { requireAuth } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';

const router = Router();

router.get('/kpis', requireAuth, async (_req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
       (SELECT count(*)::int FROM customers WHERE deleted_at IS NULL) AS total_customers,
       (SELECT count(*)::int FROM customers WHERE lead_status IN ('new','contacted') AND deleted_at IS NULL) AS new_enquiries,
       (SELECT count(*)::int FROM orders WHERE order_status NOT IN ('completed','cancelled') AND deleted_at IS NULL) AS active_projects,
       (SELECT count(*)::int FROM quotations WHERE status IN ('draft','sent') AND deleted_at IS NULL) AS pending_quotations,
       (SELECT COALESCE(SUM(total_order_value),0)::numeric FROM orders WHERE deleted_at IS NULL) AS total_revenue,
       (SELECT COALESCE(SUM(outstanding_balance),0)::numeric FROM orders WHERE deleted_at IS NULL) AS outstanding_payments,
       (SELECT count(*)::int FROM inventory_stock s JOIN products p ON p.id=s.product_id WHERE s.quantity_on_hand <= p.minimum_stock_threshold) AS inventory_alerts_count,
       (SELECT count(*)::int FROM service_tickets WHERE status IN ('open','assigned','in_progress','waiting_for_parts')) AS open_tickets_count`
    );
    const row = result.rows[0];
    sendSuccess(res, {
      totalCustomers: Number(row.total_customers),
      newEnquiries: Number(row.new_enquiries),
      activeProjects: Number(row.active_projects),
      pendingQuotations: Number(row.pending_quotations),
      totalRevenue: Number(row.total_revenue),
      outstandingPayments: Number(row.outstanding_payments),
      inventoryAlertsCount: Number(row.inventory_alerts_count),
      openTicketsCount: Number(row.open_tickets_count)
    });
  } catch (error) {
    next(error);
  }
});

export const dashboardRoutes = router;
