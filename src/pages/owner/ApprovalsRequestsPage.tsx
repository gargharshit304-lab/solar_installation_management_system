import React, { useState } from 'react';
import { 
  CheckSquare, Clock, CheckCircle2, XCircle, AlertCircle, 
  HelpCircle, Search, Filter, IndianRupee, FileText, 
  User, Building2, Eye, MessageSquare, Paperclip, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApprovalRequest, ApprovalCategory, ApprovalStatus } from '../../types';

export const ApprovalsRequestsPage: React.FC = () => {
  const { approvals, approveRequest, rejectRequest, requestMoreInfo, showToast } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Drawer state
  const [activeRequest, setActiveRequest] = useState<ApprovalRequest | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'info' | null>(null);
  const [actionInput, setActionInput] = useState('');

  const filteredApprovals = approvals.filter(req => {
    const matchesCategory = selectedCategory === 'all' || req.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;
    const matchesSearch = 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.department.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  const handleApprove = (req: ApprovalRequest) => {
    approveRequest(req.id, 'Approved by Owner Vikramaditya Rao');
    if (activeRequest?.id === req.id) {
      setActiveRequest({ ...req, status: 'approved', reviewedBy: 'Vikramaditya Rao' });
    }
  };

  const handleOpenReject = (req: ApprovalRequest) => {
    setActiveRequest(req);
    setActionType('reject');
    setActionInput('');
  };

  const handleOpenInfo = (req: ApprovalRequest) => {
    setActiveRequest(req);
    setActionType('info');
    setActionInput('');
  };

  const handleSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    if (actionType === 'reject') {
      if (!actionInput.trim()) {
        showToast('Please provide a reason for rejection', 'error');
        return;
      }
      rejectRequest(activeRequest.id, actionInput);
      setActiveRequest(prev => prev ? { ...prev, status: 'rejected', remarks: actionInput } : null);
    } else if (actionType === 'info') {
      if (!actionInput.trim()) {
        showToast('Please specify the questions or information required', 'error');
        return;
      }
      requestMoreInfo(activeRequest.id, actionInput);
      setActiveRequest(prev => prev ? { ...prev, status: 'info_requested', remarks: actionInput } : null);
    }

    setActionType(null);
    setActionInput('');
  };

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Categories' },
    { key: 'purchase_order', label: 'Purchase Orders' },
    { key: 'expense', label: 'Expenses & Reimbursements' },
    { key: 'supplier_payment', label: 'Supplier Payments' },
    { key: 'discount', label: 'Client Discounts' },
    { key: 'leave', label: 'Leave Requests' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">Approvals & Authorization Inbox</h1>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber font-mono text-[10px] font-bold rounded-full border border-amber-200">
                {pendingCount} Pending Sign-Off
              </span>
            )}
          </div>
          <p className="text-xs text-mutedGrey mt-0.5">
            Owner authorization center for high-value purchases, client discounts, travel expenses and leaves
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setSelectedStatus('pending')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            selectedStatus === 'pending'
              ? 'bg-white border-amber ring-2 ring-amber/20 shadow-[0_5px_18px_rgba(196,138,66,0.16)]'
              : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-mutedGrey mb-1">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber" />
          </div>
          <div className="text-2xl font-bold text-amber">{pendingCount}</div>
          <span className="text-[11px] text-mutedGrey">Action required by Owner</span>
        </div>

        <div 
          onClick={() => setSelectedStatus('approved')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            selectedStatus === 'approved'
              ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-[0_5px_18px_rgba(196,138,66,0.16)]'
              : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-mutedGrey mb-1">
            <span>Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{approvedCount}</div>
          <span className="text-[11px] text-emerald-600">Authorized & processed</span>
        </div>

        <div 
          onClick={() => setSelectedStatus('rejected')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            selectedStatus === 'rejected'
              ? 'bg-white border-terracotta ring-2 ring-terracotta/20 shadow-[0_5px_18px_rgba(196,138,66,0.16)]'
              : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-mutedGrey mb-1">
            <span>Declined / Rejected</span>
            <XCircle className="w-4 h-4 text-terracotta" />
          </div>
          <div className="text-2xl font-bold text-terracotta">{rejectedCount}</div>
          <span className="text-[11px] text-mutedGrey">Requests denied</span>
        </div>

        <div 
          onClick={() => setSelectedStatus('all')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            selectedStatus === 'all'
              ? 'bg-white border-navy ring-2 ring-navy/20 shadow-[0_5px_18px_rgba(196,138,66,0.16)]'
              : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-mutedGrey mb-1">
            <span>Total Requests</span>
            <CheckSquare className="w-4 h-4 text-navy" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{approvals.length}</div>
          <span className="text-[11px] text-mutedGrey">All categories combined</span>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="bg-white rounded-2xl p-4 border border-warmGrey/60 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, request #, employee name, or department..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="pending">Status: Pending Only</option>
              <option value="approved">Status: Approved</option>
              <option value="rejected">Status: Rejected</option>
              <option value="info_requested">Status: Info Requested</option>
              <option value="all">Status: Show All</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.key;
            const count = cat.key === 'all' 
              ? approvals.length 
              : approvals.filter(a => a.category === cat.key).length;

            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap text-xs ${
                  isSelected 
                    ? 'bg-navy text-white shadow-xs' 
                    : 'bg-sand-100 text-charcoal hover:bg-sand-200'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Approvals Feed List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Request Cards List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredApprovals.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-mutedGrey text-xs border border-warmGrey/60">
              No approval requests found matching the active filters.
            </div>
          ) : (
            filteredApprovals.map(req => {
              const isSelected = activeRequest?.id === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setActiveRequest(req)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white border-navy ring-2 ring-navy/10 shadow-[0_5px_18px_rgba(196,138,66,0.16)]'
                      : 'bg-white border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] hover:shadow-card-hover hover:border-warmGrey'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] text-mutedGrey font-bold">
                          {req.requestNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sand-100 text-charcoal">
                          {req.department}
                        </span>
                        {req.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-terracotta border border-rose-200">
                            Urgent Priority
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-charcoal leading-snug">
                        {req.title}
                      </h3>

                      <p className="text-xs text-mutedGrey line-clamp-2 mt-1">
                        {req.justification}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {req.amount !== undefined && (
                        <div className="text-sm font-bold font-mono text-navy">
                          ₹{req.amount.toLocaleString()}
                        </div>
                      )}
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        req.status === 'rejected' ? 'bg-rose-50 text-terracotta border border-rose-200' :
                        req.status === 'info_requested' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber border border-amber-200'
                      }`}>
                        {req.status === 'info_requested' ? 'Info Requested' : req.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs text-mutedGrey">
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-navy" />
                      <span>Requested by <strong className="text-charcoal">{req.requestedByName}</strong> ({req.requestedByRole})</span>
                    </div>
                    <span>{new Date(req.createdDate).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Request Detail Drawer / Action Card */}
        <div className="space-y-4">
          {activeRequest ? (
            <div className="bg-white rounded-2xl p-6 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] space-y-4 sticky top-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs text-mutedGrey font-bold">{activeRequest.requestNumber}</span>
                  <h3 className="font-bold text-base text-charcoal mt-0.5">{activeRequest.title}</h3>
                </div>
                <button 
                  onClick={() => setActiveRequest(null)}
                  className="text-mutedGrey hover:text-charcoal lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {activeRequest.amount !== undefined && (
                <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60 flex items-center justify-between">
                  <span className="text-xs text-mutedGrey font-semibold">Total Authorizable Amount:</span>
                  <span className="text-lg font-bold font-mono text-navy">₹{activeRequest.amount.toLocaleString()}</span>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-mutedGrey block font-semibold text-[11px] uppercase tracking-wider">Employee Justification</span>
                  <p className="mt-1 text-charcoal bg-sand-50/50 p-3 rounded-xl border border-warmGrey/40 leading-relaxed">
                    {activeRequest.justification}
                  </p>
                </div>

                {activeRequest.lineItems && activeRequest.lineItems.length > 0 && (
                  <div>
                    <span className="text-mutedGrey block font-semibold text-[11px] uppercase tracking-wider mb-1">Line Item Breakdown</span>
                    <div className="space-y-1.5">
                      {activeRequest.lineItems.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-sand-50/70 rounded-lg border border-warmGrey/40 flex justify-between text-xs">
                          <div>
                            <div className="font-semibold text-charcoal">{item.description}</div>
                            <div className="text-[10px] text-mutedGrey font-mono">Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString()}</div>
                          </div>
                          <div className="font-mono font-bold text-navy">₹{item.total.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeRequest.attachments && activeRequest.attachments.length > 0 && (
                  <div>
                    <span className="text-mutedGrey block font-semibold text-[11px] uppercase tracking-wider mb-1">Attached Documentation</span>
                    <div className="space-y-1">
                      {activeRequest.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs text-navy p-2 bg-sand-50 rounded-lg border border-warmGrey/40">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span className="truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeRequest.remarks && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                    <span className="font-bold text-amber block text-[11px]">Audit / Reviewer Remarks:</span>
                    <p className="text-charcoal mt-0.5">{activeRequest.remarks}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons for Owner */}
              {activeRequest.status === 'pending' && (
                <div className="pt-4 border-t border-warmGrey/60 space-y-2">
                  <button
                    onClick={() => handleApprove(activeRequest)}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Approve Request</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenInfo(activeRequest)}
                      className="py-2 border border-warmGrey bg-white text-charcoal rounded-xl text-xs font-semibold hover:bg-sand-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-navy" />
                      <span>Request Info</span>
                    </button>

                    <button
                      onClick={() => handleOpenReject(activeRequest)}
                      className="py-2 border border-rose-300 bg-rose-50 text-terracotta rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-mutedGrey text-xs border border-warmGrey/60">
              Select an approval item from the list to review justification, bill-of-materials, and authorize.
            </div>
          )}
        </div>

      </div>

      {/* Reject / Info Prompt Modal */}
      {actionType && activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-warmGrey relative">
            <button
              onClick={() => setActionType(null)}
              className="absolute right-4 top-4 text-mutedGrey hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-charcoal mb-1">
              {actionType === 'reject' ? 'Decline Approval Request' : 'Request Additional Information'}
            </h3>
            <p className="text-xs text-mutedGrey mb-4">
              {actionType === 'reject'
                ? `Provide the reason for rejecting request ${activeRequest.requestNumber} for ${activeRequest.requestedByName}.`
                : `Specify questions or documents needed from ${activeRequest.requestedByName}.`}
            </p>

            <form onSubmit={handleSubmitAction} className="space-y-4 text-xs">
              <div>
                <label className="block text-mutedGrey font-medium mb-1">
                  {actionType === 'reject' ? 'Reason for Rejection' : 'Questions for Requester'}
                </label>
                <textarea
                  rows={4}
                  placeholder={actionType === 'reject' ? 'State why this authorization is declined...' : 'Specify additional quotes or site details needed...'}
                  value={actionInput}
                  onChange={e => setActionInput(e.target.value)}
                  className="w-full p-2.5 border border-warmGrey rounded-xl text-charcoal focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 border border-warmGrey text-charcoal rounded-xl hover:bg-sand-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-xl font-semibold shadow-xs ${
                    actionType === 'reject' ? 'bg-terracotta hover:bg-rose-700' : 'bg-navy hover:bg-navy-light'
                  }`}
                >
                  {actionType === 'reject' ? 'Confirm Rejection' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
