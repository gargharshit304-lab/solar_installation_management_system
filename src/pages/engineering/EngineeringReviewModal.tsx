import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, XCircle, FileText, 
  Compass, MapPin, Camera, Zap, Shield, Calendar, Clock, 
  Send, AlertCircle, History, UserCheck, Layers, ThumbsUp,
  ThumbsDown, Save, Eye, ShieldAlert, ArrowRight
} from 'lucide-react';
import { SiteSurvey, SurveyWorkflowAuditEvent } from '../../types';
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
    startSurveyReview,
    saveSurveyReviewNotes,
    submitSurveyReviewRecommendation,
    showToast 
  } = useApp();

  const [activeDossierTab, setActiveDossierTab] = useState<'dossier' | 'audit_trail'>('dossier');
  const [reviewNotes, setReviewNotes] = useState(survey.reviewNotes || survey.engineeringReviewNotes || '');
  const [approvalNotes, setApprovalNotes] = useState(survey.approvalNotes || '');
  const [rejectionReason, setRejectionReason] = useState(survey.rejectionReason || '');
  const [correctionsComment, setCorrectionsComment] = useState('');
  const [recommendationChoice, setRecommendationChoice] = useState<'approve' | 'reject'>('approve');
  
  const [actionView, setActionView] = useState<'view' | 'request_corrections' | 'recommend' | 'reject' | 'approve'>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isApproved = survey.status === 'approved';
  const isRejected = survey.status === 'rejected';

  // Check self-approval restriction
  const isTechnician = 
    survey.technicianId === currentUser.id ||
    (survey.technicianName && survey.technicianName.toLowerCase() === currentUser.name.toLowerCase());

  // Check approver authority (explicit surveys.approve or canApproveSurveys flag)
  const canApproveAction = (currentUser as any).canApproveSurveys || 
    (currentUser.role === 'engineering_lead' && currentUser.id === 'usr-9');

  const canReviewAction = 
    currentUser.role === 'engineering_lead' || 
    (currentUser as any).canApproveSurveys || 
    currentUser.role === 'owner_admin';

  const handleStartReview = async () => {
    setIsSubmitting(true);
    await startSurveyReview(survey.id);
    setIsSubmitting(false);
  };

  const handleSaveNotes = async () => {
    setIsSubmitting(true);
    await saveSurveyReviewNotes(survey.id, reviewNotes);
    setIsSubmitting(false);
  };

  const handleRequestCorrections = async () => {
    if (!correctionsComment.trim()) {
      showToast('Please specify the required technical corrections in detail.', 'warning');
      return;
    }
    setIsSubmitting(true);
    const ok = requestSurveyCorrections(survey.id, correctionsComment);
    setIsSubmitting(false);
    if (ok) {
      onClose();
    }
  };

  const handleSubmitRecommendation = async () => {
    if (!reviewNotes.trim()) {
      showToast('Please provide review notes supporting your recommendation.', 'warning');
      return;
    }
    setIsSubmitting(true);
    const ok = await submitSurveyReviewRecommendation(survey.id, recommendationChoice, reviewNotes);
    setIsSubmitting(false);
    if (ok) {
      onClose();
    }
  };

  const handleApprove = () => {
    setIsSubmitting(true);
    const ok = approveSurveyReport(
      survey.id, 
      approvalNotes || reviewNotes || 'Technical measurements, shadow-free area and grid parameters verified. Feasibility sign-off granted for quotation issuance.'
    );
    setIsSubmitting(false);
    if (ok) {
      onClose();
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a specific engineering reason for rejection.', 'warning');
      return;
    }
    setIsSubmitting(true);
    const ok = rejectSurveyReport(survey.id, rejectionReason);
    setIsSubmitting(false);
    if (ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-dropdown border border-warmGrey max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-charcoal text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber/20 text-amber border border-amber/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-amber">{survey.surveyNumber}</span>
                {survey.version && survey.version > 1 && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber text-charcoal">
                    v{survey.version} (Revised)
                  </span>
                )}
                <span className="text-warmGrey-light">•</span>
                <span className="text-xs text-sand">Engineering Technical Review & Sign-Off</span>
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
        <div className="bg-sand-50/90 px-5 py-2.5 border-b border-warmGrey/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-charcoal">
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-navy" />
              <span>{survey.customerAddress}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-mutedGrey" />
              <span>Technician: <strong>{survey.technicianName || 'Field Specialist'}</strong></span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span>
              Reviewer: <strong>{survey.assignedReviewerName || 'Unassigned'}</strong>
            </span>
            <span>•</span>
            <span>
              Approver: <strong>{survey.approvedByName || survey.assignedApproverName || 'Awaiting Assignment'}</strong>
            </span>
          </div>
        </div>

        {/* Top Dossier vs Audit Trail Navigation Tabs */}
        <div className="px-5 pt-2 border-b border-warmGrey/60 bg-white flex items-center space-x-2 shrink-0">
          <button
            onClick={() => { setActiveDossierTab('dossier'); setActionView('view'); }}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition-all flex items-center space-x-1.5 ${
              activeDossierTab === 'dossier'
                ? 'border-navy text-navy'
                : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Technical Dossier (Sections A - F)</span>
          </button>

          <button
            onClick={() => setActiveDossierTab('audit_trail')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition-all flex items-center space-x-1.5 ${
              activeDossierTab === 'audit_trail'
                ? 'border-navy text-navy'
                : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Workflow Audit Trail & History</span>
            {survey.workflowAuditTrail && survey.workflowAuditTrail.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sand-100 text-charcoal">
                {survey.workflowAuditTrail.length}
              </span>
            )}
          </button>
        </div>

        {/* Warning Banner: Self-Approval Prohibition */}
        {isTechnician && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber/30 text-xs text-charcoal flex items-center space-x-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber shrink-0" />
            <span>
              <strong>Compliance Restriction:</strong> You are recorded as the field survey technician for this report ({currentUser.name}). Under SolarOS engineering governance, technicians cannot review or approve their own survey submissions.
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-sand-50/30 text-xs">
          
          {/* DOSSIER VIEW (Sections A through F) */}
          {activeDossierTab === 'dossier' && actionView === 'view' && (
            <div className="space-y-5">
              
              {/* SECTION A: Customer & Site Overview */}
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-3">
                <h3 className="font-bold text-charcoal text-sm flex items-center space-x-2 border-b border-warmGrey/40 pb-2">
                  <Compass className="w-4 h-4 text-navy" />
                  <span>Section A: Customer & Site Overview</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-charcoal">
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Customer Name</span>
                    <strong className="text-charcoal text-xs">{survey.customerName}</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Contact Phone</span>
                    <strong className="text-charcoal text-xs">{survey.customerPhone || 'N/A'}</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Survey Date</span>
                    <strong className="text-charcoal text-xs">
                      {new Date(survey.scheduledDate).toLocaleDateString()} ({survey.timeSlot || 'Morning'})
                    </strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Survey Version</span>
                    <strong className="text-navy text-xs">Version {survey.version || 1}.0</strong>
                  </div>
                </div>
              </div>

              {/* SECTION B: Rooftop Geometry & Usable Area */}
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-3">
                <h3 className="font-bold text-charcoal text-sm flex items-center space-x-2 border-b border-warmGrey/40 pb-2">
                  <Layers className="w-4 h-4 text-navy" />
                  <span>Section B: Rooftop Geometry & Usable Area</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-charcoal">
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Roof Construction</span>
                    <strong className="text-navy text-xs">{survey.roofType || 'RCC Flat Concrete'}</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Physical Dimensions</span>
                    <strong className="text-charcoal text-xs">
                      {survey.roofLengthM || survey.roofDimensions?.lengthM || 12.5}m × {survey.roofWidthM || survey.roofDimensions?.widthM || 7.5}m
                    </strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Total Roof Area</span>
                    <strong className="text-charcoal text-xs">{survey.totalRoofAreaSqm || 93.75} m²</strong>
                  </div>
                  <div className="p-2.5 bg-sage-50 rounded-lg border border-sage/30">
                    <span className="text-sage text-[11px] block font-bold">Shadow-Free Area</span>
                    <strong className="text-sage text-sm">{survey.shadowFreeAreaSqm || 75.0} m²</strong>
                  </div>

                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Azimuth & Orientation</span>
                    <strong className="text-charcoal text-xs">{survey.roofDirection || 'South'} ({survey.roofTiltDegrees || 15}°)</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Structural Condition</span>
                    <strong className="text-charcoal text-xs capitalize">{survey.roofCondition || 'Good'}</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40 col-span-2">
                    <span className="text-mutedGrey text-[11px] block">Installation Space Notes</span>
                    <strong className="text-charcoal text-xs">
                      {survey.availableInstallationSpace || 'Adequate space along South perimeter for solar array'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECTION C: Shading Analysis & Obstacles */}
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-3">
                <h3 className="font-bold text-charcoal text-sm flex items-center space-x-2 border-b border-warmGrey/40 pb-2">
                  <AlertTriangle className="w-4 h-4 text-amber" />
                  <span>Section C: Shading Analysis & Obstacle Assessment</span>
                </h3>

                <div className="space-y-2.5">
                  <div className="p-3 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block font-semibold">Sunlight & Shadow Window:</span>
                    <p className="text-charcoal text-xs mt-1 leading-relaxed">
                      {survey.shadowObservations || survey.technicianObservations || 'Unshaded rooftop orientation. Optimal solar exposure between 9:00 AM and 4:30 PM.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                      <span className="text-mutedGrey text-[11px] block">Nearby Obstructions:</span>
                      <strong className="text-charcoal text-xs">
                        {survey.nearbyObstructions || 'Water storage tank overhead on North corner; no tall trees.'}
                      </strong>
                    </div>
                    <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                      <span className="text-mutedGrey text-[11px] block">Estimated Shading Impact:</span>
                      <strong className="text-navy text-xs">
                        {survey.estimatedShadingImpactPct || 3.5}% usable area impact
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION D: Electrical Connection & Grid Parameters */}
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-3">
                <h3 className="font-bold text-charcoal text-sm flex items-center space-x-2 border-b border-warmGrey/40 pb-2">
                  <Zap className="w-4 h-4 text-navy" />
                  <span>Section D: Electrical Connection & Grid Parameters</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-charcoal">
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Grid Connection</span>
                    <strong className="text-charcoal text-xs">Available (DISCOM Net-Meter)</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Phase Type</span>
                    <strong className="text-navy text-xs uppercase">{survey.phaseType || 'single_phase'}</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Sanctioned Load</span>
                    <strong className="text-charcoal text-xs">{survey.sanctionedLoadKw || 5.0} kW</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Meter Number</span>
                    <strong className="text-charcoal text-xs font-mono">{survey.meterNumber || 'MSEDCL-2026-99214'}</strong>
                  </div>

                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Cable Route Distance</span>
                    <strong className="text-charcoal text-xs">{survey.cableDistanceMeters || 18} meters</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Panel Condition</span>
                    <strong className="text-charcoal text-xs capitalize">{survey.mainPanelCondition || 'Good'}</strong>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40 col-span-2">
                    <span className="text-mutedGrey text-[11px] block">Inverter Proposed Location</span>
                    <strong className="text-charcoal text-xs">
                      {survey.proposedInverterLocation || 'Terrace staircase landing (covered & weather-protected)'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECTION E: Site Conditions & Structural Feasibility */}
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-3">
                <h3 className="font-bold text-charcoal text-sm flex items-center space-x-2 border-b border-warmGrey/40 pb-2">
                  <Shield className="w-4 h-4 text-navy" />
                  <span>Section E: Site Conditions & Structural Feasibility</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-charcoal">
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Roof Accessibility</span>
                    <p className="text-xs font-semibold mt-0.5">
                      {survey.roofAccessibility || 'Internal concrete staircase with terrace access door'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Structural Integrity & Waterproofing</span>
                    <p className="text-xs font-semibold mt-0.5">
                      {survey.structuralConcerns || 'RCC slab is sound and verified waterproofed. Dead weight safe.'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Safety Lifelines & Parapet</span>
                    <p className="text-xs font-semibold mt-0.5">
                      {survey.safetyConsiderations || 'Parapet wall height 3.5 ft. Safety lifeline anchor points available.'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey text-[11px] block">Installation Obstacles</span>
                    <p className="text-xs font-semibold mt-0.5">
                      {survey.installationObstacles || 'Minor DTH antenna on East parapet (requires 1m relocation)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION F: High-Res Site Photographs & Technician Notes */}
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-3">
                <h3 className="font-bold text-charcoal text-sm flex items-center space-x-2 border-b border-warmGrey/40 pb-2">
                  <Camera className="w-4 h-4 text-amber" />
                  <span>Section F: Site Photographs & Field Notes ({survey.surveyPhotos?.length || survey.photos?.length || 2} attached)</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(survey.surveyPhotos && survey.surveyPhotos.length > 0 
                    ? survey.surveyPhotos.map(p => ({ url: p.url, caption: p.caption, category: p.category }))
                    : (survey.photos || [
                        'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=500&auto=format&fit=crop&q=80'
                      ]).map((url, i) => ({ url, caption: `Site Photo ${i + 1}`, category: 'Rooftop' }))
                  ).map((photo, i) => (
                    <div key={i} className="group relative rounded-lg overflow-hidden border border-warmGrey/60 bg-sand-100">
                      <div className="h-32">
                        <img src={photo.url} alt="Site" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2 bg-white text-[11px]">
                        <span className="font-bold text-navy block">{photo.category}</span>
                        <span className="text-mutedGrey truncate block">{photo.caption}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-sand-50 rounded-lg border border-warmGrey/40 mt-3">
                  <span className="text-mutedGrey text-[11px] block font-semibold">Technician Field Observations:</span>
                  <p className="text-charcoal text-xs mt-1 leading-relaxed">
                    {survey.technicianNotes || survey.technicianObservations || 'Site is highly suitable for on-grid solar installation. Recommend 4kW to 5kW system capacity with bi-facial panels.'}
                  </p>
                </div>
              </div>

              {/* Reviewer / Approver Notes Log */}
              {(survey.reviewNotes || survey.approvalNotes || survey.rejectionReason) && (
                <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-2">
                  <h3 className="font-bold text-charcoal text-sm">Engineering Sign-Off Notes</h3>
                  {survey.reviewNotes && (
                    <p className="text-xs text-charcoal bg-sand-50 p-2.5 rounded-lg border border-warmGrey/40">
                      <strong>Technical Review Notes:</strong> {survey.reviewNotes}
                    </p>
                  )}
                  {survey.approvalNotes && (
                    <p className="text-xs text-sage bg-sage-50 p-2.5 rounded-lg border border-sage/30">
                      <strong>Final Approval Sign-Off:</strong> {survey.approvalNotes}
                    </p>
                  )}
                  {survey.rejectionReason && (
                    <p className="text-xs text-terracotta bg-terracotta-50 p-2.5 rounded-lg border border-terracotta/30">
                      <strong>Rejection Reason:</strong> {survey.rejectionReason}
                    </p>
                  )}
                </div>
              )}

            </div>
          )}

          {/* AUDIT TRAIL TAB */}
          {activeDossierTab === 'audit_trail' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-3">
                <h3 className="font-bold text-charcoal text-sm flex items-center space-x-2 border-b border-warmGrey/40 pb-2">
                  <History className="w-4 h-4 text-navy" />
                  <span>Chronological Workflow Audit Trail</span>
                </h3>

                {(!survey.workflowAuditTrail || survey.workflowAuditTrail.length === 0) ? (
                  <p className="text-mutedGrey text-xs py-4 text-center">
                    No workflow history events recorded for this survey yet.
                  </p>
                ) : (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-warmGrey/60">
                    {survey.workflowAuditTrail.map((evt, idx) => (
                      <div key={evt.id || idx} className="relative flex items-start space-x-3 text-xs pl-1">
                        <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center shrink-0 z-10 text-[10px] font-bold">
                          {idx + 1}
                        </div>
                        <div className="bg-sand-50 p-3 rounded-xl border border-warmGrey/60 flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-charcoal">{evt.summary || evt.eventType.replace(/_/g, ' ').toUpperCase()}</span>
                            <span className="text-[10px] text-mutedGrey">{new Date(evt.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-[11px] text-mutedGrey">
                            By <strong>{evt.actorName}</strong> ({evt.actorRole})
                          </p>
                          {(evt.comments || evt.notes) && (
                            <p className="text-xs text-charcoal font-medium bg-white p-2 rounded border border-warmGrey/40 mt-1">
                              "{evt.comments || evt.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Version History Comparison (if v2+) */}
              {survey.previousVersions && survey.previousVersions.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-warmGrey/70 shadow-2xs space-y-3">
                  <h3 className="font-bold text-charcoal text-sm flex items-center space-x-2 border-b border-warmGrey/40 pb-2">
                    <Layers className="w-4 h-4 text-amber" />
                    <span>Report Version History Snapshots</span>
                  </h3>

                  <div className="space-y-2">
                    {survey.previousVersions.map((ver, idx) => (
                      <div key={idx} className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60 text-xs">
                        <div className="flex items-center justify-between font-bold text-navy">
                          <span>Version {ver.version}.0 Snapshot</span>
                          <span className="text-mutedGrey font-normal">{new Date(ver.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-mutedGrey mt-1">Submitted by: {ver.technicianName || 'Technician'}</p>
                        {ver.notes && <p className="text-charcoal mt-1 italic">"{ver.notes}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTION SUB-VIEWS */}
          
          {/* Action: Request Corrections */}
          {actionView === 'request_corrections' && (
            <div className="p-4 bg-white rounded-xl border border-amber/40 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-amber font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Specify Technical Corrections Needed</span>
              </div>
              <p className="text-mutedGrey text-xs">
                Returning this report will notify technician <strong>{survey.technicianName || 'Specialist'}</strong> and change survey status to <strong>Revisions Required</strong>.
              </p>
              <textarea
                rows={4}
                value={correctionsComment}
                onChange={e => setCorrectionsComment(e.target.value)}
                placeholder="e.g. Roof tilt angle of 28° exceeds standard ballast threshold. Please upload photograph of ridge line and re-verify single-phase cable drop distance..."
                className="w-full p-3 border border-warmGrey rounded-xl text-xs"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionView('view')}
                  className="px-3 py-1.5 text-mutedGrey hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRequestCorrections}
                  className="px-4 py-1.5 bg-amber text-charcoal font-bold rounded-lg hover:bg-amber-light disabled:opacity-50"
                >
                  Send Corrections Request
                </button>
              </div>
            </div>
          )}

          {/* Action: Submit Recommendation (Technical Reviewer) */}
          {actionView === 'recommend' && (
            <div className="p-4 bg-white rounded-xl border border-navy/40 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-navy font-bold text-sm">
                <Send className="w-4 h-4" />
                <span>Submit Technical Feasibility Recommendation</span>
              </div>
              <p className="text-mutedGrey text-xs">
                As Technical Reviewer, assess rooftop geometry and PVSyst analysis to recommend approval or rejection to the Engineering Lead.
              </p>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-sage">
                  <input
                    type="radio"
                    name="recChoice"
                    checked={recommendationChoice === 'approve'}
                    onChange={() => setRecommendationChoice('approve')}
                    className="text-sage"
                  />
                  <span>Recommend Approval</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-terracotta">
                  <input
                    type="radio"
                    name="recChoice"
                    checked={recommendationChoice === 'reject'}
                    onChange={() => setRecommendationChoice('reject')}
                    className="text-terracotta"
                  />
                  <span>Recommend Rejection</span>
                </label>
              </div>

              <textarea
                rows={4}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Detail PVSyst simulation findings, shadow angles, and inverter sizing parameters..."
                className="w-full p-3 border border-warmGrey rounded-xl text-xs"
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionView('view')}
                  className="px-3 py-1.5 text-mutedGrey hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitRecommendation}
                  className="px-4 py-1.5 bg-navy text-white font-bold rounded-lg hover:bg-navy-light disabled:opacity-50"
                >
                  Submit Recommendation
                </button>
              </div>
            </div>
          )}

          {/* Action: Final Approval (Engineering Lead) */}
          {actionView === 'approve' && (
            <div className="p-4 bg-white rounded-xl border border-sage/40 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-sage font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Grant Final Engineering Sign-Off</span>
              </div>
              <p className="text-mutedGrey text-xs">
                Approving this survey unlocks the commercial quotation generator for Sales Executives. Confirms DISCOM feeder compliance and structural safety.
              </p>
              <textarea
                rows={3}
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                placeholder="Record certified engineering sign-off comments, structural notes, DISCOM feeder capacity..."
                className="w-full p-3 border border-warmGrey rounded-xl text-xs"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionView('view')}
                  className="px-3 py-1.5 text-mutedGrey hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleApprove}
                  className="px-5 py-2 bg-sage hover:bg-sage-dark text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  Confirm Technical Approval
                </button>
              </div>
            </div>
          )}

          {/* Action: Reject Feasibility */}
          {actionView === 'reject' && (
            <div className="p-4 bg-white rounded-xl border border-terracotta/40 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-terracotta font-bold text-sm">
                <XCircle className="w-4 h-4" />
                <span>Reject Survey Feasibility</span>
              </div>
              <p className="text-mutedGrey text-xs">
                Specify why this site is technically unfeasible (e.g. excessive tree shading &gt; 50%, structural weakness, roof slab water seepage).
              </p>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Detail technical grounds for rejection..."
                className="w-full p-3 border border-warmGrey rounded-xl text-xs"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionView('view')}
                  className="px-3 py-1.5 text-mutedGrey hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleReject}
                  className="px-4 py-2 bg-terracotta text-white font-bold rounded-xl hover:bg-terracotta-dark disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions Toolbar */}
        <div className="p-4 bg-white border-t border-warmGrey/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-mutedGrey">
            {isApproved ? (
              <span className="text-sage font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Approved on {survey.approvedAt} by {survey.approvedByName || survey.engineeringApproverName || 'Engineering Lead'}</span>
              </span>
            ) : isRejected ? (
              <span className="text-terracotta font-bold flex items-center space-x-1">
                <XCircle className="w-4 h-4" />
                <span>Rejected by Engineering Lead</span>
              </span>
            ) : (
              <span>Quality Gate: Engineering approval required before quotation proposals.</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-sand-100 hover:bg-sand-200 text-charcoal font-semibold text-xs rounded-xl border border-warmGrey"
            >
              Close Dossier
            </button>

            {/* Actions for Pending Surveys */}
            {!isApproved && !isRejected && actionView === 'view' && (
              <>
                {/* 1. Reviewer Actions */}
                {survey.reviewStatus !== 'in_review' && (
                  <button
                    type="button"
                    onClick={handleStartReview}
                    className="px-3 py-2 bg-white hover:bg-sand-100 text-navy font-semibold text-xs rounded-xl border border-navy/40"
                  >
                    Start Review
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActionView('request_corrections')}
                  className="px-3 py-2 bg-white hover:bg-amber-50 text-amber font-semibold text-xs rounded-xl border border-amber/40"
                >
                  Request Corrections
                </button>

                <button
                  type="button"
                  onClick={() => setActionView('recommend')}
                  className="px-3.5 py-2 bg-navy text-white font-semibold text-xs rounded-xl hover:bg-navy-light"
                >
                  Submit Recommendation
                </button>

                {/* 2. Approver Actions (Blocked if technician) */}
                {canApproveAction && !isTechnician && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActionView('reject')}
                      className="px-3 py-2 bg-white hover:bg-terracotta-50 text-terracotta font-semibold text-xs rounded-xl border border-terracotta/40"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionView('approve')}
                      className="px-4 py-2 bg-sage hover:bg-sage-dark text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Survey</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
