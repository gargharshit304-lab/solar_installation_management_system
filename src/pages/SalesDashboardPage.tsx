import React, { useState } from 'react';
import { 
  Users, UserPlus, CalendarClock, Compass, FileText, 
  CheckCircle2, Clock, AlertTriangle, ArrowUpRight, 
  Search, Filter, Plus, Phone, Mail, MapPin, Eye, 
  Download, ArrowRight, Check, Sparkles, AlertCircle, 
  ChevronRight, Calendar, MessageSquare, Play, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, LeadStatus, SystemType } from '../types';
import { KpiCard } from '../components/common/KpiCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { SalesCustomerProfileModal } from '../components/sales/SalesCustomerProfileModal';
import { CreateEnquiryModal } from '../components/sales/CreateEnquiryModal';
import { ScheduleFollowUpModal } from '../components/sales/ScheduleFollowUpModal';
import { RequestSurveyModal } from '../components/sales/RequestSurveyModal';
import { CreateQuotationModal } from '../components/sales/CreateQuotationModal';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

export const SalesDashboardPage: React.FC = () => {
  const { 
    currentUser, 
    customers, 
    surveys, 
    quotations, 
    orders, 
    followUps, 
    enquiries, 
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
  const [isFullPipelineOpen, setIsFullPipelineOpen] = useState(false);

  // Table filtering & search states
  const [pipelineStageFilter, setPipelineStageFilter] = useState<string>('all');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquirySourceFilter, setEnquirySourceFilter] = useState('all');
  const [enquiryCapacityFilter, setEnquiryCapacityFilter] = useState('all');
  const [followUpTab, setFollowUpTab] = useState<'overdue' | 'today' | 'upcoming' | 'completed'>('overdue');

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

  // 2. Pipeline Stages data
  const pipelineStages: { stage: LeadStatus; label: string; count: number; color: string }[] = [
    { stage: 'new', label: '1. New Enquiries', count: myCustomers.filter(c => c.leadStatus === 'new').length, color: '#183153' },
    { stage: 'contacted', label: '2. Contacted', count: myCustomers.filter(c => c.leadStatus === 'contacted').length, color: '#C48A42' },
    { stage: 'survey_scheduled', label: '3. Survey Sched', count: myCustomers.filter(c => c.leadStatus === 'survey_scheduled').length, color: '#C48A42' },
    { stage: 'survey_completed', label: '4. Survey Done', count: myCustomers.filter(c => c.leadStatus === 'survey_completed').length, color: '#6F8F7A' },
    { stage: 'quotation_sent', label: '5. Quote Sent', count: myCustomers.filter(c => c.leadStatus === 'quotation_sent').length, color: '#183153' },
    { stage: 'negotiation', label: '6. Negotiation', count: myCustomers.filter(c => c.leadStatus === 'negotiation').length, color: '#C48A42' },
    { stage: 'converted', label: '7. Converted', count: myCustomers.filter(c => c.leadStatus === 'converted').length, color: '#6F8F7A' },
    { stage: 'lost', label: '8. Lost', count: myCustomers.filter(c => c.leadStatus === 'lost').length, color: '#B85C52' },
  ];

  // 3. Filtered Enquiries table
  const filteredEnquiries = myCustomers.filter(c => {
    const term = enquirySearch.toLowerCase();
    const matchesSearch = c.fullName.toLowerCase().includes(term) || c.phone.includes(term) || c.customerCode.toLowerCase().includes(term);
    const matchesStage = pipelineStageFilter === 'all' || c.leadStatus === pipelineStageFilter;
    const matchesSource = enquirySourceFilter === 'all' || c.enquirySource === enquirySourceFilter;
    const matchesCapacity = enquiryCapacityFilter === 'all' || c.interestedCapacityKw === parseFloat(enquiryCapacityFilter);
    return matchesSearch && matchesStage && matchesSource && matchesCapacity;
  });

  // 4. Follow-ups filtered by tab
  const activeFollowUpsList = myFollowUps.filter(f => {
    if (followUpTab === 'overdue') return f.status === 'overdue';
    if (followUpTab === 'today') return f.status === 'pending' && f.scheduledDate.startsWith(new Date().toISOString().split('T')[0]);
    if (followUpTab === 'upcoming') return f.status === 'pending' || f.status === 'rescheduled';
    if (followUpTab === 'completed') return f.status === 'completed';
    return true;
  });

  // 5. Analytics Data (Recharts)
  const leadFunnelData = [
    { stage: 'Enquiries', count: totalLeadsCount },
    { stage: 'Contacted', count: myCustomers.filter(c => c.leadStatus !== 'new').length },
    { stage: 'Surveys', count: mySurveys.length },
    { stage: 'Quotes', count: myQuotations.length },
    { stage: 'Orders', count: convertedOrdersCount }
  ];

  const sourceData = [
    { name: 'Website', value: myCustomers.filter(c => c.enquirySource === 'website').length, color: '#183153' },
    { name: 'WhatsApp', value: myCustomers.filter(c => c.enquirySource === 'whatsapp').length, color: '#6F8F7A' },
    { name: 'Phone Call', value: myCustomers.filter(c => c.enquirySource === 'phone_call').length, color: '#C48A42' },
    { name: 'Referral', value: myCustomers.filter(c => c.enquirySource === 'referral').length, color: '#DECDBB' },
    { name: 'Manual', value: myCustomers.filter(c => c.enquirySource === 'manual').length, color: '#777777' }
  ].filter(s => s.value > 0);

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

  return (
    <div className="space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey">
              Sales Executive Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight mt-1">
            Sales Overview
          </h1>
          <p className="text-sm font-semibold text-navy mt-0.5">
            Welcome back, {currentUser.name}!
          </p>
          <p className="text-xs text-mutedGrey mt-0.5">
            Manage your enquiries, customer relationships and sales pipeline.
          </p>

          {/* Compact Sales Performance Summary Ribbon */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-sand-100 text-charcoal font-semibold border border-warmGrey/60">
              📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-sand-100 text-navy font-semibold border border-warmGrey/60">
              🎯 Monthly Target: 10 Projects
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-sage-50 text-sage font-bold border border-sage/30">
              ✓ Converted: {convertedOrdersCount} Orders ({conversionRate}%)
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber font-bold border border-amber/30">
              ⚡ Active Pipeline: {activeLeadsCount} Leads
            </div>
          </div>
        </div>

        {/* Primary Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAddCustomerModalOpen(true)}
            className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
          
          <button
            onClick={() => setIsCreateEnquiryModalOpen(true)}
            className="px-3.5 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <span>+ Create Enquiry</span>
          </button>

          <button
            onClick={() => setIsCreateQuotationModalOpen(true)}
            className="px-3.5 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <span>+ Create Quotation</span>
          </button>
        </div>
      </div>

      {/* 2. Six Role-Specific KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="My Total Leads"
          value={totalLeadsCount}
          subValue={`${activeLeadsCount} Active in Pipeline`}
          trend={{ value: '14.2%', isPositive: true }}
          icon={Users}
          iconBgColor="bg-sand-200/70"
          iconColor="text-navy"
        />

        <KpiCard
          title="New Enquiries"
          value={newEnquiriesCount}
          subValue="Awaiting First Contact"
          icon={UserPlus}
          iconBgColor="bg-navy/10"
          iconColor="text-navy"
          badge={newEnquiriesCount > 0 ? 'Action Req' : 'Clear'}
          badgeColor={newEnquiriesCount > 0 ? 'amber' : 'sage'}
        />

        <KpiCard
          title="Follow-ups Due"
          value={followUpsDueCount}
          subValue={`${overdueFollowUps.length} Overdue • ${todayFollowUps.length} Today`}
          icon={CalendarClock}
          iconBgColor="bg-amber-50"
          iconColor="text-amber"
          badge={overdueFollowUps.length > 0 ? `${overdueFollowUps.length} Overdue` : 'On Schedule'}
          badgeColor={overdueFollowUps.length > 0 ? 'terracotta' : 'sage'}
        />

        <KpiCard
          title="Surveys Scheduled"
          value={scheduledSurveysCount}
          subValue="Allocated Field Techs"
          icon={Compass}
          iconBgColor="bg-sand-200/70"
          iconColor="text-navy"
        />

        <KpiCard
          title="Pending Quotes"
          value={pendingQuotationsCount}
          subValue={`${draftQuotesCount} Drafts • ${sentQuotesCount} Sent`}
          icon={FileText}
          iconBgColor="bg-amber-50"
          iconColor="text-amber"
        />

        <KpiCard
          title="Converted Sales"
          value={convertedOrdersCount}
          subValue={`${conversionRate}% Conversion Rate`}
          trend={{ value: '25.0%', isPositive: true }}
          icon={CheckCircle2}
          iconBgColor="bg-sage-50"
          iconColor="text-sage"
          badge="Confirmed"
          badgeColor="sage"
        />
      </div>

      {/* 3. Sales Pipeline Distribution Section */}
      <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-charcoal">Sales Pipeline Progression</h2>
            <p className="text-xs text-mutedGrey">
              Distribution of your {totalLeadsCount} assigned leads across lifecycle conversion stages. Click any stage to filter.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {pipelineStageFilter !== 'all' && (
              <button
                onClick={() => setPipelineStageFilter('all')}
                className="text-xs text-navy font-semibold hover:underline"
              >
                Clear Filter (Show All)
              </button>
            )}
            <button
              onClick={() => setIsFullPipelineOpen(!isFullPipelineOpen)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sand-100 hover:bg-sand-200 text-charcoal border border-warmGrey transition-colors"
            >
              {isFullPipelineOpen ? 'Hide Summary' : 'View Full Pipeline'}
            </button>
          </div>
        </div>

        {/* Pipeline Visual Bar Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {pipelineStages.map((stg) => {
            const isSelected = pipelineStageFilter === stg.stage;

            return (
              <button
                key={stg.stage}
                onClick={() => setPipelineStageFilter(isSelected ? 'all' : stg.stage)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  isSelected 
                    ? 'bg-navy text-white border-navy shadow-md ring-2 ring-navy/20' 
                    : 'bg-sand-50/70 hover:bg-sand-100 border-warmGrey/60 text-charcoal'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: isSelected ? '#FFFFFF' : stg.color }} 
                  />
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-sand' : 'text-mutedGrey'}`}>
                    {totalLeadsCount > 0 ? Math.round((stg.count / totalLeadsCount) * 100) : 0}%
                  </span>
                </div>

                <div className="text-lg font-bold mt-1.5 leading-none">
                  {stg.count}
                </div>

                <div className={`text-[11px] font-semibold mt-1 truncate ${isSelected ? 'text-white' : 'text-charcoal'}`}>
                  {stg.label}
                </div>

                {/* Bottom visual indicator */}
                <div 
                  className="absolute bottom-0 inset-x-0 h-1" 
                  style={{ backgroundColor: stg.color, opacity: isSelected ? 1 : 0.4 }} 
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Two-Column Operations Layout: My Customer Enquiries & Follow-up Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): My Customer Enquiries Table */}
        <div className="lg:col-span-2 bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-charcoal">My Customer Enquiries & Leads</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sand-100 text-navy border border-warmGrey">
                  {filteredEnquiries.length} Assigned
                </span>
              </div>
              <p className="text-xs text-mutedGrey mt-0.5">
                Qualified inquiries managed by you • Click customer row for 360° profile & timeline
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
                className="w-full pl-8 pr-3 py-1.5 border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            <select
              value={enquirySourceFilter}
              onChange={e => setEnquirySourceFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-warmGrey rounded-lg bg-white text-charcoal font-medium"
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
              className="px-2.5 py-1.5 border border-warmGrey rounded-lg bg-white text-charcoal font-medium"
            >
              <option value="all">All Solar Capacities</option>
              <option value="1">1 kW</option>
              <option value="2">2 kW</option>
              <option value="3">3 kW</option>
              <option value="4">4 kW</option>
              <option value="5">5 kW</option>
            </select>
          </div>

          {/* Enquiries Table */}
          <div className="overflow-x-auto border border-warmGrey/60 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Capacity & Type</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Lead Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                {filteredEnquiries.map(c => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1 Col): Follow-up Management Queue */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CalendarClock className="w-4 h-4 text-amber" />
                <h2 className="text-sm font-bold text-charcoal">Follow-up Management</h2>
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
              Never let a customer go cold. Scheduled contact agendas & callbacks.
            </p>

            {/* Follow-up Subtabs */}
            <div className="flex space-x-1 border-b border-warmGrey pb-1 text-xs">
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

              <button
                onClick={() => setFollowUpTab('completed')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  followUpTab === 'completed' ? 'bg-sage text-white' : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                Done
              </button>
            </div>

            {/* Follow-up Items Queue */}
            <div className="space-y-2.5 mt-3 max-h-[380px] overflow-y-auto pr-1">
              {activeFollowUpsList.length === 0 ? (
                <div className="text-center py-8 text-xs text-mutedGrey">
                  No follow-ups in this queue. Great job staying on track!
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

                    <p className="text-mutedGrey text-[11px] leading-snug line-clamp-2">
                      {flw.followUpReason}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-mutedGrey pt-1">
                      <span>Scheduled: {new Date(flw.scheduledDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {flw.status === 'overdue' && (
                        <span className="text-terracotta font-bold uppercase">Overdue</span>
                      )}
                    </div>

                    {/* Actions */}
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
            Open Full Follow-ups Calendar & Log
          </Link>
        </div>

      </div>

      {/* 5. Site Survey Coordination & Quotation Pipeline Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Site Survey Coordination Box */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-4">
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

          {/* Business rule banner */}
          <div className="p-3 bg-sand-100 rounded-xl border border-warmGrey text-[11px] leading-relaxed text-charcoal flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-navy shrink-0 mt-0.5" />
            <div>
              <strong>Engineering Gate Rule:</strong> A final solar quotation can only be finalized and sent to a customer after the site survey measurements and shadow analysis have been <strong>Approved</strong> by the engineering lead.
            </div>
          </div>

          {/* Survey List */}
          <div className="space-y-2.5">
            {mySurveys.slice(0, 3).map(s => (
              <div key={s.id} className="p-3.5 rounded-xl border border-warmGrey/60 bg-sand-50/60 hover:bg-sand-50 transition-colors text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-navy">{s.surveyNumber}</span>
                    <span className="font-semibold text-charcoal ml-2">{s.customerName}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                <div className="grid grid-cols-2 text-[11px] text-mutedGrey">
                  <div>Technician: <strong>{s.technicianName || 'Pending'}</strong></div>
                  <div>Scheduled: <strong>{new Date(s.scheduledDate).toLocaleDateString()}</strong></div>
                  <div>Shadow-Free: <strong>{s.shadowFreeAreaSqm ? `${s.shadowFreeAreaSqm} sq.m` : 'Pending'}</strong></div>
                  <div>Orientation: <strong>{s.roofDirection || 'Pending'} ({s.roofTiltDegrees || 0}°)</strong></div>
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
                    <span className="italic">Quotation Locked</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Link
            to="/surveys"
            className="w-full block text-center py-2 bg-sand-50 hover:bg-sand-100 text-charcoal text-xs font-semibold rounded-xl border border-warmGrey"
          >
            View All Site Surveys
          </Link>
        </div>

        {/* Quotation Management Box */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-4">
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
            <Link
              to="/quotations"
              className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs"
            >
              + Create Quote
            </Link>
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

          {/* Quotations List */}
          <div className="space-y-2.5">
            {myQuotations.slice(0, 3).map(q => (
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
            ))}
          </div>

          <Link
            to="/quotations"
            className="w-full block text-center py-2 bg-sand-50 hover:bg-sand-100 text-charcoal text-xs font-semibold rounded-xl border border-warmGrey"
          >
            Open Quotations Catalog & Builder
          </Link>
        </div>

      </div>

      {/* 6. Recent Sales Activities & Sales Performance Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Sales Activities Feed */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-charcoal">Recent Sales Activities</h2>
            <span className="text-[10px] font-semibold text-mutedGrey">Your Live Feed</span>
          </div>
          <p className="text-xs text-mutedGrey">
            Real-time trail of customer touchpoints, site survey updates & contract approvals
          </p>

          <div className="space-y-3 mt-3 max-h-80 overflow-y-auto pr-1">
            {myActivities.map(act => (
              <div key={act.id} className="p-3 bg-sand-50/80 rounded-xl border border-warmGrey/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal">{act.customerName}</span>
                  <span className="text-[10px] text-mutedGrey font-mono">{act.timestamp}</span>
                </div>
                <p className="text-mutedGrey text-[11px] leading-snug">{act.description}</p>
                {act.relatedLink && (
                  <Link to={act.relatedLink} className="text-[10px] text-navy font-semibold hover:underline block pt-0.5">
                    View record →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lead Conversion Funnel Chart */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-charcoal">Lead Conversion Velocity</h2>
            <span className="text-xs font-bold text-sage">{conversionRate}% Close Rate</span>
          </div>
          <p className="text-xs text-mutedGrey">Progression from inbound lead to contracted order</p>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadFunnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE8DE" vertical={false} />
                <XAxis dataKey="stage" stroke="#777777" fontSize={11} tickLine={false} />
                <YAxis stroke="#777777" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  formatter={(val: number) => [`${val} Records`, 'Stage Volume']}
                  contentStyle={{ backgroundColor: '#30343B', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#183153" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enquiry Source Distribution Chart */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-charcoal">Lead Acquisition Sources</h2>
            <span className="text-xs font-bold text-navy">{totalLeadsCount} Total</span>
          </div>
          <p className="text-xs text-mutedGrey">Breakdown across marketing & consultation channels</p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number, name: string) => [`${val} Leads`, name]}
                  contentStyle={{ backgroundColor: '#30343B', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-charcoal font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
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
