import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, AlertTriangle, Calculator, Sparkles, X, ShieldAlert 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
}

export const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerId,
}) => {
  const { 
    currentUser, 
    customers, 
    surveys, 
    packages, 
    createQuotation, 
    showToast 
  } = useApp();

  // Filter to sales rep's assigned customers
  const myCustomers = customers.filter(c => c.assignedSalesperson === currentUser.name || currentUser.role === 'owner_admin');

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    defaultCustomerId || myCustomers[0]?.id || customers[0]?.id || ''
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Check site survey status for customer
  const customerSurvey = surveys.find(s => s.customerId === selectedCustomerId);
  const isSurveyApproved = customerSurvey?.status === 'approved';

  // Package & calculation state
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || '');
  const [capacityKw, setCapacityKw] = useState(5.0);
  const [hardwareSubtotal, setHardwareSubtotal] = useState(255000);
  const [installationCharges, setInstallationCharges] = useState(25000);
  const [discount, setDiscount] = useState(10000);
  const [subsidyAmount, setSubsidyAmount] = useState(78000);
  const taxPercent = 13.8; // Standard blended solar GST rate

  // Recalculate package defaults
  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg) {
      setCapacityKw(pkg.capacityKw);
      setHardwareSubtotal(pkg.basePrice);
    }
  };

  const taxableTotal = Math.max(0, hardwareSubtotal + installationCharges - discount);
  const calculatedTax = (taxableTotal * taxPercent) / 100;
  const grandTotal = taxableTotal + calculatedTax;
  const netPayable = Math.max(0, grandTotal - subsidyAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      showToast('Please select a valid customer', 'error');
      return;
    }

    if (!isSurveyApproved) {
      showToast('Cannot issue quotation: Site Survey must be Approved before quotation generation!', 'error');
      return;
    }

    const pkg = packages.find(p => p.id === selectedPackageId) || packages[0];

    createQuotation({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.fullName,
      customerPhone: selectedCustomer.phone,
      customerAddress: `${selectedCustomer.address}, ${selectedCustomer.city}`,
      surveyId: customerSurvey?.id,
      packageId: pkg.id,
      packageName: pkg.name,
      packageType: pkg.type,
      capacityKw,
      hardwareSubtotal,
      installationCharges,
      applicableTaxes: calculatedTax,
      taxPercent,
      discount,
      subsidyAmount,
      totalAmount: grandTotal,
      status: 'sent',
      paymentTerms: '30% Advance on Booking, 60% on Dispatch Allocation, 10% on Net-Meter Commissioning',
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      preparedBy: currentUser.name,
    });

    showToast(`Quotation generated successfully for ${selectedCustomer.fullName}!`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Commercial / Residential Quotation"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Customer Selection & Survey Validation Alert */}
        <div className="bg-sand-50/70 p-4 rounded-xl border border-warmGrey/60 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey">
            Select Customer
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-2 focus:ring-navy"
          >
            {myCustomers.map(cust => (
              <option key={cust.id} value={cust.id}>
                {cust.fullName} ({cust.customerCode}) — {cust.city} ({cust.interestedCapacityKw} kW {cust.preferredSystemType})
              </option>
            ))}
          </select>

          {/* Business Rule Enforcement Display */}
          <div className="pt-2">
            {isSurveyApproved ? (
              <div className="p-3 bg-sage-50 border border-sage/40 rounded-xl flex items-center space-x-2 text-sage text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Site Survey {customerSurvey?.surveyNumber || 'SUR-VALID'} is APPROVED by Technical Team. Ready to generate quotation!</span>
              </div>
            ) : (
              <div className="p-3 bg-terracotta-50 border border-terracotta/40 rounded-xl flex items-start space-x-2.5 text-terracotta text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Business Rule Restriction:</span>
                  <p className="mt-0.5 text-charcoal">
                    {customerSurvey 
                      ? `Site Survey status is "${customerSurvey.status.toUpperCase()}". Final commercial quotations require an "Approved" survey from the engineering team.`
                      : `No site survey on file for this customer yet. Please request and complete a site survey before issuing a formal quotation.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Package & System Specification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
              Select Solar Package
            </label>
            <select
              value={selectedPackageId}
              onChange={(e) => handlePackageSelect(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-2 focus:ring-navy"
            >
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.capacityKw} kW {pkg.type.toUpperCase()}) — ₹{pkg.basePrice.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
              Custom Capacity (kW)
            </label>
            <input
              type="number"
              step="0.5"
              value={capacityKw}
              onChange={(e) => setCapacityKw(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-2 focus:ring-navy"
            />
          </div>
        </div>

        {/* Pricing & Commercial Structure */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-warmGrey/60">
          <div>
            <label className="block text-[11px] font-semibold text-mutedGrey">Hardware Base (₹)</label>
            <input
              type="number"
              value={hardwareSubtotal}
              onChange={(e) => setHardwareSubtotal(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-sand-50/50 border border-warmGrey rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-mutedGrey">Installation & BOS (₹)</label>
            <input
              type="number"
              value={installationCharges}
              onChange={(e) => setInstallationCharges(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-sand-50/50 border border-warmGrey rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-mutedGrey">Discount (₹)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-sand-50/50 border border-warmGrey rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-mutedGrey">PM Surya Ghar Subsidy (₹)</label>
            <input
              type="number"
              value={subsidyAmount}
              onChange={(e) => setSubsidyAmount(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-sand-50/50 border border-warmGrey rounded-lg"
            />
          </div>
        </div>

        {/* Financial Summary Box */}
        <div className="p-4 bg-charcoal text-white rounded-xl space-y-2">
          <div className="flex justify-between text-xs text-sand-200">
            <span>Taxable Subtotal:</span>
            <span>₹{taxableTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-sand-200">
            <span>GST Blended ({taxPercent}%):</span>
            <span>₹{Math.round(calculatedTax).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-charcoal/50 pt-2 text-white">
            <span>Total System Price (Gross):</span>
            <span>₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-sage pt-1 border-t border-charcoal/50">
            <span>Customer Net Outflow (After Subsidy):</span>
            <span>₹{Math.round(netPayable).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-warmGrey/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-sand-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!isSurveyApproved}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 ${
              isSurveyApproved 
                ? 'bg-navy text-white hover:bg-navy-light cursor-pointer' 
                : 'bg-warmGrey text-mutedGrey cursor-not-allowed opacity-60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Generate & Send Quotation</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
