import React, { useState } from 'react';
import { 
  Compass, Calendar, Clock, UserCheck, CheckCircle2, 
  XCircle, Upload, Eye, Camera, MapPin, AlertCircle, Plus, 
  Search, Filter, Users, ArrowUpRight, ShieldCheck, RefreshCw, 
  ChevronRight, ArrowRight, UserPlus, FileText, ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SiteSurvey, Employee, SurveyStatus, SurveyAssignmentAudit } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { KpiCard } from '../components/common/KpiCard';

import { TechnicianAvailabilitySection } from '../components/surveys/TechnicianAvailabilitySection';
import { TechnicianScheduleModal } from '../components/surveys/TechnicianScheduleModal';
import { AssignSurveyModal } from '../components/surveys/AssignSurveyModal';
import { RescheduleSurveyModal } from '../components/surveys/RescheduleSurveyModal';
import { SurveyReportViewerModal } from '../components/surveys/SurveyReportViewerModal';
import { ScheduleSurveyModal } from '../components/surveys/ScheduleSurveyModal';
import { CreateQuotationModal } from '../components/sales/CreateQuotationModal';

export const SiteSurveysPage: React.FC = () => {
  const { 
    currentUser, 
    surveys, 
    customers, 
    employees, 
    surveyAssignments, 
    updateSurveyStatus, 
    showToast 
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals state
  const [selectedTechForSchedule, setSelectedTechForSchedule] = useState<Employee | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [surveyForAssign, setSurveyForAssign] = useState<SiteSurvey | null>(null);
  const [selectedLockedTech, setSelectedLockedTech] = useState<Employee | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReassignMode, setIsReassignMode] = useState(false);
  const [prefilledTechId, setPrefilledTechId] = useState<string | undefined>();
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>();
  const [prefilledSlot, setPrefilledSlot] = useState<string | undefined>();

  const [surveyForReschedule, setSurveyForReschedule] = useState<SiteSurvey | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  const [surveyForReportViewer, setSurveyForReportViewer] = useState<SiteSurvey | null>(null);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);

  const [isNewSurveyModalOpen, setIsNewSurveyModalOpen] = useState(false);

  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [selectedCustomerForQuote, setSelectedCustomerForQuote] = useState<string | undefined>();

  // Filtered Surveys
  const filteredSurveys = surveys.filter(s => {
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      s.surveyNumber.toLowerCase().includes(term) ||
      s.customerName.toLowerCase().includes(term) ||
      s.customerPhone.includes(term) ||
      s.customerAddress.toLowerCase().includes(term) ||
      (s.technicianName && s.technicianName.toLowerCase().includes(term));
    return matchesFilter && matchesSearch;
  });

  // KPI calculations
  const totalSurveys = surveys.length;
  const unassignedSurveys = surveys.filter(s => s.status === 'unassigned').length;
  const upcomingSurveys = surveys.filter(s => 
    s.status === 'scheduled' || s.status === 'assigned' || s.status === 'in_progress'
  ).length;
  const approvedSurveys = surveys.filter(s => s.status === 'approved').length;

  // Handlers for modal interactions
  const handleOpenAssign = (survey: SiteSurvey, reassign = false) => {
    setSelectedLockedTech(null);
    setSurveyForAssign(survey);
    setIsReassignMode(reassign);
    setPrefilledTechId(undefined);
    setPrefilledDate(undefined);
    setPrefilledSlot(undefined);
    setIsAssignModalOpen(true);
  };

  const handleOpenReschedule = (survey: SiteSurvey) => {
    setSurveyForReschedule(survey);
    setIsRescheduleModalOpen(true);
  };

  const handleOpenReportViewer = (survey: SiteSurvey) => {
    setSurveyForReportViewer(survey);
    setIsReportViewerOpen(true);
  };

  const handleViewTechnicianSchedule = (tech: Employee) => {
    setSelectedTechForSchedule(tech);
    setIsScheduleModalOpen(true);
  };

  const handleAssignFromTechnicianCard = (tech: Employee) => {
    setSelectedLockedTech(tech);
    setSurveyForAssign(null);
    setIsReassignMode(false);
    setPrefilledDate(undefined);
    setPrefilledSlot(undefined);
    setIsAssignModalOpen(true);
  };

  const handleBookSlotFromSchedule = (tech: Employee, date: string, slot: string) => {
    setSelectedLockedTech(tech);
    setSurveyForAssign(null);
    setIsReassignMode(false);
    setPrefilledDate(date);
    setPrefilledSlot(slot);
    setIsAssignModalOpen(true);
  };

  const handleProceedToQuotation = (survey: SiteSurvey) => {
    setSelectedCustomerForQuote(survey.customerId);
    setIsQuotationModalOpen(true);
  };

  const scrollToTechnicians = () => {
    const el = document.getElementById('survey-technicians-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              Site Survey Coordination Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            Site Survey Operations
          </h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Coordinate technician assignments, schedule rooftop surveys and track engineering approvals.
          </p>
        </div>

        {/* Action Buttons on Right */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            onClick={scrollToTechnicians}
            className="px-3.5 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Users className="w-4 h-4 text-navy" />
            <span>View Technicians</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewSurveyModalOpen(true)}
            className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Survey</span>
          </button>
        </div>
      </div>

      {/* 2. Survey Overview KPI Cards (4 Compact Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Surveys */}
        <KpiCard
          title="Total Surveys"
          value={totalSurveys}
          subValue="Managed by Sales Team"
          icon={Compass}
          iconBgColor="bg-sand-200"
          iconColor="text-navy"
        />

        {/* KPI 2: Unassigned Surveys (Subtle Amber Styling) */}
        <div className={`p-4.5 rounded-card border transition-all ${
          unassignedSurveys > 0 
            ? 'bg-amber-50/70 border-amber/50 shadow-xs ring-1 ring-amber/20' 
            : 'bg-white border-warmGrey/60 shadow-card'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Unassigned Surveys
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber text-charcoal flex items-center justify-center shadow-xs">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal mt-2">
            {unassignedSurveys}
          </div>
          <div className="text-xs text-amber font-semibold mt-0.5">
            {unassignedSurveys > 0 ? '⚠️ Action Required: Allocate Specialist' : 'All surveys assigned'}
          </div>
        </div>

        {/* KPI 3: Upcoming Surveys */}
        <KpiCard
          title="Upcoming Surveys"
          value={upcomingSurveys}
          subValue="Scheduled & In Progress"
          icon={Calendar}
          iconBgColor="bg-navy/10"
          iconColor="text-navy"
        />

        {/* KPI 4: Approved Surveys */}
        <KpiCard
          title="Approved Surveys"
          value={approvedSurveys}
          subValue="Ready for Commercial Quotations"
          icon={ShieldCheck}
          iconBgColor="bg-sage-50"
          iconColor="text-sage"
        />

      </div>

      {/* 3. Engineering Quality Gate Subtle Information Banner */}
      <div className="bg-sand-100 border border-warmGrey rounded-xl p-3.5 flex items-start space-x-3 text-xs shadow-xs">
        <AlertCircle className="w-4 h-4 text-navy mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-charcoal">Engineering Quality Gate:</strong> A solar package quotation can only be finalized after site survey measurements and shadow analysis have been approved by the Engineering Lead.
        </div>
      </div>

      {/* 4. Technician Availability Section */}
      <TechnicianAvailabilitySection
        onViewSchedule={handleViewTechnicianSchedule}
        onAssignSurvey={handleAssignFromTechnicianCard}
      />

      {/* 5. Survey Management Table (Survey Records) */}
      <div className="space-y-3.5">
        
        {/* Table Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-t-xl p-4 border border-warmGrey/60 border-b-0">
          <div>
            <h2 className="text-base font-bold text-charcoal">Survey Records</h2>
            <p className="text-xs text-mutedGrey">
              Rooftop shadow metrics, technician allocations and engineering sign-offs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search survey, customer, phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-sand-50/60 border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-mutedGrey" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-warmGrey rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
              >
                <option value="all">All Statuses ({surveys.length})</option>
                <option value="unassigned">Unassigned ({surveys.filter(s => s.status === 'unassigned').length})</option>
                <option value="assigned">Assigned ({surveys.filter(s => s.status === 'assigned').length})</option>
                <option value="scheduled">Scheduled ({surveys.filter(s => s.status === 'scheduled').length})</option>
                <option value="in_progress">In Progress ({surveys.filter(s => s.status === 'in_progress').length})</option>
                <option value="submitted">Submitted ({surveys.filter(s => s.status === 'submitted').length})</option>
                <option value="approved">Approved ({surveys.filter(s => s.status === 'approved').length})</option>
                <option value="rejected">Rejected ({surveys.filter(s => s.status === 'rejected').length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Surveys Table Surface */}
        <div className="bg-white rounded-b-xl border border-warmGrey/60 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey/80">
                <tr>
                  <th className="py-3 px-4">Survey ID</th>
                  <th className="py-3 px-4">Customer & Location</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Allocated Technician</th>
                  <th className="py-3 px-4">Roof Shadow-Free Area</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                {filteredSurveys.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-mutedGrey text-xs">
                      No site survey records found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSurveys.map(survey => {
                    const isApproved = survey.status === 'approved';
                    const isSubmitted = survey.status === 'submitted';
                    const isUnassigned = survey.status === 'unassigned';
                    const isAssigned = survey.status === 'assigned' || survey.status === 'scheduled';
                    const isInProgress = survey.status === 'in_progress';
                    const isRejected = survey.status === 'rejected';

                    return (
                      <tr key={survey.id} className="hover:bg-sand-50/70 transition-colors">
                        
                        {/* Survey Number */}
                        <td className="py-3.5 px-4 font-mono font-bold text-navy">
                          {survey.surveyNumber}
                        </td>

                        {/* Customer & Location */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-charcoal">{survey.customerName}</div>
                          <div className="text-[11px] text-mutedGrey truncate max-w-[200px]" title={survey.customerAddress}>
                            {survey.customerAddress}
                          </div>
                          <div className="text-[10px] text-mutedGrey">📞 {survey.customerPhone}</div>
                        </td>

                        {/* Scheduled Date & Slot */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-charcoal">
                            {new Date(survey.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-[11px] text-navy font-medium mt-0.5">
                            {survey.timeSlot || new Date(survey.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Allocated Technician */}
                        <td className="py-3.5 px-4">
                          {survey.technicianName ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-sage shrink-0" />
                              <span className="font-bold text-charcoal">{survey.technicianName}</span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">
                              ⚠️ Unassigned
                            </span>
                          )}
                        </td>

                        {/* Roof Shadow-Free Area */}
                        <td className="py-3.5 px-4">
                          {survey.shadowFreeAreaSqm ? (
                            <div>
                              <span className="font-bold text-navy">{survey.shadowFreeAreaSqm} m²</span>
                              <span className="text-[11px] text-mutedGrey ml-1">({survey.roofDirection || 'South'})</span>
                            </div>
                          ) : (
                            <span className="text-mutedGrey italic">Pending Measurement</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={survey.status} />
                        </td>

                        {/* Actions according to Status */}
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          
                          {/* Unassigned Actions */}
                          {isUnassigned && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenAssign(survey, false)}
                                className="px-2.5 py-1 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light transition-colors shadow-2xs"
                              >
                                Assign Tech
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenReportViewer(survey)}
                                className="px-2 py-1 bg-white border border-warmGrey text-charcoal text-xs font-semibold rounded-lg hover:bg-sand-100"
                              >
                                Details
                              </button>
                            </>
                          )}

                          {/* Assigned / Scheduled Actions */}
                          {isAssigned && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReschedule(survey)}
                                className="px-2 py-1 bg-white border border-warmGrey text-charcoal text-xs font-semibold rounded-lg hover:bg-sand-100 transition-colors"
                              >
                                Reschedule
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenAssign(survey, true)}
                                className="px-2 py-1 bg-sand-100 text-charcoal border border-warmGrey text-xs font-semibold rounded-lg hover:bg-sand-200 transition-colors"
                              >
                                Reassign
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenReportViewer(survey)}
                                className="px-2 py-1 bg-white border border-warmGrey text-charcoal text-xs font-semibold rounded-lg hover:bg-sand-100"
                              >
                                Details
                              </button>
                            </>
                          )}

                          {/* In Progress Actions */}
                          {isInProgress && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReportViewer(survey)}
                                className="px-2.5 py-1 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light shadow-2xs"
                              >
                                View Progress
                              </button>
                            </>
                          )}

                          {/* Submitted Actions (View Report / Check Status - NO approve/reject for sales_exec!) */}
                          {isSubmitted && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReportViewer(survey)}
                                className="px-2.5 py-1 bg-amber text-charcoal text-xs font-bold rounded-lg hover:bg-amber-light shadow-2xs"
                              >
                                View Survey Report
                              </button>
                              
                              {/* ONLY if Owner/Admin can approve/reject for backend testing */}
                              {currentUser.role === 'owner_admin' && (
                                <div className="inline-flex space-x-1 ml-1">
                                  <button
                                    onClick={() => updateSurveyStatus(survey.id, 'approved')}
                                    className="px-2 py-1 bg-sage text-white text-xs font-bold rounded-lg hover:bg-sage-dark"
                                    title="Engineering Lead Approval"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => updateSurveyStatus(survey.id, 'rejected', 'Shadow obstruction exceeds allowable limit')}
                                    className="px-2 py-1 bg-terracotta text-white text-xs font-bold rounded-lg hover:bg-terracotta-dark"
                                    title="Engineering Rejection"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          {/* Approved Actions */}
                          {isApproved && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReportViewer(survey)}
                                className="px-2 py-1 bg-white border border-warmGrey text-charcoal text-xs font-semibold rounded-lg hover:bg-sand-100"
                              >
                                Dossier
                              </button>
                              <button
                                type="button"
                                onClick={() => handleProceedToQuotation(survey)}
                                className="px-2.5 py-1 bg-sage text-white text-xs font-bold rounded-lg hover:bg-sage-dark transition-colors shadow-2xs"
                              >
                                Ready for Quote →
                              </button>
                            </>
                          )}

                          {/* Rejected Actions */}
                          {isRejected && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReportViewer(survey)}
                                className="px-2 py-1 bg-terracotta-50 text-terracotta border border-terracotta/40 text-xs font-semibold rounded-lg hover:bg-terracotta-100"
                              >
                                View Rejection
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenAssign(survey, false)}
                                className="px-2 py-1 bg-white border border-warmGrey text-charcoal text-xs font-semibold rounded-lg hover:bg-sand-100"
                              >
                                Re-survey
                              </button>
                            </>
                          )}

                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 6. Recent Survey Activities Section (Compact Feed) */}
      <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal">
            Recent Survey Coordination Activities
          </h3>
          <span className="text-[11px] text-mutedGrey">
            {surveyAssignments.length} Assignment Records
          </span>
        </div>

        <div className="divide-y divide-warmGrey/40 text-xs">
          {surveyAssignments.slice(0, 4).map(audit => (
            <div key={audit.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <span className={`w-2 h-2 rounded-full ${
                  audit.action === 'assigned' ? 'bg-sage' :
                  audit.action === 'reassigned' ? 'bg-amber' : 'bg-navy'
                }`} />
                <div>
                  <span className="font-bold text-charcoal">{audit.technicianName}</span>
                  <span className="text-mutedGrey ml-1.5">
                    {audit.action === 'assigned' ? 'assigned to' : audit.action === 'reassigned' ? 'reassigned to' : 'rescheduled for'}{' '}
                    <strong className="text-navy">{audit.surveyNumber}</strong>
                  </span>
                  {audit.reason && (
                    <span className="text-mutedGrey italic ml-1">("{audit.reason}")</span>
                  )}
                </div>
              </div>
              <div className="text-right text-[11px] text-mutedGrey shrink-0">
                <span>{audit.timeSlot || '10:00 AM'}</span>
                <span className="ml-1.5 font-semibold text-charcoal">
                  by {audit.assignedBy}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}

      {/* 1. Technician Schedule Modal */}
      <TechnicianScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedTechForSchedule(null);
        }}
        technician={selectedTechForSchedule}
        onBookSlot={handleBookSlotFromSchedule}
      />

      {/* 2. Assign / Reassign Modal */}
      <AssignSurveyModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSurveyForAssign(null);
          setSelectedLockedTech(null);
          setIsReassignMode(false);
        }}
        workflowMode={selectedLockedTech ? 'technician_first' : 'survey_first'}
        lockedTechnician={selectedLockedTech}
        survey={surveyForAssign}
        isReassign={isReassignMode}
        initialDate={prefilledDate}
        initialTimeSlot={prefilledSlot}
      />

      {/* 3. Reschedule Modal */}
      <RescheduleSurveyModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSurveyForReschedule(null);
        }}
        survey={surveyForReschedule}
      />

      {/* 4. Survey Report Viewer Modal */}
      <SurveyReportViewerModal
        isOpen={isReportViewerOpen}
        onClose={() => {
          setIsReportViewerOpen(false);
          setSurveyForReportViewer(null);
        }}
        survey={surveyForReportViewer}
        onProceedToQuotation={handleProceedToQuotation}
      />

      {/* 5. Schedule Survey Modal */}
      <ScheduleSurveyModal
        isOpen={isNewSurveyModalOpen}
        onClose={() => {
          setIsNewSurveyModalOpen(false);
          setPrefilledTechId(undefined);
          setPrefilledDate(undefined);
          setPrefilledSlot(undefined);
        }}
        defaultTechnicianId={prefilledTechId}
        defaultDate={prefilledDate}
        defaultSlot={prefilledSlot}
      />

      {/* 6. Create Quotation Modal (when clicking Ready for Quote) */}
      <CreateQuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        defaultCustomerId={selectedCustomerForQuote}
      />

    </div>
  );
};
