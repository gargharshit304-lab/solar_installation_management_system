import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../db/pg';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { sendSuccess, AppError } from '../../utils/response';
import { auditService } from '../audit/audit.service';
import { parsePaginationParams, buildPaginationMeta } from '../../utils/pagination';

const router = Router();

router.get('/', requireAuth, requireAction('orders', 'view'), async (req, res, next) => {
  try {
    const params = parsePaginationParams(req.query, 20);
    const { status, orderStatus, paymentStatus, all } = req.query as Record<string, string>;

    const conditions: string[] = ['o.deleted_at IS NULL'];
    const queryParams: any[] = [];

    // Search filter across order number, customer name, phone, city
    if (params.search) {
      queryParams.push(`%${params.search.toLowerCase()}%`);
      const sIdx = queryParams.length;
      conditions.push(`(LOWER(o.order_number) LIKE $${sIdx} OR LOWER(c.full_name) LIKE $${sIdx} OR LOWER(c.phone) LIKE $${sIdx} OR LOWER(c.city) LIKE $${sIdx})`);
    }

    // Order status filter
    const targetStatus = status || orderStatus;
    if (targetStatus && targetStatus !== 'all') {
      queryParams.push(targetStatus);
      conditions.push(`o.order_status = $${queryParams.length}`);
    }

    // Payment status filter
    if (paymentStatus && paymentStatus !== 'all') {
      queryParams.push(paymentStatus);
      conditions.push(`o.payment_status = $${queryParams.length}`);
    }

    const whereClause = conditions.join(' AND ');

    // 1. Total count query
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE ${whereClause}
    `;
    const countRes = await db.query(countSql, queryParams);
    const totalRecords = countRes.rows[0]?.count || 0;

    // 2. Data query
    let dataSql = `
      SELECT o.*, c.full_name AS customer_name, c.phone AS customer_phone,
             c.city AS customer_city, q.system_capacity_kw,
             (SELECT d.id FROM dispatches d WHERE d.order_id=o.id ORDER BY d.created_at DESC LIMIT 1) AS dispatch_id,
             (SELECT i.id FROM installations i WHERE i.order_id=o.id ORDER BY i.created_at DESC LIMIT 1) AS installation_id
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      LEFT JOIN quotations q ON q.id = o.quotation_id
      WHERE ${whereClause}
      ORDER BY o.order_date DESC
    `;

    const isAll = all === 'true' || req.query.pageSize === 'all';
    if (!isAll) {
      queryParams.push(params.limit);
      const lIdx = queryParams.length;
      queryParams.push(params.offset);
      const oIdx = queryParams.length;
      dataSql += ` LIMIT $${lIdx} OFFSET $${oIdx}`;
    }

    const result = await db.query(dataSql, queryParams);
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

    const pagination = buildPaginationMeta(params.page, isAll ? totalRecords : params.pageSize, totalRecords);
    sendSuccess(res, mapped, 200, pagination);
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
