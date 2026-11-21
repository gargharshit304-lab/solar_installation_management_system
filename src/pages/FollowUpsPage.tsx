import React, { useState } from 'react';
import { 
  CalendarClock, Search, Plus, Phone, Check, Clock, 
  Calendar, AlertCircle, Filter, ArrowRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FollowUpItem, Customer } from '../types';
import { ScheduleFollowUpModal } from '../components/sales/ScheduleFollowUpModal';
import { SalesCustomerProfileModal } from '../components/sales/SalesCustomerProfileModal';

export const FollowUpsPage: React.FC = () => {
  const { 
    followUps, 
    customers, 
    completeFollowUp, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming' | 'completed'>('overdue');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [rescheduleItem, setRescheduleItem] = useState<FollowUpItem | null>(null);
  const [selectedCustomerForProfile, setSelectedCustomerForProfile] = useState<Customer | null>(null);

  const overdueList = followUps.filter(f => f.status === 'overdue');
  const todayList = followUps.filter(f => {
    if (f.status === 'completed') return false;
    const isToday = f.scheduledDate.startsWith(new Date().toISOString().split('T')[0]);
    return isToday || f.status === 'pending';
  });
  const upcomingList = followUps.filter(f => f.status === 'pending' || f.status === 'rescheduled');
  const completedList = followUps.filter(f => f.status === 'completed');

  const getActiveList = () => {
    switch (activeTab) {
      case 'overdue': return overdueList;
      case 'today': return todayList;
      case 'upcoming': return upcomingList;
      case 'completed': return completedList;
      default: return followUps;
    }
  };

  const filteredItems = getActiveList().filter(f => {
    const term = searchTerm.toLowerCase();
    return f.customerName.toLowerCase().includes(term) ||
           f.customerPhone.includes(term) ||
           f.customerCity.toLowerCase().includes(term) ||
           f.followUpReason.toLowerCase().includes(term);
  });

  const handleCall = (phone: string, name: string) => {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
    showToast(`Calling ${name} at ${phone}`, 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Sales Follow-Up Coordination</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Scheduled callbacks, quotation negotiations & client retention agendas
          </p>
        </div>
        <button
          onClick={() => {
            setRescheduleItem(null);
            setIsScheduleModalOpen(true);
          }}
          className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule Follow-up</span>
        </button>
      </div>

      {/* Agenda Tabs & Search Controls */}
      <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'overdue' 
                ? 'bg-terracotta text-white shadow-xs' 
                : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey'
            }`}
          >
            <span>Overdue</span>
            {overdueList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-terracotta text-[10px] font-bold flex items-center justify-center">
                {overdueList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'today' 
                ? 'bg-amber text-charcoal shadow-xs' 
                : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey'
            }`}
          >
            <span>Today's Callbacks</span>
            {todayList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-charcoal text-white text-[10px] font-bold flex items-center justify-center">
                {todayList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'upcoming' 
                ? 'bg-navy text-white shadow-xs' 
                : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey'
            }`}
          >
            Upcoming Agenda
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'completed' 
                ? 'bg-sage text-white shadow-xs' 
                : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey'
            }`}
          >
            Completed History
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customer, phone or city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>
      </div>

      {/* Follow-ups Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Customer & City</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Follow-Up Objective</th>
                <th className="py-3 px-4">Scheduled Date & Time</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-sand-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => {
                        const c = customers.find(x => x.id === item.customerId);
                        if (c) setSelectedCustomerForProfile(c);
                      }}
                      className="font-bold text-navy hover:underline text-left"
                    >
                      {item.customerName}
                    </button>
                    <div className="text-[11px] text-mutedGrey">{item.customerCity}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-charcoal">
                    {item.customerPhone}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="font-medium text-charcoal leading-snug">{item.followUpReason}</p>
                    {item.completionNotes && (
                      <p className="text-[10px] text-sage font-medium mt-0.5">Note: {item.completionNotes}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal font-medium">
                    {new Date(item.scheduledDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.priority === 'urgent' ? 'bg-terracotta text-white' :
                      item.priority === 'high' ? 'bg-amber text-charcoal' : 'bg-sand-200 text-charcoal'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'overdue' ? 'bg-terracotta text-white' :
                      item.status === 'completed' ? 'bg-sage text-white' : 'bg-amber-50 text-amber border border-amber/30'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {item.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => handleCall(item.customerPhone, item.customerName)}
                          className="px-2 py-1 rounded-lg bg-sand-100 hover:bg-navy hover:text-white text-navy font-semibold text-xs border border-warmGrey transition-colors inline-flex items-center space-x-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </button>

                        <button
                          onClick={() => {
                            setRescheduleItem(item);
                            setIsScheduleModalOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-sand-100 hover:bg-amber hover:text-white text-charcoal font-semibold text-xs border border-warmGrey transition-colors"
                        >
                          Reschedule
                        </button>

                        <button
                          onClick={() => completeFollowUp(item.id, 'Customer call completed; requirements aligned.')}
                          className="px-2.5 py-1 rounded-lg bg-sage hover:bg-sage-dark text-white font-semibold text-xs transition-colors inline-flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ScheduleFollowUpModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setRescheduleItem(null);
        }}
        existingFollowUpId={rescheduleItem?.id}
        isReschedule={!!rescheduleItem}
      />

      {selectedCustomerForProfile && (
        <SalesCustomerProfileModal
          customer={selectedCustomerForProfile}
          onClose={() => setSelectedCustomerForProfile(null)}
        />
      )}

    </div>
  );
};
