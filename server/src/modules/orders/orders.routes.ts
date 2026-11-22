import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../db/pg';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { sendSuccess, AppError } from '../../utils/response';
import { auditService } from '../audit/audit.service';

const router = Router();

router.get('/', requireAuth, requireAction('orders', 'view'), async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT o.*, c.full_name AS customer_name, c.phone AS customer_phone,
              c.city AS customer_city, q.system_capacity_kw,
              (SELECT d.id FROM dispatches d WHERE d.order_id=o.id ORDER BY d.created_at DESC LIMIT 1) AS dispatch_id,
              (SELECT i.id FROM installations i WHERE i.order_id=o.id ORDER BY i.created_at DESC LIMIT 1) AS installation_id
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN quotations q ON q.id = o.quotation_id
       WHERE o.deleted_at IS NULL
       ORDER BY o.order_date DESC`
    );
    const mapped = result.rows.map(row => ({
      id: row.id,
      orderNumber: row.order_number,
      quotationId: row.quotation_id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerCity: row.customer_city,
      capacityKw: Number(row.capacity_kw || 0),
      totalOrderValue: Number(row.total_order_value),
      advanceAmountPaid: Number(row.advance_amount_paid),
      outstandingBalance: Number(row.outstanding_balance),
      orderStatus: row.order_status,
      paymentStatus: row.payment_status,
      orderDate: row.order_date,
      dispatchId: row.dispatch_id,
      installationId: row.installation_id
    }));
    sendSuccess(res, mapped);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', requireAuth, requireAction('orders', 'edit'), validateRequest({
  body: z.object({
    status: z.enum([
      'pending','confirmed','processing','ready_for_dispatch','dispatched',
      'installation_scheduled','completed','cancelled'
    ])
  })
}), async (req, res, next) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const result = await db.query(
      `UPDATE orders SET order_status = $1, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [req.body.status, id]
    );
    if (!result.rows[0]) throw new AppError(404, 'NOT_FOUND', 'Order not found');
    await auditService.record({
      actorId: req.user?.id,
      actorName: req.user?.name || 'System',
      actorRole: req.user?.role || 'owner_admin',
      action: 'ORDER_STATUS_UPDATE',
      entity: 'Order',
      entityId: id,
      newState: { orderStatus: req.body.status },
      reason: 'Order status updated'
    });
    sendSuccess(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export const orderRoutes = router;
