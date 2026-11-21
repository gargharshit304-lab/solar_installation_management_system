import React, { useState } from 'react';
import { 
  Building, CheckCircle2, Clock, AlertTriangle, FileText, 
  Search, Filter, Plus, ExternalLink, IndianRupee, ShieldCheck, 
  ArrowRight, Download, Eye, CheckSquare, XSquare, Landmark
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SubsidyApplication, SubsidyStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const SubsidyTrackingPage: React.FC = () => {
  const { 
    subsidyApplications, 
    updateSubsidyStatus, 
    submitSubsidyApplication,
    customers,
    orders,
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [discomFilter, setDiscomFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<SubsidyApplication | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Application Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [discomName, setDiscomName] = useState('MSEDCL (Maharashtra State Electricity Distribution)');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [capacityKw, setCapacityKw] = useState(3.0);
  const [subsidyAmount, setSubsidyAmount] = useState(78000);

  const filteredApps = subsidyApplications.filter(app => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = app.customerName.toLowerCase().includes(term) ||
                          app.applicationNumber.toLowerCase().includes(term) ||
                          app.consumerNumber.toLowerCase().includes(term) ||
                          (app.nationalPortalRef && app.nationalPortalRef.toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesDiscom = discomFilter === 'all' || app.discomName.toLowerCase().includes(discomFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesDiscom;
  });

  // KPI Calculations
  const totalApps = subsidyApplications.length;
  const inReviewCount = subsidyApplications.filter(a => a.status === 'submitted' || a.status === 'under_review' || a.status === 'documents_pending').length;
  const approvedCount = subsidyApplications.filter(a => a.status === 'approved').length;
  const disbursedTotal = subsidyApplications
    .filter(a => a.status === 'disbursed')
    .reduce((sum, a) => sum + (a.disbursedAmount || a.applicationAmount), 0);

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    submitSubsidyApplication({
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      consumerNumber: consumerNumber || `0${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      discomName,
      capacityKw,
      sanctionLoadKw: capacityKw,
      applicationAmount: subsidyAmount,
      schemeName: 'PM Surya Ghar: Muft Bijli Yojana',
      nationalPortalRef: `PMSG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'submitted',
      documents: [
        { name: 'Latest MSEDCL Electricity Bill', type: 'electricity_bill', uploaded: true, verified: true },
        { name: 'Customer Aadhaar Card (KYC)', type: 'aadhaar', uploaded: true, verified: true },
        { name: 'Bank Passbook / Cancelled Cheque (DBT)', type: 'bank_passbook', uploaded: true, verified: true },
        { name: 'Rooftop Self Undertaking & Inspection', type: 'roof_undertaking', uploaded: true, verified: true },
        { name: 'Solar Commissioning & Grid Inverter Report', type: 'commissioning_report', uploaded: true, verified: true }
      ]
    });

    setIsCreateModalOpen(false);
  };

  const handleProgressStatus = (app: SubsidyApplication) => {
    if (app.status === 'documents_pending') {
      updateSubsidyStatus(app.id, 'submitted', 'All required KYC and Discom documents uploaded');
    } else if (app.status === 'submitted') {
      updateSubsidyStatus(app.id, 'under_review', 'Discom technical inspection scheduled on national portal');
    } else if (app.status === 'under_review') {
      updateSubsidyStatus(app.id, 'approved', 'Discom net meter synchronization verified; Central DBT approved');
    } else if (app.status === 'approved') {
      updateSubsidyStatus(app.id, 'disbursed', 'DBT direct bank transfer credited into consumer account');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">PM Surya Ghar Subsidy Management</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Central DBT subsidy tracking, DISCOM synchronization & document compliance lifecycle
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Subsidy Filing</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-card border border-warmGrey/60 shadow-card">
          <div className="flex items-center justify-between text-mutedGrey mb-2">
            <span className="text-xs font-semibold">Total Filings</span>
            <Landmark className="w-4 h-4 text-navy" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{totalApps}</div>
          <div className="text-[11px] text-mutedGrey mt-1">National Portal registry</div>
        </div>

        <div className="bg-white p-4 rounded-card border border-warmGrey/60 shadow-card">
          <div className="flex items-center justify-between text-mutedGrey mb-2">
            <span className="text-xs font-semibold">In DISCOM Review</span>
            <Clock className="w-4 h-4 text-amber" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{inReviewCount}</div>
          <div className="text-[11px] text-mutedGrey mt-1">Inspection & Net-metering</div>
        </div>

        <div className="bg-white p-4 rounded-card border border-warmGrey/60 shadow-card">
          <div className="flex items-center justify-between text-mutedGrey mb-2">
            <span className="text-xs font-semibold">Sanctioned & Approved</span>
            <CheckCircle2 className="w-4 h-4 text-sage" />
          </div>
          <div className="text-2xl font-bold text-sage-dark">{approvedCount}</div>
          <div className="text-[11px] text-mutedGrey mt-1">Awaiting bank DBT transfer</div>
        </div>

        <div className="bg-white p-4 rounded-card border border-warmGrey/60 shadow-card">
          <div className="flex items-center justify-between text-mutedGrey mb-2">
            <span className="text-xs font-semibold">DBT Disbursed (Total)</span>
            <IndianRupee className="w-4 h-4 text-navy" />
          </div>
          <div className="text-2xl font-bold text-navy">₹{disbursedTotal.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-mutedGrey mt-1">Credited to customer accounts</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-mutedGrey absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customer, application #, consumer #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-warmGrey rounded-lg bg-white text-charcoal"
          >
            <option value="all">All Subsidy Stages</option>
            <option value="documents_pending">Documents Pending</option>
            <option value="submitted">Submitted to Portal</option>
            <option value="under_review">Under DISCOM Review</option>
            <option value="approved">Approved & Sanctioned</option>
            <option value="disbursed">DBT Disbursed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <select
            value={discomFilter}
            onChange={e => setDiscomFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-warmGrey rounded-lg bg-white text-charcoal"
          >
            <option value="all">All DISCOMs</option>
            <option value="MSEDCL">MSEDCL (Maharashtra)</option>
            <option value="Tata Power">Tata Power Mumbai</option>
            <option value="Adani Electricity">Adani Electricity</option>
            <option value="BESCOM">BESCOM (Karnataka)</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Application #</th>
                <th className="py-3 px-4">Customer & Phone</th>
                <th className="py-3 px-4">DISCOM & Consumer #</th>
                <th className="py-3 px-4">Capacity & Eligible Subsidy</th>
                <th className="py-3 px-4">National Portal Ref</th>
                <th className="py-3 px-4">Doc Compliance</th>
                <th className="py-3 px-4">Subsidy Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredApps.map(app => {
                const verifiedDocsCount = (app.documents || []).filter(d => d.verified).length;
                const totalDocs = (app.documents || []).length;
                const isFullyCompliant = totalDocs > 0 && verifiedDocsCount === totalDocs;

                return (
                  <tr key={app.id} className="hover:bg-sand-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy whitespace-nowrap">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal">{app.customerName}</div>
                      <div className="text-[11px] text-mutedGrey">{app.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal truncate max-w-[150px]" title={app.discomName}>
                        {app.discomName}
                      </div>
                      <div className="text-[11px] font-mono text-mutedGrey">{app.consumerNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-navy">₹{app.applicationAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-mutedGrey">{app.capacityKw} kW System</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal whitespace-nowrap">
                      {app.nationalPortalRef || 'Pending submission'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                        isFullyCompliant 
                          ? 'bg-sage/10 text-sage-dark border-sage/30' 
                          : 'bg-amber/10 text-amber-700 border-amber/30'
                      }`}>
                        <span>{verifiedDocsCount}/{totalDocs} Docs</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1 bg-sand-100 hover:bg-navy hover:text-white text-charcoal font-semibold rounded-lg text-xs transition-colors"
                      >
                        Inspect
                      </button>
                      {app.status !== 'disbursed' && app.status !== 'rejected' && (
                        <button
                          onClick={() => handleProgressStatus(app)}
                          className="px-2.5 py-1 bg-navy hover:bg-navy-light text-white font-semibold rounded-lg text-xs transition-colors"
                        >
                          {app.status === 'documents_pending' ? 'Submit' : 
                           app.status === 'submitted' ? 'Mark Review' : 
                           app.status === 'under_review' ? 'Sanction' : 'Confirm DBT'}
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

      {/* Inspect / Detailed View Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Subsidy Dossier — ${selectedApp.applicationNumber}`}
          subtitle={`${selectedApp.customerName} • ${selectedApp.schemeName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 bg-sand-50 rounded-xl border border-warmGrey">
              <div>
                <span className="text-mutedGrey block">Consumer Number:</span>
                <span className="font-mono font-bold text-charcoal">{selectedApp.consumerNumber}</span>
              </div>
              <div>
                <span className="text-mutedGrey block">National Portal Reference:</span>
                <span className="font-mono font-bold text-navy">{selectedApp.nationalPortalRef || 'N/A'}</span>
              </div>
              <div>
                <span className="text-mutedGrey block">DISCOM:</span>
                <span className="font-semibold text-charcoal">{selectedApp.discomName}</span>
              </div>
              <div>
                <span className="text-mutedGrey block">Eligible Central DBT:</span>
                <span className="font-bold text-sage">₹{selectedApp.applicationAmount.toLocaleString('en-IN')} ({selectedApp.capacityKw} kW)</span>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Mandatory Compliance Checklist (National Portal)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(selectedApp.documents || []).map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-warmGrey/60 bg-white">
                    <span className="text-charcoal font-medium text-[11px]">
                      {doc.name}
                    </span>
                    {doc.verified ? (
                      <span className="flex items-center text-sage font-bold text-[11px] space-x-1 shrink-0 ml-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="flex items-center text-amber font-bold text-[11px] space-x-1 shrink-0 ml-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedApp.remarks && (
              <div className="p-3 bg-white rounded-lg border border-warmGrey text-xs">
                <span className="font-bold text-charcoal block mb-0.5">Application Notes:</span>
                <p className="text-mutedGrey">{selectedApp.remarks}</p>
              </div>
            )}

            <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create New Filing Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="File New PM Surya Ghar Subsidy Application"
          subtitle="Generate national portal submission record and link customer consumer number"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateApplication} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Select Customer *</label>
              <select
                value={customerId}
                onChange={e => {
                  setCustomerId(e.target.value);
                  const c = customers.find(x => x.id === e.target.value);
                  if (c) setCapacityKw(c.interestedCapacityKw);
                }}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.city}) — {c.interestedCapacityKw} kW target
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">DISCOM Utility Provider *</label>
              <select
                value={discomName}
                onChange={e => setDiscomName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                <option value="MSEDCL (Maharashtra State Electricity Distribution)">MSEDCL (Maharashtra)</option>
                <option value="Tata Power Mumbai">Tata Power Mumbai</option>
                <option value="Adani Electricity Mumbai">Adani Electricity Mumbai</option>
                <option value="BESCOM (Bangalore Electricity Supply)">BESCOM (Karnataka)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Electricity Bill Consumer Number *</label>
              <input
                type="text"
                required
                value={consumerNumber}
                onChange={e => setConsumerNumber(e.target.value)}
                placeholder="e.g. 01284920194"
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Capacity (kW)</label>
                <input
                  type="number"
                  step="0.5"
                  value={capacityKw}
                  onChange={e => {
                    const cap = parseFloat(e.target.value) || 0;
                    setCapacityKw(cap);
                    if (cap <= 1) setSubsidyAmount(30000);
                    else if (cap <= 2) setSubsidyAmount(60000);
                    else setSubsidyAmount(78000);
                  }}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Eligible Central DBT (₹)</label>
                <input
                  type="number"
                  value={subsidyAmount}
                  onChange={e => setSubsidyAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg text-sage font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light shadow-xs"
              >
                Submit Application
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
