import React, { useState } from 'react';
import { 
  Compass, Calendar, Clock, UserCheck, CheckCircle2, 
  XCircle, Upload, Eye, Camera, MapPin, AlertCircle, Plus 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SiteSurvey, SurveyStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const SiteSurveysPage: React.FC = () => {
  const { 
    surveys, 
    customers, 
    employees, 
    assignSurveyTechnician, 
    submitSurveyForm, 
    updateSurveyStatus, 
    showToast 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSurvey, setSelectedSurvey] = useState<SiteSurvey | null>(null);
  
  // Modal for Form Submission (Technician execution & measurement entry)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Assignment state
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');

  // Survey Data Form
  const [surveyForm, setSurveyForm] = useState<{
    roofLengthM: number;
    roofWidthM: number;
    shadowFreeAreaSqm: number;
    roofDirection: string;
    roofTiltDegrees: number;
    cableDistanceMeters: number;
    sanctionedLoadKw: number;
    meterNumber: string;
    phaseType: 'single_phase' | 'three_phase';
    transformerDistanceM: number;
    technicianObservations: string;
  }>({
    roofLengthM: 14.0,
    roofWidthM: 8.0,
    shadowFreeAreaSqm: 88.0,
    roofDirection: 'South',
    roofTiltDegrees: 18.0,
    cableDistanceMeters: 25.0,
    sanctionedLoadKw: 6.0,
    meterNumber: 'MSEDCL-88910',
    phaseType: 'three_phase',
    transformerDistanceM: 60,
    technicianObservations: ''
  });

  const technicians = employees.filter(e => e.role === 'survey_tech' || e.department === 'Field Engineering');

  const filteredSurveys = surveys.filter(s => {
    return filterStatus === 'all' || s.status === filterStatus;
  });

  const handleOpenAssign = (survey: SiteSurvey) => {
    setSelectedSurvey(survey);
    setSelectedTechnicianId(survey.technicianId || (technicians[0]?.id || ''));
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedSurvey || !selectedTechnicianId) return;
    const tech = employees.find(e => e.id === selectedTechnicianId);
    if (tech) {
      assignSurveyTechnician(selectedSurvey.id, tech.id, tech.fullName);
      setIsAssignModalOpen(false);
    }
  };

  const handleOpenSubmitForm = (survey: SiteSurvey) => {
    setSelectedSurvey(survey);
    setSurveyForm({
      roofLengthM: survey.roofDimensions?.lengthM || 14.0,
      roofWidthM: survey.roofDimensions?.widthM || 8.0,
      shadowFreeAreaSqm: survey.shadowFreeAreaSqm || 85.0,
      roofDirection: survey.roofDirection || 'South',
      roofTiltDegrees: survey.roofTiltDegrees || 18.0,
      cableDistanceMeters: survey.cableDistanceMeters || 25.0,
      sanctionedLoadKw: survey.sanctionedLoadKw || 5.0,
      meterNumber: survey.meterNumber || 'MSEDCL-PUN-09912',
      phaseType: survey.phaseType || 'three_phase',
      transformerDistanceM: survey.transformerDistanceM || 50,
      technicianObservations: survey.technicianObservations || ''
    });
    setIsSubmitModalOpen(true);
  };

  const handleSaveSurveyForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;

    const totalRoofArea = surveyForm.roofLengthM * surveyForm.roofWidthM;
    submitSurveyForm(selectedSurvey.id, {
      roofDimensions: {
        lengthM: surveyForm.roofLengthM,
        widthM: surveyForm.roofWidthM
      },
      totalRoofAreaSqm: totalRoofArea,
      shadowFreeAreaSqm: surveyForm.shadowFreeAreaSqm,
      roofDirection: surveyForm.roofDirection,
      roofTiltDegrees: surveyForm.roofTiltDegrees,
      cableDistanceMeters: surveyForm.cableDistanceMeters,
      sanctionedLoadKw: surveyForm.sanctionedLoadKw,
      meterNumber: surveyForm.meterNumber,
      phaseType: surveyForm.phaseType,
      transformerDistanceM: surveyForm.transformerDistanceM,
      technicianObservations: surveyForm.technicianObservations,
      photos: [
        'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=500&auto=format&fit=crop&q=80'
      ]
    });
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Site Survey Operations</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Terrace measurements, shadow analysis, electrical grid sync & engineering approvals
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-navy font-medium"
          >
            <option value="all">All Survey Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted (Needs Approval)</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Workflow Rule Alert */}
      <div className="bg-sand-100 border border-warmGrey rounded-xl p-3.5 flex items-start space-x-3 text-xs">
        <AlertCircle className="w-4 h-4 text-navy mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-charcoal">Engineering Quality Gate:</strong> In accordance with SunPower Solutions SOPs, a solar package quotation can only be finalized and contracted after the site survey measurements and shadow analysis have been <strong>Approved</strong> by the engineering lead.
        </div>
      </div>

      {/* Surveys Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Survey #</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Allocated Technician</th>
                <th className="py-3 px-4">Roof Shadow-Free Area</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredSurveys.map(survey => (
                <tr key={survey.id} className="hover:bg-sand-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">
                    {survey.surveyNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-charcoal">{survey.customerName}</div>
                    <div className="text-[11px] text-mutedGrey truncate max-w-[200px]">{survey.customerAddress}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-charcoal">
                    {new Date(survey.scheduledDate).toLocaleDateString()} {new Date(survey.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4">
                    {survey.technicianName ? (
                      <span className="font-semibold text-charcoal flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5 text-sage" />
                        <span>{survey.technicianName}</span>
                      </span>
                    ) : (
                      <span className="text-amber font-medium italic">Unallocated</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {survey.shadowFreeAreaSqm ? (
                      <span className="font-bold text-navy">{survey.shadowFreeAreaSqm} sq.m ({survey.roofDirection})</span>
                    ) : (
                      <span className="text-mutedGrey">Pending Measurement</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={survey.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {/* Action buttons depending on state */}
                    {survey.status === 'scheduled' && (
                      <button
                        onClick={() => handleOpenAssign(survey)}
                        className="px-2.5 py-1 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors"
                      >
                        Assign Tech
                      </button>
                    )}

                    {(survey.status === 'assigned' || survey.status === 'in_progress') && (
                      <button
                        onClick={() => handleOpenSubmitForm(survey)}
                        className="px-2.5 py-1 bg-amber text-charcoal text-xs font-semibold rounded-lg hover:bg-amber-light transition-colors shadow-xs"
                      >
                        Enter Survey Form
                      </button>
                    )}

                    {survey.status === 'submitted' && (
                      <div className="inline-flex space-x-1.5">
                        <button
                          onClick={() => updateSurveyStatus(survey.id, 'approved')}
                          className="px-2.5 py-1 bg-sage text-white text-xs font-semibold rounded-lg hover:bg-sage-dark transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateSurveyStatus(survey.id, 'rejected', 'Shadow obstruction exceeds 40%')}
                          className="px-2 py-1 bg-terracotta text-white text-xs font-semibold rounded-lg hover:bg-terracotta-dark transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {survey.status === 'approved' && (
                      <span className="inline-flex items-center text-xs font-semibold text-sage space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready for Quote</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Technician Modal */}
      {isAssignModalOpen && selectedSurvey && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Allocate Field Survey Specialist"
          subtitle={`Assign specialist to ${selectedSurvey.surveyNumber} (${selectedSurvey.customerName})`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey text-xs">
              <p><strong>Customer:</strong> {selectedSurvey.customerName}</p>
              <p><strong>Address:</strong> {selectedSurvey.customerAddress}</p>
              <p><strong>Scheduled Time:</strong> {new Date(selectedSurvey.scheduledDate).toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Select Available Technician:
              </label>
              <select
                value={selectedTechnicianId}
                onChange={e => setSelectedTechnicianId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.designation}) — {t.activeJobs} active jobs
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Technician Field Survey Form Modal */}
      {isSubmitModalOpen && selectedSurvey && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Field Survey Form & Engineering Measurements"
          subtitle={`Submit technical measurements for ${selectedSurvey.customerName} (${selectedSurvey.surveyNumber})`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveSurveyForm} className="space-y-4">
            <div className="p-3 bg-sand-100 rounded-xl text-xs flex justify-between items-center">
              <div>
                <strong className="text-charcoal">Customer:</strong> {selectedSurvey.customerName}
                <div className="text-mutedGrey">{selectedSurvey.customerAddress}</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-navy">{selectedSurvey.surveyNumber}</span>
              </div>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-mutedGrey pt-1">
              1. Terrace Dimensions & Azimuth Alignment
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Roof Length (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={surveyForm.roofLengthM}
                  onChange={e => setSurveyForm({ ...surveyForm, roofLengthM: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Roof Width (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={surveyForm.roofWidthM}
                  onChange={e => setSurveyForm({ ...surveyForm, roofWidthM: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Shadow-Free Area (sq.m) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={surveyForm.shadowFreeAreaSqm}
                  onChange={e => setSurveyForm({ ...surveyForm, shadowFreeAreaSqm: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-bold text-navy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Roof Direction</label>
                <select
                  value={surveyForm.roofDirection}
                  onChange={e => setSurveyForm({ ...surveyForm, roofDirection: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                >
                  <option value="South">True South (Optimal)</option>
                  <option value="South-East">South-East</option>
                  <option value="South-West">South-West</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="North">North (Not Recommended)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Roof Tilt Angle (°)</label>
                <input
                  type="number"
                  step="1"
                  value={surveyForm.roofTiltDegrees}
                  onChange={e => setSurveyForm({ ...surveyForm, roofTiltDegrees: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Cable Run to Inverter (m)</label>
                <input
                  type="number"
                  value={surveyForm.cableDistanceMeters}
                  onChange={e => setSurveyForm({ ...surveyForm, cableDistanceMeters: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
                />
              </div>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-mutedGrey pt-2">
              2. Electrical Service Connection
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Sanctioned Load (kW)</label>
                <input
                  type="number"
                  step="0.5"
                  value={surveyForm.sanctionedLoadKw}
                  onChange={e => setSurveyForm({ ...surveyForm, sanctionedLoadKw: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Meter Phase</label>
                <select
                  value={surveyForm.phaseType}
                  onChange={e => setSurveyForm({ ...surveyForm, phaseType: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                >
                  <option value="single_phase">Single Phase (230V)</option>
                  <option value="three_phase">Three Phase (415V)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Consumer Meter #</label>
                <input
                  type="text"
                  value={surveyForm.meterNumber}
                  onChange={e => setSurveyForm({ ...surveyForm, meterNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Technician Observations & Structural Assessment</label>
              <textarea
                rows={2}
                required
                value={surveyForm.technicianObservations}
                onChange={e => setSurveyForm({ ...surveyForm, technicianObservations: e.target.value })}
                placeholder="Details on parapet wall height, water tank shading, RCC anchor feasibility..."
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>

            <div className="p-3 bg-sand-50 rounded-xl border border-dashed border-warmGrey text-center text-xs">
              <Camera className="w-6 h-6 text-navy mx-auto mb-1" />
              <p className="font-semibold text-charcoal">Terrace Photographs (2 Photos Attached)</p>
              <p className="text-[11px] text-mutedGrey">Panoramic terrace angle + Consumer electrical DB box verified</p>
            </div>

            <div className="pt-3 border-t border-warmGrey/60 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
              >
                Submit Survey for Approval
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
