import React, { useState, useEffect } from 'react';
import { X, Check, UserCheck, ShieldCheck, Mail, Phone, MapPin, Briefcase, Award, AlertCircle } from 'lucide-react';
import { Employee, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (id: string, updates: Partial<Employee>) => Promise<void>;
  departments: { id: string; name: string }[];
  allRoles: { roleKey: string; name: string }[];
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

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
  departments,
  allRoles
}) => {
  const { showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [team, setTeam] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<UserRole>('install_tech');
  const [hourlyRate, setHourlyRate] = useState<number>(250);
  const [skills, setSkills] = useState('');
  const [employmentType, setEmploymentType] = useState<'full_time' | 'contract' | 'part_time'>('full_time');
  const [workLocation, setWorkLocation] = useState('Pune Central HQ');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'on_leave' | 'inactive'>('active');

  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'emergency'>('personal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFullName(employee.fullName || '');
      setEmail(employee.email || '');
      setPhone(employee.phone || '');
      setDepartment(employee.department || 'Operations & Installations');
      setTeam(employee.team || employee.teamName || '');
      setDesignation(employee.designation || '');
      setRole(employee.role || 'install_tech');
      setHourlyRate(employee.hourlyRate || 250);
      setSkills(Array.isArray(employee.skills) ? employee.skills.join(', ') : '');
      setEmploymentType(employee.employmentType || 'full_time');
      setWorkLocation(employee.workLocation || 'Pune Central HQ');
      setAddress(employee.address || '');
      setEmergencyName(employee.emergencyContact?.name || '');
      setEmergencyRelation(employee.emergencyContact?.relation || '');
      setEmergencyPhone(employee.emergencyContact?.phone || '');
      setStatus(employee.status || 'active');
      setErrors({});
    }
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const availableTeams = DEPARTMENT_TEAMS[department] || [
    'General Technical Crew',
    'Field Operations',
    'Project Engineering'
  ];

  const handleValidate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) errs.fullName = 'Full legal name is required (min 2 chars)';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid corporate or personal email is required';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) errs.phone = 'Valid 8+ digit phone number is required';
    if (!designation.trim()) errs.designation = 'Designation is required';
    if (hourlyRate < 0) errs.hourlyRate = 'Hourly rate cannot be negative';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate()) {
      showToast('Please correct validation errors before saving.', 'error');
      return;
    }

    setIsSubmitting(true);
    const parsedSkills = skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      await onSave(employee.id, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department,
        team,
        teamName: team,
        designation: designation.trim(),
        role,
        hourlyRate: Number(hourlyRate),
        skills: parsedSkills,
        employmentType,
        workLocation,
        address: address.trim(),
        emergencyContact: (emergencyName.trim() || emergencyPhone.trim()) ? {
          name: emergencyName.trim(),
          relation: emergencyRelation.trim(),
          phone: emergencyPhone.trim()
        } : undefined,
        status,
        isAvailable: status === 'active'
      });
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update employee details', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-warmGrey relative animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-warmGrey/60 flex items-start justify-between bg-sand-50/50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-navy/10 border border-navy/20 flex items-center justify-center text-navy shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg text-charcoal">Edit Employee Profile</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-sand-200 text-charcoal font-semibold border border-warmGrey/60">
                  {employee.employeeCode}
                </span>
              </div>
              <p className="text-xs text-mutedGrey mt-0.5">
                Update personal information, security authorization, functional assignment and contact records.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-mutedGrey hover:text-charcoal hover:bg-sand-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-5 pt-3 border-b border-warmGrey/60 bg-sand-50/30 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`py-2 px-3.5 font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'personal'
                ? 'border-navy text-navy bg-white shadow-2xs'
                : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            Personal & Identity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('employment')}
            className={`py-2 px-3.5 font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'employment'
                ? 'border-navy text-navy bg-white shadow-2xs'
                : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            Employment & Role
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`py-2 px-3.5 font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'emergency'
                ? 'border-navy text-navy bg-white shadow-2xs'
                : 'border-transparent text-mutedGrey hover:text-charcoal'
            }`}
          >
            Emergency & Address
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: PERSONAL & IDENTITY */}
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Deshmukh"
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:border-navy focus:outline-hidden"
                />
                {errors.fullName && <p className="text-[11px] text-terracotta mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Corporate Email Address *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. ramesh.d@sunpowersolutions.in"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-warmGrey rounded-lg focus:border-navy focus:outline-hidden"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-terracotta mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Contact Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98220 00000"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-warmGrey rounded-lg focus:border-navy focus:outline-hidden"
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-terracotta mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Core Technical Competencies / Skills</label>
                <input
                  type="text"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g. String Inverters, Rooftop Survey, Shadow Modeling, Commissioning (comma-separated)"
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:border-navy focus:outline-hidden"
                />
                <p className="text-[10px] text-mutedGrey mt-1">Separate competencies with commas for tag rendering.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Duty Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                >
                  <option value="active">Active on Duty</option>
                  <option value="on_leave">On Leave / Absent</option>
                  <option value="inactive">Suspended / Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: EMPLOYMENT & ROLE */}
          {activeTab === 'employment' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Department *</label>
                  <select
                    value={department}
                    onChange={e => {
                      const newDept = e.target.value;
                      setDepartment(newDept);
                      const teamsForDept = DEPARTMENT_TEAMS[newDept] || [];
                      if (teamsForDept.length > 0) setTeam(teamsForDept[0]);
                    }}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Functional Team</label>
                  <select
                    value={team}
                    onChange={e => setTeam(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                  >
                    {availableTeams.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Designation / Title *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Solar Technical Surveyor"
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:border-navy focus:outline-hidden"
                  />
                  {errors.designation && <p className="text-[11px] text-terracotta mt-1">{errors.designation}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">System Security Role *</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white font-semibold text-navy"
                  >
                    {allRoles.map(r => (
                      <option key={r.roleKey} value={r.roleKey}>
                        {r.name} ({r.roleKey})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Hourly Billing Rate (₹/hr)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-mutedGrey">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={hourlyRate}
                      onChange={e => setHourlyRate(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 text-xs border border-warmGrey rounded-lg font-mono font-bold"
                    />
                  </div>
                  {errors.hourlyRate && <p className="text-[11px] text-terracotta mt-1">{errors.hourlyRate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={e => setEmploymentType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                  >
                    <option value="full_time">Full-Time Permanent</option>
                    <option value="contract">Fixed-Term Contract</option>
                    <option value="part_time">Part-Time / Retainer</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-charcoal mb-1">Work Location / Base Station</label>
                  <input
                    type="text"
                    value={workLocation}
                    onChange={e => setWorkLocation(e.target.value)}
                    placeholder="e.g. Pune Central HQ / Chhatrapati Sambhajinagar Depot"
                    className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMERGENCY CONTACT & RESIDENTIAL ADDRESS */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="House/Flat number, Building, Street, City, State, PIN code"
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
                />
              </div>

              <div className="p-3.5 bg-sand-50/70 border border-warmGrey/60 rounded-xl space-y-3">
                <span className="text-xs font-bold text-charcoal block">Emergency Contact Person</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-mutedGrey mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={e => setEmergencyName(e.target.value)}
                      placeholder="e.g. Sunita Deshmukh"
                      className="w-full px-2.5 py-1.5 text-xs border border-warmGrey rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-mutedGrey mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={e => setEmergencyRelation(e.target.value)}
                      placeholder="e.g. Spouse / Father"
                      className="w-full px-2.5 py-1.5 text-xs border border-warmGrey rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-mutedGrey mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={e => setEmergencyPhone(e.target.value)}
                      placeholder="+91 94220 00000"
                      className="w-full px-2.5 py-1.5 text-xs border border-warmGrey rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

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
                <span>Updating Profile...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Employee Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
