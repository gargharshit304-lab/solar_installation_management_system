import React, { useState } from 'react';
import { 
  UserCheck, Search, Filter, Phone, Mail, Award, 
  Clock, CheckCircle2, XCircle, Star, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Employee } from '../types';

export const WorkforcePage: React.FC = () => {
  const { employees, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = emp.fullName.toLowerCase().includes(term) ||
                          emp.employeeCode.toLowerCase().includes(term) ||
                          emp.skills.some(s => s.toLowerCase().includes(term));
    const matchesDept = deptFilter === 'all' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Workforce & Technician Management</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            15 field technicians & engineering specialists managing 40 rooftop solar installations every month
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search technician name, code, or technical skills..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal"
          >
            <option value="all">All Departments</option>
            <option value="Operations">Operations & Installations</option>
            <option value="Field Engineering">Field Engineering</option>
            <option value="Sales">Sales & CRM</option>
            <option value="Warehouse">Warehouse & Logistics</option>
            <option value="Customer Support">After-Sales & Warranty</option>
            <option value="Finance">Finance & Accounts</option>
          </select>
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map(emp => (
          <div key={emp.id} className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-charcoal">{emp.fullName}</h3>
                  <span className="text-[11px] font-mono text-mutedGrey">{emp.employeeCode} • {emp.designation}</span>
                </div>
                <div className="flex items-center space-x-1 text-amber text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{emp.rating}</span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-mutedGrey">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-navy" />
                  <span className="text-charcoal">{emp.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-navy" />
                  <span className="truncate">{emp.email}</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey block mb-1.5">
                  Core Technical Skills:
                </span>
                <div className="flex flex-wrap gap-1">
                  {emp.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-sand-100 text-[10px] font-medium text-charcoal border border-warmGrey/60">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-warmGrey/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${emp.isAvailable ? 'bg-sage' : 'bg-amber'}`} />
                <span className="font-medium text-charcoal">
                  {emp.isAvailable ? 'Available for Dispatch' : `${emp.activeJobs} Jobs Active`}
                </span>
              </div>
              <span className="font-bold text-navy">₹{emp.hourlyRate}/hr</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
