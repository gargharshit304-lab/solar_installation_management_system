import React from 'react';
import { 
  Users, Calendar, Clock, Phone, CheckCircle2, 
  AlertCircle, Star, ArrowUpRight, Plus, MapPin, Wrench 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee, SiteSurvey, TechnicianAvailabilityStatus } from '../../types';

interface TechnicianAvailabilitySectionProps {
  onViewSchedule: (technician: Employee) => void;
  onAssignSurvey: (technician: Employee) => void;
}

const TIME_SLOTS = [
  '09:30 AM - 11:30 AM',
  '12:00 PM - 02:00 PM',
  '02:30 PM - 04:30 PM',
  '04:30 PM - 06:30 PM'
];

export const TechnicianAvailabilitySection: React.FC<TechnicianAvailabilitySectionProps> = ({
  onViewSchedule,
  onAssignSurvey
}) => {
  const { employees, surveys, technicianLeaves } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Survey technicians
  const technicians = employees.filter(
    e => e.role === 'survey_tech' || e.department === 'Field Engineering'
  );

  // Compute stats for each technician
  const technicianStats = technicians.map(tech => {
    // 1. Leave check today
    const activeLeave = technicianLeaves.find(l => 
      l.technicianId === tech.id &&
      l.status === 'approved' &&
      todayStr >= l.startDate && todayStr <= l.endDate
    );

    // 2. Surveys today
    const surveysToday = surveys.filter(s => 
      s.technicianId === tech.id &&
      s.scheduledDate.startsWith(todayStr) &&
      s.status !== 'cancelled' && s.status !== 'rejected'
    );

    // 3. Active in-progress survey right now
    const hasActiveSurveyOnSite = surveysToday.some(s => s.status === 'in_progress');

    // 4. Upcoming assigned jobs (from tomorrow onwards)
    const upcomingSurveys = surveys.filter(s => 
      s.technicianId === tech.id &&
      s.scheduledDate.split('T')[0] > todayStr &&
      s.status !== 'cancelled' && s.status !== 'rejected'
    );

    // 5. Compute availability status
    let status: TechnicianAvailabilityStatus = 'available';
    if (activeLeave) {
      status = 'on_leave';
    } else if (hasActiveSurveyOnSite) {
      status = 'on_site';
    } else if (surveysToday.length >= 3) {
      status = 'unavailable';
    } else if (surveysToday.length >= 1) {
      status = 'assigned';
    } else {
      status = 'available';
    }

    // 6. Next Available Slot
    let nextAvailableSlot = 'Today 09:30 AM';
    if (activeLeave) {
      nextAvailableSlot = `On Leave until ${activeLeave.endDate}`;
    } else {
      // Find first unbooked slot today
      const bookedSlotsToday = new Set(surveysToday.map(s => s.timeSlot));
      const freeSlotToday = TIME_SLOTS.find(slot => !bookedSlotsToday.has(slot));

      if (freeSlotToday) {
        nextAvailableSlot = `Today ${freeSlotToday.split(' - ')[0]}`;
      } else {
        nextAvailableSlot = 'Tomorrow 09:30 AM';
      }
    }

    return {
      tech,
      status,
      surveysTodayCount: surveysToday.length,
      upcomingCount: upcomingSurveys.length,
      nextAvailableSlot,
      activeLeave
    };
  });

  return (
    <div id="survey-technicians-section" className="space-y-3.5 scroll-mt-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-charcoal tracking-tight">
              Survey Technician Availability
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sand-200 text-charcoal">
              {technicians.length} Specialists
            </span>
          </div>
          <p className="text-xs text-mutedGrey">
            View your survey team's workload and assign technicians based on their schedules.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center space-x-2 text-[11px] shrink-0 font-medium">
          <span className="inline-flex items-center text-sage">
            <span className="w-2 h-2 rounded-full bg-sage mr-1" />
            Available
          </span>
          <span className="inline-flex items-center text-navy">
            <span className="w-2 h-2 rounded-full bg-navy mr-1" />
            On Site
          </span>
          <span className="inline-flex items-center text-amber">
            <span className="w-2 h-2 rounded-full bg-amber mr-1" />
            Assigned
          </span>
          <span className="inline-flex items-center text-terracotta">
            <span className="w-2 h-2 rounded-full bg-terracotta mr-1" />
            On Leave
          </span>
        </div>
      </div>

      {/* Technicians Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey/80">
              <tr>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Today's Assignments</th>
                <th className="py-3 px-4">Upcoming Jobs</th>
                <th className="py-3 px-4">Next Available Slot</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {technicianStats.map(({ tech, status, surveysTodayCount, upcomingCount, nextAvailableSlot }) => {
                
                // Status badge configuration
                const statusConfig = {
                  available: { label: 'Available', bg: 'bg-sage-50', text: 'text-sage', border: 'border-sage/40' },
                  assigned: { label: 'Assigned', bg: 'bg-amber-50', text: 'text-amber', border: 'border-amber/40' },
                  on_site: { label: 'On Site', bg: 'bg-navy/10', text: 'text-navy', border: 'border-navy/30' },
                  unavailable: { label: 'Max Workload', bg: 'bg-sand-200/70', text: 'text-mutedGrey', border: 'border-warmGrey' },
                  on_leave: { label: 'On Leave', bg: 'bg-terracotta-50', text: 'text-terracotta', border: 'border-terracotta/40' }
                }[status];

                return (
                  <tr key={tech.id} className="hover:bg-sand-50/70 transition-colors">
                    
                    {/* Technician Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-sand-200 text-charcoal flex items-center justify-center font-bold text-xs shrink-0">
                          {tech.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-charcoal">{tech.fullName}</span>
                            <span className="flex items-center text-[10px] font-semibold text-amber bg-amber-50 px-1 py-0.2 rounded border border-amber/20">
                              <Star className="w-2.5 h-2.5 fill-amber mr-0.5" />
                              {tech.rating}
                            </span>
                          </div>
                          <p className="text-[11px] text-mutedGrey">{tech.designation}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-navy font-semibold">
                      {tech.phone}
                    </td>

                    {/* Availability Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          status === 'available' ? 'bg-sage' :
                          status === 'on_site' ? 'bg-navy' :
                          status === 'assigned' ? 'bg-amber' :
                          status === 'on_leave' ? 'bg-terracotta' : 'bg-mutedGrey'
                        }`} />
                        {statusConfig.label}
                      </span>
                    </td>

                    {/* Today's Assignments */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-bold ${surveysTodayCount > 0 ? 'text-charcoal' : 'text-mutedGrey'}`}>
                          {surveysTodayCount} survey{surveysTodayCount === 1 ? '' : 's'}
                        </span>
                        {surveysTodayCount > 0 && (
                          <span className="text-[10px] text-mutedGrey">today</span>
                        )}
                      </div>
                    </td>

                    {/* Upcoming Jobs */}
                    <td className="py-3.5 px-4 font-semibold text-charcoal">
                      {upcomingCount} assigned
                    </td>

                    {/* Next Available Slot */}
                    <td className="py-3.5 px-4 font-medium text-navy">
                      <span className="px-2 py-0.5 rounded-lg bg-sand-100/80 border border-warmGrey/60 text-[11px]">
                        {nextAvailableSlot}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => onViewSchedule(tech)}
                        className="px-2.5 py-1 bg-white border border-warmGrey text-charcoal text-xs font-semibold rounded-lg hover:bg-sand-100 transition-colors shadow-2xs"
                      >
                        View Schedule
                      </button>

                      {status !== 'on_leave' && (
                        <button
                          type="button"
                          onClick={() => onAssignSurvey(tech)}
                          className="px-2.5 py-1 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-2xs"
                        >
                          Assign Survey
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
