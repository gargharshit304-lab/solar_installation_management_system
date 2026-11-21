import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, AlertCircle, ShieldAlert 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { SiteSurvey } from '../../types';

interface RescheduleSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: SiteSurvey | null;
}

const TIME_SLOTS = [
  '09:30 AM - 11:30 AM',
  '12:00 PM - 02:00 PM',
  '02:30 PM - 04:30 PM',
  '04:30 PM - 06:30 PM'
];

export const RescheduleSurveyModal: React.FC<RescheduleSurveyModalProps> = ({
  isOpen,
  onClose,
  survey
}) => {
  const { surveys, employees, technicianLeaves, rescheduleSurvey, showToast } = useApp();

  const [newDate, setNewDate] = useState(
    survey?.scheduledDate.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [newSlot, setNewSlot] = useState(
    survey?.timeSlot || TIME_SLOTS[0]
  );
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (survey) {
      setNewDate(survey.scheduledDate.split('T')[0]);
      setNewSlot(survey.timeSlot || TIME_SLOTS[0]);
      setReason(survey.instructions || '');
    }
  }, [survey]);

  if (!survey) return null;

  const tech = employees.find(e => e.id === survey.technicianId);

  // Validate conflict for technician on newDate & newSlot
  const isOnLeave = tech && technicianLeaves.find(l => 
    l.technicianId === tech.id &&
    l.status === 'approved' &&
    newDate >= l.startDate && newDate <= l.endDate
  );

  const conflictingSurvey = tech && surveys.find(s => 
    s.id !== survey.id &&
    s.technicianId === tech.id &&
    s.scheduledDate.split('T')[0] === newDate &&
    (s.timeSlot === newSlot || (!s.timeSlot && s.scheduledDate.split('T')[1]?.startsWith(newSlot.split(':')[0]))) &&
    s.status !== 'cancelled' && s.status !== 'rejected'
  );

  const isBlocked = !!isOnLeave || !!conflictingSurvey;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      showToast('Cannot reschedule: technician conflict exists for selected slot', 'error');
      return;
    }

    const fullIsoDate = `${newDate}T${newSlot.startsWith('09') ? '09:30:00' : newSlot.startsWith('12') ? '12:00:00' : newSlot.startsWith('02') ? '14:30:00' : '16:30:00'}`;
    rescheduleSurvey(survey.id, fullIsoDate, newSlot, reason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Site Survey Visit"
      subtitle={`Survey ID: ${survey.surveyNumber} • Customer: ${survey.customerName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Current Booking Summary */}
        <div className="p-3 bg-sand-50/80 rounded-xl border border-warmGrey/60 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-mutedGrey font-medium">Assigned Specialist:</span>
            <span className="font-bold text-navy">{survey.technicianName || 'Unassigned'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mutedGrey font-medium">Current Appointment:</span>
            <span className="font-semibold text-charcoal">
              {new Date(survey.scheduledDate).toLocaleDateString()} ({survey.timeSlot || 'Morning'})
            </span>
          </div>
        </div>

        {/* New Date & Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
              New Date *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
              New Time Slot *
            </label>
            <select
              value={newSlot}
              onChange={e => setNewSlot(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation Feedback */}
        {isOnLeave ? (
          <div className="p-3 bg-terracotta-50 border border-terracotta/40 rounded-xl flex items-start space-x-2 text-terracotta text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Technician on Leave:</span>
              <p className="mt-0.5 text-charcoal">
                {survey.technicianName} is on leave on {newDate}. Please choose another date or reassign technician.
              </p>
            </div>
          </div>
        ) : conflictingSurvey ? (
          <div className="p-3 bg-amber-50 border border-amber/40 rounded-xl flex items-start space-x-2 text-amber text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Slot Unavailable:</span>
              <p className="mt-0.5 text-charcoal">
                {survey.technicianName} is already assigned to {conflictingSurvey.surveyNumber} on {newDate} at {newSlot}.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-sage-50 border border-sage/30 rounded-xl flex items-center space-x-2 text-sage text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Specialist is open and available on the requested slot.</span>
          </div>
        )}

        {/* Reason / Update Instructions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
            Reason for Rescheduling / Special Instructions
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Customer requested weekend afternoon slot, key holder delayed..."
            className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy"
          />
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-warmGrey/60 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-sand-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBlocked}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 ${
              isBlocked 
                ? 'bg-warmGrey text-mutedGrey cursor-not-allowed opacity-60' 
                : 'bg-navy text-white hover:bg-navy-light cursor-pointer'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Confirm Reschedule</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
