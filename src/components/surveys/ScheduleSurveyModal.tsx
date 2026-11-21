import React, { useState } from 'react';
import { 
  Calendar, Clock, UserCheck, Plus, AlertCircle, 
  CheckCircle2, ShieldAlert, Zap, MapPin, Phone 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Customer, Employee } from '../../types';

interface ScheduleSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
  defaultTechnicianId?: string;
  defaultDate?: string;
  defaultSlot?: string;
}

const TIME_SLOTS = [
  '09:30 AM - 11:30 AM',
  '12:00 PM - 02:00 PM',
  '02:30 PM - 04:30 PM',
  '04:30 PM - 06:30 PM'
];

export const ScheduleSurveyModal: React.FC<ScheduleSurveyModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerId,
  defaultTechnicianId,
  defaultDate,
  defaultSlot
}) => {
  const { 
    customers, 
    surveys, 
    employees, 
    technicianLeaves, 
    createSurveyRequest, 
    showToast 
  } = useApp();

  // Filter survey specialists
  const surveyTechnicians = employees.filter(
    e => e.role === 'survey_tech' || e.department === 'Field Engineering'
  );

  // Eligible customers (prioritize customers without approved surveys)
  const eligibleCustomers = customers.filter(c => {
    const hasApprovedSurvey = surveys.some(s => s.customerId === c.id && s.status === 'approved');
    return !hasApprovedSurvey;
  });

  const availableCustomers = eligibleCustomers.length > 0 ? eligibleCustomers : customers;

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    defaultCustomerId || availableCustomers[0]?.id || ''
  );

  const [selectedTechId, setSelectedTechId] = useState(
    defaultTechnicianId || surveyTechnicians[0]?.id || ''
  );

  const [scheduledDate, setScheduledDate] = useState(
    defaultDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  const [timeSlot, setTimeSlot] = useState(
    defaultSlot || TIME_SLOTS[0]
  );

  const [instructions, setInstructions] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedTech = employees.find(e => e.id === selectedTechId);

  // Validation
  const isOnLeave = selectedTech && technicianLeaves.find(l => 
    l.technicianId === selectedTech.id &&
    l.status === 'approved' &&
    scheduledDate >= l.startDate && scheduledDate <= l.endDate
  );

  const conflictingSurvey = selectedTech && surveys.find(s => 
    s.technicianId === selectedTech.id &&
    s.scheduledDate.split('T')[0] === scheduledDate &&
    (s.timeSlot === timeSlot || (!s.timeSlot && s.scheduledDate.split('T')[1]?.startsWith(timeSlot.split(':')[0]))) &&
    s.status !== 'cancelled' && s.status !== 'rejected'
  );

  // Check duplicate active survey for same customer
  const duplicateActiveSurvey = surveys.find(s => 
    s.customerId === selectedCustomerId &&
    (s.status === 'scheduled' || s.status === 'assigned' || s.status === 'in_progress')
  );

  const isBlocked = !!isOnLeave || !!conflictingSurvey || !!duplicateActiveSurvey;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      showToast('Please select a customer requiring survey', 'error');
      return;
    }

    if (duplicateActiveSurvey) {
      showToast(`Customer already has active survey ${duplicateActiveSurvey.surveyNumber} in progress`, 'error');
      return;
    }

    if (isOnLeave) {
      showToast(`${selectedTech?.fullName} is on approved leave on ${scheduledDate}`, 'error');
      return;
    }

    if (conflictingSurvey) {
      showToast(`Conflict: ${selectedTech?.fullName} is already booked on ${scheduledDate} (${timeSlot})`, 'error');
      return;
    }

    const fullIsoDate = `${scheduledDate}T${timeSlot.startsWith('09') ? '09:30:00' : timeSlot.startsWith('12') ? '12:00:00' : timeSlot.startsWith('02') ? '14:30:00' : '16:30:00'}`;

    createSurveyRequest({
      customerId: selectedCustomerId,
      scheduledDate: fullIsoDate,
      timeSlot,
      technicianId: selectedTechId,
      instructions
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Rooftop Site Survey"
      subtitle="Dispatch field engineering specialist for shadow & structural assessment"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Customer Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
            Select Customer *
          </label>
          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
          >
            {availableCustomers.map(c => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.customerCode}) — {c.city} • {c.interestedCapacityKw}kW {c.preferredSystemType.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Customer Preview Card */}
        {selectedCustomer && (
          <div className="p-3 bg-sand-50/80 rounded-xl border border-warmGrey/60 text-xs flex flex-col sm:flex-row justify-between gap-2 text-mutedGrey">
            <div>
              <span className="font-bold text-charcoal">{selectedCustomer.fullName}</span>
              <p className="mt-0.5">📍 {selectedCustomer.address}, {selectedCustomer.city}</p>
            </div>
            <div className="text-right">
              <span className="font-semibold text-navy">📞 {selectedCustomer.phone}</span>
              <p className="text-[11px] text-sage font-bold">Requirement: {selectedCustomer.interestedCapacityKw} kW</p>
            </div>
          </div>
        )}

        {/* Duplicate active survey warning if any */}
        {duplicateActiveSurvey && (
          <div className="p-3 bg-amber-50 border border-amber/40 rounded-xl flex items-start space-x-2 text-amber text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Active Survey Already Exists:</span>
              <p className="mt-0.5 text-charcoal">
                Customer already has survey <strong>{duplicateActiveSurvey.surveyNumber}</strong> in <strong>{duplicateActiveSurvey.status.toUpperCase()}</strong> status.
                Double-booking is prevented by system validation.
              </p>
            </div>
          </div>
        )}

        {/* Date and Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
              Survey Date *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
              Time Slot *
            </label>
            <select
              value={timeSlot}
              onChange={e => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Technician Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
            Allocate Field Survey Specialist *
          </label>
          <div className="space-y-2">
            {surveyTechnicians.map(t => {
              const isSelected = t.id === selectedTechId;
              const countOnDate = surveys.filter(
                s => s.technicianId === t.id && 
                     s.scheduledDate.startsWith(scheduledDate) &&
                     s.status !== 'cancelled' && s.status !== 'rejected'
              ).length;
              
              const isLeave = technicianLeaves.find(
                l => l.technicianId === t.id && 
                     l.status === 'approved' &&
                     scheduledDate >= l.startDate && scheduledDate <= l.endDate
              );

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTechId(t.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    isSelected 
                      ? 'bg-navy/5 border-navy ring-1 ring-navy' 
                      : 'bg-white border-warmGrey hover:bg-sand-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-navy text-white' : 'bg-sand-200 text-charcoal'
                    }`}>
                      {t.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-bold text-charcoal">{t.fullName}</span>
                      <span className="text-[11px] text-mutedGrey ml-1.5">({t.designation})</span>
                      <div className="text-[10px] text-mutedGrey">
                        {isLeave ? 'On Leave' : `${countOnDate} surveys scheduled on ${scheduledDate}`}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isLeave ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-50 text-terracotta border border-terracotta/30">
                        On Leave
                      </span>
                    ) : countOnDate >= 2 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">
                        {countOnDate} Jobs
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage border border-sage/30">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Availability Live Check Notice */}
        {isOnLeave ? (
          <div className="p-2.5 bg-terracotta-50 border border-terracotta/40 rounded-xl flex items-center space-x-2 text-terracotta text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{selectedTech?.fullName} is on leave on {scheduledDate}. Please pick another specialist.</span>
          </div>
        ) : conflictingSurvey ? (
          <div className="p-2.5 bg-amber-50 border border-amber/40 rounded-xl flex items-center space-x-2 text-amber text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Conflict: {selectedTech?.fullName} has {conflictingSurvey.surveyNumber} during {timeSlot}.</span>
          </div>
        ) : (
          <div className="p-2.5 bg-sage-50 border border-sage/30 rounded-xl flex items-center space-x-2 text-sage text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Technician is available for booking on this slot.</span>
          </div>
        )}

        {/* Survey Instructions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
            Site Access & Engineering Instructions
          </label>
          <textarea
            rows={2}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="e.g. RCC terrace access via internal staircase, verify distance to consumer meter, check western shading..."
            className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy"
          />
        </div>

        {/* Actions */}
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
            <Plus className="w-4 h-4" />
            <span>Confirm & Schedule Survey</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
