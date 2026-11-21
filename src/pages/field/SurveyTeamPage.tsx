import React, { useState } from 'react';
import { 
  Users, UserCheck, Phone, Mail, Calendar, Compass, 
  Clock, Shield, Check, AlertCircle, ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { Link } from 'react-router-dom';

export const SurveyTeamPage: React.FC = () => {
  const { currentUser, employees, surveys } = useApp();

  // Filter survey team
  const surveyTeam = employees.filter(e => e.department === 'Field Engineering' || e.role === 'survey_tech');

  const cardContainerClass = "bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all duration-200";

  const isChiefOrAdmin = currentUser.isChiefSurveySpecialist || currentUser.canAssignSurveys || currentUser.role === 'owner_admin';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`${cardContainerClass} p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-navy" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              Field Engineering Department
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            Site Survey Team Directory
          </h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Active certified rooftop survey specialists, technical competencies, and real-time field availability.
          </p>
        </div>

        {isChiefOrAdmin && (
          <Link
            to="/field/available-surveys"
            className="px-4 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light flex items-center space-x-2 shadow-sm shrink-0"
          >
            <Compass className="w-4 h-4 text-amber" />
            <span>Manage Team Allocations</span>
          </Link>
        )}
      </div>

      {/* Permissions Context Banner */}
      <div className="p-4 bg-sand-100 rounded-xl border border-warmGrey text-xs text-charcoal flex items-start space-x-3">
        <Shield className="w-5 h-5 text-navy shrink-0 mt-0.5" />
        <div>
          <strong className="text-charcoal block">Team Role & Permission Policy:</strong>
          <span className="text-mutedGrey leading-relaxed">
            {isChiefOrAdmin 
              ? 'You have Chief Survey Specialist privileges. You can reassign surveys, view team schedules, and balance technical workloads across engineers.'
              : 'You have Specialist View access. You can view colleagues in your field division. Survey allocations and reassignments are managed by the Chief Survey Specialist.'}
          </span>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {surveyTeam.map(tech => {
          // Calculate active surveys for this tech
          const techSurveys = surveys.filter(s => 
            s.technicianId === tech.id || 
            (s.technicianName && s.technicianName.includes(tech.fullName.split(' ')[0]))
          );
          const activeJobs = techSurveys.filter(s => s.status === 'assigned' || s.status === 'in_progress').length;
          const completedJobs = techSurveys.filter(s => s.status === 'approved').length;

          return (
            <div key={tech.id} className={`${cardContainerClass} p-5 flex flex-col justify-between space-y-4`}>
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">{tech.fullName}</h3>
                    <p className="text-xs text-navy font-semibold">{tech.designation}</p>
                    <span className="font-mono text-[10px] text-mutedGrey">{tech.employeeCode}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    tech.isAvailable 
                      ? 'bg-sage-50 text-sage border border-sage/30' 
                      : 'bg-amber-50 text-amber border border-amber/30'
                  }`}>
                    {tech.isAvailable ? 'Available' : 'On Site'}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-mutedGrey">
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-navy" />
                    <span>{tech.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber" />
                    <span className="truncate">{tech.email}</span>
                  </div>
                </div>

                {/* Skills tags */}
                {tech.skills && tech.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tech.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-sand-100 text-[10px] font-medium text-charcoal border border-warmGrey/60">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Workload Stats */}
              <div className="pt-3 border-t border-warmGrey/60 grid grid-cols-2 text-center text-xs">
                <div className="border-r border-warmGrey/60 pr-2">
                  <span className="text-[10px] text-mutedGrey">Active Visits</span>
                  <p className="text-base font-bold text-navy mt-0.5">{activeJobs}</p>
                </div>
                <div className="pl-2">
                  <span className="text-[10px] text-mutedGrey">Approved Surveys</span>
                  <p className="text-base font-bold text-sage mt-0.5">{completedJobs}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
