import React, { useState } from 'react';
import { 
  Wrench, Calendar, CheckSquare, Clock, MapPin, 
  UserCheck, CheckCircle2, Play, ShieldCheck, Eye
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

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
  const [selectedJob, setSelectedJob] = useState<Installation | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Job Execution Form States
  const [customerSignName, setCustomerSignName] = useState('');
  const [signatureData, setSignatureData] = useState<string | undefined>(undefined);
  const [technicianRemarks, setTechnicianRemarks] = useState('');

  const pendingInstallations = installations.filter(
    item => item.status !== 'completed'
  );
  const completedInstallations = installations.filter(
    item => item.status === 'completed'
  );
  const filteredInstallations = filterStatus === 'pending'
    ? pendingInstallations
    : filterStatus === 'completed'
      ? completedInstallations
      : installations;

  const checklistItems: Array<{
    key: keyof Installation['checklist'];
    label: string;
  }> = [
    { key: 'structureMounting', label: 'Structure fastened & wind-load verified' },
    { key: 'panelsMounted', label: 'Solar panels clamped with mid/end clamps' },
    { key: 'earthingPitConnected', label: 'Chemical earthing resistance below 5 Ohms' },
    { key: 'lightningArresterInstalled', label: 'Lightning arrester grounded' },
    { key: 'inverterWired', label: 'Inverter mounted with proper ventilation' },
    { key: 'dcWiringTested', label: 'DC polarity & open-circuit voltage tested' },
    { key: 'acDbBoxConnected', label: 'ACDB / DCDB enclosures & SPD connected' },
    { key: 'biDirectionalMeterSync', label: 'Bi-directional net meter synchronized' },
  ];

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
        <span className="hidden rounded-full border border-warmGrey/70 bg-white px-3 py-1.5 text-[11px] font-semibold text-mutedGrey sm:inline-flex">
          {installations.length} total installation jobs
        </span>
      </div>

      {/* Task Categories */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setFilterStatus('pending')}
          className={`group text-left rounded-2xl border p-4 shadow-card transition-all duration-300 sm:p-5 ${
            filterStatus === 'pending'
              ? 'border-amber/50 bg-amber-50/70'
              : 'border-warmGrey/60 bg-white hover:-translate-y-0.5 hover:border-amber/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber transition-transform duration-300 group-hover:scale-105">
              <Clock className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-amber/30 bg-white px-2.5 py-1 text-xs font-bold text-amber">
              Pending
            </span>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-mutedGrey">Pending tasks</p>
          <p className="mt-1 text-2xl font-bold text-charcoal">{pendingInstallations.length}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('completed')}
          className={`group text-left rounded-2xl border p-4 shadow-card transition-all duration-300 sm:p-5 ${
            filterStatus === 'completed'
              ? 'border-sage/50 bg-sage-50'
              : 'border-warmGrey/60 bg-white hover:-translate-y-0.5 hover:border-sage/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-50 text-sage transition-transform duration-300 group-hover:scale-105">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-sage/30 bg-white px-2.5 py-1 text-xs font-bold text-sage">
              This week
            </span>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-mutedGrey">Tasks completed this week</p>
          <p className="mt-1 text-2xl font-bold text-charcoal">{completedInstallations.length}</p>
        </button>
      </div>

      {/* Installations Table */}
      <div className="hidden bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden md:block">
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
                  <tr
                    key={inst.id}
                    onClick={() => handleOpenJob(inst)}
                    className="cursor-pointer hover:bg-sand-50/70 transition-colors"
                  >
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
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenJob(inst);
                        }}
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

      {/* Mobile Installation Cards */}
      <div className="space-y-3 md:hidden">
        {filteredInstallations.map(inst => {
          const completedCount = Object.values(inst.checklist).filter(Boolean).length;
          const percent = Math.round((completedCount / Object.keys(inst.checklist).length) * 100);

          return (
            <article
              key={inst.id}
              onClick={() => handleOpenJob(inst)}
              className="cursor-pointer rounded-2xl border border-warmGrey/70 bg-white p-4 shadow-card transition-all duration-300 active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold text-navy">{inst.installationCode}</p>
                  <h2 className="mt-1 text-sm font-bold text-charcoal">{inst.customerName}</h2>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-mutedGrey">{inst.customerAddress}</p>
                </div>
                <StatusBadge status={inst.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-sand-50 p-2.5">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-mutedGrey">System</span>
                  <span className="mt-1 block text-xs font-bold text-navy">{inst.capacityKw} kW</span>
                  <span className="text-[10px] capitalize text-mutedGrey">{inst.systemType.replace('_', ' ')}</span>
                </div>
                <div className="rounded-lg bg-sand-50 p-2.5">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-mutedGrey">Schedule</span>
                  <span className="mt-1 block text-xs font-bold text-charcoal">{inst.scheduledDate}</span>
                  <span className="text-[10px] text-mutedGrey">to {inst.scheduledEndDate}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-mutedGrey">Safety checklist</span>
                  <span className="font-bold text-charcoal">{completedCount}/8 · {percent}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-sand-200">
                  <div
                    className={`h-full rounded-full ${percent === 100 ? 'bg-sage' : 'bg-navy'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenJob(inst);
                }}
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white shadow-xs transition-colors active:bg-navy-dark"
              >
                <Wrench className="h-4 w-4 text-sand" />
                <span>Execute Job</span>
              </button>
            </article>
          );
        })}
      </div>

      {/* Technician Job Execution Modal */}
      {isJobModalOpen && selectedJob && (
        <Modal
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          title={`Technician Job Execution — ${selectedJob.installationCode}`}
          subtitle={`${selectedJob.customerName} (${selectedJob.capacityKw} kW Rooftop Solar)`}
          maxWidth="4xl"
        >
          <form onSubmit={handleCompleteJob}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_230px]">
              <div className="space-y-5">
                {/* Job Summary */}
                <section className="rounded-xl border border-warmGrey/70 bg-sand-50/50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0 text-xs">
                      <p className="font-bold text-charcoal">{selectedJob.customerName}</p>
                      <p className="mt-1 text-mutedGrey">{selectedJob.customerAddress}</p>
                      <p className="mt-2 text-mutedGrey">
                        <span className="font-semibold text-charcoal">Contact:</span> {selectedJob.customerPhone}
                      </p>
                      <p className="mt-1 text-mutedGrey">
                        <span className="font-semibold text-charcoal">Lead engineer:</span>{' '}
                        {selectedJob.technicianNames.join(', ')}
                      </p>
                    </div>
                    {selectedJob.status !== 'in_progress' && selectedJob.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={handleStartWork}
                        className="shrink-0 px-3.5 py-2 bg-sage text-white text-xs font-bold rounded-lg hover:bg-sage-dark flex items-center justify-center space-x-1.5 shadow-xs"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Start work</span>
                      </button>
                    )}
                    {selectedJob.status === 'in_progress' && (
                      <div className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 text-amber border border-amber/40 rounded-lg text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        <span>In progress</span>
                      </div>
                    )}
                    {selectedJob.status === 'completed' && (
                      <div className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-sage-50 text-sage border border-sage/40 rounded-lg text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Commissioned</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Safety Checklist */}
                <section>
                  {(() => {
                    const completedCount = Object.values(selectedJob.checklist).filter(Boolean).length;
                    const progress = Math.round((completedCount / 8) * 100);
                    return (
                      <>
                        <div className="mb-3 flex items-end justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                              8-point commissioning checklist
                            </h4>
                            <p className="mt-1 text-[11px] text-mutedGrey">All checks are required before signoff</p>
                          </div>
                          <span className="text-xs font-bold text-navy">{completedCount}/8</span>
                        </div>
                        <div className="mb-3 h-1.5 rounded-full bg-sand-200 overflow-hidden">
                          <div className="h-full rounded-full bg-navy transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                      </>
                    );
                  })()}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {checklistItems.map((item, index) => (
                      <label
                        key={item.key}
                        className={`flex min-h-12 items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs cursor-pointer transition-colors ${
                          selectedJob.checklist[item.key]
                            ? 'border-sage/30 bg-sage-50/60'
                            : 'border-warmGrey/70 bg-white hover:bg-sand-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedJob.checklist[item.key]}
                          onChange={() => handleToggleChecklist(item.key)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-warmGrey text-navy focus:ring-navy"
                        />
                        <span className="leading-5">
                          <span className="mr-1 font-bold text-mutedGrey">{index + 1}.</span>
                          <span className="font-medium text-charcoal">{item.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Work Notes */}
                <section>
                  <label className="mb-1.5 block text-xs font-bold text-charcoal">
                    Work remarks & generation test
                  </label>
                  <textarea
                    rows={3}
                    value={technicianRemarks}
                    onChange={e => setTechnicianRemarks(e.target.value)}
                    placeholder="Record generation output, test readings, and DISCOM observations..."
                    className="w-full rounded-lg border border-warmGrey px-3 py-2.5 text-xs leading-5 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </section>
              </div>

              {/* Signoff Rail */}
              <aside className="rounded-xl border border-warmGrey/70 bg-sand-50/30 p-4 h-fit">
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-charcoal">Customer signoff</h4>
                  <p className="mt-1 text-[11px] text-mutedGrey">Capture handover confirmation</p>
                </div>
                <label className="mb-1.5 block text-[11px] font-semibold text-charcoal">Customer name</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={customerSignName}
                  onChange={e => setCustomerSignName(e.target.value)}
                  className="mb-3 w-full rounded-lg border border-warmGrey bg-white px-3 py-2 text-xs focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
                <SignaturePad
                  onSave={dataUrl => setSignatureData(dataUrl)}
                  onClear={() => setSignatureData(undefined)}
                  width={300}
                  height={145}
                />
              </aside>
            </div>

            {/* Fixed-style action footer */}
            <div className="mt-5 -mx-4 border-t border-warmGrey/60 bg-white px-4 py-3 flex flex-col-reverse gap-2 sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span className="hidden sm:block text-[11px] text-mutedGrey">
                Review all checklist items before completion
              </span>
              <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="min-h-11 flex-1 px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg sm:flex-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-11 flex-[1.7] px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs sm:flex-none sm:px-5"
              >
                Complete Installation Job
              </button>
            </div>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
