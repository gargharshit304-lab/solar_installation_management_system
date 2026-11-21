import React, { useState } from 'react';
import { 
  Package, Search, Filter, Plus, QrCode, AlertTriangle, 
  ArrowUpDown, ShieldCheck, Box, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InventoryItem, ProductCategory, SerialNumberRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { QrScannerModal } from '../components/common/QrScannerModal';

export const InventoryPage: React.FC = () => {
  const { 
    inventory, 
    serialNumbers, 
    addInventoryItem, 
    adjustStockQuantity, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stock' | 'serials'>('stock');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<InventoryItem | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(5);
  const [adjustmentNotes, setAdjustmentNotes] = useState('New shipment arrived from supplier');

  // Form for New Product
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Solar Panels' as ProductCategory,
    availableQuantity: 20,
    reservedQuantity: 0,
    minimumThreshold: 10,
    unitCost: 10000,
    sellingPrice: 13500,
    supplier: 'Waaree Energies Ltd',
    hasSerialTracking: false,
    stockStatus: 'in_stock' as const,
    locationBin: 'BAY-A1'
  });

  const categories: ProductCategory[] = [
    'Solar Panels', 'Inverters', 'Batteries', 'Charge Controllers',
    'Connectors', 'Wires', 'Wiring Boxes', 'Metal Stands', 'Safety Equipment'
  ];

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredSerials = serialNumbers.filter(s => {
    return s.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (s.assignedCustomer && s.assignedCustomer.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    addInventoryItem(productForm);
    setIsAddModalOpen(false);
  };

  const handleConfirmAdjust = () => {
    if (!selectedProductForAdjust) return;
    adjustStockQuantity(selectedProductForAdjust.id, adjustmentAmount, adjustmentNotes);
    setIsAdjustModalOpen(false);
  };

  const handleScannedSerial = (serial: string) => {
    setSearchTerm(serial);
    setActiveTab('serials');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Warehouse & Inventory Management</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            BOM stock levels, product SKUs, supplier tracking & individual serial number traceability
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-3 py-2 bg-sand-100 hover:bg-sand-200 text-charcoal border border-warmGrey text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <QrCode className="w-4 h-4 text-navy" />
            <span>Scan QR / Barcode</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher & Search Bar */}
      <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'stock' ? 'bg-navy text-white' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey'
            }`}
          >
            Stock Levels ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('serials')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'serials' ? 'bg-navy text-white' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey'
            }`}
          >
            Serial Number Registry ({serialNumbers.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'stock' && (
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="all">All 9 Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={activeTab === 'stock' ? 'Search SKU or name...' : 'Search serial number...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>
      </div>

      {/* Tab: Stock Levels View */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                <tr>
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Qty</th>
                  <th className="py-3 px-4">Reserved</th>
                  <th className="py-3 px-4">Unit Cost / Price</th>
                  <th className="py-3 px-4">Primary Supplier</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-sand-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-charcoal">{item.name}</div>
                      <div className="text-[11px] font-mono text-mutedGrey">{item.sku} • {item.locationBin}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-sand-100 text-[11px] font-medium text-charcoal border border-warmGrey/60">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold text-sm ${item.availableQuantity <= item.minimumThreshold ? 'text-terracotta' : 'text-charcoal'}`}>
                        {item.availableQuantity}
                      </span>
                      <span className="text-[10px] text-mutedGrey block">Min: {item.minimumThreshold}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-navy">
                      {item.reservedQuantity}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-charcoal font-medium">₹{item.sellingPrice.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-mutedGrey">Cost: ₹{item.unitCost.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="py-3 px-4 text-mutedGrey font-medium">
                      {item.supplier}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.stockStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProductForAdjust(item);
                          setIsAdjustModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 text-charcoal font-semibold rounded-lg text-xs inline-flex items-center space-x-1 border border-warmGrey"
                      >
                        <RefreshCw className="w-3 h-3 text-navy" />
                        <span>Adjust Stock</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Serial Number Management View */}
      {activeTab === 'serials' && (
        <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                <tr>
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">Equipment Model</th>
                  <th className="py-3 px-4">Purchase Date & Supplier</th>
                  <th className="py-3 px-4">Allocated Customer</th>
                  <th className="py-3 px-4">Delivery Date</th>
                  <th className="py-3 px-4">Warranty Validity</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                {filteredSerials.map(sn => (
                  <tr key={sn.id} className="hover:bg-sand-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      {sn.serialNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal">{sn.productName}</div>
                      <div className="text-[11px] text-mutedGrey">{sn.category}</div>
                    </td>
                    <td className="py-3.5 px-4 text-mutedGrey">
                      <div>{sn.purchaseDate}</div>
                      <div className="text-[11px] text-charcoal">{sn.supplier}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {sn.assignedCustomer ? (
                        <span className="font-semibold text-charcoal">{sn.assignedCustomer}</span>
                      ) : (
                        <span className="text-mutedGrey italic">In Central Vault</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-mutedGrey">
                      {sn.deliveryDate || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {sn.warrantyEndDate ? (
                        <span className="text-sage font-semibold">Active to {sn.warrantyEndDate}</span>
                      ) : (
                        <span className="text-mutedGrey">Pending Dispatch</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={sn.currentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && selectedProductForAdjust && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Stock — ${selectedProductForAdjust.name}`}
          subtitle={`Current Available Quantity: ${selectedProductForAdjust.availableQuantity} units`}
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
              <label className="block text-xs font-semibold text-charcoal mb-1">Reason / Movement Notes</label>
              <textarea
                rows={2}
                value={adjustmentNotes}
                onChange={e => setAdjustmentNotes(e.target.value)}
                placeholder="e.g. Shipment received, damaged unit written off, audit adjustment"
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
                className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
              >
                Apply Stock Update
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Hardware SKU to Inventory"
        subtitle="Catalogue new solar hardware product"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Product Description *</label>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={e => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="e.g. Solis 5kW Dual-MPPT Inverter"
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Category</label>
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
              <label className="block text-xs font-semibold text-charcoal mb-1">Warehouse Bin Location</label>
              <input
                type="text"
                value={productForm.locationBin}
                onChange={e => setProductForm({ ...productForm, locationBin: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Initial Qty</label>
              <input
                type="number"
                value={productForm.availableQuantity}
                onChange={e => setProductForm({ ...productForm, availableQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Min Threshold</label>
              <input
                type="number"
                value={productForm.minimumThreshold}
                onChange={e => setProductForm({ ...productForm, minimumThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Unit Cost (₹)</label>
              <input
                type="number"
                value={productForm.unitCost}
                onChange={e => setProductForm({ ...productForm, unitCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Primary Supplier</label>
            <input
              type="text"
              value={productForm.supplier}
              onChange={e => setProductForm({ ...productForm, supplier: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
            >
              Save Product SKU
            </button>
          </div>
        </form>
      </Modal>

      {/* Barcode / QR Scanner */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectSerial={handleScannedSerial}
      />

    </div>
  );
};
