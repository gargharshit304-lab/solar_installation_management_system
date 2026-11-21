import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Customer, FollowUpPriority } from '../../types';

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCustomer?: Customer | null;
  existingFollowUpId?: string;
  isReschedule?: boolean;
}

export const ScheduleFollowUpModal: React.FC<ScheduleFollowUpModalProps> = ({
  isOpen,
  onClose,
  targetCustomer,
  existingFollowUpId,
  isReschedule = false
}) => {
  const { customers, scheduleFollowUp, rescheduleFollowUp, showToast } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState(targetCustomer?.id || customers[0]?.id || '');
  const [scheduledDateTime, setScheduledDateTime] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [priority, setPriority] = useState<FollowUpPriority>('high');
  const [reason, setReason] = useState('Call to discuss quotation & finance scheme');

  const customer = customers.find(c => c.id === selectedCustomerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    if (isReschedule && existingFollowUpId) {
      rescheduleFollowUp(existingFollowUpId, scheduledDateTime, reason);
    } else {
      scheduleFollowUp({
        customerId: customer.id,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        customerCity: customer.city,
        lastInteractionDate: new Date().toISOString().split('T')[0],
        scheduledDate: scheduledDateTime,
        followUpReason: reason,
        priority,
        assignedSalesperson: 'Pooja Kulkarni'
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReschedule ? 'Reschedule Customer Follow-Up' : 'Schedule Customer Follow-Up'}
      subtitle="Ensure timely follow-up so no solar lead goes cold"
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
            <div className="text-mutedGrey">{customer.city} • Capacity: {customer.interestedCapacityKw} kW</div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Scheduled Date & Time *</label>
          <input
            type="datetime-local"
            required
            value={scheduledDateTime}
            onChange={e => setScheduledDateTime(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy font-medium text-charcoal"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Priority Level</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as FollowUpPriority)}
            className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white font-medium"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent (Customer Ready to Close)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Follow-Up Objective / Reason *</label>
          <textarea
            rows={2}
            required
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Discuss revised quote terms, clarify subsidy questions, confirm survey availability"
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
            {isReschedule ? 'Update Follow-Up' : 'Confirm Follow-Up'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
