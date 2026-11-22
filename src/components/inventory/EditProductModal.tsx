import React, { useState, useEffect } from 'react';
import { 
  X, Check, AlertTriangle, ShieldCheck, DollarSign, Package, 
  Layers, Warehouse, History, TrendingUp, Info, AlertCircle 
} from 'lucide-react';
import { InventoryItem, ProductCategory, Warehouse as WarehouseType, ProductPriceHistoryRecord } from '../../types';
import { inventoryApi } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: InventoryItem | null;
  onSave: (productId: string, updates: Partial<InventoryItem> & { priceChangeReason?: string }) => Promise<void>;
  allProducts: InventoryItem[];
  warehouses: WarehouseType[];
}

const CATEGORIES: ProductCategory[] = [
  'Solar Panels',
  'Inverters',
  'Batteries',
  'Controllers',
  'Charge Controllers',
  'Connectors',
  'Wires and Cables',
  'Wires',
  'Wiring Boxes',
  'Mounting Stands and Structures',
  'Metal Stands',
  'Safety Equipment'
];

const COMMON_PRICE_REASONS = [
  'Supplier Price Escalation / Raw Material Cost',
  'Annual Commercial Price Revision',
  'Competitive Market Rate Alignment',
  'Bulk Procurement Discount Applied',
  'Import Duty & Tariff Adjustment',
  'Regulatory GST Classification Update',
  'Inventory Clearance / Markdown'
];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  allProducts,
  warehouses
}) => {
  const { session, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'pricing' | 'inventory' | 'history'>('details');

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Solar Panels');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('pcs');
  const [unitCost, setUnitCost] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [standardCost, setStandardCost] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [minimumThreshold, setMinimumThreshold] = useState<number>(10);
  const [reorderThreshold, setReorderThreshold] = useState<number>(15);
  const [maxThreshold, setMaxThreshold] = useState<number>(500);
  const [locationBin, setLocationBin] = useState('');
  const [preferredWarehouseId, setPreferredWarehouseId] = useState('');
  const [hasSerialTracking, setHasSerialTracking] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [priceChangeReason, setPriceChangeReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  // Engineering specs
  const [voltage, setVoltage] = useState('');
  const [powerRating, setPowerRating] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weightKg, setWeightKg] = useState<number | undefined>(undefined);

  // Price history
  const [priceHistory, setPriceHistory] = useState<ProductPriceHistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Errors and submission state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial pricing to detect changes
  const initialCost = product?.unitCost || 0;
  const initialSelling = product?.sellingPrice || 0;
  const initialStandard = product?.standardCost || (initialCost * 0.95);

  const isPriceModified = 
    Math.abs(unitCost - initialCost) > 0.01 || 
    Math.abs(sellingPrice - initialSelling) > 0.01 ||
    Math.abs(standardCost - initialStandard) > 0.01;

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setCategory(product.category || 'Solar Panels');
      setBrand(product.brand || 'SolarOS Certified');
      setModel(product.model || '');
      setDescription(product.description || '');
      setUnitOfMeasure(product.unitOfMeasure || 'pcs');
      setUnitCost(product.unitCost || 0);
      setSellingPrice(product.sellingPrice || 0);
      setStandardCost(product.standardCost || (product.unitCost ? Math.round(product.unitCost * 0.95) : 0));
      setTaxRate(product.taxRate ?? 18);
      setMinimumThreshold(product.minimumThreshold || 10);
      setReorderThreshold(product.reorderThreshold || product.reorderLevel || 15);
      setMaxThreshold(product.maxThreshold || 500);
      setLocationBin(product.locationBin || 'MAIN-A1');
      setPreferredWarehouseId(product.preferredWarehouseId || (warehouses[0]?.id || 'wh-pune-central'));
      setHasSerialTracking(Boolean(product.hasSerialTracking));
      setStatus(product.status || 'active');
      setPriceChangeReason('');
      setCustomReason('');
      setErrors({});

      if (product.specifications) {
        setVoltage(product.specifications.voltage || '');
        setPowerRating(product.specifications.powerRating || '');
        setDimensions(product.specifications.dimensions || '');
        setWeightKg(product.specifications.weightKg);
      } else {
        setVoltage('');
        setPowerRating('');
        setDimensions('');
        setWeightKg(undefined);
      }

      // Fetch price history
      setLoadingHistory(true);
      inventoryApi.getPriceHistory(product.id, session?.token)
        .then(res => {
          if (Array.isArray(res)) setPriceHistory(res);
          else if (Array.isArray((res as any)?.data)) setPriceHistory((res as any).data);
          else setPriceHistory([]);
        })
        .catch(() => setPriceHistory([]))
        .finally(() => setLoadingHistory(false));
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Realtime margin calculations
  const grossMargin = sellingPrice > 0 ? ((sellingPrice - unitCost) / sellingPrice) * 100 : 0;
  const markup = unitCost > 0 ? ((sellingPrice - unitCost) / unitCost) * 100 : 0;
  const marginPerUnit = sellingPrice - unitCost;

  const handleValidate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!sku.trim()) errs.sku = 'SKU / Product Code is required';
    else {
      const duplicate = allProducts.find(
        p => p.id !== product.id && p.sku.trim().toLowerCase() === sku.trim().toLowerCase()
      );
      if (duplicate) {
        errs.sku = `SKU '${sku}' is already assigned to '${duplicate.name}'`;
      }
    }

    if (unitCost < 0) errs.unitCost = 'Purchase price cannot be negative';
    if (sellingPrice < 0) errs.sellingPrice = 'Selling price cannot be negative';
    if (sellingPrice < unitCost) {
      errs.sellingPrice = 'Warning: Selling price is less than purchase cost (negative margin)';
    }

    if (isPriceModified && !priceChangeReason && !customReason.trim()) {
      errs.priceChangeReason = 'Please provide a business justification for updating product prices';
    }

    setErrors(errs);
    return Object.keys(errs).filter(k => k !== 'sellingPrice' || sellingPrice < 0).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate()) {
      showToast('Please correct validation issues before saving.', 'error');
      return;
    }

    setIsSubmitting(true);
    const chosenWarehouse = warehouses.find(w => w.id === preferredWarehouseId);
    const finalReason = customReason.trim() || priceChangeReason || 'Product catalogue price update';

    try {
      await onSave(product.id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        brand: brand.trim() || 'SolarOS Certified',
        model: model.trim(),
        description: description.trim(),
        unitOfMeasure,
        unitCost: Number(unitCost),
        sellingPrice: Number(sellingPrice),
        standardCost: Number(standardCost),
        taxRate: Number(taxRate),
        minimumThreshold: Number(minimumThreshold),
        reorderThreshold: Number(reorderThreshold),
        maxThreshold: Number(maxThreshold),
        locationBin: locationBin.trim() || 'MAIN-A1',
        preferredWarehouseId,
        preferredWarehouseName: chosenWarehouse?.name || 'Central Warehouse',
        hasSerialTracking,
        status,
        priceChangeReason: isPriceModified ? finalReason : undefined,
        specifications: {
          voltage,
          powerRating,
          dimensions,
          weightKg: weightKg ? Number(weightKg) : undefined
        }
      });
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product changes', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-warmGrey relative animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-warmGrey/60 flex items-start justify-between bg-sand-50/50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-navy/10 border border-navy/20 flex items-center justify-center text-navy shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg text-charcoal">Edit Product Specifications</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-sand-200 text-charcoal font-semibold border border-warmGrey/60">
                  {product.sku}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  status === 'active' ? 'bg-forest-emerald/15 text-forest-emerald' : 'bg-sand-200 text-mutedGrey'
                }`}>
                  {status === 'active' ? 'Active Catalogue' : 'Archived'}
                </span>
              </div>
              <p className="text-xs text-mutedGrey mt-0.5">
                Update master product data, purchase pricing, selling rates, thresholds and warehouse routing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-mutedGrey hover:text-charcoal hover:bg-sand-100 rounded-lg transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-5 pt-3 border-b border-warmGrey/60 bg-sand-50/30 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-2 px-3.5 font-semibold rounded-t-lg transition-colors flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'details'
                ? 'border-navy text-navy bg-white shadow-2xs'
                : 'border-transparent text-mutedGrey hover:text-charcoal hover:bg-sand-100/60'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>General Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-2 px-3.5 font-semibold rounded-t-lg transition-colors flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'pricing'
                ? 'border-navy text-navy bg-white shadow-2xs'
                : 'border-transparent text-mutedGrey hover:text-charcoal hover:bg-sand-100/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Price & Tax Management</span>
            {isPriceModified && (
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-3.5 font-semibold rounded-t-lg transition-colors flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'inventory'
                ? 'border-navy text-navy bg-white shadow-2xs'
                : 'border-transparent text-mutedGrey hover:text-charcoal hover:bg-sand-100/60'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Stock & Bin Thresholds</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3.5 font-semibold rounded-t-lg transition-colors flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'history'
                ? 'border-navy text-navy bg-white shadow-2xs'
                : 'border-transparent text-mutedGrey hover:text-charcoal hover:bg-sand-100/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Price History ({priceHistory.length})</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: GENERAL DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Product Title / Commercial Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Waaree 540W Mono PERC Solar Panel"
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:border-navy focus:outline-hidden"
                  />
                  {errors.name && <p className="text-[11px] text-terracotta mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    SKU / Product Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value.toUpperCase())}
                    placeholder="e.g. PAN-MONO-540W"
                    className={`w-full px-3 py-2 text-xs font-mono border rounded-lg focus:outline-hidden ${
                      errors.sku ? 'border-terracotta bg-rose-50/50' : 'border-warmGrey focus:border-navy'
                    }`}
                  />
                  {errors.sku && <p className="text-[11px] text-terracotta mt-1">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Equipment Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white focus:border-navy focus:outline-hidden"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Brand / Manufacturer</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder="e.g. Waaree Energies, Deye, Growatt"
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:border-navy focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Model / Series Code</label>
                  <input
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder="e.g. SUN-5K-SG04LP3"
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:border-navy focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Unit of Measurement</label>
                  <select
                    value={unitOfMeasure}
                    onChange={e => setUnitOfMeasure(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white focus:border-navy focus:outline-hidden"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="units">Units</option>
                    <option value="meters">Meters (m)</option>
                    <option value="sets">Sets</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Catalogue Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white focus:border-navy focus:outline-hidden"
                  >
                    <option value="active">Active (Available for Orders & Quotations)</option>
                    <option value="inactive">Inactive / Archived (Hidden from New Orders)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-charcoal mb-1">Product Description / Notes</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Technical overview, compatibility notes and certification standards"
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:border-navy focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Engineering Specs Sub-section */}
              <div className="p-3.5 bg-sand-50/70 border border-warmGrey/60 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-charcoal">
                  <Layers className="w-3.5 h-3.5 text-navy" />
                  <span>Engineering & Technical Specifications</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-mutedGrey mb-1">Voltage Rating</label>
                    <input
                      type="text"
                      value={voltage}
                      onChange={e => setVoltage(e.target.value)}
                      placeholder="e.g. 48V / 41.8V"
                      className="w-full px-2.5 py-1.5 text-xs border border-warmGrey rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-mutedGrey mb-1">Power Rating</label>
                    <input
                      type="text"
                      value={powerRating}
                      onChange={e => setPowerRating(e.target.value)}
                      placeholder="e.g. 540W / 5kW"
                      className="w-full px-2.5 py-1.5 text-xs border border-warmGrey rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-mutedGrey mb-1">Physical Dimensions</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={e => setDimensions(e.target.value)}
                      placeholder="e.g. 2278 x 1134 mm"
                      className="w-full px-2.5 py-1.5 text-xs border border-warmGrey rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-mutedGrey mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg ?? ''}
                      onChange={e => setWeightKg(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="e.g. 28.5"
                      className="w-full px-2.5 py-1.5 text-xs border border-warmGrey rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICE & TAX MANAGEMENT */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              
              {/* Snapshot Preservation Notice Banner */}
              <div className="p-3 bg-amber-50/80 border border-amber/30 rounded-xl flex items-start space-x-2.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                <div className="text-charcoal leading-relaxed">
                  <span className="font-bold text-amber block">Historical Snapshot Preservation Active</span>
                  Modifying master prices updates future quotations and new orders. Historical orders, invoices, and confirmed dispatches retain their agreed contracted price snapshots and are never modified.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 1. Purchase Price */}
                <div className="p-3.5 bg-sand-50/60 rounded-xl border border-warmGrey/60">
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Purchase Price / Supplier Cost (₹) *
                  </label>
                  <p className="text-[10px] text-mutedGrey mb-2">Cost paid to supplier per {unitOfMeasure}</p>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-mutedGrey">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={unitCost}
                      onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 text-xs font-bold font-mono border border-warmGrey rounded-lg bg-white"
                    />
                  </div>
                  {initialCost > 0 && initialCost !== unitCost && (
                    <div className="mt-1.5 text-[11px] text-mutedGrey flex items-center justify-between font-mono">
                      <span>Baseline: ₹{initialCost.toLocaleString('en-IN')}</span>
                      <span className={unitCost > initialCost ? 'text-terracotta' : 'text-forest-emerald font-bold'}>
                        {unitCost > initialCost ? `+₹${unitCost - initialCost}` : `-₹${initialCost - unitCost}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Selling Price */}
                <div className="p-3.5 bg-sand-50/60 rounded-xl border border-warmGrey/60">
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Selling Price / Customer Rate (₹) *
                  </label>
                  <p className="text-[10px] text-mutedGrey mb-2">Default base price on customer quotes</p>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-mutedGrey">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={sellingPrice}
                      onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 text-xs font-bold font-mono text-navy border border-warmGrey rounded-lg bg-white"
                    />
                  </div>
                  {initialSelling > 0 && initialSelling !== sellingPrice && (
                    <div className="mt-1.5 text-[11px] text-mutedGrey flex items-center justify-between font-mono">
                      <span>Baseline: ₹{initialSelling.toLocaleString('en-IN')}</span>
                      <span className={sellingPrice > initialSelling ? 'text-forest-emerald font-bold' : 'text-terracotta'}>
                        {sellingPrice > initialSelling ? `+₹${sellingPrice - initialSelling}` : `-₹${initialSelling - sellingPrice}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Standard Cost */}
                <div className="p-3.5 bg-sand-50/60 rounded-xl border border-warmGrey/60">
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Standard Cost (₹)
                  </label>
                  <p className="text-[10px] text-mutedGrey mb-2">Accounting basis for COGS valuation</p>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-mutedGrey">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={standardCost}
                      onChange={e => setStandardCost(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 text-xs font-bold font-mono border border-warmGrey rounded-lg bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-mutedGrey block mt-1.5">
                    Variance vs Purchase: ₹{(unitCost - standardCost).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Real-time Profitability & Margin Summary Strip */}
              <div className="p-4 bg-sand-50 rounded-xl border border-warmGrey/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-mutedGrey block font-semibold uppercase tracking-wider">Gross Profit / Unit</span>
                  <span className={`text-base font-bold font-mono ${marginPerUnit >= 0 ? 'text-forest-emerald' : 'text-terracotta'}`}>
                    ₹{marginPerUnit.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-mutedGrey block font-semibold uppercase tracking-wider">Gross Margin %</span>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-base font-bold font-mono ${grossMargin >= 20 ? 'text-forest-emerald' : grossMargin > 0 ? 'text-amber' : 'text-terracotta'}`}>
                      {grossMargin.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-mutedGrey">
                      {grossMargin >= 20 ? '(Healthy)' : grossMargin > 0 ? '(Low)' : '(Loss)'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-mutedGrey block font-semibold uppercase tracking-wider">Markup %</span>
                  <span className="text-base font-bold font-mono text-navy">
                    {markup.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <label className="text-[10px] text-mutedGrey block font-semibold uppercase tracking-wider mb-1">
                    GST / Tax Rate (%)
                  </label>
                  <select
                    value={taxRate}
                    onChange={e => setTaxRate(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-warmGrey rounded bg-white font-mono font-bold"
                  >
                    <option value={18}>18% GST (Standard Solar/Electrical)</option>
                    <option value={12}>12% GST (Solar Devices/Inverters)</option>
                    <option value={5}>5% GST (Concessional Renewable)</option>
                    <option value={0}>0% (Tax Exempt)</option>
                  </select>
                </div>
              </div>

              {/* Price Change Reason Field — Triggered on any price modification */}
              {isPriceModified && (
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-charcoal">
                      <History className="w-4 h-4 text-amber" />
                      <span>Price Revision Justification (Required for Audit Trail) *</span>
                    </div>
                    <span className="text-[10px] text-amber font-semibold uppercase tracking-wider bg-amber-100/60 px-2 py-0.5 rounded">
                      Price Changed
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-mutedGrey mb-1">Select Common Reason</label>
                    <select
                      value={priceChangeReason}
                      onChange={e => {
                        setPriceChangeReason(e.target.value);
                        if (e.target.value) setCustomReason('');
                      }}
                      className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                    >
                      <option value="">-- Choose Justification --</option>
                      {COMMON_PRICE_REASONS.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-mutedGrey mb-1">Or Specific Explanation</label>
                    <input
                      type="text"
                      value={customReason}
                      onChange={e => {
                        setCustomReason(e.target.value);
                        if (e.target.value) setPriceChangeReason('');
                      }}
                      placeholder="e.g. Supplier Q4 price revision notice ref: PO-99124"
                      className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                    />
                  </div>
                  {errors.priceChangeReason && (
                    <p className="text-[11px] text-terracotta">{errors.priceChangeReason}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STOCK & INVENTORY LOGISTICS */}
          {activeTab === 'inventory' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Minimum Stock Alert Threshold *
                  </label>
                  <p className="text-[10px] text-mutedGrey mb-1.5">Triggers 'Low Stock' alert when inventory falls to this count</p>
                  <input
                    type="number"
                    min="0"
                    required
                    value={minimumThreshold}
                    onChange={e => setMinimumThreshold(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Reorder Suggestion Level
                  </label>
                  <p className="text-[10px] text-mutedGrey mb-1.5">Recommended replenishment point for procurement</p>
                  <input
                    type="number"
                    min="0"
                    value={reorderThreshold}
                    onChange={e => setReorderThreshold(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Maximum Warehouse Capacity
                  </label>
                  <p className="text-[10px] text-mutedGrey mb-1.5">Safety upper bound for facility storage</p>
                  <input
                    type="number"
                    min="0"
                    value={maxThreshold}
                    onChange={e => setMaxThreshold(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Default Bin Location *
                  </label>
                  <p className="text-[10px] text-mutedGrey mb-1.5">Warehouse rack/shelf bin code</p>
                  <input
                    type="text"
                    required
                    value={locationBin}
                    onChange={e => setLocationBin(e.target.value.toUpperCase())}
                    placeholder="e.g. PUN-ZA-R02-B01"
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-mono font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Primary Warehouse Depot
                  </label>
                  <select
                    value={preferredWarehouseId}
                    onChange={e => setPreferredWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                  >
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.code}) — {wh.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 p-3.5 bg-sand-50 rounded-xl border border-warmGrey/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-charcoal block">Serialized Equipment Tracking</span>
                    <span className="text-[11px] text-mutedGrey">
                      Require unique manufacturer barcode / serial number for every individual physical unit
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSerialTracking}
                      onChange={e => setHasSerialTracking(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-sand-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-warmGrey after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHRONOLOGICAL PRICE HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="flex items-center justify-between text-xs text-mutedGrey pb-2 border-b border-warmGrey/60">
                <span>Audited historical price revisions stored in Supabase PostgreSQL</span>
                <span className="font-mono text-[11px]">{priceHistory.length} recorded revisions</span>
              </div>

              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-mutedGrey">
                  Loading price history audit trail...
                </div>
              ) : priceHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-mutedGrey bg-sand-50/50 rounded-xl border border-warmGrey/40">
                  <History className="w-6 h-6 mx-auto mb-2 text-mutedGrey/60" />
                  <span>No price modifications recorded yet for this product.</span>
                  <span className="block text-[10px] mt-0.5">Any future price update will be permanently logged here with timestamps and authorizer details.</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-warmGrey/60 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sand-50 text-mutedGrey uppercase font-semibold text-[10px] tracking-wider border-b border-warmGrey/60">
                      <tr>
                        <th className="py-2.5 px-3">Effective Date</th>
                        <th className="py-2.5 px-3">Purchase Cost (₹)</th>
                        <th className="py-2.5 px-3">Selling Price (₹)</th>
                        <th className="py-2.5 px-3">Changed By</th>
                        <th className="py-2.5 px-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warmGrey/40">
                      {priceHistory.map(entry => (
                        <tr key={entry.id} className="hover:bg-sand-50/60">
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-charcoal">
                            {new Date(entry.effectiveDate || entry.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className="text-mutedGrey line-through mr-1">
                              ₹{entry.previousUnitCost?.toLocaleString('en-IN')}
                            </span>
                            <span className="font-bold text-charcoal">
                              → ₹{entry.newUnitCost?.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className="text-mutedGrey line-through mr-1">
                              ₹{entry.previousSellingPrice?.toLocaleString('en-IN')}
                            </span>
                            <span className="font-bold text-navy">
                              → ₹{entry.newSellingPrice?.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-charcoal">
                            {entry.changedByName || 'Administrator'}
                          </td>
                          <td className="py-2.5 px-3 text-mutedGrey text-[11px] max-w-[200px] truncate" title={entry.reason}>
                            {entry.reason || 'Price update'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-warmGrey/60 flex items-center justify-between">
            <div className="text-xs text-mutedGrey">
              {isPriceModified && (
                <span className="text-amber font-semibold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Price adjustment will be logged in audit trail</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-sand-100 rounded-xl transition-colors border border-warmGrey"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving Updates...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Product Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
