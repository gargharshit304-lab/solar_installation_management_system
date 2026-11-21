import React, { useState } from 'react';
import { 
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, 
  XCircle, Search, Compass, Eye, MapPin, Calendar, 
  FileText, ChevronRight, UserCheck, UserPlus, RefreshCw,
  Send, AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiteSurvey } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EngineeringReviewModal } from './EngineeringReviewModal';
import { AssignReviewerApproverModal } from '../../components/surveys/AssignReviewerApproverModal';

export type QueueTabType = 
  | 'newly_submitted'
  | 'assigned_to_me'
  | 'under_review'
  | 'revisions_required'
  | 'resubmitted'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected';

export const EngineeringDashboardPage: React.FC = () => {
  const { currentUser, surveys } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurveyForReview, setSelectedSurveyForReview] = useState<SiteSurvey | null>(null);
  const [selectedSurveyForAssign, setSelectedSurveyForAssign] = useState<SiteSurvey | null>(null);
  const [assignModalMode, setAssignModalMode] = useState<'reviewer' | 'approver' | 'both'>('both');
  const [activeQueue, setActiveQueue] = useState<QueueTabType>('newly_submitted');

  // Categorize surveys across 8 queues
  const newlySubmittedSurveys = surveys.filter(s => 
    s.status === 'submitted' && 
    (!s.reviewStatus || s.reviewStatus === 'submitted' || s.reviewStatus === 'unassigned' || !s.assignedReviewerId)
  );

  const assignedToMeSurveys = surveys.filter(s => 
    s.status === 'submitted' && (
      s.assignedReviewerId === currentUser.id || 
      s.assignedApproverId === currentUser.id ||
      (s.assignedReviewerName && s.assignedReviewerName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])) ||
      (s.assignedApproverName && s.assignedApproverName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]))
    )
  );

  const underReviewSurveys = surveys.filter(s => 
    s.status === 'submitted' && 
    (s.reviewStatus === 'under_review' || s.reviewStatus === 'in_review')
  );

  const revisionsRequiredSurveys = surveys.filter(s => 
    s.reviewStatus === 'corrections_required' || s.reviewStatus === 'revisions_required'
  );

  const resubmittedSurveys = surveys.filter(s => 
    s.status === 'submitted' && s.reviewStatus === 'resubmitted'
  );

  const awaitingApprovalSurveys = surveys.filter(s => 
    s.status === 'submitted' && 
    (s.reviewStatus === 'recommend_approval' || s.approvalStatus === 'pending_approval' || s.approvalStatus === 'awaiting_approval')
  );

  const approvedSurveys = surveys.filter(s => s.status === 'approved');
  const rejectedSurveys = surveys.filter(s => s.status === 'rejected');

  const cardContainerClass = "bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all duration-200";

  // Active list based on queue tab
  const getActiveList = () => {
    switch (activeQueue) {
      case 'newly_submitted': return newlySubmittedSurveys;
      case 'assigned_to_me': return assignedToMeSurveys;
      case 'under_review': return underReviewSurveys;
      case 'revisions_required': return revisionsRequiredSurveys;
      case 'resubmitted': return resubmittedSurveys;
      case 'awaiting_approval': return awaitingApprovalSurveys;
      case 'approved': return approvedSurveys;
      case 'rejected': return rejectedSurveys;
      default: return newlySubmittedSurveys;
    }
  };

  const filteredList = getActiveList().filter(s => {
    const term = searchQuery.toLowerCase();
    return s.surveyNumber.toLowerCase().includes(term) ||
      s.customerName.toLowerCase().includes(term) ||
      s.customerAddress.toLowerCase().includes(term) ||
      (s.technicianName && s.technicianName.toLowerCase().includes(term)) ||
      (s.assignedReviewerName && s.assignedReviewerName.toLowerCase().includes(term)) ||
      (s.assignedApproverName && s.assignedApproverName.toLowerCase().includes(term));
  });

  const getReviewStatusBadge = (status?: string) => {
    switch (status) {
      case 'corrections_required':
      case 'revisions_required':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">Corrections Required</span>;
      case 'in_review':
      case 'under_review':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy/10 text-navy border border-navy/20">In Review</span>;
      case 'resubmitted':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Resubmitted</span>;
      case 'recommend_approval':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage border border-sage/30">Recommended: Approve</span>;
      case 'recommend_rejection':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-50 text-terracotta border border-terracotta/30">Recommended: Reject</span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage border border-sage/30">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-50 text-terracotta border border-terracotta/30">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sand-100 text-charcoal border border-warmGrey">Pending Review</span>;
    }
  };

  const getApprovalStatusBadge = (s: SiteSurvey) => {
    if (s.status === 'approved') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage border border-sage/30">Approved</span>;
    }
    if (s.status === 'rejected') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-50 text-terracotta border border-terracotta/30">Rejected</span>;
    }
    if (s.reviewStatus === 'recommend_approval' || s.approvalStatus === 'pending_approval' || s.approvalStatus === 'awaiting_approval') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">Awaiting Sign-Off</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sand-100 text-mutedGrey border border-warmGrey">Awaiting Review</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`${cardContainerClass} p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-navy" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              Engineering Review & Approval Gateway
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            Engineering Feasibility Queue
          </h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Strict separation of review and approval responsibilities. Verify rooftop geometries, shadow analysis, and single-line diagrams before commercial proposal release.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-sand-100 text-charcoal font-semibold border border-warmGrey">
            Signed in: <strong>{currentUser.name}</strong> ({currentUser.roleTitle || currentUser.role})
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-sage text-white text-[10px] font-bold">
            Feasibility Gateway
          </span>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div 
          onClick={() => setActiveQueue('newly_submitted')}
          className={`${cardContainerClass} p-5 flex flex-col justify-between cursor-pointer ${
            activeQueue === 'newly_submitted' ? 'ring-2 ring-navy' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">Newly Submitted</p>
              <h3 className="text-3xl font-bold text-navy mt-2 tracking-tight">{newlySubmittedSurveys.length}</h3>
              <p className="text-xs text-mutedGrey mt-1">Awaiting reviewer assignment</p>
            </div>
            <div className="p-3 rounded-xl bg-navy/10 text-navy">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-navy font-semibold">Triage Queue</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sand-100 text-navy border border-warmGrey">
              {newlySubmittedSurveys.length} Unassigned
            </span>
          </div>
        </div>

        <div 
          onClick={() => setActiveQueue('assigned_to_me')}
          className={`${cardContainerClass} p-5 flex flex-col justify-between cursor-pointer ${
            activeQueue === 'assigned_to_me' ? 'ring-2 ring-navy' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">Assigned to Me</p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">{assignedToMeSurveys.length}</h3>
              <p className="text-xs text-mutedGrey mt-1">Your pending review/approvals</p>
            </div>
            <div className="p-3 rounded-xl bg-sand-100 text-charcoal">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-charcoal font-semibold">My Workload</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sand-100 text-charcoal border border-warmGrey">
              Action Required
            </span>
          </div>
        </div>

        <div 
          onClick={() => setActiveQueue('revisions_required')}
          className={`${cardContainerClass} p-5 flex flex-col justify-between cursor-pointer ${
            activeQueue === 'revisions_required' ? 'ring-2 ring-amber' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">Revisions Required</p>
              <h3 className="text-3xl font-bold text-amber mt-2 tracking-tight">{revisionsRequiredSurveys.length}</h3>
              <p className="text-xs text-mutedGrey mt-1">Returned to field technician</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-mutedGrey">Corrections in progress</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber border border-amber/30">
              With Field
            </span>
          </div>
        </div>

        <div 
          onClick={() => setActiveQueue('awaiting_approval')}
          className={`${cardContainerClass} p-5 flex flex-col justify-between cursor-pointer ${
            activeQueue === 'awaiting_approval' ? 'ring-2 ring-sage' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">Final Approval Ready</p>
              <h3 className="text-3xl font-bold text-sage mt-2 tracking-tight">{awaitingApprovalSurveys.length}</h3>
              <p className="text-xs text-mutedGrey mt-1">Reviewed; awaiting Lead sign-off</p>
            </div>
            <div className="p-3 rounded-xl bg-sage-50 text-sage">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-sage font-semibold">Sign-Off Stage</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-sage border border-sage/30">
              Lead Only
            </span>
          </div>
        </div>

      </div>

      {/* 8-Tab Queue Workspace */}
      <div className={`${cardContainerClass} p-5 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Subtabs for all 8 queues */}
          <div className="flex space-x-1 border-b border-warmGrey/60 pb-1 text-xs overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveQueue('newly_submitted')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                activeQueue === 'newly_submitted' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              <span>Newly Submitted</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {newlySubmittedSurveys.length}
              </span>
            </button>

            <button
              onClick={() => setActiveQueue('assigned_to_me')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                activeQueue === 'assigned_to_me' ? 'bg-charcoal text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              <span>Assigned to Me</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {assignedToMeSurveys.length}
              </span>
            </button>

            <button
              onClick={() => setActiveQueue('under_review')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                activeQueue === 'under_review' ? 'bg-navy/80 text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              <span>Under Review</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {underReviewSurveys.length}
              </span>
            </button>

            <button
              onClick={() => setActiveQueue('revisions_required')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                activeQueue === 'revisions_required' ? 'bg-amber text-charcoal' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              <span>Revisions Required</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-charcoal/10">
                {revisionsRequiredSurveys.length}
              </span>
            </button>

            <button
              onClick={() => setActiveQueue('resubmitted')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                activeQueue === 'resubmitted' ? 'bg-purple-700 text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              <span>Resubmitted</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {resubmittedSurveys.length}
              </span>
            </button>

            <button
              onClick={() => setActiveQueue('awaiting_approval')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                activeQueue === 'awaiting_approval' ? 'bg-sage text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              <span>Awaiting Final Approval</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {awaitingApprovalSurveys.length}
              </span>
            </button>

            <button
              onClick={() => setActiveQueue('approved')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                activeQueue === 'approved' ? 'bg-sage-dark text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              <span>Approved</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {approvedSurveys.length}
              </span>
            </button>

            <button
              onClick={() => setActiveQueue('rejected')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                activeQueue === 'rejected' ? 'bg-terracotta text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              <span>Rejected</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {rejectedSurveys.length}
              </span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72 text-xs shrink-0">
            <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, customer, engineer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>

        {/* Queue Table with Explicit Reviewer and Approver Columns */}
        <div className="overflow-x-auto border border-warmGrey/60 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-2.5 px-3">Survey ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Site Location</th>
                <th className="py-2.5 px-3">Survey Technician</th>
                <th className="py-2.5 px-3">Submitted Date</th>
                <th className="py-2.5 px-3">Assigned Reviewer</th>
                <th className="py-2.5 px-3">Final Approver</th>
                <th className="py-2.5 px-3">Review Status</th>
                <th className="py-2.5 px-3">Approval Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-mutedGrey">
                    No survey reports found in the <strong>{activeQueue.replace(/_/g, ' ')}</strong> queue.
                  </td>
                </tr>
              ) : (
                filteredList.map(s => {
                  const reviewerDisplay = s.assignedReviewerName || 'Unassigned';
                  const approverDisplay = s.approvedByName || s.assignedApproverName || 'Awaiting Assignment';
                  const submittedDate = s.submittedAt || (s.scheduledDate ? s.scheduledDate.split('T')[0] : '2026-11-20');

                  return (
                    <tr 
                      key={s.id} 
                      className="hover:bg-sand-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedSurveyForReview(s)}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-navy whitespace-nowrap">
                        {s.surveyNumber}
                        {s.version && s.version > 1 && (
                          <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber text-charcoal">
                            v{s.version}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-charcoal whitespace-nowrap">
                        {s.customerName}
                      </td>
                      <td className="py-2.5 px-3 max-w-[180px] truncate text-mutedGrey">
                        {s.customerAddress}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-charcoal">{s.technicianName || 'Field Specialist'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-mutedGrey whitespace-nowrap">
                        {submittedDate}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {reviewerDisplay === 'Unassigned' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sand-100 text-mutedGrey border border-warmGrey">
                            Unassigned
                          </span>
                        ) : (
                          <div className="flex items-center space-x-1 font-semibold text-navy">
                            <UserCheck className="w-3.5 h-3.5 text-navy" />
                            <span>{reviewerDisplay}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {approverDisplay === 'Awaiting Assignment' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sand-100 text-mutedGrey border border-warmGrey">
                            Awaiting Assignment
                          </span>
                        ) : (
                          <div className="flex items-center space-x-1 font-semibold text-charcoal">
                            <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                            <span>{approverDisplay}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getReviewStatusBadge(s.reviewStatus)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getApprovalStatusBadge(s)}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSurveyForAssign(s);
                            setAssignModalMode('both');
                          }}
                          className="px-2.5 py-1 bg-white border border-warmGrey text-charcoal hover:bg-sand-100 text-xs font-semibold rounded-lg shadow-2xs"
                          title="Assign Reviewer or Approver"
                        >
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSurveyForReview(s)}
                          className="px-3 py-1 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-2xs"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineering Lead Review Modal */}
      {selectedSurveyForReview && (
        <EngineeringReviewModal
          survey={selectedSurveyForReview}
          isOpen={!!selectedSurveyForReview}
          onClose={() => setSelectedSurveyForReview(null)}
        />
      )}

      {/* Assign Reviewer/Approver Modal */}
      {selectedSurveyForAssign && (
        <AssignReviewerApproverModal
          survey={selectedSurveyForAssign}
          isOpen={!!selectedSurveyForAssign}
          defaultRoleMode={assignModalMode}
          onClose={() => setSelectedSurveyForAssign(null)}
        />
      )}

    </div>
  );
};
