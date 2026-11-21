import React, { useState } from 'react';
import { 
  FileText, Search, Filter, Download, Eye, Edit3, 
  AlertTriangle, CheckCircle2, XCircle, Clock, ChevronRight
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

  // Filter surveys for current technician
  const mySurveys = surveys.filter(s => 
    !s.technicianName || 
    s.technicianName.includes(currentUser.name.split(' ')[0]) || 
    s.technicianId === currentUser.id ||
    currentUser.role === 'owner_admin'
  );

  // Tab filtering
  const filteredReports = mySurveys.filter(s => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = s.surveyNumber.toLowerCase().includes(term) ||
      s.customerName.toLowerCase().includes(term) ||
      s.customerAddress.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'draft') return s.isDraft || s.status === 'in_progress';
    if (activeTab === 'submitted') return s.status === 'submitted' && s.reviewStatus !== 'corrections_required';
    if (activeTab === 'corrections_required') return s.reviewStatus === 'corrections_required';
    if (activeTab === 'approved') return s.status === 'approved';
    if (activeTab === 'rejected') return s.status === 'rejected';
    return true;
  });

  const cardContainerClass = "bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all duration-200";

  const handleDownloadPDF = (surveyNum: string) => {
    showToast(`Generating certified PDF inspection report for ${surveyNum}...`, 'info');
  };

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
            Audit trail of rooftop measurements, shadow analyses, and Engineering Lead approval decisions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-sand-100 text-charcoal font-semibold border border-warmGrey">
            Total Reports: <strong>{mySurveys.length}</strong>
          </span>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className={`${cardContainerClass} p-5 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Subtabs */}
          <div className="flex space-x-1.5 border-b border-warmGrey/60 pb-1 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'all' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              All ({mySurveys.length})
            </button>

            <button
              onClick={() => setActiveTab('draft')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'draft' ? 'bg-amber text-charcoal' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Drafts ({mySurveys.filter(s => s.isDraft || s.status === 'in_progress').length})
            </button>

            <button
              onClick={() => setActiveTab('submitted')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'submitted' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Under Review ({mySurveys.filter(s => s.status === 'submitted' && s.reviewStatus !== 'corrections_required').length})
            </button>

            <button
              onClick={() => setActiveTab('corrections_required')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'corrections_required' ? 'bg-terracotta text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Revisions Needed ({mySurveys.filter(s => s.reviewStatus === 'corrections_required').length})
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'approved' ? 'bg-sage text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Approved ({mySurveys.filter(s => s.status === 'approved').length})
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'rejected' ? 'bg-terracotta text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Rejected ({mySurveys.filter(s => s.status === 'rejected').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72 text-xs">
            <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search survey #, customer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto border border-warmGrey/60 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-2.5 px-3">Survey ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Site Location</th>
                <th className="py-2.5 px-3">Shadow-Free Area</th>
                <th className="py-2.5 px-3">Review Status</th>
                <th className="py-2.5 px-3">Engineering Reviewer</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-mutedGrey">
                    No technical reports matching this filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map(s => (
                  <tr 
                    key={s.id} 
                    className="hover:bg-sand-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedSurveyForWorkspace(s)}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-navy">
                      {s.surveyNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-charcoal">
                      {s.customerName}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-mutedGrey">
                      {s.customerAddress}
                    </td>
                    <td className="py-2.5 px-3">
                      {s.shadowFreeAreaSqm ? (
                        <span className="font-bold text-navy">{s.shadowFreeAreaSqm} sq.m</span>
                      ) : (
                        <span className="text-mutedGrey italic">Incomplete</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {s.reviewStatus === 'corrections_required' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">
                          Revisions Needed
                        </span>
                      ) : s.status === 'approved' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage border border-sage/30 flex items-center w-fit space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      ) : s.status === 'rejected' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-50 text-terracotta border border-terracotta/30">
                          Rejected
                        </span>
                      ) : s.isDraft || s.status === 'in_progress' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sand-200 text-charcoal border border-warmGrey/60">
                          Draft
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sand-100 text-navy border border-warmGrey">
                          Under Review
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-mutedGrey">
                      {s.engineeringApproverName || 'Engineering Lead (Pending)'}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1" onClick={e => e.stopPropagation()}>
                      {s.reviewStatus === 'corrections_required' ? (
                        <button
                          onClick={() => setSelectedSurveyForWorkspace(s)}
                          className="px-2.5 py-1 bg-amber text-charcoal text-xs font-bold rounded-lg hover:bg-amber-light"
                        >
                          Revise & Resubmit
                        </button>
                      ) : s.status === 'approved' ? (
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedSurveyForWorkspace(s)}
                            className="px-2 py-1 bg-white border border-warmGrey hover:bg-sand-100 text-charcoal text-xs font-semibold rounded-lg"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(s.surveyNumber)}
                            className="p-1 bg-sand-100 hover:bg-sand-200 text-navy rounded-lg"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedSurveyForWorkspace(s)}
                          className="px-2.5 py-1 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
                        >
                          {s.isDraft ? 'Edit Draft' : 'View'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
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
