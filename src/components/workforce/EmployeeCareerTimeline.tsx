import React, { useState, useEffect } from 'react';
import { 
  Award, ArrowRightLeft, UserCheck, ShieldCheck, 
  Calendar, CheckCircle2, History, ChevronRight, Clock 
} from 'lucide-react';
import { EmployeeCareerHistoryEvent } from '../../types';
import { employeeApi } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface EmployeeCareerTimelineProps {
  employeeId: string;
  employeeName: string;
}

export const EmployeeCareerTimeline: React.FC<EmployeeCareerTimelineProps> = ({
  employeeId,
  employeeName
}) => {
  const { session } = useApp();
  const [history, setHistory] = useState<EmployeeCareerHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    employeeApi.getCareerHistory(employeeId, session?.token)
      .then(res => {
        if (!isMounted) return;
        if (Array.isArray(res)) setHistory(res);
        else if (Array.isArray((res as any)?.data)) setHistory((res as any).data);
        else setHistory([]);
      })
      .catch(err => {
        console.warn('Failed to fetch career timeline:', err);
        if (isMounted) setHistory([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [employeeId, session?.token]);

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-mutedGrey space-y-2">
        <Clock className="w-5 h-5 mx-auto text-mutedGrey animate-spin" />
        <span>Loading career history from PostgreSQL...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-mutedGrey bg-sand-50/50 rounded-xl border border-warmGrey/40 p-5 space-y-2">
        <History className="w-6 h-6 mx-auto text-mutedGrey/60" />
        <span className="font-semibold text-charcoal block">No Career Milestone Events Logged</span>
        <span className="block text-[11px] text-mutedGrey max-w-sm mx-auto">
          Promotions, department reallocations, and title advancements recorded for {employeeName} will appear on this chronological timeline.
        </span>
      </div>
    );
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'promotion':
        return {
          label: 'Promotion',
          color: 'bg-amber-100 text-amber border-amber/30',
          icon: <Award className="w-3.5 h-3.5 text-amber" />
        };
      case 'department_transfer':
        return {
          label: 'Department Transfer',
          color: 'bg-navy/10 text-navy border-navy/20',
          icon: <ArrowRightLeft className="w-3.5 h-3.5 text-navy" />
        };
      case 'hire':
      default:
        return {
          label: 'Initial Onboarding',
          color: 'bg-forest-emerald/15 text-forest-emerald border-forest-emerald/30',
          icon: <UserCheck className="w-3.5 h-3.5 text-forest-emerald" />
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-mutedGrey pb-1 border-b border-warmGrey/40">
        <span>Chronological career progression &amp; internal mobility events</span>
        <span className="font-mono text-[11px] font-semibold">{history.length} Milestones</span>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-warmGrey/60">
        {history.map((event, idx) => {
          const badge = getEventBadge(event.eventType);
          const formattedDate = new Date(event.effectiveDate || event.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return (
            <div key={event.id || idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-navy shadow-xs group-hover:scale-125 transition-transform"></div>

              {/* Card */}
              <div className="bg-sand-50/70 hover:bg-sand-50 p-4 rounded-xl border border-warmGrey/60 transition-colors space-y-2.5 text-xs">
                
                {/* Milestone Top Strip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                    <span className="font-semibold text-charcoal">
                      {event.newDesignation || event.previousDesignation}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-mutedGrey flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </span>
                </div>

                {/* Event Details Diffs */}
                {event.eventType === 'promotion' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-warmGrey/40">
                    <div>
                      <span className="text-mutedGrey block text-[10px]">Title Advancement:</span>
                      <span className="text-mutedGrey line-through">{event.previousDesignation}</span>
                      <span className="font-bold text-charcoal ml-1.5">→ {event.newDesignation}</span>
                    </div>
                    {event.newHourlyRate && event.previousHourlyRate !== undefined && (
                      <div>
                        <span className="text-mutedGrey block text-[10px]">Hourly Billing Rate:</span>
                        <span className="text-mutedGrey font-mono line-through">₹{event.previousHourlyRate}/hr</span>
                        <span className="font-bold font-mono text-forest-emerald ml-1.5">→ ₹{event.newHourlyRate}/hr</span>
                      </div>
                    )}
                  </div>
                )}

                {event.eventType === 'department_transfer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-warmGrey/40">
                    <div>
                      <span className="text-mutedGrey block text-[10px]">Department Reallocation:</span>
                      <span className="text-mutedGrey line-through">{event.previousDepartment}</span>
                      <span className="font-bold text-navy ml-1.5">→ {event.newDepartment}</span>
                    </div>
                    {event.newTeam && (
                      <div>
                        <span className="text-mutedGrey block text-[10px]">Functional Team:</span>
                        <span className="font-semibold text-charcoal">{event.newTeam}</span>
                      </div>
                    )}
                  </div>
                )}

                {event.eventType === 'hire' && (
                  <div className="text-[11px] bg-white p-2.5 rounded-lg border border-warmGrey/40">
                    <span className="text-mutedGrey block text-[10px]">Assigned Division &amp; Designation:</span>
                    <span className="font-bold text-charcoal">{event.newDesignation}</span>
                    <span className="text-mutedGrey"> in {event.newDepartment}</span>
                  </div>
                )}

                {/* Reason & Attribution */}
                {event.reason && (
                  <div className="text-[11px] text-charcoal">
                    <span className="font-semibold text-mutedGrey">Justification: </span>
                    <span>{event.reason}</span>
                  </div>
                )}

                {event.notes && (
                  <div className="text-[11px] text-mutedGrey italic bg-sand-100/40 p-2 rounded border border-warmGrey/30">
                    "{event.notes}"
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-mutedGrey pt-1 border-t border-warmGrey/40">
                  <span>Authorized By: <strong className="text-charcoal">{event.authorizedByName || 'Administrator'}</strong></span>
                  {event.reportingManagerName && (
                    <span>Reporting To: <strong className="text-charcoal">{event.reportingManagerName}</strong></span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
