import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, UserCheck, 
  AlertCircle, Plus, CheckCircle2, Check, X, Shield, 
  ChevronLeft, ChevronRight, FileText, CalendarClock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiteSurvey, TechnicianLeave } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SiteSurveyWorkspaceModal } from '../../components/field/SiteSurveyWorkspaceModal';

export const MySchedulePage: React.FC = () => {
  const { 
    currentUser, 
    surveys, 
    technicianLeaves, 
    addTechnicianLeave,
    showToast 
  } = useApp();

  const [selectedSurveyForWorkspace, setSelectedSurveyForWorkspace] = useState<SiteSurvey | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveType, setLeaveType] = useState<'sick' | 'casual' | 'vacation'>('casual');
  const [leaveReason, setLeaveReason] = useState('');

  // Surveys assigned to current technician
  const mySurveys = surveys.filter(s => 
    !s.technicianName || 
    s.technicianName.includes(currentUser.name.split(' ')[0]) || 
    s.technicianId === currentUser.id ||
    currentUser.role === 'owner_admin'
  );

  // Technician leaves
  const myLeaves = technicianLeaves.filter(l => 
    l.technicianName.includes(currentUser.name.split(' ')[0]) || 
    l.technicianId === currentUser.id
  );

  const cardContainerClass = "bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all duration-200";

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate) {
      showToast('Please select start and end dates.', 'warning');
      return;
    }

    addTechnicianLeave({
      technicianId: currentUser.id,
      technicianName: currentUser.name,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      leaveType,
      status: 'approved',
      reason: leaveReason || 'Scheduled personal leave'
    });

    setIsLeaveModalOpen(false);
    setLeaveReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`${cardContainerClass} p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div>
          <div className="flex items-center space-x-2">
            <CalendarClock className="w-5 h-5 text-amber" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              Specialist Availability & Timeline
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            My Schedule & Field Visits
          </h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Your weekly site inspection roster, committed appointment slots, and approved leaves.
          </p>
        </div>

        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="px-4 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light flex items-center space-x-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave / Block Date</span>
        </button>
      </div>

      {/* Working Hours & Active Roster Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className={`${cardContainerClass} p-5 flex items-center space-x-4`}>
          <div className="p-3 rounded-xl bg-sage-50 text-sage">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-mutedGrey uppercase">Active Working Hours</span>
            <h4 className="text-sm font-bold text-charcoal mt-0.5">09:30 AM – 06:30 PM</h4>
            <p className="text-[11px] text-mutedGrey">Standard 90-min inspection slots</p>
          </div>
        </div>

        <div className={`${cardContainerClass} p-5 flex items-center space-x-4`}>
          <div className="p-3 rounded-xl bg-sand-200/70 text-navy">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-mutedGrey uppercase">Primary Territory</span>
            <h4 className="text-sm font-bold text-charcoal mt-0.5">Pune Metropolitan Region</h4>
            <p className="text-[11px] text-mutedGrey">Baner, Aundh, Kothrud & Hadapsar</p>
          </div>
        </div>

        <div className={`${cardContainerClass} p-5 flex items-center space-x-4`}>
          <div className="p-3 rounded-xl bg-amber-50 text-amber">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-mutedGrey uppercase">Current Availability</span>
            <h4 className="text-sm font-bold text-sage mt-0.5">Available for Dispatch</h4>
            <p className="text-[11px] text-mutedGrey">{mySurveys.filter(s => s.status === 'assigned').length} upcoming slots booked</p>
          </div>
        </div>

      </div>

      {/* Schedule Roster & Approved Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Upcoming Site Visit Timeline */}
        <div className={`lg:col-span-2 ${cardContainerClass} p-6 space-y-4`}>
          <div className="flex items-center justify-between border-b border-warmGrey/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Upcoming Site Visits Agenda</h3>
              <p className="text-xs text-mutedGrey">Chronological list of rooftop appointments</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sand-100 text-charcoal border border-warmGrey">
              {mySurveys.length} Allocated Visits
            </span>
          </div>

          <div className="space-y-3">
            {mySurveys.length === 0 ? (
              <div className="text-center py-10 text-xs text-mutedGrey">
                No site appointments scheduled.
              </div>
            ) : (
              mySurveys.map(s => (
                <div 
                  key={s.id} 
                  className="p-4 rounded-xl border border-warmGrey/80 bg-sand-50/40 hover:bg-white hover:border-navy/40 transition-all text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer"
                  onClick={() => setSelectedSurveyForWorkspace(s)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-navy">{s.surveyNumber}</span>
                      <span className="text-mutedGrey">•</span>
                      <span className="font-bold text-charcoal">{s.customerName}</span>
                      <StatusBadge status={s.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-mutedGrey pt-0.5">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-amber" />
                        <span className="truncate max-w-xs">{s.customerAddress}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-semibold text-charcoal">
                        <Clock className="w-3 h-3 text-navy" />
                        <span>{new Date(s.scheduledDate).toLocaleDateString()} at {s.timeSlot || '10:00 AM - 12:00 PM'}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSurveyForWorkspace(s);
                    }}
                    className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shrink-0"
                  >
                    Open Workspace
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Approved Leaves & Blocked Slots */}
        <div className={`${cardContainerClass} p-6 space-y-4 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between border-b border-warmGrey/60 pb-3">
              <h3 className="text-sm font-bold text-charcoal">Approved Leaves & Blocked Dates</h3>
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="text-xs font-semibold text-navy hover:underline"
              >
                + Add
              </button>
            </div>
            <p className="text-xs text-mutedGrey mt-2 mb-3">
              Dates blocked against new survey allocations.
            </p>

            <div className="space-y-3">
              {myLeaves.length === 0 ? (
                <div className="text-center py-8 text-xs text-mutedGrey">
                  No leaves or blocked dates recorded.
                </div>
              ) : (
                myLeaves.map(l => (
                  <div key={l.id} className="p-3.5 rounded-xl border border-warmGrey/70 bg-sand-50/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-charcoal capitalize">{l.leaveType} Leave</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-sage-50 text-sage border border-sage/30">
                        Approved
                      </span>
                    </div>
                    <p className="text-[11px] text-mutedGrey font-medium">
                      📅 {l.startDate} to {l.endDate}
                    </p>
                    <p className="text-[11px] text-charcoal pt-1">
                      {l.reason}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-sand-100 rounded-xl border border-warmGrey/60 text-[11px] text-mutedGrey flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-navy shrink-0 mt-0.5" />
            <span>Company Policy: Leave requests must be approved by Operations Lead before dates are blocked from self-assignment.</span>
          </div>
        </div>

      </div>

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-charcoal shadow-dropdown border border-warmGrey animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-warmGrey/60">
              <h3 className="font-bold text-base text-charcoal">Submit Leave Request</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-mutedGrey hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={e => setLeaveStartDate(e.target.value)}
                    className="w-full p-2 border border-warmGrey rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={e => setLeaveEndDate(e.target.value)}
                    className="w-full p-2 border border-warmGrey rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as any)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="vacation">Planned Vacation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Reason *</label>
                <textarea
                  rows={2}
                  required
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="Specify reason for scheduling blockage..."
                  className="w-full p-2.5 border border-warmGrey rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-warmGrey/60">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-mutedGrey hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy hover:bg-navy-light text-white font-semibold text-xs rounded-xl shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Site Survey Technical Workspace Modal */}
      {selectedSurveyForWorkspace && (
        <SiteSurveyWorkspaceModal
          survey={selectedSurveyForWorkspace}
          isOpen={!!selectedSurveyForWorkspace}
          onClose={() => setSelectedSurveyForWorkspace(null)}
        />
      )}

    </div>
  );
};
