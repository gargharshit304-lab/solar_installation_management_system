import React, { useState } from 'react';
import { 
  Package, Search, Filter, Plus, QrCode, AlertTriangle, 
  ArrowUpDown, ShieldCheck, Box, RefreshCw, CheckCircle2,
  Truck, ArrowRight, ArrowLeftRight, ClipboardCheck, ListTodo,
  FileText, BarChart3, Warehouse as WarehouseIcon, Eye,
  Check, X, AlertCircle, Calendar, MapPin, UserCheck,
  Download, Layers, Hash, ShieldAlert, Sparkles, Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  InventoryItem, ProductCategory, SerialNumberRecord, 
  GoodsReceiptNote, StockMovementRecord, WarehouseTransfer, 
  StockCountSession, WarehouseTask, StockAdjustment
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { QrScannerModal } from '../components/common/QrScannerModal';

export const InventoryPage: React.FC = () => {
  const { 
    currentUser,
    warehouses,
    storageLocations,
    suppliers,
    inventory,
    serialNumbers,
    goodsReceipts,
    stockMovements,
    stockAdjustments,
    stockReservations,
    warehouseTransfers,
    stockCountSessions,
    warehouseTasks,
    orders,
    addInventoryItem,
    adjustStockQuantity,
    registerGoodsReceipt,
    registerSerialNumber,
    allocateSerialsToOrder,
    createWarehouseTransfer,
    receiveWarehouseTransfer,
    createStockCountSession,
    submitStockCount,
    approveStockCountDiscrepancy,
    createWarehouseTask,
    updateWarehouseTaskStatus,
    resetDemoInventory,
    isDemoMode,
    showToast 
  } = useApp();

  const isOwner = currentUser.role === 'owner_admin';
  const isWarehouseMgr = currentUser.role === 'warehouse_mgr';
  const isStaff = !isOwner && !isWarehouseMgr;

  // Active Tab State
  type InventoryTab = 
    | 'dashboard' 
    | 'products' 
    | 'stock_ledger' 
    | 'serials' 
    | 'grn' 
    | 'allocations' 
    | 'transfers' 
    | 'stock_count' 
    | 'tasks' 
    | 'reports';

  const [activeTab, setActiveTab] = useState<InventoryTab>(isStaff ? 'tasks' : 'dashboard');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedSerialStatusFilter, setSelectedSerialStatusFilter] = useState<string>('all');

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isSerialDetailModalOpen, setIsSerialDetailModalOpen] = useState(false);
  const [selectedSerialDetail, setSelectedSerialDetail] = useState<SerialNumberRecord | null>(null);

  // Stock Adjustment Form
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<InventoryItem | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(5);
  const [adjustmentReason, setAdjustmentReason] = useState<StockAdjustment['adjustmentReason']>('audit_reconciliation');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  // New Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Solar Panels' as ProductCategory,
    brand: 'Waaree',
    model: 'Mono PERC 540W',
    unitOfMeasure: 'pcs',
    availableQuantity: 20,
    minimumThreshold: 10,
    unitCost: 10200,
    sellingPrice: 13800,
    supplier: 'Waaree Energies Ltd',
    supplierId: 'sup-1',
    hasSerialTracking: false,
    trackingType: 'quantity_tracked' as 'quantity_tracked' | 'serialized',
    stockStatus: 'in_stock' as const,
    preferredWarehouseId: 'wh-pune-central',
    preferredWarehouseName: 'Pune Central Distribution Hub',
    locationBin: 'PUN-ZB-R02-PALLET-04',
    voltage: '41.8V Vmp',
    powerRating: '540W',
    phaseType: 'three_phase' as const,
    dimensions: '2278 x 1134 x 35 mm',
    weightKg: 28.5
  });

  // New GRN Form
  const [grnForm, setGrnForm] = useState({
    supplierId: 'sup-2',
    supplierName: 'Deye Solar India Pvt Ltd',
    poReference: 'PO-2026-022',
    deliveryChallanNo: 'DC-2026-9901',
    receivingDate: new Date().toISOString().split('T')[0],
    warehouseId: 'wh-pune-central',
    warehouseName: 'Pune Central Distribution Hub',
    productId: 'prd-inv-5kw',
    orderedQty: 5,
    receivedQty: 5,
    acceptedQty: 5,
    rejectedQty: 0,
    unitCost: 46000,
    serialNumberInputs: 'DEYE-2026-INV-11001, DEYE-2026-INV-11002',
    remarks: 'Verified safe delivery in intact packaging'
  });

  // New Transfer Form
  const [transferForm, setTransferForm] = useState({
    sourceWarehouseId: 'wh-pune-central',
    sourceWarehouseName: 'Pune Central Distribution Hub',
    destinationWarehouseId: 'wh-sambhajinagar',
    destinationWarehouseName: 'Chhatrapati Sambhajinagar Depot',
    sourceLocation: 'PUN-ZA-R01-S01-B01',
    destinationLocation: 'CSN-ZA-R01-S01-B01',
    productId: 'prd-inv-5kw',
    requestedQty: 2,
    expectedDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    notes: 'Inter-depot stock replenishment'
  });

  // New Stock Count Form
  const [countForm, setCountForm] = useState({
    title: 'Routine Shelf Cycle Count',
    warehouseId: 'wh-pune-central',
    warehouseName: 'Pune Central Distribution Hub',
    zone: 'Zone A (Inverters)',
    countType: 'cycle_count' as const,
    assignedStaffId: 'usr-4',
    assignedStaffName: 'Ganesh Shinde',
    scheduledDate: new Date().toISOString().split('T')[0]
  });

  // New Task Form
  const [taskForm, setTaskForm] = useState({
    taskType: 'order_picking' as const,
    priority: 'high' as const,
    title: 'Pick Equipment for Scheduled Dispatch',
    warehouseId: 'wh-pune-central',
    warehouseName: 'Pune Central Distribution Hub',
    assignedStaffId: 'usr-4',
    assignedStaffName: 'Ganesh Shinde',
    instructions: 'Pick 1x Inverter and 10x Panels from designated bays.',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  // The 9 Canonical Solar Categories
  const categories: ProductCategory[] = [
    'Solar Panels',
    'Inverters',
    'Batteries',
    'Controllers',
    'Connectors',
    'Wires and Cables',
    'Wiring Boxes',
    'Mounting Stands and Structures',
    'Safety Equipment'
  ];

  // Calculations for Warehouse Manager (PART 4: Six KPI cards in two rows of three)
  const totalProductsCount = inventory.length;
  const totalStockUnits = inventory.reduce((sum, item) => sum + item.availableQuantity, 0);
  const lowStockCount = inventory.filter(item => item.availableQuantity > 0 && item.availableQuantity <= item.minimumThreshold).length;
  const outOfStockCount = inventory.filter(item => item.availableQuantity === 0).length;
  const pendingReceiptsCount = goodsReceipts.filter(g => g.status === 'under_inspection').length;
  const pendingDispatchesCount = orders.filter(o => o.orderStatus === 'confirmed' || o.orderStatus === 'ready_for_dispatch').length;

  // Calculations for Owner (Company-wide Overview)
  const totalValuation = inventory.reduce((sum, item) => sum + (item.availableQuantity * item.unitCost), 0);
  const totalReservedUnits = inventory.reduce((sum, item) => sum + item.reservedQuantity, 0);
  const totalInTransitUnits = inventory.reduce((sum, item) => sum + (item.inTransitQuantity || 0), 0);
  const activeTransfersCount = warehouseTransfers.filter(t => t.status === 'in_transit').length;

  // Filtered Products
  const filteredInventory = inventory.filter(item => {
    const matchesCategory = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    const matchesWarehouse = selectedWarehouseFilter === 'all' || item.preferredWarehouseId === selectedWarehouseFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term) || 
                          item.sku.toLowerCase().includes(term) ||
                          item.supplier.toLowerCase().includes(term) ||
                          item.locationBin.toLowerCase().includes(term);
    return matchesCategory && matchesWarehouse && matchesSearch;
  });

  // Filtered Serials
  const filteredSerials = serialNumbers.filter(s => {
    const matchesStatus = selectedSerialStatusFilter === 'all' || s.currentStatus === selectedSerialStatusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = s.serialNumber.toLowerCase().includes(term) ||
                          s.productName.toLowerCase().includes(term) ||
                          (s.assignedCustomer && s.assignedCustomer.toLowerCase().includes(term)) ||
                          (s.supplier && s.supplier.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  // Handlers
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    // Check duplicate SKU or duplicate name
    if (inventory.some(i => i.name.toLowerCase() === productForm.name.trim().toLowerCase())) {
      showToast('Validation Error: A product with this exact description already exists.', 'error');
      return;
    }

    addInventoryItem({
      name: productForm.name.trim(),
      category: productForm.category,
      brand: productForm.brand,
      model: productForm.model,
      unitOfMeasure: productForm.unitOfMeasure,
      availableQuantity: productForm.availableQuantity,
      reservedQuantity: 0,
      inTransitQuantity: 0,
      damagedQuantity: 0,
      minimumThreshold: productForm.minimumThreshold,
      unitCost: productForm.unitCost,
      sellingPrice: productForm.sellingPrice,
      supplier: productForm.supplier,
      supplierId: productForm.supplierId,
      hasSerialTracking: productForm.hasSerialTracking,
      trackingType: productForm.trackingType,
      stockStatus: productForm.availableQuantity === 0 ? 'out_of_stock' : (productForm.availableQuantity <= productForm.minimumThreshold ? 'low_stock' : 'in_stock'),
      preferredWarehouseId: productForm.preferredWarehouseId,
      preferredWarehouseName: productForm.preferredWarehouseName,
      locationBin: productForm.locationBin,
      specifications: {
        voltage: productForm.voltage,
        powerRating: productForm.powerRating,
        dimensions: productForm.dimensions,
        weightKg: productForm.weightKg
      }
    });

    setIsAddProductModalOpen(false);
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedProductForAdjust(item);
    setAdjustmentAmount(5);
    setAdjustmentReason('audit_reconciliation');
    setAdjustmentNotes(`Physical bin stock audit in ${item.locationBin}`);
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjust = () => {
    if (!selectedProductForAdjust) return;
    adjustStockQuantity(
      selectedProductForAdjust.id, 
      adjustmentAmount, 
      adjustmentReason, 
      adjustmentNotes,
      selectedProductForAdjust.preferredWarehouseId
    );
    setIsAdjustModalOpen(false);
  };

  const handleCreateGrn = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = inventory.find(i => i.id === grnForm.productId);
    if (!prod) return;

    const serialsList = prod.hasSerialTracking
      ? grnForm.serialNumberInputs.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    registerGoodsReceipt({
      supplierId: grnForm.supplierId,
      supplierName: grnForm.supplierName,
      poReference: grnForm.poReference,
      deliveryChallanNo: grnForm.deliveryChallanNo,
      receivingDate: grnForm.receivingDate,
      warehouseId: grnForm.warehouseId,
      warehouseName: grnForm.warehouseName,
      receivedById: currentUser.id,
      receivedByName: currentUser.name,
      status: 'confirmed',
      totalReceivedQty: grnForm.receivedQty,
      totalAcceptedQty: grnForm.acceptedQty,
      totalRejectedQty: grnForm.rejectedQty,
      remarks: grnForm.remarks,
      items: [
        {
          id: `grni-${Date.now()}`,
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          category: prod.category,
          orderedQty: grnForm.orderedQty,
          receivedQty: grnForm.receivedQty,
          acceptedQty: grnForm.acceptedQty,
          rejectedQty: grnForm.rejectedQty,
          unitCost: grnForm.unitCost,
          serialNumbers: serialsList
        }
      ]
    });

    setIsGrnModalOpen(false);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = inventory.find(i => i.id === transferForm.productId);
    if (!prod) return;

    if (prod.availableQuantity < transferForm.requestedQty) {
      showToast(`Insufficient stock: Only ${prod.availableQuantity} units available in source warehouse.`, 'error');
      return;
    }

    createWarehouseTransfer({
      sourceWarehouseId: transferForm.sourceWarehouseId,
      sourceWarehouseName: transferForm.sourceWarehouseName,
      destinationWarehouseId: transferForm.destinationWarehouseId,
      destinationWarehouseName: transferForm.destinationWarehouseName,
      sourceLocation: transferForm.sourceLocation,
      destinationLocation: transferForm.destinationLocation,
      requestedById: currentUser.id,
      requestedByName: currentUser.name,
      assignedStaffId: currentUser.id,
      assignedStaffName: currentUser.name,
      expectedDate: transferForm.expectedDate,
      notes: transferForm.notes,
      items: [
        {
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          category: prod.category,
          requestedQty: transferForm.requestedQty,
          transferredQty: transferForm.requestedQty,
          receivedQty: 0
        }
      ]
    });

    setIsTransferModalOpen(false);
  };

  const handleCreateCountSession = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-populate items matching warehouse and zone
    const targetItems = inventory
      .filter(i => i.preferredWarehouseId === countForm.warehouseId)
      .map(i => ({
        productId: i.id,
        sku: i.sku,
        productName: i.name,
        category: i.category,
        locationBin: i.locationBin,
        expectedQty: i.availableQuantity,
        countedQty: i.availableQuantity,
        difference: 0
      }));

    createStockCountSession({
      title: countForm.title,
      warehouseId: countForm.warehouseId,
      warehouseName: countForm.warehouseName,
      zone: countForm.zone,
      countType: countForm.countType,
      status: 'in_progress',
      assignedStaffId: countForm.assignedStaffId,
      assignedStaffName: countForm.assignedStaffName,
      scheduledDate: countForm.scheduledDate,
      items: targetItems
    });

    setIsCountModalOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createWarehouseTask({
      taskType: taskForm.taskType,
      priority: taskForm.priority,
      title: taskForm.title,
      warehouseId: taskForm.warehouseId,
      warehouseName: taskForm.warehouseName,
      assignedStaffId: taskForm.assignedStaffId,
      assignedStaffName: taskForm.assignedStaffName,
      instructions: taskForm.instructions,
      dueDate: taskForm.dueDate,
      status: 'pending'
    });
    setIsNewTaskModalOpen(false);
  };

  const handleScannedSerial = (serial: string) => {
    setSearchTerm(serial);
    setActiveTab('serials');
    const match = serialNumbers.find(s => s.serialNumber.toLowerCase() === serial.toLowerCase());
    if (match) {
      setSelectedSerialDetail(match);
      setIsSerialDetailModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Demo Mode Isolation Banner */}
      {isDemoMode && (
        <div className="bg-amber-500/10 border border-amber/40 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-amber text-white font-bold text-[10px] tracking-wider uppercase">
              Demo Mode Active
            </span>
            <span className="text-charcoal font-semibold">
              Isolated warehouse testing environment. Real database records protected.
            </span>
          </div>
          <button
            type="button"
            onClick={resetDemoInventory}
            className="self-end sm:self-auto px-3 py-1 bg-white hover:bg-sand-100 text-charcoal border border-amber/50 font-bold rounded-lg transition-colors shadow-2xs flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber" />
            <span>Reset Demo Inventory</span>
          </button>
        </div>
      )}

      {/* 1. Header with Role Distinction */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOwner ? 'bg-navy animate-pulse' : 'bg-sage animate-ping'}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              {isOwner ? 'Executive Inventory & Supply Chain Governance' : 'Central Warehouse Operations'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            {isOwner ? 'Company Inventory Oversight' : 'Warehouse & Inventory Operations'}
          </h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            {isOwner
              ? 'Multi-warehouse stock valuation, supply chain movements, critical shortage alerts & dispatch audits.'
              : 'Physical stock intake, barcode/serial scanning, order picking & packing, transfers and cycle counts.'
            }
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!isOwner && (
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-3 py-2 bg-sand-100 hover:bg-sand-200 text-charcoal border border-warmGrey text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <QrCode className="w-4 h-4 text-navy" />
              <span>Scan Barcode / QR</span>
            </button>
          )}

          {isWarehouseMgr && (
            <>
              <button
                onClick={() => setIsGrnModalOpen(true)}
                className="px-3.5 py-2 bg-sage text-white text-xs font-semibold rounded-xl hover:bg-sage-dark transition-colors shadow-xs flex items-center space-x-1.5"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>+ Receive Goods (GRN)</span>
              </button>
              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Catalogue Product</span>
              </button>
            </>
          )}

          {isOwner && (
            <div className="flex items-center space-x-2 bg-sand-50 border border-warmGrey px-3 py-1.5 rounded-xl text-xs font-semibold text-charcoal">
              <ShieldCheck className="w-4 h-4 text-navy" />
              <span>Executive Monitoring Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Top-Level Metrics (Strictly fulfilling PART 4) */}
      {isWarehouseMgr ? (
        /* =========================================================================
           WAREHOUSE MANAGER DASHBOARD KPIS (PART 4: 6 CARDS IN TWO ROWS OF THREE)
           ========================================================================= */
        <div className="space-y-3.5">
          {/* Row 1 of 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl border border-warmGrey/60 bg-white shadow-card">
              <div className="flex items-center justify-between text-mutedGrey">
                <span className="text-[11px] font-bold uppercase tracking-wider">1. Total Products</span>
                <Package className="w-4 h-4 text-navy" />
              </div>
              <p className="text-2xl font-bold text-charcoal mt-2">{totalProductsCount}</p>
              <p className="text-[10px] text-mutedGrey mt-0.5">Catalogued hardware SKUs</p>
            </div>

            <div className="p-4 rounded-2xl border border-warmGrey/60 bg-white shadow-card">
              <div className="flex items-center justify-between text-mutedGrey">
                <span className="text-[11px] font-bold uppercase tracking-wider">2. Total Stock Units</span>
                <Layers className="w-4 h-4 text-navy" />
              </div>
              <p className="text-2xl font-bold text-charcoal mt-2">{totalStockUnits}</p>
              <p className="text-[10px] text-mutedGrey mt-0.5">Physical units across bays</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${
              lowStockCount > 0 ? 'border-amber bg-amber-50/70 shadow-xs ring-1 ring-amber/20' : 'border-warmGrey/60 bg-white'
            }`}>
              <div className="flex items-center justify-between text-amber">
                <span className="text-[11px] font-bold uppercase tracking-wider">3. Low Stock Items</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-charcoal mt-2">{lowStockCount}</p>
              <p className="text-[10px] text-mutedGrey mt-0.5">Below reorder threshold</p>
            </div>
          </div>

          {/* Row 2 of 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className={`p-4 rounded-2xl border transition-all ${
              outOfStockCount > 0 ? 'border-terracotta bg-terracotta/10 shadow-xs ring-1 ring-terracotta/30' : 'border-warmGrey/60 bg-white'
            }`}>
              <div className="flex items-center justify-between text-terracotta">
                <span className="text-[11px] font-bold uppercase tracking-wider">4. Out of Stock</span>
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-charcoal mt-2">{outOfStockCount}</p>
              <p className="text-[10px] text-mutedGrey mt-0.5">Immediate PO replenishment needed</p>
            </div>

            <div className="p-4 rounded-2xl border border-warmGrey/60 bg-white shadow-card">
              <div className="flex items-center justify-between text-sage">
                <span className="text-[11px] font-bold uppercase tracking-wider">5. Pending Receipts</span>
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-charcoal mt-2">{pendingReceiptsCount}</p>
              <p className="text-[10px] text-mutedGrey mt-0.5">GRN under QA inspection</p>
            </div>

            <div className="p-4 rounded-2xl border border-warmGrey/60 bg-white shadow-card">
              <div className="flex items-center justify-between text-navy">
                <span className="text-[11px] font-bold uppercase tracking-wider">6. Pending Dispatches</span>
                <Truck className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-charcoal mt-2">{pendingDispatchesCount}</p>
              <p className="text-[10px] text-mutedGrey mt-0.5">Confirmed customer orders</p>
            </div>
          </div>
        </div>
      ) : isOwner ? (
        /* =========================================================================
           OWNER COMPANY-WIDE WAREHOUSE OVERVIEW
           ========================================================================= */
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl border border-warmGrey/60 bg-white shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey block">Inventory Valuation</span>
            <p className="text-xl font-bold text-navy mt-1.5">₹{(totalValuation / 100000).toFixed(2)} L</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">Asset book value</p>
          </div>

          <div className="p-4 rounded-2xl border border-warmGrey/60 bg-white shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey block">Available Stock</span>
            <p className="text-xl font-bold text-charcoal mt-1.5">{totalStockUnits} units</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">Free for sale</p>
          </div>

          <div className="p-4 rounded-2xl border border-warmGrey/60 bg-white shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey block">Reserved on Orders</span>
            <p className="text-xl font-bold text-charcoal mt-1.5">{totalReservedUnits} units</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">Committed to projects</p>
          </div>

          <div className="p-4 rounded-2xl border border-warmGrey/60 bg-white shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey block">In-Transit Freight</span>
            <p className="text-xl font-bold text-charcoal mt-1.5">{totalInTransitUnits} units</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">{activeTransfersCount} active transfers</p>
          </div>

          <div className="p-4 rounded-2xl border border-amber/40 bg-amber-50/60 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber block">Critical Low Stock</span>
            <p className="text-xl font-bold text-charcoal mt-1.5">{lowStockCount} SKUs</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">Reorder trigger hit</p>
          </div>

          <div className="p-4 rounded-2xl border border-warmGrey/60 bg-white shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey block">Active Facilities</span>
            <p className="text-xl font-bold text-charcoal mt-1.5">{warehouses.length} Depots</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">Pune, CSN, Nashik</p>
          </div>
        </div>
      ) : null}

      {/* 3. Comprehensive Navigation Tabs */}
      <div className="bg-white rounded-card p-3 border border-warmGrey/60 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 overflow-x-auto text-xs font-semibold">
          {!isStaff && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'dashboard' ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey/60'
              }`}
            >
              Overview
            </button>
          )}

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-2 rounded-xl transition-colors ${
              activeTab === 'products' ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey/60'
            }`}
          >
            Product Catalog ({inventory.length})
          </button>

          <button
            onClick={() => setActiveTab('stock_ledger')}
            className={`px-3 py-2 rounded-xl transition-colors ${
              activeTab === 'stock_ledger' ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey/60'
            }`}
          >
            Stock Ledger & Movements
          </button>

          <button
            onClick={() => setActiveTab('serials')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center space-x-1 ${
              activeTab === 'serials' ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey/60'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Serial Vault ({serialNumbers.length})</span>
          </button>

          {!isStaff && (
            <>
              <button
                onClick={() => setActiveTab('grn')}
                className={`px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'grn' ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey/60'
                }`}
              >
                Goods Receipts ({goodsReceipts.length})
              </button>

              <button
                onClick={() => setActiveTab('allocations')}
                className={`px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'allocations' ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey/60'
                }`}
              >
                Order Reservations
              </button>

              <button
                onClick={() => setActiveTab('transfers')}
                className={`px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'transfers' ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey/60'
                }`}
              >
                Transfers ({warehouseTransfers.length})
              </button>

              <button
                onClick={() => setActiveTab('stock_count')}
                className={`px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'stock_count' ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey/60'
                }`}
              >
                Stock Counts
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center space-x-1 ${
              activeTab === 'tasks' ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey/60'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Staff Tasks ({warehouseTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center space-x-1 ${
              activeTab === 'reports' ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Valuation & Reports</span>
          </button>
        </div>

        {/* Global Search and Category Dropdown */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product, SKU, serial..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy w-48 sm:w-60 bg-white"
            />
          </div>
        </div>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Low Stock Alerts Rail */}
          {lowStockCount > 0 && (
            <div className="bg-amber-50/90 border border-amber/50 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Attention Required: {lowStockCount} Products Below Minimum Safety Threshold
                  </h3>
                </div>
                <span className="text-[11px] text-mutedGrey">Action: Generate supplier replenishment PO</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                {inventory.filter(i => i.availableQuantity <= i.minimumThreshold).map(item => (
                  <div key={item.id} className="p-3 bg-white rounded-xl border border-amber/30 text-xs">
                    <p className="font-bold text-charcoal truncate">{item.name}</p>
                    <p className="text-[11px] font-mono text-mutedGrey">{item.sku} • {item.locationBin}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-terracotta font-bold">Avail: {item.availableQuantity}</span>
                      <span className="text-mutedGrey text-[11px]">Min: {item.minimumThreshold}</span>
                      {isWarehouseMgr && (
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="px-2 py-1 bg-amber-50 text-amber font-bold text-[10px] rounded border border-amber/40 hover:bg-amber-100"
                        >
                          Adjust
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warehouse Facilities & Storage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {warehouses.map(wh => {
              const whProducts = inventory.filter(i => i.preferredWarehouseId === wh.id);
              const whStockUnits = whProducts.reduce((sum, p) => sum + p.availableQuantity, 0);
              const whValuation = whProducts.reduce((sum, p) => sum + (p.availableQuantity * p.unitCost), 0);

              return (
                <div key={wh.id} className="bg-white rounded-2xl p-4 border border-warmGrey/60 shadow-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <WarehouseIcon className="w-4 h-4 text-navy" />
                        <h4 className="text-xs font-bold text-charcoal">{wh.name}</h4>
                      </div>
                      <p className="text-[11px] text-mutedGrey mt-0.5">{wh.address}, {wh.city}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage border border-sage/30">
                      Active Depot
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-sand-50/70 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-mutedGrey">Stock Units</span>
                      <p className="text-sm font-bold text-charcoal mt-0.5">{whStockUnits} units</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-mutedGrey">Valuation</span>
                      <p className="text-sm font-bold text-navy mt-0.5">₹{(whValuation / 100000).toFixed(2)} L</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-mutedGrey flex items-center justify-between pt-1">
                    <span>Manager: <strong className="text-charcoal">{wh.managerName}</strong></span>
                    <span>{wh.totalCapacitySqft.toLocaleString()} sq.ft</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Stock Movements Timeline */}
          <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
            <div className="p-4 border-b border-warmGrey/60 flex items-center justify-between bg-sand-50/50">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-navy" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Recent Stock Movements & Inbound Ledger
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('stock_ledger')}
                className="text-xs font-semibold text-navy hover:underline"
              >
                View Complete Ledger →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                  <tr>
                    <th className="py-3 px-4">Movement ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Product & SKU</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Warehouse & Location</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                  {stockMovements.slice(0, 5).map(mov => (
                    <tr key={mov.id} className="hover:bg-sand-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-navy">{mov.movementNumber}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sand-200 text-charcoal">
                          {mov.movementType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{mov.productName}</td>
                      <td className="py-3 px-4 font-bold">
                        <span className={mov.quantity >= 0 ? 'text-sage' : 'text-terracotta'}>
                          {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-mutedGrey">{mov.destinationWarehouse || mov.sourceWarehouse || 'Pune Hub'}</td>
                      <td className="py-3 px-4">{mov.executedByName}</td>
                      <td className="py-3 px-4 text-mutedGrey">{new Date(mov.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS CATALOG (PART 5) */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Category Filter Pills (9 Categories) */}
          <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-2xl border border-warmGrey/60 shadow-xs">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategoryFilter === 'all' ? 'bg-navy text-white' : 'bg-sand-50 text-charcoal hover:bg-sand-100'
              }`}
            >
              All 9 Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategoryFilter === cat ? 'bg-navy text-white' : 'bg-sand-50 text-charcoal hover:bg-sand-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Listing Table */}
          <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                  <tr>
                    <th className="py-3 px-4">Product Details & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Tracking</th>
                    <th className="py-3 px-4">Available Qty</th>
                    <th className="py-3 px-4">Reserved</th>
                    <th className="py-3 px-4">Unit Cost / Price</th>
                    <th className="py-3 px-4">Warehouse Bin</th>
                    <th className="py-3 px-4">Status</th>
                    {isWarehouseMgr && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                  {filteredInventory.map(item => (
                    <tr key={item.id} className="hover:bg-sand-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-charcoal">{item.name}</div>
                        <div className="text-[11px] font-mono text-mutedGrey">{item.sku} • {item.brand || 'SolarOS Certified'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-sand-100 text-[11px] font-medium text-charcoal border border-warmGrey/60">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.hasSerialTracking ? 'bg-navy/10 text-navy border border-navy/20' : 'bg-sand-200 text-mutedGrey'
                        }`}>
                          {item.hasSerialTracking ? 'Serialized' : 'Quantity-Tracked'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-sm">
                        <span className={item.availableQuantity <= item.minimumThreshold ? 'text-terracotta' : 'text-charcoal'}>
                          {item.availableQuantity}
                        </span>
                        <span className="text-[10px] text-mutedGrey block font-normal">Min: {item.minimumThreshold}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-navy">
                        {item.reservedQuantity}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-charcoal">₹{item.sellingPrice.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-mutedGrey">Cost: ₹{item.unitCost.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-mutedGrey">
                        {item.locationBin}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.stockStatus} />
                      </td>
                      {isWarehouseMgr && (
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenAdjust(item)}
                            className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 text-charcoal font-semibold rounded-lg text-xs inline-flex items-center space-x-1 border border-warmGrey"
                          >
                            <RefreshCw className="w-3 h-3 text-navy" />
                            <span>Adjust</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK LEDGER & MOVEMENTS (PART 8 & 16) */}
      {activeTab === 'stock_ledger' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-card border border-warmGrey/60 shadow-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Immutable Stock Movement Ledger
              </h3>
              <p className="text-[11px] text-mutedGrey mt-0.5">
                Append-only transaction ledger. Every stock adjustment, goods receipt and dispatch is recorded with actor attribution.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-navy text-white">
              {stockMovements.length} Total Movements
            </span>
          </div>

          <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                  <tr>
                    <th className="py-3 px-4">Movement Code</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Quantity Delta</th>
                    <th className="py-3 px-4">Source → Destination</th>
                    <th className="py-3 px-4">Reference Document</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                  {stockMovements.map(mov => (
                    <tr key={mov.id} className="hover:bg-sand-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy">{mov.movementNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sand-200 text-charcoal">
                          {mov.movementType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-charcoal">{mov.productName}</div>
                        <div className="text-[10px] text-mutedGrey">{mov.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-sm">
                        <span className={mov.quantity >= 0 ? 'text-sage' : 'text-terracotta'}>
                          {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-mutedGrey">
                        {mov.sourceWarehouse || 'Central'} → {mov.destinationWarehouse || 'Site / Client'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {mov.referenceType}: {mov.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium">{mov.executedByName}</td>
                      <td className="py-3.5 px-4 text-mutedGrey">
                        {new Date(mov.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SERIAL NUMBER VAULT (PART 9) */}
      {activeTab === 'serials' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-card border border-warmGrey/60 shadow-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Serialized Equipment Lifecycle Vault
              </h3>
              <p className="text-[11px] text-mutedGrey mt-0.5">
                Traceability for high-value Inverters, Batteries and Controllers from supplier GRN to customer warranty.
              </p>
            </div>

            {/* Serial Status Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedSerialStatusFilter}
                onChange={e => setSelectedSerialStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none"
              >
                <option value="all">All Statuses ({serialNumbers.length})</option>
                <option value="in_stock">In Stock</option>
                <option value="reserved">Reserved on Order</option>
                <option value="packed">Packed</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="installed">Installed & Active</option>
                <option value="under_service">Under RMA Service</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                  <tr>
                    <th className="py-3 px-4">Serial Number</th>
                    <th className="py-3 px-4">Equipment Model</th>
                    <th className="py-3 px-4">Warehouse & Location</th>
                    <th className="py-3 px-4">Customer / Order Allocation</th>
                    <th className="py-3 px-4">Delivery Date</th>
                    <th className="py-3 px-4">Warranty End Date</th>
                    <th className="py-3 px-4">Lifecycle Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                  {filteredSerials.map(sn => (
                    <tr 
                      key={sn.id} 
                      onClick={() => {
                        setSelectedSerialDetail(sn);
                        setIsSerialDetailModalOpen(true);
                      }}
                      className="cursor-pointer hover:bg-sand-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-navy">
                        {sn.serialNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-charcoal">{sn.productName}</div>
                        <div className="text-[10px] text-mutedGrey">{sn.category}</div>
                      </td>
                      <td className="py-3.5 px-4 text-mutedGrey">
                        {sn.warehouseName || 'Pune Hub'} • {sn.locationBin || 'Bay A'}
                      </td>
                      <td className="py-3.5 px-4">
                        {sn.assignedCustomer ? (
                          <span className="font-semibold text-charcoal">{sn.assignedCustomer}</span>
                        ) : (
                          <span className="text-mutedGrey italic">In Storage Vault</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-mutedGrey">
                        {sn.deliveryDate || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {sn.warrantyEndDate ? (
                          <span className="text-sage font-bold">Active to {sn.warrantyEndDate}</span>
                        ) : (
                          <span className="text-mutedGrey">Pending Handover</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={sn.currentStatus} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          className="px-2.5 py-1 bg-white border border-warmGrey text-navy font-semibold rounded-lg text-xs hover:bg-sand-100 inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Trace</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GOODS RECEIVING (GRN) (PART 7) */}
      {activeTab === 'grn' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-card border border-warmGrey/60 shadow-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Goods Receipt Notes (GRN) & Inbound Quality Inspection
              </h3>
              <p className="text-[11px] text-mutedGrey mt-0.5">
                Physical goods receiving from manufacturers, QA verification, serial number registration and stock balance credit.
              </p>
            </div>
            {isWarehouseMgr && (
              <button
                onClick={() => setIsGrnModalOpen(true)}
                className="px-4 py-2 bg-sage text-white text-xs font-bold rounded-xl hover:bg-sage-dark flex items-center space-x-1.5 shadow-xs"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>+ Create Inbound GRN</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goodsReceipts.map(grn => (
              <div key={grn.id} className="bg-white rounded-2xl p-4 border border-warmGrey/60 shadow-card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-navy">{grn.grnNumber}</span>
                    <h4 className="text-sm font-bold text-charcoal mt-0.5">{grn.supplierName}</h4>
                    <p className="text-[11px] text-mutedGrey">Challan: {grn.deliveryChallanNo} • PO: {grn.poReference || 'N/A'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    grn.status === 'confirmed' ? 'bg-sage-50 text-sage border border-sage/30' : 'bg-amber-50 text-amber border border-amber/30'
                  }`}>
                    {grn.status === 'confirmed' ? 'Receipt Confirmed' : 'Under QA Inspection'}
                  </span>
                </div>

                <div className="p-3 bg-sand-50/70 rounded-xl space-y-2 text-xs">
                  {grn.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b border-warmGrey/40 pb-1.5 last:border-b-0 last:pb-0">
                      <div>
                        <span className="font-semibold text-charcoal">{item.productName}</span>
                        <span className="text-[10px] text-mutedGrey block font-mono">{item.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sage">+{item.acceptedQty} accepted</span>
                        {item.rejectedQty > 0 && (
                          <span className="text-terracotta text-[10px] block font-bold">({item.rejectedQty} damaged)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-mutedGrey flex items-center justify-between pt-1">
                  <span>Received by: <strong className="text-charcoal">{grn.receivedByName}</strong></span>
                  <span>Total Value: <strong className="text-navy">₹{grn.totalValue.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ORDER RESERVATIONS (PART 10) */}
      {activeTab === 'allocations' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-card border border-warmGrey/60 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Customer Order Hardware Allocation & Reservations
              </h3>
              <p className="text-[11px] text-mutedGrey mt-0.5">
                BOM component reservations committed to active customer orders. Units marked reserved cannot be consumed by other projects.
              </p>
            </div>
            <span className="px-3 py-1 bg-navy text-white text-xs font-bold rounded-full">
              {stockReservations.length} Active Reservations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stockReservations.map(res => (
              <div key={res.id} className="bg-white rounded-2xl p-4 border border-warmGrey/60 shadow-card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-navy">{res.reservationCode}</span>
                    <h4 className="text-sm font-bold text-charcoal mt-0.5">{res.customerName}</h4>
                    <p className="text-[11px] text-mutedGrey">Order Ref: {res.orderNumber}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-navy/10 text-navy border border-navy/30">
                    Fully Allocated
                  </span>
                </div>

                <div className="p-3 bg-sand-50 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-mutedGrey">Committed Product:</span>
                    <span className="font-bold text-charcoal">{res.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mutedGrey">Reserved Quantity:</span>
                    <span className="font-bold text-navy">{res.quantityReserved} units</span>
                  </div>
                  {res.allocatedSerials.length > 0 && (
                    <div className="pt-1.5 border-t border-warmGrey/50">
                      <span className="text-[10px] uppercase font-bold text-mutedGrey block mb-1">Allocated Serials:</span>
                      <div className="flex flex-wrap gap-1">
                        {res.allocatedSerials.map(sn => (
                          <span key={sn} className="font-mono px-2 py-0.5 rounded bg-white border border-warmGrey/70 text-[10px] font-bold text-charcoal">
                            {sn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: TRANSFERS (PART 13) */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-card border border-warmGrey/60 shadow-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Inter-Warehouse Transfers & In-Transit Tracking
              </h3>
              <p className="text-[11px] text-mutedGrey mt-0.5">
                Multi-depot transfers with atomic balance adjustments and in-transit verification.
              </p>
            </div>
            {isWarehouseMgr && (
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light flex items-center space-x-1.5 shadow-xs"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>+ Initiate Transfer</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouseTransfers.map(trf => (
              <div key={trf.id} className="bg-white rounded-2xl p-4 border border-warmGrey/60 shadow-card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-navy">{trf.transferNumber}</span>
                    <div className="flex items-center space-x-2 mt-1 text-xs font-bold text-charcoal">
                      <span>{trf.sourceWarehouseName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-navy" />
                      <span>{trf.destinationWarehouseName}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    trf.status === 'completed' ? 'bg-sage-50 text-sage border border-sage/30' : 'bg-amber-50 text-amber border border-amber/30 animate-pulse'
                  }`}>
                    {trf.status === 'completed' ? 'Transfer Completed' : 'In Transit on Road'}
                  </span>
                </div>

                <div className="p-3 bg-sand-50 rounded-xl text-xs space-y-1">
                  {trf.items.map(item => (
                    <div key={item.productId} className="flex justify-between">
                      <span className="font-medium text-charcoal">{item.productName}</span>
                      <span className="font-bold text-navy">{item.transferredQty} units</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-mutedGrey pt-1">Notes: {trf.notes}</p>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-mutedGrey">
                    Expected: {trf.expectedDate}
                  </span>
                  {trf.status === 'in_transit' && isWarehouseMgr && (
                    <button
                      type="button"
                      onClick={() => receiveWarehouseTransfer(trf.id)}
                      className="px-3 py-1.5 bg-sage text-white font-bold rounded-lg hover:bg-sage-dark text-xs"
                    >
                      Confirm Inbound Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: STOCK COUNT SESSIONS (PART 14) */}
      {activeTab === 'stock_count' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-card border border-warmGrey/60 shadow-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Physical Stock Verification & Cycle Counts
              </h3>
              <p className="text-[11px] text-mutedGrey mt-0.5">
                Physical inventory counting sessions with discrepancy reconciliation and manager authorization.
              </p>
            </div>
            {isWarehouseMgr && (
              <button
                onClick={() => setIsCountModalOpen(true)}
                className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light flex items-center space-x-1.5 shadow-xs"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>+ New Count Session</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {stockCountSessions.map(session => (
              <div key={session.id} className="bg-white rounded-2xl p-4 border border-warmGrey/60 shadow-card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-navy">{session.sessionCode}</span>
                    <h4 className="text-sm font-bold text-charcoal mt-0.5">{session.title}</h4>
                    <p className="text-[11px] text-mutedGrey">{session.warehouseName} • {session.zone || 'Full Facility'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sage-50 text-sage border border-sage/30">
                    {session.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase">
                      <tr>
                        <th className="py-2 px-3">Product Name</th>
                        <th className="py-2 px-3">Location</th>
                        <th className="py-2 px-3">System Expected</th>
                        <th className="py-2 px-3">Physically Counted</th>
                        <th className="py-2 px-3">Difference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warmGrey/30 text-charcoal">
                      {session.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold">{item.productName}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-mutedGrey">{item.locationBin}</td>
                          <td className="py-2 px-3 font-bold">{item.expectedQty}</td>
                          <td className="py-2 px-3 font-bold text-navy">{item.countedQty ?? 'Pending'}</td>
                          <td className="py-2 px-3 font-bold">
                            {item.difference === 0 ? (
                              <span className="text-sage">Match (0)</span>
                            ) : (
                              <span className="text-terracotta">{item.difference}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-warmGrey/40 text-xs">
                  <span className="text-mutedGrey">Assigned Auditor: <strong>{session.assignedStaffName}</strong></span>
                  {isWarehouseMgr && session.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => approveStockCountDiscrepancy(session.id, 'Discrepancies audited and accepted')}
                      className="px-3.5 py-1.5 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light"
                    >
                      Authorize & Commit Count
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: STAFF TASKS WORKSPACE (PART 15) */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-card border border-warmGrey/60 shadow-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Warehouse Staff Task Operations
              </h3>
              <p className="text-[11px] text-mutedGrey mt-0.5">
                Priority order picking, packing, serial scanning and transfer check-in tasks.
              </p>
            </div>
            {isWarehouseMgr && (
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light flex items-center space-x-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Assign New Task</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouseTasks.map(task => (
              <div key={task.id} className="bg-white rounded-2xl p-4 border border-warmGrey/60 shadow-card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-navy">{task.taskCode}</span>
                    <h4 className="text-sm font-bold text-charcoal mt-0.5">{task.title}</h4>
                    <p className="text-[11px] text-mutedGrey">{task.warehouseName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    task.priority === 'urgent' || task.priority === 'high' ? 'bg-terracotta/10 text-terracotta border border-terracotta/30' : 'bg-sand-200 text-charcoal'
                  }`}>
                    {task.priority} Priority
                  </span>
                </div>

                <div className="p-3 bg-sand-50 rounded-xl text-xs space-y-1">
                  <p className="text-charcoal font-medium">{task.instructions}</p>
                  <p className="text-[10px] text-mutedGrey pt-1">Due by: <strong>{task.dueDate}</strong></p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-mutedGrey">Staff: <strong>{task.assignedStaffName}</strong></span>
                  {task.status !== 'completed' ? (
                    <button
                      type="button"
                      onClick={() => updateWarehouseTaskStatus(task.id, 'completed')}
                      className="px-3.5 py-1.5 bg-sage text-white text-xs font-bold rounded-lg hover:bg-sage-dark flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete Task</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-sage flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: REPORTS & VALUATION (PART 21) */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-card border border-warmGrey/60 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Company Stock Valuation & Category Asset Distribution
                </h3>
                <p className="text-[11px] text-mutedGrey mt-0.5">Real-time inventory capital deployment across 9 equipment categories.</p>
              </div>
              <button
                type="button"
                onClick={() => showToast('Stock Valuation Report exported to CSV format.', 'success')}
                className="px-3.5 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {categories.map(cat => {
                const catProducts = inventory.filter(i => i.category === cat);
                const catUnits = catProducts.reduce((sum, p) => sum + p.availableQuantity, 0);
                const catVal = catProducts.reduce((sum, p) => sum + (p.availableQuantity * p.unitCost), 0);

                return (
                  <div key={cat} className="p-3.5 bg-sand-50/70 rounded-xl border border-warmGrey/50 space-y-1">
                    <span className="text-[11px] font-bold text-charcoal">{cat}</span>
                    <p className="text-lg font-bold text-navy">₹{(catVal / 100000).toFixed(2)} Lakhs</p>
                    <p className="text-[10px] text-mutedGrey">{catUnits} units across depots ({catProducts.length} SKUs)</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS SECTION
          ========================================================================= */}

      {/* 1. Adjust Stock Modal */}
      {isAdjustModalOpen && selectedProductForAdjust && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Inventory Stock — ${selectedProductForAdjust.name}`}
          subtitle={`Current Available Quantity: ${selectedProductForAdjust.availableQuantity} units in ${selectedProductForAdjust.preferredWarehouseName || 'Pune Hub'}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Stock Adjustment Quantity (+ or -)</label>
              <input
                type="number"
                value={adjustmentAmount}
                onChange={e => setAdjustmentAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-bold text-navy text-sm"
              />
              <p className="text-[11px] text-mutedGrey mt-1">
                New Available Balance: <strong>{Math.max(0, selectedProductForAdjust.availableQuantity + adjustmentAmount)} units</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Mandatory Adjustment Reason</label>
              <select
                value={adjustmentReason}
                onChange={e => setAdjustmentReason(e.target.value as StockAdjustment['adjustmentReason'])}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                <option value="audit_reconciliation">Audit Reconciliation (Physical Count Difference)</option>
                <option value="damaged_goods">Damaged Goods in Yard</option>
                <option value="counting_discrepancy">Counting Discrepancy Correction</option>
                <option value="write_off">Defective Write-off</option>
                <option value="supplier_shortage">Supplier Inbound Shortage</option>
                <option value="other">Other Administrative Reason</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Supporting Audit Notes</label>
              <textarea
                rows={2}
                value={adjustmentNotes}
                onChange={e => setAdjustmentNotes(e.target.value)}
                placeholder="Record exact bin location, physical count verified or damage inspection report..."
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjust}
                className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs"
              >
                Commit Stock Adjustment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Add Product SKU Modal */}
      <Modal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        title="Catalogue Hardware SKU in Inventory"
        subtitle="Register new solar equipment with full engineering & commercial specifications"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal mb-1">Product Description / Title *</label>
              <input
                type="text"
                required
                value={productForm.name}
                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="e.g. Deye 8kW Hybrid Three-Phase Inverter"
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Category (9 Categories) *</label>
              <select
                value={productForm.category}
                onChange={e => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Tracking Method *</label>
              <select
                value={productForm.trackingType}
                onChange={e => {
                  const val = e.target.value as 'quantity_tracked' | 'serialized';
                  setProductForm({
                    ...productForm,
                    trackingType: val,
                    hasSerialTracking: val === 'serialized'
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                <option value="quantity_tracked">Quantity-Tracked (Bulk Hardware / Cables)</option>
                <option value="serialized">Individually Serialized (Inverters, Batteries, Panels)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Brand</label>
              <input
                type="text"
                value={productForm.brand}
                onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Model Reference</label>
              <input
                type="text"
                value={productForm.model}
                onChange={e => setProductForm({ ...productForm, model: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Initial Opening Qty</label>
              <input
                type="number"
                value={productForm.availableQuantity}
                onChange={e => setProductForm({ ...productForm, availableQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Safety Threshold</label>
              <input
                type="number"
                value={productForm.minimumThreshold}
                onChange={e => setProductForm({ ...productForm, minimumThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Unit Purchase Cost (₹)</label>
              <input
                type="number"
                value={productForm.unitCost}
                onChange={e => setProductForm({ ...productForm, unitCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Preferred Facility</label>
              <select
                value={productForm.preferredWarehouseId}
                onChange={e => {
                  const wh = warehouses.find(w => w.id === e.target.value);
                  setProductForm({
                    ...productForm,
                    preferredWarehouseId: e.target.value,
                    preferredWarehouseName: wh ? wh.name : 'Pune Central Hub'
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Storage Location Bin</label>
              <input
                type="text"
                value={productForm.locationBin}
                onChange={e => setProductForm({ ...productForm, locationBin: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs"
            >
              Save Product SKU
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Inbound GRN Modal */}
      <Modal
        isOpen={isGrnModalOpen}
        onClose={() => setIsGrnModalOpen(false)}
        title="Register Inbound Goods Receipt Note (GRN)"
        subtitle="Physical receipt verification, accepted/damaged quantities and serial registration"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateGrn} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Supplier *</label>
              <select
                value={grnForm.supplierId}
                onChange={e => {
                  const sup = suppliers.find(s => s.id === e.target.value);
                  setGrnForm({
                    ...grnForm,
                    supplierId: e.target.value,
                    supplierName: sup ? sup.name : 'Supplier'
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Delivery Challan No *</label>
              <input
                type="text"
                required
                value={grnForm.deliveryChallanNo}
                onChange={e => setGrnForm({ ...grnForm, deliveryChallanNo: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Receiving Facility</label>
              <select
                value={grnForm.warehouseId}
                onChange={e => {
                  const wh = warehouses.find(w => w.id === e.target.value);
                  setGrnForm({
                    ...grnForm,
                    warehouseId: e.target.value,
                    warehouseName: wh ? wh.name : 'Pune Central Hub'
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Hardware Product</label>
              <select
                value={grnForm.productId}
                onChange={e => setGrnForm({ ...grnForm, productId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {inventory.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Ordered Qty</label>
              <input
                type="number"
                value={grnForm.orderedQty}
                onChange={e => setGrnForm({ ...grnForm, orderedQty: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Accepted Qty</label>
              <input
                type="number"
                value={grnForm.acceptedQty}
                onChange={e => setGrnForm({ ...grnForm, acceptedQty: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg text-sage font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Rejected / Damaged</label>
              <input
                type="number"
                value={grnForm.rejectedQty}
                onChange={e => setGrnForm({ ...grnForm, rejectedQty: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg text-terracotta font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Serial Numbers (Comma-separated for serialized goods)</label>
            <textarea
              rows={2}
              value={grnForm.serialNumberInputs}
              onChange={e => setGrnForm({ ...grnForm, serialNumberInputs: e.target.value })}
              placeholder="e.g. DEYE-2026-INV-11001, DEYE-2026-INV-11002"
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-mono"
            />
          </div>

          <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsGrnModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sage text-white text-xs font-bold rounded-lg hover:bg-sage-dark shadow-xs"
            >
              Confirm Goods Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Inter-Warehouse Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Initiate Inter-Warehouse Transfer"
        subtitle="Move equipment between facilities with in-transit tracking"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Source Depot</label>
              <select
                value={transferForm.sourceWarehouseId}
                onChange={e => {
                  const wh = warehouses.find(w => w.id === e.target.value);
                  setTransferForm({
                    ...transferForm,
                    sourceWarehouseId: e.target.value,
                    sourceWarehouseName: wh ? wh.name : 'Pune Hub'
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Destination Depot</label>
              <select
                value={transferForm.destinationWarehouseId}
                onChange={e => {
                  const wh = warehouses.find(w => w.id === e.target.value);
                  setTransferForm({
                    ...transferForm,
                    destinationWarehouseId: e.target.value,
                    destinationWarehouseName: wh ? wh.name : 'Depot'
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Product</label>
              <select
                value={transferForm.productId}
                onChange={e => setTransferForm({ ...transferForm, productId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {inventory.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Avail: {p.availableQuantity})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Transfer Quantity</label>
              <input
                type="number"
                min={1}
                value={transferForm.requestedQty}
                onChange={e => setTransferForm({ ...transferForm, requestedQty: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-bold text-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Transfer Justification Notes</label>
            <input
              type="text"
              value={transferForm.notes}
              onChange={e => setTransferForm({ ...transferForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs"
            >
              Release Transfer on Road
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Stock Count Session Modal */}
      <Modal
        isOpen={isCountModalOpen}
        onClose={() => setIsCountModalOpen(false)}
        title="Schedule Physical Stock Count Session"
        subtitle="Initiate audit session across specific zones or categories"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCountSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Session Title</label>
            <input
              type="text"
              required
              value={countForm.title}
              onChange={e => setCountForm({ ...countForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Target Facility</label>
            <select
              value={countForm.warehouseId}
              onChange={e => {
                const wh = warehouses.find(w => w.id === e.target.value);
                setCountForm({
                  ...countForm,
                  warehouseId: e.target.value,
                  warehouseName: wh ? wh.name : 'Pune Hub'
                });
              }}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Count Mode</label>
            <select
              value={countForm.countType}
              onChange={e => setCountForm({ ...countForm, countType: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
            >
              <option value="cycle_count">Cycle Count (Designated Bays)</option>
              <option value="category_spot_check">Category Spot Check (High Value Inverters)</option>
              <option value="full_warehouse">Full Warehouse Comprehensive Audit</option>
            </select>
          </div>

          <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCountModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs"
            >
              Start Count Session
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Serial Detail Modal (Traceability View) */}
      {isSerialDetailModalOpen && selectedSerialDetail && (
        <Modal
          isOpen={isSerialDetailModalOpen}
          onClose={() => setIsSerialDetailModalOpen(false)}
          title={`Serial Traceability: ${selectedSerialDetail.serialNumber}`}
          subtitle={`${selectedSerialDetail.productName} • ${selectedSerialDetail.category}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-sand-50 rounded-xl">
              <div>
                <span className="text-[10px] font-bold uppercase text-mutedGrey">Current Lifecycle Status</span>
                <p className="mt-1"><StatusBadge status={selectedSerialDetail.currentStatus} /></p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-mutedGrey">Physical Location</span>
                <p className="font-semibold text-charcoal mt-1">
                  {selectedSerialDetail.warehouseName || 'Pune Hub'} • {selectedSerialDetail.locationBin || 'Bay A'}
                </p>
              </div>
            </div>

            <div className="space-y-2 border border-warmGrey/60 rounded-xl p-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal">Traceability Links</h4>
              <div className="grid grid-cols-2 gap-2 text-mutedGrey">
                <div>
                  <span className="block text-[10px]">Manufacturer / Supplier:</span>
                  <span className="font-semibold text-charcoal">{selectedSerialDetail.supplier}</span>
                </div>
                <div>
                  <span className="block text-[10px]">Purchase / Inbound Date:</span>
                  <span className="font-semibold text-charcoal">{selectedSerialDetail.purchaseDate}</span>
                </div>
                <div>
                  <span className="block text-[10px]">Allocated Customer:</span>
                  <span className="font-semibold text-charcoal">{selectedSerialDetail.assignedCustomer || 'None (In Vault)'}</span>
                </div>
                <div>
                  <span className="block text-[10px]">Project Order Number:</span>
                  <span className="font-semibold text-charcoal">{selectedSerialDetail.orderNumber || '—'}</span>
                </div>
                <div>
                  <span className="block text-[10px]">Confirmed Delivery Date:</span>
                  <span className="font-semibold text-charcoal">{selectedSerialDetail.deliveryDate || 'Pending Delivery'}</span>
                </div>
                <div>
                  <span className="block text-[10px]">Warranty Expiration:</span>
                  <span className="font-semibold text-sage">{selectedSerialDetail.warrantyEndDate || 'Not Yet Active'}</span>
                </div>
              </div>
            </div>

            {selectedSerialDetail.notes && (
              <div className="p-3 bg-sand-50 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-mutedGrey block">Technical / RMA Notes:</span>
                <p className="mt-0.5 text-charcoal">{selectedSerialDetail.notes}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSerialDetailModalOpen(false)}
                className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light"
              >
                Close Trace
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Barcode / QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectSerial={handleScannedSerial}
      />

    </div>
  );
};