import React from 'react';
import { 
  CheckCircle2, XCircle, MapPin, Phone, Camera, FileText, 
  Compass, AlertTriangle, ShieldCheck, Download, ExternalLink, Zap 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { SiteSurvey } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface SurveyReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: SiteSurvey | null;
  onProceedToQuotation?: (survey: SiteSurvey) => void;
}

export const SurveyReportViewerModal: React.FC<SurveyReportViewerModalProps> = ({
  isOpen,
  onClose,
  survey,
  onProceedToQuotation
}) => {
  if (!survey) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Engineering Site Survey Dossier"
      subtitle={`Survey #${survey.surveyNumber} • Completed by Specialist ${survey.technicianName || 'N/A'}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        
        {/* Header Ribbon & Approval Status */}
        <div className="p-4 bg-sand-50/80 rounded-xl border border-warmGrey/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-navy text-sm">{survey.surveyNumber}</span>
              <StatusBadge status={survey.status} />
            </div>
            <h3 className="text-base font-bold text-charcoal mt-0.5">{survey.customerName}</h3>
            <p className="text-xs text-mutedGrey flex items-center space-x-2 mt-0.5">
              <span>📍 {survey.customerAddress}</span>
              <span>•</span>
              <span>📞 {survey.customerPhone}</span>
            </p>
          </div>

          {/* Engineering Lead Approval Badge / Status */}
          <div className="shrink-0">
            {survey.status === 'approved' ? (
              <div className="p-2.5 bg-sage-50 border border-sage/40 rounded-xl text-xs space-y-0.5 text-right">
                <div className="flex items-center justify-end space-x-1 text-sage font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approved by Engineering Lead</span>
                </div>
                <div className="text-[11px] text-mutedGrey">
                  Approver: <strong>{survey.approvedByName || survey.engineeringApproverName || 'Sandeep Patil (Lead Engineer)'}</strong> ({survey.approvedAt || 'Certified'})
                </div>
                {survey.reviewedByName && (
                  <div className="text-[10px] text-mutedGrey">
                    Reviewed by: {survey.reviewedByName}
                  </div>
                )}
              </div>
            ) : survey.status === 'rejected' ? (
              <div className="p-2.5 bg-terracotta-50 border border-terracotta/40 rounded-xl text-xs space-y-0.5 text-right">
                <div className="flex items-center justify-end space-x-1 text-terracotta font-bold">
                  <XCircle className="w-4 h-4" />
                  <span>Rejected by Engineering Lead</span>
                </div>
                <div className="text-[11px] text-charcoal font-semibold max-w-[220px]">
                  Reason: {survey.rejectionReason}
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50 border border-amber/40 rounded-xl text-xs space-y-0.5 text-right">
                <div className="flex items-center justify-end space-x-1 text-amber font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Awaiting Engineering Sign-Off</span>
                </div>
                <div className="text-[11px] text-mutedGrey">
                  Submitted for shadow analysis & grid clearance
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1. Rooftop & Solar Geometry Specifications */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-navy" />
            <span>1. Rooftop Geometry & Shadow-Free Usable Area</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-warmGrey/60">
              <span className="text-[11px] font-semibold text-mutedGrey">Shadow-Free Area</span>
              <p className="text-base font-bold text-navy mt-0.5">
                {survey.shadowFreeAreaSqm ? `${survey.shadowFreeAreaSqm} m²` : 'Pending'}
              </p>
              <span className="text-[10px] text-mutedGrey">
                {survey.shadowFreeAreaSqm ? `~${Math.round(survey.shadowFreeAreaSqm * 10.764)} sq.ft` : ''}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-warmGrey/60">
              <span className="text-[11px] font-semibold text-mutedGrey">Total Roof Dimensions</span>
              <p className="text-sm font-bold text-charcoal mt-0.5">
                {survey.roofDimensions ? `${survey.roofDimensions.lengthM}m × ${survey.roofDimensions.widthM}m` : '15.5m × 8.2m'}
              </p>
              <span className="text-[10px] text-mutedGrey">
                Total: {survey.totalRoofAreaSqm || 127} m²
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-warmGrey/60">
              <span className="text-[11px] font-semibold text-mutedGrey">Azimuth & Orientation</span>
              <p className="text-sm font-bold text-charcoal mt-0.5">
                {survey.roofDirection || 'True South'}
              </p>
              <span className="text-[10px] text-sage font-semibold">
                Tilt Angle: {survey.roofTiltDegrees || 18}°
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-warmGrey/60">
              <span className="text-[11px] font-semibold text-mutedGrey">Estimated Capacity</span>
              <p className="text-base font-bold text-sage mt-0.5">
                {survey.shadowFreeAreaSqm ? `${(survey.shadowFreeAreaSqm / 10).toFixed(1)} kW` : '5.0 kW'}
              </p>
              <span className="text-[10px] text-mutedGrey">Standard 540W modules</span>
            </div>
          </div>
        </div>

        {/* 2. Electrical Grid & Service Sync */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber" />
            <span>2. Electrical Service Connection & DISCOM Grid Parameters</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-sand-50/60 rounded-xl border border-warmGrey/60">
              <span className="text-mutedGrey font-medium">Sanctioned Load</span>
              <p className="font-bold text-charcoal mt-0.5">{survey.sanctionedLoadKw || 7.0} kW</p>
            </div>
            <div className="p-3 bg-sand-50/60 rounded-xl border border-warmGrey/60">
              <span className="text-mutedGrey font-medium">Meter Phase</span>
              <p className="font-bold text-charcoal mt-0.5 capitalize">
                {survey.phaseType === 'three_phase' ? 'Three Phase (415V)' : 'Single Phase (230V)'}
              </p>
            </div>
            <div className="p-3 bg-sand-50/60 rounded-xl border border-warmGrey/60">
              <span className="text-mutedGrey font-medium">Consumer Meter #</span>
              <p className="font-mono font-bold text-navy mt-0.5">{survey.meterNumber || 'MSEDCL-889102'}</p>
            </div>
            <div className="p-3 bg-sand-50/60 rounded-xl border border-warmGrey/60">
              <span className="text-mutedGrey font-medium">Cable Run Distance</span>
              <p className="font-bold text-charcoal mt-0.5">{survey.cableDistanceMeters || 22} meters to ACDB</p>
            </div>
          </div>
        </div>

        {/* 3. Field Observations */}
        <div className="p-3.5 bg-sand-50/80 rounded-xl border border-warmGrey/60 text-xs space-y-1">
          <span className="font-bold uppercase tracking-wider text-[11px] text-mutedGrey">
            Technician Structural Assessment & Observations
          </span>
          <p className="text-charcoal leading-relaxed pt-0.5">
            {survey.technicianObservations || 'No detailed observations recorded yet.'}
          </p>
        </div>

        {/* 4. Terrace Photographs & Document Attachments */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
            <Camera className="w-4 h-4 text-navy" />
            <span>Site Photographs & Laser Azimuth Verification (2 Photos)</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl overflow-hidden border border-warmGrey/60 shadow-xs relative group">
              <img
                src={survey.photos?.[0] || 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500&auto=format&fit=crop&q=80'}
                alt="Terrace South Angle"
                className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-charcoal/80 to-transparent p-2.5 text-white text-[11px] font-medium">
                Photo 1: Panoramic South Roof Unobstructed Plane
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-warmGrey/60 shadow-xs relative group">
              <img
                src={survey.photos?.[1] || 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=500&auto=format&fit=crop&q=80'}
                alt="Meter & Electrical Box"
                className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-charcoal/80 to-transparent p-2.5 text-white text-[11px] font-medium">
                Photo 2: Consumer Service DB Box & Earthing Point
              </div>
            </div>
          </div>
        </div>

        {/* Engineering Quality Gate Restriction Banner */}
        <div className="p-3 bg-sand-100 rounded-xl border border-warmGrey/80 text-[11px] text-mutedGrey flex items-center space-x-2">
          <FileText className="w-4 h-4 text-navy shrink-0" />
          <span>
            <strong>View-Only Operational Role:</strong> Technical survey measurements and shadow analysis sign-offs are strictly controlled by the Engineering Lead. Sales Executives cannot alter measurements or override approval statuses.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-warmGrey/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-sand-100 rounded-xl transition-colors"
          >
            Close Dossier
          </button>

          {survey.status === 'approved' && onProceedToQuotation && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToQuotation(survey);
              }}
              className="px-5 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-sage" />
              <span>Ready for Quotation → Generate Proposal</span>
            </button>
          )}
        </div>

      </div>
    </Modal>
  );
};
