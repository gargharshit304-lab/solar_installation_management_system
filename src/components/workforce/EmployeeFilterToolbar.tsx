import React, { useState, useEffect, useRef, useTransition } from 'react';
import { 
  Search, Building2, User, X, ChevronDown, Check, 
  Loader2, AlertCircle, RotateCcw, Filter, UserCheck, Shield
} from 'lucide-react';
import { Employee, Department } from '../../types';
import { useApp } from '../../context/AppContext';
import { employeeApi } from '../../services/api';

export interface EmployeeFilterToolbarProps {
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  selectedEmployee: Employee | null;
  onEmployeeSelect: (emp: Employee | null) => void;
  statusFilter?: 'all' | 'active' | 'on_leave' | 'inactive';
  onStatusFilterChange?: (status: 'all' | 'active' | 'on_leave' | 'inactive') => void;
  totalResultsCount?: number;
  totalEmployeesCount?: number;
  onClearAll?: () => void;
}

export const EmployeeFilterToolbar: React.FC<EmployeeFilterToolbarProps> = ({
  selectedDepartment,
  onDepartmentChange,
  selectedEmployee,
  onEmployeeSelect,
  statusFilter = 'all',
  onStatusFilterChange,
  totalResultsCount,
  totalEmployeesCount,
  onClearAll
}) => {
  const { currentUser, departments: contextDepts, employees: contextEmployees, session, showToast } = useApp();

  // --------------------------------------------------------------------------
  // 1. Department Filter State & Loading
  // --------------------------------------------------------------------------
  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string; code: string }[]>([]);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  // Helper to normalize department comparisons
  const normalizeDept = (dept: string) => dept.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

  const isSameDept = (deptA: string, deptB: string) => {
    if (!deptA || !deptB) return false;
    if (deptA.toLowerCase() === 'all' || deptB.toLowerCase() === 'all') return true;
    const a = normalizeDept(deptA);
    const b = normalizeDept(deptB);
    return a === b || a.includes(b) || b.includes(a);
  };

  // Load authorized departments from backend API with fallback
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function fetchDepts() {
      try {
        const res = await employeeApi.getDepartments(session?.token, controller.signal);
        if (active && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setDepartmentsList(res.data);
          return;
        }
      } catch {
        // Fallback to context departments filtered by user authorization
      }

      if (!active) return;

      // Authorization scoping in frontend fallback
      const isCompanyWide = 
        currentUser?.role === 'owner_admin' || 
        (currentUser?.role as string) === 'admin' ||
        currentUser?.roleTitle?.toLowerCase().includes('managing director') ||
        currentUser?.roleTitle?.toLowerCase().includes('owner');

      if (isCompanyWide) {
        setDepartmentsList(contextDepts.map(d => ({ id: d.id, name: d.name, code: d.code })));
      } else {
        const userDept = currentUser?.department || '';
        const scoped = contextDepts
          .filter(d => isSameDept(d.name, userDept))
          .map(d => ({ id: d.id, name: d.name, code: d.code }));

        if (scoped.length > 0) {
          setDepartmentsList(scoped);
        } else {
          setDepartmentsList([{ id: 'dept-scoped', name: userDept || 'Assigned Department', code: 'DEPT' }]);
        }
      }
    }

    fetchDepts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [currentUser, session?.token, contextDepts]);

  // Handle department selection & conflict checking
  const handleSelectDepartment = (deptName: string) => {
    setIsDeptDropdownOpen(false);

    // If an employee is already selected and does not belong to the newly selected department
    if (selectedEmployee && deptName !== 'all') {
      const belongs = isSameDept(selectedEmployee.department, deptName);
      if (!belongs) {
        onEmployeeSelect(null);
        showToast(
          `Cleared employee filter: "${selectedEmployee.fullName}" does not belong to "${deptName}"`,
          'info'
        );
      }
    }

    onDepartmentChange(deptName);
  };

  // --------------------------------------------------------------------------
  // 2. Employee Search Filter State & Debounced Suggestions
  // --------------------------------------------------------------------------
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestCounterRef = useRef<number>(0);

  // Debounced search with AbortController for canceling in-flight stale queries
  useEffect(() => {
    const trimmed = searchInput.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setIsSuggestionsOpen(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setIsSuggestionsOpen(true);

    // Cancel prior in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestCounterRef.current;

    const timer = setTimeout(async () => {
      try {
        const res = await employeeApi.searchEmployees(
          {
            search: trimmed,
            department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            limit: 10
          },
          session?.token,
          controller.signal
        );

        // Discard response if a newer request was dispatched
        if (currentRequestId !== requestCounterRef.current) return;

        if (res.success && Array.isArray(res.data)) {
          setSuggestions(res.data as any);
        } else {
          fallbackLocalSearch(trimmed);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (currentRequestId !== requestCounterRef.current) return;
        // Graceful fallback to client-side pool on network hiccup
        fallbackLocalSearch(trimmed);
      } finally {
        if (currentRequestId === requestCounterRef.current) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput, selectedDepartment, statusFilter, session?.token]);

  // Fallback local search
  const fallbackLocalSearch = (query: string) => {
    const q = query.toLowerCase();
    const results = contextEmployees.filter(emp => {
      const matchesText = 
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q);

      const matchesDept = 
        selectedDepartment === 'all' || 
        isSameDept(emp.department, selectedDepartment);

      const matchesStatus = 
        statusFilter === 'all' || 
        (emp.status || 'active').toLowerCase() === statusFilter.toLowerCase();

      return matchesText && matchesDept && matchesStatus;
    }).slice(0, 10);

    setSuggestions(results);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectEmployee = (emp: Employee) => {
    onEmployeeSelect(emp);
    setSearchInput('');
    setIsSuggestionsOpen(false);
    setSuggestions([]);
  };

  const handleClearSelectedEmployee = () => {
    onEmployeeSelect(null);
    setSearchInput('');
  };

  const handleClearAll = () => {
    onDepartmentChange('all');
    onEmployeeSelect(null);
    setSearchInput('');
    if (onStatusFilterChange) onStatusFilterChange('all');
    if (onClearAll) onClearAll();
  };

  // Selected department label
  const selectedDeptLabel = selectedDepartment === 'all'
    ? 'All Departments'
    : departmentsList.find(d => isSameDept(d.name, selectedDepartment))?.name || selectedDepartment;

  const hasActiveFilters = 
    selectedDepartment !== 'all' || 
    selectedEmployee !== null || 
    statusFilter !== 'all' || 
    searchInput.trim().length > 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] space-y-3">
      {/* Horizontal Toolbar on Desktop, Stacks on Mobile */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        
        {/* CONTROL 1: Dynamic Department Dropdown */}
        <div className="relative min-w-[240px] flex-shrink-0" ref={deptDropdownRef}>
          <label className="block text-[11px] font-semibold text-charcoal/70 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-navy" />
            <span>Department Filter</span>
          </label>
          
          <button
            type="button"
            onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-charcoal bg-sand-50/70 border border-warmGrey rounded-xl hover:bg-sand-100/60 focus:outline-none focus:ring-1 focus:ring-navy transition-all shadow-2xs"
          >
            <div className="flex items-center space-x-2 truncate">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedDepartment === 'all' ? 'bg-mutedGrey' : 'bg-emerald-600'}`} />
              <span className="truncate">{selectedDeptLabel}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-mutedGrey transition-transform flex-shrink-0 ml-1.5 ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Department Selection Menu */}
          {isDeptDropdownOpen && (
            <div className="absolute z-40 mt-1 w-full sm:w-72 bg-white border border-warmGrey rounded-xl shadow-lg py-1.5 max-h-64 overflow-y-auto">
              <button
                type="button"
                onClick={() => handleSelectDepartment('all')}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                  selectedDepartment === 'all'
                    ? 'bg-navy/5 text-navy font-bold'
                    : 'text-charcoal hover:bg-sand-100/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-mutedGrey" />
                  <span>All Departments</span>
                </div>
                {selectedDepartment === 'all' && <Check className="w-3.5 h-3.5 text-navy" />}
              </button>

              <div className="h-px bg-warmGrey/40 my-1" />

              {departmentsList.map(dept => {
                const isSelected = isSameDept(dept.name, selectedDepartment);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleSelectDepartment(dept.name)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-navy/5 text-navy font-bold'
                        : 'text-charcoal hover:bg-sand-100/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <span className="px-1.5 py-0.5 bg-sand-200/60 text-navy font-mono text-[10px] rounded font-bold">
                        {dept.code}
                      </span>
                      <span className="truncate">{dept.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-navy flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CONTROL 2: Searchable Employee Selector */}
        <div className="relative flex-1" ref={searchBoxRef}>
          <label className="block text-[11px] font-semibold text-charcoal/70 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-navy" />
            <span>Searchable Employee Selector</span>
          </label>

          {/* If an employee is already selected, show a compact chip */}
          {selectedEmployee ? (
            <div className="flex items-center justify-between px-3 py-1.5 bg-sand-100/60 border border-warmGrey rounded-xl shadow-2xs">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-6 h-6 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {selectedEmployee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="truncate text-xs">
                  <span className="font-bold text-charcoal">{selectedEmployee.fullName}</span>
                  <span className="text-mutedGrey ml-1.5 font-mono text-[11px]">({selectedEmployee.employeeCode})</span>
                  <span className="text-mutedGrey ml-2 hidden sm:inline text-[11px]">· {selectedEmployee.designation}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearSelectedEmployee}
                title="Clear selected employee"
                className="p-1 text-mutedGrey hover:text-terracotta rounded-lg hover:bg-sand-200/50 transition-colors ml-2 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search employee name, ID or email..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onFocus={() => {
                  if (searchInput.trim().length >= 2) setIsSuggestionsOpen(true);
                }}
                className="w-full pl-9 pr-9 py-2 text-xs border border-warmGrey rounded-xl bg-sand-50/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy transition-all shadow-2xs"
              />
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-navy animate-spin absolute right-3 top-2.5" />
              ) : searchInput ? (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="p-0.5 text-mutedGrey hover:text-charcoal absolute right-3 top-2.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          )}

          {/* Autocomplete Suggestions Dropdown */}
          {isSuggestionsOpen && !selectedEmployee && (
            <div className="absolute z-40 mt-1 w-full bg-white border border-warmGrey rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 flex items-center justify-center space-x-2 text-xs text-mutedGrey">
                  <Loader2 className="w-4 h-4 text-navy animate-spin" />
                  <span>Searching personnel database...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-4 text-center">
                  <AlertCircle className="w-5 h-5 text-amber mx-auto mb-1 opacity-70" />
                  <p className="text-xs font-semibold text-charcoal">No employees found</p>
                  <p className="text-[11px] text-mutedGrey mt-0.5">
                    No active staff matching "{searchInput}" in {selectedDepartment === 'all' ? 'authorized departments' : selectedDepartment}.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-warmGrey/30">
                  <div className="px-3 py-1.5 bg-sand-50/80 text-[10px] font-bold text-mutedGrey uppercase tracking-wider">
                    Matching Personnel ({suggestions.length})
                  </div>
                  {suggestions.map(emp => {
                    const initials = emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2);
                    const isAvailable = emp.isAvailable !== false && emp.status !== 'inactive';

                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelectEmployee(emp)}
                        className="w-full flex items-center justify-between p-2.5 text-left hover:bg-sand-100/60 transition-colors group"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <div className="w-7 h-7 rounded-full bg-navy text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:bg-navy-light transition-colors">
                            {initials}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-charcoal truncate">{emp.fullName}</span>
                              <span className="px-1.5 py-0.2 bg-sand-200/60 text-navy font-mono text-[9px] rounded font-bold">
                                {emp.employeeCode}
                              </span>
                            </div>
                            <div className="text-[11px] text-mutedGrey truncate flex items-center space-x-2 mt-0.5">
                              <span className="truncate">{emp.designation}</span>
                              <span>•</span>
                              <span className="text-navy/80 font-medium truncate">{emp.department}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            emp.status === 'on_leave'
                              ? 'bg-amber/10 text-amber border-amber/30'
                              : emp.status === 'inactive'
                              ? 'bg-terracotta/10 text-terracotta border-terracotta/30'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {emp.status === 'on_leave' ? 'On Leave' : emp.status === 'inactive' ? 'Inactive' : 'Active'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* STATUS FILTER PILL SELECTOR */}
        {onStatusFilterChange && (
          <div className="min-w-[170px] flex-shrink-0">
            <label className="block text-[11px] font-semibold text-charcoal/70 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-navy" />
              <span>Duty Status</span>
            </label>
            <select
              value={statusFilter}
              onChange={e => onStatusFilterChange(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-xl bg-sand-50/70 text-charcoal focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy transition-all shadow-2xs"
            >
              <option value="all">All Employment Statuses</option>
              <option value="active">Active On Duty</option>
              <option value="on_leave">On Approved Leave</option>
              <option value="inactive">Inactive / Suspended</option>
            </select>
          </div>
        )}

      </div>

      {/* ACTIVE FILTER CHIPS & CLEAR ACTIONS */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-warmGrey/40 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-mutedGrey mr-1">Active Filters:</span>
          
          {selectedDepartment !== 'all' ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-navy/10 text-navy text-[11px] font-semibold rounded-full border border-navy/20">
              <Building2 className="w-3 h-3" />
              <span>Dept: {selectedDeptLabel}</span>
              <button
                type="button"
                onClick={() => onDepartmentChange('all')}
                className="hover:text-terracotta ml-0.5"
                title="Clear department filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <span className="text-[11px] text-mutedGrey italic">All Departments</span>
          )}

          {selectedEmployee && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-full border border-emerald-300">
              <UserCheck className="w-3 h-3 text-emerald-700" />
              <span>Emp: {selectedEmployee.fullName}</span>
              <button
                type="button"
                onClick={handleClearSelectedEmployee}
                className="hover:text-terracotta ml-0.5"
                title="Clear employee filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {statusFilter !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-amber/10 text-amber text-[11px] font-semibold rounded-full border border-amber/30">
              <span>Status: {statusFilter.replace('_', ' ').toUpperCase()}</span>
              {onStatusFilterChange && (
                <button
                  type="button"
                  onClick={() => onStatusFilterChange('all')}
                  className="hover:text-terracotta ml-0.5"
                  title="Clear status filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold text-mutedGrey hover:text-terracotta hover:bg-sand-100 rounded-lg transition-colors ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Results Counter */}
        {totalResultsCount !== undefined && totalEmployeesCount !== undefined && (
          <div className="text-[11px] text-mutedGrey font-medium mt-1 sm:mt-0">
            Showing <strong className="text-charcoal font-bold">{totalResultsCount}</strong> of{' '}
            <strong className="text-charcoal font-bold">{totalEmployeesCount}</strong> personnel
          </div>
        )}
      </div>
    </div>
  );
};
