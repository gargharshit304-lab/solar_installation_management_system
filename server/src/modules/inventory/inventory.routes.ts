import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { rbacService } from '../rbac/rbac.service';
import { auditService } from '../audit/audit.service';
import { AppError } from '../../utils/response';

const router = Router();

// In-memory demo products data
let productsStore: any[] = [
  { id: 'prd-inv-5kw', name: 'Growatt 5kW Dual MPPT String Inverter', availableQuantity: 12, unitCost: 45000 },
  { id: 'prd-pan-540w', name: 'Waaree 540W Mono PERC Solar Panel', availableQuantity: 140, unitCost: 11500 },
  { id: 'prd-bat-100ah', name: 'Livguard Solar Tubular Battery 150Ah', availableQuantity: 8, unitCost: 14000 }
];

router.get('/', requireAuth, requireAction('inventory', 'view'), (req, res) => {
  res.json({
    success: true,
    data: productsStore,
    meta: { requestId: req.headers['x-request-id'] || 'req-inv-list', timestamp: new Date().toISOString() }
  });
});

router.post('/', requireAuth, requireAction('inventory', 'create'), async (req, res, next) => {
  try {
    const { name, category, unitCost, availableQuantity } = req.body;
    if (!name) {
      throw new AppError(422, 'VALIDATION_FAILED', 'Product name is required');
    }
    const newProduct = {
      id: `prd-${Date.now()}`,
      name,
      category: category || 'Solar Panels',
      unitCost: Number(unitCost) || 10000,
      availableQuantity: Number(availableQuantity) || 0
    };
    productsStore.unshift(newProduct);

    await auditService.record({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      permissionUsed: 'inventory.create',
      action: 'INVENTORY_CREATE',
      entity: 'InventoryItem',
      entityId: newProduct.id,
      newState: newProduct,
      reason: 'Product registered into warehouse inventory'
    });

    res.status(201).json({
      success: true,
      data: newProduct,
      meta: { requestId: req.headers['x-request-id'] || 'req-inv-create', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireAuth, requireAction('inventory', 'edit'), async (req, res, next) => {
  try {
    const item = productsStore.find(p => p.id === req.params.id);
    if (!item) {
      throw new AppError(404, 'NOT_FOUND', 'Inventory item not found');
    }
    Object.assign(item, req.body);
    res.json({
      success: true,
      data: item,
      meta: { requestId: req.headers['x-request-id'] || 'req-inv-edit', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAction('inventory', 'delete'), async (req, res, next) => {
  try {
    const idx = productsStore.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      throw new AppError(404, 'NOT_FOUND', 'Inventory item not found');
    }
    const [deleted] = productsStore.splice(idx, 1);
    res.json({
      success: true,
      data: { message: `Product ${deleted.name} archived successfully` },
      meta: { requestId: req.headers['x-request-id'] || 'req-inv-delete', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/adjust', requireAuth, requireAction('inventory', 'edit'), async (req, res, next) => {
  try {
    const { delta, reason, notes } = req.body;
    const item = productsStore.find(p => p.id === req.params.id);
    if (!item) {
      throw new AppError(404, 'NOT_FOUND', 'Inventory item not found');
    }
    item.availableQuantity = Math.max(0, item.availableQuantity + Number(delta || 0));

    await auditService.record({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      permissionUsed: 'inventory.edit',
      action: 'STOCK_ADJUSTMENT',
      entity: 'InventoryItem',
      entityId: item.id,
      newState: { quantity: item.availableQuantity, delta, reason },
      reason: notes || 'Stock count discrepancy adjustment'
    });

    res.json({
      success: true,
      data: item,
      meta: { requestId: req.headers['x-request-id'] || 'req-inv-adj', timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/grn', requireAuth, requireAction('inventory', 'create'), (req, res) => {
  res.status(201).json({
    success: true,
    data: { message: 'GRN stock intake processed' },
    meta: { requestId: req.headers['x-request-id'] || 'req-inv-grn', timestamp: new Date().toISOString() }
  });
});

export const inventoryRoutes = router;
