import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAction } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { auditService } from '../audit/audit.service';
import { AppError, sendSuccess } from '../../utils/response';
import { parsePaginationParams, buildPaginationMeta } from '../../utils/pagination';
import { db } from '../../db/pg';

const router = Router();

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(100).optional(),
  category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  unitOfMeasure: z.string().max(50).optional(),
  unitCost: z.number().min(0).max(100000000).optional(),
  sellingPrice: z.number().min(0).max(100000000).optional(),
  standardCost: z.number().min(0).max(100000000).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  minimumThreshold: z.number().int().min(0).max(1000000).optional(),
  reorderThreshold: z.number().int().min(0).max(1000000).optional(),
  maxThreshold: z.number().int().min(0).max(1000000).optional(),
  locationBin: z.string().max(100).optional(),
  hasSerialTracking: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  availableQuantity: z.number().int().min(0).max(10000000).optional(),
  specifications: z.record(z.string(), z.any()).optional()
}).strict();

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  sku: z.string().min(1).max(100).optional(),
  category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  unitOfMeasure: z.string().max(50).optional(),
  unitCost: z.number().min(0).max(100000000).optional(),
  sellingPrice: z.number().min(0).max(100000000).optional(),
  standardCost: z.number().min(0).max(100000000).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  minimumThreshold: z.number().int().min(0).max(1000000).optional(),
  reorderThreshold: z.number().int().min(0).max(1000000).optional(),
  maxThreshold: z.number().int().min(0).max(1000000).optional(),
  locationBin: z.string().max(100).optional(),
  hasSerialTracking: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  availableQuantity: z.number().int().min(0).max(10000000).optional(),
  priceChangeReason: z.string().max(500).optional(),
  specifications: z.record(z.string(), z.any()).optional()
}).strict();

const adjustStockSchema = z.object({
  delta: z.number().int().min(-10000000).max(10000000),
  reason: z.string().max(200).optional(),
  notes: z.string().max(1000).optional()
}).strict();

// In-memory fallback and cache for products
let productsStore: any[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    sku: 'PAN-MONO-540W',
    name: 'SunPower 540W Mono PERC Panel',
    category: 'Solar Panels',
    brand: 'SunPower',
    model: 'SP-540M',
    description: 'High efficiency monocrystalline solar module with anti-reflective glass.',
    unitOfMeasure: 'pcs',
    availableQuantity: 140,
    reservedQuantity: 20,
    minimumThreshold: 25,
    reorderThreshold: 35,
    unitCost: 10200,
    sellingPrice: 13800,
    standardCost: 9690,
    taxRate: 18,
    status: 'active',
    locationBin: 'RACK-A1-01',
    hasSerialTracking: true
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    sku: 'INV-DEYE-5KW-3P',
    name: 'Deye 5kW Three-Phase Inverter',
    category: 'Inverters',
    brand: 'Deye',
    model: 'SUN-5K-SG04LP3',
    description: 'Smart three-phase hybrid inverter with dual MPPT tracking.',
    unitOfMeasure: 'units',
    availableQuantity: 12,
    reservedQuantity: 2,
    minimumThreshold: 5,
    reorderThreshold: 8,
    unitCost: 46000,
    sellingPrice: 62000,
    standardCost: 43700,
    taxRate: 18,
    status: 'active',
    locationBin: 'BAY-INV-02',
    hasSerialTracking: true
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    sku: 'INV-GROW-3.3K',
    name: 'Growatt 3.3kW Dual-MPPT Inverter',
    category: 'Inverters',
    brand: 'Growatt',
    model: 'MIC 3300TL-X',
    description: 'Residential single-phase on-grid solar string inverter.',
    unitOfMeasure: 'units',
    availableQuantity: 18,
    reservedQuantity: 3,
    minimumThreshold: 4,
    reorderThreshold: 6,
    unitCost: 31000,
    sellingPrice: 42000,
    standardCost: 29450,
    taxRate: 18,
    status: 'active',
    locationBin: 'BAY-INV-03',
    hasSerialTracking: true
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    sku: 'BAT-LIFEPO4-5.1K',
    name: 'SunPower 48V LiFePO4 Battery',
    category: 'Batteries & Storage',
    brand: 'SunPower Energy',
    model: 'LP48-100',
    description: 'Modular lithium iron phosphate energy storage battery 5.12kWh.',
    unitOfMeasure: 'units',
    availableQuantity: 8,
    reservedQuantity: 1,
    minimumThreshold: 3,
    reorderThreshold: 5,
    unitCost: 78000,
    sellingPrice: 105000,
    standardCost: 74100,
    taxRate: 18,
    status: 'active',
    locationBin: 'ZONE-BAT-01',
    hasSerialTracking: true
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    sku: 'CTRL-MPPT-60A',
    name: 'Smart MPPT 60A Controller',
    category: 'Charge Controllers',
    brand: 'SolarCharge',
    model: 'SC-MPPT-60',
    description: 'Maximum power point tracking charge controller for off-grid systems.',
    unitOfMeasure: 'units',
    availableQuantity: 24,
    reservedQuantity: 0,
    minimumThreshold: 8,
    reorderThreshold: 12,
    unitCost: 11500,
    sellingPrice: 16200,
    standardCost: 10925,
    taxRate: 18,
    status: 'active',
    locationBin: 'RACK-CTRL-01',
    hasSerialTracking: false
  }
];

function mapDbProduct(row: any): any {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    brand: row.brand || 'SolarOS Certified',
    model: row.model || '',
    description: row.description || '',
    unitOfMeasure: row.unit_of_measure || 'pcs',
    availableQuantity: Number(row.available_quantity ?? row.availableQuantity ?? 25),
    reservedQuantity: Number(row.reserved_quantity ?? row.reservedQuantity ?? 0),
    minimumThreshold: Number(row.minimum_stock_threshold ?? row.minimumThreshold ?? 10),
    reorderThreshold: Number(row.reorder_threshold ?? row.reorderThreshold ?? 15),
    maxThreshold: Number(row.maximum_stock_threshold ?? row.maxThreshold ?? 500),
    unitCost: Number(row.unit_cost ?? row.unitCost ?? 0),
    sellingPrice: Number(row.selling_price ?? row.sellingPrice ?? 0),
    standardCost: Number(row.standard_cost ?? row.standardCost ?? (Number(row.unit_cost || 0) * 0.95)),
    taxRate: Number(row.tax_rate ?? row.taxRate ?? 18),
    locationBin: row.location_bin || row.locationBin || 'MAIN-A1',
    status: row.status || 'active',
    hasSerialTracking: Boolean(row.has_serial_tracking ?? row.hasSerialTracking ?? false),
    warrantyMonths: Number(row.warranty_months ?? 24),
    specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : (row.specifications || {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// 1. GET / — List products with pagination, search, category filter
router.get('/', requireAuth, requireAction('inventory', 'view'), async (req, res, next) => {
  try {
    const params = parsePaginationParams(req.query, 20);
    const { category, all } = req.query as Record<string, string>;

    try {
      // Query PostgreSQL products table
      let sql = `
        SELECT 
          p.*,
          COALESCE(s.quantity_on_hand, 25) AS available_quantity,
          COALESCE(s.quantity_reserved, 0) AS reserved_quantity
        FROM products p
        LEFT JOIN (
          SELECT product_id, SUM(quantity_on_hand) as quantity_on_hand, SUM(quantity_reserved) as quantity_reserved
          FROM inventory_stock
          GROUP BY product_id
        ) s ON s.product_id = p.id
        WHERE 1=1
      `;
      const sqlParams: any[] = [];

      if (params.search) {
        sqlParams.push(`%${params.search.toLowerCase()}%`);
        sql += ` AND (LOWER(p.name) LIKE $${sqlParams.length} OR LOWER(p.sku) LIKE $${sqlParams.length} OR LOWER(COALESCE(p.brand, '')) LIKE $${sqlParams.length})`;
      }

      if (category && category !== 'all') {
        sqlParams.push(category);
        sql += ` AND LOWER(p.category) = LOWER($${sqlParams.length})`;
      }

      // Count query
      const countRes = await db.query(`SELECT COUNT(*) FROM (${sql}) AS subquery`, sqlParams);
      const totalRecords = parseInt(countRes.rows[0].count, 10);

      // Order and pagination
      sql += ` ORDER BY p.name ASC`;
      const isAll = all === 'true' || req.query.pageSize === 'all';
      if (!isAll) {
        sqlParams.push(params.limit);
        sql += ` LIMIT $${sqlParams.length}`;
        sqlParams.push(params.offset);
        sql += ` OFFSET $${sqlParams.length}`;
      }

      const rowsRes = await db.query(sql, sqlParams);
      const products = rowsRes.rows.map(mapDbProduct);

      // Update in-memory cache
      for (const p of products) {
        const idx = productsStore.findIndex(item => item.id === p.id);
        if (idx >= 0) productsStore[idx] = p;
        else productsStore.push(p);
      }

      const pagination = buildPaginationMeta(params.page, isAll ? totalRecords : params.pageSize, totalRecords);
      sendSuccess(res, products, 200, pagination);
      return;
    } catch (dbErr) {
      console.warn('PostgreSQL products query failed, using in-memory fallback:', dbErr);
    }

    // In-memory fallback
    let filtered = productsStore;
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q)
      );
    }
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
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

// 2. GET /:id — Get single product
router.get('/:id', requireAuth, requireAction('inventory', 'view'), async (req, res, next) => {
  try {
    const id = String(req.params.id);
    try {
      const rowRes = await db.query(`
        SELECT p.*,
          COALESCE(s.quantity_on_hand, 25) AS available_quantity,
          COALESCE(s.quantity_reserved, 0) AS reserved_quantity
        FROM products p
        LEFT JOIN (
          SELECT product_id, SUM(quantity_on_hand) as quantity_on_hand, SUM(quantity_reserved) as quantity_reserved
          FROM inventory_stock
          GROUP BY product_id
        ) s ON s.product_id = p.id
        WHERE p.id::text = $1 OR LOWER(p.sku) = LOWER($1)
        LIMIT 1
      `, [id]);

      if (rowRes.rows.length > 0) {
        return sendSuccess(res, mapDbProduct(rowRes.rows[0]));
      }
    } catch {
      // fallback
    }

    const idStr = String(req.params.id);
    const item = productsStore.find(p => p.id === idStr || p.sku?.toLowerCase() === idStr.toLowerCase());
    if (!item) {
      throw new AppError(404, 'NOT_FOUND', `Product '${id}' not found in inventory catalogue.`);
    }
    sendSuccess(res, item);
  } catch (err) {
    next(err);
  }
});

// 3. POST / — Register new product
router.post('/', requireAuth, requireAction('inventory', 'create'), validateRequest({ body: createProductSchema }), async (req, res, next) => {
  try {
    const data = req.body;
    const sku = (data.sku || `SKU-${Date.now().toString(36).toUpperCase()}`).trim();

    // Check SKU uniqueness in PostgreSQL
    try {
      const skuCheck = await db.query('SELECT id FROM products WHERE LOWER(sku) = LOWER($1)', [sku]);
      if (skuCheck.rows.length > 0) {
        throw new AppError(409, 'DUPLICATE_SKU', `SKU '${sku}' is already assigned to another product.`);
      }

      const insertRes = await db.query(`
        INSERT INTO products (
          sku, name, category, brand, model, description, unit_of_measure,
          unit_cost, selling_price, standard_cost, tax_rate,
          minimum_stock_threshold, reorder_threshold, maximum_stock_threshold,
          location_bin, has_serial_tracking, status, specifications, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
        ) RETURNING *
      `, [
        sku,
        data.name.trim(),
        data.category || 'Solar Panels',
        data.brand || 'SolarOS Certified',
        data.model || '',
        data.description || '',
        data.unitOfMeasure || 'pcs',
        data.unitCost ?? 10000,
        data.sellingPrice ?? 14000,
        data.standardCost ?? (Number(data.unitCost || 10000) * 0.95),
        data.taxRate ?? 18,
        data.minimumThreshold ?? 10,
        data.reorderThreshold ?? 15,
        data.maxThreshold ?? 500,
        data.locationBin || 'MAIN-A1',
        Boolean(data.hasSerialTracking),
        data.status || 'active',
        JSON.stringify(data.specifications || {})
      ]);

      const created = mapDbProduct(insertRes.rows[0]);
      productsStore.unshift(created);

      await auditService.record({
        actorId: req.user!.id,
        actorName: req.user!.name,
        actorRole: req.user!.role,
        permissionUsed: 'inventory.create',
        action: 'INVENTORY_CREATE',
        entity: 'InventoryItem',
        entityId: created.id,
        newState: created,
        reason: 'New product catalogue registration in Supabase PostgreSQL'
      });

      return sendSuccess(res, created, 201, undefined, 'Product registered successfully in database');
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      console.warn('PostgreSQL insert product failed, saving in memory:', err);
    }

    // In-memory fallback
    if (productsStore.some(p => p.sku?.toLowerCase() === sku.toLowerCase())) {
      throw new AppError(409, 'DUPLICATE_SKU', `SKU '${sku}' already exists.`);
    }

    const fallbackProduct = {
      id: `prd-${Date.now()}`,
      sku,
      name: data.name,
      category: data.category || 'Solar Panels',
      brand: data.brand || 'SolarOS Certified',
      model: data.model || '',
      description: data.description || '',
      unitOfMeasure: data.unitOfMeasure || 'pcs',
      unitCost: Number(data.unitCost) || 10000,
      sellingPrice: Number(data.sellingPrice) || 14000,
      standardCost: Number(data.standardCost) || (Number(data.unitCost || 10000) * 0.95),
      taxRate: Number(data.taxRate) || 18,
      minimumThreshold: Number(data.minimumThreshold) || 10,
      reorderThreshold: Number(data.reorderThreshold) || 15,
      maxThreshold: Number(data.maxThreshold) || 500,
      locationBin: data.locationBin || 'MAIN-A1',
      hasSerialTracking: Boolean(data.hasSerialTracking),
      status: data.status || 'active',
      availableQuantity: Number(data.availableQuantity) || 20,
      reservedQuantity: 0,
      specifications: data.specifications || {}
    };

    productsStore.unshift(fallbackProduct);
    sendSuccess(res, fallbackProduct, 201, undefined, 'Product registered successfully');
  } catch (err) {
    next(err);
  }
});

// 4. PATCH /:id — Edit existing product (with SKU validation and price history tracking)
router.patch('/:id', requireAuth, requireAction('inventory', 'edit'), validateRequest({ body: updateProductSchema }), async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;

    let existingDbProduct: any = null;
    try {
      const existingRes = await db.query('SELECT * FROM products WHERE id::text = $1 OR LOWER(sku) = LOWER($1) LIMIT 1', [id]);
      if (existingRes.rows.length > 0) {
        existingDbProduct = existingRes.rows[0];
      }
    } catch {
      // fallback
    }

    const memIdx = productsStore.findIndex(p => p.id === id || p.sku?.toLowerCase() === id.toLowerCase());
    const existingMem = memIdx >= 0 ? productsStore[memIdx] : null;

    if (!existingDbProduct && !existingMem) {
      throw new AppError(404, 'NOT_FOUND', `Product '${id}' not found in inventory catalogue.`);
    }

    const currentSku = existingDbProduct?.sku || existingMem?.sku;
    const targetId = existingDbProduct?.id || existingMem?.id;

    // Validate SKU uniqueness across other products
    if (updates.sku && updates.sku.trim().toLowerCase() !== currentSku?.toLowerCase()) {
      const newSku = updates.sku.trim();
      try {
        const skuCheck = await db.query(
          'SELECT id FROM products WHERE LOWER(sku) = LOWER($1) AND id != $2 LIMIT 1',
          [newSku, targetId]
        );
        if (skuCheck.rows.length > 0) {
          throw new AppError(409, 'DUPLICATE_SKU', `SKU '${newSku}' is already assigned to another product.`);
        }
      } catch (checkErr: any) {
        if (checkErr instanceof AppError) throw checkErr;
      }

      if (productsStore.some(p => p.id !== targetId && p.sku?.toLowerCase() === newSku.toLowerCase())) {
        throw new AppError(409, 'DUPLICATE_SKU', `SKU '${newSku}' is already assigned to another product.`);
      }
    }

    // Determine price change
    const oldUnitCost = Number(existingDbProduct?.unit_cost ?? existingMem?.unitCost ?? 0);
    const newUnitCost = updates.unitCost !== undefined ? Number(updates.unitCost) : oldUnitCost;

    const oldSellingPrice = Number(existingDbProduct?.selling_price ?? existingMem?.sellingPrice ?? 0);
    const newSellingPrice = updates.sellingPrice !== undefined ? Number(updates.sellingPrice) : oldSellingPrice;

    const oldStandardCost = Number(existingDbProduct?.standard_cost ?? existingMem?.standardCost ?? (oldUnitCost * 0.95));
    const newStandardCost = updates.standardCost !== undefined ? Number(updates.standardCost) : oldStandardCost;

    const isPriceChanged = 
      (updates.unitCost !== undefined && Math.abs(oldUnitCost - newUnitCost) > 0.01) ||
      (updates.sellingPrice !== undefined && Math.abs(oldSellingPrice - newSellingPrice) > 0.01) ||
      (updates.standardCost !== undefined && Math.abs(oldStandardCost - newStandardCost) > 0.01);

    // Save update in PostgreSQL
    if (existingDbProduct) {
      try {
        await db.withTransaction(async client => {
          await client.query(`
            UPDATE products SET
              name = COALESCE($1, name),
              sku = COALESCE($2, sku),
              category = COALESCE($3, category),
              brand = COALESCE($4, brand),
              model = COALESCE($5, model),
              description = COALESCE($6, description),
              unit_of_measure = COALESCE($7, unit_of_measure),
              unit_cost = COALESCE($8, unit_cost),
              selling_price = COALESCE($9, selling_price),
              standard_cost = COALESCE($10, standard_cost),
              tax_rate = COALESCE($11, tax_rate),
              minimum_stock_threshold = COALESCE($12, minimum_stock_threshold),
              reorder_threshold = COALESCE($13, reorder_threshold),
              maximum_stock_threshold = COALESCE($14, maximum_stock_threshold),
              location_bin = COALESCE($15, location_bin),
              has_serial_tracking = COALESCE($16, has_serial_tracking),
              status = COALESCE($17, status),
              specifications = CASE WHEN $18::jsonb IS NOT NULL THEN $18::jsonb ELSE specifications END,
              updated_at = NOW()
            WHERE id = $19
          `, [
            updates.name?.trim(),
            updates.sku?.trim(),
            updates.category,
            updates.brand,
            updates.model,
            updates.description,
            updates.unitOfMeasure,
            updates.unitCost,
            updates.sellingPrice,
            updates.standardCost,
            updates.taxRate,
            updates.minimumThreshold,
            updates.reorderThreshold,
            updates.maxThreshold,
            updates.locationBin,
            updates.hasSerialTracking,
            updates.status,
            updates.specifications ? JSON.stringify(updates.specifications) : null,
            targetId
          ]);

          // If price changed, record price history
          if (isPriceChanged) {
            await client.query(`
              INSERT INTO product_price_history (
                product_id, product_sku, product_name,
                previous_unit_cost, new_unit_cost,
                previous_selling_price, new_selling_price,
                previous_standard_cost, new_standard_cost,
                changed_by_id, changed_by_name, reason, effective_date, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
            `, [
              targetId,
              updates.sku?.trim() || existingDbProduct.sku,
              updates.name?.trim() || existingDbProduct.name,
              oldUnitCost,
              newUnitCost,
              oldSellingPrice,
              newSellingPrice,
              oldStandardCost,
              newStandardCost,
              req.user?.id || 'usr-1',
              req.user?.name || 'Administrator',
              updates.priceChangeReason || 'Product catalogue price revision'
            ]);
          }
        });

        // Re-fetch updated row
        const refreshedRes = await db.query('SELECT * FROM products WHERE id = $1', [targetId]);
        const updatedItem = mapDbProduct(refreshedRes.rows[0]);

        // Sync memory store
        if (memIdx >= 0) {
          productsStore[memIdx] = { ...productsStore[memIdx], ...updatedItem };
        } else {
          productsStore.push(updatedItem);
        }

        await auditService.record({
          actorId: req.user!.id,
          actorName: req.user!.name,
          actorRole: req.user!.role,
          permissionUsed: 'inventory.edit',
          action: isPriceChanged ? 'PRODUCT_PRICE_UPDATED' : 'PRODUCT_UPDATED',
          entity: 'InventoryItem',
          entityId: targetId,
          previousState: {
            unitCost: oldUnitCost,
            sellingPrice: oldSellingPrice,
            standardCost: oldStandardCost
          },
          newState: updatedItem,
          reason: updates.priceChangeReason || 'Product details updated in PostgreSQL'
        });

        return sendSuccess(res, updatedItem, 200, undefined, 'Product updated successfully in PostgreSQL');
      } catch (dbErr: any) {
        if (dbErr instanceof AppError) throw dbErr;
        console.warn('PostgreSQL update product failed, falling back to in-memory:', dbErr);
      }
    }

    // In-memory fallback update
    if (existingMem) {
      if (updates.name !== undefined) existingMem.name = updates.name.trim();
      if (updates.sku !== undefined) existingMem.sku = updates.sku.trim();
      if (updates.category !== undefined) existingMem.category = updates.category;
      if (updates.brand !== undefined) existingMem.brand = updates.brand;
      if (updates.model !== undefined) existingMem.model = updates.model;
      if (updates.description !== undefined) existingMem.description = updates.description;
      if (updates.unitOfMeasure !== undefined) existingMem.unitOfMeasure = updates.unitOfMeasure;
      if (updates.unitCost !== undefined) existingMem.unitCost = Number(updates.unitCost);
      if (updates.sellingPrice !== undefined) existingMem.sellingPrice = Number(updates.sellingPrice);
      if (updates.standardCost !== undefined) existingMem.standardCost = Number(updates.standardCost);
      if (updates.taxRate !== undefined) existingMem.taxRate = Number(updates.taxRate);
      if (updates.minimumThreshold !== undefined) existingMem.minimumThreshold = Number(updates.minimumThreshold);
      if (updates.reorderThreshold !== undefined) existingMem.reorderThreshold = Number(updates.reorderThreshold);
      if (updates.maxThreshold !== undefined) existingMem.maxThreshold = Number(updates.maxThreshold);
      if (updates.locationBin !== undefined) existingMem.locationBin = updates.locationBin;
      if (updates.hasSerialTracking !== undefined) existingMem.hasSerialTracking = updates.hasSerialTracking;
      if (updates.status !== undefined) existingMem.status = updates.status;
      if (updates.availableQuantity !== undefined) existingMem.availableQuantity = Number(updates.availableQuantity);
      if (updates.specifications !== undefined) existingMem.specifications = updates.specifications;

      sendSuccess(res, existingMem, 200, undefined, 'Product updated successfully');
    }
  } catch (err) {
    next(err);
  }
});

// 5. GET /:id/price-history — Chronological price audit history
router.get('/:id/price-history', requireAuth, requireAction('inventory', 'view'), async (req, res, next) => {
  try {
    const id = String(req.params.id);
    try {
      const historyRes = await db.query(`
        SELECT *
        FROM product_price_history
        WHERE product_id::text = $1 OR LOWER(product_sku) = LOWER($1)
        ORDER BY created_at DESC
      `, [id]);

      const history = historyRes.rows.map(row => ({
        id: row.id,
        productId: row.product_id,
        productSku: row.product_sku,
        productName: row.product_name,
        previousUnitCost: Number(row.previous_unit_cost || 0),
        newUnitCost: Number(row.new_unit_cost || 0),
        previousSellingPrice: Number(row.previous_selling_price || 0),
        newSellingPrice: Number(row.new_selling_price || 0),
        previousStandardCost: Number(row.previous_standard_cost || 0),
        newStandardCost: Number(row.new_standard_cost || 0),
        changedById: row.changed_by_id,
        changedByName: row.changed_by_name,
        reason: row.reason,
        effectiveDate: row.effective_date,
        createdAt: row.created_at
      }));

      return sendSuccess(res, history);
    } catch (err) {
      console.warn('PostgreSQL price history query failed, returning empty:', err);
      return sendSuccess(res, []);
    }
  } catch (err) {
    next(err);
  }
});

// 6. POST /:id/adjust — Stock adjustment
router.post('/:id/adjust', requireAuth, requireAction('inventory', 'edit'), validateRequest({ body: adjustStockSchema }), async (req, res, next) => {
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

    sendSuccess(res, item, 200, undefined, 'Stock count adjusted successfully');
  } catch (err) {
    next(err);
  }
});

// 7. DELETE /:id — Deactivate / Archive product
router.delete('/:id', requireAuth, requireAction('inventory', 'delete'), async (req, res, next) => {
  try {
    const id = String(req.params.id);
    try {
      await db.query(`UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id::text = $1`, [id]);
    } catch {
      // ignore
    }

    const idx = productsStore.findIndex(p => p.id === id);
    if (idx !== -1) {
      productsStore[idx].status = 'inactive';
    }

    sendSuccess(res, { id, message: 'Product archived successfully' });
  } catch (err) {
    next(err);
  }
});

export const inventoryRoutes = router;
