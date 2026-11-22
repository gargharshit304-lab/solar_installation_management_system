import React, { useState, useEffect } from 'react';
import { 
  X, Check, ArrowRightLeft, ShieldCheck, Building2, 
  Users, Calendar, AlertCircle, ArrowRight 
} from 'lucide-react';
import { Employee } from '../../types';
import { useApp } from '../../context/AppContext';

interface TransferEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onTransfer: (id: string, data: {
    newDepartment: string;
    newTeam: string;
    reportingManagerId?: string;
    reportingManagerName?: string;
    effectiveDate: string;
    reason: string;
    notes?: string;
  }) => Promise<boolean>;
  departments: { id: string; name: string }[];
  allEmployees: Employee[];
}

const DEPARTMENT_TEAMS: Record<string, string[]> = {
  'Executive Management': ['Executive Board', 'Corporate Strategy', 'Internal Audit'],
  'Sales & Business Development': ['Residential Solar Sales', 'Commercial & Industrial Sales', 'Inside Sales & Pre-Sales', 'Government Tenders'],
  'Field Engineering & Surveys': ['Technical Site Survey Crew 1', 'Technical Site Survey Crew 2', 'Shadow & Feasibility Analysis', 'Rapid Assessment Team'],
  'Engineering & Approvals': ['Solar System Design & Simulation', 'CEIG & Electrical Approvals', 'DISCOM Net-Metering Liaison', 'Structural & Mounting Analysis'],
  'Operations & Installations': ['Installation Crew Alpha (Rooftop)', 'Installation Crew Beta (Commercial)', 'Commissioning & Testing', 'Quality & Safety Inspection'],
  'Supply Chain & Inventory': ['Central Warehouse Operations', 'Procurement & Vendor Relations', 'Fleet & Dispatch Logistics', 'Inventory Quality Control'],
  'Finance & Compliance': ['Accounts Receivable & Billing', 'Accounts Payable & Expenses', 'Tax & GST Compliance', 'Financial Audit & Reporting'],
  'After-Sales & Customer Service': ['Rooftop Maintenance & AMC', 'Warranty & RMA Support', 'Customer Care & Ticketing', 'Field Repair Dispatch']
};

const COMMON_TRANSFER_REASONS = [
  'Project Reallocation & Regional Demand Shift',
  'Cross-Functional Skill Development & Career Rotation',
  'Inter-Departmental Structural Reorganization',
  'Employee Transfer Request (Personal/Location Alignment)',
  'Capacity Scaling in Target Functional Division'
];

export const TransferEmployeeModal: React.FC<TransferEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onTransfer,
  departments,
  allEmployees
}) => {
  const { showToast } = useApp();

  const [newDepartment, setNewDepartment] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState(COMMON_TRANSFER_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      // Pick first alternative department by default
      const defaultAltDept = departments.find(d => d.name !== employee.department)?.name || employee.department;
      setNewDepartment(defaultAltDept);

      const teams = DEPARTMENT_TEAMS[defaultAltDept] || [];
      setNewTeam(teams[0] || 'General Crew');

      setReportingManagerId(employee.reportingManagerId || '');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      setReason(COMMON_TRANSFER_REASONS[0]);
      setCustomReason('');
      setNotes('');
      setErrors({});
    }
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const availableTeams = DEPARTMENT_TEAMS[newDepartment] || [];
  const potentialManagers = allEmployees.filter(
    e => e.id !== employee.id && e.department === newDepartment
  );

  const handleValidate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!newDepartment) errs.newDepartment = 'Target department is required';
    if (!newTeam) errs.newTeam = 'Target team is required';
    const finalReason = customReason.trim() || reason;
    if (!finalReason) errs.reason = 'Transfer reason is required';
    if (!effectiveDate) errs.effectiveDate = 'Effective date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate()) {
      showToast('Please correct validation errors.', 'error');
      return;
    }

    setIsSubmitting(true);
    const chosenManager = potentialManagers.find(m => m.id === reportingManagerId);
    const finalReason = customReason.trim() || reason;

    try {
      const ok = await onTransfer(employee.id, {
        newDepartment,
        newTeam,
        reportingManagerId: reportingManagerId || undefined,
        reportingManagerName: chosenManager ? chosenManager.fullName : undefined,
        effectiveDate,
        reason: finalReason,
        notes: notes.trim() || undefined
      });
      if (ok) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-warmGrey relative animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-warmGrey/60 flex items-start justify-between bg-gradient-to-r from-sand-50 to-navy-50/30 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-navy/10 border border-navy/20 flex items-center justify-center text-navy shrink-0">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg text-charcoal">Transfer Department &amp; Functional Team</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-sand-200 text-charcoal font-semibold border border-warmGrey/60">
                  Internal Mobility
                </span>
              </div>
              <p className="text-xs text-mutedGrey mt-0.5">
                Reassign <strong className="text-charcoal">{employee.fullName}</strong> ({employee.employeeCode}) to a new operational division.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-mutedGrey hover:text-charcoal hover:bg-sand-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Historical Assignment Integrity Notice */}
          <div className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey/60 flex items-start space-x-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-forest-emerald shrink-0 mt-0.5" />
            <div className="text-charcoal leading-relaxed">
              <span className="font-bold text-forest-emerald block">Historical Assignment Integrity Preserved</span>
              All historical survey records, installation sign-offs, dispatch handovers, expense receipts, and audit logs completed by {employee.fullName} remain fully preserved and permanently linked.
            </div>
          </div>

          {/* Current vs Target Department Strip */}
          <div className="p-4 bg-sand-50/70 rounded-2xl border border-warmGrey/60 flex items-center justify-between text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-mutedGrey block">Origin Department</span>
              <span className="font-bold text-charcoal block">{employee.department}</span>
              <span className="text-[11px] text-mutedGrey font-medium">Team: {employee.team || employee.teamName || 'Standard Crew'}</span>
            </div>

            <div className="p-2 bg-white rounded-full border border-warmGrey/60 text-navy">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[10px] uppercase font-bold text-navy block">Destination Department</span>
              <span className="font-bold text-navy block">{newDepartment}</span>
              <span className="text-[11px] text-mutedGrey font-medium">Team: {newTeam}</span>
            </div>
          </div>

          {/* Transfer Form Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Destination Department *
                </label>
                <select
                  value={newDepartment}
                  onChange={e => {
                    const dept = e.target.value;
                    setNewDepartment(dept);
                    const teams = DEPARTMENT_TEAMS[dept] || [];
                    if (teams.length > 0) setNewTeam(teams[0]);
                  }}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white focus:border-navy"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
                {errors.newDepartment && <p className="text-[11px] text-terracotta mt-1">{errors.newDepartment}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Functional Team in Destination *
                </label>
                <select
                  value={newTeam}
                  onChange={e => setNewTeam(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white focus:border-navy"
                >
                  {availableTeams.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
                {errors.newTeam && <p className="text-[11px] text-terracotta mt-1">{errors.newTeam}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Effective Transfer Date *
                </label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={e => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  New Reporting Manager in Destination
                </label>
                <select
                  value={reportingManagerId}
                  onChange={e => setReportingManagerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                >
                  <option value="">-- No Specific Manager Selected --</option>
                  {potentialManagers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.designation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Reason for Transfer *
              </label>
              <select
                value={reason}
                onChange={e => {
                  setReason(e.target.value);
                  if (e.target.value) setCustomReason('');
                }}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white mb-2"
              >
                {COMMON_TRANSFER_REASONS.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
                <option value="custom">Other / Custom Justification...</option>
              </select>

              {reason === 'custom' && (
                <input
                  type="text"
                  required
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  placeholder="Enter specific transfer justification..."
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                />
              )}
              {errors.reason && <p className="text-[11px] text-terracotta mt-1">{errors.reason}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Handover Notes / Transition Checklist
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Details on handover of active tasks, tools, vehicles, or client accounts..."
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-warmGrey/60 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-sand-100 rounded-xl transition-colors border border-warmGrey"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Executing Transfer...</span>
              ) : (
                <>
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Execute Department Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
