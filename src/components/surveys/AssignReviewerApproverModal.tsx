import React, { useState } from 'react';
import { 
  X, Shield, UserCheck, CheckCircle2, Clock, 
  AlertCircle, Briefcase, ChevronRight, UserPlus, Info
} from 'lucide-react';
import { SiteSurvey } from '../../types';
import { useApp } from '../../context/AppContext';

interface AssignReviewerApproverModalProps {
  survey: SiteSurvey;
  isOpen: boolean;
  onClose: () => void;
  defaultRoleMode?: 'reviewer' | 'approver' | 'both';
}

export const AssignReviewerApproverModal: React.FC<AssignReviewerApproverModalProps> = ({
  survey,
  isOpen,
  onClose,
  defaultRoleMode = 'both'
}) => {
  const { 
    assignSurveyReviewer, 
    assignSurveyApprover, 
    getEligibleReviewers, 
    getEligibleApprovers,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reviewer' | 'approver'>(
    defaultRoleMode === 'approver' ? 'approver' : 'reviewer'
  );

  const eligibleReviewers = getEligibleReviewers(survey.technicianId);
  const eligibleApprovers = getEligibleApprovers(survey.technicianId);

  const [selectedReviewerId, setSelectedReviewerId] = useState<string>(
    survey.assignedReviewerId || (eligibleReviewers[0]?.id || '')
  );
  const [selectedApproverId, setSelectedApproverId] = useState<string>(
    survey.assignedApproverId || (eligibleApprovers[0]?.id || '')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmAssignment = async () => {
    setIsSubmitting(true);
    try {
      let success = true;

      // Assign reviewer if changed
      if (selectedReviewerId && selectedReviewerId !== survey.assignedReviewerId) {
        const rev = eligibleReviewers.find(r => r.id === selectedReviewerId);
        if (rev) {
          const res = await assignSurveyReviewer(survey.id, rev.id, rev.name);
          if (!res) success = false;
        }
      }

      // Assign approver if changed
      if (selectedApproverId && selectedApproverId !== survey.assignedApproverId) {
        const app = eligibleApprovers.find(a => a.id === selectedApproverId);
        if (app) {
          const res = await assignSurveyApprover(survey.id, app.id, app.name);
          if (!res) success = false;
        }
      }

      if (success) {
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update engineering assignments.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-dropdown border border-warmGrey max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-charcoal text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber/20 text-amber border border-amber/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-amber">{survey.surveyNumber}</span>
                <span className="text-warmGrey-light">•</span>
                <span className="text-xs text-sand">Engineering Feasibility Cell</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Assign Technical Reviewer & Approver
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sand hover:bg-charcoal-light hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Survey Context Bar */}
        <div className="bg-sand-50 px-5 py-3 border-b border-warmGrey/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div>
            <span className="text-mutedGrey font-medium">Customer: </span>
            <strong className="text-charcoal">{survey.customerName}</strong>
            <span className="mx-2 text-warmGrey">|</span>
            <span className="text-mutedGrey font-medium">Field Technician: </span>
            <strong className="text-navy">{survey.technicianName || 'Unassigned'}</strong>
          </div>
          <div className="text-[11px] text-mutedGrey">
            Sanctioned Load: <strong>{survey.sanctionedLoadKw || 5.0} kW</strong> • 
            Area: <strong>{survey.totalRoofAreaSqm || 100} m²</strong>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 border-b border-warmGrey/40 flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab('reviewer')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'reviewer'
                ? 'border-navy text-navy'
                : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Technical Reviewer</span>
            {survey.assignedReviewerName && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-sand-100 text-charcoal">
                Assigned
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approver')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'approver'
                ? 'border-navy text-navy'
                : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Final Approver (Engineering Lead)</span>
            {survey.assignedApproverName && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-sand-100 text-charcoal">
                Assigned
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'reviewer' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-mutedGrey">
                <span>Select an active Solar Design Engineer to review rooftop measurements & shadow analysis:</span>
                <span className="font-semibold">{eligibleReviewers.length} Eligible</span>
              </div>

              {eligibleReviewers.length === 0 ? (
                <div className="p-6 text-center text-xs text-mutedGrey bg-sand-50 rounded-xl border border-warmGrey">
                  No eligible engineering reviewers available at this time.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {eligibleReviewers.map(rev => {
                    const isSelected = selectedReviewerId === rev.id;
                    return (
                      <div
                        key={rev.id}
                        onClick={() => setSelectedReviewerId(rev.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-navy/5 border-navy shadow-xs ring-1 ring-navy'
                            : 'bg-white border-warmGrey/80 hover:bg-sand-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-navy bg-navy text-white' : 'border-warmGrey'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-charcoal">{rev.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sand-100 text-navy border border-warmGrey">
                                {rev.designation}
                              </span>
                            </div>
                            <p className="text-xs text-mutedGrey mt-0.5">{rev.email} • {rev.department}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            rev.activeReviewsCount > 2
                              ? 'bg-terracotta-50 text-terracotta border border-terracotta/30'
                              : 'bg-sand-100 text-navy border border-warmGrey'
                          }`}>
                            {rev.activeReviewsCount} active {rev.activeReviewsCount === 1 ? 'review' : 'reviews'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey text-xs text-mutedGrey flex items-start space-x-2">
                <Info className="w-4 h-4 text-navy shrink-0 mt-0.5" />
                <span>
                  The Technical Reviewer checks PVSyst shading, CAD azimuth, rooftop load tolerances and single-line diagrams (SLD) before issuing a final recommendation.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-mutedGrey">
                <span>Select an authorized Engineering Approver with explicit <code>surveys.approve</code> authority:</span>
                <span className="font-semibold">{eligibleApprovers.length} Eligible</span>
              </div>

              {eligibleApprovers.length === 0 ? (
                <div className="p-6 text-center text-xs text-mutedGrey bg-sand-50 rounded-xl border border-warmGrey">
                  No eligible engineering approvers available at this time.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {eligibleApprovers.map(app => {
                    const isSelected = selectedApproverId === app.id;
                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApproverId(app.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-sage-50 border-sage shadow-xs ring-1 ring-sage'
                            : 'bg-white border-warmGrey/80 hover:bg-sand-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-sage bg-sage text-white' : 'border-warmGrey'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-charcoal">{app.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sage-50 text-sage border border-sage/30">
                                Engineering Sign-Off Authority
                              </span>
                            </div>
                            <p className="text-xs text-mutedGrey mt-0.5">{app.email} • {app.department}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sand-100 text-charcoal border border-warmGrey">
                            {app.activeApprovalsCount} pending
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber/30 text-xs text-charcoal flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Compliance Rule:</strong> Final technical approval must come from an engineering lead with professional DISCOM & MNRE compliance signing credentials. Administrative seniority (e.g. Managing Director) does not bypass this verification gate.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-sand-50 border-t border-warmGrey/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-sand-100 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmAssignment}
            className="px-5 py-2.5 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-amber" />
            <span>{isSubmitting ? 'Updating Assignments...' : 'Save Assignments'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
