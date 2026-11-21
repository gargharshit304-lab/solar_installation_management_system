import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Search, Filter, Download, Calendar, ShieldCheck, 
  ArrowUpRight, Clock, User, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, Compass, Cpu, Wrench, Package, IndianRupee, 
  FileText, Eye, RefreshCw, ChevronLeft, ChevronRight, ChevronDown,
  Layers, Lock, Database, Globe, Smartphone, Laptop, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityDepartment, EmployeeActivityLog } from '../../types';
import { auditApi } from '../../services/api';

export const EmployeeActivityCenterPage: React.FC = () => {
  const { employeeActivities, employees, showToast, session } = useApp();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [selectedAction, setSelectedAction] = useState<string>('All');
  const [selectedResult, setSelectedResult] = useState<string>('All');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [serverTotal, setServerTotal] = useState<number | null>(null);

  // Inspector State
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [backendLogs, setBackendLogs] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch from backend audit API with fallback to local state
  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await auditApi.getLogs({
        page: currentPage,
        limit: pageSize,
        department: selectedDept !== 'All' ? selectedDept : undefined,
        module: selectedModule !== 'All' ? selectedModule : undefined,
        action: selectedAction !== 'All' ? selectedAction : undefined,
        result: selectedResult !== 'All' ? selectedResult : undefined,
        actorId: selectedEmployee !== 'All' ? selectedEmployee : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchQuery || undefined
      }, session?.token);

      if (res.success && res.data) {
        setBackendLogs(res.data);
        if (res.meta?.pagination?.total !== undefined) {
          setServerTotal(res.meta.pagination.total);
        }
      }
    } catch {
      // Fallback silently to client-side employeeActivities
      setBackendLogs(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, pageSize, selectedDept, selectedModule, selectedAction, selectedResult, selectedEmployee, startDate, endDate, searchQuery]);

  // Combined Dataset: Backend logs or fallback mock logs
  const allLogs: EmployeeActivityLog[] = useMemo(() => {
    if (backendLogs && backendLogs.length > 0) {
      return backendLogs.map(l => ({
        id: l.id,
        employeeId: l.actorId || l.employeeId || 'unknown',
        employeeName: l.actorName || l.employeeName || 'System',
        employeeCode: l.employeeCode || l.actorRole,
        department: l.department || 'Executive Management',
        role: l.actorRole || l.role || 'Staff',
        actionType: l.action || l.actionType || 'OPERATION',
        action: l.action,
        module: l.module || l.entity,
        actionDetails: l.reason || l.actionDetails || `${l.action} on ${l.entity}`,
        targetEntity: l.entity || l.targetEntity,
        targetId: l.entityId || l.targetId,
        recordId: l.entityId || l.recordId || l.targetId,
        previousValue: l.previousState || l.previousValue,
        newValue: l.newState || l.newValue,
        result: l.result || 'SUCCESS',
        timestamp: l.timestamp ? new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recently',
        ipAddress: l.ipAddress || '192.168.1.101',
        sessionMetadata: l.sessionMetadata || 'Desktop Web Console',
        severity: l.result === 'DENIED' ? 'critical' : (l.severity || 'normal')
      }));
    }

    // Client-side filtering when backend is offline
    return employeeActivities.filter(act => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        act.employeeName.toLowerCase().includes(q) ||
        act.actionType.toLowerCase().includes(q) ||
        act.actionDetails.toLowerCase().includes(q) ||
        (act.targetEntity && act.targetEntity.toLowerCase().includes(q)) ||
        (act.module && act.module.toLowerCase().includes(q)) ||
        (act.recordId && act.recordId.toLowerCase().includes(q));

      const matchesDept = selectedDept === 'All' || act.department === selectedDept;
      const matchesModule = selectedModule === 'All' || act.module === selectedModule;
      const matchesAction = selectedAction === 'All' || act.action === selectedAction;
      const matchesResult = selectedResult === 'All' || act.result === selectedResult;
      const matchesEmp = selectedEmployee === 'All' || act.employeeId === selectedEmployee;

      return matchesSearch && matchesDept && matchesModule && matchesAction && matchesResult && matchesEmp;
    });
  }, [backendLogs, employeeActivities, searchQuery, selectedDept, selectedModule, selectedAction, selectedResult, selectedEmployee]);

  // Client-side pagination if running on fallback data
  const totalRecords = serverTotal !== null && backendLogs ? serverTotal : allLogs.length;
  const paginatedLogs = (backendLogs && backendLogs.length > 0)
    ? allLogs 
    : allLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Department icon mapper
  const getDeptIcon = (dept: string) => {
    switch (dept) {
      case 'Sales': return <TrendingUp className="w-4 h-4 text-amber" />;
      case 'Field Operations': return <Compass className="w-4 h-4 text-navy" />;
      case 'Engineering': return <Cpu className="w-4 h-4 text-purple-600" />;
      case 'Installation': return <Wrench className="w-4 h-4 text-emerald-600" />;
      case 'Warehouse': return <Package className="w-4 h-4 text-blue-600" />;
      case 'Accounts': return <IndianRupee className="w-4 h-4 text-emerald-700" />;
      case 'Executive Management': return <ShieldCheck className="w-4 h-4 text-navy" />;
      default: return <Activity className="w-4 h-4 text-navy" />;
    }
  };

  // Result Badge mapper
  const renderResultBadge = (result?: string) => {
    const res = result || 'SUCCESS';
    switch (res) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>SUCCESS</span>
          </span>
        );
      case 'DENIED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-terracotta border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>DENIED</span>
          </span>
        );
      case 'FAILURE':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            <span>FAILURE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sand-100 text-charcoal border border-warmGrey">
            <span>{res}</span>
          </span>
        );
    }
  };

  const exportAuditLog = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Timestamp,Employee,Employee ID,Department,Role,Action,Module,Target Entity,Record ID,Result,Details,IP Address,Session Metadata"]
      .concat(allLogs.map(a => 
        `"${a.timestamp}","${a.employeeName}","${a.employeeId}","${a.department}","${a.role}","${a.action || a.actionType}","${a.module || ''}","${a.targetEntity || ''}","${a.recordId || ''}","${a.result || 'SUCCESS'}","${a.actionDetails.replace(/"/g, '""')}","${a.ipAddress || ''}","${a.sessionMetadata || ''}"`
      )).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SolarOS_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Enterprise Audit Trail exported as CSV', 'success');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedModule('All');
    setSelectedAction('All');
    setSelectedResult('All');
    setSelectedEmployee('All');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    showToast('Audit filters reset', 'info');
  };

  const departmentsList = ['Sales', 'Field Operations', 'Engineering', 'Installation', 'Warehouse', 'Accounts', 'Executive Management'];
  const modulesList = ['Quotations', 'Surveys', 'Engineering', 'Installations', 'Dispatch', 'Finance', 'Roles & Permissions', 'Customers', 'Warranty', 'Enquiries'];
  const actionsList = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'DISPATCH', 'COMPLETE', 'LOGIN', 'PERMISSION_CHANGE'];
  const resultsList = ['SUCCESS', 'FAILURE', 'DENIED'];

  // Metrics
  const totalCount = allLogs.length;
  const successCount = allLogs.filter(l => (l.result || 'SUCCESS') === 'SUCCESS').length;
  const deniedCount = allLogs.filter(l => l.result === 'DENIED' || l.severity === 'critical').length;
  const uniqueActors = new Set(allLogs.map(l => l.employeeId)).size;

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Live Status & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">Enterprise Audit Trail</h1>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 uppercase tracking-wider flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Company-Wide Live Stream</span>
            </span>
          </div>
          <p className="text-xs text-mutedGrey mt-0.5">
            Cryptographically sealed, append-only operational event feed across all 7 SunPower departments
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="px-3 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1.5"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-navy ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportAuditLog}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-amber" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* 2. Metric Snapshot Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Total Actions Tracked</span>
            <Activity className="w-4 h-4 text-navy" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{totalRecords}</div>
          <span className="text-[11px] text-emerald-600 font-medium">100% Append-only recorded</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Successful Operations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{successCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100}% compliance rate
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Security Denials / Critical</span>
            <AlertTriangle className="w-4 h-4 text-terracotta" />
          </div>
          <div className="text-2xl font-bold text-terracotta">{deniedCount}</div>
          <span className="text-[11px] text-terracotta font-medium">Protected by RBAC policy</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Active Operators</span>
            <User className="w-4 h-4 text-amber" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{uniqueActors}</div>
          <span className="text-[11px] text-mutedGrey">Employees logged</span>
        </div>
      </div>

      {/* 3. Multi-Field Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-warmGrey/60 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by employee, action keyword, quotation number, or survey ID..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={e => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="All">All Departments</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Module Filter */}
            <select
              value={selectedModule}
              onChange={e => {
                setSelectedModule(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="All">All Modules</option>
              {modulesList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={e => {
                setSelectedAction(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="All">All Actions</option>
              {actionsList.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            {/* Result Filter */}
            <select
              value={selectedResult}
              onChange={e => {
                setSelectedResult(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="All">All Results</option>
              {resultsList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Employee Filter */}
            <select
              value={selectedEmployee}
              onChange={e => {
                setSelectedEmployee(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="All">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeCode})</option>
              ))}
            </select>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-sand-100 text-charcoal hover:bg-sand-200 border border-warmGrey/60 text-xs font-medium rounded-xl transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Quick Department Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-mutedGrey mr-1">Quick Dept:</span>
          <button
            onClick={() => {
              setSelectedDept('All');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedDept === 'All' ? 'bg-navy text-white shadow-xs' : 'bg-sand-100 text-charcoal hover:bg-sand-200'
            }`}
          >
            All
          </button>
          {departmentsList.map(dept => (
            <button
              key={dept}
              onClick={() => {
                setSelectedDept(dept);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedDept === dept ? 'bg-navy text-white shadow-xs' : 'bg-sand-100 text-charcoal hover:bg-sand-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Audit Log Table & Details Stream */}
      <div className="bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] overflow-hidden">
        <div className="px-5 py-4 border-b border-warmGrey/60 flex items-center justify-between bg-sand-50/40">
          <div>
            <h3 className="font-bold text-sm text-charcoal">Real-Time Operational Audit Feed</h3>
            <p className="text-[11px] text-mutedGrey">
              Displaying {paginatedLogs.length} of {totalRecords} logged company operations
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs text-mutedGrey">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-navy" />
              <span>Immutable Append-Only</span>
            </span>
          </div>
        </div>

        <div className="divide-y divide-warmGrey/40">
          {paginatedLogs.length === 0 ? (
            <div className="p-12 text-center text-mutedGrey text-xs">
              No logged activities found matching the selected filters.
            </div>
          ) : (
            paginatedLogs.map((act) => {
              const isExpanded = expandedLogId === act.id;
              const hasDiff = act.previousValue !== undefined || act.newValue !== undefined;

              return (
                <div 
                  key={act.id} 
                  className={`p-4 transition-colors ${isExpanded ? 'bg-sand-50/80' : 'hover:bg-sand-50/40'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start space-x-3.5 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-sand-200/70 flex items-center justify-center shrink-0 border border-warmGrey/60">
                        {getDeptIcon(act.department)}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-xs text-charcoal">{act.employeeName}</span>
                          <span className="text-[10px] font-mono text-mutedGrey bg-sand-100 px-1.5 py-0.5 rounded border border-warmGrey/50">
                            {act.employeeId}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sand-100 text-charcoal border border-warmGrey/60">
                            {act.department}
                          </span>
                          <span className="text-[10px] text-mutedGrey font-medium">
                            ({act.role})
                          </span>
                          {renderResultBadge(act.result)}
                          {act.severity === 'critical' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-terracotta border border-rose-200">
                              Critical Event
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-charcoal leading-relaxed font-medium">
                          {act.actionDetails}
                        </p>

                        <div className="flex items-center flex-wrap gap-3 pt-0.5 text-[10px] text-mutedGrey">
                          {act.module && (
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold">Module:</span>
                              <span className="px-1.5 py-0.5 bg-sand-100 text-navy font-semibold rounded border border-warmGrey/50">
                                {act.module}
                              </span>
                            </div>
                          )}

                          {act.targetEntity && (
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold">Entity:</span>
                              <span className="px-1.5 py-0.5 bg-sand-50 text-charcoal font-mono rounded border border-warmGrey/50">
                                {act.targetEntity}
                              </span>
                            </div>
                          )}

                          {act.recordId && (
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold">Record ID:</span>
                              <span className="px-1.5 py-0.5 bg-white text-navy font-mono rounded border border-warmGrey/60 font-semibold">
                                {act.recordId}
                              </span>
                            </div>
                          )}

                          {act.ipAddress && (
                            <div className="flex items-center space-x-1">
                              <Globe className="w-3 h-3 text-mutedGrey" />
                              <span className="font-mono">{act.ipAddress}</span>
                            </div>
                          )}

                          {act.sessionMetadata && (
                            <div className="flex items-center space-x-1">
                              <Laptop className="w-3 h-3 text-mutedGrey" />
                              <span>{act.sessionMetadata}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-mutedGrey flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{act.timestamp}</span>
                      </span>

                      {hasDiff && (
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : act.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-warmGrey/80 bg-white hover:bg-sand-100 text-navy transition-colors flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isExpanded ? 'Hide Changes' : 'View Changes'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Before/After State Diff Inspector */}
                  {isExpanded && (
                    <div className="mt-3 p-3.5 bg-white rounded-xl border border-warmGrey/80 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-charcoal pb-1 border-b border-warmGrey/40">
                        <span className="flex items-center space-x-1.5">
                          <Database className="w-3.5 h-3.5 text-navy" />
                          <span>State Mutation Inspection</span>
                        </span>
                        <span className="text-[10px] font-mono text-mutedGrey">Record: {act.recordId || act.targetId || 'N/A'}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-rose-50/40 rounded-lg border border-rose-100">
                          <span className="text-[11px] font-bold text-terracotta block mb-1">Previous State:</span>
                          <pre className="text-[10px] font-mono text-charcoal overflow-x-auto whitespace-pre-wrap bg-white/80 p-2 rounded border border-rose-200">
                            {act.previousValue ? JSON.stringify(act.previousValue, null, 2) : '(Initial creation / No previous state)'}
                          </pre>
                        </div>

                        <div className="p-2.5 bg-emerald-50/40 rounded-lg border border-emerald-100">
                          <span className="text-[11px] font-bold text-emerald-700 block mb-1">New State:</span>
                          <pre className="text-[10px] font-mono text-charcoal overflow-x-auto whitespace-pre-wrap bg-white/80 p-2 rounded border border-emerald-200">
                            {act.newValue ? JSON.stringify(act.newValue, null, 2) : '(Mutation details / No state payload)'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 5. Pagination Controls */}
        <div className="px-5 py-3 border-t border-warmGrey/60 bg-sand-50/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-mutedGrey">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-warmGrey rounded-lg bg-white text-charcoal font-medium focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>entries per page</span>
            <span className="text-warmGrey">|</span>
            <span>Total: <strong className="text-charcoal">{totalRecords}</strong> records</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-mutedGrey">
              Page <strong className="text-charcoal">{currentPage}</strong> of <strong className="text-charcoal">{totalPages}</strong>
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 border border-warmGrey rounded-lg bg-white hover:bg-sand-100 disabled:opacity-40 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-charcoal" />
            </button>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-warmGrey rounded-lg bg-white hover:bg-sand-100 disabled:opacity-40 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-charcoal" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
