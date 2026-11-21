import React, { useState } from 'react';
import { 
  Users, UserPlus, CalendarClock, Compass, FileText, 
  CheckCircle2, Clock, AlertTriangle, ArrowUpRight, 
  Search, Plus, Phone, Mail, MapPin, Eye, 
  Download, ArrowRight, Check, Sparkles, AlertCircle, 
  ChevronRight, Calendar, MessageSquare, ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, LeadStatus, SystemType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SalesCustomerProfileModal } from '../components/sales/SalesCustomerProfileModal';
import { CreateEnquiryModal } from '../components/sales/CreateEnquiryModal';
import { ScheduleFollowUpModal } from '../components/sales/ScheduleFollowUpModal';
import { RequestSurveyModal } from '../components/sales/RequestSurveyModal';
import { CreateQuotationModal } from '../components/sales/CreateQuotationModal';
import { Link } from 'react-router-dom';

export const SalesDashboardPage: React.FC = () => {
  const { 
    currentUser, 
    customers, 
    surveys, 
    quotations, 
    orders, 
    followUps, 
    salesActivities, 
    completeFollowUp,
    showToast 
  } = useApp();

  // Selected entities for modals
  const [selectedCustomerForProfile, setSelectedCustomerForProfile] = useState<Customer | null>(null);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isCreateEnquiryModalOpen, setIsCreateEnquiryModalOpen] = useState(false);
  const [isCreateQuotationModalOpen, setIsCreateQuotationModalOpen] = useState(false);
  const [isScheduleFollowUpModalOpen, setIsScheduleFollowUpModalOpen] = useState(false);
  const [isRequestSurveyModalOpen, setIsRequestSurveyModalOpen] = useState(false);
  const [targetCustomerForFollowUp, setTargetCustomerForFollowUp] = useState<Customer | null>(null);

  // Table filtering & search states
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquirySourceFilter, setEnquirySourceFilter] = useState('all');
  const [enquiryCapacityFilter, setEnquiryCapacityFilter] = useState('all');
  const [followUpTab, setFollowUpTab] = useState<'overdue' | 'today' | 'upcoming'>('overdue');

  // Filter records strictly belonging to the logged-in salesperson (e.g. Pooja Kulkarni)
  const myCustomers = customers.filter(c => 
    !c.assignedSalesperson || c.assignedSalesperson.includes(currentUser.name.split(' ')[0]) || currentUser.role === 'owner_admin'
  );

  const mySurveys = surveys.filter(s => 
    myCustomers.some(c => c.id === s.customerId)
  );

  const myQuotations = quotations.filter(q => 
    myCustomers.some(c => c.id === q.customerId)
  );

  const myOrders = orders.filter(o => 
    myCustomers.some(c => c.id === o.customerId)
  );

  const myFollowUps = followUps.filter(f => 
    !f.assignedSalesperson || f.assignedSalesperson.includes(currentUser.name.split(' ')[0]) || currentUser.role === 'owner_admin'
  );

  const myActivities = salesActivities.filter(a => 
    !a.salesperson || a.salesperson.includes(currentUser.name.split(' ')[0]) || currentUser.role === 'owner_admin'
  );

  // 1. Calculate the 6 Role-Specific KPI Cards
  const totalLeadsCount = myCustomers.length;
  const activeLeadsCount = myCustomers.filter(c => c.leadStatus !== 'converted' && c.leadStatus !== 'lost').length;

  const newEnquiriesCount = myCustomers.filter(c => c.leadStatus === 'new').length;

  const overdueFollowUps = myFollowUps.filter(f => f.status === 'overdue');
  const todayFollowUps = myFollowUps.filter(f => {
    if (f.status === 'completed') return false;
    const isToday = f.scheduledDate.startsWith(new Date().toISOString().split('T')[0]);
    return isToday || f.status === 'pending';
  });
  const followUpsDueCount = overdueFollowUps.length + todayFollowUps.length;

  const scheduledSurveysCount = mySurveys.filter(s => s.status === 'scheduled' || s.status === 'assigned').length;

  const pendingQuotationsCount = myQuotations.filter(q => q.status === 'sent' || q.status === 'draft').length;
  const draftQuotesCount = myQuotations.filter(q => q.status === 'draft').length;
  const sentQuotesCount = myQuotations.filter(q => q.status === 'sent').length;

  const convertedOrdersCount = myOrders.length;
  const conversionRate = totalLeadsCount > 0 
    ? ((convertedOrdersCount / totalLeadsCount) * 100).toFixed(1)
    : '0';

  // 2. Filtered Enquiries (Latest 5 records)
  const filteredEnquiries = myCustomers.filter(c => {
    const term = enquirySearch.toLowerCase();
    const matchesSearch = c.fullName.toLowerCase().includes(term) || c.phone.includes(term) || c.customerCode.toLowerCase().includes(term);
    const matchesSource = enquirySourceFilter === 'all' || c.enquirySource === enquirySourceFilter;
    const matchesCapacity = enquiryCapacityFilter === 'all' || c.interestedCapacityKw === parseFloat(enquiryCapacityFilter);
    return matchesSearch && matchesSource && matchesCapacity;
  });

  const latestEnquiries = filteredEnquiries.slice(0, 5);

  // 3. Follow-ups preview (Limited to 4 records)
  const activeFollowUpsList = myFollowUps.filter(f => {
    if (followUpTab === 'overdue') return f.status === 'overdue';
    if (followUpTab === 'today') return f.status === 'pending' && f.scheduledDate.startsWith(new Date().toISOString().split('T')[0]);
    if (followUpTab === 'upcoming') return f.status === 'pending' || f.status === 'rescheduled';
    return true;
  }).slice(0, 4);

  // 4. Site Surveys preview (Sorted by priority, max 4 records)
  const priorityStatusWeight: Record<string, number> = {
    unassigned: 1,
    assigned: 2,
    scheduled: 3,
    submitted: 4,
    approved: 5,
    rejected: 6
  };

  const prioritySurveys = [...mySurveys].sort((a, b) => {
    const weightA = priorityStatusWeight[a.status] || 99;
    const weightB = priorityStatusWeight[b.status] || 99;
    return weightA - weightB;
  }).slice(0, 4);

  // 5. Actionable Quotations (Drafts or Sent first, max 3 records)
  const actionableQuotations = [...myQuotations]
    .sort((a, b) => {
      if ((a.status === 'sent' || a.status === 'draft') && !(b.status === 'sent' || b.status === 'draft')) return -1;
      if (!(a.status === 'sent' || a.status === 'draft') && (b.status === 'sent' || b.status === 'draft')) return 1;
      return 0;
    })
    .slice(0, 3);

  // 6. Recent Sales Activities (Latest 4 records)
  const latestActivities = myActivities.slice(0, 4);

  const exportEnquiriesCSV = () => {
    const headers = 'ID,Name,Phone,City,Capacity (kW),System Type,Source,Status,Received Date\n';
    const rows = filteredEnquiries.map(c => 
      `"${c.customerCode}","${c.fullName}","${c.phone}","${c.city}",${c.interestedCapacityKw},"${c.preferredSystemType}","${c.enquirySource}","${c.leadStatus}","${c.registrationDate}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SolarOS_Sales_Leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Sales leads dataset exported to CSV', 'info');
  };

  const handleCallCustomer = (phone: string, name: string) => {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
    showToast(`Initiating outbound call to ${name} (${phone})`, 'info');
  };

  // Reusable Card Style with Warm Amber Shadow
  const cardContainerClass = "bg-white rounded-2xl border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all duration-200";

  return (
    <div className="space-y-6">
      
      {/* 1. Header Section */}
      <div className={`${cardContainerClass} p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sage animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
                Sales Executive Workspace
              </span>
            </div>
            <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1.5">
              Sales Overview
            </h1>
            <p className="text-sm font-semibold text-navy mt-1">
              Welcome back, {currentUser.name}!
            </p>
            <p className="text-xs text-mutedGrey mt-0.5">
              Manage your customer enquiries, site survey coordination, quotations and conversions.
            </p>

            {/* Performance Ribbon */}
            <div className="flex flex-wrap items-center gap-2.5 mt-3.5 text-xs">
              <div className="px-3 py-1 rounded-lg bg-sand-100 text-charcoal font-semibold border border-warmGrey/60">
                📅 {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="px-3 py-1 rounded-lg bg-sand-100 text-navy font-semibold border border-warmGrey/60">
                🎯 Target: 10 Projects
              </div>
              <div className="px-3 py-1 rounded-lg bg-sage-50 text-sage font-bold border border-sage/30">
                ✓ Converted: {convertedOrdersCount} ({conversionRate}%)
              </div>
              <div className="px-3 py-1 rounded-lg bg-amber-50 text-amber font-bold border border-amber/30">
                ⚡ Active Leads: {activeLeadsCount}
              </div>
            </div>
          </div>

          {/* Primary Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="px-4 py-2.5 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-all shadow-sm flex items-center space-x-2 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Customer</span>
            </button>
            
            <button
              onClick={() => setIsCreateEnquiryModalOpen(true)}
              className="px-4 py-2.5 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-all shadow-xs flex items-center space-x-2 active:scale-[0.98]"
            >
              <Users className="w-4 h-4 text-navy" />
              <span>+ Create Enquiry</span>
            </button>

            <button
              onClick={() => setIsCreateQuotationModalOpen(true)}
              className="px-4 py-2.5 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-all shadow-xs flex items-center space-x-2 active:scale-[0.98]"
            >
              <FileText className="w-4 h-4 text-amber" />
              <span>+ Create Quotation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Six Role-Specific KPI Cards (3 per row on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* ROW 1 - Card 1: My Total Leads */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">
                My Total Leads
              </p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">
                {totalLeadsCount}
              </h3>
              <p className="text-xs text-mutedGrey mt-1">
                {activeLeadsCount} active in pipeline
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sand-200/70 text-navy flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-sage font-semibold flex items-center">
              ↑ 14.2% <span className="text-mutedGrey ml-1 font-normal">vs last month</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sand-100 text-charcoal border border-warmGrey/60">
              Assigned
            </span>
          </div>
        </div>

        {/* ROW 1 - Card 2: New Enquiries */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">
                New Enquiries
              </p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">
                {newEnquiriesCount}
              </h3>
              <p className="text-xs text-mutedGrey mt-1">
                Awaiting first contact
              </p>
            </div>
            <div className="p-3 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-mutedGrey">
              Inbound via web & WhatsApp
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              newEnquiriesCount > 0 
                ? 'bg-amber-50 text-amber border-amber/30' 
                : 'bg-sage-50 text-sage border-sage/30'
            }`}>
              {newEnquiriesCount > 0 ? 'Action Req' : 'Clear'}
            </span>
          </div>
        </div>

        {/* ROW 1 - Card 3: Follow-ups Due */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">
                Follow-ups Due
              </p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">
                {followUpsDueCount}
              </h3>
              <p className="text-xs text-mutedGrey mt-1">
                {overdueFollowUps.length} Overdue • {todayFollowUps.length} Today
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-mutedGrey">
              Scheduled customer touchpoints
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              overdueFollowUps.length > 0 
                ? 'bg-terracotta-50 text-terracotta border-terracotta/30' 
                : 'bg-sage-50 text-sage border-sage/30'
            }`}>
              {overdueFollowUps.length > 0 ? `${overdueFollowUps.length} Overdue` : 'On Schedule'}
            </span>
          </div>
        </div>

        {/* ROW 2 - Card 4: Surveys Scheduled */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">
                Surveys Scheduled
              </p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">
                {scheduledSurveysCount}
              </h3>
              <p className="text-xs text-mutedGrey mt-1">
                Allocated to field technicians
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sand-200/70 text-navy flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-mutedGrey">
              {mySurveys.filter(s => s.status === 'approved').length} completed & approved
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sand-100 text-navy border border-warmGrey/60">
              Active Feasibility
            </span>
          </div>
        </div>

        {/* ROW 2 - Card 5: Pending Quotations */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">
                Pending Quotations
              </p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">
                {pendingQuotationsCount}
              </h3>
              <p className="text-xs text-mutedGrey mt-1">
                {draftQuotesCount} Drafts • {sentQuotesCount} Sent
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-mutedGrey">
              Customer review & negotiation
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber border border-amber/30">
              Pipeline Proposals
            </span>
          </div>
        </div>

        {/* ROW 2 - Card 6: Converted Sales */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">
                Converted Sales
              </p>
              <h3 className="text-3xl font-bold text-charcoal mt-2 tracking-tight">
                {convertedOrdersCount}
              </h3>
              <p className="text-xs text-mutedGrey mt-1">
                {conversionRate}% conversion rate
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sage-50 text-sage flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
            <span className="text-sage font-semibold flex items-center">
              ↑ 25.0% <span className="text-mutedGrey ml-1 font-normal">vs target</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-sage border border-sage/30">
              Confirmed
            </span>
          </div>
        </div>

      </div>

      {/* 3. Customer Enquiries & Follow-up Queue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Customer Enquiries (Latest 5 records) */}
        <div className={`lg:col-span-2 ${cardContainerClass} p-5 space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-charcoal">Customer Enquiries</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sand-100 text-navy border border-warmGrey">
                  Latest 5 of {filteredEnquiries.length}
                </span>
              </div>
              <p className="text-xs text-mutedGrey mt-0.5">
                Qualified inquiries managed by you • Click customer row for 360° profile
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={exportEnquiriesCSV}
                className="px-2.5 py-1.5 rounded-lg bg-sand-100 hover:bg-sand-200 text-charcoal text-xs font-semibold border border-warmGrey flex items-center space-x-1"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5 text-navy" />
                <span>Export</span>
              </button>
              
              <Link
                to="/enquiries"
                className="px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                <span>View All Enquiries</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, phone or code..."
                value={enquirySearch}
                onChange={e => setEnquirySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy text-xs"
              />
            </div>

            <select
              value={enquirySourceFilter}
              onChange={e => setEnquirySourceFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-warmGrey rounded-lg bg-white text-charcoal font-medium text-xs"
            >
              <option value="all">All Lead Sources</option>
              <option value="website">Website Form</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone_call">Phone Call</option>
              <option value="referral">Referral</option>
              <option value="manual">Manual Walk-in</option>
            </select>

            <select
              value={enquiryCapacityFilter}
              onChange={e => setEnquiryCapacityFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-warmGrey rounded-lg bg-white text-charcoal font-medium text-xs"
            >
              <option value="all">All Solar Capacities</option>
              <option value="1">1 kW</option>
              <option value="2">2 kW</option>
              <option value="3">3 kW</option>
              <option value="4">4 kW</option>
              <option value="5">5 kW</option>
            </select>
          </div>

          {/* Enquiries Table (Streamlined) */}
          <div className="overflow-x-auto border border-warmGrey/60 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Capacity & Type</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                {latestEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-mutedGrey">
                      No customer enquiries found matching criteria.
                    </td>
                  </tr>
                ) : (
                  latestEnquiries.map(c => (
                    <tr 
                      key={c.id} 
                      className="hover:bg-sand-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomerForProfile(c)}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-charcoal">{c.fullName}</div>
                        <div className="text-[11px] text-mutedGrey">{c.phone}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-charcoal">
                        {c.city}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-navy">{c.interestedCapacityKw} kW</div>
                        <div className="text-[10px] uppercase text-mutedGrey">{c.preferredSystemType.replace('_', ' ')}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-sand-100 text-[11px] font-medium border border-warmGrey/60">
                          {c.enquirySource.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={c.leadStatus} />
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleCallCustomer(c.phone, c.fullName)}
                          className="p-1.5 rounded-lg bg-sand-100 hover:bg-navy hover:text-white text-navy transition-colors"
                          title="Direct Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setTargetCustomerForFollowUp(c);
                            setIsScheduleFollowUpModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-sand-100 hover:bg-amber hover:text-white text-charcoal transition-colors"
                          title="Schedule Follow-up"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setSelectedCustomerForProfile(c)}
                          className="px-2 py-1 rounded-lg bg-sand-100 hover:bg-navy hover:text-white text-charcoal font-semibold text-xs transition-colors"
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom link to view full list */}
          <div className="pt-1 flex items-center justify-between text-xs text-mutedGrey">
            <span>Showing top {latestEnquiries.length} recent enquiries</span>
            <Link to="/enquiries" className="text-navy font-semibold hover:underline flex items-center space-x-1">
              <span>View full list ({filteredEnquiries.length} enquiries)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column (1 Col): Follow-up Management Queue (3-4 records) */}
        <div className={`${cardContainerClass} p-5 flex flex-col justify-between space-y-4`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CalendarClock className="w-4 h-4 text-amber" />
                <h2 className="text-sm font-bold text-charcoal">Follow-up Queue</h2>
              </div>
              <button
                onClick={() => {
                  setTargetCustomerForFollowUp(null);
                  setIsScheduleFollowUpModalOpen(true);
                }}
                className="text-xs font-semibold text-navy hover:underline flex items-center space-x-1"
              >
                <span>+ New</span>
              </button>
            </div>
            <p className="text-xs text-mutedGrey mb-3">
              Scheduled callbacks and agenda touchpoints
            </p>

            {/* Follow-up Subtabs */}
            <div className="flex space-x-1 border-b border-warmGrey pb-1.5 text-xs">
              <button
                onClick={() => setFollowUpTab('overdue')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center space-x-1 ${
                  followUpTab === 'overdue' ? 'bg-terracotta text-white' : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                <span>Overdue</span>
                {overdueFollowUps.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-terracotta text-[10px] font-bold flex items-center justify-center">
                    {overdueFollowUps.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setFollowUpTab('today')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center space-x-1 ${
                  followUpTab === 'today' ? 'bg-amber text-charcoal' : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                <span>Today</span>
                {todayFollowUps.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-charcoal text-white text-[10px] font-bold flex items-center justify-center">
                    {todayFollowUps.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setFollowUpTab('upcoming')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  followUpTab === 'upcoming' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                Upcoming
              </button>
            </div>

            {/* Follow-up Items Queue (Max 4 items) */}
            <div className="space-y-2.5 mt-3">
              {activeFollowUpsList.length === 0 ? (
                <div className="text-center py-6 text-xs text-mutedGrey">
                  No pending follow-ups in this tab.
                </div>
              ) : (
                activeFollowUpsList.map(flw => (
                  <div 
                    key={flw.id} 
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                      flw.status === 'overdue' 
                        ? 'bg-terracotta-50/70 border-terracotta/40' 
                        : 'bg-sand-50/70 border-warmGrey/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-charcoal">{flw.customerName}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                        flw.priority === 'urgent' ? 'bg-terracotta text-white' :
                        flw.priority === 'high' ? 'bg-amber text-charcoal' : 'bg-sand-200 text-charcoal'
                      }`}>
                        {flw.priority}
                      </span>
                    </div>

                    <p className="text-mutedGrey text-[11px] leading-snug line-clamp-1">
                      {flw.followUpReason}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-mutedGrey pt-0.5">
                      <span>{new Date(flw.scheduledDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {flw.status === 'overdue' && (
                        <span className="text-terracotta font-bold uppercase">Overdue</span>
                      )}
                    </div>

                    {/* Quick Action buttons */}
                    {flw.status !== 'completed' && (
                      <div className="pt-2 border-t border-warmGrey/60 flex items-center justify-between gap-1">
                        <button
                          onClick={() => handleCallCustomer(flw.customerPhone, flw.customerName)}
                          className="px-2 py-1 bg-white hover:bg-sand-100 border border-warmGrey rounded text-[11px] font-semibold text-charcoal flex items-center space-x-1"
                        >
                          <Phone className="w-3 h-3 text-navy" />
                          <span>Call</span>
                        </button>

                        <button
                          onClick={() => completeFollowUp(flw.id, 'Spoke with client, confirmed next steps.')}
                          className="px-2 py-1 bg-sage hover:bg-sage-dark text-white rounded text-[11px] font-semibold flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Done</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/follow-ups"
            className="w-full block text-center py-2 bg-sand-100 hover:bg-sand-200 text-charcoal text-xs font-semibold rounded-xl transition-colors border border-warmGrey"
          >
            View All Follow-ups Calendar & Log →
          </Link>
        </div>

      </div>

      {/* 4. Site Survey Coordination & Quotation Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Site Survey Coordination Box (Max 4 priority records) */}
        <div className={`${cardContainerClass} p-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-navy" />
                <h2 className="text-sm font-bold text-charcoal">Site Survey Coordination</h2>
              </div>
              <p className="text-xs text-mutedGrey mt-0.5">
                Technical feasibility and shadow analysis approval gating
              </p>
            </div>
            <button
              onClick={() => {
                setTargetCustomerForFollowUp(null);
                setIsRequestSurveyModalOpen(true);
              }}
              className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs"
            >
              + Request Survey
            </button>
          </div>

          {/* Engineering Gate Rule Banner */}
          <div className="p-3 bg-sand-100 rounded-xl border border-warmGrey text-[11px] leading-relaxed text-charcoal flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-navy shrink-0 mt-0.5" />
            <div>
              <strong>Engineering Gate Rule:</strong> Quotations can only be finalized and dispatched after site survey measurements and shadow analysis are <strong>Approved</strong> by the engineering lead.
            </div>
          </div>

          {/* Survey List (Max 4 items) */}
          <div className="space-y-2.5">
            {prioritySurveys.length === 0 ? (
              <div className="text-center py-6 text-xs text-mutedGrey">
                No active survey requests currently scheduled.
              </div>
            ) : (
              prioritySurveys.map(s => (
                <div key={s.id} className="p-3.5 rounded-xl border border-warmGrey/60 bg-sand-50/60 hover:bg-sand-50 transition-colors text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-navy">{s.surveyNumber}</span>
                      <span className="font-semibold text-charcoal ml-2">{s.customerName}</span>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  <div className="grid grid-cols-2 text-[11px] text-mutedGrey">
                    <div>Technician: <strong className="text-charcoal">{s.technicianName || 'Pending Allocation'}</strong></div>
                    <div>Scheduled: <strong className="text-charcoal">{new Date(s.scheduledDate).toLocaleDateString()}</strong></div>
                    <div>Shadow-Free: <strong className="text-charcoal">{s.shadowFreeAreaSqm ? `${s.shadowFreeAreaSqm} sq.m` : 'Pending'}</strong></div>
                    <div>Roof: <strong className="text-charcoal">{s.roofDirection || 'Pending'} ({s.roofTiltDegrees || 0}°)</strong></div>
                  </div>

                  {s.status === 'approved' ? (
                    <div className="pt-2 border-t border-warmGrey/60 flex items-center justify-between text-sage font-bold text-[11px]">
                      <span className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approved by Engineering</span>
                      </span>
                      <Link
                        to="/quotations"
                        className="px-2.5 py-1 bg-navy text-white rounded font-semibold text-xs hover:bg-navy-light"
                      >
                        Generate Quotation →
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-warmGrey/60 flex items-center justify-between text-mutedGrey text-[11px]">
                      <span className="text-amber font-semibold">Survey in progress / awaiting review</span>
                      <span className="italic text-[10px]">Quotation Locked</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <Link
            to="/surveys"
            className="w-full block text-center py-2 bg-sand-50 hover:bg-sand-100 text-charcoal text-xs font-semibold rounded-xl border border-warmGrey"
          >
            View All Site Surveys ({mySurveys.length}) →
          </Link>
        </div>

        {/* Quotation Management Box (Max 3 actionable quotations) */}
        <div className={`${cardContainerClass} p-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-navy" />
                <h2 className="text-sm font-bold text-charcoal">Quotation Management</h2>
              </div>
              <p className="text-xs text-mutedGrey mt-0.5">
                Proposals issued, customer decision status & conversion tracking
              </p>
            </div>
            <button
              onClick={() => setIsCreateQuotationModalOpen(true)}
              className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs"
            >
              + Create Quote
            </button>
          </div>

          {/* Summary Pills */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-sand-50 border border-warmGrey/60">
              <span className="text-[11px] text-mutedGrey">Drafts</span>
              <p className="text-base font-bold text-charcoal mt-0.5">{draftQuotesCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-sand-50 border border-warmGrey/60">
              <span className="text-[11px] text-mutedGrey">Sent to Client</span>
              <p className="text-base font-bold text-navy mt-0.5">{sentQuotesCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-sand-50 border border-warmGrey/60">
              <span className="text-[11px] text-mutedGrey">Accepted</span>
              <p className="text-base font-bold text-sage mt-0.5">{convertedOrdersCount}</p>
            </div>
          </div>

          {/* Quotations List (Max 3 records) */}
          <div className="space-y-2.5">
            {actionableQuotations.length === 0 ? (
              <div className="text-center py-6 text-xs text-mutedGrey">
                No active quotations found.
              </div>
            ) : (
              actionableQuotations.map(q => (
                <div key={q.id} className="p-3.5 rounded-xl border border-warmGrey/60 bg-sand-50/60 hover:bg-sand-50 transition-colors text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal">{q.customerName}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <div className="flex items-center justify-between text-mutedGrey text-[11px]">
                    <span>{q.quotationNumber} • {q.packageName}</span>
                    <span className="font-bold text-navy text-xs">₹{q.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[10px] text-mutedGrey flex justify-between pt-1 border-t border-warmGrey/40">
                    <span>Issued: {q.createdDate}</span>
                    <span>Valid until: {q.validUntil}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/quotations"
            className="w-full block text-center py-2 bg-sand-50 hover:bg-sand-100 text-charcoal text-xs font-semibold rounded-xl border border-warmGrey"
          >
            Open Quotations Catalog & Builder ({myQuotations.length}) →
          </Link>
        </div>

      </div>

      {/* 5. Recent Sales Activities Feed (Stream of latest 4 activities) */}
      <div className={`${cardContainerClass} p-5 space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber" />
            <h2 className="text-sm font-bold text-charcoal">Recent Sales Activities</h2>
          </div>
          <span className="text-[11px] font-semibold text-mutedGrey">Latest 4 activities</span>
        </div>
        <p className="text-xs text-mutedGrey">
          Real-time audit trail of customer touchpoints, site survey updates & quotation decisions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {latestActivities.length === 0 ? (
            <div className="col-span-full text-center py-6 text-xs text-mutedGrey">
              No recent sales activities logged.
            </div>
          ) : (
            latestActivities.map(act => (
              <div key={act.id} className="p-3.5 bg-sand-50/80 rounded-xl border border-warmGrey/60 text-xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-charcoal truncate">{act.customerName}</span>
                    <span className="text-[10px] text-mutedGrey font-mono shrink-0 ml-1">{act.timestamp}</span>
                  </div>
                  <p className="text-mutedGrey text-[11px] leading-snug mt-1 line-clamp-2">
                    {act.description}
                  </p>
                </div>
                {act.relatedLink && (
                  <Link to={act.relatedLink} className="text-[10px] text-navy font-semibold hover:underline flex items-center space-x-0.5 pt-1 border-t border-warmGrey/40">
                    <span>View record</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sales-Focused Customer 360 Profile Modal */}
      {selectedCustomerForProfile && (
        <SalesCustomerProfileModal
          customer={selectedCustomerForProfile}
          onClose={() => setSelectedCustomerForProfile(null)}
          onOpenScheduleFollowUp={(cust) => {
            setTargetCustomerForFollowUp(cust);
            setIsScheduleFollowUpModalOpen(true);
          }}
          onOpenRequestSurvey={(cust) => {
            setTargetCustomerForFollowUp(cust);
            setIsRequestSurveyModalOpen(true);
          }}
        />
      )}

      {/* Add Customer / Create Enquiry Modal */}
      <CreateEnquiryModal
        isOpen={isCreateEnquiryModalOpen || isAddCustomerModalOpen}
        onClose={() => {
          setIsCreateEnquiryModalOpen(false);
          setIsAddCustomerModalOpen(false);
        }}
      />

      {/* Schedule Follow-up Modal */}
      <ScheduleFollowUpModal
        isOpen={isScheduleFollowUpModalOpen}
        onClose={() => setIsScheduleFollowUpModalOpen(false)}
        targetCustomer={targetCustomerForFollowUp}
      />

      {/* Request Survey Modal */}
      <RequestSurveyModal
        isOpen={isRequestSurveyModalOpen}
        onClose={() => setIsRequestSurveyModalOpen(false)}
        targetCustomer={targetCustomerForFollowUp}
      />

      {/* Create Quotation Modal */}
      <CreateQuotationModal
        isOpen={isCreateQuotationModalOpen}
        onClose={() => setIsCreateQuotationModalOpen(false)}
        defaultCustomerId={targetCustomerForFollowUp?.id}
      />

    </div>
  );
};
