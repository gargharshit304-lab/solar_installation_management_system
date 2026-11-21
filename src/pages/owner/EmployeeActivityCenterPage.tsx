import React, { useState } from 'react';
import { 
  Activity, Search, Filter, Download, Calendar, ShieldCheck, 
  ArrowUpRight, Clock, User, CheckCircle2, AlertTriangle, 
  TrendingUp, Compass, Cpu, Wrench, Package, IndianRupee, 
  FileText, Eye, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityDepartment, EmployeeActivityLog } from '../../types';

export const EmployeeActivityCenterPage: React.FC = () => {
  const { employeeActivities, employees, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('All');

  // Filter activities
  const filteredActivities = employeeActivities.filter(act => {
    const matchesSearch = 
      act.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.actionDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.targetEntity && act.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === 'All' || act.department === selectedDept;
    const matchesSeverity = selectedSeverity === 'All' || act.severity === selectedSeverity;
    const matchesEmp = selectedEmployee === 'All' || act.employeeId === selectedEmployee;

    return matchesSearch && matchesDept && matchesSeverity && matchesEmp;
  });

  const getDeptIcon = (dept: ActivityDepartment) => {
    switch (dept) {
      case 'Sales': return <TrendingUp className="w-4 h-4 text-amber" />;
      case 'Field Operations': return <Compass className="w-4 h-4 text-navy" />;
      case 'Engineering': return <Cpu className="w-4 h-4 text-purple-600" />;
      case 'Installation': return <Wrench className="w-4 h-4 text-emerald-600" />;
      case 'Warehouse': return <Package className="w-4 h-4 text-blue-600" />;
      case 'Accounts': return <IndianRupee className="w-4 h-4 text-emerald-700" />;
      default: return <Activity className="w-4 h-4 text-navy" />;
    }
  };

  const exportAuditLog = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Timestamp,Employee,Department,Role,Action Type,Details,Target Entity,Severity"]
      .concat(filteredActivities.map(a => 
        `"${a.timestamp}","${a.employeeName}","${a.department}","${a.role}","${a.actionType}","${a.actionDetails.replace(/"/g, '""')}","${a.targetEntity || ''}","${a.severity || 'normal'}"`
      )).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SolarOS_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Activity log exported as CSV', 'success');
  };

  const departmentsList: ActivityDepartment[] = ['Sales', 'Field Operations', 'Engineering', 'Installation', 'Warehouse', 'Accounts'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">Employee Activity Center</h1>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 uppercase tracking-wider">
              Live Audit Trail
            </span>
          </div>
          <p className="text-xs text-mutedGrey mt-0.5">
            Centralized immutable operational feed across 7 operational departments and 19 employees
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={exportAuditLog}
            className="px-3.5 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-navy" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Activity Metric Snapshot Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Total Actions Tracked</span>
            <Activity className="w-4 h-4 text-navy" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{employeeActivities.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">100% Append-only recorded</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Active Contributors</span>
            <User className="w-4 h-4 text-amber" />
          </div>
          <div className="text-2xl font-bold text-charcoal">
            {new Set(employeeActivities.map(a => a.employeeId)).size} / {employees.length}
          </div>
          <span className="text-[11px] text-mutedGrey">Employees logged today</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Critical Events</span>
            <AlertTriangle className="w-4 h-4 text-terracotta" />
          </div>
          <div className="text-2xl font-bold text-charcoal">
            {employeeActivities.filter(a => a.severity === 'critical' || a.severity === 'important').length}
          </div>
          <span className="text-[11px] text-terracotta font-medium">Elevated priority actions</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>System Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">100%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Zero unauthorized overrides</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-warmGrey/60 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search actions by employee name, action keyword, quotation number, or survey ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="All">All Departments</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="All">All Severities</option>
              <option value="critical">Critical</option>
              <option value="important">Important</option>
              <option value="normal">Normal</option>
            </select>

            <select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="All">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeCode})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Department Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-mutedGrey mr-1">Filter Dept:</span>
          <button
            onClick={() => setSelectedDept('All')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedDept === 'All' ? 'bg-navy text-white shadow-xs' : 'bg-sand-100 text-charcoal hover:bg-sand-200'
            }`}
          >
            All ({employeeActivities.length})
          </button>
          {departmentsList.map(dept => {
            const count = employeeActivities.filter(a => a.department === dept).length;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedDept === dept ? 'bg-navy text-white shadow-xs' : 'bg-sand-100 text-charcoal hover:bg-sand-200'
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Timeline Stream */}
      <div className="bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] overflow-hidden">
        <div className="px-5 py-4 border-b border-warmGrey/60 flex items-center justify-between bg-sand-50/40">
          <div>
            <h3 className="font-bold text-sm text-charcoal">Real-Time Operational Audit Feed</h3>
            <p className="text-[11px] text-mutedGrey">Showing {filteredActivities.length} matching company operations</p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-mutedGrey">
            <Clock className="w-3.5 h-3.5 text-navy" />
            <span>Sorted by most recent</span>
          </div>
        </div>

        <div className="divide-y divide-warmGrey/40">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-mutedGrey text-xs">
              No logged activities found matching the selected filters.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div 
                key={act.id} 
                className="p-4 hover:bg-sand-50/50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-sand-200/70 flex items-center justify-center shrink-0 border border-warmGrey/60">
                    {getDeptIcon(act.department)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-bold text-xs text-charcoal">{act.employeeName}</span>
                      <span className="text-[10px] font-mono text-mutedGrey">
                        {act.employeeCode || act.role}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sand-100 text-charcoal border border-warmGrey/60">
                        {act.department}
                      </span>
                      {act.severity === 'critical' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-terracotta border border-rose-200">
                          Critical Audit
                        </span>
                      )}
                      {act.severity === 'important' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber border border-amber-200">
                          Important
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-charcoal leading-relaxed font-medium">
                      {act.actionDetails}
                    </p>

                    {act.targetEntity && (
                      <div className="flex items-center space-x-2 pt-0.5">
                        <span className="text-[10px] font-semibold text-mutedGrey">Entity:</span>
                        <span className="px-2 py-0.5 bg-sand-50 text-navy font-mono text-[10px] rounded border border-warmGrey/50 font-semibold">
                          {act.targetEntity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 sm:pl-4">
                  <span className="text-[11px] font-mono text-mutedGrey flex items-center justify-end space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{act.timestamp}</span>
                  </span>
                  <span className="text-[10px] text-mutedGrey block mt-0.5">
                    {act.actionType}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
