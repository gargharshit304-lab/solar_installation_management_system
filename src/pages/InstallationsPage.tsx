import React, { useState } from 'react';
import { 
  Wrench, Calendar, CheckSquare, Clock, MapPin, 
  UserCheck, CheckCircle2, Play, ShieldCheck, Eye,
  AlertTriangle, ArrowRight, UserPlus, FileText, Check, X,
  ShieldAlert, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Installation, Employee } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { SignaturePad } from '../components/common/SignaturePad';

export const InstallationsPage: React.FC = () => {
  const { 
    currentUser,
    installations, 
    employees, 
    startInstallation, 
    updateInstallationChecklist, 
    completeInstallationJob,
    reassignInstallationTechnician,
    rescheduleInstallation,
    hasPermission,
    canCreate,
    canEdit,
    canAssign,
    canExecute,
    showToast 
  } = useApp();

  const isOwner = currentUser.role === 'owner_admin';
  const isTech = currentUser.role === 'install_tech';

  // Filters
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'in_progress' | 'scheduled' | 'completed' | 'delayed'>('all');
  const [techFilter, setTechFilter] = useState<'my_jobs' | 'in_progress' | 'completed' | 'all'>('my_jobs');

  // Job Modal State
  const [selectedJob, setSelectedJob] = useState<Installation | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Administrative Action States (Owner)
  const [showReassignPanel, setShowReassignPanel] = useState(false);
  const [selectedTechNames, setSelectedTechNames] = useState<string[]>([]);
  const [reassignReason, setReassignReason] = useState('');

  const [showReschedulePanel, setShowReschedulePanel] = useState(false);
  const [rescheduleStartDate, setRescheduleStartDate] = useState('');
  const [rescheduleEndDate, setRescheduleEndDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Operational Form States (Technician)
  const [customerSignName, setCustomerSignName] = useState('');
  const [signatureData, setSignatureData] = useState<string | undefined>(undefined);
  const [technicianRemarks, setTechnicianRemarks] = useState('');

  // Technicians available for assignment
  const techEmployees = employees.filter(e => e.department === 'Operations' || e.designation.toLowerCase().includes('technician') || e.designation.toLowerCase().includes('engineer'));

  // Metrics for Owner
  const totalInstallations = installations.length;
  const inProgressInstallations = installations.filter(i => i.status === 'in_progress');
  const scheduledInstallations = installations.filter(i => i.status === 'scheduled');
  const completedInstallations = installations.filter(i => i.status === 'completed');
  const delayedInstallations = installations.filter(i => i.isDelayed || i.status === 'delayed');

  // Metrics for Technician
  const myAssignedJobs = installations.filter(i => 
    i.technicianNames.some(t => t.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(t.toLowerCase()))
  );
  const myInProgressJobs = myAssignedJobs.filter(i => i.status === 'in_progress');
  const myCompletedJobs = myAssignedJobs.filter(i => i.status === 'completed');

  // Filtered lists based on current role
  const displayedInstallations = isOwner
    ? installations.filter(i => {
        if (ownerFilter === 'in_progress') return i.status === 'in_progress';
        if (ownerFilter === 'scheduled') return i.status === 'scheduled';
        if (ownerFilter === 'completed') return i.status === 'completed';
        if (ownerFilter === 'delayed') return i.isDelayed || i.status === 'delayed';
        return true;
      })
    : installations.filter(i => {
        if (techFilter === 'my_jobs') return myAssignedJobs.some(m => m.id === i.id);
        if (techFilter === 'in_progress') return i.status === 'in_progress' && myAssignedJobs.some(m => m.id === i.id);
        if (techFilter === 'completed') return i.status === 'completed' && myAssignedJobs.some(m => m.id === i.id);
        return true;
      });

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
    setSignatureData(inst.customerSignature);
    setSelectedTechNames(inst.technicianNames);
    setRescheduleStartDate(inst.scheduledDate);
    setRescheduleEndDate(inst.scheduledEndDate);
    setShowReassignPanel(false);
    setShowReschedulePanel(false);
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

  const handleConfirmReassign = () => {
    if (!selectedJob || selectedTechNames.length === 0) {
      showToast('Please select at least one technician', 'warning');
      return;
    }
    reassignInstallationTechnician(selectedJob.id, selectedTechNames, reassignReason);
    setSelectedJob({
      ...selectedJob,
      technicianNames: selectedTechNames,
      reassignedBy: currentUser.name,
      adminNotes: reassignReason ? `${selectedJob.adminNotes ? selectedJob.adminNotes + ' | ' : ''}Reassigned to ${selectedTechNames.join(', ')}: ${reassignReason}` : selectedJob.adminNotes
    });
    setShowReassignPanel(false);
    setReassignReason('');
  };

  const handleConfirmReschedule = () => {
    if (!selectedJob || !rescheduleStartDate || !rescheduleEndDate) {
      showToast('Please provide both start and completion dates', 'warning');
      return;
    }
    rescheduleInstallation(selectedJob.id, rescheduleStartDate, rescheduleEndDate, rescheduleReason);
    setSelectedJob({
      ...selectedJob,
      scheduledDate: rescheduleStartDate,
      scheduledEndDate: rescheduleEndDate,
      rescheduledBy: currentUser.name,
      adminNotes: rescheduleReason ? `${selectedJob.adminNotes ? selectedJob.adminNotes + ' | ' : ''}Rescheduled: ${rescheduleReason}` : selectedJob.adminNotes
    });
    setShowReschedulePanel(false);
    setRescheduleReason('');
  };

  // Check if technician is assigned to the selected job
  const isAssignedTech = selectedJob
    ? selectedJob.technicianNames.some(t => t.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(t.toLowerCase()))
    : false;

  const canExecuteJob = hasPermission('installations.execute', {
    assignedTechnicians: selectedJob?.technicianNames,
    entityId: selectedJob?.id
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header (Contextual by Role) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOwner ? 'bg-navy animate-pulse' : 'bg-sage animate-ping'}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              {isOwner ? 'Administrative Governance & Project Oversight' : 'Field Operations Workspace'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            {isOwner ? 'Solar Installation Operations' : 'Field Installation Work Orders'}
          </h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            {isOwner
              ? 'Company-wide execution tracking, crew deployment, schedule adjustments & quality inspection.'
              : 'Assigned installation work orders, 8-point electrical safety commissioning & digital customer handover.'
            }
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2 bg-sand-50 border border-warmGrey/80 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-charcoal">
            <UserCheck className="w-4 h-4 text-navy" />
            <span>{currentUser.name}</span>
            <span className="text-mutedGrey text-[11px]">({isOwner ? 'Executive Oversight' : 'Lead Engineer'})</span>
          </div>
        </div>
      </div>

      {/* Read-Only Mode Banner */}
      {!hasPermission('installations.execute') && !hasPermission('installations.reassign') && !hasPermission('installations.reschedule') && !isOwner && (
        <div className="bg-amber-50 border border-amber/30 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber/10 flex items-center justify-center text-amber shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal">Read-Only View Mode Active</p>
              <p className="text-[11px] text-mutedGrey mt-0.5">
                You have view-only access to Solar Installation Operations. Field job execution, checklist completion, customer signoffs, and crew reassignments are restricted by your security profile.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white border border-amber/30 text-amber text-[10px] font-bold rounded-lg uppercase tracking-wider">
            View Only
          </span>
        </div>
      )}

      {/* 2. Overview KPI Cards */}
      {isOwner ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div 
            onClick={() => setOwnerFilter('all')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              ownerFilter === 'all' ? 'border-navy bg-navy/5 shadow-xs' : 'border-warmGrey/60 bg-white hover:border-warmGrey'
            }`}
          >
            <div className="flex items-center justify-between text-mutedGrey">
              <span className="text-[11px] font-bold uppercase tracking-wider">All Work Orders</span>
              <Wrench className="w-4 h-4 text-navy" />
            </div>
            <p className="text-2xl font-bold text-charcoal mt-2">{totalInstallations}</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">Active & past jobs</p>
          </div>

          <div 
            onClick={() => setOwnerFilter('in_progress')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              ownerFilter === 'in_progress' ? 'border-amber bg-amber-50/70 shadow-xs ring-1 ring-amber/20' : 'border-warmGrey/60 bg-white hover:border-amber/40'
            }`}
          >
            <div className="flex items-center justify-between text-amber">
              <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-charcoal mt-2">{inProgressInstallations.length}</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">Active on roof</p>
          </div>

          <div 
            onClick={() => setOwnerFilter('scheduled')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              ownerFilter === 'scheduled' ? 'border-navy bg-sand-100 shadow-xs' : 'border-warmGrey/60 bg-white hover:border-navy/40'
            }`}
          >
            <div className="flex items-center justify-between text-navy">
              <span className="text-[11px] font-bold uppercase tracking-wider">Scheduled Window</span>
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-charcoal mt-2">{scheduledInstallations.length}</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">Upcoming starts</p>
          </div>

          <div 
            onClick={() => setOwnerFilter('completed')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              ownerFilter === 'completed' ? 'border-sage bg-sage-50 shadow-xs' : 'border-warmGrey/60 bg-white hover:border-sage/40'
            }`}
          >
            <div className="flex items-center justify-between text-sage">
              <span className="text-[11px] font-bold uppercase tracking-wider">Commissioned</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-charcoal mt-2">{completedInstallations.length}</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">Handed over</p>
          </div>

          <div 
            onClick={() => setOwnerFilter('delayed')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              ownerFilter === 'delayed' ? 'border-terracotta bg-terracotta/10 shadow-xs ring-1 ring-terracotta/30' : 'border-warmGrey/60 bg-white hover:border-terracotta/40'
            }`}
          >
            <div className="flex items-center justify-between text-terracotta">
              <span className="text-[11px] font-bold uppercase tracking-wider">Delayed / Overdue</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-charcoal mt-2">{delayedInstallations.length}</p>
            <p className="text-[10px] text-mutedGrey mt-0.5">Requires intervention</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <button
            type="button"
            onClick={() => setTechFilter('my_jobs')}
            className={`text-left p-4 rounded-2xl border transition-all ${
              techFilter === 'my_jobs' ? 'border-navy bg-navy/5 shadow-xs' : 'border-warmGrey/60 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">My Work Orders</span>
              <Wrench className="w-4 h-4 text-navy" />
            </div>
            <p className="text-2xl font-bold text-charcoal mt-2">{myAssignedJobs.length}</p>
            <p className="text-[11px] text-mutedGrey mt-0.5">Assigned to you</p>
          </button>

          <button
            type="button"
            onClick={() => setTechFilter('in_progress')}
            className={`text-left p-4 rounded-2xl border transition-all ${
              techFilter === 'in_progress' ? 'border-amber bg-amber-50/70 shadow-xs' : 'border-warmGrey/60 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber">Active In Progress</span>
              <Clock className="w-4 h-4 text-amber" />
            </div>
            <p className="text-2xl font-bold text-charcoal mt-2">{myInProgressJobs.length}</p>
            <p className="text-[11px] text-mutedGrey mt-0.5">Currently on site</p>
          </button>

          <button
            type="button"
            onClick={() => setTechFilter('completed')}
            className={`text-left p-4 rounded-2xl border transition-all ${
              techFilter === 'completed' ? 'border-sage bg-sage-50 shadow-xs' : 'border-warmGrey/60 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sage">Handed Over</span>
              <CheckCircle2 className="w-4 h-4 text-sage" />
            </div>
            <p className="text-2xl font-bold text-charcoal mt-2">{myCompletedJobs.length}</p>
            <p className="text-[11px] text-mutedGrey mt-0.5">Signed by customer</p>
          </button>
        </div>
      )}

      {/* 3. Installations Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="p-4 border-b border-warmGrey/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sand-50/50">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
              {isOwner ? 'Installation Work Order Registry' : 'Work Order Assignments'}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sand-200 text-charcoal">
              {displayedInstallations.length} records
            </span>
          </div>

          {/* Quick tab switcher */}
          <div className="flex items-center space-x-1.5 text-xs">
            {isOwner ? (
              <span className="text-[11px] text-mutedGrey font-medium">
                Showing filter: <strong className="text-charcoal uppercase">{ownerFilter}</strong>
              </span>
            ) : (
              <div className="flex bg-sand-200/80 p-0.5 rounded-lg text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setTechFilter('my_jobs')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${techFilter === 'my_jobs' ? 'bg-white font-bold text-navy shadow-xs' : 'text-mutedGrey hover:text-charcoal'}`}
                >
                  My Jobs
                </button>
                <button
                  type="button"
                  onClick={() => setTechFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${techFilter === 'all' ? 'bg-white font-bold text-navy shadow-xs' : 'text-mutedGrey hover:text-charcoal'}`}
                >
                  All Operations
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Job Code</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Capacity & System</th>
                <th className="py-3 px-4">Scheduled Window</th>
                <th className="py-3 px-4">Assigned Crew</th>
                <th className="py-3 px-4">Commissioning Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Attribution / Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {displayedInstallations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-mutedGrey">
                    No installation work orders found matching the selected filter.
                  </td>
                </tr>
              ) : (
                displayedInstallations.map(inst => {
                  const totalChecklist = Object.keys(inst.checklist).length;
                  const completedCount = Object.values(inst.checklist).filter(Boolean).length;
                  const percent = Math.round((completedCount / totalChecklist) * 100);
                  const isAssigned = inst.technicianNames.some(t => t.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(t.toLowerCase()));

                  return (
                    <tr
                      key={inst.id}
                      onClick={() => handleOpenJob(inst)}
                      className="cursor-pointer hover:bg-sand-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-navy">
                        {inst.installationCode}
                        {inst.isDelayed && (
                          <span className="block mt-0.5 text-[9px] font-bold text-terracotta uppercase">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-charcoal">{inst.customerName}</div>
                        <div className="text-[11px] text-mutedGrey truncate max-w-[180px]">{inst.customerAddress}</div>
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
                        <div className="font-semibold text-charcoal flex items-center gap-1.5">
                          <span>{inst.technicianNames.join(', ')}</span>
                          {isAssigned && !isOwner && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sage-50 text-sage border border-sage/30">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-14 bg-sand-200 rounded-full h-2 overflow-hidden">
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
                      <td className="py-3.5 px-4 text-[11px] text-mutedGrey max-w-[170px]">
                        {inst.executedByTechnicianName ? (
                          <span className="text-sage font-medium">
                            Executed by {inst.executedByTechnicianName}
                          </span>
                        ) : inst.reassignedBy ? (
                          <span className="text-navy font-medium">
                            Reassigned by {inst.reassignedBy}
                          </span>
                        ) : inst.rescheduledBy ? (
                          <span className="text-amber font-medium">
                            Rescheduled by {inst.rescheduledBy}
                          </span>
                        ) : (
                          <span className="truncate block">{inst.adminNotes || '—'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenJob(inst);
                            }}
                            className="px-3 py-1.5 bg-white text-navy border border-warmGrey text-xs font-semibold rounded-lg hover:bg-sand-100 transition-colors shadow-xs inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-navy" />
                            <span>Inspect Job</span>
                          </button>
                        ) : isAssigned ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenJob(inst);
                            }}
                            className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs inline-flex items-center space-x-1"
                          >
                            <Wrench className="w-3.5 h-3.5 text-sand" />
                            <span>Execute Job</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenJob(inst);
                            }}
                            className="px-3 py-1.5 bg-sand-100 text-charcoal text-xs font-medium rounded-lg hover:bg-sand-200 transition-colors shadow-xs inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-mutedGrey" />
                            <span>View Details</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal (Contextual: Owner Inspection & Governance vs Technician Execution) */}
      {isJobModalOpen && selectedJob && (
        <Modal
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          title={
            isOwner
              ? `Installation Job Oversight — ${selectedJob.installationCode}`
              : canExecuteJob
                ? `Technician Job Execution — ${selectedJob.installationCode}`
                : `Installation Details — ${selectedJob.installationCode}`
          }
          subtitle={`${selectedJob.customerName} (${selectedJob.capacityKw} kW Rooftop Solar) • ${isOwner ? 'Administrative Governance' : 'Field Operations'}`}
          maxWidth="4xl"
        >
          {isOwner ? (
            /* =========================================================================
               OWNER / ADMIN GOVERNANCE & INSPECTION VIEW
               Read-only checklist, verification audit, reassign & reschedule management
               ========================================================================= */
            <div className="space-y-5">
              {/* Governance Notification Banner */}
              <div className="p-3.5 rounded-xl border border-navy/20 bg-navy/5 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-navy">Administrative Quality & Safety Oversight</p>
                    <p className="text-mutedGrey text-[11px] mt-0.5">
                      As Managing Director, you have company-wide authority to oversee execution quality, reassign technical crew, or reschedule dates. Physical execution is reserved for certified field engineers.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReassignPanel(!showReassignPanel);
                      setShowReschedulePanel(false);
                    }}
                    className="px-3 py-1.5 bg-white text-navy border border-warmGrey text-xs font-semibold rounded-lg hover:bg-sand-50 transition-colors flex items-center space-x-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Reassign Crew</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReschedulePanel(!showReschedulePanel);
                      setShowReassignPanel(false);
                    }}
                    className="px-3 py-1.5 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-lg hover:bg-sand-50 transition-colors flex items-center space-x-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-navy" />
                    <span>Reschedule</span>
                  </button>
                </div>
              </div>

              {/* Administrative Reassignment Panel */}
              {showReassignPanel && (
                <div className="p-4 rounded-xl border border-navy/30 bg-sand-50 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" />
                      <span>Reassign Lead Installation Engineer</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowReassignPanel(false)}
                      className="text-xs text-mutedGrey hover:text-charcoal"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {techEmployees.map(tech => {
                      const isSelected = selectedTechNames.includes(tech.fullName);
                      return (
                        <button
                          key={tech.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTechNames(selectedTechNames.filter(t => t !== tech.fullName));
                            } else {
                              setSelectedTechNames([...selectedTechNames, tech.fullName]);
                            }
                          }}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                            isSelected ? 'border-navy bg-navy/10 font-bold text-navy' : 'border-warmGrey bg-white hover:bg-sand-100 text-charcoal'
                          }`}
                        >
                          <div>
                            <p>{tech.fullName}</p>
                            <p className="text-[10px] text-mutedGrey font-normal">{tech.designation}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-navy" />}
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal mb-1">
                      Administrative Reason for Reassignment
                    </label>
                    <input
                      type="text"
                      value={reassignReason}
                      onChange={e => setReassignReason(e.target.value)}
                      placeholder="e.g. Workload balancing, specialized inverter expertise required..."
                      className="w-full text-xs p-2 rounded-lg border border-warmGrey focus:border-navy focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmReassign}
                      className="px-4 py-1.5 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light transition-colors"
                    >
                      Authorize Reassignment
                    </button>
                  </div>
                </div>
              )}

              {/* Administrative Reschedule Panel */}
              {showReschedulePanel && (
                <div className="p-4 rounded-xl border border-navy/30 bg-sand-50 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Reschedule Installation Execution Window</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowReschedulePanel(false)}
                      className="text-xs text-mutedGrey hover:text-charcoal"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal mb-1">
                        New Start Date
                      </label>
                      <input
                        type="date"
                        value={rescheduleStartDate}
                        onChange={e => setRescheduleStartDate(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-warmGrey focus:border-navy focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal mb-1">
                        New Completion Target Date
                      </label>
                      <input
                        type="date"
                        value={rescheduleEndDate}
                        onChange={e => setRescheduleEndDate(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-warmGrey focus:border-navy focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal mb-1">
                      Reason for Rescheduling
                    </label>
                    <input
                      type="text"
                      value={rescheduleReason}
                      onChange={e => setRescheduleReason(e.target.value)}
                      placeholder="e.g. Customer requested weekend schedule, civil work delayed..."
                      className="w-full text-xs p-2 rounded-lg border border-warmGrey focus:border-navy focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmReschedule}
                      className="px-4 py-1.5 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light transition-colors"
                    >
                      Authorize Rescheduled Window
                    </button>
                  </div>
                </div>
              )}

              {/* Job Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-sand-50/50 rounded-xl border border-warmGrey/60 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-mutedGrey block">Customer Details</span>
                  <p className="font-bold text-charcoal mt-0.5">{selectedJob.customerName}</p>
                  <p className="text-mutedGrey text-[11px] mt-0.5">{selectedJob.customerAddress}</p>
                  <p className="text-mutedGrey text-[11px]">Phone: {selectedJob.customerPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-mutedGrey block">Solar System Specifications</span>
                  <p className="font-bold text-navy mt-0.5">{selectedJob.capacityKw} kW ({selectedJob.systemType.replace('_', ' ')})</p>
                  <p className="text-mutedGrey text-[11px] mt-0.5">Order Ref: {selectedJob.orderNumber}</p>
                  <p className="text-mutedGrey text-[11px]">Status: <StatusBadge status={selectedJob.status} /></p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-mutedGrey block">Operational Assignment</span>
                  <p className="font-bold text-charcoal mt-0.5">{selectedJob.technicianNames.join(', ')}</p>
                  <p className="text-mutedGrey text-[11px] mt-0.5">Window: {selectedJob.scheduledDate} to {selectedJob.scheduledEndDate}</p>
                  {selectedJob.executedByTechnicianName && (
                    <p className="text-sage text-[11px] font-semibold mt-1">
                      ✓ Commissioned by {selectedJob.executedByTechnicianName}
                    </p>
                  )}
                </div>
              </div>

              {/* Read-Only Commissioning Checklist Inspection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                    8-Point Commissioning Checklist (Inspection Mode)
                  </h4>
                  <span className="text-xs font-bold text-navy">
                    {Object.values(selectedJob.checklist).filter(Boolean).length}/8 verified
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {checklistItems.map((item, index) => {
                    const isChecked = selectedJob.checklist[item.key];
                    return (
                      <div
                        key={item.key}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs ${
                          isChecked ? 'border-sage/40 bg-sage-50/70 text-charcoal' : 'border-warmGrey/60 bg-sand-50/40 text-mutedGrey'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked ? 'bg-sage text-white' : 'bg-warmGrey/50 text-mutedGrey'
                        }`}>
                          {isChecked ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className="font-semibold">{index + 1}. {item.label}</p>
                          <p className="text-[10px] mt-0.5">
                            {isChecked ? 'Verified by certified installer on site' : 'Pending physical site test'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remarks & Signoff Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl border border-warmGrey/70 bg-white">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Field Technician Observations
                  </h5>
                  <p className="text-xs text-charcoal bg-sand-50 p-3 rounded-lg border border-warmGrey/40 min-h-[70px] whitespace-pre-wrap">
                    {selectedJob.technicianRemarks || 'No technician observations filed yet.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-warmGrey/70 bg-white">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Customer Digital Signoff
                  </h5>
                  <div className="bg-sand-50 p-3 rounded-lg border border-warmGrey/40 min-h-[70px] flex flex-col justify-center">
                    {selectedJob.customerSignName ? (
                      <div>
                        <p className="text-xs font-bold text-charcoal">Signoff Name: {selectedJob.customerSignName}</p>
                        <p className="text-[10px] text-mutedGrey mt-0.5">Completed: {selectedJob.actualFinishTime || 'Archived'}</p>
                        {selectedJob.customerSignature && (
                          <div className="mt-2 border border-warmGrey/40 rounded bg-white p-1 inline-block">
                            <img src={selectedJob.customerSignature} alt="Customer Signoff" className="h-10 object-contain" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-mutedGrey italic">
                        Customer handover signoff pending physical commissioning.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner Footer (No operational complete button) */}
              <div className="pt-4 border-t border-warmGrey/60 flex items-center justify-between">
                <span className="text-[11px] text-mutedGrey font-medium">
                  Administrative record viewed as Managing Director & Owner.
                </span>
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-5 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light transition-colors"
                >
                  Close Oversight
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               INSTALLATION TECHNICIAN OPERATIONAL VIEW
               Interactive checklist, live work timers, remarks, customer signature pad
               ========================================================================= */
            <form onSubmit={handleCompleteJob}>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_240px]">
                <div className="space-y-5">
                  {/* Job Summary Banner with Start Timer */}
                  <section className="rounded-xl border border-warmGrey/70 bg-sand-50/50 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0 text-xs">
                        <p className="font-bold text-charcoal text-sm">{selectedJob.customerName}</p>
                        <p className="mt-1 text-mutedGrey">{selectedJob.customerAddress}</p>
                        <p className="mt-2 text-mutedGrey">
                          <span className="font-semibold text-charcoal">Phone:</span> {selectedJob.customerPhone}
                        </p>
                        <p className="mt-1 text-mutedGrey">
                          <span className="font-semibold text-charcoal">Capacity:</span> {selectedJob.capacityKw} kW Rooftop Solar
                        </p>
                      </div>

                      {canExecuteJob && (
                        <div>
                          {selectedJob.status !== 'in_progress' && selectedJob.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={handleStartWork}
                              className="shrink-0 px-4 py-2 bg-sage text-white text-xs font-bold rounded-xl hover:bg-sage-dark flex items-center justify-center space-x-1.5 shadow-xs"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>Start work timer</span>
                            </button>
                          )}
                          {selectedJob.status === 'in_progress' && (
                            <div className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 text-amber border border-amber/40 rounded-xl text-xs font-bold">
                              <Clock className="w-4 h-4" />
                              <span>In progress</span>
                            </div>
                          )}
                          {selectedJob.status === 'completed' && (
                            <div className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-sage-50 text-sage border border-sage/40 rounded-xl text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Commissioned</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Safety Checklist (Interactive) */}
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
                              <p className="mt-1 text-[11px] text-mutedGrey">
                                Certified field verification required before digital signoff
                              </p>
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
                          className={`flex min-h-12 items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                            !canExecuteJob
                              ? 'cursor-not-allowed opacity-80'
                              : 'cursor-pointer'
                          } ${
                            selectedJob.checklist[item.key]
                              ? 'border-sage/40 bg-sage-50/70'
                              : 'border-warmGrey/70 bg-white hover:bg-sand-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={!canExecuteJob}
                            checked={selectedJob.checklist[item.key]}
                            onChange={() => handleToggleChecklist(item.key)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-warmGrey text-navy focus:ring-navy disabled:cursor-not-allowed"
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
                      disabled={!canExecuteJob}
                      value={technicianRemarks}
                      onChange={e => setTechnicianRemarks(e.target.value)}
                      placeholder="Record generation output, open-circuit voltage, and net metering observations..."
                      className="w-full rounded-lg border border-warmGrey px-3 py-2.5 text-xs leading-5 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy disabled:bg-sand-50 disabled:cursor-not-allowed"
                    />
                  </section>
                </div>

                {/* Signoff Rail */}
                <aside className="rounded-xl border border-warmGrey/70 bg-sand-50/30 p-4 h-fit">
                  <div className="mb-3">
                    <h4 className="text-xs font-bold text-charcoal">Customer Signoff</h4>
                    <p className="mt-1 text-[11px] text-mutedGrey">Digital customer acceptance</p>
                  </div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-charcoal">Customer Name</label>
                  <input
                    type="text"
                    required
                    disabled={!canExecuteJob}
                    placeholder="Full name of customer"
                    value={customerSignName}
                    onChange={e => setCustomerSignName(e.target.value)}
                    className="mb-3 w-full rounded-lg border border-warmGrey bg-white px-3 py-2 text-xs focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy disabled:bg-sand-50"
                  />
                  {canExecuteJob ? (
                    <SignaturePad
                      onSave={dataUrl => setSignatureData(dataUrl)}
                      onClear={() => setSignatureData(undefined)}
                      width={280}
                      height={140}
                    />
                  ) : (
                    <div className="h-32 border border-warmGrey/60 rounded-lg bg-sand-100 flex items-center justify-center text-xs text-mutedGrey text-center p-2">
                      Signoff pad disabled (view-only mode)
                    </div>
                  )}
                </aside>
              </div>

              {/* Operational Action Footer */}
              <div className="mt-5 -mx-4 border-t border-warmGrey/60 bg-white px-4 py-3 flex flex-col-reverse gap-2 sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="hidden sm:block text-[11px] text-mutedGrey">
                  {canExecuteJob
                    ? 'All 8 checklist items & customer signoff required before completion'
                    : 'You are viewing this order in read-only mode'
                  }
                </span>
                <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsJobModalOpen(false)}
                    className="min-h-10 flex-1 px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg sm:flex-none"
                  >
                    Cancel
                  </button>
                  {canExecuteJob && (
                    <button
                      type="submit"
                      className="min-h-10 flex-[1.7] px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs sm:flex-none sm:px-5"
                    >
                      Complete Installation Job & Commission
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </Modal>
      )}

    </div>
  );
};