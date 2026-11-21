import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, Download, Mail, Phone, MapPin, 
  Eye, Calendar, ArrowRight, Zap, CheckCircle2, XCircle, FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, LeadStatus, SystemType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const CustomersPage: React.FC = () => {
  const { 
    customers, 
    addCustomer, 
    updateCustomerLeadStatus, 
    surveys, 
    quotations, 
    orders, 
    warranties, 
    payments,
    showToast 
  } = useApp();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [salespersonFilter, setSalespersonFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'quotations' | 'orders' | 'warranty' | 'payments'>('overview');

  // Form State for new Customer
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    monthlyElectricityBill: 5000,
    interestedCapacityKw: 3.0,
    preferredSystemType: 'on_grid' as SystemType,
    roofSpaceSqft: 400,
    roofType: 'Flat RCC Concrete',
    enquirySource: 'website' as const,
    assignedSalesperson: 'Pooja Kulkarni',
    leadStatus: 'new' as LeadStatus,
    notes: ''
  });

  // Filter application
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm) || 
                          c.customerCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.leadStatus === statusFilter;
    const matchesSource = sourceFilter === 'all' || c.enquirySource === sourceFilter;
    const matchesCity = cityFilter === 'all' || c.city === cityFilter;
    const matchesSales = salespersonFilter === 'all' || c.assignedSalesperson === salespersonFilter;
    return matchesSearch && matchesStatus && matchesSource && matchesCity && matchesSales;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      showToast('Please fill in required customer details', 'error');
      return;
    }
    addCustomer(formData);
    setIsAddModalOpen(false);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      address: '',
      city: 'Pune',
      state: 'Maharashtra',
      monthlyElectricityBill: 5000,
      interestedCapacityKw: 3.0,
      preferredSystemType: 'on_grid',
      roofSpaceSqft: 400,
      roofType: 'Flat RCC Concrete',
      enquirySource: 'website',
      assignedSalesperson: 'Pooja Kulkarni',
      leadStatus: 'new',
      notes: ''
    });
  };

  const exportCustomersCSV = () => {
    const headers = 'ID,Name,Phone,Email,City,Capacity (kW),Type,Bill,Status,Source\n';
    const rows = filteredCustomers.map(c => 
      `"${c.customerCode}","${c.fullName}","${c.phone}","${c.email}","${c.city}",${c.interestedCapacityKw},"${c.preferredSystemType}",${c.monthlyElectricityBill},"${c.leadStatus}","${c.enquirySource}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SolarOS_Customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Customer directory exported to CSV', 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Customer Relationship Management</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Full customer lifecycle tracking across Website, Phone, WhatsApp & Site Consultations
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={exportCustomersCSV}
            className="px-3 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-navy" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy focus:border-navy"
            />
          </div>

          {/* Lead Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy focus:border-navy text-charcoal bg-white"
            >
              <option value="all">All Lead Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="survey_scheduled">Survey Scheduled</option>
              <option value="survey_completed">Survey Completed</option>
              <option value="quotation_sent">Quotation Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy focus:border-navy text-charcoal bg-white"
            >
              <option value="all">All Enquiry Sources</option>
              <option value="website">Website Form</option>
              <option value="whatsapp">WhatsApp Integration</option>
              <option value="phone_call">Phone Call</option>
              <option value="manual">Manual Entry</option>
              <option value="referral">Referral</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy focus:border-navy text-charcoal bg-white"
            >
              <option value="all">All Locations</option>
              <option value="Pune">Pune</option>
              <option value="Nashik">Nashik</option>
              <option value="Aurangabad">Aurangabad</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          {/* Salesperson Filter */}
          <div>
            <select
              value={salespersonFilter}
              onChange={e => setSalespersonFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy focus:border-navy text-charcoal bg-white"
            >
              <option value="all">All Sales Representatives</option>
              <option value="Pooja Kulkarni">Pooja Kulkarni</option>
              <option value="Kavita Shinde">Kavita Shinde</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-mutedGrey pt-1">
          <span>Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> registered customer accounts</span>
          {(searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' || cityFilter !== 'all' || salespersonFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSourceFilter('all');
                setCityFilter('all');
                setSalespersonFilter('all');
              }}
              className="text-navy font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Customer Listing Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Customer ID & Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Target Capacity</th>
                <th className="py-3 px-4">Monthly Bill</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Lead Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredCustomers.map(customer => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-sand-50/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-charcoal text-xs">{customer.fullName}</div>
                    <div className="text-[11px] font-mono text-mutedGrey">{customer.customerCode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-charcoal font-medium">{customer.phone}</div>
                    <div className="text-[11px] text-mutedGrey">{customer.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-charcoal">{customer.city}</span>
                    <span className="text-[11px] text-mutedGrey block truncate max-w-[140px]">{customer.address}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-navy">{customer.interestedCapacityKw} kW</div>
                    <div className="text-[10px] uppercase tracking-wide text-mutedGrey">
                      {customer.preferredSystemType.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-charcoal">
                    ₹{customer.monthlyElectricityBill.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-sand-100 text-[11px] font-medium capitalize text-charcoal border border-warmGrey/60">
                      {customer.enquirySource.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={customer.leadStatus} />
                  </td>
                  <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="px-2.5 py-1.5 rounded-lg bg-sand-100 hover:bg-navy hover:text-white transition-colors text-charcoal font-semibold text-xs inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Customer Enquiry"
        subtitle="Record inquiry from website, phone call, WhatsApp or field consultation"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Full Customer Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Ramesh Kadam"
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Mobile Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98200 00000"
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="ramesh@gmail.com"
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Installation Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="House/Plot No, Society, Landmark"
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Target Capacity (kW)</label>
              <select
                value={formData.interestedCapacityKw}
                onChange={e => setFormData({ ...formData, interestedCapacityKw: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                <option value={1}>1 kW (Standard)</option>
                <option value={2}>2 kW (Residential)</option>
                <option value={3}>3 kW (Family Plus)</option>
                <option value={4}>4 kW (Premium)</option>
                <option value={5}>5 kW (High-Yield)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">System Type</label>
              <select
                value={formData.preferredSystemType}
                onChange={e => setFormData({ ...formData, preferredSystemType: e.target.value as SystemType })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                <option value="on_grid">On-Grid (Net Metering)</option>
                <option value="off_grid">Off-Grid (Battery Storage)</option>
                <option value="hybrid">Hybrid (Grid + Battery)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Monthly Electricity Bill (₹)</label>
              <input
                type="number"
                value={formData.monthlyElectricityBill}
                onChange={e => setFormData({ ...formData, monthlyElectricityBill: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Enquiry Source</label>
              <select
                value={formData.enquirySource}
                onChange={e => setFormData({ ...formData, enquirySource: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                <option value="website">Website Form</option>
                <option value="whatsapp">WhatsApp Lead</option>
                <option value="phone_call">Direct Phone Call</option>
                <option value="manual">Manual Walk-in</option>
                <option value="referral">Customer Referral</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Assigned Sales Consultant</label>
              <select
                value={formData.assignedSalesperson}
                onChange={e => setFormData({ ...formData, assignedSalesperson: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                <option value="Pooja Kulkarni">Pooja Kulkarni</option>
                <option value="Kavita Shinde">Kavita Shinde</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Initial Lead Status</label>
              <select
                value={formData.leadStatus}
                onChange={e => setFormData({ ...formData, leadStatus: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                <option value="new">New Enquiry</option>
                <option value="contacted">Contacted</option>
                <option value="survey_scheduled">Survey Scheduled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Requirement Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. 3 ACs running 8 hours daytime; interested in PM Surya Ghar subsidy."
              className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>

          <div className="pt-3 border-t border-warmGrey/60 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shadow-xs"
            >
              Register Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Detailed Customer Profile Drawer / Modal with Multi-Department Tabs */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer 360° Profile — ${selectedCustomer.fullName}`}
          subtitle={`${selectedCustomer.customerCode} • Registered ${selectedCustomer.registrationDate}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-warmGrey/80 overflow-x-auto space-x-1 pb-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  activeTab === 'overview' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('surveys')}
                className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  activeTab === 'surveys' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                Site Surveys ({surveys.filter(s => s.customerId === selectedCustomer.id).length})
              </button>
              <button
                onClick={() => setActiveTab('quotations')}
                className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  activeTab === 'quotations' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                Quotations ({quotations.filter(q => q.customerId === selectedCustomer.id).length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  activeTab === 'orders' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                Orders ({orders.filter(o => o.customerId === selectedCustomer.id).length})
              </button>
              <button
                onClick={() => setActiveTab('warranty')}
                className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  activeTab === 'warranty' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                Warranties ({warranties.filter(w => w.customerId === selectedCustomer.id).length})
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                  activeTab === 'payments' ? 'bg-navy text-white' : 'text-charcoal hover:bg-sand-100'
                }`}
              >
                Payments ({payments.filter(p => p.customerId === selectedCustomer.id).length})
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60">
                    <span className="text-[11px] text-mutedGrey">Lead Status</span>
                    <div className="mt-1 flex items-center justify-between">
                      <StatusBadge status={selectedCustomer.leadStatus} />
                      <select
                        value={selectedCustomer.leadStatus}
                        onChange={e => {
                          updateCustomerLeadStatus(selectedCustomer.id, e.target.value as any);
                          setSelectedCustomer({ ...selectedCustomer, leadStatus: e.target.value as any });
                        }}
                        className="text-[11px] border border-warmGrey rounded bg-white px-2 py-0.5 ml-2 font-medium"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="survey_scheduled">Survey Sched</option>
                        <option value="survey_completed">Survey Done</option>
                        <option value="quotation_sent">Quote Sent</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60">
                    <span className="text-[11px] text-mutedGrey">Proposed Solar Capacity</span>
                    <div className="text-base font-bold text-navy mt-1">
                      {selectedCustomer.interestedCapacityKw} kW ({selectedCustomer.preferredSystemType.replace('_', ' ')})
                    </div>
                  </div>

                  <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60">
                    <span className="text-[11px] text-mutedGrey">Current Monthly Discom Bill</span>
                    <div className="text-base font-bold text-charcoal mt-1">
                      ₹{selectedCustomer.monthlyElectricityBill.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-sand-100/50 rounded-xl border border-warmGrey text-xs space-y-2">
                  <h4 className="font-bold text-charcoal">Site & Contact Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-charcoal">
                    <div><strong>Phone:</strong> {selectedCustomer.phone}</div>
                    <div><strong>Email:</strong> {selectedCustomer.email || 'N/A'}</div>
                    <div><strong>Address:</strong> {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state}</div>
                    <div><strong>Roof Area:</strong> {selectedCustomer.roofSpaceSqft} sq.ft ({selectedCustomer.roofType})</div>
                    <div><strong>Enquiry Source:</strong> <span className="capitalize">{selectedCustomer.enquirySource.replace('_', ' ')}</span></div>
                    <div><strong>Assigned Salesperson:</strong> {selectedCustomer.assignedSalesperson}</div>
                  </div>
                  {selectedCustomer.notes && (
                    <div className="pt-2 border-t border-warmGrey/60">
                      <strong>Consultant Notes:</strong> {selectedCustomer.notes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Surveys */}
            {activeTab === 'surveys' && (
              <div className="space-y-3">
                {surveys.filter(s => s.customerId === selectedCustomer.id).length === 0 ? (
                  <p className="text-xs text-mutedGrey text-center py-6">No surveys recorded yet for this customer.</p>
                ) : (
                  surveys.filter(s => s.customerId === selectedCustomer.id).map(s => (
                    <div key={s.id} className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy">{s.surveyNumber}</span>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-charcoal">
                        <div><strong>Technician:</strong> {s.technicianName || 'Unassigned'}</div>
                        <div><strong>Scheduled Date:</strong> {new Date(s.scheduledDate).toLocaleDateString()}</div>
                        <div><strong>Shadow-Free Area:</strong> {s.shadowFreeAreaSqm ? `${s.shadowFreeAreaSqm} sq.m` : 'Pending'}</div>
                        <div><strong>Roof Direction & Tilt:</strong> {s.roofDirection || 'Pending'} ({s.roofTiltDegrees}° tilt)</div>
                      </div>
                      {s.technicianObservations && (
                        <p className="text-mutedGrey bg-white p-2 rounded border border-warmGrey/60">
                          <strong>Observations:</strong> {s.technicianObservations}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Quotations */}
            {activeTab === 'quotations' && (
              <div className="space-y-3">
                {quotations.filter(q => q.customerId === selectedCustomer.id).map(q => (
                  <div key={q.id} className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy">{q.quotationNumber} — {q.packageName}</span>
                      <StatusBadge status={q.status} />
                    </div>
                    <div className="flex items-center justify-between text-charcoal">
                      <span>Total Value: <strong>₹{q.totalAmount.toLocaleString('en-IN')}</strong> (incl. taxes & installation)</span>
                      <span className="text-mutedGrey">Valid Until: {q.validUntil}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-3">
                {orders.filter(o => o.customerId === selectedCustomer.id).map(o => (
                  <div key={o.id} className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy">{o.orderNumber} ({o.capacityKw} kW)</span>
                      <StatusBadge status={o.orderStatus} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-charcoal">
                      <div>Total: <strong>₹{o.totalOrderValue.toLocaleString('en-IN')}</strong></div>
                      <div>Advance Paid: <strong className="text-sage">₹{o.advanceAmountPaid.toLocaleString('en-IN')}</strong></div>
                      <div>Due: <strong className="text-terracotta">₹{o.outstandingBalance.toLocaleString('en-IN')}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Warranties */}
            {activeTab === 'warranty' && (
              <div className="space-y-3">
                {warranties.filter(w => w.customerId === selectedCustomer.id).map(w => (
                  <div key={w.id} className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-navy">{w.serialNumber}</span>
                      <StatusBadge status={w.status} />
                    </div>
                    <p className="text-charcoal font-semibold">{w.productName}</p>
                    <div className="flex items-center justify-between text-mutedGrey text-[11px]">
                      <span>Warranty Valid: {w.warrantyStartDate} to {w.warrantyEndDate} ({w.durationYears} Years)</span>
                      <span className="text-sage font-bold">Active Guarantee</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Payments */}
            {activeTab === 'payments' && (
              <div className="space-y-3">
                {payments.filter(p => p.customerId === selectedCustomer.id).map(p => (
                  <div key={p.id} className="p-3 bg-sand-50 rounded-xl border border-warmGrey text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-charcoal">{p.paymentNumber} — ₹{p.amount.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-mutedGrey">{p.paymentMethod.toUpperCase()} • Ref: {p.transactionRef}</div>
                    </div>
                    <span className="text-mutedGrey">{p.paymentDate}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </Modal>
      )}

    </div>
  );
};
