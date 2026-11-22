import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Search, Filter, Phone, Mail, Award, 
  Clock, CheckCircle2, XCircle, Star, ShieldCheck, 
  Plus, Edit2, UserX, UserPlus, X, Calendar, MapPin, 
  AlertTriangle, Briefcase, ChevronRight, Activity, Shield, RotateCcw,
  KeyRound, EyeOff, Eye, Copy, ArrowRightLeft, Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Employee, UserRole } from '../types';
import { EmployeeFilterToolbar } from '../components/workforce/EmployeeFilterToolbar';
import { Pagination } from '../components/common/Pagination';
import { EditEmployeeModal } from '../components/workforce/EditEmployeeModal';
import { PromoteEmployeeModal } from '../components/workforce/PromoteEmployeeModal';
import { TransferEmployeeModal } from '../components/workforce/TransferEmployeeModal';
import { EmployeeCareerTimeline } from '../components/workforce/EmployeeCareerTimeline';

export const WorkforcePage: React.FC = () => {
  const { 
    employees, 
    employeesLoading,
    employeesError,
    employeeTotal,
    session,
    currentUser,
    refreshEmployees,
    addEmployee, 
    updateEmployee, 
    promoteEmployee,
    executeDepartmentTransfer,
    deactivateEmployee, 
    reactivateEmployee, 
    employeeActivities,
    departments,
    rolesPermissions,
    showToast 
  } = useApp();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_leave' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProfileEmp, setSelectedProfileEmp] = useState<Employee | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'work' | 'attendance' | 'permissions' | 'activity' | 'career'>('overview');

  const [isEditEmpModalOpen, setIsEditEmpModalOpen] = useState(false);
  const [empToEdit, setEmpToEdit] = useState<Employee | null>(null);

  const [isPromoteEmpModalOpen, setIsPromoteEmpModalOpen] = useState(false);
  const [empToPromote, setEmpToPromote] = useState<Employee | null>(null);

  const [isTransferEmpModalOpen, setIsTransferEmpModalOpen] = useState(false);
  const [empToTransfer, setEmpToTransfer] = useState<Employee | null>(null);
  
  // Deactivate confirmation modal
  const [empToDeactivate, setEmpToDeactivate] = useState<Employee | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');

  // Add Employee Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDept, setFormDept] = useState('Operations & Installations');
  const [formDesignation, setFormDesignation] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('install_tech');
  const [formHourlyRate, setFormHourlyRate] = useState(250);
  const [formSkills, setFormSkills] = useState('');
  const [formEmploymentType, setFormEmploymentType] = useState<'full_time' | 'contract' | 'part_time'>('full_time');
  const [formAddress, setFormAddress] = useState('');
  const [formEmergencyName, setFormEmergencyName] = useState('');
  const [formEmergencyRelation, setFormEmergencyRelation] = useState('');
  const [formEmergencyPhone, setFormEmergencyPhone] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Employee Modal - Temporary Credentials State
  const [createdCredentials, setCreatedCredentials] = useState<{
    fullName: string;
    employeeCode: string;
    email: string;
    department: string;
    designation: string;
    role: string;
    temporaryPassword: string;
  } | null>(null);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);

  // Normalize department names for flexible matching
  const normalizeDept = (dept: string) => dept.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

  const isSameDept = (empDept: string, targetDept: string) => {
    if (!targetDept || targetDept.toLowerCase() === 'all') return true;
    if (!empDept) return false;
    const cleanEmp = normalizeDept(empDept);
    const cleanTarget = normalizeDept(targetDept);
    if (cleanEmp === cleanTarget || cleanEmp.includes(cleanTarget) || cleanTarget.includes(cleanEmp)) return true;
    if ((cleanTarget.includes('sales') || cleanTarget === 'sls') && cleanEmp.includes('sales')) return true;
    if ((cleanTarget.includes('field') || cleanTarget === 'fld') && cleanEmp.includes('field')) return true;
    if ((cleanTarget.includes('eng') || cleanTarget === 'eng') && cleanEmp.includes('eng')) return true;
    if ((cleanTarget.includes('install') || cleanTarget.includes('ops') || cleanTarget === 'ops') && cleanEmp.includes('install')) return true;
    if ((cleanTarget.includes('warehouse') || cleanTarget.includes('log') || cleanTarget === 'log') && cleanEmp.includes('warehouse')) return true;
    if ((cleanTarget.includes('account') || cleanTarget.includes('fin') || cleanTarget === 'fin') && cleanEmp.includes('account')) return true;
    if ((cleanTarget.includes('support') || cleanTarget.includes('warrant') || cleanTarget === 'sup') && (cleanEmp.includes('care') || cleanEmp.includes('warrant') || cleanEmp.includes('support'))) return true;
    return false;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [deptFilter, statusFilter, selectedEmployee?.id]);

  const generateSecurePassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnpqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%&*';
    const parts = [
      uppers[Math.floor(Math.random() * uppers.length)],
      lowers[Math.floor(Math.random() * lowers.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];
    for (let i = 0; i < 6; i++) {
      parts.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    return parts.sort(() => 0.5 - Math.random()).join('');
  };

  const getNextEmployeeCode = () => {
    let highest = 0;
    employees.forEach(emp => {
      const match = emp.employeeCode.match(/(\d+)$/);
      if (match) highest = Math.max(highest, Number(match[1]));
    });
    const safeTotal = Math.max(highest, employeeTotal, employees.length);
    return `EMP-${String(safeTotal + 1).padStart(3, '0')}`;
  };

  const resetAddForm = () => {
    setFormName('');
    setFormCode(getNextEmployeeCode());
    setFormEmail('');
    setFormPhone('');
    setFormDept('Operations & Installations');
    setFormDesignation('');
    setFormRole('install_tech');
    setFormHourlyRate(250);
    setFormSkills('');
    setFormEmploymentType('full_time');
    setFormAddress('');
    setFormEmergencyName('');
    setFormEmergencyRelation('');
    setFormEmergencyPhone('');
    setFormErrors({});
  };

  // Filtered employees adhering to Department, Employee Selector, and Duty Status
  const filteredEmployees = employees.filter(emp => {
    // 1. Employee specific filter (if an employee is explicitly chosen)
    if (selectedEmployee && emp.id !== selectedEmployee.id) {
      return false;
    }

    // 2. Department filter
    if (deptFilter !== 'all' && !isSameDept(emp.department, deptFilter)) {
      return false;
    }

    // 3. Status filter
    if (statusFilter !== 'all') {
      const empStatus = (emp.status || 'active').toLowerCase();
      if (empStatus !== statusFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  const totalFiltered = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedEmployees = filteredEmployees.slice((safePage - 1) * pageSize, safePage * pageSize);

  // KPI calculations
  const totalEmployees = employeeTotal || employees.length;
  const activeCount = employees.filter(e => e.status !== 'inactive' && e.status !== 'on_leave').length;
  const onLeaveCount = employees.filter(e => e.status === 'on_leave').length;
  const inactiveCount = employees.filter(e => e.status === 'inactive').length;

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // 1. Full Legal Name validation
    const cleanName = formName.trim();
    if (!cleanName || cleanName.length < 2) {
      errors.name = 'Full legal name is required (minimum 2 characters)';
    }

    // 2. Employee Code validation
    const cleanCode = formCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      errors.code = 'Employee code is required (e.g. EMP-062)';
    } else if (employees.some(emp => emp.employeeCode.toUpperCase() === cleanCode)) {
      errors.code = `Employee code '${cleanCode}' is already registered in directory`;
    }

    // 3. Email validation
    const cleanEmail = formEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      errors.email = 'Please enter a valid corporate or personal email';
    } else if (employees.some(emp => emp.email.toLowerCase() === cleanEmail)) {
      errors.email = `Email '${cleanEmail}' is already assigned to an existing personnel`;
    }

    // 4. Phone validation
    const cleanPhone = formPhone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (!cleanPhone || phoneDigits.length < 8) {
      errors.phone = 'Please enter a valid contact phone number (at least 8 digits)';
    }

    // 5. Designation validation
    const cleanDesig = formDesignation.trim();
    if (!cleanDesig) {
      errors.designation = 'Designation / job title is required';
    }

    // 6. Hourly Rate validation
    if (Number(formHourlyRate) < 0) {
      errors.hourlyRate = 'Billing rate cannot be negative';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please correct the highlighted form errors', 'error');
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const generatedTempPassword = generateSecurePassword();

    try {
      const newEmp = await addEmployee({
        fullName: cleanName,
        employeeCode: cleanCode,
        email: cleanEmail,
        phone: cleanPhone,
        department: formDept,
        designation: cleanDesig,
        role: formRole,
        hourlyRate: Number(formHourlyRate),
        skills: formSkills ? formSkills.split(',').map(s => s.trim()).filter(Boolean) : ['Solar Sizing', 'Field Safety'],
        isAvailable: true,
        activeJobs: 0,
        rating: 5.0,
        status: 'active',
        employmentType: formEmploymentType,
        address: formAddress.trim() || 'Pune, Maharashtra',
        emergencyContact: formEmergencyName.trim() ? {
          name: formEmergencyName.trim(),
          relation: formEmergencyRelation.trim() || 'Family',
          phone: formEmergencyPhone.trim() || cleanPhone
        } : undefined,
        joiningDate: new Date().toISOString().split('T')[0],
        leaveBalanceDays: 18,
        temporaryPassword: generatedTempPassword
      });

      // Close the form modal first
      setIsAddModalOpen(false);
      setCurrentPage(1);

      // Show credentials popup with the backend-generated/assigned temporary password
      const tempPwd = (newEmp as any).temporaryPassword || generatedTempPassword;
      setCreatedCredentials({
        fullName: newEmp.fullName || cleanName,
        employeeCode: newEmp.employeeCode || cleanCode,
        email: newEmp.email || cleanEmail,
        department: newEmp.department || formDept,
        designation: newEmp.designation || cleanDesig,
        role: newEmp.role || formRole,
        temporaryPassword: tempPwd
      });
      setShowTemporaryPassword(false);

      // Reset form fields
      resetAddForm();
    } catch (err: any) {
      const errMsg = (err.message || '').toLowerCase();
      if (err.code === 'DUPLICATE_EMPLOYEE_CODE' || errMsg.includes('code')) {
        setFormErrors(prev => ({ ...prev, code: err.message || `Employee code '${cleanCode}' is already registered` }));
      } else if (err.code === 'DUPLICATE_EMAIL' || errMsg.includes('email')) {
        setFormErrors(prev => ({ ...prev, email: err.message || `Email '${cleanEmail}' is already registered` }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empToDeactivate) return;
    try {
      await deactivateEmployee(empToDeactivate.id, deactivationReason || 'Administrative suspension');
      setEmpToDeactivate(null);
      setDeactivationReason('');
      showToast('Employee account deactivated.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Unable to deactivate employee.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">Workforce & Employee Directory</h1>
            <span className="px-2 py-0.5 bg-sand-200/70 text-navy text-[10px] font-bold rounded-full border border-warmGrey uppercase tracking-wider">
              Human Capital
            </span>
          </div>
          <p className="text-xs text-mutedGrey mt-0.5">
            Full enterprise personnel directory, availability, 360° performance profiles and role authorizations
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              resetAddForm();
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            statusFilter === 'all'
              ? 'bg-white border-navy ring-2 ring-navy/10 shadow-[0_5px_18px_rgba(196,138,66,0.16)]'
              : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]'
          }`}
        >
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Total Workforce</span>
            <UserCheck className="w-4 h-4 text-navy" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{totalEmployees}</div>
          <span className="text-[11px] text-mutedGrey">All staff on payroll</span>
        </div>

        <div 
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            statusFilter === 'active'
              ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-[0_5px_18px_rgba(196,138,66,0.16)]'
              : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]'
          }`}
        >
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Active on Duty</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{activeCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Ready for deployment</span>
        </div>

        <div 
          onClick={() => setStatusFilter('on_leave')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            statusFilter === 'on_leave'
              ? 'bg-white border-amber ring-2 ring-amber/20 shadow-[0_5px_18px_rgba(196,138,66,0.16)]'
              : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]'
          }`}
        >
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>On Leave / Absent</span>
            <Clock className="w-4 h-4 text-amber" />
          </div>
          <div className="text-2xl font-bold text-amber">{onLeaveCount}</div>
          <span className="text-[11px] text-mutedGrey">Approved leave roster</span>
        </div>

        <div 
          onClick={() => setStatusFilter('inactive')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            statusFilter === 'inactive'
              ? 'bg-white border-terracotta ring-2 ring-terracotta/20 shadow-[0_5px_18px_rgba(196,138,66,0.16)]'
              : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]'
          }`}
        >
          <div className="flex items-center justify-between text-mutedGrey text-xs mb-1">
            <span>Inactive / Suspended</span>
            <XCircle className="w-4 h-4 text-terracotta" />
          </div>
          <div className="text-2xl font-bold text-terracotta">{inactiveCount}</div>
          <span className="text-[11px] text-mutedGrey">System access locked</span>
        </div>
      </div>

      {/* Advanced Scalable Employee & Department Filter Toolbar */}
      <EmployeeFilterToolbar
        selectedDepartment={deptFilter}
        onDepartmentChange={setDeptFilter}
        selectedEmployee={selectedEmployee}
        onEmployeeSelect={setSelectedEmployee}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalResultsCount={pagedEmployees.length}
        totalEmployeesCount={totalFiltered}
        onClearAll={() => {
          setDeptFilter('all');
          setSelectedEmployee(null);
          setStatusFilter('all');
        }}
      />

      {employeesError && employees.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-terracotta/30 bg-rose-50 px-4 py-3 text-xs text-terracotta">
          <span>Could not refresh the directory from the database: {employeesError}</span>
          <button
            onClick={() => void refreshEmployees()}
            className="shrink-0 rounded-lg border border-terracotta/30 bg-white px-3 py-1.5 font-semibold hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Employees Grid or Empty State */}
      {employeesLoading && employees.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[rgba(196,138,66,0.18)] bg-white p-12 text-xs text-mutedGrey">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
          <span>Loading workforce directory from database...</span>
        </div>
      ) : employeesError && employees.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-terracotta/30 bg-white p-12 text-center text-xs">
          <AlertTriangle className="mx-auto h-6 w-6 text-terracotta" />
          <h3 className="text-base font-bold text-charcoal">Employee directory unavailable</h3>
          <p className="mx-auto max-w-md text-mutedGrey">{employeesError}</p>
          <button
            onClick={() => void refreshEmployees()}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-navy px-4 py-2 font-semibold text-white hover:bg-navy-light"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] space-y-3">
          <div className="w-12 h-12 rounded-full bg-sand-100 flex items-center justify-center mx-auto text-navy">
            <UserX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-charcoal">No matching personnel found</h3>
          <p className="text-xs text-mutedGrey max-w-md mx-auto">
            No employees match the selected department, employee filter, or duty status. Clear filters to view all personnel.
          </p>
          <button
            onClick={() => {
              setDeptFilter('all');
              setSelectedEmployee(null);
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors inline-flex items-center space-x-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {pagedEmployees.map(emp => {
          const isInactive = emp.status === 'inactive';
          const isOnLeave = emp.status === 'on_leave';

          return (
            <div 
              key={emp.id} 
              className={`bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all flex flex-col justify-between ${
                isInactive ? 'opacity-60 bg-sand-50/50' : ''
              }`}
            >
              <div>
                {/* Employee Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-sand-100 text-navy font-bold flex items-center justify-center border border-warmGrey/60 text-sm">
                      {emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-charcoal flex items-center space-x-1.5">
                        <span>{emp.fullName}</span>
                        {isOnLeave && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber border border-amber-200">
                            On Leave
                          </span>
                        )}
                        {isInactive && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-terracotta border border-rose-200">
                            Inactive
                          </span>
                        )}
                      </h3>
                      <span className="text-[11px] font-mono text-mutedGrey">
                        {emp.employeeCode} • {emp.designation}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-amber text-xs font-bold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{emp.rating}</span>
                  </div>
                </div>

                {/* Contact and Department Details */}
                <div className="mt-4 space-y-1.5 text-xs text-mutedGrey">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-navy shrink-0" />
                    <span className="text-charcoal font-medium">{emp.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-navy shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px]">Department:</span>
                    <span className="font-semibold text-charcoal">{emp.department}</span>
                  </div>
                  {emp.teamName && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Functional Team:</span>
                      <span className="font-medium text-navy">{emp.teamName}</span>
                    </div>
                  )}
                </div>

                {/* Technical Skills Tags */}
                <div className="mt-3 pt-3 border-t border-warmGrey/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey block mb-1.5">
                    Core Technical Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {emp.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-sand-100 text-charcoal text-[10px] rounded-md font-medium border border-warmGrey/40"
                      >
                        {skill}
                      </span>
                    ))}
                    {emp.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-sand-50 text-mutedGrey text-[10px] rounded font-medium">
                        +{emp.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-warmGrey/40 flex items-center justify-between">
                <div className="text-[11px] font-mono text-mutedGrey">
                  Rate: ₹{emp.hourlyRate}/hr
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => {
                      setEmpToEdit(emp);
                      setIsEditEmpModalOpen(true);
                    }}
                    className="p-1.5 text-mutedGrey hover:text-navy hover:bg-sand-100 rounded-lg transition-colors"
                    title="Edit Employee Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEmpToPromote(emp);
                      setIsPromoteEmpModalOpen(true);
                    }}
                    className="p-1.5 text-mutedGrey hover:text-amber hover:bg-amber-50 rounded-lg transition-colors"
                    title="Promote Employee"
                  >
                    <Award className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEmpToTransfer(emp);
                      setIsTransferEmpModalOpen(true);
                    }}
                    className="p-1.5 text-mutedGrey hover:text-navy hover:bg-navy/10 rounded-lg transition-colors"
                    title="Transfer Department"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProfileEmp(emp);
                      setProfileTab('overview');
                    }}
                    className="px-2.5 py-1.5 bg-sand-100 hover:bg-sand-200 text-navy rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <span>360° Profile</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  {isInactive ? (
                    <button
                      onClick={async () => {
                        try {
                          await reactivateEmployee(emp.id);
                          showToast('Employee account reactivated.', 'success');
                        } catch (error: any) {
                          showToast(error.message || 'Unable to reactivate employee.', 'error');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => setEmpToDeactivate(emp)}
                      className="p-1.5 text-mutedGrey hover:text-terracotta hover:bg-rose-50 rounded-lg transition-colors"
                      title="Deactivate Account"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={totalFiltered}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="personnel"
        />
        </>
      )}

      {/* Employee 360° Profile Modal */}
      {selectedProfileEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-warmGrey relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProfileEmp(null)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-warmGrey/60">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-navy text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {selectedProfileEmp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-charcoal flex items-center space-x-2">
                    <span>{selectedProfileEmp.fullName}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-sand-100 text-charcoal font-semibold">
                      {selectedProfileEmp.employeeCode}
                    </span>
                  </h3>
                  <p className="text-xs text-mutedGrey mt-0.5">
                    {selectedProfileEmp.designation} • {selectedProfileEmp.department}
                  </p>
                  <div className="flex items-center space-x-2 mt-1.5 text-xs text-mutedGrey">
                    <span>Rating: <strong className="text-amber">★ {selectedProfileEmp.rating}</strong></span>
                    <span>•</span>
                    <span>Hourly Rate: <strong className="text-charcoal">₹{selectedProfileEmp.hourlyRate}/hr</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-emerald-700 capitalize">{selectedProfileEmp.status || 'Active'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 pt-1">
                <button
                  onClick={() => {
                    setEmpToEdit(selectedProfileEmp);
                    setIsEditEmpModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 text-charcoal rounded-lg text-xs font-semibold flex items-center space-x-1 border border-warmGrey/60 transition-colors"
                  title="Edit Profile"
                >
                  <Edit2 className="w-3 h-3 text-navy" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setEmpToPromote(selectedProfileEmp);
                    setIsPromoteEmpModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber font-bold rounded-lg text-xs flex items-center space-x-1 border border-amber/30 transition-colors"
                  title="Promote Employee"
                >
                  <Award className="w-3 h-3 text-amber" />
                  <span>Promote</span>
                </button>
                <button
                  onClick={() => {
                    setEmpToTransfer(selectedProfileEmp);
                    setIsTransferEmpModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-navy/10 hover:bg-navy/20 text-navy font-semibold rounded-lg text-xs flex items-center space-x-1 border border-navy/20 transition-colors"
                  title="Transfer Department"
                >
                  <ArrowRightLeft className="w-3 h-3 text-navy" />
                  <span>Transfer</span>
                </button>
              </div>
            </div>

            {/* Profile Tab Navigation */}
            <div className="flex items-center space-x-2 border-b border-warmGrey/60 mb-4 overflow-x-auto text-xs">
              <button
                onClick={() => setProfileTab('overview')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  profileTab === 'overview' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
                }`}
              >
                Profile Overview
              </button>
              <button
                onClick={() => setProfileTab('work')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  profileTab === 'work' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
                }`}
              >
                Work & Assignments
              </button>
              <button
                onClick={() => setProfileTab('attendance')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  profileTab === 'attendance' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
                }`}
              >
                Leave & Schedule
              </button>
              <button
                onClick={() => setProfileTab('permissions')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  profileTab === 'permissions' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
                }`}
              >
                Role & Permissions
              </button>
              <button
                onClick={() => setProfileTab('activity')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  profileTab === 'activity' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
                }`}
              >
                Audit History
              </button>
              <button
                onClick={() => setProfileTab('career')}
                className={`py-2 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1 ${
                  profileTab === 'career' ? 'border-navy text-navy' : 'border-transparent text-mutedGrey hover:text-charcoal'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Career Timeline</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="text-xs space-y-4">
              
              {/* Tab 1: Overview */}
              {profileTab === 'overview' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                      <span className="text-[10px] text-mutedGrey block uppercase tracking-wider font-semibold">Contact Email</span>
                      <span className="font-bold text-charcoal">{selectedProfileEmp.email}</span>
                    </div>
                    <div className="p-3 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                      <span className="text-[10px] text-mutedGrey block uppercase tracking-wider font-semibold">Mobile Phone</span>
                      <span className="font-bold text-charcoal">{selectedProfileEmp.phone}</span>
                    </div>
                    <div className="p-3 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                      <span className="text-[10px] text-mutedGrey block uppercase tracking-wider font-semibold">Reporting Manager</span>
                      <span className="font-bold text-charcoal">{selectedProfileEmp.reportingManagerName || 'Vikramaditya Rao'}</span>
                    </div>
                    <div className="p-3 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                      <span className="text-[10px] text-mutedGrey block uppercase tracking-wider font-semibold">Joining Date</span>
                      <span className="font-bold text-charcoal">{selectedProfileEmp.joiningDate || '2024-01-15'}</span>
                    </div>
                  </div>

                  {selectedProfileEmp.emergencyContact && (
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
                      <span className="font-bold text-amber block text-[11px] mb-1">Emergency Contact</span>
                      <div className="flex items-center justify-between text-charcoal">
                        <span>{selectedProfileEmp.emergencyContact.name} ({selectedProfileEmp.emergencyContact.relation})</span>
                        <span className="font-mono font-bold text-navy">{selectedProfileEmp.emergencyContact.phone}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-charcoal block mb-1">Full Residential Address</span>
                    <p className="p-2.5 bg-sand-50 rounded-xl border border-warmGrey/40 text-mutedGrey">
                      {selectedProfileEmp.address || 'Pune District, Maharashtra, India'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Work Activity */}
              {profileTab === 'work' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/40 text-center">
                      <span className="text-[10px] text-mutedGrey block">Active Assigned Jobs</span>
                      <span className="text-xl font-bold text-navy">{selectedProfileEmp.activeJobs}</span>
                    </div>
                    <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/40 text-center">
                      <span className="text-[10px] text-mutedGrey block">Customer CSAT</span>
                      <span className="text-xl font-bold text-amber">★ {selectedProfileEmp.rating}</span>
                    </div>
                    <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/40 text-center">
                      <span className="text-[10px] text-mutedGrey block">Availability</span>
                      <span className="text-xs font-bold text-emerald-700 block mt-1">
                        {selectedProfileEmp.isAvailable ? 'Available' : 'Engaged on Site'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-charcoal block mb-2">Verified Technical Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProfileEmp.skills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-sand-100 text-charcoal rounded-lg border border-warmGrey/60 font-medium text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Attendance */}
              {profileTab === 'attendance' && (
                <div className="space-y-3">
                  <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/40 flex items-center justify-between">
                    <div>
                      <span className="text-mutedGrey text-[11px] block">Annual Leave Balance</span>
                      <span className="text-lg font-bold text-charcoal">
                        {selectedProfileEmp.leaveBalanceDays || 16} Days Available
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-200">
                      Standard Entitlement
                    </span>
                  </div>

                  <p className="text-mutedGrey text-[11px]">
                    This employee is eligible for casual, sick, and earned privileged leave. Approvals are authorized by Department Head and Owner.
                  </p>
                </div>
              )}

              {/* Tab 4: Roles & Permissions */}
              {profileTab === 'permissions' && (
                <div className="space-y-3">
                  <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/40">
                    <span className="text-[10px] text-mutedGrey block uppercase font-semibold">Assigned Security Role</span>
                    <span className="text-sm font-bold text-navy capitalize">{selectedProfileEmp.role.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[11px] text-mutedGrey">
                    System access permissions are mapped to this employee's primary role in the Roles & Permissions Matrix.
                  </p>
                </div>
              )}

              {/* Tab 5: Recent Audit History */}
              {profileTab === 'activity' && (
                <div className="space-y-2">
                  {employeeActivities.filter(a => a.employeeId === selectedProfileEmp.id).length === 0 ? (
                    <div className="p-6 text-center text-mutedGrey">
                      No logged activity recorded for this employee in the current session.
                    </div>
                  ) : (
                    employeeActivities.filter(a => a.employeeId === selectedProfileEmp.id).map(act => (
                      <div key={act.id} className="p-2.5 bg-sand-50 rounded-xl border border-warmGrey/40 flex justify-between">
                        <div>
                          <div className="font-bold text-charcoal">{act.actionType}</div>
                          <div className="text-[11px] text-mutedGrey">{act.actionDetails}</div>
                        </div>
                        <span className="text-[10px] text-mutedGrey font-mono shrink-0">{act.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 6: Career Progression Timeline */}
              {profileTab === 'career' && (
                <EmployeeCareerTimeline
                  employeeId={selectedProfileEmp.id}
                  employeeName={selectedProfileEmp.fullName}
                />
              )}

            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-warmGrey/60">
              <button
                onClick={() => setSelectedProfileEmp(null)}
                className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light"
              >
                Close 360° Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-warmGrey relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sand-100 flex items-center justify-center text-navy">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Register New Employee</h3>
                <p className="text-xs text-mutedGrey">Onboard technicians, engineers, or office executives</p>
              </div>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Deshmukh"
                    value={formName}
                    onChange={e => {
                      setFormName(e.target.value);
                      if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`w-full p-2.5 border rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy ${
                      formErrors.name ? 'border-terracotta bg-rose-50/20' : 'border-warmGrey'
                    }`}
                    required
                  />
                  {formErrors.name && (
                    <span className="text-[10px] text-terracotta font-medium mt-0.5 block">{formErrors.name}</span>
                  )}
                </div>
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">Employee Code *</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={e => {
                      setFormCode(e.target.value);
                      if (formErrors.code) setFormErrors(prev => ({ ...prev, code: '' }));
                    }}
                    className={`w-full p-2.5 border rounded-xl font-mono text-charcoal focus:outline-none focus:ring-1 focus:ring-navy ${
                      formErrors.code ? 'border-terracotta bg-rose-50/20' : 'border-warmGrey'
                    }`}
                    required
                  />
                  {formErrors.code && (
                    <span className="text-[10px] text-terracotta font-medium mt-0.5 block">{formErrors.code}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="rahul.d@sunpowersolutions.in"
                    value={formEmail}
                    onChange={e => {
                      setFormEmail(e.target.value);
                      if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full p-2.5 border rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy ${
                      formErrors.email ? 'border-terracotta bg-rose-50/20' : 'border-warmGrey'
                    }`}
                    required
                  />
                  {formErrors.email && (
                    <span className="text-[10px] text-terracotta font-medium mt-0.5 block">{formErrors.email}</span>
                  )}
                </div>
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98221 00999"
                    value={formPhone}
                    onChange={e => {
                      setFormPhone(e.target.value);
                      if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className={`w-full p-2.5 border rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy ${
                      formErrors.phone ? 'border-terracotta bg-rose-50/20' : 'border-warmGrey'
                    }`}
                    required
                  />
                  {formErrors.phone && (
                    <span className="text-[10px] text-terracotta font-medium mt-0.5 block">{formErrors.phone}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">Department *</label>
                  <select
                    value={formDept}
                    onChange={e => setFormDept(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                  >
                    <option value="Operations & Installations">Operations & Installations</option>
                    <option value="Field Engineering & Surveys">Field Engineering & Surveys</option>
                    <option value="Engineering & Approvals">Engineering & Approvals</option>
                    <option value="Sales & Business Development">Sales & Business Development</option>
                    <option value="Supply Chain & Inventory">Supply Chain & Inventory</option>
                    <option value="Finance & Compliance">Finance & Compliance</option>
                    <option value="After-Sales & Customer Service">After-Sales & Customer Service</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">Designation *</label>
                  <input
                    type="text"
                    placeholder="e.g. Certified Solar Technician"
                    value={formDesignation}
                    onChange={e => {
                      setFormDesignation(e.target.value);
                      if (formErrors.designation) setFormErrors(prev => ({ ...prev, designation: '' }));
                    }}
                    className={`w-full p-2.5 border rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy ${
                      formErrors.designation ? 'border-terracotta bg-rose-50/20' : 'border-warmGrey'
                    }`}
                    required
                  />
                  {formErrors.designation && (
                    <span className="text-[10px] text-terracotta font-medium mt-0.5 block">{formErrors.designation}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">System Security Role *</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as UserRole)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                  >
                    <option value="install_tech">Installation Technician</option>
                    <option value="survey_tech">Field Survey Specialist</option>
                    <option value="sales_exec">Senior Sales Consultant</option>
                    <option value="engineering_lead">Engineering Lead</option>
                    <option value="warehouse_mgr">Warehouse Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="support_exec">Customer Support</option>
                    <option value="owner_admin">Managing Director & Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">Hourly Billing Rate (₹/hr)</label>
                  <input
                    type="number"
                    min="0"
                    value={formHourlyRate}
                    onChange={e => {
                      setFormHourlyRate(Number(e.target.value));
                      if (formErrors.hourlyRate) setFormErrors(prev => ({ ...prev, hourlyRate: '' }));
                    }}
                    className={`w-full p-2.5 border rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy ${
                      formErrors.hourlyRate ? 'border-terracotta bg-rose-50/20' : 'border-warmGrey'
                    }`}
                  />
                  {formErrors.hourlyRate && (
                    <span className="text-[10px] text-terracotta font-medium mt-0.5 block">{formErrors.hourlyRate}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-mutedGrey font-medium mb-1">Core Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Structure Mounting, Three-Phase Inverter, Shadow CAD, DC Cabling"
                  value={formSkills}
                  onChange={e => setFormSkills(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    placeholder="Contact name"
                    value={formEmergencyName}
                    onChange={e => setFormEmergencyName(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">Relation</label>
                  <input
                    type="text"
                    placeholder="Spouse / Parent"
                    value={formEmergencyRelation}
                    onChange={e => setFormEmergencyRelation(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-mutedGrey font-medium mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    placeholder="+91..."
                    value={formEmergencyPhone}
                    onChange={e => setFormEmergencyPhone(e.target.value)}
                    className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-warmGrey/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-warmGrey rounded-xl font-semibold hover:bg-sand-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Save & Register Employee</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Created — Credential Handover Popup */}
      {createdCredentials && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-warmGrey relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setCreatedCredentials(null)}
              className="absolute right-4 top-4 p-1 text-mutedGrey hover:text-charcoal hover:bg-sand-100 rounded-lg transition-colors"
              title="Close popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Header with Status Badge */}
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-forest-emerald/10 border border-forest-emerald/30 flex items-center justify-center text-forest-emerald shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1 pr-6">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-charcoal">Employee Created Successfully</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest-emerald/15 text-forest-emerald border border-forest-emerald/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-emerald mr-1 animate-pulse"></span>
                    Status: Employee Created
                  </span>
                </div>
                <p className="text-xs text-mutedGrey mt-0.5">
                  Personnel record registered in directory &amp; initial account credentials generated.
                </p>
              </div>
            </div>

            {/* Profile Summary Strip */}
            <div className="bg-sand-50/70 border border-warmGrey/60 rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-mutedGrey block">Employee Details</span>
                <span className="font-bold text-charcoal">{createdCredentials.fullName}</span>
                <span className="text-mutedGrey ml-1.5 font-mono text-[11px]">({createdCredentials.employeeCode})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-mutedGrey block">{createdCredentials.department}</span>
                <span className="text-navy font-semibold">{createdCredentials.designation}</span>
              </div>
            </div>

            {/* Credentials Handover Card */}
            <div className="rounded-xl border border-amber/35 bg-gradient-to-br from-amber-50/90 to-amber-100/40 p-4 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-amber" />
                  <span className="text-xs font-bold text-charcoal">Account Login Credentials</span>
                </div>
                <span className="rounded-full border border-amber/40 bg-white/90 px-2 py-0.5 text-[10px] font-bold text-amber shadow-2xs">
                  Owner Handover
                </span>
              </div>

              {/* Login Email */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-warmGrey/80 bg-white p-3 shadow-2xs">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey block">Authorized Login Email</span>
                  <p className="font-mono text-xs font-bold text-charcoal truncate mt-0.5 select-all">
                    {createdCredentials.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdCredentials.email);
                    showToast('Login email copied to clipboard', 'info');
                  }}
                  className="px-2.5 py-1.5 bg-sand-100 hover:bg-sand-200 text-navy text-[11px] font-semibold rounded-lg transition-colors flex items-center space-x-1 shrink-0"
                  title="Copy email address"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              {/* Generated Password */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-warmGrey/80 bg-white p-3 shadow-2xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey block">Auto-Generated Password</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-navy/10 text-navy">Generated</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-charcoal mt-0.5 select-all tracking-wider">
                    {showTemporaryPassword ? createdCredentials.temporaryPassword : '••••••••••••••••'}
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowTemporaryPassword(v => !v)}
                    className="p-1.5 text-navy hover:bg-sand-100 rounded-lg transition-colors"
                    title={showTemporaryPassword ? 'Hide password' : 'Show password'}
                  >
                    {showTemporaryPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.temporaryPassword);
                      showToast('Temporary password copied to clipboard', 'info');
                    }}
                    className="px-2.5 py-1.5 bg-navy hover:bg-navy-light text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center space-x-1"
                    title="Copy temporary password"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Copy All Button */}
              <button
                type="button"
                onClick={() => {
                  const handoverText = `SolarOS Account Credentials:\nName: ${createdCredentials.fullName} (${createdCredentials.employeeCode})\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}\nLogin Portal: https://solaros.sunpowersolutions.in/login\nNote: Please sign in and update your password under Profile Settings.`;
                  navigator.clipboard.writeText(handoverText);
                  showToast('Complete handover text copied to clipboard', 'success');
                }}
                className="w-full py-2 bg-white hover:bg-sand-50 text-navy text-xs font-semibold rounded-xl border border-warmGrey transition-colors flex items-center justify-center space-x-2"
              >
                <Copy className="w-3.5 h-3.5 text-navy" />
                <span>Copy Full Credentials Handover Message</span>
              </button>
            </div>

            {/* Security Note */}
            <div className="mt-4 flex items-start gap-2.5 p-2.5 rounded-xl bg-sand-50/80 border border-warmGrey/50 text-[11px] text-mutedGrey">
              <Shield className="w-4 h-4 text-navy shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This password has been cryptographically hashed with bcrypt and persisted to Supabase PostgreSQL. Provide these credentials securely to the employee; they will be prompted to reset their password upon initial session login.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 mt-4 border-t border-warmGrey/60">
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="px-5 py-2.5 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge &amp; Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {empToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-warmGrey relative">
            <button
              onClick={() => setEmpToDeactivate(null)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-3 text-terracotta">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-charcoal">Deactivate Employee</h3>
            </div>

            <p className="text-xs text-mutedGrey mb-4">
              Are you sure you want to deactivate <strong className="text-charcoal">{empToDeactivate.fullName}</strong> ({empToDeactivate.employeeCode})? Their system login and job allocation will be locked immediately.
            </p>

            <form onSubmit={confirmDeactivate} className="space-y-4 text-xs">
              <div>
                <label className="block text-mutedGrey font-medium mb-1">Reason for Deactivation</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Employment ended, administrative review, or extended medical leave..."
                  value={deactivationReason}
                  onChange={e => setDeactivationReason(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmpToDeactivate(null)}
                  className="px-4 py-2 border border-warmGrey rounded-xl font-semibold hover:bg-sand-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-terracotta text-white rounded-xl font-semibold hover:bg-rose-700 shadow-xs"
                >
                  Deactivate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={isEditEmpModalOpen}
        onClose={() => {
          setIsEditEmpModalOpen(false);
          setEmpToEdit(null);
        }}
        employee={empToEdit}
        onSave={async (id, updates) => {
          await updateEmployee(id, updates);
        }}
        departments={departments}
        allRoles={(rolesPermissions || []).map(r => ({ roleKey: r.roleKey, name: r.name }))}
      />

      {/* Promote Employee Modal */}
      <PromoteEmployeeModal
        isOpen={isPromoteEmpModalOpen}
        onClose={() => {
          setIsPromoteEmpModalOpen(false);
          setEmpToPromote(null);
        }}
        employee={empToPromote}
        onPromote={async (id, data) => {
          return await promoteEmployee(id, data);
        }}
        departments={departments}
        allRoles={(rolesPermissions || []).map(r => ({ roleKey: r.roleKey, name: r.name }))}
        allEmployees={employees}
      />

      {/* Transfer Employee Modal */}
      <TransferEmployeeModal
        isOpen={isTransferEmpModalOpen}
        onClose={() => {
          setIsTransferEmpModalOpen(false);
          setEmpToTransfer(null);
        }}
        employee={empToTransfer}
        onTransfer={async (id, data) => {
          return await executeDepartmentTransfer(id, data);
        }}
        departments={departments}
        allEmployees={employees}
      />

    </div>
  );
};
