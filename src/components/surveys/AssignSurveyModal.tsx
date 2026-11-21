import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Calendar, Clock, AlertTriangle, CheckCircle2, 
  MapPin, Phone, Zap, FileText, AlertCircle, Info, ShieldAlert 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Employee, SiteSurvey, Customer } from '../../types';

interface AssignSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: SiteSurvey | null;
  isReassign?: boolean;
  initialTechnicianId?: string;
  initialDate?: string;
  initialTimeSlot?: string;
}

const TIME_SLOTS = [
  '09:30 AM - 11:30 AM',
  '12:00 PM - 02:00 PM',
  '02:30 PM - 04:30 PM',
  '04:30 PM - 06:30 PM'
];

export const AssignSurveyModal: React.FC<AssignSurveyModalProps> = ({
  isOpen,
  onClose,
  survey,
  isReassign = false,
  initialTechnicianId,
  initialDate,
  initialTimeSlot
}) => {
  const { 
    employees, 
    customers, 
    surveys, 
    technicianLeaves, 
    assignSurveyTechnician, 
    reassignSurveyTechnician, 
    showToast 
  } = useApp();

  // Filter survey technicians
  const surveyTechnicians = employees.filter(
    e => e.role === 'survey_tech' || e.department === 'Field Engineering'
  );

  const customer: Customer | undefined = customers.find(c => c.id === survey?.customerId);

  // Form states
  const [selectedTechId, setSelectedTechId] = useState(
    initialTechnicianId || (isReassign ? '' : survey?.technicianId || surveyTechnicians[0]?.id || '')
  );
  
  const [scheduledDate, setScheduledDate] = useState(
    initialDate || survey?.scheduledDate.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  
  const [timeSlot, setTimeSlot] = useState(
    initialTimeSlot || survey?.timeSlot || TIME_SLOTS[0]
  );

  const [durationMinutes, setDurationMinutes] = useState(survey?.estimatedDurationMinutes || 90);
  const [instructions, setInstructions] = useState(survey?.instructions || '');
  const [reassignReason, setReassignReason] = useState('');

  // Update defaults when modal opens with new survey
  useEffect(() => {
    if (survey) {
      if (initialTechnicianId) {
        setSelectedTechId(initialTechnicianId);
      } else if (!isReassign && survey.technicianId) {
        setSelectedTechId(survey.technicianId);
      } else if (isReassign) {
        // Default to a different technician
        const otherTech = surveyTechnicians.find(t => t.id !== survey.technicianId);
        setSelectedTechId(otherTech?.id || '');
      } else {
        setSelectedTechId(surveyTechnicians[0]?.id || '');
      }

      if (initialDate) setScheduledDate(initialDate);
      else if (survey.scheduledDate) setScheduledDate(survey.scheduledDate.split('T')[0]);

      if (initialTimeSlot) setTimeSlot(initialTimeSlot);
      else if (survey.timeSlot) setTimeSlot(survey.timeSlot);

      setInstructions(survey.instructions || '');
    }
  }, [survey, initialTechnicianId, initialDate, initialTimeSlot, isReassign]);

  if (!survey) return null;

  const selectedTechnician = employees.find(e => e.id === selectedTechId);

  // CONFLICT VALIDATION:
  // 1. Check if selected technician is on approved leave on that date
  const isOnLeave = technicianLeaves.find(l => 
    l.technicianId === selectedTechId &&
    l.status === 'approved' &&
    scheduledDate >= l.startDate && scheduledDate <= l.endDate
  );

  // 2. Check if selected technician already has a survey in the same date & time slot
  const conflictingSurvey = surveys.find(s => 
    s.id !== survey.id &&
    s.technicianId === selectedTechId &&
    s.scheduledDate.split('T')[0] === scheduledDate &&
    (s.timeSlot === timeSlot || (!s.timeSlot && s.scheduledDate.split('T')[1]?.startsWith(timeSlot.split(':')[0]))) &&
    s.status !== 'cancelled' && s.status !== 'rejected'
  );

  // 3. Workload on that day
  const dailyWorkload = surveys.filter(s => 
    s.technicianId === selectedTechId &&
    s.scheduledDate.split('T')[0] === scheduledDate &&
    s.status !== 'cancelled' && s.status !== 'rejected'
  ).length;

  const isBlocked = !!isOnLeave || !!conflictingSurvey || (isReassign && !reassignReason.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTechId) {
      showToast('Please select a survey specialist', 'error');
      return;
    }

    if (isOnLeave) {
      showToast(`${selectedTechnician?.fullName} is on leave on ${scheduledDate}`, 'error');
      return;
    }

    if (conflictingSurvey) {
      showToast(`Conflict: ${selectedTechnician?.fullName} is already booked for ${conflictingSurvey.surveyNumber} at ${timeSlot}`, 'error');
      return;
    }

    const fullIsoDate = `${scheduledDate}T${timeSlot.startsWith('09') ? '09:30:00' : timeSlot.startsWith('12') ? '12:00:00' : timeSlot.startsWith('02') ? '14:30:00' : '16:30:00'}`;

    if (isReassign) {
      if (!reassignReason.trim()) {
        showToast('Please provide a reason for technician reassignment', 'error');
        return;
      }
      reassignSurveyTechnician(
        survey.id, 
        selectedTechId, 
        reassignReason, 
        fullIsoDate, 
        timeSlot
      );
    } else {
      assignSurveyTechnician(
        survey.id, 
        selectedTechId, 
        fullIsoDate, 
        timeSlot, 
        instructions
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReassign ? "Reassign Field Survey Specialist" : "Assign Survey Specialist"}
      subtitle={`Customer: ${survey.customerName} • Survey ID: ${survey.surveyNumber}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Customer & Site Context Card */}
        <div className="p-3.5 bg-sand-50/80 rounded-xl border border-warmGrey/60 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-warmGrey/40 pb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">Customer</span>
              <h4 className="font-bold text-charcoal text-sm">{survey.customerName}</h4>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">Survey ID</span>
              <p className="font-mono font-bold text-navy text-sm">{survey.surveyNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-mutedGrey">
            <div className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-navy shrink-0" />
              <span className="truncate">{survey.customerPhone}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber shrink-0" />
              <span>{customer?.interestedCapacityKw || 5} kW {customer?.preferredSystemType?.toUpperCase() || 'ON-GRID'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span className="truncate">{survey.customerAddress}</span>
            </div>
          </div>
        </div>

        {/* Reassignment Warning Notice if reassigning */}
        {isReassign && (
          <div className="p-3 bg-amber-50 border border-amber/30 rounded-xl text-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Reassignment Notice</span>
            </div>
            <p className="text-charcoal text-[11px]">
              Currently assigned to: <strong>{survey.technicianName || 'None'}</strong>.
              Reassigning will notify both technicians and record an immutable audit entry in the survey history.
            </p>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                Reason for Reassignment *
              </label>
              <input
                type="text"
                required
                value={reassignReason}
                onChange={e => setReassignReason(e.target.value)}
                placeholder="e.g. Previous technician unavailable, customer requested earlier slot, emergency leave..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-warmGrey rounded-lg focus:outline-hidden focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>
        )}

        {/* Technician Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1.5">
            Select Survey Specialist *
          </label>
          <div className="space-y-2">
            {surveyTechnicians.map(t => {
              const isSelected = t.id === selectedTechId;
              const isPrevTech = isReassign && t.id === survey.technicianId;
              
              // Count appointments on selectedDate
              const countOnSelectedDate = surveys.filter(
                s => s.technicianId === t.id && 
                     s.scheduledDate.split('T')[0] === scheduledDate &&
                     s.status !== 'cancelled' && s.status !== 'rejected'
              ).length;

              const techLeave = technicianLeaves.find(l => 
                l.technicianId === t.id &&
                l.status === 'approved' &&
                scheduledDate >= l.startDate && scheduledDate <= l.endDate
              );

              return (
                <div
                  key={t.id}
                  onClick={() => !isPrevTech && setSelectedTechId(t.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-navy/5 border-navy ring-1 ring-navy' 
                      : isPrevTech 
                        ? 'opacity-40 bg-sand-50 cursor-not-allowed border-warmGrey/60' 
                        : 'bg-white border-warmGrey hover:bg-sand-50/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-navy text-white' : 'bg-sand-200 text-charcoal'
                    }`}>
                      {t.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-charcoal">{t.fullName}</span>
                        <span className="text-[11px] text-mutedGrey">({t.designation})</span>
                        {isPrevTech && (
                          <span className="text-[10px] bg-sand-200 px-1.5 py-0.2 rounded font-semibold text-mutedGrey">
                            Currently Assigned
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-mutedGrey mt-0.5 flex items-center space-x-2">
                        <span>📞 {t.phone}</span>
                        <span>•</span>
                        <span className="font-medium text-charcoal">
                          {techLeave 
                            ? `On Leave (${techLeave.leaveType})` 
                            : `${countOnSelectedDate} survey${countOnSelectedDate === 1 ? '' : 's'} on selected date`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {techLeave ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-50 text-terracotta border border-terracotta/30">
                        On Leave
                      </span>
                    ) : countOnSelectedDate >= 2 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">
                        Heavy Workload ({countOnSelectedDate})
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

        {/* Date, Time Slot & Duration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
              Estimated Duration
            </label>
            <select
              value={durationMinutes}
              onChange={e => setDurationMinutes(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
            >
              <option value={60}>60 Minutes (Compact Roof)</option>
              <option value={90}>90 Minutes (Standard 3-5kW)</option>
              <option value={120}>120 Minutes (Commercial / Complex)</option>
              <option value={180}>180 Minutes (Industrial & HT Feeder)</option>
            </select>
          </div>
        </div>

        {/* Live Validation Alert Box */}
        {isOnLeave ? (
          <div className="p-3 bg-terracotta-50 border border-terracotta/40 rounded-xl flex items-start space-x-2 text-terracotta text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Technician Unavailable (Approved Leave):</span>
              <p className="mt-0.5 text-charcoal">
                {selectedTechnician?.fullName} is on approved {isOnLeave.leaveType} leave on {scheduledDate}.
                Please select another technician.
              </p>
            </div>
          </div>
        ) : conflictingSurvey ? (
          <div className="p-3 bg-amber-50 border border-amber/40 rounded-xl flex items-start space-x-2 text-amber text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Schedule Overlap Warning:</span>
              <p className="mt-0.5 text-charcoal">
                {selectedTechnician?.fullName} is already assigned to <strong>{conflictingSurvey.surveyNumber} ({conflictingSurvey.customerName})</strong> during the <strong>{timeSlot}</strong> slot on {scheduledDate}.
                Please choose an alternate time slot or specialist to avoid double-booking.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-sage-50 border border-sage/30 rounded-xl flex items-center space-x-2 text-sage text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">
              Slot is clear! {selectedTechnician?.fullName} has {dailyWorkload} job(s) scheduled on this day.
            </span>
          </div>
        )}

        {/* Additional Instructions for Specialist */}
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

        {/* Form Actions */}
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
            <UserCheck className="w-4 h-4" />
            <span>{isReassign ? 'Confirm Reassignment' : 'Assign Specialist & Confirm Slot'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
