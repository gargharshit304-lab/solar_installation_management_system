import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Calendar, Clock, AlertTriangle, CheckCircle2, 
  MapPin, Phone, Zap, FileText, AlertCircle, Info, ShieldAlert,
  Lock, Building, Plus, Search, ChevronDown, Check
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Employee, SiteSurvey, Customer, CustomerSite } from '../../types';

interface AssignSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowMode?: 'survey_first' | 'technician_first';
  lockedTechnician?: Employee | null;
  survey?: SiteSurvey | null;
  isReassign?: boolean;
  initialDate?: string;
  initialTimeSlot?: string;
}

const TIME_SLOTS = [
  '09:30 AM - 11:30 AM',
  '12:00 PM - 02:00 PM',
  '02:30 PM - 04:30 PM',
  '04:30 PM - 06:30 PM'
];

const PROPERTY_TYPES = [
  'RCC Flat Terrace',
  'Sloped Metal Tin Shed',
  'Sloping Tiled Roof',
  'Commercial RCC Slab',
  'Ground Mount Area'
];

export const AssignSurveyModal: React.FC<AssignSurveyModalProps> = ({
  isOpen,
  onClose,
  workflowMode,
  lockedTechnician,
  survey,
  isReassign = false,
  initialDate,
  initialTimeSlot
}) => {
  const { 
    employees, 
    customers, 
    customerSites,
    surveys, 
    technicianLeaves, 
    getNextSurveyNumber,
    assignSurveyTechnician, 
    reassignSurveyTechnician, 
    addCustomerSite,
    showToast 
  } = useApp();

  // Determine active workflow: 'technician_first' (locking specialist) vs 'survey_first' (preselected survey)
  const isTechnicianFirst = workflowMode === 'technician_first' || (!!lockedTechnician && !survey);

  // Survey specialists team
  const surveyTechnicians = employees.filter(
    e => e.role === 'survey_tech' || e.department === 'Field Engineering'
  );

  // Unassigned surveys eligible for assignment in Workflow A
  const unassignedSurveys = surveys.filter(s => s.status === 'unassigned');

  // WORKFLOW A (Technician-First) States
  const [requestMode, setRequestMode] = useState<'existing_request' | 'new_request'>('existing_request');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(
    unassignedSurveys[0]?.id || ''
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    survey?.customerId || customers[0]?.id || ''
  );

  // WORKFLOW B (Survey-First) States
  const [selectedTechId, setSelectedTechId] = useState<string>(
    lockedTechnician?.id || (isReassign ? '' : survey?.technicianId || surveyTechnicians[0]?.id || '')
  );

  // SITE SELECTION States (Both Workflows)
  const [siteMode, setSiteMode] = useState<'existing_site' | 'new_site'>('existing_site');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  
  // New site input fields
  const [newSiteLabel, setNewSiteLabel] = useState('Primary Rooftop Site');
  const [newSiteAddress, setNewSiteAddress] = useState('');
  const [newSiteCity, setNewSiteCity] = useState('Pune');
  const [newSitePincode, setNewSitePincode] = useState('411045');
  const [newSitePropertyType, setNewSitePropertyType] = useState('RCC Flat Terrace');
  const [newSiteSanctionedLoad, setNewSiteSanctionedLoad] = useState<number>(5.0);
  const [newSitePhase, setNewSitePhase] = useState<'single_phase' | 'three_phase'>('three_phase');
  const [saveSiteToProfile, setSaveSiteToProfile] = useState(true);

  // APPOINTMENT States
  const [scheduledDate, setScheduledDate] = useState<string>(
    initialDate || survey?.scheduledDate.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>(
    initialTimeSlot || survey?.timeSlot || TIME_SLOTS[0]
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    survey?.estimatedDurationMinutes || 90
  );
  const [instructions, setInstructions] = useState<string>(survey?.instructions || '');
  const [reassignReason, setReassignReason] = useState<string>('');

  // Active customer object resolution
  let activeCustomer: Customer | undefined;
  if (!isTechnicianFirst && survey) {
    activeCustomer = customers.find(c => c.id === survey.customerId);
  } else if (isTechnicianFirst && requestMode === 'existing_request') {
    const matchingSurvey = unassignedSurveys.find(s => s.id === selectedSurveyId);
    activeCustomer = customers.find(c => c.id === matchingSurvey?.customerId);
  } else {
    activeCustomer = customers.find(c => c.id === selectedCustomerId);
  }

  // Active registered sites for current customer
  const registeredSites: CustomerSite[] = activeCustomer
    ? (activeCustomer.sites && activeCustomer.sites.length > 0
        ? activeCustomer.sites 
        : customerSites.filter(s => s.customerId === activeCustomer?.id))
    : [];

  // Sync defaults when customer or survey changes
  useEffect(() => {
    if (activeCustomer) {
      if (registeredSites.length > 0) {
        setSelectedSiteId(registeredSites[0].id);
        setNewSiteAddress(registeredSites[0].address);
        setNewSiteCity(registeredSites[0].city);
        setNewSitePincode(registeredSites[0].pincode);
        setNewSitePropertyType(registeredSites[0].propertyType);
      } else {
        setSelectedSiteId('');
        setNewSiteAddress(activeCustomer.address);
        setNewSiteCity(activeCustomer.city);
        setNewSitePincode('411001');
        setNewSitePropertyType(activeCustomer.roofType || 'RCC Flat Terrace');
      }
    }
  }, [activeCustomer?.id]);

  // When selected existing site changes in dropdown
  const handleSiteSelectionChange = (siteId: string) => {
    setSelectedSiteId(siteId);
    const s = registeredSites.find(item => item.id === siteId);
    if (s) {
      setNewSiteAddress(s.address);
      setNewSiteCity(s.city);
      setNewSitePincode(s.pincode);
      setNewSitePropertyType(s.propertyType);
      if (s.sanctionedLoadKw) setNewSiteSanctionedLoad(s.sanctionedLoadKw);
      if (s.phaseType) setNewSitePhase(s.phaseType);
    }
  };

  // Prepopulate if opened for a specific survey
  useEffect(() => {
    if (survey) {
      setInstructions(survey.instructions || '');
      if (survey.scheduledDate) setScheduledDate(survey.scheduledDate.split('T')[0]);
      if (survey.timeSlot) setTimeSlot(survey.timeSlot);
      if (!isTechnicianFirst) {
        if (!isReassign && survey.technicianId) {
          setSelectedTechId(survey.technicianId);
        } else if (isReassign) {
          const altTech = surveyTechnicians.find(t => t.id !== survey.technicianId);
          setSelectedTechId(altTech?.id || '');
        }
      }
    }
  }, [survey, isReassign, isTechnicianFirst]);

  // Active Technician for Conflict Validation
  const effectiveTechId = isTechnicianFirst ? lockedTechnician?.id : selectedTechId;
  const effectiveTech = isTechnicianFirst 
    ? lockedTechnician 
    : employees.find(e => e.id === selectedTechId);

  // Conflict 1: Leave Check
  const isOnLeave = effectiveTech && technicianLeaves.find(l => 
    l.technicianId === effectiveTech.id &&
    l.status === 'approved' &&
    scheduledDate >= l.startDate && scheduledDate <= l.endDate
  );

  // Conflict 2: Double-Booking Overlap Check
  const conflictingSurvey = effectiveTech && surveys.find(s => 
    s.id !== (isTechnicianFirst ? selectedSurveyId : survey?.id) &&
    s.technicianId === effectiveTech.id &&
    s.scheduledDate.split('T')[0] === scheduledDate &&
    (s.timeSlot === timeSlot || (!s.timeSlot && s.scheduledDate.split('T')[1]?.startsWith(timeSlot.split(':')[0]))) &&
    s.status !== 'cancelled' && s.status !== 'rejected'
  );

  const dailyWorkload = effectiveTech ? surveys.filter(s => 
    s.technicianId === effectiveTech.id &&
    s.scheduledDate.split('T')[0] === scheduledDate &&
    s.status !== 'cancelled' && s.status !== 'rejected'
  ).length : 0;

  const isBlocked = !effectiveTech || !!isOnLeave || !!conflictingSurvey || (isReassign && !reassignReason.trim());

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!effectiveTech) {
      showToast('Please select a survey specialist', 'error');
      return;
    }

    if (isOnLeave) {
      showToast(`${effectiveTech.fullName} is on leave on ${scheduledDate}`, 'error');
      return;
    }

    if (conflictingSurvey) {
      showToast(`Conflict: ${effectiveTech.fullName} is already assigned to ${conflictingSurvey.surveyNumber} at ${timeSlot}`, 'error');
      return;
    }

    if (!activeCustomer) {
      showToast('Please select a valid customer for survey assignment', 'error');
      return;
    }

    // Resolve site details
    let finalAddress = newSiteAddress || activeCustomer.address;
    let finalSiteLabel = siteMode === 'existing_site' 
      ? (registeredSites.find(s => s.id === selectedSiteId)?.siteLabel || 'Primary Site')
      : newSiteLabel;
    let finalPropertyType = newSitePropertyType || activeCustomer.roofType || 'RCC Flat Terrace';
    let finalPincode = newSitePincode || '411001';

    // If new site entered and save requested, persist to customer
    if (siteMode === 'new_site' && saveSiteToProfile && newSiteAddress.trim()) {
      addCustomerSite({
        customerId: activeCustomer.id,
        siteLabel: finalSiteLabel,
        address: finalAddress,
        city: newSiteCity,
        state: 'Maharashtra',
        pincode: finalPincode,
        propertyType: finalPropertyType,
        sanctionedLoadKw: newSiteSanctionedLoad,
        phaseType: newSitePhase
      });
    }

    const fullIsoDate = `${scheduledDate}T${timeSlot.startsWith('09') ? '09:30:00' : timeSlot.startsWith('12') ? '12:00:00' : timeSlot.startsWith('02') ? '14:30:00' : '16:30:00'}`;

    if (isTechnicianFirst) {
      // WORKFLOW A: Technician is locked
      if (requestMode === 'existing_request') {
        const targetSurvey = unassignedSurveys.find(s => s.id === selectedSurveyId);
        if (!targetSurvey) {
          showToast('Please select an unassigned survey request', 'error');
          return;
        }

        assignSurveyTechnician({
          surveyId: targetSurvey.id,
          customerId: targetSurvey.customerId,
          technicianId: effectiveTech.id,
          scheduledDate: fullIsoDate,
          timeSlot,
          siteAddress: `${finalAddress}, ${newSiteCity}`,
          siteLabel: finalSiteLabel,
          propertyType: finalPropertyType,
          pincode: finalPincode,
          instructions,
          estimatedDurationMinutes: durationMinutes
        });
      } else {
        // Create new survey request directly assigned to locked specialist
        assignSurveyTechnician({
          customerId: activeCustomer.id,
          technicianId: effectiveTech.id,
          scheduledDate: fullIsoDate,
          timeSlot,
          siteAddress: `${finalAddress}, ${newSiteCity}`,
          siteLabel: finalSiteLabel,
          propertyType: finalPropertyType,
          pincode: finalPincode,
          instructions,
          estimatedDurationMinutes: durationMinutes
        });
      }
    } else {
      // WORKFLOW B: Survey is already selected
      if (!survey) return;

      if (isReassign) {
        if (!reassignReason.trim()) {
          showToast('Please enter a reason for reassignment', 'error');
          return;
        }
        reassignSurveyTechnician(
          survey.id,
          effectiveTech.id,
          reassignReason,
          fullIsoDate,
          timeSlot
        );
      } else {
        assignSurveyTechnician({
          surveyId: survey.id,
          customerId: survey.customerId,
          technicianId: effectiveTech.id,
          scheduledDate: fullIsoDate,
          timeSlot,
          siteAddress: `${finalAddress}, ${newSiteCity}`,
          siteLabel: finalSiteLabel,
          propertyType: finalPropertyType,
          pincode: finalPincode,
          instructions,
          estimatedDurationMinutes: durationMinutes
        });
      }
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isTechnicianFirst
          ? `Assign Survey to ${lockedTechnician?.fullName || 'Technician'}`
          : isReassign 
            ? `Reassign Specialist for ${survey?.surveyNumber}`
            : `Assign Specialist for Survey ${survey?.surveyNumber}`
      }
      subtitle={
        isTechnicianFirst
          ? "Specialist locked • Select customer, rooftop site and appointment slot"
          : `Survey ID: ${survey?.surveyNumber} • Customer: ${survey?.customerName}`
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* ==================================================================== */}
        {/* WORKFLOW A: LOCKED TECHNICIAN BANNER                                */}
        {/* ==================================================================== */}
        {isTechnicianFirst && lockedTechnician && (
          <div className="p-3.5 bg-navy/5 border border-navy/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-[11px] font-bold text-navy uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 mr-1" />
                Specialist Selection Locked
              </span>
              <span className="text-[10px] font-semibold text-mutedGrey bg-white px-2 py-0.5 rounded-md border border-warmGrey/60">
                Employee ID: {lockedTechnician.employeeCode}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {lockedTechnician.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-charcoal">{lockedTechnician.fullName}</h4>
                  <p className="text-xs text-mutedGrey">
                    {lockedTechnician.designation} • 📞 {lockedTechnician.phone}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage border border-sage/30">
                  ✓ Selected Specialist
                </span>
                <p className="text-[10px] text-mutedGrey mt-0.5">Selection cannot be changed</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* WORKFLOW B: PRESELECTED SURVEY & CUSTOMER DOSSIER                   */}
        {/* ==================================================================== */}
        {!isTechnicianFirst && survey && (
          <div className="p-3.5 bg-sand-50/80 rounded-xl border border-warmGrey/60 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-warmGrey/40 pb-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">Customer</span>
                <h4 className="font-bold text-charcoal text-sm">{survey.customerName}</h4>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">Survey ID</span>
                <p className="font-mono font-bold text-navy text-sm">{survey.surveyNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-mutedGrey">
              <div className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-navy shrink-0" />
                <span className="truncate">{survey.customerPhone}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-amber shrink-0" />
                <span>{activeCustomer?.interestedCapacityKw || 5} kW {activeCustomer?.preferredSystemType?.toUpperCase() || 'ON-GRID'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                <span className="truncate">{survey.customerAddress}</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* WORKFLOW A: SELECT CUSTOMER / SURVEY REQUEST (2 Options)             */}
        {/* ==================================================================== */}
        {isTechnicianFirst && (
          <div className="space-y-3 p-3.5 bg-white rounded-xl border border-warmGrey/80 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Select Customer / Survey Request
              </label>
              
              {/* Segmented Control */}
              <div className="inline-flex rounded-lg bg-sand-100 p-0.5 border border-warmGrey/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRequestMode('existing_request')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    requestMode === 'existing_request'
                      ? 'bg-white text-navy font-bold shadow-xs'
                      : 'text-mutedGrey hover:text-charcoal'
                  }`}
                >
                  Existing Survey Request ({unassignedSurveys.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRequestMode('new_request')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    requestMode === 'new_request'
                      ? 'bg-white text-navy font-bold shadow-xs'
                      : 'text-mutedGrey hover:text-charcoal'
                  }`}
                >
                  Create New Survey Request
                </button>
              </div>
            </div>

            {/* Option A: Existing Unassigned Survey Request */}
            {requestMode === 'existing_request' ? (
              unassignedSurveys.length === 0 ? (
                <div className="p-3 bg-sand-50 rounded-lg border border-warmGrey/60 text-center text-xs text-mutedGrey">
                  No unassigned survey requests in queue. Please toggle to <strong>Create New Survey Request</strong> above.
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedSurveyId}
                    onChange={e => setSelectedSurveyId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
                  >
                    {unassignedSurveys.map(s => {
                      const cust = customers.find(c => c.id === s.customerId);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.surveyNumber} — {s.customerName} ({cust?.interestedCapacityKw || 5}kW {cust?.preferredSystemType?.toUpperCase() || 'ON-GRID'}) • {s.customerAddress}
                        </option>
                      );
                    })}
                  </select>

                  {/* Summary of Selected Survey */}
                  {selectedSurveyId && (
                    <div className="p-2.5 bg-sand-50/80 rounded-lg border border-warmGrey/40 text-xs flex justify-between items-center text-mutedGrey">
                      <div>
                        <strong className="text-navy font-mono">
                          {unassignedSurveys.find(s => s.id === selectedSurveyId)?.surveyNumber}
                        </strong>
                        <span className="mx-2">•</span>
                        <span className="font-bold text-charcoal">
                          {unassignedSurveys.find(s => s.id === selectedSurveyId)?.customerName}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber bg-amber-50 px-2 py-0.5 rounded border border-amber/30">
                        Unassigned Request
                      </span>
                    </div>
                  )}
                </div>
              )
            ) : (
              /* Option B: Create New Survey Request for an Existing Customer */
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-mutedGrey mb-1">
                    Select Customer
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.customerCode}) — 📞 {c.phone} • {c.city} ({c.interestedCapacityKw}kW {c.preferredSystemType.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Survey ID generation notice */}
                <div className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/60 text-[11px] text-mutedGrey flex items-center justify-between">
                  <span>
                    Survey ID: <strong className="text-navy font-mono font-bold">Auto-generated upon assignment (SRV-2026-XXX)</strong>
                  </span>
                  <span className="text-sage font-semibold">✓ Non-colliding counter</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* MANDATORY SECTION: SURVEY SITE DETAILS (2 Options)                 */}
        {/* ==================================================================== */}
        <div className="space-y-3 p-3.5 bg-white rounded-xl border border-warmGrey/80 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-navy" />
              <span>Survey Site Details</span>
            </label>

            {/* Segmented Control: Select Existing Site vs Enter New Site */}
            <div className="inline-flex rounded-lg bg-sand-100 p-0.5 border border-warmGrey/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSiteMode('existing_site')}
                className={`px-3 py-1 rounded-md transition-all ${
                  siteMode === 'existing_site'
                    ? 'bg-white text-navy font-bold shadow-xs'
                    : 'text-mutedGrey hover:text-charcoal'
                }`}
              >
                Select Existing Site ({registeredSites.length})
              </button>
              <button
                type="button"
                onClick={() => setSiteMode('new_site')}
                className={`px-3 py-1 rounded-md transition-all ${
                  siteMode === 'new_site'
                    ? 'bg-white text-navy font-bold shadow-xs'
                    : 'text-mutedGrey hover:text-charcoal'
                }`}
              >
                + Enter New Site
              </button>
            </div>
          </div>

          {/* Option A: Select Existing Site */}
          {siteMode === 'existing_site' ? (
            registeredSites.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={selectedSiteId}
                  onChange={e => handleSiteSelectionChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
                >
                  {registeredSites.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.siteLabel} — {st.address}, {st.city} ({st.propertyType})
                    </option>
                  ))}
                </select>

                {/* Selected Site Details Preview */}
                {selectedSiteId && (
                  <div className="p-3 bg-sand-50/70 rounded-xl border border-warmGrey/60 text-xs space-y-1 text-mutedGrey">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-charcoal">
                        📍 {registeredSites.find(st => st.id === selectedSiteId)?.siteLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sand-200 text-charcoal font-semibold text-[10px]">
                        {registeredSites.find(st => st.id === selectedSiteId)?.propertyType}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal">
                      {registeredSites.find(st => st.id === selectedSiteId)?.address},{' '}
                      {registeredSites.find(st => st.id === selectedSiteId)?.city} - PIN:{' '}
                      {registeredSites.find(st => st.id === selectedSiteId)?.pincode}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Fallback if no sites saved yet */
              <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60 text-xs text-mutedGrey space-y-1">
                <div className="flex items-center justify-between text-charcoal font-bold">
                  <span>Primary Customer Site</span>
                  <span className="text-[10px] bg-sand-200 px-1.5 py-0.5 rounded">Default</span>
                </div>
                <p className="text-[11px]">{activeCustomer?.address}, {activeCustomer?.city}</p>
                <p className="text-[10px] italic">Property Type: {activeCustomer?.roofType || 'RCC Flat Terrace'}</p>
              </div>
            )
          ) : (
            /* Option B: Enter New Site Details */
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-mutedGrey mb-1">
                    Site Label / Nickname *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSiteLabel}
                    onChange={e => setNewSiteLabel(e.target.value)}
                    placeholder="e.g. Factory Shed Plot 48, Second Bungalow, Farmhouse"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-warmGrey rounded-lg focus:outline-hidden focus:ring-1 focus:ring-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-mutedGrey mb-1">
                    Property Roof Type *
                  </label>
                  <select
                    value={newSitePropertyType}
                    onChange={e => setNewSitePropertyType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-warmGrey rounded-lg focus:outline-hidden focus:ring-1 focus:ring-navy font-medium text-charcoal"
                  >
                    {PROPERTY_TYPES.map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-mutedGrey mb-1">
                  Full Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={newSiteAddress}
                  onChange={e => setNewSiteAddress(e.target.value)}
                  placeholder="e.g. Gat 44, Hadapsar Industrial Estate, Near Feeder 3"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-warmGrey rounded-lg focus:outline-hidden focus:ring-1 focus:ring-navy"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-mutedGrey mb-1">City</label>
                  <input
                    type="text"
                    value={newSiteCity}
                    onChange={e => setNewSiteCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-warmGrey rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-mutedGrey mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={newSitePincode}
                    onChange={e => setNewSitePincode(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-warmGrey rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-mutedGrey mb-1">Sanctioned Load</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newSiteSanctionedLoad}
                    onChange={e => setNewSiteSanctionedLoad(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-warmGrey rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-mutedGrey mb-1">Meter Phase</label>
                  <select
                    value={newSitePhase}
                    onChange={e => setNewSitePhase(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-warmGrey rounded-lg text-charcoal font-medium"
                  >
                    <option value="single_phase">Single Phase</option>
                    <option value="three_phase">Three Phase</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1 text-xs">
                <input
                  type="checkbox"
                  id="saveSite"
                  checked={saveSiteToProfile}
                  onChange={e => setSaveSiteToProfile(e.target.checked)}
                  className="rounded border-warmGrey text-navy focus:ring-navy"
                />
                <label htmlFor="saveSite" className="text-mutedGrey font-medium cursor-pointer">
                  Save this site address to customer's permanent profile
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* WORKFLOW B: SELECT TECHNICIAN (Only in survey_first mode)           */}
        {/* ==================================================================== */}
        {!isTechnicianFirst && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1.5">
              Select Survey Specialist *
            </label>
            <div className="space-y-2">
              {surveyTechnicians.map(t => {
                const isSelected = t.id === selectedTechId;
                const isPrevTech = isReassign && t.id === survey?.technicianId;
                
                const countOnSelectedDate = surveys.filter(
                  s => s.technicianId === t.id && 
                       s.scheduledDate.split('T')[0] === scheduledDate &&
                       s.status !== 'cancelled' && s.status !== 'rejected'
                ).length;

                const techLeave = technicianLeaves.find(l => 
                  l.technicianId === t.id &&
                  l.status === 'approved' &&
                  scheduledDate >= l.startDate && scheduledDate <= l.endDate
                );

                return (
                  <div
                    key={t.id}
                    onClick={() => !isPrevTech && setSelectedTechId(t.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-navy/5 border-navy ring-1 ring-navy' 
                        : isPrevTech 
                          ? 'opacity-40 bg-sand-50 cursor-not-allowed border-warmGrey/60' 
                          : 'bg-white border-warmGrey hover:bg-sand-50/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-navy text-white' : 'bg-sand-200 text-charcoal'
                      }`}>
                        {t.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-charcoal">{t.fullName}</span>
                          <span className="text-[11px] text-mutedGrey">({t.designation})</span>
                          {isPrevTech && (
                            <span className="text-[10px] bg-sand-200 px-1.5 py-0.2 rounded font-semibold text-mutedGrey">
                              Currently Assigned
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-mutedGrey mt-0.5 flex items-center space-x-2">
                          <span>📞 {t.phone}</span>
                          <span>•</span>
                          <span className="font-medium text-charcoal">
                            {techLeave 
                              ? `On Leave (${techLeave.leaveType})` 
                              : `${countOnSelectedDate} survey${countOnSelectedDate === 1 ? '' : 's'} on selected date`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {techLeave ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-50 text-terracotta border border-terracotta/30">
                          On Leave
                        </span>
                      ) : countOnSelectedDate >= 2 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">
                          Heavy Workload ({countOnSelectedDate})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage border border-sage/30">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reassignment Reason if Reassigning */}
        {isReassign && (
          <div className="p-3 bg-amber-50 border border-amber/30 rounded-xl text-xs space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal">
              Reason for Reassignment *
            </label>
            <input
              type="text"
              required
              value={reassignReason}
              onChange={e => setReassignReason(e.target.value)}
              placeholder="e.g. Previous technician booked, customer requested earlier slot..."
              className="w-full px-3 py-1.5 text-xs bg-white border border-warmGrey rounded-lg focus:outline-hidden focus:ring-1 focus:ring-navy"
            />
          </div>
        )}

        {/* Date, Time Slot & Duration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
              Survey Date *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
              Time Slot *
            </label>
            <select
              value={timeSlot}
              onChange={e => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
              Estimated Duration
            </label>
            <select
              value={durationMinutes}
              onChange={e => setDurationMinutes(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy font-semibold text-charcoal"
            >
              <option value={60}>60 Minutes (Compact Roof)</option>
              <option value={90}>90 Minutes (Standard 3-5kW)</option>
              <option value={120}>120 Minutes (Commercial / Complex)</option>
              <option value={180}>180 Minutes (Industrial & HT Feeder)</option>
            </select>
          </div>
        </div>

        {/* Live Validation Feedback */}
        {isOnLeave ? (
          <div className="p-3 bg-terracotta-50 border border-terracotta/40 rounded-xl flex items-start space-x-2 text-terracotta text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Technician Unavailable (Approved Leave):</span>
              <p className="mt-0.5 text-charcoal">
                {effectiveTech?.fullName} is on approved {isOnLeave.leaveType} leave on {scheduledDate}.
              </p>
            </div>
          </div>
        ) : conflictingSurvey ? (
          <div className="p-3 bg-amber-50 border border-amber/40 rounded-xl flex items-start space-x-2 text-amber text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Schedule Overlap Warning:</span>
              <p className="mt-0.5 text-charcoal">
                {effectiveTech?.fullName} already has survey <strong>{conflictingSurvey.surveyNumber} ({conflictingSurvey.customerName})</strong> at <strong>{timeSlot}</strong> on {scheduledDate}.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-sage-50 border border-sage/30 rounded-xl flex items-center space-x-2 text-sage text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">
              Slot is clear! {effectiveTech?.fullName} has {dailyWorkload} job(s) scheduled on {scheduledDate}.
            </span>
          </div>
        )}

        {/* Additional Instructions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mutedGrey mb-1">
            Site Access & Engineering Instructions
          </label>
          <textarea
            rows={2}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="e.g. Ring bell at main gate, RCC flat terrace access via internal staircase, verify distance to consumer meter..."
            className="w-full px-3 py-2 text-xs bg-white border border-warmGrey rounded-xl focus:outline-hidden focus:ring-1 focus:ring-navy"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-3 border-t border-warmGrey/60 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-sand-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBlocked}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 ${
              isBlocked 
                ? 'bg-warmGrey text-mutedGrey cursor-not-allowed opacity-60' 
                : 'bg-navy text-white hover:bg-navy-light cursor-pointer'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {isTechnicianFirst
                ? 'Confirm & Assign Specialist'
                : isReassign 
                  ? 'Confirm Reassignment' 
                  : 'Assign Specialist & Confirm Slot'}
            </span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
