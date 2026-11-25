import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { auditService } from '../audit/audit.service';
import { AppError, sendSuccess } from '../../utils/response';
import { db } from '../../db/pg';
import { parsePaginationParams, buildPaginationMeta } from '../../utils/pagination';

const router = Router();

const createCustomerSchema = z.object({
  fullName: z.string().min(2).max(150),
  phone: z.string().min(6).max(30),
  city: z.string().max(100).optional(),
  address: z.string().max(300).optional()
}).strict();

const updateCustomerSchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  phone: z.string().min(6).max(30).optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(300).optional()
}).strict();

router.get('/', requireAuth, requireAction('customers', 'view'), async (req, res, next) => {
  try {
    const params = parsePaginationParams(req.query, 20);
    const { status, city, source, all } = req.query as Record<string, string>;

    const conditions: string[] = ['c.deleted_at IS NULL'];
    const queryParams: any[] = [];

    if (params.search) {
      queryParams.push(`%${params.search.toLowerCase()}%`);
      const sIdx = queryParams.length;
      conditions.push(`(LOWER(c.full_name) LIKE $${sIdx} OR LOWER(c.phone) LIKE $${sIdx} OR LOWER(c.customer_code) LIKE $${sIdx} OR LOWER(COALESCE(c.email, '')) LIKE $${sIdx})`);
    }
    if (status && status !== 'all') {
      queryParams.push(status);
      conditions.push(`c.lead_status = $${queryParams.length}`);
    }
    if (city && city !== 'all') {
      queryParams.push(city);
      conditions.push(`c.city = $${queryParams.length}`);
    }
    if (source && source !== 'all') {
      queryParams.push(source);
      conditions.push(`c.enquiry_source = $${queryParams.length}`);
    }

    const whereClause = conditions.join(' AND ');

    // 1. Total filtered records count
    const countSql = `SELECT COUNT(*)::int AS count FROM customers c WHERE ${whereClause}`;
    const countRes = await db.query(countSql, queryParams);
    const totalRecords = countRes.rows[0]?.count || 0;

    // 2. Paginated rows query
    let dataSql = `
      SELECT 
        c.id, c.customer_code as "customerCode", c.full_name as "fullName",
        c.phone, c.email, c.address, c.city, c.state, c.postal_code as "postalCode",
        c.monthly_electricity_bill as "monthlyElectricityBill",
        c.interested_capacity_kw as "interestedCapacityKw",
        c.preferred_system_type as "preferredSystemType",
        c.roof_space_sqft as "roofSpaceSqft",
        c.roof_type as "roofType",
        c.enquiry_source as "enquirySource",
        c.assigned_sales_rep_id as "assignedSalesRepId",
        c.lead_status as "leadStatus",
        c.is_demo as "isDemo",
        c.seed_batch_id as "seedBatchId",
        TRIM(CONCAT(e.first_name, ' ', e.last_name)) as "assignedSalesRepName",
        c.created_at as "createdAt"
      FROM customers c
      LEFT JOIN employees e ON e.id = c.assigned_sales_rep_id
      WHERE ${whereClause}
      ORDER BY c.created_at ASC
    `;

    const isAll = all === 'true' || req.query.pageSize === 'all';
    if (!isAll) {
      queryParams.push(params.limit);
      const lIdx = queryParams.length;
      queryParams.push(params.offset);
      const oIdx = queryParams.length;
      dataSql += ` LIMIT $${lIdx} OFFSET $${oIdx}`;
    }

    const dataRes = await db.query(dataSql, queryParams);
    const pagination = buildPaginationMeta(params.page, isAll ? totalRecords : params.pageSize, totalRecords);

    sendSuccess(res, dataRes.rows, 200, pagination);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAction('customers', 'create'), validateRequest({ body: createCustomerSchema }), async (req, res, next) => {
  try {
    const { fullName, phone, city, address } = req.body;
    const countRes = await db.query(`SELECT COUNT(*)::int AS count FROM customers`);
    const nextNum = (countRes.rows[0]?.count || 0) + 1;
    const customerCode = `CUST-${String(nextNum).padStart(4, '0')}`;

    const insertSql = `
      INSERT INTO customers (id, customer_code, full_name, phone, city, address, lead_status, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'new', NOW(), NOW())
      RETURNING id, customer_code as "customerCode", full_name as "fullName", phone, city, address, lead_status as "leadStatus", created_at as "createdAt"
    `;
    const result = await db.query(insertSql, [customerCode, fullName, phone, city || 'Pune', address || '']);
    const newCustomer = result.rows[0];

    await auditService.record({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      permissionUsed: 'customers.create',
      action: 'CUSTOMER_CREATE',
      entity: 'Customer',
      entityId: newCustomer.id,
      newState: newCustomer,
      reason: 'New customer lead registered'
    });

    sendSuccess(res, newCustomer, 201, undefined, 'Customer created successfully');
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireAuth, requireAction('customers', 'edit'), validateRequest({ body: updateCustomerSchema }), async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const { fullName, phone, city, address } = req.body;

    const updates: string[] = ['updated_at = NOW()'];
    const values: any[] = [id];

    if (fullName !== undefined) {
      values.push(fullName);
      updates.push(`full_name = $${values.length}`);
    }
    if (phone !== undefined) {
      values.push(phone);
      updates.push(`phone = $${values.length}`);
    }
    if (city !== undefined) {
      values.push(city);
      updates.push(`city = $${values.length}`);
    }
    if (address !== undefined) {
      values.push(address);
      updates.push(`address = $${values.length}`);
    }

    const updateSql = `
      UPDATE customers
      SET ${updates.join(', ')}
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, customer_code as "customerCode", full_name as "fullName", phone, city, address, lead_status as "leadStatus"
    `;
    const result = await db.query(updateSql, values);
    if (!result.rows[0]) throw new AppError(404, 'NOT_FOUND', 'Customer not found');

    sendSuccess(res, result.rows[0], 200, undefined, 'Customer updated successfully');
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAction('customers', 'delete'), async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const result = await db.query(
      `UPDATE customers SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id, full_name as "fullName"`,
      [id]
    );
    if (!result.rows[0]) throw new AppError(404, 'NOT_FOUND', 'Customer not found');
    sendSuccess(res, { id, message: `Customer ${result.rows[0].fullName} deleted` });
  } catch (err) {
    next(err);
  }
});

export const customerRoutes = router;
