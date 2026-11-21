import React, { useState } from 'react';
import { 
  UserPlus, Search, Filter, Plus, Phone, Mail, 
  MapPin, Download, Eye, CalendarClock, ArrowRight,
  Clock, AlertTriangle, XCircle, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, CustomerEnquiry } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { CreateEnquiryModal } from '../components/sales/CreateEnquiryModal';
import { SalesCustomerProfileModal } from '../components/sales/SalesCustomerProfileModal';
import { ScheduleFollowUpModal } from '../components/sales/ScheduleFollowUpModal';

const LOST_REASONS = [
  'Too expensive / Budget issue',
  'Chose competitor',
  'Roof structure unsuitable / High shading',
  'Financing / Loan unavailable',
  'Customer unresponsive / Ghosted',
  'Customer postponed installation',
  'Duplicate enquiry',
  'Other'
];

export const CustomerEnquiriesPage: React.FC = () => {
  const { 
    enquiries, 
    customers, 
    markEnquiryLost,
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [territoryFilter, setTerritoryFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomerForProfile, setSelectedCustomerForProfile] = useState<Customer | null>(null);
  const [followUpTarget, setFollowUpTarget] = useState<Customer | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  // Lost Modal State
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [selectedEnquiryForLost, setSelectedEnquiryForLost] = useState<CustomerEnquiry | null>(null);
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [lostNotes, setLostNotes] = useState('');

  const filteredEnquiries = enquiries.filter(enq => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = enq.customerName.toLowerCase().includes(term) ||
                          enq.customerPhone.includes(term) ||
                          enq.enquiryNumber.toLowerCase().includes(term) ||
                          enq.customerCity.toLowerCase().includes(term);
    const matchesSource = sourceFilter === 'all' || enq.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || enq.leadStatus === statusFilter;
    const matchesTerritory = territoryFilter === 'all' || (enq.territory && enq.territory === territoryFilter) || enq.customerCity.toLowerCase().includes(territoryFilter.toLowerCase());
    return matchesSearch && matchesSource && matchesStatus && matchesTerritory;
  });

  const handleOpenLostModal = (enq: CustomerEnquiry) => {
    setSelectedEnquiryForLost(enq);
    setLostReason(LOST_REASONS[0]);
    setLostNotes('');
    setIsLostModalOpen(true);
  };

  const handleConfirmLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiryForLost) return;
    markEnquiryLost(selectedEnquiryForLost.id, lostReason, lostNotes);
    setIsLostModalOpen(false);
    setSelectedEnquiryForLost(null);
  };

  const getSlaStatus = (enquiry: CustomerEnquiry) => {
    if (enquiry.leadStatus === 'lost') {
      return { label: 'Closed (Lost)', type: 'neutral', icon: XCircle };
    }
    if (enquiry.leadStatus !== 'new') {
      return { label: 'SLA Met (Contacted)', type: 'success', icon: CheckCircle2 };
    }

    // New Enquiry - check 24h SLA from received date
    const receivedTime = new Date(enquiry.receivedDate).getTime();
    const currentTime = Date.now();
    const hoursElapsed = (currentTime - receivedTime) / (1000 * 60 * 60);

    if (hoursElapsed > 24 || enquiry.slaBreached) {
      const breachHours = Math.round(hoursElapsed - 24);
      return { 
        label: `SLA Breached (${breachHours > 0 ? `${breachHours}h ago` : 'Overdue'})`, 
        type: 'critical', 
        icon: AlertTriangle 
      };
    }

    const hoursLeft = Math.max(1, Math.round(24 - hoursElapsed));
    return { 
      label: `${hoursLeft}h to First Contact`, 
      type: 'warning', 
      icon: Clock 
    };
  };

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
      <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search enquiry #, customer, phone..."
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
            <option value="lost">Lost</option>
          </select>
        </div>

        <div>
          <select
            value={territoryFilter}
            onChange={e => setTerritoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-warmGrey rounded-lg bg-white text-charcoal"
          >
            <option value="all">All Territories</option>
            <option value="Pune Central">Pune Central</option>
            <option value="Pune PCMC">Pune PCMC</option>
            <option value="Hadapsar & East">Hadapsar & East</option>
            <option value="Kothrud & West">Kothrud & West</option>
            <option value="Baramati & Rural">Baramati & Rural</option>
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
                <th className="py-3 px-4">Territory / City</th>
                <th className="py-3 px-4">Capacity & System</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">24h SLA Status</th>
                <th className="py-3 px-4">Lead Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredEnquiries.map(enq => {
                const sla = getSlaStatus(enq);
                const SlaIcon = sla.icon;
                return (
                  <tr key={enq.id} className="hover:bg-sand-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy whitespace-nowrap">
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
                      <div>{enq.customerCity}</div>
                      <span className="text-[10px] text-mutedGrey">
                        {enq.territory || 'Pune Central'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-navy">{enq.interestedCapacityKw} kW</span>
                      <span className="text-[10px] uppercase text-mutedGrey block">{enq.preferredSystemType.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-sand-100 text-[11px] font-medium capitalize border border-warmGrey/60">
                        {enq.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        sla.type === 'critical'
                          ? 'bg-terracotta/10 text-terracotta border border-terracotta/30'
                          : sla.type === 'warning'
                          ? 'bg-amber/15 text-amber-700 border border-amber/40'
                          : sla.type === 'success'
                          ? 'bg-sage/15 text-sage-dark border border-sage/40'
                          : 'bg-sand-100 text-mutedGrey border border-warmGrey'
                      }`}>
                        <SlaIcon className="w-3 h-3 shrink-0" />
                        <span>{sla.label}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={enq.leadStatus} />
                      {enq.leadStatus === 'lost' && enq.lostReason && (
                        <span className="text-[10px] text-terracotta block mt-0.5 truncate max-w-[130px]" title={enq.lostReason}>
                          {enq.lostReason}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenCustomer(enq.customerId)}
                        className="px-2.5 py-1 bg-sand-100 hover:bg-navy hover:text-white text-charcoal font-semibold rounded-lg text-xs transition-colors"
                      >
                        Profile
                      </button>
                      {enq.leadStatus !== 'converted' && enq.leadStatus !== 'lost' && (
                        <button
                          onClick={() => handleOpenLostModal(enq)}
                          className="px-2.5 py-1 bg-white hover:bg-terracotta hover:text-white text-terracotta border border-terracotta/40 font-semibold rounded-lg text-xs transition-colors"
                          title="Mark this enquiry as lost with reason"
                        >
                          Mark Lost
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

      {/* Structured Mark Lost Modal */}
      {isLostModalOpen && selectedEnquiryForLost && (
        <Modal
          isOpen={isLostModalOpen}
          onClose={() => setIsLostModalOpen(false)}
          title={`Mark Enquiry Lost — ${selectedEnquiryForLost.enquiryNumber}`}
          subtitle={`Record disposition loss analytics for ${selectedEnquiryForLost.customerName}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmLost} className="space-y-4">
            <div className="p-3 bg-terracotta/10 border border-terracotta/30 rounded-xl flex items-start space-x-2.5 text-xs text-charcoal">
              <ShieldAlert className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-terracotta">Loss Analytics Discipline:</span> SolarOS tracks reasons for lost deals to improve targeting, sales rebuttals, and pricing strategies.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Primary Loss Reason *
              </label>
              <select
                value={lostReason}
                onChange={e => setLostReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white text-charcoal"
                required
              >
                {LOST_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Loss Detail Notes / Feedback
              </label>
              <textarea
                rows={3}
                value={lostNotes}
                onChange={e => setLostNotes(e.target.value)}
                placeholder="Specific customer feedback, competitor quoted price, roof issue specifics..."
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsLostModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-terracotta text-white text-xs font-semibold rounded-lg hover:bg-terracotta/90 transition-colors"
              >
                Confirm Lost Disposition
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
