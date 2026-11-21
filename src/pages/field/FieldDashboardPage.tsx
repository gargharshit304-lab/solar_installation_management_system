import React, { useState } from 'react';
import { 
  Compass, Calendar, Clock, CheckCircle2, AlertTriangle, 
  MapPin, Phone, ArrowRight, Play, Eye, FileText, 
  UserCheck, Plus, Sparkles, AlertCircle, ChevronRight,
  Shield, Check, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiteSurvey, TechnicianAvailabilityStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SiteSurveyWorkspaceModal } from '../../components/field/SiteSurveyWorkspaceModal';
import { Link, useNavigate } from 'react-router-dom';

export const FieldDashboardPage: React.FC = () => {
  const { 
    currentUser, 
    surveys, 
    claimSurvey, 
    startSurvey,
    updateTechnicianAvailability,
    showToast 
  } = useApp();
  const navigate = useNavigate();

  const [selectedSurveyForWorkspace, setSelectedSurveyForWorkspace] = useState<SiteSurvey | null>(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [currentAvailability, setCurrentAvailability] = useState<TechnicianAvailabilityStatus>('available');

  // Filter surveys assigned to current engineer (e.g. Suresh More)
  const myAssignedSurveys = surveys.filter(s => 
    !s.technicianName || 
    s.technicianName.includes(currentUser.name.split(' ')[0]) || 
    s.technicianId === currentUser.id ||
    currentUser.role === 'owner_admin'
  );

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. KPI 1: Assigned Surveys (Active)
  const activeAssignedCount = myAssignedSurveys.filter(s => 
    s.status === 'assigned' || s.status === 'scheduled' || s.status === 'in_progress'
  ).length;

  // 2. KPI 2: Today's Visits
  const todayVisits = myAssignedSurveys.filter(s => 
    s.scheduledDate.startsWith(todayStr) || s.status === 'in_progress'
  );
  const todayVisitsCount = todayVisits.length;

  // 3. KPI 3: Available Surveys (Unassigned)
  const unassignedSurveys = surveys.filter(s => s.status === 'unassigned');
  const availableSurveysCount = unassignedSurveys.length;

  // 4. KPI 4: Pending Reports (in_progress, draft, or corrections_required)
  const pendingReports = myAssignedSurveys.filter(s => 
    s.status === 'in_progress' || 
    s.isDraft || 
    s.reviewStatus === 'corrections_required'
  );
  const pendingReportsCount = pendingReports.length;

  // Today's assignments list (max 4 records)
  const todayAssignmentsList = [...todayVisits, ...myAssignedSurveys.filter(s => !todayVisits.includes(s) && (s.status === 'assigned' || s.status === 'in_progress'))].slice(0, 4);

  // Available surveys preview (max 3 records)
  const availableSurveysPreview = unassignedSurveys.slice(0, 3);

  // Reusable Card Style with Warm Amber Shadow
  const cardContainerClass = "bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all duration-200";

  const handleUpdateAvailability = (status: TechnicianAvailabilityStatus) => {
    setCurrentAvailability(status);
    updateTechnicianAvailability(currentUser.id, status);
    setIsAvailabilityModalOpen(false);
  };

  const handleClaim = (surveyId: string) => {
    const res = claimSurvey(surveyId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Section */}
      <div className={`${cardContainerClass} p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
                Field Operations Workspace
              </span>
            </div>
            <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1.5">
              Field Operations
            </h1>
            <p className="text-sm font-semibold text-navy mt-1">
              Welcome back, {currentUser.name}!
            </p>
            <p className="text-xs text-mutedGrey mt-0.5">
              Manage your survey assignments, site visits and technical reports.
            </p>

            {/* Performance Ribbon */}
            <div className="flex flex-wrap items-center gap-2.5 mt-3.5 text-xs">
              <div className="px-3 py-1 rounded-lg bg-sand-100 text-charcoal font-semibold border border-warmGrey/60">
                📅 {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              
              {/* Availability Status Badge */}
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-sand-100 border border-warmGrey/60">
                <span className={`w-2 h-2 rounded-full ${
                  currentAvailability === 'available' ? 'bg-sage' :
                  currentAvailability === 'on_site' ? 'bg-amber' :
                  currentAvailability === 'assigned' ? 'bg-navy' : 'bg-terracotta'
                }`} />
                <span className="text-xs font-bold text-charcoal capitalize">
                  Status: {currentAvailability.replace('_', ' ')}
                </span>
              </div>

              <div className="px-3 py-1 rounded-lg bg-sage-50 text-sage font-bold border border-sage/30">
                ✓ {myAssignedSurveys.filter(s => s.status === 'approved').length} Reports Approved
              </div>
              <div className="px-3 py-1 rounded-lg bg-amber-50 text-amber font-bold border border-amber/30">
                ⚡ {activeAssignedCount} Active Assignments
              </div>
            </div>
          </div>

          {/* Quick Actions (Exactly 2 prominent buttons) */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/field/available-surveys"
              className="px-4 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-all shadow-sm flex items-center space-x-2 active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-amber" />
              <span>View Available Surveys</span>
            </Link>

            <button
              onClick={() => setIsAvailabilityModalOpen(true)}
              className="px-4 py-2.5 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-all shadow-xs flex items-center space-x-2 active:scale-[0.98]"
            >
              <UserCheck className="w-4 h-4 text-navy" />
              <span>Update Availability</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Exactly Four KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Assigned Surveys */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">
                Assigned Surveys
              </p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">
                {activeAssignedCount}
              </h3>
              <p className="text-xs text-mutedGrey mt-1">
                Active in your technical queue
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sand-200/70 text-navy flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-navy font-semibold">
              Field inspection pipeline
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sand-100 text-charcoal border border-warmGrey/60">
              Allocated
            </span>
          </div>
        </div>

        {/* KPI 2: Today's Visits */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">
                Today's Visits
              </p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">
                {todayVisitsCount}
              </h3>
              <p className="text-xs text-mutedGrey mt-1">
                Scheduled rooftop appointments
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-mutedGrey">
              {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              todayVisitsCount > 0 ? 'bg-amber-50 text-amber border-amber/30' : 'bg-sand-100 text-mutedGrey border-warmGrey/60'
            }`}>
              {todayVisitsCount > 0 ? 'Site Active' : 'No Visits'}
            </span>
          </div>
        </div>

        {/* KPI 3: Available Surveys */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">
                Available Surveys
              </p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">
                {availableSurveysCount}
              </h3>
              <p className="text-xs text-mutedGrey mt-1">
                Eligible for self-assignment
              </p>
            </div>
            <div className="p-3 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-mutedGrey">
              Pune & surrounding zones
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sand-100 text-navy border border-warmGrey/60">
              Open Pool
            </span>
          </div>
        </div>

        {/* KPI 4: Pending Reports */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">
                Pending Reports
              </p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">
                {pendingReportsCount}
              </h3>
              <p className="text-xs text-mutedGrey mt-1">
                Drafts or revisions required
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sage-50 text-sage flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-mutedGrey">
              Awaiting submission to Eng Lead
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              pendingReportsCount > 0 ? 'bg-terracotta-50 text-terracotta border-terracotta/30' : 'bg-sage-50 text-sage border-sage/30'
            }`}>
              {pendingReportsCount > 0 ? `${pendingReportsCount} Action Req` : 'All Clear'}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Primary Section: Today's Assignments */}
      <div className={`${cardContainerClass} p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-warmGrey/60 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-navy" />
              <h2 className="text-base font-bold text-charcoal">Today's Assignments</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sand-100 text-navy border border-warmGrey">
                {todayAssignmentsList.length} Scheduled Visits
              </span>
            </div>
            <p className="text-xs text-mutedGrey mt-0.5">
              Priority site visits scheduled for you. Open assignment to start inspection or complete technical measurements.
            </p>
          </div>

          <Link
            to="/field/assignments"
            className="text-xs text-navy font-semibold hover:underline flex items-center space-x-1"
          >
            <span>View All Assignments ({myAssignedSurveys.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Assignment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayAssignmentsList.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-xs text-mutedGrey">
              No site visits scheduled for today. Check Available Surveys below to claim open requests.
            </div>
          ) : (
            todayAssignmentsList.map(s => {
              const isScheduled = s.status === 'scheduled';
              const isAssigned = s.status === 'assigned';
              const isInProgress = s.status === 'in_progress';
              const isSubmitted = s.status === 'submitted';
              const isApproved = s.status === 'approved';

              return (
                <div 
                  key={s.id} 
                  className="p-4 rounded-xl border border-warmGrey/80 bg-sand-50/50 hover:bg-white hover:border-navy/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-navy">{s.surveyNumber}</span>
                        <h4 className="text-sm font-bold text-charcoal mt-0.5">{s.customerName}</h4>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-xs text-mutedGrey">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-amber shrink-0" />
                        <span className="truncate">{s.customerAddress}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-navy shrink-0" />
                        <span>{s.timeSlot || '10:00 AM - 12:00 PM'}</span>
                      </div>
                    </div>

                    {s.instructions && (
                      <p className="text-[11px] text-charcoal bg-white p-2 rounded-lg border border-warmGrey/50 line-clamp-2">
                        <strong>Site Notes:</strong> {s.instructions}
                      </p>
                    )}
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="pt-2 border-t border-warmGrey/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-mutedGrey">
                      {s.totalRoofAreaSqm ? `${s.totalRoofAreaSqm} sq.m estimated` : 'Measurements pending'}
                    </span>

                    <div className="flex items-center space-x-2">
                      {/* Scheduled / Assigned actions */}
                      {(isScheduled || isAssigned) && (
                        <button
                          onClick={() => setSelectedSurveyForWorkspace(s)}
                          className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light flex items-center space-x-1 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start Survey</span>
                        </button>
                      )}

                      {/* In Progress actions */}
                      {isInProgress && (
                        <button
                          onClick={() => setSelectedSurveyForWorkspace(s)}
                          className="px-3 py-1.5 bg-amber text-charcoal text-xs font-bold rounded-lg hover:bg-amber-light flex items-center space-x-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Continue Survey</span>
                        </button>
                      )}

                      {/* Submitted / Approved actions */}
                      {(isSubmitted || isApproved) && (
                        <button
                          onClick={() => setSelectedSurveyForWorkspace(s)}
                          className="px-3 py-1.5 bg-white border border-warmGrey text-charcoal text-xs font-semibold rounded-lg hover:bg-sand-100 flex items-center space-x-1 transition-colors"
                        >
                          <Eye className="w-3 h-3 text-navy" />
                          <span>View Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Bottom Grid: Available Surveys & Pending Technical Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Available Surveys Pool */}
        <div className={`${cardContainerClass} p-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-amber" />
                <h2 className="text-sm font-bold text-charcoal">Available Surveys (Self-Claim)</h2>
              </div>
              <p className="text-xs text-mutedGrey mt-0.5">
                Unassigned survey requests in your working territory
              </p>
            </div>
            <Link
              to="/field/available-surveys"
              className="text-xs font-semibold text-navy hover:underline"
            >
              View All ({availableSurveysCount}) →
            </Link>
          </div>

          <div className="space-y-3">
            {availableSurveysPreview.length === 0 ? (
              <div className="text-center py-6 text-xs text-mutedGrey">
                No unassigned surveys currently available in the pool.
              </div>
            ) : (
              availableSurveysPreview.map(s => (
                <div key={s.id} className="p-3.5 rounded-xl border border-warmGrey/70 bg-sand-50/50 hover:bg-white transition-all text-xs flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-navy">{s.surveyNumber}</span>
                      <h4 className="font-bold text-charcoal mt-0.5">{s.customerName}</h4>
                      <p className="text-[11px] text-mutedGrey truncate max-w-xs">{s.customerAddress}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sand-200 text-charcoal border border-warmGrey/60">
                      {s.distanceKm ? `${s.distanceKm} km away` : 'Pune Zone'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-warmGrey/40 text-[11px]">
                    <span className="text-mutedGrey">
                      📅 {new Date(s.scheduledDate).toLocaleDateString()} ({s.timeSlot || '10:00 AM - 12:00 PM'})
                    </span>
                    <button
                      onClick={() => handleClaim(s.id)}
                      className="px-3 py-1 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-all shadow-2xs"
                    >
                      Claim Survey
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Technical Reports & Revisions */}
        <div className={`${cardContainerClass} p-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-navy" />
                <h2 className="text-sm font-bold text-charcoal">Pending Technical Reports</h2>
              </div>
              <p className="text-xs text-mutedGrey mt-0.5">
                Drafts in progress and reports requiring revisions
              </p>
            </div>
            <Link
              to="/field/reports"
              className="text-xs font-semibold text-navy hover:underline"
            >
              All Reports ({myAssignedSurveys.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {pendingReports.length === 0 ? (
              <div className="text-center py-6 text-xs text-mutedGrey">
                No draft or revision-pending reports. All site inspections submitted!
              </div>
            ) : (
              pendingReports.map(s => (
                <div key={s.id} className="p-3.5 rounded-xl border border-warmGrey/70 bg-sand-50/50 hover:bg-white transition-all text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-navy">{s.surveyNumber}</span>
                      <span className="font-bold text-charcoal ml-2">{s.customerName}</span>
                    </div>
                    {s.reviewStatus === 'corrections_required' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">
                        Corrections Required
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sand-200 text-charcoal border border-warmGrey/60">
                        Draft In Progress
                      </span>
                    )}
                  </div>

                  {s.correctionsRequestedNotes && (
                    <p className="text-[11px] text-amber-dark bg-amber-50/70 p-2 rounded-lg border border-amber/30">
                      <strong>Lead Engineer Note:</strong> {s.correctionsRequestedNotes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-warmGrey/40 text-[11px]">
                    <span className="text-mutedGrey">
                      Area measured: {s.shadowFreeAreaSqm ? `${s.shadowFreeAreaSqm} sq.m` : 'Incomplete'}
                    </span>
                    <button
                      onClick={() => setSelectedSurveyForWorkspace(s)}
                      className="px-3 py-1 bg-white border border-warmGrey hover:bg-sand-100 text-charcoal font-semibold rounded-lg transition-colors"
                    >
                      Continue Report →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Availability Status Quick Modal */}
      {isAvailabilityModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-charcoal shadow-dropdown border border-warmGrey animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-charcoal mb-1">Update Field Availability</h3>
            <p className="text-xs text-mutedGrey mb-4">Set your active field status for survey allocations and self-claiming.</p>

            <div className="space-y-2 text-xs">
              {[
                { status: 'available', label: 'Available', desc: 'Ready for site survey allocations and claims' },
                { status: 'on_site', label: 'On Site', desc: 'Currently conducting roof inspection at customer property' },
                { status: 'assigned', label: 'Assigned', desc: 'Committed to scheduled appointments' },
                { status: 'unavailable', label: 'Unavailable', desc: 'Off-duty or attending vehicle maintenance' }
              ].map(opt => (
                <button
                  key={opt.status}
                  onClick={() => handleUpdateAvailability(opt.status as any)}
                  className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition-colors ${
                    currentAvailability === opt.status ? 'bg-navy text-white border-navy' : 'bg-sand-50 border-warmGrey hover:bg-sand-100'
                  }`}
                >
                  <div>
                    <span className="font-bold block">{opt.label}</span>
                    <span className={`text-[11px] ${currentAvailability === opt.status ? 'text-sand' : 'text-mutedGrey'}`}>{opt.desc}</span>
                  </div>
                  {currentAvailability === opt.status && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-warmGrey/60 flex justify-end">
              <button
                onClick={() => setIsAvailabilityModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-mutedGrey hover:text-charcoal"
              >
                Cancel
              </button>
            </div>
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
