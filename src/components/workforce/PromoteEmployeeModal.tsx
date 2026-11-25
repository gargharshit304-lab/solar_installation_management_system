import React, { useState, useEffect } from 'react';
import { 
  X, Check, TrendingUp, Award, ArrowRight, ShieldCheck, 
  Calendar, UserCheck, AlertCircle, Sparkles 
} from 'lucide-react';
import { Employee, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

interface PromoteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onPromote: (id: string, data: {
    newDesignation: string;
    newDepartment?: string;
    newTeam?: string;
    newRoleId: UserRole;
    newHourlyRate: number;
    reportingManagerId?: string;
    reportingManagerName?: string;
    effectiveDate: string;
    reason: string;
    notes?: string;
  }) => Promise<boolean>;
  departments: { id: string; name: string }[];
  allRoles: { roleKey: string; name: string }[];
  allEmployees: Employee[];
}

const COMMON_PROMOTION_REASONS = [
  'Annual Performance Appraisal & Merit Promotion',
  'Exceptional Technical Leadership & Execution',
  'Organizational Expansion / New Crew Lead Assignment',
  'Advanced Certification & License Acquisition',
  'Supervisory Scope & Team Management Addition'
];

export const PromoteEmployeeModal: React.FC<PromoteEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onPromote,
  departments,
  allRoles,
  allEmployees
}) => {
  const { showToast } = useApp();

  const [newDesignation, setNewDesignation] = useState('');
  const [newRoleId, setNewRoleId] = useState<UserRole>('engineering_lead');
  const [newHourlyRate, setNewHourlyRate] = useState<number>(350);
  const [newDepartment, setNewDepartment] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setNewDesignation(`Senior ${employee.designation}`);
      setNewRoleId(employee.role);
      setNewHourlyRate(Math.round((employee.hourlyRate || 250) * 1.25));
      setNewDepartment(employee.department);
      setNewTeam(employee.team || employee.teamName || '');
      setReportingManagerId(employee.reportingManagerId || '');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      setReason(COMMON_PROMOTION_REASONS[0]);
      setCustomReason('');
      setNotes('');
      setErrors({});
    }
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const currentRoleName = allRoles.find(r => r.roleKey === employee.role)?.name || employee.role;
  const newRoleName = allRoles.find(r => r.roleKey === newRoleId)?.name || newRoleId;
  const rateDelta = newHourlyRate - (employee.hourlyRate || 0);
  const ratePercentage = employee.hourlyRate ? ((rateDelta / employee.hourlyRate) * 100).toFixed(1) : '0';

  const potentialManagers = allEmployees.filter(
    e => e.id !== employee.id && (e.role === 'owner_admin' || e.role === 'engineering_lead' || e.role === 'warehouse_mgr')
  );

  const handleValidate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!newDesignation.trim()) errs.newDesignation = 'New designation is required';
    if (newHourlyRate < 0) errs.newHourlyRate = 'Hourly rate cannot be negative';
    const finalReason = customReason.trim() || reason;
    if (!finalReason) errs.reason = 'Promotion justification is required';
    if (!effectiveDate) errs.effectiveDate = 'Effective date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate()) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    const chosenManager = potentialManagers.find(m => m.id === reportingManagerId);
    const finalReason = customReason.trim() || reason;

    try {
      const ok = await onPromote(employee.id, {
        newDesignation: newDesignation.trim(),
        newRoleId,
        newHourlyRate: Number(newHourlyRate),
        newDepartment: newDepartment || employee.department,
        newTeam: newTeam || employee.team,
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
        <div className="p-5 border-b border-warmGrey/60 flex items-start justify-between bg-gradient-to-r from-sand-50 to-amber-50/40 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg text-charcoal">Promote Personnel</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-100/70 text-amber font-bold border border-amber/30">
                  Career Progression
                </span>
              </div>
              <p className="text-xs text-mutedGrey mt-0.5">
                Elevate <strong className="text-charcoal">{employee.fullName}</strong> ({employee.employeeCode}) with revised title, security role and compensation.
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
          
          {/* Side-by-Side Current vs Proposed Comparison Card */}
          <div className="p-4 bg-sand-50/80 rounded-2xl border border-warmGrey/60 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey block">
              Promotion Comparison Summary
            </span>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Left: Current Baseline */}
              <div className="p-3 bg-white rounded-xl border border-warmGrey/60 space-y-2">
                <span className="text-[10px] font-bold text-mutedGrey uppercase block">Current Baseline</span>
                <div>
                  <span className="text-[11px] text-mutedGrey block">Designation</span>
                  <span className="font-bold text-charcoal">{employee.designation}</span>
                </div>
                <div>
                  <span className="text-[11px] text-mutedGrey block">Security Role</span>
                  <span className="font-semibold text-navy">{currentRoleName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-mutedGrey block">Billing Rate</span>
                  <span className="font-mono font-bold text-charcoal">₹{employee.hourlyRate}/hr</span>
                </div>
              </div>

              {/* Right: Proposed Promotion */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber/40 space-y-2">
                <span className="text-[10px] font-bold text-amber uppercase block flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Proposed Revision</span>
                </span>
                <div>
                  <span className="text-[11px] text-mutedGrey block">New Designation</span>
                  <span className="font-bold text-charcoal">{newDesignation || '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-mutedGrey block">New Security Role</span>
                  <span className="font-semibold text-navy">{newRoleName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-mutedGrey block">New Billing Rate</span>
                  <span className="font-mono font-bold text-forest-emerald">
                    ₹{newHourlyRate}/hr 
                    {rateDelta !== 0 && (
                      <span className="text-[10px] ml-1 font-normal text-mutedGrey">
                        ({rateDelta > 0 ? `+${ratePercentage}%` : `${ratePercentage}%`})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Promotion Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                New Designation / Job Title *
              </label>
              <input
                type="text"
                required
                value={newDesignation}
                onChange={e => setNewDesignation(e.target.value)}
                placeholder="e.g. Lead Installation Crew Supervisor"
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:border-navy focus:outline-hidden"
              />
              {errors.newDesignation && <p className="text-[11px] text-terracotta mt-1">{errors.newDesignation}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  New System Security Role *
                </label>
                <select
                  value={newRoleId}
                  onChange={e => setNewRoleId(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white font-semibold text-navy focus:border-navy"
                >
                  {allRoles.map(r => (
                    <option key={r.roleKey} value={r.roleKey}>
                      {r.name} ({r.roleKey})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-mutedGrey mt-1">Updates user session capabilities immediately.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  New Hourly Billing Rate (₹/hr) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-mutedGrey">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newHourlyRate}
                    onChange={e => setNewHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold border border-warmGrey rounded-lg bg-white"
                  />
                </div>
                {errors.newHourlyRate && <p className="text-[11px] text-terracotta mt-1">{errors.newHourlyRate}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Effective Promotion Date *
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
                  Reporting Manager (Optional)
                </label>
                <select
                  value={reportingManagerId}
                  onChange={e => setReportingManagerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                >
                  <option value="">-- No Direct Change / Unassigned --</option>
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
                Reason for Promotion *
              </label>
              <select
                value={reason}
                onChange={e => {
                  setReason(e.target.value);
                  if (e.target.value) setCustomReason('');
                }}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white mb-2"
              >
                {COMMON_PROMOTION_REASONS.map((r, i) => (
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
                  placeholder="Enter specific promotion reason..."
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                />
              )}
              {errors.reason && <p className="text-[11px] text-terracotta mt-1">{errors.reason}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Appraisal Notes / Recommendations
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Key achievements, project milestones and evaluation comments..."
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
              className="px-5 py-2 bg-amber text-charcoal font-bold text-xs rounded-xl hover:bg-amber-600 transition-colors shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Recording Promotion...</span>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5" />
                  <span>Confirm Promotion &amp; Update Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
