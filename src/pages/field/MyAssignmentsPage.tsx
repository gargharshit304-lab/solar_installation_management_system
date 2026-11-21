import React, { useState } from 'react';
import { 
  ClipboardList, Search, Filter, Calendar, Clock, 
  MapPin, Phone, Eye, Play, FileText, CheckCircle2, 
  AlertTriangle, ArrowRight, Compass, Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiteSurvey, SurveyStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SiteSurveyWorkspaceModal } from '../../components/field/SiteSurveyWorkspaceModal';
import { Link } from 'react-router-dom';

export const MyAssignmentsPage: React.FC = () => {
  const { currentUser, surveys } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'in_progress' | 'completed' | 'submitted'>('all');
  const [selectedSurveyForWorkspace, setSelectedSurveyForWorkspace] = useState<SiteSurvey | null>(null);

  // Filter surveys assigned to current engineer
  const mySurveys = surveys.filter(s => 
    !s.technicianName || 
    s.technicianName.includes(currentUser.name.split(' ')[0]) || 
    s.technicianId === currentUser.id ||
    currentUser.role === 'owner_admin'
  );

  // Tab filtering
  const filteredSurveys = mySurveys.filter(s => {
    // Search
    const term = searchQuery.toLowerCase();
    const matchesSearch = s.surveyNumber.toLowerCase().includes(term) ||
      s.customerName.toLowerCase().includes(term) ||
      s.customerAddress.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return s.status === 'scheduled' || s.status === 'assigned';
    if (activeTab === 'in_progress') return s.status === 'in_progress';
    if (activeTab === 'completed') return s.status === 'approved';
    if (activeTab === 'submitted') return s.status === 'submitted';
    return true;
  });

  const cardContainerClass = "bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all duration-200";

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`${cardContainerClass} p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div>
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-navy" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              Field Engineer Assignments
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            My Site Survey Assignments
          </h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            All rooftop survey appointments and feasibility evaluations allocated to you ({mySurveys.length} total records).
          </p>
        </div>

        <Link
          to="/field/available-surveys"
          className="px-4 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light flex items-center space-x-2 shadow-sm shrink-0"
        >
          <Compass className="w-4 h-4 text-amber" />
          <span>Claim Available Surveys</span>
        </Link>
      </div>

      {/* Tabs and Search Controls */}
      <div className={`${cardContainerClass} p-5 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Subtabs */}
          <div className="flex space-x-1.5 border-b border-warmGrey/60 pb-1 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'all' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              All ({mySurveys.length})
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'upcoming' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Upcoming ({mySurveys.filter(s => s.status === 'scheduled' || s.status === 'assigned').length})
            </button>

            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'in_progress' ? 'bg-amber text-charcoal' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              In Progress ({mySurveys.filter(s => s.status === 'in_progress').length})
            </button>

            <button
              onClick={() => setActiveTab('submitted')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'submitted' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Submitted ({mySurveys.filter(s => s.status === 'submitted').length})
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors ${
                activeTab === 'completed' ? 'bg-sage text-white' : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              Approved ({mySurveys.filter(s => s.status === 'approved').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72 text-xs">
            <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search survey #, customer, address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>

        {/* Table of Assignments */}
        <div className="overflow-x-auto border border-warmGrey/60 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-2.5 px-3">Survey ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Site Location</th>
                <th className="py-2.5 px-3">Appointment Slot</th>
                <th className="py-2.5 px-3">Shadow-Free Area</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-mutedGrey">
                    No survey assignments found for this tab.
                  </td>
                </tr>
              ) : (
                filteredSurveys.map(s => (
                  <tr 
                    key={s.id} 
                    className="hover:bg-sand-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedSurveyForWorkspace(s)}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-navy">
                      {s.surveyNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-charcoal">{s.customerName}</div>
                      <div className="text-[11px] text-mutedGrey">{s.customerPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate">
                      {s.customerAddress}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-charcoal">{new Date(s.scheduledDate).toLocaleDateString()}</div>
                      <div className="text-[11px] text-mutedGrey">{s.timeSlot || '10:00 AM - 12:00 PM'}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {s.shadowFreeAreaSqm ? (
                        <span className="font-bold text-navy">{s.shadowFreeAreaSqm} sq.m</span>
                      ) : (
                        <span className="text-mutedGrey italic">Pending measurement</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedSurveyForWorkspace(s)}
                        className="px-2.5 py-1 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors"
                      >
                        {s.status === 'in_progress' ? 'Continue' : s.status === 'approved' ? 'View' : 'Open'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Site Survey Technical Workspace Modal */}
      {selectedSurveyForWorkspace && (
        <SiteSurveyWorkspaceModal
          survey={selectedSurveyForWorkspace}
          isOpen={!!selectedSurveyForWorkspace}
          onClose={() => setSelectedSurveyForWorkspace(null)}
        />
      )}

    </div>
  );
};
