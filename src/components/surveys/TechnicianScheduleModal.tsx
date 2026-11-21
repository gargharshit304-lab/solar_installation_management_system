import React, { useState } from 'react';
import { 
  Calendar, Clock, User, Phone, CheckCircle2, AlertCircle, 
  MapPin, Star, Wrench, Shield, Plus, X 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Employee, SiteSurvey } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface TechnicianScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  technician: Employee | null;
  onBookSlot?: (tech: Employee, date: string, slot: string) => void;
}

const TIME_SLOTS = [
  '09:30 AM - 11:30 AM',
  '12:00 PM - 02:00 PM',
  '02:30 PM - 04:30 PM',
  '04:30 PM - 06:30 PM'
];

export const TechnicianScheduleModal: React.FC<TechnicianScheduleModalProps> = ({
  isOpen,
  onClose,
  technician,
  onBookSlot
}) => {
  const { surveys, technicianLeaves } = useApp();

  // Setup date tabs: Today, Tomorrow, +2 days, +3 days
  const today = new Date();
  const dateOptions = [0, 1, 2, 3].map(offset => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return {
      isoDate: d.toISOString().split('T')[0],
      display: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      fullDateString: d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  });

  const [selectedDate, setSelectedDate] = useState(dateOptions[0].isoDate);

  if (!technician) return null;

  // Check if technician is on leave on selectedDate
  const leaveOnDate = technicianLeaves.find(l => {
    return l.technicianId === technician.id && 
           l.status === 'approved' &&
           selectedDate >= l.startDate && selectedDate <= l.endDate;
  });

  // Get surveys assigned to this technician on selectedDate
  const assignedSurveysOnDate = surveys.filter(s => {
    if (s.technicianId !== technician.id) return false;
    const surveyDateOnly = s.scheduledDate.split('T')[0];
    return surveyDateOnly === selectedDate;
  });

  const selectedDateObj = dateOptions.find(d => d.isoDate === selectedDate) || dateOptions[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Survey Schedule: ${technician.fullName}`}
      subtitle={`${technician.designation} • ${technician.department}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        
        {/* Technician Summary Card */}
        <div className="p-4 bg-sand-50/80 rounded-xl border border-warmGrey/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-base shadow-xs">
              {technician.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-charcoal">{technician.fullName}</h4>
                <span className="flex items-center text-xs font-semibold text-amber bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber/20">
                  <Star className="w-3 h-3 fill-amber mr-0.5" />
                  {technician.rating}
                </span>
              </div>
              <p className="text-xs text-mutedGrey flex items-center space-x-2 mt-0.5">
                <Phone className="w-3 h-3 text-navy inline" />
                <span>{technician.phone}</span>
                <span>•</span>
                <span>{technician.designation}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 text-[11px]">
            {technician.skills.slice(0, 2).map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-white text-navy font-medium rounded-md border border-warmGrey/60">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Date Tabs */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-2">
            Select Date:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {dateOptions.map(opt => {
              const isSelected = opt.isoDate === selectedDate;
              // Check count on that day
              const countOnDay = surveys.filter(s => s.technicianId === technician.id && s.scheduledDate.startsWith(opt.isoDate)).length;
              return (
                <button
                  key={opt.isoDate}
                  type="button"
                  onClick={() => setSelectedDate(opt.isoDate)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-navy text-white border-navy shadow-xs' 
                      : 'bg-white text-charcoal border-warmGrey hover:bg-sand-50'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.display}</div>
                  <div className={`text-[11px] ${isSelected ? 'text-sand-200' : 'text-mutedGrey'}`}>
                    {opt.isoDate}
                  </div>
                  <div className="text-[10px] mt-1 font-semibold">
                    {countOnDay > 0 ? `${countOnDay} Job${countOnDay > 1 ? 's' : ''}` : 'Available'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leave Notice if applicable */}
        {leaveOnDate && (
          <div className="p-3 bg-terracotta-50 border border-terracotta/40 rounded-xl flex items-start space-x-2.5 text-terracotta text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Technician on Approved Leave:</span>
              <p className="mt-0.5 text-charcoal">
                {technician.fullName} is scheduled on {leaveOnDate.leaveType} leave ({leaveOnDate.startDate} to {leaveOnDate.endDate}).
                Reason: {leaveOnDate.reason}
              </p>
            </div>
          </div>
        )}

        {/* Schedule Slots Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-charcoal">
              Appointments for {selectedDateObj.fullDateString}
            </span>
            <span className="text-mutedGrey">
              {assignedSurveysOnDate.length} of {TIME_SLOTS.length} slots booked
            </span>
          </div>

          <div className="space-y-2.5">
            {TIME_SLOTS.map((slot, index) => {
              // Find if any survey matches this slot
              const bookedSurvey = assignedSurveysOnDate.find(s => {
                if (s.timeSlot === slot) return true;
                // fallback to hour check
                const hour = parseInt(s.scheduledDate.split('T')[1]?.split(':')[0] || '10');
                if (index === 0 && (hour >= 9 && hour < 12)) return true;
                if (index === 1 && (hour >= 12 && hour < 14)) return true;
                if (index === 2 && (hour >= 14 && hour < 16)) return true;
                if (index === 3 && (hour >= 16)) return true;
                return false;
              });

              return (
                <div 
                  key={slot}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    bookedSurvey 
                      ? 'bg-sand-50/70 border-warmGrey/80' 
                      : leaveOnDate 
                        ? 'bg-sand-100/40 border-warmGrey/40 opacity-70' 
                        : 'bg-white border-warmGrey hover:border-navy/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="px-2.5 py-1 rounded-lg bg-sand-200/60 font-mono text-xs font-bold text-charcoal shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5 inline mr-1 text-navy" />
                      {slot}
                    </div>

                    <div>
                      {bookedSurvey ? (
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-charcoal">
                              {bookedSurvey.customerName}
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-navy">
                              ({bookedSurvey.surveyNumber})
                            </span>
                            <StatusBadge status={bookedSurvey.status} />
                          </div>
                          <p className="text-[11px] text-mutedGrey flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 inline text-mutedGrey" />
                            <span className="truncate max-w-[280px]">{bookedSurvey.customerAddress}</span>
                          </p>
                          {bookedSurvey.instructions && (
                            <p className="text-[11px] text-charcoal/80 italic mt-0.5">
                              "{bookedSurvey.instructions}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-semibold ${leaveOnDate ? 'text-mutedGrey' : 'text-sage'}`}>
                            {leaveOnDate ? 'Unavailable (On Leave)' : '✓ Open & Available Slot'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2 justify-end">
                    {bookedSurvey ? (
                      <span className="text-[11px] font-medium text-mutedGrey px-2 py-1 bg-white rounded-md border border-warmGrey/60">
                        Duration: {bookedSurvey.estimatedDurationMinutes || 90}m
                      </span>
                    ) : !leaveOnDate && onBookSlot && (
                      <button
                        type="button"
                        onClick={() => {
                          onBookSlot(technician, selectedDate, slot);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors flex items-center space-x-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Book Slot</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-warmGrey/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
};
