import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, ShieldCheck, Check, X, Plus, Edit2, 
  Trash2, AlertCircle, Info, Lock, Save, Loader2, CheckCircle2,
  Search, Building2, User, ChevronDown, RotateCcw, Sparkles,
  Key, UserCheck, ShieldAlert, Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoleDefinition, PermissionAction, Employee, CapabilityPermission, OperationalDelegation } from '../../types';
import { employeeApi, rbacApi } from '../../services/api';

export const RolesPermissionsPage: React.FC = () => {
  const { 
    currentUser,
    rolesPermissions, 
    updateRolePermissions, 
    createCustomRole, 
    departments: contextDepts,
    employees: contextEmployees,
    delegations,
    createDelegation,
    revokeDelegation,
    session,
    showToast 
  } = useApp();

  // --------------------------------------------------------------------------
  // Core Page State
  // --------------------------------------------------------------------------
  const [selectedRoleId, setSelectedRoleId] = useState<string>(rolesPermissions[0]?.id || 'role-1');
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleBaseId, setNewRoleBaseId] = useState(rolesPermissions[0]?.id || 'role-1');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');

  // --------------------------------------------------------------------------
  // 1. Department Filter State
  // --------------------------------------------------------------------------
  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string; code: string; employeeCount?: number }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  // --------------------------------------------------------------------------
  // 2. Employee Search Filter State
  // --------------------------------------------------------------------------
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestCounterRef = useRef<number>(0);

  // --------------------------------------------------------------------------
  // 3. Employee Override Modal & Action Prompt State
  // --------------------------------------------------------------------------
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideModule, setOverrideModule] = useState('customers');
  const [overrideAction, setOverrideAction] = useState<PermissionAction>('view');
  const [overrideJustification, setOverrideJustification] = useState('');
  const [overrideExpiryDays, setOverrideExpiryDays] = useState(30);

  // Prompt when toggling a cell in employee view
  const [cellActionPrompt, setCellActionPrompt] = useState<{
    moduleKey: string;
    actionKey: PermissionAction;
    moduleLabel: string;
  } | null>(null);

  // --------------------------------------------------------------------------
  // Department Helper: Normalization & Matching
  // --------------------------------------------------------------------------
  const normalizeDept = (dept: string) => dept.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

  const isSameDept = (deptA: string, deptB: string) => {
    if (!deptA || !deptB) return false;
    if (deptA.toLowerCase() === 'all' || deptB.toLowerCase() === 'all') return true;
    const a = normalizeDept(deptA);
    const b = normalizeDept(deptB);
    return a === b || a.includes(b) || b.includes(a);
  };

  // Load authorized departments from backend API with fallback to context
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function fetchDepartments() {
      try {
        const res = await employeeApi.getDepartments(session?.token, controller.signal);
        if (active && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setDepartmentsList(res.data);
          return;
        }
      } catch {
        // Fallback to context departments
      }

      if (!active) return;

      const isCompanyWide = 
        currentUser?.role === 'owner_admin' || 
        (currentUser?.role as string) === 'admin' ||
        currentUser?.roleTitle?.toLowerCase().includes('managing director') ||
        currentUser?.roleTitle?.toLowerCase().includes('owner');

      if (isCompanyWide) {
        setDepartmentsList(contextDepts.map(d => ({ 
          id: d.id, 
          name: d.name, 
          code: d.code,
          employeeCount: d.employeeCount 
        })));
      } else {
        const userDept = currentUser?.department || '';
        const scoped = contextDepts
          .filter(d => isSameDept(d.name, userDept))
          .map(d => ({ id: d.id, name: d.name, code: d.code, employeeCount: d.employeeCount }));

        if (scoped.length > 0) {
          setDepartmentsList(scoped);
        } else {
          setDepartmentsList([{ id: 'dept-scoped', name: userDept || 'Assigned Department', code: 'DEPT' }]);
        }
      }
    }

    fetchDepartments();

    return () => {
      active = false;
      controller.abort();
    };
  }, [currentUser, session?.token, contextDepts]);

  // Close dropdowns on outside click
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

  // --------------------------------------------------------------------------
  // Department Change Handler & Conflict Resolution
  // --------------------------------------------------------------------------
  const handleSelectDepartment = (deptName: string) => {
    setIsDeptDropdownOpen(false);

    // If an employee is already selected and does not belong to the newly selected department:
    if (selectedEmployee && deptName !== 'all') {
      const belongs = isSameDept(selectedEmployee.department, deptName);
      if (!belongs) {
        setSelectedEmployee(null);
        showToast(
          `Cleared employee filter: "${selectedEmployee.fullName}" does not belong to "${deptName}"`,
          'info'
        );
      }
    }

    setSelectedDepartment(deptName);
  };

  // --------------------------------------------------------------------------
  // Debounced Employee Search Handler
  // --------------------------------------------------------------------------
  useEffect(() => {
    const trimmed = searchInput.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setIsSuggestionsOpen(false);
      return;
    }

    setIsSearching(true);
    setIsSuggestionsOpen(true);

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
            limit: 10
          },
          session?.token,
          controller.signal
        );

        if (currentRequestId !== requestCounterRef.current) return;

        if (res.success && Array.isArray(res.data)) {
          setSuggestions(res.data as any);
        } else {
          fallbackLocalSearch(trimmed);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (currentRequestId !== requestCounterRef.current) return;
        fallbackLocalSearch(trimmed);
      } finally {
        if (currentRequestId === requestCounterRef.current) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, selectedDepartment, session?.token]);

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

      return matchesText && matchesDept;
    }).slice(0, 10);

    setSuggestions(results);
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setSearchInput('');
    setIsSuggestionsOpen(false);
    setSuggestions([]);

    // Automatically switch active role tab to the employee's assigned role
    const matchedRole = rolesPermissions.find(r => r.roleKey === emp.role || r.id === emp.role);
    if (matchedRole) {
      setSelectedRoleId(matchedRole.id);
    }
    showToast(`Inspecting effective permissions for ${emp.fullName}`, 'info');
  };

  const handleClearSelectedEmployee = () => {
    setSelectedEmployee(null);
    setSearchInput('');
    showToast('Returned to role-level permission matrix', 'info');
  };

  const handleClearAllFilters = () => {
    setSelectedDepartment('all');
    setSelectedEmployee(null);
    setSearchInput('');
    setIsDeptDropdownOpen(false);
    setIsSuggestionsOpen(false);
    showToast('Filters cleared', 'info');
  };

  // --------------------------------------------------------------------------
  // Role & Employee Effective Permission Resolution
  // --------------------------------------------------------------------------
  const activeRole = rolesPermissions.find(r => r.id === selectedRoleId) || rolesPermissions[0];

  // Employee's active delegations/overrides
  const employeeActiveDelegations = selectedEmployee 
    ? delegations.filter(d => d.active && (d.employeeId === selectedEmployee.id || d.employeeId === (selectedEmployee as any).employeeCode))
    : [];

  const modulesList: { key: string; label: string; category: string }[] = [
    { key: 'overview', label: 'Company Overview & KPIs', category: 'Executive' },
    { key: 'customers', label: 'Customers & CRM Directory', category: 'Sales' },
    { key: 'enquiries', label: 'Lead Inquiries & Pre-screening', category: 'Sales' },
    { key: 'follow_ups', label: 'Sales Follow-up Schedules', category: 'Sales' },
    { key: 'surveys', label: 'Site Surveys & Measurements', category: 'Field Operations' },
    { key: 'survey_review', label: 'Survey Review & Approval', category: 'Engineering' },
    { key: 'quotations', label: 'Solar Quotations & Pricing', category: 'Sales' },
    { key: 'orders', label: 'Customer Orders & Payments', category: 'Finance' },
    { key: 'subsidies', label: 'PM Surya Ghar Subsidies', category: 'Finance' },
    { key: 'inventory', label: 'Warehouse Stock & Panels', category: 'Supply Chain' },
    { key: 'dispatch', label: 'Material Dispatch & Logistics', category: 'Supply Chain' },
    { key: 'installations', label: 'Rooftop Installations & Sync', category: 'Operations' },
    { key: 'warranty', label: 'Hardware Warranty Traceability', category: 'After-sales' },
    { key: 'service', label: 'Customer Service & Complaints', category: 'After-sales' },
    { key: 'workforce', label: 'Workforce & Technicians', category: 'Human Resources' },
    { key: 'departments', label: 'Departments & Teams', category: 'Executive' },
    { key: 'roles_permissions', label: 'Roles & Security Matrix', category: 'Executive' },
    { key: 'approvals', label: 'Company Authorization Inbox', category: 'Executive' },
    { key: 'activity_center', label: 'Employee Activity & Audit', category: 'Executive' },
    { key: 'finance', label: 'P&L, Margins & Financials', category: 'Finance' },
    { key: 'reports', label: 'Business Analytics & Exports', category: 'Finance' },
    { key: 'ai_agents', label: 'Retell AI Voice Agents', category: 'Automation' },
    { key: 'settings', label: 'System Configuration', category: 'Administration' }
  ];

  const actionsList: { key: PermissionAction; label: string }[] = [
    { key: 'view', label: 'View' },
    { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
    { key: 'assign', label: 'Assign' },
    { key: 'approve', label: 'Approve' },
    { key: 'export', label: 'Export' },
    { key: 'manage', label: 'Manage' },
  ];

  // Helper to determine if an action is granted by Role vs Override for selected employee
  const getPermissionStatus = (moduleKey: string, actionKey: PermissionAction) => {
    const isRoleGranted = activeRole?.permissions[moduleKey]?.includes(actionKey) || false;
    
    const specificPerm = `${moduleKey}.${actionKey}`;
    const isOverrideGranted = employeeActiveDelegations.some(d => 
      d.grantedPermission === specificPerm || d.grantedPermission === (actionKey as any)
    );

    return {
      isRoleGranted,
      isOverrideGranted,
      isEffectiveGranted: isRoleGranted || isOverrideGranted
    };
  };

  // --------------------------------------------------------------------------
  // Permission Mutation Handlers
  // --------------------------------------------------------------------------
  const executeRoleToggle = async (moduleKey: string, action: PermissionAction) => {
    if (!activeRole) return;
    if (activeRole.roleKey === 'owner_admin') {
      showToast('Owner & Managing Director role permissions cannot be altered', 'warning');
      return;
    }

    const currentModuleActions = activeRole.permissions[moduleKey] || [];
    const exists = currentModuleActions.includes(action);

    const updatedModuleActions = exists 
      ? currentModuleActions.filter(a => a !== action)
      : [...currentModuleActions, action];

    const updatedPermissions = {
      ...activeRole.permissions,
      [moduleKey]: updatedModuleActions
    };

    setSaveStatus('saving');
    try {
      await updateRolePermissions(activeRole.id, updatedPermissions);
      setSaveStatus('saved');
      showToast(`Updated '${action}' for role '${activeRole.name}'`, 'success');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleCellClick = (moduleKey: string, actionKey: PermissionAction, moduleLabel: string) => {
    // If an employee is selected, prevent accidental whole-role modification without confirmation
    if (selectedEmployee) {
      setCellActionPrompt({ moduleKey, actionKey, moduleLabel });
      return;
    }

    // Normal role-level toggle
    executeRoleToggle(moduleKey, actionKey);
  };

  // Grant individual delegation/override to the selected employee
  const handleGrantOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const grantedPermission = `${overrideModule}.${overrideAction}` as CapabilityPermission;
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + overrideExpiryDays);

    try {
      createDelegation({
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.fullName,
        employeeRole: selectedEmployee.role as any,
        grantedPermission,
        departmentScope: selectedEmployee.department,
        authorizedByEmployeeId: currentUser.id,
        authorizedByName: currentUser.name,
        justification: overrideJustification.trim() || `Individual permission override granted to ${selectedEmployee.fullName} by ${currentUser.name}`,
        startDate: new Date().toISOString(),
        expiresDate: expiresDate.toISOString()
      });

      // Synchronize with backend API
      try {
        await rbacApi.createDelegation({
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.fullName,
          employeeRole: selectedEmployee.role,
          grantedPermission,
          departmentScope: selectedEmployee.department,
          justification: overrideJustification.trim() || `Override granted by ${currentUser.name}`,
          effectiveFrom: new Date().toISOString(),
          effectiveTo: expiresDate.toISOString()
        }, session?.token);
      } catch (err: any) {
        console.warn('Backend delegation sync offline, active locally:', err.message);
      }

      showToast(`Granted individual override '${grantedPermission}' to ${selectedEmployee.fullName}`, 'success');
      setIsOverrideModalOpen(false);
      setOverrideJustification('');
    } catch (err: any) {
      showToast(err.message || 'Failed to grant delegation', 'error');
    }
  };

  const handleRevokeOverride = async (delegationId: string, permName: string) => {
    try {
      revokeDelegation(delegationId);
      try {
        await rbacApi.revokeDelegation(delegationId, session?.token);
      } catch (err: any) {
        console.warn('Backend delegation revoke offline, updated locally:', err.message);
      }
      showToast(`Revoked individual override '${permName}' from ${selectedEmployee?.fullName}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke delegation', 'error');
    }
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      showToast('Role name is required', 'error');
      return;
    }

    const baseRole = rolesPermissions.find(r => r.id === newRoleBaseId);
    const initialPerms = baseRole ? { ...baseRole.permissions } : {};

    createCustomRole({
      name: newRoleName,
      roleKey: `custom_${newRoleName.toLowerCase().replace(/\s+/g, '_')}`,
      description: newRoleDesc || 'Custom configured company security role',
      userCount: 0,
      permissions: initialPerms
    });

    setNewRoleName('');
    setNewRoleDesc('');
    setIsCreateRoleModalOpen(false);
    showToast(`Custom role '${newRoleName}' created`, 'success');
  };

  // Calculate Effective Stats for Selected Employee
  const totalInheritedCount = activeRole 
    ? Object.values(activeRole.permissions).reduce((acc, actions) => acc + actions.length, 0)
    : 0;
  const totalOverridesCount = employeeActiveDelegations.length;
  const totalEffectiveCount = totalInheritedCount + totalOverridesCount;

  // Selected department label
  const selectedDeptLabel = selectedDepartment === 'all' 
    ? 'All Departments' 
    : (departmentsList.find(d => d.id === selectedDepartment || d.name === selectedDepartment)?.name || selectedDepartment);

  return (
    <div className="space-y-5">
      
      {/* 1. Page Header (Retained) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">Roles & Permissions Matrix</h1>
            <span className="px-2 py-0.5 bg-sand-200/70 text-navy text-[10px] font-bold rounded-full border border-warmGrey uppercase tracking-wider">
              RBAC Security
            </span>
          </div>
          <p className="text-xs text-mutedGrey mt-0.5">
            Granular access controls across 23 operational modules and 8 action permissions for SunPower Solutions
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsCreateRoleModalOpen(true)}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Department & Employee Filtering Toolbar */}
      <div className="bg-white rounded-2xl p-3.5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          
          {/* LEFT: Department Filter Dropdown */}
          <div ref={deptDropdownRef} className="w-full md:w-72 relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGrey mb-1">
              Department Filter
            </label>
            <button
              type="button"
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-xl bg-sand-50/50 hover:bg-sand-100/70 transition-colors flex items-center justify-between text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="w-3.5 h-3.5 text-navy shrink-0" />
                <span className="font-semibold truncate">{selectedDeptLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-mutedGrey shrink-0 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDeptDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-warmGrey rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto divide-y divide-warmGrey/30">
                <button
                  type="button"
                  onClick={() => handleSelectDepartment('all')}
                  className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between hover:bg-sand-50 transition-colors ${
                    selectedDepartment === 'all' ? 'bg-sand-100 font-bold text-navy' : 'text-charcoal'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-navy/40"></span>
                    <span>All Departments</span>
                  </span>
                  {selectedDepartment === 'all' && <Check className="w-3.5 h-3.5 text-navy" />}
                </button>

                {departmentsList.map(dept => {
                  const isSelected = selectedDepartment === dept.name || selectedDepartment === dept.id;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => handleSelectDepartment(dept.name)}
                      className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between hover:bg-sand-50 transition-colors ${
                        isSelected ? 'bg-sand-100 font-bold text-navy' : 'text-charcoal'
                      }`}
                    >
                      <span className="truncate pr-2">{dept.name}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-navy shrink-0" />
                      ) : dept.employeeCount !== undefined ? (
                        <span className="text-[10px] font-mono text-mutedGrey bg-sand-100 px-1.5 py-0.5 rounded shrink-0">
                          {dept.employeeCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Searchable Employee Selector */}
          <div ref={searchBoxRef} className="flex-1 relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-mutedGrey mb-1">
              Employee Filter & Permission Inspector
            </label>

            {selectedEmployee ? (
              // Selected Employee Pill View
              <div className="flex items-center justify-between px-3 py-1.5 border border-navy/40 bg-sand-100/60 rounded-xl">
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-lg bg-navy text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {selectedEmployee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-charcoal truncate">{selectedEmployee.fullName}</span>
                      <span className="text-[10px] font-mono bg-white px-1.5 py-0.2 rounded border border-warmGrey text-mutedGrey">
                        {selectedEmployee.employeeCode}
                      </span>
                    </div>
                    <p className="text-[10px] text-mutedGrey truncate">
                      {selectedEmployee.designation} • {selectedEmployee.department}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearSelectedEmployee}
                  className="p-1 hover:bg-sand-200 text-mutedGrey hover:text-charcoal rounded-lg transition-colors ml-2 shrink-0"
                  title="Clear Employee Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              // Search Input Box
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search employee name, ID or email..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setIsSuggestionsOpen(true);
                  }}
                  className="w-full pl-9 pr-9 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                />
                {isSearching && (
                  <Loader2 className="w-3.5 h-3.5 text-navy animate-spin absolute right-3 top-2.5" />
                )}
                {searchInput && !isSearching && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-2.5 text-mutedGrey hover:text-charcoal"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Floating Suggestions Menu */}
                {isSuggestionsOpen && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-warmGrey rounded-xl shadow-xl z-40 max-h-72 overflow-y-auto divide-y divide-warmGrey/30">
                    <div className="px-3 py-1.5 bg-sand-50/80 text-[10px] font-bold text-mutedGrey uppercase tracking-wider flex items-center justify-between">
                      <span>Matching Employees ({suggestions.length})</span>
                      <span>Click to inspect permissions</span>
                    </div>

                    {suggestions.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelectEmployee(emp)}
                        className="w-full p-2.5 text-left hover:bg-sand-50/80 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          <div className="w-7 h-7 rounded-lg bg-sand-200/80 text-navy text-[10px] font-bold flex items-center justify-center shrink-0 border border-warmGrey/60">
                            {emp.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-charcoal truncate">{emp.fullName}</span>
                              <span className="text-[10px] font-mono text-mutedGrey bg-sand-100 px-1 rounded border border-warmGrey/50">
                                {emp.employeeCode}
                              </span>
                            </div>
                            <p className="text-[10px] text-mutedGrey truncate">
                              {emp.designation} • {emp.department}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-sand-100 text-navy border border-warmGrey/50 block">
                            {emp.role}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {isSuggestionsOpen && !isSearching && searchInput.trim().length >= 2 && suggestions.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-warmGrey rounded-xl shadow-lg z-40 p-4 text-center text-xs text-mutedGrey">
                    No matching employees found in {selectedDeptLabel}.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clear Filters Action */}
          {(selectedDepartment !== 'all' || selectedEmployee !== null) && (
            <div className="pt-4 md:pt-4 shrink-0">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="px-3 py-2 bg-sand-100 hover:bg-sand-200 text-charcoal border border-warmGrey/60 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
                title="Reset all filters to default"
              >
                <RotateCcw className="w-3.5 h-3.5 text-navy" />
                <span>Clear Filters</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 3. Employee Inspection & Overrides Banner (Rendered when Employee Selected) */}
      {selectedEmployee && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-navy/30 shadow-[0_4px_16px_rgba(24,49,83,0.10)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warmGrey/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-navy text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                {selectedEmployee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-charcoal">{selectedEmployee.fullName}</h3>
                  <span className="px-2 py-0.5 bg-navy/10 text-navy font-mono text-[10px] font-bold rounded-md">
                    {selectedEmployee.employeeCode}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 uppercase tracking-wider">
                    Employee View Active
                  </span>
                </div>
                <p className="text-xs text-mutedGrey mt-0.5">
                  {selectedEmployee.designation} • {selectedEmployee.department} • Assigned Role: <strong className="text-navy">{activeRole?.name}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsOverrideModalOpen(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Grant Individual Override</span>
              </button>
              <button
                onClick={handleClearSelectedEmployee}
                className="px-3 py-1.5 bg-sand-100 hover:bg-sand-200 text-charcoal border border-warmGrey text-xs font-semibold rounded-xl transition-colors"
              >
                Back to Role View
              </button>
            </div>
          </div>

          {/* Three Summary Metric Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-sand-50/70 rounded-xl border border-warmGrey/60">
              <span className="text-[11px] font-bold text-mutedGrey uppercase tracking-wider block mb-0.5">
                Inherited Role Permissions
              </span>
              <div className="text-lg font-bold text-charcoal flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-navy" />
                <span>{totalInheritedCount} Actions</span>
              </div>
              <span className="text-[10px] text-mutedGrey">
                Inherited automatically from '{activeRole?.name}'
              </span>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
                Individual Overrides / Delegations
              </span>
              <div className="text-lg font-bold text-amber-700 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{totalOverridesCount} Overrides Active</span>
              </div>
              <span className="text-[10px] text-amber-800">
                Direct capability exceptions granted specifically to this employee
              </span>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                Total Effective Capabilities
              </span>
              <div className="text-lg font-bold text-emerald-700 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{totalEffectiveCount} Combined Actions</span>
              </div>
              <span className="text-[10px] text-emerald-700">
                Net operational authority evaluated at service boundaries
              </span>
            </div>
          </div>

          {/* Active Overrides Table / Cards if overrides exist */}
          {employeeActiveDelegations.length > 0 && (
            <div className="p-3.5 bg-sand-50/50 rounded-xl border border-warmGrey/60 space-y-2">
              <h4 className="text-xs font-bold text-charcoal flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-navy" />
                <span>Active Individual Operational Delegations</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {employeeActiveDelegations.map(del => (
                  <div key={del.id} className="p-2.5 bg-white rounded-lg border border-amber-200/70 shadow-xs flex items-center justify-between text-xs gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                          {del.delegationCode || 'OVERRIDE'}
                        </span>
                        <span className="font-bold text-charcoal">{del.grantedPermission}</span>
                      </div>
                      <p className="text-[11px] text-mutedGrey mt-0.5 truncate">
                        {del.justification || 'Administrative operational delegation'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevokeOverride(del.id, del.grantedPermission)}
                      className="px-2 py-1 text-[10px] font-bold text-terracotta hover:bg-rose-50 rounded-md border border-rose-200 transition-colors shrink-0"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Role Selector Tabs (Responsive Multi-Row Wrapping without Horizontal Scrollbar) */}
      <div className="bg-white rounded-2xl p-4 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {rolesPermissions.map((role) => {
            const isSelected = role.id === activeRole?.id;
            const isEmployeeRole = selectedEmployee && (selectedEmployee.role === role.roleKey || selectedEmployee.role === role.id);

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border text-left ${
                  isSelected
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-sand-50/70 text-charcoal border-warmGrey/60 hover:bg-sand-100 hover:border-warmGrey'
                }`}
              >
                <span>{role.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-warmGrey/50 text-charcoal'
                }`}>
                  {role.userCount}
                </span>
                {role.isCustom && (
                  <span className="text-[9px] uppercase px-1 rounded bg-amber-100 text-amber font-bold shrink-0">
                    Custom
                  </span>
                )}
                {isEmployeeRole && (
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-white font-extrabold flex items-center space-x-1 shrink-0">
                    <User className="w-2.5 h-2.5" />
                    <span>Assigned</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeRole && (
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div>
              <span className="font-semibold text-charcoal">Role Scope: </span>
              <span className="text-mutedGrey">{activeRole.description}</span>
            </div>
            {activeRole.roleKey === 'owner_admin' && (
              <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-semibold shrink-0">
                <Lock className="w-3 h-3" />
                <span>Superadmin — Root Access</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Permissions Matrix Table */}
      <div className="bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] overflow-hidden">
        <div className="px-5 py-4 border-b border-warmGrey/60 bg-sand-50/40 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-charcoal">
              {selectedEmployee ? (
                <span>
                  Effective Permissions for <strong className="text-navy">{selectedEmployee.fullName}</strong> ({activeRole?.name})
                </span>
              ) : (
                <span>
                  Access Matrix for <span className="text-navy">{activeRole?.name}</span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-mutedGrey">
              {selectedEmployee 
                ? 'Inspecting role-inherited permissions and individual delegation overrides'
                : 'Click individual cell checkboxes to toggle module authorization for this role'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Saving to database...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved to database</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Save failed</span>
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-warmGrey/60 bg-sand-50/70 text-[11px] font-bold text-charcoal uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[200px]">Module / Entity</th>
                <th className="py-3 px-3 text-mutedGrey font-medium text-[10px]">Category</th>
                {actionsList.map(action => (
                  <th key={action.key} className="py-3 px-3 text-center min-w-[70px]">
                    {action.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40">
              {modulesList.map((mod) => {
                const isSuperAdmin = activeRole?.roleKey === 'owner_admin';

                return (
                  <tr key={mod.key} className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-charcoal">
                      {mod.label}
                    </td>
                    <td className="py-3 px-3 text-[10px] text-mutedGrey font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-sand-100 text-charcoal">
                        {mod.category}
                      </span>
                    </td>

                    {actionsList.map(action => {
                      const { isRoleGranted, isOverrideGranted, isEffectiveGranted } = getPermissionStatus(mod.key, action.key);

                      return (
                        <td key={action.key} className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={isSuperAdmin}
                            onClick={() => handleCellClick(mod.key, action.key, mod.label)}
                            title={
                              isOverrideGranted 
                                ? `Individual Override granted to ${selectedEmployee?.fullName}`
                                : isRoleGranted 
                                ? `Role permission for '${activeRole?.name}'`
                                : `Not granted`
                            }
                            className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all ${
                              isOverrideGranted
                                ? 'bg-amber-500 text-white shadow-xs font-bold ring-2 ring-amber-300'
                                : isRoleGranted
                                ? 'bg-navy text-white shadow-xs'
                                : 'bg-sand-100 text-mutedGrey hover:bg-sand-200'
                            } ${isSuperAdmin ? 'opacity-90 cursor-default' : 'cursor-pointer hover:scale-105'}`}
                          >
                            {isOverrideGranted ? (
                              <Sparkles className="w-3.5 h-3.5 text-white" />
                            ) : isRoleGranted ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <span className="text-[10px] text-warmGrey">•</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Cell Action Confirmation Prompt (Prevents Accidental Entire-Role Mutation) */}
      {cellActionPrompt && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-warmGrey relative">
            <button
              onClick={() => setCellActionPrompt(null)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Permission Change Scope</h3>
                <p className="text-xs text-mutedGrey">Choose modification target</p>
              </div>
            </div>

            <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60 text-xs text-charcoal space-y-1 mb-4">
              <p>You clicked: <strong>{cellActionPrompt.moduleLabel} ({cellActionPrompt.actionKey.toUpperCase()})</strong></p>
              <p>Currently inspecting: <strong className="text-navy">{selectedEmployee.fullName}</strong> ({activeRole?.name})</p>
            </div>

            <p className="text-xs text-mutedGrey leading-relaxed mb-5">
              Do you want to grant an <strong>individual override</strong> specifically for {selectedEmployee.fullName}, or toggle this permission for the <strong>entire {activeRole?.name} role</strong> (affecting all {activeRole?.userCount} employees)?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCellActionPrompt(null)}
                className="w-full sm:w-auto px-3.5 py-2 border border-warmGrey rounded-xl text-charcoal hover:bg-sand-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = cellActionPrompt.moduleKey;
                  const a = cellActionPrompt.actionKey;
                  setCellActionPrompt(null);
                  setOverrideModule(m);
                  setOverrideAction(a);
                  setIsOverrideModalOpen(true);
                }}
                className="w-full sm:w-auto px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold shadow-xs flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Grant Override ({selectedEmployee.fullName.split(' ')[0]} only)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = cellActionPrompt.moduleKey;
                  const a = cellActionPrompt.actionKey;
                  setCellActionPrompt(null);
                  executeRoleToggle(m, a);
                }}
                className="w-full sm:w-auto px-3.5 py-2 bg-navy hover:bg-navy-light text-white rounded-xl font-semibold shadow-xs"
              >
                Modify Entire Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Grant Individual Override Modal */}
      {isOverrideModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-warmGrey relative">
            <button
              onClick={() => setIsOverrideModalOpen(false)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Grant Individual Permission Override</h3>
                <p className="text-xs text-mutedGrey">Delegates capability to {selectedEmployee.fullName} only</p>
              </div>
            </div>

            <form onSubmit={handleGrantOverride} className="space-y-4 text-xs">
              <div>
                <label className="block text-mutedGrey font-medium mb-1">Target Module</label>
                <select
                  value={overrideModule}
                  onChange={e => setOverrideModule(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  {modulesList.map(m => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Action Permission</label>
                <select
                  value={overrideAction}
                  onChange={e => setOverrideAction(e.target.value as PermissionAction)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  {actionsList.map(a => (
                    <option key={a.key} value={a.key}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Justification & Regulatory Purpose</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Temporary cross-functional warehouse inventory audit coverage..."
                  value={overrideJustification}
                  onChange={e => setOverrideJustification(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Validity Period (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={overrideExpiryDays}
                  onChange={e => setOverrideExpiryDays(Number(e.target.value))}
                  className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 border border-warmGrey text-charcoal rounded-xl hover:bg-sand-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Grant Individual Override</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Create Custom Role Modal (Retained) */}
      {isCreateRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-warmGrey relative">
            <button
              onClick={() => setIsCreateRoleModalOpen(false)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sand-100 flex items-center justify-center text-navy">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Create Custom Role</h3>
                <p className="text-xs text-mutedGrey">Define specialized permissions for employees</p>
              </div>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-mutedGrey font-medium mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Junior Solar Estimator or Site Supervisor"
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Base Permissions Template</label>
                <select
                  value={newRoleBaseId}
                  onChange={e => setNewRoleBaseId(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  {rolesPermissions.map(r => (
                    <option key={r.id} value={r.id}>
                      Clone from {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Role Description & Responsibilities</label>
                <textarea
                  rows={3}
                  placeholder="Outline the operational responsibilities granted to this role..."
                  value={newRoleDesc}
                  onChange={e => setNewRoleDesc(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleModalOpen(false)}
                  className="px-4 py-2 border border-warmGrey text-charcoal rounded-xl hover:bg-sand-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-light font-semibold shadow-xs"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
