import React, { useState } from 'react';
import { 
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, 
  XCircle, Search, Compass, Eye, MapPin, Calendar, 
  FileText, ChevronRight, UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiteSurvey } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EngineeringReviewModal } from './EngineeringReviewModal';

export const EngineeringDashboardPage: React.FC = () => {
  const { currentUser, surveys } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurveyForReview, setSelectedSurveyForReview] = useState<SiteSurvey | null>(null);
  const [filterTab, setFilterTab] = useState<'pending' | 'corrections' | 'approved' | 'rejected'>('pending');

  // Categorize surveys for Engineering Lead
  const submittedSurveys = surveys.filter(s => s.status === 'submitted' && s.reviewStatus !== 'corrections_required');
  const correctionsSurveys = surveys.filter(s => s.reviewStatus === 'corrections_required');
  const approvedSurveys = surveys.filter(s => s.status === 'approved');
  const rejectedSurveys = surveys.filter(s => s.status === 'rejected');

  const cardContainerClass = "bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all duration-200";

  // Active list based on tab
  const getActiveList = () => {
    switch (filterTab) {
      case 'pending': return submittedSurveys;
      case 'corrections': return correctionsSurveys;
      case 'approved': return approvedSurveys;
      case 'rejected': return rejectedSurveys;
      default: return submittedSurveys;
    }
  };

  const filteredList = getActiveList().filter(s => {
    const term = searchQuery.toLowerCase();
    return s.surveyNumber.toLowerCase().includes(term) ||
      s.customerName.toLowerCase().includes(term) ||
      s.customerAddress.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`${cardContainerClass} p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-navy" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              Engineering Feasibility Gateway
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            Engineering Lead Approvals
          </h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Review site surveys, verify rooftop measurements and shadow analysis before quotations are issued.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-sand-100 text-charcoal font-semibold border border-warmGrey">
            Reviewer: <strong>{currentUser.name}</strong>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-sage text-white text-[10px] font-bold">
            Feasibility Authority Active
          </span>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">Awaiting Review</p>
              <h3 className="text-3xl font-bold text-navy mt-2 tracking-tight">{submittedSurveys.length}</h3>
              <p className="text-xs text-mutedGrey mt-1">Submitted by field specialists</p>
            </div>
            <div className="p-3 rounded-xl bg-navy/10 text-navy">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-navy font-semibold">Priority Action</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sand-100 text-navy border border-warmGrey">
              Queue
            </span>
          </div>
        </div>

        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">Corrections Needed</p>
              <h3 className="text-3xl font-bold text-amber mt-2 tracking-tight">{correctionsSurveys.length}</h3>
              <p className="text-xs text-mutedGrey mt-1">Pending field re-measurement</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-mutedGrey">With Survey Specialists</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber border border-amber/30">
              Revision
            </span>
          </div>
        </div>

        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">Approved Reports</p>
              <h3 className="text-3xl font-bold text-sage mt-2 tracking-tight">{approvedSurveys.length}</h3>
              <p className="text-xs text-mutedGrey mt-1">Cleared for Quotation generation</p>
            </div>
            <div className="p-3 rounded-xl bg-sage-50 text-sage">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-sage font-semibold">Ready for Proposals</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-sage border border-sage/30">
              Certified
            </span>
          </div>
        </div>

        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">Rejected Reports</p>
              <h3 className="text-3xl font-bold text-terracotta mt-2 tracking-tight">{rejectedSurveys.length}</h3>
              <p className="text-xs text-mutedGrey mt-1">Structurally unsuitable sites</p>
            </div>
            <div className="p-3 rounded-xl bg-terracotta-50 text-terracotta">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-mutedGrey">Unfeasible sites</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-terracotta-50 text-terracotta border border-terracotta/30">
              Archived
            </span>
          </div>
        </div>

      </div>

      {/* Review Queue Table */}
      <div className={`${cardContainerClass} p-5 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Subtabs */}
          <div className="flex space-x-1.5 border-b border-warmGrey/60 pb-1 text-xs">
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                filterTab === 'pending' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Awaiting Review ({submittedSurveys.length})
            </button>
            <button
              onClick={() => setFilterTab('corrections')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                filterTab === 'corrections' ? 'bg-amber text-charcoal' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Corrections Needed ({correctionsSurveys.length})
            </button>
            <button
              onClick={() => setFilterTab('approved')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                filterTab === 'approved' ? 'bg-sage text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Approved History ({approvedSurveys.length})
            </button>
            <button
              onClick={() => setFilterTab('rejected')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                filterTab === 'rejected' ? 'bg-terracotta text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Rejected ({rejectedSurveys.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72 text-xs">
            <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search survey #, customer, address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto border border-warmGrey/60 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-2.5 px-3">Survey ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Site Location</th>
                <th className="py-2.5 px-3">Technician</th>
                <th className="py-2.5 px-3">Shadow-Free Area</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-mutedGrey">
                    No survey reports currently in this review queue.
                  </td>
                </tr>
              ) : (
                filteredList.map(s => (
                  <tr 
                    key={s.id} 
                    className="hover:bg-sand-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedSurveyForReview(s)}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-navy">
                      {s.surveyNumber}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-charcoal">
                      {s.customerName}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-mutedGrey">
                      {s.customerAddress}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-charcoal">{s.technicianName || 'Field Specialist'}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-navy">{s.shadowFreeAreaSqm || 75} sq.m</span>
                      <span className="text-[10px] text-mutedGrey ml-1">({s.roofDirection || 'South'})</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedSurveyForReview(s)}
                        className="px-3 py-1 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-2xs"
                      >
                        {filterTab === 'pending' ? 'Review & Approve' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                ))
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

    </div>
  );
};
