import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';

interface RequestSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCustomer?: Customer | null;
}

export const RequestSurveyModal: React.FC<RequestSurveyModalProps> = ({
  isOpen,
  onClose,
  targetCustomer
}) => {
  const { customers, requestSiteSurvey, showToast } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState(targetCustomer?.id || customers[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState('Terrace accessible via staircase. Customer requested morning slot.');

  const customer = customers.find(c => c.id === selectedCustomerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    requestSiteSurvey(customer.id, scheduledDate, notes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Site Survey Coordination"
      subtitle="Initiate technical terrace shadow & azimuth survey for engineering approval"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!targetCustomer && (
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Select Customer *</label>
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.phone} — {c.city})
                </option>
              ))}
            </select>
          </div>
        )}

        {customer && (
          <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey text-xs">
            <strong>Customer:</strong> {customer.fullName} ({customer.phone})
            <div className="text-mutedGrey">{customer.address}, {customer.city}</div>
            <div className="text-navy font-semibold mt-1">Proposed Capacity: {customer.interestedCapacityKw} kW ({customer.preferredSystemType.replace('_', ' ')})</div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Requested Survey Date & Time *</label>
          <input
            type="datetime-local"
            required
            value={scheduledDate}
            onChange={e => setScheduledDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy font-medium text-charcoal"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Site Access Notes for Field Specialist</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Key holder contact, ladder requirement, meter room location..."
            className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="pt-3 border-t border-warmGrey flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs"
          >
            Request Survey Allocation
          </button>
        </div>
      </form>
    </Modal>
  );
};
