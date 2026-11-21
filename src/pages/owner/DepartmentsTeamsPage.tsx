import React, { useState } from 'react';
import { 
  Building2, Users, ArrowRightLeft, ShieldCheck, 
  TrendingUp, Compass, Cpu, Wrench, Package, IndianRupee, 
  UserCheck, Plus, ChevronRight, CheckCircle2, ArrowUpRight,
  Briefcase, Award, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Department, Team, Employee, UserRole } from '../../types';

export const DepartmentsTeamsPage: React.FC = () => {
  const { departments, teams, employees, transferEmployee, showToast } = useApp();

  const [selectedDeptId, setSelectedDeptId] = useState<string>('dept-1');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedEmpForTransfer, setSelectedEmpForTransfer] = useState<string>('');
  const [targetDeptName, setTargetDeptName] = useState<string>('Sales');
  const [targetTeamId, setTargetTeamId] = useState<string>('');

  const activeDepartment = departments.find(d => d.id === selectedDeptId) || departments[0];
  const deptTeams = teams.filter(t => t.departmentId === activeDepartment?.id);
  const deptEmployees = employees.filter(e => 
    e.department.toLowerCase() === activeDepartment?.name.toLowerCase() ||
    activeDepartment?.name.toLowerCase().includes(e.department.toLowerCase())
  );

  const getDeptIcon = (code: string) => {
    switch (code) {
      case 'SLS': return <TrendingUp className="w-5 h-5 text-amber" />;
      case 'FLD': return <Compass className="w-5 h-5 text-navy" />;
      case 'ENG': return <Cpu className="w-5 h-5 text-purple-600" />;
      case 'OPS': return <Wrench className="w-5 h-5 text-emerald-600" />;
      case 'LOG': return <Package className="w-5 h-5 text-blue-600" />;
      case 'FIN': return <IndianRupee className="w-5 h-5 text-emerald-700" />;
      case 'SUP': return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      default: return <Building2 className="w-5 h-5 text-navy" />;
    }
  };

  const handleOpenTransfer = (empId?: string) => {
    if (empId) {
      setSelectedEmpForTransfer(empId);
      const emp = employees.find(e => e.id === empId);
      if (emp) {
        setTargetDeptName(emp.department);
      }
    } else if (employees.length > 0) {
      setSelectedEmpForTransfer(employees[0].id);
      setTargetDeptName(employees[0].department);
    }
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForTransfer) {
      showToast('Please select an employee to transfer', 'error');
      return;
    }
    transferEmployee(selectedEmpForTransfer, targetDeptName, targetTeamId || undefined);
    setIsTransferModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">Departments & Teams Management</h1>
            <span className="px-2 py-0.5 bg-sand-200/70 text-navy text-[10px] font-bold rounded-full border border-warmGrey uppercase tracking-wider">
              Org Structure
            </span>
          </div>
          <p className="text-xs text-mutedGrey mt-0.5">
            SunPower Solutions enterprise organizational hierarchy, operational divisions, and team deployment
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => handleOpenTransfer()}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Employee</span>
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {departments.map((dept) => {
          const isSelected = dept.id === activeDepartment?.id;
          const memberCount = employees.filter(e => 
            e.department.toLowerCase() === dept.name.toLowerCase() ||
            dept.name.toLowerCase().includes(e.department.toLowerCase())
          ).length;

          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                isSelected 
                  ? 'bg-white border-navy ring-2 ring-navy/10 shadow-[0_5px_18px_rgba(196,138,66,0.16)]' 
                  : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:border-warmGrey hover:shadow-card-hover'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center shrink-0 border border-warmGrey/60">
                  {getDeptIcon(dept.code)}
                </div>
                <span className="px-2 py-0.5 bg-sand-50 text-navy font-mono text-[10px] rounded border border-warmGrey/50 font-bold">
                  {dept.code}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-sm text-charcoal">{dept.name}</h3>
                <p className="text-[11px] text-mutedGrey line-clamp-2 mt-1">
                  {dept.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-warmGrey/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-mutedGrey text-[11px]">Department Head:</span>
                  <span className="font-bold text-charcoal">{dept.headEmployeeName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-mutedGrey text-[11px]">Workforce Size:</span>
                  <span className="font-mono font-bold text-navy">{memberCount} Specialists</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-mutedGrey text-[11px]">Monthly Budget:</span>
                  <span className="font-mono font-bold text-charcoal">₹{(dept.budgetAllocated / 100000).toFixed(1)}L</span>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 font-semibold truncate">
                {dept.kpiSummary}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Department Deep-Dive & Teams */}
      {activeDepartment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Department Teams List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-charcoal flex items-center space-x-2">
                    <span>Teams under {activeDepartment.name}</span>
                    <span className="text-xs text-mutedGrey font-normal">({deptTeams.length} functional units)</span>
                  </h3>
                  <p className="text-xs text-mutedGrey mt-0.5">
                    Lead supervisor: <span className="font-semibold text-charcoal">{activeDepartment.headEmployeeName}</span> ({activeDepartment.headDesignation})
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {deptTeams.map(team => (
                  <div key={team.id} className="p-4 bg-sand-50/50 rounded-xl border border-warmGrey/60 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-charcoal">{team.name}</h4>
                        <p className="text-xs text-mutedGrey mt-0.5">{team.description}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-white text-navy font-mono text-[11px] font-bold rounded border border-warmGrey/60">
                        {team.memberCount} Members
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-warmGrey/40 text-xs gap-2">
                      <div className="text-[11px] text-mutedGrey">
                        Team Lead: <span className="font-bold text-charcoal">{team.teamLeadName}</span>
                      </div>
                      {team.currentObjective && (
                        <div className="text-[11px] text-navy bg-white px-2 py-0.5 rounded border border-warmGrey/50 font-medium">
                          Target: {team.currentObjective}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Employees Assigned to this Department */}
              <div className="mt-6 pt-5 border-t border-warmGrey/60">
                <h4 className="font-bold text-sm text-charcoal mb-3">
                  Assigned Personnel ({deptEmployees.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deptEmployees.map(emp => (
                    <div key={emp.id} className="p-3 bg-white rounded-xl border border-warmGrey/60 flex items-center justify-between hover:bg-sand-50/50 transition-colors">
                      <div>
                        <div className="font-bold text-xs text-charcoal">{emp.fullName}</div>
                        <div className="text-[10px] text-mutedGrey">{emp.employeeCode} • {emp.designation}</div>
                        <div className="text-[10px] text-navy font-medium mt-0.5">{emp.teamName || 'General Staff'}</div>
                      </div>
                      <button
                        onClick={() => handleOpenTransfer(emp.id)}
                        className="px-2 py-1 bg-sand-100 text-navy hover:bg-navy hover:text-white rounded text-[10px] font-semibold transition-colors flex items-center space-x-1"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Transfer</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Organizational Hierarchy Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
              <h3 className="font-bold text-sm text-charcoal mb-4 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-navy" />
                <span>Executive Command Tree</span>
              </h3>

              {/* Owner Top Level */}
              <div className="space-y-4">
                <div className="p-3 bg-navy text-white rounded-xl shadow-xs">
                  <div className="text-[10px] font-mono text-sand-200 uppercase tracking-widest font-bold">
                    Executive Managing Director & Owner
                  </div>
                  <div className="font-bold text-sm mt-0.5">Vikramaditya Rao</div>
                  <div className="text-[11px] text-sand-100">Direct Authority across all 7 Divisions</div>
                </div>

                <div className="pl-4 border-l-2 border-dashed border-warmGrey space-y-3">
                  {departments.slice(0, 5).map(d => (
                    <div key={d.id} className="p-2.5 bg-sand-50 rounded-lg border border-warmGrey/60">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-charcoal">{d.headEmployeeName}</span>
                        <span className="font-mono text-[10px] text-mutedGrey font-bold">{d.code}</span>
                      </div>
                      <div className="text-[10px] text-mutedGrey">{d.name} Head</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Transfer Employee Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-warmGrey relative">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sand-100 flex items-center justify-center text-navy">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Transfer Employee</h3>
                <p className="text-xs text-mutedGrey">Move personnel between operational departments</p>
              </div>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block text-mutedGrey font-medium mb-1">Select Employee</label>
                <select
                  value={selectedEmpForTransfer}
                  onChange={e => setSelectedEmpForTransfer(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode}) — Currently in {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Destination Department</label>
                <select
                  value={targetDeptName}
                  onChange={e => setTargetDeptName(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  <option value="Sales">Sales & Business Development</option>
                  <option value="Field Operations">Field Operations</option>
                  <option value="Engineering">Engineering & Approvals</option>
                  <option value="Installation">Installation & Commissioning</option>
                  <option value="Warehouse">Warehouse & Supply Chain</option>
                  <option value="Accounts">Accounts & Finance</option>
                  <option value="Customer Support">Client Care & Warranty</option>
                </select>
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Assign to Functional Team (Optional)</label>
                <select
                  value={targetTeamId}
                  onChange={e => setTargetTeamId(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  <option value="">Keep / Default Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60 text-[11px] text-mutedGrey">
                Notice: Transferring an employee automatically updates their department reporting line and creates an immutable audit trail entry in the Employee Activity Center.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 border border-warmGrey text-charcoal rounded-xl hover:bg-sand-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-light font-semibold shadow-xs"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
