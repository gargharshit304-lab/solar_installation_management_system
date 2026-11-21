import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, XCircle, FileText, 
  Compass, MapPin, Camera, Zap, Shield, Calendar, Clock, 
  Send, AlertCircle
} from 'lucide-react';
import { SiteSurvey } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';

interface EngineeringReviewModalProps {
  survey: SiteSurvey;
  isOpen: boolean;
  onClose: () => void;
}

export const EngineeringReviewModal: React.FC<EngineeringReviewModalProps> = ({
  survey,
  isOpen,
  onClose
}) => {
  const { 
    currentUser, 
    approveSurveyReport, 
    requestSurveyCorrections, 
    rejectSurveyReport,
    showToast 
  } = useApp();

  const [engineeringNotes, setEngineeringNotes] = useState(survey.engineeringReviewNotes || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionsComment, setCorrectionsComment] = useState('');
  const [actionView, setActionView] = useState<'review' | 'request_corrections' | 'reject'>('review');

  if (!isOpen) return null;

  const isApproved = survey.status === 'approved';

  const handleApprove = () => {
    approveSurveyReport(survey.id, engineeringNotes || 'Technical measurements and shadow-free area verified against standard design tolerances. Approved for quotation.');
    onClose();
  };

  const handleRequestCorrections = () => {
    if (!correctionsComment.trim()) {
      showToast('Please specify the required technical corrections.', 'warning');
      return;
    }
    requestSurveyCorrections(survey.id, correctionsComment);
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a specific engineering reason for rejection.', 'warning');
      return;
    }
    rejectSurveyReport(survey.id, rejectionReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-dropdown border border-warmGrey max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-charcoal text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber/20 text-amber border border-amber/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-amber">{survey.surveyNumber}</span>
                <span className="text-warmGrey-light">•</span>
                <span className="text-xs text-sand">Engineering Lead Feasibility Review</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {survey.customerName}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <StatusBadge status={survey.status} />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-sand hover:bg-charcoal-light hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Ribbon */}
        <div className="bg-sand-50/90 px-5 py-3 border-b border-warmGrey/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-charcoal">
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-navy" />
              <span>{survey.customerAddress}</span>
            </span>
            <span className="flex items-center space-x-1.5 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-amber" />
              <span>Surveyed: {new Date(survey.scheduledDate).toLocaleDateString()}</span>
            </span>
            <span className="text-navy font-bold">
              Technician: {survey.technicianName || 'Field Specialist'}
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-sand-200 text-charcoal font-semibold text-[11px]">
            Lead Reviewer: {currentUser.name}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-sand-50/30 text-xs">
          
          {/* Main Action View */}
          {actionView === 'review' && (
            <div className="space-y-5">
              
              {/* Measurements Card */}
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-3">
                <h3 className="font-bold text-charcoal text-sm flex items-center space-x-2 border-b border-warmGrey/40 pb-2">
                  <Compass className="w-4 h-4 text-navy" />
                  <span>A. Technical Measurements Verification</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-charcoal">
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Roof Type</span>
                    <strong className="text-navy text-xs">{survey.roofType || 'RCC Flat Concrete'}</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Dimensions</span>
                    <strong className="text-charcoal text-xs">
                      {survey.roofLengthM || survey.roofDimensions?.lengthM || 12.5}m × {survey.roofWidthM || survey.roofDimensions?.widthM || 7.5}m
                    </strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Total Roof Area</span>
                    <strong className="text-charcoal text-xs">{survey.totalRoofAreaSqm || 93.75} sq.m</strong>
                  </div>
                  <div className="p-2.5 bg-sage-50 rounded-lg border border-sage/30">
                    <span className="text-sage text-[11px] block font-bold">Shadow-Free Area</span>
                    <strong className="text-sage text-sm">{survey.shadowFreeAreaSqm || 75.0} sq.m</strong>
                  </div>

                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Orientation</span>
                    <strong className="text-charcoal text-xs">{survey.roofDirection || 'South'} ({survey.roofTiltDegrees || 15}°)</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Roof Condition</span>
                    <strong className="text-charcoal text-xs capitalize">{survey.roofCondition || 'Good'}</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Cable Distance</span>
                    <strong className="text-charcoal text-xs">{survey.cableDistanceMeters || 18} meters</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Grid Phase</span>
                    <strong className="text-navy text-xs uppercase">{survey.phaseType || 'single_phase'}</strong>
                  </div>
                </div>
              </div>

              {/* Shadow Analysis & Obstructions */}
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-2">
                <h3 className="font-bold text-charcoal text-sm border-b border-warmGrey/40 pb-2">
                  B. Shadow Analysis & Obstruction Notes
                </h3>
                <p className="text-mutedGrey leading-relaxed">
                  {survey.shadowObservations || survey.technicianObservations || 'Unshaded rooftop orientation. Minor morning parapet shadow.'}
                </p>
                {survey.nearbyObstructions && (
                  <p className="text-[11px] text-charcoal bg-sand-50 p-2 rounded-lg border border-warmGrey/40">
                    <strong>Recorded Obstructions:</strong> {survey.nearbyObstructions}
                  </p>
                )}
              </div>

              {/* Site Photos Inspection */}
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-3">
                <h3 className="font-bold text-charcoal text-sm flex items-center space-x-2 border-b border-warmGrey/40 pb-2">
                  <Camera className="w-4 h-4 text-amber" />
                  <span>C. Technician Site Photographs ({survey.surveyPhotos?.length || survey.photos?.length || 2} attached)</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(survey.surveyPhotos && survey.surveyPhotos.length > 0 
                    ? survey.surveyPhotos.map(p => p.url) 
                    : survey.photos || [
                        'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=500&auto=format&fit=crop&q=80'
                      ]
                  ).map((url, i) => (
                    <div key={i} className="h-32 bg-sand-100 rounded-lg overflow-hidden border border-warmGrey/60">
                      <img src={url} alt="Site" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Lead Review Observations */}
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-2">
                <h3 className="font-bold text-charcoal text-sm">
                  D. Engineering Lead Approval Notes
                </h3>
                <textarea
                  rows={3}
                  disabled={isApproved}
                  value={engineeringNotes}
                  onChange={e => setEngineeringNotes(e.target.value)}
                  placeholder="Record engineering sign-off comments, structural notes for quotation team, inverter sizing notes..."
                  className="w-full p-2.5 border border-warmGrey rounded-xl"
                />
              </div>

            </div>
          )}

          {/* Action View: Request Corrections */}
          {actionView === 'request_corrections' && (
            <div className="p-4 bg-white rounded-xl border border-amber/40 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-amber font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Specify Technical Corrections Needed</span>
              </div>
              <p className="text-mutedGrey text-xs">
                This will send a notification to the assigned technician ({survey.technicianName || 'Specialist'}) and unlock the report for revision.
              </p>
              <textarea
                rows={4}
                value={correctionsComment}
                onChange={e => setCorrectionsComment(e.target.value)}
                placeholder="e.g. Please re-measure cable route distance to the consumer panel, and verify West parapet shading curve..."
                className="w-full p-3 border border-warmGrey rounded-xl text-xs"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setActionView('review')}
                  className="px-3 py-1.5 text-mutedGrey hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestCorrections}
                  className="px-4 py-1.5 bg-amber text-charcoal font-bold rounded-lg hover:bg-amber-light"
                >
                  Send Corrections Request
                </button>
              </div>
            </div>
          )}

          {/* Action View: Reject Report */}
          {actionView === 'reject' && (
            <div className="p-4 bg-white rounded-xl border border-terracotta/40 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-terracotta font-bold text-sm">
                <XCircle className="w-4 h-4" />
                <span>Reject Survey Feasibility</span>
              </div>
              <p className="text-mutedGrey text-xs">
                Specify why this site is technically unsuitable for solar installation (e.g. structural integrity failure, severe shading &gt; 50%).
              </p>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Roof structural slab has extensive water seepage and cannot safely support dead-weight of solar arrays..."
                className="w-full p-3 border border-warmGrey rounded-xl text-xs"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setActionView('review')}
                  className="px-3 py-1.5 text-mutedGrey hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-1.5 bg-terracotta text-white font-bold rounded-lg hover:bg-terracotta-dark"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white border-t border-warmGrey/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-mutedGrey">
            Engineering Lead Gate: Approval unlocks quotation generation for Sales Executive.
          </span>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-sand-100 hover:bg-sand-200 text-charcoal font-semibold text-xs rounded-xl border border-warmGrey"
            >
              Close
            </button>

            {!isApproved && actionView === 'review' && (
              <>
                <button
                  onClick={() => setActionView('reject')}
                  className="px-3.5 py-2 bg-white hover:bg-terracotta-50 text-terracotta font-semibold text-xs rounded-xl border border-terracotta/40"
                >
                  Reject Feasibility
                </button>

                <button
                  onClick={() => setActionView('request_corrections')}
                  className="px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-dark font-semibold text-xs rounded-xl border border-amber/40"
                >
                  Request Corrections
                </button>

                <button
                  onClick={handleApprove}
                  className="px-5 py-2 bg-sage hover:bg-sage-dark text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Technical Feasibility</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
