import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { createCustomerSchema, updateCustomerSchema } from './customer.validation';
import { auditService } from '../audit/audit.service';
import { AppError } from '../../utils/response';
import { prisma } from '../../db/prisma';

let customersStore: any[] = [
  { id: 'cust-1', fullName: 'Rajesh Sharma', phone: '+91 98220 12345', city: 'Pune', leadStatus: 'new' },
  { id: 'cust-2', fullName: 'Sunita Patil', phone: '+91 98221 23456', city: 'Pimpri-Chinchwad', leadStatus: 'survey_scheduled' },
  { id: 'cust-3', fullName: 'Anand Deshmukh', phone: '+91 98222 34567', city: 'Pune', leadStatus: 'quotation_sent' }
];

<<<<<<< Updated upstream
router.get('/', requireAuth, requireAction('customers', 'view'), async (req, res, next) => {
  try {
    let customers = customersStore;
    try {
      const dbRes = await prisma.$queryRaw<any[]>`
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
          TRIM(CONCAT(e.first_name, ' ', e.last_name)) as "assignedSalesRepName"
        FROM customers c
        LEFT JOIN employees e ON e.id = c.assigned_sales_rep_id
        WHERE c.deleted_at IS NULL
        ORDER BY c.created_at ASC
      `;
      if (dbRes && dbRes.length > 0) {
        customers = dbRes;
      }
    } catch {
      // Fallback to in-memory store
    }

    res.json({
      success: true,
      data: customers,
      meta: { 
        requestId: (req.headers['x-request-id'] as string) || 'req-cust-list', 
        timestamp: new Date().toISOString(),
        total: customers.length 
      }
    });
  } catch (err) {
    next(err);
  }
=======
const router = Router();

router.get('/', requireAuth, requireAction('customers', 'view'), (req, res) => {
  res.json({
    success: true,
    data: customersStore,
    meta: { requestId: req.headers['x-request-id'] || 'req-cust-list', timestamp: new Date().toISOString() }
  });
>>>>>>> Stashed changes
});

router.post(
  '/',
  requireAuth,
  requireAction('customers', 'create'),
  validateBody(createCustomerSchema),
  async (req, res, next) => {
    try {
      const { name, email, phone, address, status } = req.body;
      const newCustomer = {
        id: `cust-${Date.now()}`,
        name,
        email,
        phone,
        address: address || '',
        leadStatus: status || 'new'
      };
      customersStore.unshift(newCustomer);

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

      res.status(201).json({
        success: true,
        data: newCustomer,
        meta: { requestId: req.headers['x-request-id'] || 'req-cust-create', timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  requireAuth,
  requireAction('customers', 'edit'),
  validateBody(updateCustomerSchema),
  async (req, res, next) => {
    try {
      const cust = customersStore.find(c => c.id === req.params.id);
      if (!cust) throw new AppError(404, 'NOT_FOUND', 'Customer not found');
      const { name, email, phone, address, status } = req.body;
      if (name !== undefined) cust.name = name;
      if (email !== undefined) cust.email = email;
      if (phone !== undefined) cust.phone = phone;
      if (address !== undefined) cust.address = address;
      if (status !== undefined) cust.leadStatus = status;

      res.json({
        success: true,
        data: cust,
        meta: { requestId: req.headers['x-request-id'] || 'req-cust-edit', timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', requireAuth, requireAction('customers', 'delete'), async (req, res, next) => {
  try {
    const idx = customersStore.findIndex(c => c.id === req.params.id);
    if (idx === -1) throw new AppError(404, 'NOT_FOUND', 'Customer not found');
    const [deleted] = customersStore.splice(idx, 1);
    res.json({
      success: true,
      data: { message: `Customer ${deleted.fullName} deleted` },
      meta: { requestId: req.headers['x-request-id'] || 'req-cust-del', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

export const customerRoutes = router;