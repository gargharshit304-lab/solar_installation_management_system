import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { SystemType } from '../../types';
import { AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';

interface CreateEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerName?: string;
}

export const CreateEnquiryModal: React.FC<CreateEnquiryModalProps> = ({
  isOpen,
  onClose,
  initialCustomerName = ''
}) => {
  const { customers, addCustomer, createEnquiry, showToast } = useApp();

  const [fullName, setFullName] = useState(initialCustomerName);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Pune');
  const [address, setAddress] = useState('');
  const [interestedCapacityKw, setInterestedCapacityKw] = useState(3.0);
  const [preferredSystemType, setPreferredSystemType] = useState<SystemType>('on_grid');
  const [monthlyBill, setMonthlyBill] = useState(5500);
  const [source, setSource] = useState<'website' | 'phone_call' | 'whatsapp' | 'manual' | 'referral'>('website');
  const [notes, setNotes] = useState('');

  // Duplicate Check
  const trimmedPhone = phone.trim();
  const existingCustomer = trimmedPhone 
    ? customers.find(c => c.phone.replace(/\s+/g, '') === trimmedPhone.replace(/\s+/g, ''))
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showToast('Please provide customer name and phone number', 'error');
      return;
    }

    let customerId = existingCustomer?.id;

    if (!existingCustomer) {
      // Create new customer record
      const created = addCustomer({
        fullName,
        phone,
        email,
        address: address || 'Pending Address',
        city,
        state: 'Maharashtra',
        monthlyElectricityBill: monthlyBill,
        interestedCapacityKw,
        preferredSystemType,
        roofSpaceSqft: 400,
        roofType: 'RCC Concrete',
        enquirySource: source,
        assignedSalesperson: 'Pooja Kulkarni',
        leadStatus: 'new',
        notes
      });
      customerId = created.id;
    }

    createEnquiry({
      customerId: customerId!,
      customerName: fullName,
      customerPhone: phone,
      customerCity: city,
      interestedCapacityKw,
      preferredSystemType,
      source,
      leadStatus: 'new',
      assignedSalesperson: 'Pooja Kulkarni',
      notes
    });

    onClose();
    // reset form
    setFullName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer Enquiry"
      subtitle="Register inbound inquiry from website, phone call, WhatsApp or referral"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Duplicate Warning / Detection Banner */}
        {existingCustomer && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber/30 text-xs text-charcoal flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber">Existing Customer Detected:</strong> Account found for <strong>{existingCustomer.fullName}</strong> ({existingCustomer.customerCode}). This enquiry will be automatically linked to their existing profile without duplicating account records.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Customer Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Sunil Patil"
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Mobile Phone Number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98200 00000"
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="sunil.patil@gmail.com"
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">City / Region</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Interested Solar Capacity</label>
            <select
              value={interestedCapacityKw}
              onChange={e => setInterestedCapacityKw(parseFloat(e.target.value) || 3.0)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white font-semibold text-navy"
            >
              <option value={1}>1 kW (Compact)</option>
              <option value={2}>2 kW (Residential)</option>
              <option value={3}>3 kW (Family Plus)</option>
              <option value={4}>4 kW (Premium)</option>
              <option value={5}>5 kW (High-Yield)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">System Architecture</label>
            <select
              value={preferredSystemType}
              onChange={e => setPreferredSystemType(e.target.value as SystemType)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
            >
              <option value="on_grid">On-Grid (Net Meter)</option>
              <option value="off_grid">Off-Grid (Battery)</option>
              <option value="hybrid">Hybrid System</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Enquiry Source</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
            >
              <option value="website">Website Form</option>
              <option value="whatsapp">WhatsApp Message</option>
              <option value="phone_call">Phone Call</option>
              <option value="referral">Customer Referral</option>
              <option value="manual">Manual Consultation</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Initial Requirement Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Details on roof type, daytime appliance load, government subsidy interest..."
            className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="pt-3 border-t border-warmGrey flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs"
          >
            Save Enquiry
          </button>
        </div>
      </form>
    </Modal>
  );
};
