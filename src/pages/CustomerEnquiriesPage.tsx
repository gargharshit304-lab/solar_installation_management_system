import React, { useState } from 'react';
import { 
  UserPlus, Search, Filter, Plus, Phone, Mail, 
  MapPin, Download, Eye, CalendarClock, ArrowRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, CustomerEnquiry } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CreateEnquiryModal } from '../components/sales/CreateEnquiryModal';
import { SalesCustomerProfileModal } from '../components/sales/SalesCustomerProfileModal';
import { ScheduleFollowUpModal } from '../components/sales/ScheduleFollowUpModal';

export const CustomerEnquiriesPage: React.FC = () => {
  const { 
    enquiries, 
    customers, 
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomerForProfile, setSelectedCustomerForProfile] = useState<Customer | null>(null);
  const [followUpTarget, setFollowUpTarget] = useState<Customer | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  const filteredEnquiries = enquiries.filter(enq => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = enq.customerName.toLowerCase().includes(term) ||
                          enq.customerPhone.includes(term) ||
                          enq.enquiryNumber.toLowerCase().includes(term) ||
                          enq.customerCity.toLowerCase().includes(term);
    const matchesSource = sourceFilter === 'all' || enq.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || enq.leadStatus === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const exportCSV = () => {
    const headers = 'Enquiry #,Customer,Phone,City,Capacity (kW),Type,Source,Status,Received Date\n';
    const rows = filteredEnquiries.map(e => 
      `"${e.enquiryNumber}","${e.customerName}","${e.customerPhone}","${e.customerCity}",${e.interestedCapacityKw},"${e.preferredSystemType}","${e.source}","${e.leadStatus}","${e.receivedDate}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SolarOS_Enquiries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Enquiries exported to CSV', 'info');
  };

  const handleOpenCustomer = (customerId: string) => {
    const c = customers.find(x => x.id === customerId);
    if (c) setSelectedCustomerForProfile(c);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Customer Enquiries Queue</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Incoming solar inquiries across Website forms, WhatsApp leads, phone calls & walk-ins
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5 text-navy" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Enquiry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search enquiry #, customer or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-warmGrey rounded-lg bg-white text-charcoal"
          >
            <option value="all">All Inbound Sources</option>
            <option value="website">Website Form</option>
            <option value="whatsapp">WhatsApp Integration</option>
            <option value="phone_call">Phone Call</option>
            <option value="referral">Referral</option>
            <option value="manual">Manual Walk-in</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-warmGrey rounded-lg bg-white text-charcoal"
          >
            <option value="all">All Lead Stages</option>
            <option value="new">New Enquiry</option>
            <option value="contacted">Contacted</option>
            <option value="survey_scheduled">Survey Scheduled</option>
            <option value="survey_completed">Survey Completed</option>
            <option value="quotation_sent">Quotation Sent</option>
            <option value="negotiation">Negotiation</option>
            <option value="converted">Converted (Order)</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Enquiry #</th>
                <th className="py-3 px-4">Customer & Phone</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Capacity & System</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4">Lead Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredEnquiries.map(enq => (
                <tr key={enq.id} className="hover:bg-sand-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">
                    {enq.enquiryNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleOpenCustomer(enq.customerId)}
                      className="font-bold text-charcoal hover:text-navy hover:underline text-left block"
                    >
                      {enq.customerName}
                    </button>
                    <div className="text-[11px] text-mutedGrey">{enq.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-charcoal">
                    {enq.customerCity}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-navy">{enq.interestedCapacityKw} kW</span>
                    <span className="text-[10px] uppercase text-mutedGrey block">{enq.preferredSystemType.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-sand-100 text-[11px] font-medium capitalize border border-warmGrey/60">
                      {enq.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-mutedGrey">
                    {enq.receivedDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={enq.leadStatus} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenCustomer(enq.customerId)}
                      className="px-2.5 py-1 bg-sand-100 hover:bg-navy hover:text-white text-charcoal font-semibold rounded-lg text-xs transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateEnquiryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedCustomerForProfile && (
        <SalesCustomerProfileModal
          customer={selectedCustomerForProfile}
          onClose={() => setSelectedCustomerForProfile(null)}
          onOpenScheduleFollowUp={(c) => {
            setFollowUpTarget(c);
            setIsFollowUpModalOpen(true);
          }}
        />
      )}

      <ScheduleFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        targetCustomer={followUpTarget}
      />

    </div>
  );
};
