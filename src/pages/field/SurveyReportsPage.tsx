import React, { useState } from 'react';
import { 
  FileText, Search, Filter, Download, Eye, Edit3, 
  AlertTriangle, CheckCircle2, XCircle, Clock, ChevronRight,
  UserCheck, ShieldCheck, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiteSurvey } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SiteSurveyWorkspaceModal } from '../../components/field/SiteSurveyWorkspaceModal';

export const SurveyReportsPage: React.FC = () => {
  const { currentUser, surveys, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'submitted' | 'corrections_required' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurveyForWorkspace, setSelectedSurveyForWorkspace] = useState<SiteSurvey | null>(null);

  // Filter surveys for current technician or show all if manager/owner
  const isManagerOrAdmin = currentUser.role === 'owner_admin' || currentUser.role === 'engineering_lead';
  const mySurveys = surveys.filter(s => 
    isManagerOrAdmin ||
    !s.technicianName || 
    s.technicianName.includes(currentUser.name.split(' ')[0]) || 
    s.technicianId === currentUser.id
  );

  // Tab filtering
  const filteredReports = mySurveys.filter(s => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = s.surveyNumber.toLowerCase().includes(term) ||
      s.customerName.toLowerCase().includes(term) ||
      s.customerAddress.toLowerCase().includes(term) ||
      (s.assignedReviewerName && s.assignedReviewerName.toLowerCase().includes(term)) ||
      (s.assignedApproverName && s.assignedApproverName.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'draft') return s.isDraft || s.status === 'in_progress';
    if (activeTab === 'submitted') return s.status === 'submitted' && s.reviewStatus !== 'corrections_required';
    if (activeTab === 'corrections_required') return s.reviewStatus === 'corrections_required' || s.reviewStatus === 'revisions_required';
    if (activeTab === 'approved') return s.status === 'approved';
    if (activeTab === 'rejected') return s.status === 'rejected';
    return true;
  });

  const cardContainerClass = "bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all duration-200";

  const handleDownloadPDF = (surveyNum: string) => {
    showToast(`Generating certified PDF inspection report for ${surveyNum}...`, 'info');
  };

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
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage border border-sage/30 flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Approved</span>
        </span>
      );
    }
    if (s.status === 'rejected') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-50 text-terracotta border border-terracotta/30">
          Rejected
        </span>
      );
    }
    if (s.reviewStatus === 'recommend_approval' || s.approvalStatus === 'pending_approval' || s.approvalStatus === 'awaiting_approval') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">
          Awaiting Sign-Off
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sand-100 text-mutedGrey border border-warmGrey">
        Awaiting Review
      </span>
    );
  };

  const correctionsCount = mySurveys.filter(s => s.reviewStatus === 'corrections_required' || s.reviewStatus === 'revisions_required').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`${cardContainerClass} p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-navy" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              Feasibility Engineering Reports
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            Technical Survey Reports
          </h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Audit trail of rooftop measurements, shadow analyses, reviewer verification, and Engineering Lead approval decisions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-sand-100 text-charcoal font-semibold border border-warmGrey">
            Total Reports: <strong>{mySurveys.length}</strong>
          </span>
          {correctionsCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber font-bold border border-amber/40 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{correctionsCount} Revisions Pending</span>
            </span>
          )}
        </div>
      </div>

      {/* Revisions Required Alert Banner */}
      {correctionsCount > 0 && activeTab === 'corrections_required' && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber/40 shadow-xs flex items-start space-x-3 text-xs text-charcoal">
          <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-charcoal">Action Required: Engineering Requested Corrections</h4>
            <p className="text-mutedGrey leading-relaxed">
              The Lead Design Engineer returned the surveys below for field re-measurement, photo verification, or cable drop adjustments. Click <strong>Revise & Resubmit</strong> to update parameters and submit version 2.
            </p>
          </div>
        </div>
      )}

      {/* Tabs and Search Controls */}
      <div className={`${cardContainerClass} p-5 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Subtabs */}
          <div className="flex space-x-1.5 border-b border-warmGrey/60 pb-1 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'all' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              All ({mySurveys.length})
            </button>

            <button
              onClick={() => setActiveTab('draft')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'draft' ? 'bg-amber text-charcoal' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Drafts ({mySurveys.filter(s => s.isDraft || s.status === 'in_progress').length})
            </button>

            <button
              onClick={() => setActiveTab('submitted')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'submitted' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Under Review ({mySurveys.filter(s => s.status === 'submitted' && s.reviewStatus !== 'corrections_required').length})
            </button>

            <button
              onClick={() => setActiveTab('corrections_required')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                activeTab === 'corrections_required' ? 'bg-terracotta text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              <span>Revisions Needed</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {correctionsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'approved' ? 'bg-sage text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Approved ({mySurveys.filter(s => s.status === 'approved').length})
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'rejected' ? 'bg-terracotta text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Rejected ({mySurveys.filter(s => s.status === 'rejected').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72 text-xs shrink-0">
            <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search survey #, customer, reviewer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>

        {/* Reports Table with Exact Columns from Section 9 */}
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
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-mutedGrey">
                    No technical reports matching this filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map(s => {
                  const reviewerDisplay = s.assignedReviewerName || 'Unassigned';
                  const approverDisplay = s.approvedByName || s.assignedApproverName || 'Awaiting Assignment';
                  const submittedDate = s.submittedAt || (s.scheduledDate ? s.scheduledDate.split('T')[0] : '2026-11-20');
                  const isCorrections = s.reviewStatus === 'corrections_required' || s.reviewStatus === 'revisions_required';

                  return (
                    <tr 
                      key={s.id} 
                      className={`hover:bg-sand-50/70 transition-colors cursor-pointer ${
                        isCorrections ? 'bg-amber-50/30' : ''
                      }`}
                      onClick={() => setSelectedSurveyForWorkspace(s)}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-navy whitespace-nowrap">
                        {s.surveyNumber}
                        {s.version && s.version > 1 && (
                          <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber text-charcoal">
                            v{s.version}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-charcoal whitespace-nowrap">
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
                        {isCorrections ? (
                          <button
                            type="button"
                            onClick={() => setSelectedSurveyForWorkspace(s)}
                            className="px-2.5 py-1 bg-amber text-charcoal text-xs font-bold rounded-lg hover:bg-amber-light shadow-2xs flex items-center space-x-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Revise & Resubmit</span>
                          </button>
                        ) : s.status === 'approved' ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => setSelectedSurveyForWorkspace(s)}
                              className="px-2 py-1 bg-white border border-warmGrey hover:bg-sand-100 text-charcoal text-xs font-semibold rounded-lg"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(s.surveyNumber)}
                              className="p-1 bg-sand-100 hover:bg-sand-200 text-navy rounded-lg"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedSurveyForWorkspace(s)}
                            className="px-2.5 py-1 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
                          >
                            {s.isDraft ? 'Edit Draft' : 'View'}
                          </button>
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
