import React, { useState } from 'react';
import { 
  Wrench, Calendar, CheckSquare, Clock, MapPin, 
  UserCheck, Camera, CheckCircle2, AlertCircle, Play, 
  FileCheck, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Installation } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { SignaturePad } from '../components/common/SignaturePad';

export const InstallationsPage: React.FC = () => {
  const { 
    installations, 
    employees, 
    startInstallation, 
    updateInstallationChecklist, 
    completeInstallationJob, 
    showToast 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Installation | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Job Execution Form States
  const [customerSignName, setCustomerSignName] = useState('');
  const [signatureData, setSignatureData] = useState<string | undefined>(undefined);
  const [technicianRemarks, setTechnicianRemarks] = useState('');

  const filteredInstallations = installations.filter(i => {
    return filterStatus === 'all' || i.status === filterStatus;
  });

  const handleOpenJob = (inst: Installation) => {
    setSelectedJob(inst);
    setCustomerSignName(inst.customerSignName || inst.customerName);
    setTechnicianRemarks(inst.technicianRemarks || '');
    setIsJobModalOpen(true);
  };

  const handleStartWork = () => {
    if (!selectedJob) return;
    startInstallation(selectedJob.id);
    setSelectedJob({ ...selectedJob, status: 'in_progress', actualStartTime: new Date().toISOString() });
  };

  const handleToggleChecklist = (key: keyof Installation['checklist']) => {
    if (!selectedJob) return;
    const newVal = !selectedJob.checklist[key];
    updateInstallationChecklist(selectedJob.id, key, newVal);
    setSelectedJob({
      ...selectedJob,
      checklist: {
        ...selectedJob.checklist,
        [key]: newVal
      }
    });
  };

  const handleCompleteJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    // Verify all 8 checklist items
    const allChecked = Object.values(selectedJob.checklist).every(Boolean);
    if (!allChecked) {
      showToast('Please complete all 8 electrical safety and mounting checklist items before signoff.', 'warning');
      return;
    }

    if (!customerSignName.trim()) {
      showToast('Please provide the customer signoff name', 'error');
      return;
    }

    completeInstallationJob(selectedJob.id, customerSignName, signatureData, technicianRemarks);
    setIsJobModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Solar Installation Operations</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Field engineer schedules, 8-point electrical safety checklist & digital customer signoffs
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-navy font-medium"
        >
          <option value="all">All Installation Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress (Active on Site)</option>
          <option value="completed">Completed & Commissioned</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      {/* Installations Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Job Code</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Capacity & System</th>
                <th className="py-3 px-4">Scheduled Window</th>
                <th className="py-3 px-4">Field Technicians</th>
                <th className="py-3 px-4">Checklist Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredInstallations.map(inst => {
                const totalChecklist = Object.keys(inst.checklist).length;
                const completedCount = Object.values(inst.checklist).filter(Boolean).length;
                const percent = Math.round((completedCount / totalChecklist) * 100);

                return (
                  <tr key={inst.id} className="hover:bg-sand-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      {inst.installationCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal">{inst.customerName}</div>
                      <div className="text-[11px] text-mutedGrey truncate max-w-[200px]">{inst.customerAddress}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy">{inst.capacityKw} kW</div>
                      <div className="text-[10px] uppercase text-mutedGrey">{inst.systemType.replace('_', ' ')}</div>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal font-medium">
                      <div>{inst.scheduledDate}</div>
                      <div className="text-[10px] text-mutedGrey">to {inst.scheduledEndDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal">{inst.technicianNames.join(', ')}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-sand-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full ${percent === 100 ? 'bg-sage' : 'bg-navy'}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-charcoal">{completedCount}/{totalChecklist}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inst.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenJob(inst)}
                        className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs inline-flex items-center space-x-1"
                      >
                        <Wrench className="w-3.5 h-3.5 text-sand" />
                        <span>Execute Job</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technician Job Execution Modal */}
      {isJobModalOpen && selectedJob && (
        <Modal
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          title={`Technician Job Execution — ${selectedJob.installationCode}`}
          subtitle={`${selectedJob.customerName} (${selectedJob.capacityKw} kW Rooftop Solar)`}
          maxWidth="3xl"
        >
          <form onSubmit={handleCompleteJob} className="space-y-5">
            
            {/* Job Header & Time Tracker */}
            <div className="p-4 bg-sand-100 rounded-xl border border-warmGrey flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div>
                <p><strong>Customer:</strong> {selectedJob.customerName} ({selectedJob.customerPhone})</p>
                <p className="text-mutedGrey">{selectedJob.customerAddress}</p>
                <p className="mt-1"><strong>Lead Engineer:</strong> {selectedJob.technicianNames.join(', ')}</p>
              </div>
              <div className="flex items-center space-x-2">
                {selectedJob.status !== 'in_progress' && selectedJob.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={handleStartWork}
                    className="px-3.5 py-2 bg-sage text-white font-bold rounded-lg hover:bg-sage-dark flex items-center space-x-1.5 shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Work Timer</span>
                  </button>
                )}
                {selectedJob.status === 'in_progress' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 text-amber border border-amber/40 rounded-lg font-bold">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>In Progress (Active)</span>
                  </div>
                )}
                {selectedJob.status === 'completed' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-sage-50 text-sage border border-sage/40 rounded-lg font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Commissioned</span>
                  </div>
                )}
              </div>
            </div>

            {/* 8-Point Electrical & Safety Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Mandatory 8-Point Electrical & Safety Commissioning Checklist:
                </h4>
                <span className="text-[11px] text-mutedGrey">All points required for signoff</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-warmGrey hover:bg-sand-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJob.checklist.structureMounting}
                    onChange={() => handleToggleChecklist('structureMounting')}
                    className="w-4 h-4 text-navy rounded border-warmGrey focus:ring-navy"
                  />
                  <span className="font-medium text-charcoal">1. Structure Fastened & Wind-Load Verified</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-warmGrey hover:bg-sand-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJob.checklist.panelsMounted}
                    onChange={() => handleToggleChecklist('panelsMounted')}
                    className="w-4 h-4 text-navy rounded border-warmGrey focus:ring-navy"
                  />
                  <span className="font-medium text-charcoal">2. Solar Panels Clamped with Mid/End Clamps</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-warmGrey hover:bg-sand-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJob.checklist.earthingPitConnected}
                    onChange={() => handleToggleChecklist('earthingPitConnected')}
                    className="w-4 h-4 text-navy rounded border-warmGrey focus:ring-navy"
                  />
                  <span className="font-medium text-charcoal">3. Chemical Earthing Pit Resistance &lt; 5 Ohms</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-warmGrey hover:bg-sand-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJob.checklist.lightningArresterInstalled}
                    onChange={() => handleToggleChecklist('lightningArresterInstalled')}
                    className="w-4 h-4 text-navy rounded border-warmGrey focus:ring-navy"
                  />
                  <span className="font-medium text-charcoal">4. Early Streamer Lightning Arrester Grounded</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-warmGrey hover:bg-sand-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJob.checklist.inverterWired}
                    onChange={() => handleToggleChecklist('inverterWired')}
                    className="w-4 h-4 text-navy rounded border-warmGrey focus:ring-navy"
                  />
                  <span className="font-medium text-charcoal">5. Inverter Mounted with Proper Heat Ventilation</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-warmGrey hover:bg-sand-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJob.checklist.dcWiringTested}
                    onChange={() => handleToggleChecklist('dcWiringTested')}
                    className="w-4 h-4 text-navy rounded border-warmGrey focus:ring-navy"
                  />
                  <span className="font-medium text-charcoal">6. DC Polarity & Voltage Open-Circuit (Voc) Tested</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-warmGrey hover:bg-sand-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJob.checklist.acDbBoxConnected}
                    onChange={() => handleToggleChecklist('acDbBoxConnected')}
                    className="w-4 h-4 text-navy rounded border-warmGrey focus:ring-navy"
                  />
                  <span className="font-medium text-charcoal">7. ACDB / DCDB Enclosures with SPD Connected</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-warmGrey hover:bg-sand-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJob.checklist.biDirectionalMeterSync}
                    onChange={() => handleToggleChecklist('biDirectionalMeterSync')}
                    className="w-4 h-4 text-navy rounded border-warmGrey focus:ring-navy"
                  />
                  <span className="font-medium text-charcoal">8. Bi-directional Net Meter Grid Synchronized</span>
                </label>
              </div>
            </div>

            {/* Technician Remarks */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Technician Work Remarks & Generation Testing Voltage
              </label>
              <textarea
                rows={2}
                value={technicianRemarks}
                onChange={e => setTechnicianRemarks(e.target.value)}
                placeholder="e.g. Generation measured at 4.8 kW at 12:45 PM. Discom officer witnessed net meter synchronization."
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            {/* Customer Digital Signature Pad */}
            <div className="pt-2 border-t border-warmGrey/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal">Customer Digital Signoff & Handover</label>
                <span className="text-[11px] text-mutedGrey">Sign on canvas below</span>
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Customer Full Name (e.g. Nitin Patil)"
                  value={customerSignName}
                  onChange={e => setCustomerSignName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg mb-2"
                />
              </div>

              <SignaturePad
                onSave={dataUrl => setSignatureData(dataUrl)}
                onClear={() => setSignatureData(undefined)}
              />
            </div>

            {/* Submit / Finish */}
            <div className="pt-3 border-t border-warmGrey/60 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs"
              >
                Complete Installation Job
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
