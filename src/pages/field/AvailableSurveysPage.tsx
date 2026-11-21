import React, { useState } from 'react';
import { 
  Compass, MapPin, Calendar, Clock, Zap, CheckCircle2, 
  AlertTriangle, UserCheck, ShieldCheck, ArrowRight, 
  X, Check, AlertCircle, Users, Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiteSurvey, Employee } from '../../types';
import { Link } from 'react-router-dom';

export const AvailableSurveysPage: React.FC = () => {
  const { 
    currentUser, 
    surveys, 
    employees, 
    claimSurvey, 
    assignSurveyTechnician,
    showToast 
  } = useApp();

  const [selectedSurveyForClaim, setSelectedSurveyForClaim] = useState<SiteSurvey | null>(null);
  const [selectedSurveyForChiefAssign, setSelectedSurveyForChiefAssign] = useState<SiteSurvey | null>(null);
  const [targetTechnicianId, setTargetTechnicianId] = useState('');
  const [chiefAssignDate, setChiefAssignDate] = useState('');
  const [chiefAssignSlot, setChiefAssignSlot] = useState('10:00 AM - 12:00 PM');
  const [chiefInstructions, setChiefInstructions] = useState('');

  // Unassigned surveys pool
  const unassignedSurveys = surveys.filter(s => s.status === 'unassigned');

  // Survey technicians team list
  const surveyTechnicians = employees.filter(e => e.department === 'Field Engineering' || e.role === 'survey_tech');

  const cardContainerClass = "bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all duration-200";

  const handleConfirmClaim = () => {
    if (!selectedSurveyForClaim) return;
    const res = claimSurvey(selectedSurveyForClaim.id);
    if (res.success) {
      showToast(res.message, 'success');
      setSelectedSurveyForClaim(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleChiefAssign = () => {
    if (!selectedSurveyForChiefAssign || !targetTechnicianId) {
      showToast('Please select a technician to allocate.', 'warning');
      return;
    }

    assignSurveyTechnician({
      surveyId: selectedSurveyForChiefAssign.id,
      customerId: selectedSurveyForChiefAssign.customerId,
      technicianId: targetTechnicianId,
      scheduledDate: chiefAssignDate || selectedSurveyForChiefAssign.scheduledDate,
      timeSlot: chiefAssignSlot,
      instructions: chiefInstructions || selectedSurveyForChiefAssign.instructions
    });

    setSelectedSurveyForChiefAssign(null);
  };

  const isChiefOrAdmin = currentUser.isChiefSurveySpecialist || currentUser.canAssignSurveys || currentUser.role === 'owner_admin';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`${cardContainerClass} p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-amber" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              Hybrid Survey Allocation Model
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            Available Site Surveys
          </h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Verified customer survey requests ready for technical self-claiming or team lead assignment.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-sand-100 text-charcoal font-semibold border border-warmGrey">
            Open Pool: <strong>{unassignedSurveys.length} Requests</strong>
          </div>
          {isChiefOrAdmin && (
            <span className="px-2.5 py-1 rounded-lg bg-navy text-white text-[10px] font-bold">
              Chief Allocation Active
            </span>
          )}
        </div>
      </div>

      {/* Available Surveys Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {unassignedSurveys.length === 0 ? (
          <div className={`col-span-full ${cardContainerClass} p-12 text-center text-xs text-mutedGrey`}>
            <Compass className="w-8 h-8 text-warmGrey mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-charcoal text-sm">No Available Surveys in Pool</p>
            <p className="mt-1">All current survey requests have been claimed or assigned. New enquiries will appear here automatically.</p>
          </div>
        ) : (
          unassignedSurveys.map(s => (
            <div 
              key={s.id} 
              className={`${cardContainerClass} p-5 flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-navy">{s.surveyNumber}</span>
                    <h3 className="text-sm font-bold text-charcoal mt-0.5">{s.customerName}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">
                    Open to Claim
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-mutedGrey">
                  <div className="flex items-start space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                    <span className="text-charcoal leading-snug">{s.customerAddress}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-navy shrink-0" />
                    <span>Requested: {new Date(s.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-navy shrink-0" />
                    <span>Slot: {s.timeSlot || '10:00 AM - 12:00 PM'} (est. {s.estimatedDurationMinutes || 90} mins)</span>
                  </div>
                  {s.distanceKm && (
                    <div className="flex items-center space-x-1.5 font-bold text-navy">
                      <Zap className="w-3.5 h-3.5 text-amber shrink-0" />
                      <span>{s.distanceKm} km from Baner Headquarters</span>
                    </div>
                  )}
                </div>

                {s.instructions && (
                  <p className="text-[11px] text-mutedGrey bg-sand-50 p-2 rounded-lg border border-warmGrey/50 line-clamp-2">
                    <strong>Instructions:</strong> {s.instructions}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-warmGrey/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedSurveyForClaim(s)}
                  className="flex-1 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-all flex items-center justify-center space-x-1.5 shadow-xs active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Claim Survey</span>
                </button>

                {isChiefOrAdmin && (
                  <button
                    onClick={() => {
                      setSelectedSurveyForChiefAssign(s);
                      setChiefAssignDate(s.scheduledDate.split('T')[0]);
                      setChiefAssignSlot(s.timeSlot || '10:00 AM - 12:00 PM');
                    }}
                    className="px-3 py-2 bg-sand-100 hover:bg-sand-200 text-charcoal text-xs font-semibold rounded-xl border border-warmGrey transition-colors"
                    title="Assign to another engineer"
                  >
                    Assign Team
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal: Self-Claim Survey */}
      {selectedSurveyForClaim && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-charcoal shadow-dropdown border border-warmGrey animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-warmGrey/60">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-navy" />
                <h3 className="font-bold text-base text-charcoal">Confirm Survey Claim</h3>
              </div>
              <button onClick={() => setSelectedSurveyForClaim(null)} className="text-mutedGrey hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-mutedGrey leading-relaxed">
              You are about to self-assign this customer survey. The system will perform an atomic validation check against your schedule and approved leaves.
            </p>

            <div className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey/60 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-mutedGrey">Survey ID:</span>
                <strong className="font-mono text-navy">{selectedSurveyForClaim.surveyNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGrey">Customer:</span>
                <strong className="text-charcoal">{selectedSurveyForClaim.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGrey">Scheduled Date:</span>
                <strong className="text-charcoal">{new Date(selectedSurveyForClaim.scheduledDate).toLocaleDateString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGrey">Time Slot:</span>
                <strong className="text-charcoal">{selectedSurveyForClaim.timeSlot || '10:00 AM - 12:00 PM'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedGrey">Assigned To:</span>
                <strong className="text-navy">{currentUser.name}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-warmGrey/60">
              <button
                onClick={() => setSelectedSurveyForClaim(null)}
                className="px-4 py-2 text-xs font-semibold text-mutedGrey hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClaim}
                className="px-5 py-2 bg-navy hover:bg-navy-light text-white font-semibold text-xs rounded-xl shadow-xs flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Claim</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chief Survey Specialist Allocation Modal */}
      {selectedSurveyForChiefAssign && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-charcoal shadow-dropdown border border-warmGrey animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-warmGrey/60">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-navy" />
                <h3 className="font-bold text-base text-charcoal">Allocate to Survey Team Member</h3>
              </div>
              <button onClick={() => setSelectedSurveyForChiefAssign(null)} className="text-mutedGrey hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-mutedGrey">
              As Chief Survey Specialist, allocate <strong>{selectedSurveyForChiefAssign.surveyNumber}</strong> ({selectedSurveyForChiefAssign.customerName}) to an eligible field engineer.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Select Field Engineer *</label>
                <select
                  value={targetTechnicianId}
                  onChange={e => setTargetTechnicianId(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl bg-white font-medium"
                >
                  <option value="">-- Choose Field Specialist --</option>
                  {surveyTechnicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.designation}) — {t.isAvailable ? '✓ Available' : 'Busy'} ({t.activeJobs} Active Jobs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={chiefAssignDate}
                    onChange={e => setChiefAssignDate(e.target.value)}
                    className="w-full p-2 border border-warmGrey rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Time Slot</label>
                  <select
                    value={chiefAssignSlot}
                    onChange={e => setChiefAssignSlot(e.target.value)}
                    className="w-full p-2 border border-warmGrey rounded-lg bg-white"
                  >
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:30 PM - 06:30 PM">04:30 PM - 06:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Special Site Instructions</label>
                <textarea
                  rows={2}
                  value={chiefInstructions}
                  onChange={e => setChiefInstructions(e.target.value)}
                  placeholder="e.g. Laser measure tile section, check parapet anchor points..."
                  className="w-full p-2.5 border border-warmGrey rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-warmGrey/60">
              <button
                onClick={() => setSelectedSurveyForChiefAssign(null)}
                className="px-4 py-2 text-xs font-semibold text-mutedGrey hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleChiefAssign}
                className="px-5 py-2 bg-navy hover:bg-navy-light text-white font-semibold text-xs rounded-xl shadow-xs flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
