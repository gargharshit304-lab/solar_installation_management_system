import React, { useState, useEffect } from 'react';
import { 
  X, Compass, MapPin, Phone, Mail, Calendar, Clock, 
  CheckCircle2, AlertTriangle, FileText, Camera, Upload, 
  Trash2, Eye, ArrowRight, Shield, Zap, Sun, AlertCircle,
  Save, Send, ChevronRight, Check, Play, Info
} from 'lucide-react';
import { SiteSurvey, SurveyPhotoAttachment } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

interface SiteSurveyWorkspaceModalProps {
  survey: SiteSurvey;
  isOpen: boolean;
  onClose: () => void;
}

export const SiteSurveyWorkspaceModal: React.FC<SiteSurveyWorkspaceModalProps> = ({
  survey,
  isOpen,
  onClose
}) => {
  const { 
    currentUser, 
    startSurvey, 
    saveSurveyDraft, 
    submitSurveyReport,
    customers,
    showToast 
  } = useApp();

  const customer = customers.find(c => c.id === survey.customerId);

  // Active form section
  const [activeTab, setActiveTab] = useState<'measurements' | 'shadow' | 'electrical' | 'site' | 'photos' | 'notes'>('measurements');

  // Form State initialized from survey
  const [roofType, setRoofType] = useState(survey.roofType || 'RCC Flat Concrete');
  const [roofLengthM, setRoofLengthM] = useState<string>(survey.roofLengthM?.toString() || survey.roofDimensions?.lengthM?.toString() || '12.5');
  const [roofWidthM, setRoofWidthM] = useState<string>(survey.roofWidthM?.toString() || survey.roofDimensions?.widthM?.toString() || '7.5');
  const [totalRoofAreaSqm, setTotalRoofAreaSqm] = useState<string>(survey.totalRoofAreaSqm?.toString() || '93.75');
  const [shadowFreeAreaSqm, setShadowFreeAreaSqm] = useState<string>(survey.shadowFreeAreaSqm?.toString() || '75.0');
  const [roofDirection, setRoofDirection] = useState(survey.roofDirection || 'South');
  const [roofTiltDegrees, setRoofTiltDegrees] = useState<string>(survey.roofTiltDegrees?.toString() || '15.0');
  const [roofCondition, setRoofCondition] = useState<'good' | 'fair' | 'needs_reinforcement'>(survey.roofCondition || 'good');
  const [availableInstallationSpace, setAvailableInstallationSpace] = useState(survey.availableInstallationSpace || 'Adequate space along south boundary for 12 x 540W modules');

  // Shadow Analysis
  const [nearbyObstructions, setNearbyObstructions] = useState(survey.nearbyObstructions || 'Water tank overhead on NE corner; no tall trees on Southern azimuth');
  const [shadowObservations, setShadowObservations] = useState(survey.shadowObservations || '100% unshaded between 09:30 AM and 04:30 PM. Negligible winter tilt shadow.');
  const [estimatedShadingImpactPct, setEstimatedShadingImpactPct] = useState<string>(survey.estimatedShadingImpactPct?.toString() || '4.5');

  // Electrical Details
  const [gridConnectionAvailable, setGridConnectionAvailable] = useState<boolean>(survey.gridConnectionAvailable ?? true);
  const [existingConnectionPhase, setExistingConnectionPhase] = useState<'single_phase' | 'three_phase'>(survey.phaseType || 'single_phase');
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState<string>(survey.sanctionedLoadKw?.toString() || '5.0');
  const [meterNumber, setMeterNumber] = useState(survey.meterNumber || 'MSEDCL-2026-99214');
  const [mainPanelCondition, setMainPanelCondition] = useState<'good' | 'acceptable' | 'upgrade_required'>(survey.mainPanelCondition || 'good');
  const [proposedInverterLocation, setProposedInverterLocation] = useState(survey.proposedInverterLocation || 'Terrace staircase landing (covered & weather-protected)');
  const [cableDistanceMeters, setCableDistanceMeters] = useState<string>(survey.cableDistanceMeters?.toString() || '18.0');
  const [earthingRequirement, setEarthingRequirement] = useState(survey.earthingRequirement || 'Separate dual chemical earthing pit required (AC + DC/Lighting)');
  const [additionalElectricalObservations, setAdditionalElectricalObservations] = useState(survey.additionalElectricalObservations || 'DISCOM distribution transformer at 45m distance. Neutral-to-ground voltage is 1.8V.');

  // Site Conditions
  const [roofAccessibility, setRoofAccessibility] = useState(survey.roofAccessibility || 'Internal wide concrete staircase with terrace access door');
  const [structuralConcerns, setStructuralConcerns] = useState(survey.structuralConcerns || 'RCC slab is sound and verified waterproofed. Capable of supporting standard ballast mounts.');
  const [installationObstacles, setInstallationObstacles] = useState(survey.installationObstacles || 'DTH antenna dish on East wall (requires relocation by 1.5m)');
  const [safetyConsiderations, setSafetyConsiderations] = useState(survey.safetyConsiderations || 'Parapet wall height is 3.5 ft. Safety lifeline anchor points available.');
  const [waterLeakageConcerns, setWaterLeakageConcerns] = useState(survey.waterLeakageConcerns || 'No seepage stains or ponding observed.');
  const [additionalSiteObservations, setAdditionalSiteObservations] = useState(survey.additionalSiteObservations || 'Customer requested concealed cable conduit through ventilation shaft.');

  // Technician Notes
  const [technicianNotes, setTechnicianNotes] = useState(survey.technicianNotes || survey.technicianObservations || 'Site is highly suitable for on-grid solar installation. Recommend 4kW to 5kW system capacity with bi-facial or mono PERC panels.');

  // Photographs
  const [photos, setPhotos] = useState<SurveyPhotoAttachment[]>(
    survey.surveyPhotos && survey.surveyPhotos.length > 0 
      ? survey.surveyPhotos 
      : [
          {
            id: 'ph-1',
            category: 'Rooftop Overview',
            url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=80',
            caption: 'Panoramic view of flat terrace facing South',
            uploadedAt: '2026-11-21 11:30'
          },
          {
            id: 'ph-2',
            category: 'Roof Measurements',
            url: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=600&auto=format&fit=crop&q=80',
            caption: 'Laser distance meter verification along Southern axis',
            uploadedAt: '2026-11-21 11:42'
          },
          {
            id: 'ph-3',
            category: 'Electrical Panel',
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
            caption: 'Consumer distribution board and MSEDCL meter location',
            uploadedAt: '2026-11-21 12:05'
          }
        ]
  );

  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<SurveyPhotoAttachment['category']>('Rooftop Overview');
  const [photoCaptionInput, setPhotoCaptionInput] = useState('');
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState<string | null>(null);

  // Auto-calculate total area when length or width changes
  useEffect(() => {
    const l = parseFloat(roofLengthM);
    const w = parseFloat(roofWidthM);
    if (!isNaN(l) && !isNaN(w) && l > 0 && w > 0) {
      const calculatedArea = (l * w).toFixed(2);
      setTotalRoofAreaSqm(calculatedArea);
    }
  }, [roofLengthM, roofWidthM]);

  if (!isOpen) return null;

  const isEditable = survey.status === 'in_progress' || survey.reviewStatus === 'corrections_required' || survey.status === 'assigned' || survey.status === 'scheduled';
  const isStarted = survey.status === 'in_progress' || survey.status === 'submitted' || survey.status === 'approved';

  const handleStartSurvey = () => {
    const ok = startSurvey(survey.id);
    if (ok) {
      showToast('Survey marked In Progress. Form unlocked for entry.', 'success');
    }
  };

  const handleSaveDraft = () => {
    saveSurveyDraft(survey.id, {
      roofType,
      roofLengthM: parseFloat(roofLengthM) || 0,
      roofWidthM: parseFloat(roofWidthM) || 0,
      totalRoofAreaSqm: parseFloat(totalRoofAreaSqm) || 0,
      shadowFreeAreaSqm: parseFloat(shadowFreeAreaSqm) || 0,
      roofDirection,
      roofTiltDegrees: parseFloat(roofTiltDegrees) || 0,
      roofCondition,
      availableInstallationSpace,
      nearbyObstructions,
      shadowObservations,
      estimatedShadingImpactPct: parseFloat(estimatedShadingImpactPct) || 0,
      gridConnectionAvailable,
      phaseType: existingConnectionPhase,
      sanctionedLoadKw: parseFloat(sanctionedLoadKw) || 0,
      meterNumber,
      mainPanelCondition,
      proposedInverterLocation,
      cableDistanceMeters: parseFloat(cableDistanceMeters) || 0,
      earthingRequirement,
      additionalElectricalObservations,
      roofAccessibility,
      structuralConcerns,
      installationObstacles,
      safetyConsiderations,
      waterLeakageConcerns,
      additionalSiteObservations,
      technicianNotes,
      surveyPhotos: photos
    });
  };

  const handleSubmitReport = () => {
    // Validation
    const l = parseFloat(roofLengthM);
    const w = parseFloat(roofWidthM);
    const sf = parseFloat(shadowFreeAreaSqm);

    if (isNaN(l) || l <= 0 || isNaN(w) || w <= 0) {
      showToast('Please enter valid positive roof dimensions (Length and Width).', 'error');
      setActiveTab('measurements');
      return;
    }

    if (isNaN(sf) || sf <= 0) {
      showToast('Please provide the measured shadow-free area.', 'error');
      setActiveTab('measurements');
      return;
    }

    if (photos.length === 0) {
      showToast('At least one site photograph is mandatory before submission.', 'warning');
      setActiveTab('photos');
      return;
    }

    submitSurveyReport(survey.id, {
      roofType,
      roofLengthM: l,
      roofWidthM: w,
      totalRoofAreaSqm: parseFloat(totalRoofAreaSqm) || (l * w),
      shadowFreeAreaSqm: sf,
      roofDirection,
      roofTiltDegrees: parseFloat(roofTiltDegrees) || 15,
      roofCondition,
      availableInstallationSpace,
      nearbyObstructions,
      shadowObservations,
      estimatedShadingImpactPct: parseFloat(estimatedShadingImpactPct) || 0,
      gridConnectionAvailable,
      phaseType: existingConnectionPhase,
      sanctionedLoadKw: parseFloat(sanctionedLoadKw) || 0,
      meterNumber,
      mainPanelCondition,
      proposedInverterLocation,
      cableDistanceMeters: parseFloat(cableDistanceMeters) || 0,
      earthingRequirement,
      additionalElectricalObservations,
      roofAccessibility,
      structuralConcerns,
      installationObstacles,
      safetyConsiderations,
      waterLeakageConcerns,
      additionalSiteObservations,
      technicianNotes,
      surveyPhotos: photos
    });

    onClose();
  };

  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=80'
    ];
    const randomUrl = samplePhotos[photos.length % samplePhotos.length];
    
    const newAttachment: SurveyPhotoAttachment = {
      id: `ph-${Date.now()}`,
      category: selectedPhotoCategory,
      url: randomUrl,
      caption: photoCaptionInput || `${selectedPhotoCategory} captured on site inspection`,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setPhotos(prev => [...prev, newAttachment]);
    setPhotoCaptionInput('');
    showToast(`Photograph attached under ${selectedPhotoCategory}`, 'success');
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    showToast('Photo removed', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-dropdown border border-warmGrey max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-charcoal text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber/20 text-amber border border-amber/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold tracking-wider text-amber">
                  {survey.surveyNumber}
                </span>
                <span className="text-warmGrey-light">•</span>
                <span className="text-xs text-sand">Site Survey Technical Workspace</span>
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

        {/* Customer & Appointment Bar */}
        <div className="bg-sand-50/90 px-5 py-3 border-b border-warmGrey/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-charcoal">
            <div className="flex items-center space-x-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-navy shrink-0" />
              <span>{survey.customerAddress || customer?.address}</span>
            </div>
            <div className="flex items-center space-x-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber shrink-0" />
              <span>{new Date(survey.scheduledDate).toLocaleDateString()} ({survey.timeSlot || '10:00 AM - 12:00 PM'})</span>
            </div>
            <div className="flex items-center space-x-1.5 text-navy font-bold">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>{customer?.interestedCapacityKw || 5} kW System</span>
            </div>
          </div>

          {/* Quick Contact Actions */}
          <div className="flex items-center space-x-2">
            <a
              href={`tel:${survey.customerPhone.replace(/\s+/g, '')}`}
              className="px-2.5 py-1 bg-white hover:bg-navy hover:text-white text-navy font-semibold text-[11px] rounded-lg border border-warmGrey/80 shadow-2xs flex items-center space-x-1 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Call Customer</span>
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(survey.customerAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-white hover:bg-sand-100 text-charcoal font-semibold text-[11px] rounded-lg border border-warmGrey/80 shadow-2xs flex items-center space-x-1 transition-colors"
            >
              <MapPin className="w-3 h-3 text-amber" />
              <span>Map Route</span>
            </a>
          </div>
        </div>

        {/* Reviewer / Engineering Alerts if corrections requested */}
        {survey.reviewStatus === 'corrections_required' && (
          <div className="bg-amber-50 px-5 py-3 border-b border-amber/30 text-xs text-amber-dark flex items-start space-x-2.5 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Engineering Corrections Requested: </span>
              <span>{survey.correctionsRequestedNotes || 'Please revise shadow calculations and upload additional photos.'}</span>
            </div>
          </div>
        )}

        {/* Start Survey Banner if Scheduled / Assigned */}
        {!isStarted && (
          <div className="bg-navy/5 p-4 border-b border-navy/20 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <Info className="w-5 h-5 text-navy shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-navy">Survey has not been initiated yet.</p>
                <p className="text-mutedGrey">Click "Start Site Survey" upon reaching the customer rooftop to log start timestamp and unlock the inspection form.</p>
              </div>
            </div>
            <button
              onClick={handleStartSurvey}
              className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light shadow-sm flex items-center space-x-2 shrink-0 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Site Survey</span>
            </button>
          </div>
        )}

        {/* Form Tabs Navigation */}
        <div className="px-5 pt-3 bg-white border-b border-warmGrey/60 flex space-x-2 overflow-x-auto text-xs shrink-0 select-none">
          <button
            onClick={() => setActiveTab('measurements')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'measurements' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            <span>A. Rooftop Measurements</span>
          </button>
          <button
            onClick={() => setActiveTab('shadow')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'shadow' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            <span>B. Shadow Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('electrical')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'electrical' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            <span>C. Electrical Information</span>
          </button>
          <button
            onClick={() => setActiveTab('site')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'site' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            <span>D. Site Conditions</span>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'photos' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber" />
            <span>E. Photographs ({photos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'notes' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            <span>F. Recommendations</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-sand-50/30">
          
          {/* TAB A: ROOFTOP MEASUREMENTS */}
          {activeTab === 'measurements' && (
            <div className="space-y-4">
              <div className="border-b border-warmGrey/60 pb-2">
                <h3 className="text-sm font-bold text-charcoal">Rooftop Physical Dimensions & Orientation</h3>
                <p className="text-xs text-mutedGrey">Measure using ultrasonic or laser distance meter with continuous mode.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Roof Type *</label>
                  <select
                    value={roofType}
                    disabled={!isEditable}
                    onChange={e => setRoofType(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white focus:ring-1 focus:ring-navy"
                  >
                    <option value="RCC Flat Concrete">RCC Flat Concrete Terrace</option>
                    <option value="Sloped Metal Tin Shed">Sloped Metal Tin Shed</option>
                    <option value="Sloping Tiled Roof">Sloping Tiled Mangalore Roof</option>
                    <option value="Terrace with Shed">Terrace with GI Shed</option>
                    <option value="Commercial RCC Slab">Commercial RCC Slab</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Roof Length (meters) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={roofLengthM}
                    disabled={!isEditable}
                    onChange={e => setRoofLengthM(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white font-mono"
                    placeholder="e.g. 15.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Roof Width (meters) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={roofWidthM}
                    disabled={!isEditable}
                    onChange={e => setRoofWidthM(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white font-mono"
                    placeholder="e.g. 8.2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Total Roof Area (sq.m)</label>
                  <div className="p-2.5 border border-warmGrey rounded-xl bg-sand-100 font-mono font-bold text-navy">
                    {totalRoofAreaSqm} sq.m ({((parseFloat(totalRoofAreaSqm) || 0) * 10.764).toFixed(0)} sq.ft)
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Available Shadow-Free Area (sq.m) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={shadowFreeAreaSqm}
                    disabled={!isEditable}
                    onChange={e => setShadowFreeAreaSqm(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white font-mono font-bold text-sage"
                    placeholder="e.g. 75.0"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Roof Direction (Azimuth) *</label>
                  <select
                    value={roofDirection}
                    disabled={!isEditable}
                    onChange={e => setRoofDirection(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white font-semibold"
                  >
                    <option value="South">True South (Optimal 180°)</option>
                    <option value="South-East">South-East (150°)</option>
                    <option value="South-West">South-West (210°)</option>
                    <option value="East">East (90°)</option>
                    <option value="West">West (270°)</option>
                    <option value="North">North (Sub-optimal)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Roof Tilt Angle (degrees)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="60"
                    value={roofTiltDegrees}
                    disabled={!isEditable}
                    onChange={e => setRoofTiltDegrees(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Roof Slab Structural Condition</label>
                  <select
                    value={roofCondition}
                    disabled={!isEditable}
                    onChange={e => setRoofCondition(e.target.value as any)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                  >
                    <option value="good">Good (No cracks, sound RCC slab)</option>
                    <option value="fair">Fair (Minor surface wear, suitable)</option>
                    <option value="needs_reinforcement">Needs Structural Reinforcement</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-charcoal mb-1">Available Installation Space Observations</label>
                  <textarea
                    rows={2}
                    value={availableInstallationSpace}
                    disabled={!isEditable}
                    onChange={e => setAvailableInstallationSpace(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white text-xs"
                    placeholder="Describe clear zones, module layout arrangement, setbacks from parapet..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB B: SHADOW ANALYSIS */}
          {activeTab === 'shadow' && (
            <div className="space-y-4">
              <div className="border-b border-warmGrey/60 pb-2">
                <h3 className="text-sm font-bold text-charcoal">Shadow Analysis & Solar Obstruction Mapping</h3>
                <p className="text-xs text-mutedGrey">Identify trees, parapet walls, water tanks, elevator shafts and neighboring constructions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal mb-1">Nearby Buildings, Trees or Overhead Obstructions *</label>
                  <textarea
                    rows={3}
                    value={nearbyObstructions}
                    disabled={!isEditable}
                    onChange={e => setNearbyObstructions(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                    placeholder="e.g. Overhead plastic water storage tank (1.8m height) on North-East. 3-story building on West casts shadow after 4:45 PM..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal mb-1">Seasonal Sun Path & Shading Observations</label>
                  <textarea
                    rows={3}
                    value={shadowObservations}
                    disabled={!isEditable}
                    onChange={e => setShadowObservations(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                    placeholder="Record sun angle check, morning vs evening shadow profile, winter solar azimuth impact..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Estimated Shading Impact Percentage (%)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={estimatedShadingImpactPct}
                      disabled={!isEditable}
                      onChange={e => setEstimatedShadingImpactPct(e.target.value)}
                      className="w-32 p-2.5 border border-warmGrey rounded-xl bg-white font-mono font-bold"
                    />
                    <span className="text-xs text-mutedGrey">
                      {parseFloat(estimatedShadingImpactPct) <= 5 ? '✓ Low shadow loss (optimal)' : '⚠️ Consider elevated structure or panel tilt adjustment'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB C: ELECTRICAL INFORMATION */}
          {activeTab === 'electrical' && (
            <div className="space-y-4">
              <div className="border-b border-warmGrey/60 pb-2">
                <h3 className="text-sm font-bold text-charcoal">Electrical Infrastructure & Grid Interconnection</h3>
                <p className="text-xs text-mutedGrey">Inspect meter box, sanctioned load, earthing resistance, and inverter cable routing.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Existing Electrical Connection Phase *</label>
                  <select
                    value={existingConnectionPhase}
                    disabled={!isEditable}
                    onChange={e => setExistingConnectionPhase(e.target.value as any)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white font-medium"
                  >
                    <option value="single_phase">Single Phase (230V AC)</option>
                    <option value="three_phase">Three Phase (415V AC)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Sanctioned Grid Load (kW) *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sanctionedLoadKw}
                    disabled={!isEditable}
                    onChange={e => setSanctionedLoadKw(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white font-mono"
                    placeholder="e.g. 5.0"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Consumer Meter Number</label>
                  <input
                    type="text"
                    value={meterNumber}
                    disabled={!isEditable}
                    onChange={e => setMeterNumber(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white font-mono uppercase"
                    placeholder="e.g. MSEDCL-110294"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Main Electrical Panel Condition</label>
                  <select
                    value={mainPanelCondition}
                    disabled={!isEditable}
                    onChange={e => setMainPanelCondition(e.target.value as any)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                  >
                    <option value="good">Good (Clean wiring, space for solar MCB)</option>
                    <option value="acceptable">Acceptable (Minor reorganizing needed)</option>
                    <option value="upgrade_required">Upgrade Required (Overcrowded / Old fuses)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Proposed Inverter Location *</label>
                  <input
                    type="text"
                    value={proposedInverterLocation}
                    disabled={!isEditable}
                    onChange={e => setProposedInverterLocation(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                    placeholder="e.g. Shaded terrace wall near stairwell"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">AC Cable Distance to Main Panel (m)</label>
                  <input
                    type="number"
                    step="1"
                    value={cableDistanceMeters}
                    disabled={!isEditable}
                    onChange={e => setCableDistanceMeters(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white font-mono"
                    placeholder="e.g. 20"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-charcoal mb-1">Earthing System Requirement</label>
                  <input
                    type="text"
                    value={earthingRequirement}
                    disabled={!isEditable}
                    onChange={e => setEarthingRequirement(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                    placeholder="e.g. Existing earth pit measured 4.2 ohms; new dedicated copper chemical earthing pit required."
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-charcoal mb-1">Additional Electrical Observations</label>
                  <textarea
                    rows={2}
                    value={additionalElectricalObservations}
                    disabled={!isEditable}
                    onChange={e => setAdditionalElectricalObservations(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                    placeholder="Grid stability, voltage fluctuations, transformer distance, backup generator presence..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB D: SITE CONDITIONS */}
          {activeTab === 'site' && (
            <div className="space-y-4">
              <div className="border-b border-warmGrey/60 pb-2">
                <h3 className="text-sm font-bold text-charcoal">Site Accessibility, Logistics & Safety</h3>
                <p className="text-xs text-mutedGrey">Evaluate material transport path, crane access, and safety equipment requirements.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Rooftop Accessibility</label>
                  <input
                    type="text"
                    value={roofAccessibility}
                    disabled={!isEditable}
                    onChange={e => setRoofAccessibility(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                    placeholder="e.g. Internal concrete staircase / External scaffolding"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Safety & Lifeline Anchor Points</label>
                  <input
                    type="text"
                    value={safetyConsiderations}
                    disabled={!isEditable}
                    onChange={e => setSafetyConsiderations(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                    placeholder="e.g. Parapet wall is 3.5 ft; safety harness anchor available"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Installation Obstacles</label>
                  <input
                    type="text"
                    value={installationObstacles}
                    disabled={!isEditable}
                    onChange={e => setInstallationObstacles(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                    placeholder="e.g. Water pipelines on terrace floor, TV dish antennas"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">Waterproofing & Leakage Integrity</label>
                  <input
                    type="text"
                    value={waterLeakageConcerns}
                    disabled={!isEditable}
                    onChange={e => setWaterLeakageConcerns(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                    placeholder="e.g. Waterproofing membrane intact; avoid mechanical puncture anchors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal mb-1">Structural & Material Hoisting Assessment</label>
                  <textarea
                    rows={2}
                    value={structuralConcerns}
                    disabled={!isEditable}
                    onChange={e => setStructuralConcerns(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white"
                    placeholder="Describe module lifting access, parking space for transport truck, structural beam alignment..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB E: PHOTOGRAPHS */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-warmGrey/60 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-charcoal">Site Survey Photography & Documentation</h3>
                  <p className="text-xs text-mutedGrey">Attach clear photos of roof, measurement laser, distribution box, and inverter location.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sand-100 text-charcoal border border-warmGrey/60">
                  {photos.length} Attachments
                </span>
              </div>

              {/* Upload New Photo Bar */}
              {isEditable && (
                <div className="p-4 bg-white rounded-xl border border-warmGrey/80 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-navy flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-amber" />
                    <span>Attach Site Photograph</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-mutedGrey mb-1">Photo Category *</label>
                      <select
                        value={selectedPhotoCategory}
                        onChange={e => setSelectedPhotoCategory(e.target.value as any)}
                        className="w-full p-2 border border-warmGrey rounded-lg bg-white"
                      >
                        <option value="Rooftop Overview">Rooftop Overview</option>
                        <option value="Roof Measurements">Roof Measurements</option>
                        <option value="Shadow Analysis">Shadow Analysis</option>
                        <option value="Electrical Panel">Electrical Panel</option>
                        <option value="Proposed Inverter Location">Proposed Inverter Location</option>
                        <option value="Cable Route">Cable Route</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-mutedGrey mb-1">Caption / Observations</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={photoCaptionInput}
                          onChange={e => setPhotoCaptionInput(e.target.value)}
                          placeholder="e.g. West side parapet wall laser measurement"
                          className="flex-1 p-2 border border-warmGrey rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleAddSamplePhoto}
                          className="px-3.5 py-2 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light text-xs flex items-center space-x-1.5 shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach Photo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map(p => (
                  <div key={p.id} className="bg-white rounded-xl border border-warmGrey/80 overflow-hidden shadow-2xs flex flex-col group">
                    <div className="relative h-44 bg-sand-100 overflow-hidden cursor-pointer" onClick={() => setIsPhotoViewerOpen(p.url)}>
                      <img
                        src={p.url}
                        alt={p.caption || p.category}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-charcoal/80 text-white backdrop-blur-xs">
                        {p.category}
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between text-xs space-y-2">
                      <div>
                        <p className="font-semibold text-charcoal text-[11px] leading-snug">
                          {p.caption || 'No caption provided'}
                        </p>
                        <span className="text-[10px] text-mutedGrey mt-1 block">
                          Captured: {p.uploadedAt}
                        </span>
                      </div>

                      {isEditable && (
                        <div className="flex items-center justify-end pt-1 border-t border-warmGrey/40">
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(p.id)}
                            className="text-terracotta hover:underline text-[11px] font-semibold flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB F: RECOMMENDATIONS */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="border-b border-warmGrey/60 pb-2">
                <h3 className="text-sm font-bold text-charcoal">Technician Final Observations & Engineering Recommendations</h3>
                <p className="text-xs text-mutedGrey">Summarize recommended solar capacity, module orientation, and points requiring Engineering Lead verification.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Survey Specialist Technical Notes *</label>
                  <textarea
                    rows={5}
                    value={technicianNotes}
                    disabled={!isEditable}
                    onChange={e => setTechnicianNotes(e.target.value)}
                    className="w-full p-3 border border-warmGrey rounded-xl bg-white text-xs leading-relaxed"
                    placeholder="Enter comprehensive rooftop observations, recommended system capacity, cable layout recommendations..."
                  />
                </div>

                {survey.engineeringReviewNotes && (
                  <div className="p-3.5 bg-sage-50 rounded-xl border border-sage/30 text-xs">
                    <span className="font-bold text-sage block">Engineering Lead Approval Feedback:</span>
                    <p className="text-charcoal mt-1">{survey.engineeringReviewNotes}</p>
                    <span className="text-[10px] text-mutedGrey mt-1 block">Approved by: {survey.engineeringApproverName || 'Engineering Lead'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white border-t border-warmGrey/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-mutedGrey">
            <span>Status:</span>
            <strong className="text-charcoal capitalize">{survey.status.replace('_', ' ')}</strong>
            {survey.reviewStatus && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-sand-100 text-charcoal font-semibold">
                Review: {survey.reviewStatus.replace('_', ' ')}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-sand-100 hover:bg-sand-200 text-charcoal font-semibold text-xs rounded-xl border border-warmGrey transition-colors"
            >
              Close
            </button>

            {isEditable && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-white hover:bg-sand-100 text-charcoal font-semibold text-xs rounded-xl border border-warmGrey shadow-2xs flex items-center space-x-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-amber" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitReport}
                  className="px-5 py-2 bg-navy hover:bg-navy-light text-white font-semibold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Engineering Approval</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Full Photo Preview Lightbox */}
      {isPhotoViewerOpen && (
        <div className="fixed inset-0 z-60 bg-charcoal/80 flex items-center justify-center p-4" onClick={() => setIsPhotoViewerOpen(null)}>
          <div className="max-w-3xl max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
            <img src={isPhotoViewerOpen} alt="Preview" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            <button
              onClick={() => setIsPhotoViewerOpen(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-charcoal text-white hover:bg-charcoal-light"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
