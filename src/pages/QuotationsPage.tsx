import React, { useState } from 'react';
import { 
  FileText, Plus, CheckCircle2, XCircle, Printer, Download, 
  Send, Calculator, Sparkles, AlertCircle, Eye, ArrowRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Quotation, SolarPackage } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const QuotationsPage: React.FC = () => {
  const { 
    quotations, 
    packages, 
    customers, 
    surveys, 
    createQuotation, 
    updateQuotationStatus, 
    showToast 
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quotation | null>(null);

  // Quotation Builder Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedPackageId, setSelectedPackageId] = useState(packages[4]?.id || ''); // default 5kW On-grid
  const [customCapacityKw, setCustomCapacityKw] = useState(5.0);
  const [hardwareSubtotal, setHardwareSubtotal] = useState(255000);
  const [installationCharges, setInstallationCharges] = useState(25000);
  const [taxPercent, setTaxPercent] = useState(13.8); // Standard GST blended
  const [discount, setDiscount] = useState(10000);
  const [subsidyAmount, setSubsidyAmount] = useState(78000);
  const [paymentTerms, setPaymentTerms] = useState(
    '30% Advance on Booking, 60% on Dispatch Allocation, 10% on Net-Meter Commissioning'
  );

  // Auto recalculate when package or capacity changes
  const handlePackageChange = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg) {
      setCustomCapacityKw(pkg.capacityKw);
      setHardwareSubtotal(pkg.basePrice);
    }
  };

  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setCustomCapacityKw(cust.interestedCapacityKw);
      // match package with capacity
      const matchedPkg = packages.find(p => p.capacityKw === cust.interestedCapacityKw && p.type === cust.preferredSystemType);
      if (matchedPkg) {
        setSelectedPackageId(matchedPkg.id);
        setHardwareSubtotal(matchedPkg.basePrice);
      }
    }
  };

  // Calculations
  const taxableTotal = Math.max(0, hardwareSubtotal + installationCharges - discount);
  const calculatedTax = (taxableTotal * taxPercent) / 100;
  const grandTotal = taxableTotal + calculatedTax;

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === selectedCustomerId);
    const pkg = packages.find(p => p.id === selectedPackageId);
    if (!customer || !pkg) return;

    // Survey check
    const survey = surveys.find(s => s.customerId === customer.id && s.status === 'approved');

    createQuotation({
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      customerAddress: `${customer.address}, ${customer.city}`,
      surveyId: survey?.id,
      packageId: pkg.id,
      packageName: pkg.name,
      packageType: pkg.type,
      capacityKw: customCapacityKw,
      hardwareSubtotal,
      installationCharges,
      applicableTaxes: calculatedTax,
      taxPercent,
      discount,
      subsidyAmount,
      totalAmount: grandTotal,
      paymentTerms,
      status: 'sent',
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      preparedBy: 'Pooja Kulkarni (Senior Consultant)'
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Solar Packages & Quotations</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            BOM component calculation, customized pricing, GST schedules & formal PDF proposals
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Package Catalogue Ribbon */}
      <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
        <h2 className="text-xs font-bold uppercase tracking-wider text-mutedGrey mb-3">
          SunPower Standard Package Catalogue (On-Grid & Off-Grid 1kW - 5kW)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {packages.slice(0, 4).map(pkg => (
            <div key={pkg.id} className="p-3.5 rounded-xl border border-warmGrey/80 bg-sand-50/50 hover:bg-sand-100 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-navy">{pkg.capacityKw} kW System</span>
                  <span className="text-[10px] uppercase font-bold text-mutedGrey bg-white px-1.5 py-0.5 rounded border border-warmGrey">
                    {pkg.type.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-charcoal mt-1">{pkg.name}</h4>
                <p className="text-[11px] text-mutedGrey mt-1 line-clamp-2">{pkg.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-warmGrey/60 flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal">₹{pkg.basePrice.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-mutedGrey">Base BOM</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quotations List */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Quotation #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Capacity & Package</th>
                <th className="py-3 px-4">Total Contract Value</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {quotations.map(quote => (
                <tr key={quote.id} className="hover:bg-sand-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">
                    {quote.quotationNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-charcoal">{quote.customerName}</div>
                    <div className="text-[11px] text-mutedGrey">{quote.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-charcoal">{quote.capacityKw} kW</div>
                    <div className="text-[11px] text-mutedGrey">{quote.packageName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-navy text-sm">
                      ₹{quote.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-mutedGrey block">incl. 13.8% GST</span>
                  </td>
                  <td className="py-3.5 px-4 text-mutedGrey font-medium">
                    {quote.validUntil}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={quote.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setSelectedQuoteForPrint(quote)}
                      className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 text-charcoal font-semibold rounded-lg text-xs inline-flex items-center space-x-1 border border-warmGrey"
                    >
                      <Eye className="w-3.5 h-3.5 text-navy" />
                      <span>View PDF</span>
                    </button>

                    {quote.status !== 'approved' && (
                      <button
                        onClick={() => updateQuotationStatus(quote.id, 'approved')}
                        className="px-2.5 py-1 bg-navy text-white font-semibold rounded-lg text-xs hover:bg-navy-light transition-colors"
                      >
                        Approve & Order
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quotation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Commercial Solar Quotation"
        subtitle="Automatic component bill-of-materials, tax schedules & payment terms"
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveQuotation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Select Customer Account *</label>
              <select
                value={selectedCustomerId}
                onChange={e => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.city}) — {c.interestedCapacityKw} kW target
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Select Solar Package Template *</label>
              <select
                value={selectedPackageId}
                onChange={e => handlePackageChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {packages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.capacityKw} kW) — Base ₹{p.basePrice.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">System Capacity (kW)</label>
              <input
                type="number"
                step="0.5"
                value={customCapacityKw}
                onChange={e => setCustomCapacityKw(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Hardware Subtotal (₹) *</label>
              <input
                type="number"
                required
                value={hardwareSubtotal}
                onChange={e => setHardwareSubtotal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-bold text-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Installation & Labour (₹)</label>
              <input
                type="number"
                value={installationCharges}
                onChange={e => setInstallationCharges(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Commercial Discount (₹)</label>
              <input
                type="number"
                value={discount}
                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Applicable GST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxPercent}
                onChange={e => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Est. PM Surya Ghar Subsidy (₹)</label>
              <input
                type="number"
                value={subsidyAmount}
                onChange={e => setSubsidyAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg text-sage font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Milestone Payment Terms</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={e => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
            />
          </div>

          {/* Real-time Calculation Summary Box */}
          <div className="p-4 bg-sand-100 rounded-xl border border-warmGrey space-y-1.5 text-xs">
            <div className="flex justify-between text-mutedGrey">
              <span>Hardware & Materials:</span>
              <span>₹{hardwareSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-mutedGrey">
              <span>Installation & Electrical Labour:</span>
              <span>₹{installationCharges.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-terracotta">
                <span>Special Sales Discount:</span>
                <span>- ₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-mutedGrey">
              <span>GST ({taxPercent}%):</span>
              <span>₹{calculatedTax.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-warmGrey/80 flex justify-between font-bold text-sm text-charcoal">
              <span>Total Contract Price Payable:</span>
              <span className="text-navy text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-warmGrey/60 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
            >
              Issue Quotation
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Professional PDF Quotation View Modal */}
      {selectedQuoteForPrint && (
        <Modal
          isOpen={!!selectedQuoteForPrint}
          onClose={() => setSelectedQuoteForPrint(null)}
          title={`Formal Quotation — ${selectedQuoteForPrint.quotationNumber}`}
          subtitle="SunPower Solutions Commercial Document"
          maxWidth="4xl"
        >
          <div className="space-y-6 bg-white p-6 rounded-xl border border-warmGrey print:p-0 print:border-none">
            
            {/* Document Header */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-charcoal">
              <div>
                <h2 className="text-xl font-bold text-navy tracking-tight">SUNPOWER SOLUTIONS PVT LTD</h2>
                <p className="text-xs text-mutedGrey mt-1">Regd Office: Baner Road, Pune, Maharashtra 411045</p>
                <p className="text-xs text-mutedGrey">GSTIN: 27AABCS1429P1ZK • Email: contact@sunpowersolutions.in</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-mutedGrey">Quotation Ref:</span>
                <p className="text-base font-mono font-bold text-navy">{selectedQuoteForPrint.quotationNumber}</p>
                <p className="text-xs text-mutedGrey mt-0.5">Date: {selectedQuoteForPrint.createdDate}</p>
                <p className="text-xs text-mutedGrey">Valid Until: {selectedQuoteForPrint.validUntil}</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-sand-50 rounded-lg border border-warmGrey/60">
                <span className="font-bold text-charcoal block mb-1">PROPOSAL PREPARED FOR:</span>
                <p className="font-semibold text-navy text-sm">{selectedQuoteForPrint.customerName}</p>
                <p className="text-mutedGrey">{selectedQuoteForPrint.customerAddress}</p>
                <p className="text-mutedGrey">Phone: {selectedQuoteForPrint.customerPhone}</p>
              </div>
              <div className="p-3 bg-sand-50 rounded-lg border border-warmGrey/60">
                <span className="font-bold text-charcoal block mb-1">SYSTEM SPECIFICATIONS:</span>
                <p className="font-semibold text-charcoal">{selectedQuoteForPrint.packageName}</p>
                <p className="text-mutedGrey">Capacity: {selectedQuoteForPrint.capacityKw} kW peak generation</p>
                <p className="text-mutedGrey">Estimated Daily Yield: ~{selectedQuoteForPrint.capacityKw * 4.5} kWh units</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-warmGrey rounded-lg overflow-hidden">
                <thead className="bg-sand-100 text-charcoal font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmGrey/60 text-charcoal">
                  <tr>
                    <td className="py-2.5 px-3">
                      <strong>Solar Hardware & BOS Package</strong>
                      <div className="text-[11px] text-mutedGrey">
                        Tier-1 Solar Panels, Grid Inverter, GI Structure, DC Cables & Safety Switchgear
                      </div>
                    </td>
                    <td className="py-2.5 px-3">Hardware</td>
                    <td className="py-2.5 px-3 text-right font-medium">₹{selectedQuoteForPrint.hardwareSubtotal.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">
                      <strong>Installation, Earthing & Grid Synchronization</strong>
                      <div className="text-[11px] text-mutedGrey">
                        RCC Anchor Fastening, Copper Earthing Pit, HT/LT Discom Net Metering Sync
                      </div>
                    </td>
                    <td className="py-2.5 px-3">Labour / Services</td>
                    <td className="py-2.5 px-3 text-right font-medium">₹{selectedQuoteForPrint.installationCharges.toLocaleString('en-IN')}</td>
                  </tr>
                  {selectedQuoteForPrint.discount > 0 && (
                    <tr className="text-terracotta">
                      <td className="py-2 px-3 font-semibold">Special Commercial Discount</td>
                      <td className="py-2 px-3">Promotion</td>
                      <td className="py-2 px-3 text-right font-medium">- ₹{selectedQuoteForPrint.discount.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 px-3 font-semibold">Goods & Services Tax ({selectedQuoteForPrint.taxPercent}%)</td>
                    <td className="py-2 px-3">GST</td>
                    <td className="py-2 px-3 text-right font-medium">₹{selectedQuoteForPrint.applicableTaxes.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-sand-100 font-bold text-sm">
                    <td className="py-3 px-3">Total Payable Price</td>
                    <td className="py-3 px-3">INR</td>
                    <td className="py-3 px-3 text-right text-navy text-base">₹{selectedQuoteForPrint.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms and Signatures */}
            <div className="text-xs space-y-2 pt-2">
              <p><strong>Payment Terms:</strong> {selectedQuoteForPrint.paymentTerms}</p>
              <p><strong>Warranty Commitments:</strong> Solar Panels: 20 Years Performance | Inverter: 2 Years | Workmanship: 1 Year</p>
            </div>

            {/* Actions for Printing / Closing */}
            <div className="pt-4 border-t border-warmGrey flex items-center justify-between no-print">
              <span className="text-xs text-mutedGrey">Prepared by: {selectedQuoteForPrint.preparedBy}</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-lg hover:bg-sand-100 flex items-center space-x-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-navy" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuoteForPrint(null)}
                  className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
