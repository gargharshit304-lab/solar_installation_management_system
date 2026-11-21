import React, { useState } from 'react';
import { 
  Customer, SiteSurvey, Quotation, Order, 
  FollowUpItem, CommunicationHistoryItem 
} from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Phone, Mail, MapPin, Calendar, Clock, Zap, FileText, 
  CheckCircle2, AlertCircle, Compass, ShoppingCart, 
  Plus, MessageSquare, History, ArrowRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SalesCustomerProfileModalProps {
  customer: Customer | null;
  onClose: () => void;
  onOpenScheduleFollowUp?: (customer: Customer) => void;
  onOpenCreateQuotation?: (customer: Customer) => void;
  onOpenRequestSurvey?: (customer: Customer) => void;
}

export const SalesCustomerProfileModal: React.FC<SalesCustomerProfileModalProps> = ({
  customer,
  onClose,
  onOpenScheduleFollowUp,
  onOpenCreateQuotation,
  onOpenRequestSurvey
}) => {
  const { 
    surveys, 
    quotations, 
    orders, 
    followUps, 
    communicationHistory, 
    addCommunicationRecord,
    updateCustomerLeadStatus,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'surveys' | 'quotations' | 'orders' | 'history'>('overview');
  
  // Note Form
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'call' | 'whatsapp' | 'meeting' | 'note'>('call');

  if (!customer) return null;

  const customerSurveys = surveys.filter(s => s.customerId === customer.id);
  const customerQuotes = quotations.filter(q => q.customerId === customer.id);
  const customerOrders = orders.filter(o => o.customerId === customer.id);
  const customerFollowUps = followUps.filter(f => f.customerId === customer.id);
  const customerHistory = communicationHistory.filter(h => h.customerId === customer.id);

  const approvedSurvey = customerSurveys.find(s => s.status === 'approved');

  // Customer Journey stages
  const journeyStages = [
    { title: 'Enquiry Received', isDone: true, date: customer.registrationDate },
    { title: 'First Contact', isDone: customer.leadStatus !== 'new', date: 'Day 1' },
    { title: 'Survey Requested', isDone: customerSurveys.length > 0, date: customerSurveys[0]?.scheduledDate.split('T')[0] },
    { title: 'Survey Completed', isDone: customerSurveys.some(s => s.status === 'submitted' || s.status === 'approved'), date: customerSurveys[0]?.approvedAt || 'In review' },
    { title: 'Survey Approved', isDone: !!approvedSurvey, date: approvedSurvey?.approvedAt || 'Pending' },
    { title: 'Quotation Sent', isDone: customerQuotes.length > 0, date: customerQuotes[0]?.createdDate },
    { title: 'Order Confirmed', isDone: customerOrders.length > 0, date: customerOrders[0]?.orderDate }
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addCommunicationRecord({
      customerId: customer.id,
      authorName: 'Pooja Kulkarni',
      type: noteType,
      summary: `${noteType.toUpperCase()} Record`,
      details: newNote.trim()
    });

    setNewNote('');
    showToast('Interaction note saved to customer timeline', 'success');
  };

  return (
    <Modal
      isOpen={!!customer}
      onClose={onClose}
      title={`${customer.fullName} — Customer 360° Sales Profile`}
      subtitle={`${customer.customerCode} • Enquired via ${customer.enquirySource.replace('_', ' ')} • Registered ${customer.registrationDate}`}
      maxWidth="4xl"
    >
      <div className="space-y-5">
        
        {/* Top Header Card */}
        <div className="p-4 bg-sand-50 rounded-2xl border border-warmGrey flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-charcoal">{customer.fullName}</h3>
              <StatusBadge status={customer.leadStatus} />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-mutedGrey">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-navy" />
                <span className="font-semibold text-charcoal">{customer.phone}</span>
              </span>
              {customer.email && (
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-navy" />
                  <span>{customer.email}</span>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-navy" />
                <span>{customer.address}, {customer.city}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onOpenScheduleFollowUp && (
              <button
                type="button"
                onClick={() => onOpenScheduleFollowUp(customer)}
                className="px-3 py-1.5 bg-sand-100 hover:bg-sand-200 text-charcoal font-semibold rounded-xl text-xs border border-warmGrey transition-colors"
              >
                + Schedule Follow-up
              </button>
            )}

            {approvedSurvey && onOpenCreateQuotation && (
              <button
                type="button"
                onClick={() => onOpenCreateQuotation(customer)}
                className="px-3 py-1.5 bg-navy text-white font-semibold rounded-xl text-xs hover:bg-navy-light transition-colors shadow-xs"
              >
                + Create Quotation
              </button>
            )}
          </div>
        </div>

        {/* Customer Journey Progression Timeline */}
        <div className="p-4 bg-white rounded-2xl border border-warmGrey/60 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey mb-3">
            Customer Sales Journey Progression:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
            {journeyStages.map((stage, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-xl border transition-all ${
                  stage.isDone 
                    ? 'bg-sage-50 border-sage/30 text-sage' 
                    : 'bg-sand-50/50 border-warmGrey/60 text-mutedGrey'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {stage.isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-warmGrey" />
                  )}
                </div>
                <div className="font-bold text-[11px] leading-tight text-charcoal">{stage.title}</div>
                {stage.date && (
                  <div className="text-[10px] text-mutedGrey mt-0.5 truncate">{stage.date}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-warmGrey overflow-x-auto space-x-1 pb-1 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'enquiries', label: 'Solar Requirements' },
            { id: 'surveys', label: `Site Surveys (${customerSurveys.length})` },
            { id: 'quotations', label: `Quotations (${customerQuotes.length})` },
            { id: 'orders', label: `Orders (${customerOrders.length})` },
            { id: 'history', label: `Communication (${customerHistory.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-navy text-white shadow-xs' 
                  : 'text-charcoal hover:bg-sand-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey/60">
                <span className="text-[11px] font-semibold text-mutedGrey">Proposed Solar Capacity</span>
                <p className="text-xl font-bold text-navy mt-0.5">{customer.interestedCapacityKw} kW</p>
                <span className="text-[10px] text-mutedGrey uppercase font-medium">
                  {customer.preferredSystemType.replace('_', ' ')}
                </span>
              </div>

              <div className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey/60">
                <span className="text-[11px] font-semibold text-mutedGrey">Monthly Discom Bill</span>
                <p className="text-xl font-bold text-charcoal mt-0.5">
                  ₹{customer.monthlyElectricityBill.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-sage font-semibold">
                  Est. 75-90% Bill Reduction
                </span>
              </div>

              <div className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey/60">
                <span className="text-[11px] font-semibold text-mutedGrey">Available Terrace Space</span>
                <p className="text-xl font-bold text-charcoal mt-0.5">{customer.roofSpaceSqft} sq.ft</p>
                <span className="text-[10px] text-mutedGrey">{customer.roofType}</span>
              </div>
            </div>

            {/* Quick Status Updater */}
            <div className="p-3.5 bg-sand-100 rounded-xl border border-warmGrey flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-charcoal">Update Lead Stage:</span>
                <span className="text-mutedGrey ml-2 text-[11px]">Currently in {customer.leadStatus.replace('_', ' ').toUpperCase()}</span>
              </div>
              <select
                value={customer.leadStatus}
                onChange={e => updateCustomerLeadStatus(customer.id, e.target.value as any)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-warmGrey bg-white text-charcoal focus:ring-1 focus:ring-navy"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="survey_scheduled">Survey Scheduled</option>
                <option value="survey_completed">Survey Completed</option>
                <option value="quotation_sent">Quotation Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="converted">Converted (Order)</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {customer.notes && (
              <div className="p-3 bg-white rounded-xl border border-warmGrey/60 text-xs">
                <strong className="text-charcoal block mb-1">Requirement Notes:</strong>
                <p className="text-mutedGrey">{customer.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Solar Requirements */}
        {activeTab === 'enquiries' && (
          <div className="p-4 bg-sand-50 rounded-xl border border-warmGrey space-y-3 text-xs">
            <h4 className="font-bold text-charcoal text-sm">Customer Solar Technical Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-charcoal">
              <div className="p-2.5 bg-white rounded-lg border border-warmGrey/60">
                <span className="text-mutedGrey block text-[11px]">Target Generation Capacity</span>
                <strong className="text-navy text-sm">{customer.interestedCapacityKw} kW</strong>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-warmGrey/60">
                <span className="text-mutedGrey block text-[11px]">Preferred System Architecture</span>
                <strong className="text-charcoal text-sm uppercase">{customer.preferredSystemType.replace('_', ' ')}</strong>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-warmGrey/60">
                <span className="text-mutedGrey block text-[11px]">Average Monthly Power Expense</span>
                <strong className="text-charcoal text-sm">₹{customer.monthlyElectricityBill.toLocaleString('en-IN')}</strong>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-warmGrey/60">
                <span className="text-mutedGrey block text-[11px]">Estimated Usable Shadow-Free Roof</span>
                <strong className="text-charcoal text-sm">{customer.roofSpaceSqft} sq.ft ({customer.roofType})</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Site Surveys */}
        {activeTab === 'surveys' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal">Site Surveys for {customer.fullName}</span>
              {onOpenRequestSurvey && (
                <button
                  type="button"
                  onClick={() => onOpenRequestSurvey(customer)}
                  className="px-3 py-1 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
                >
                  + Request Survey
                </button>
              )}
            </div>

            {customerSurveys.length === 0 ? (
              <div className="text-center py-8 text-xs text-mutedGrey bg-sand-50 rounded-xl border border-warmGrey/60">
                No site surveys recorded yet. Click above to request a terrace shadow survey.
              </div>
            ) : (
              customerSurveys.map(s => (
                <div key={s.id} className="p-4 bg-sand-50 rounded-xl border border-warmGrey text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-navy">{s.surveyNumber}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-charcoal">
                    <div><strong>Technician:</strong> {s.technicianName || 'Pending'}</div>
                    <div><strong>Scheduled:</strong> {new Date(s.scheduledDate).toLocaleDateString()}</div>
                    <div><strong>Shadow-Free Area:</strong> {s.shadowFreeAreaSqm ? `${s.shadowFreeAreaSqm} sq.m` : 'Pending'}</div>
                    <div><strong>Azimuth / Tilt:</strong> {s.roofDirection || 'Pending'} ({s.roofTiltDegrees || 0}°)</div>
                  </div>
                  {s.technicianObservations && (
                    <div className="p-2 bg-white rounded border border-warmGrey/60 text-mutedGrey mt-2">
                      <strong>Technician Notes:</strong> {s.technicianObservations}
                    </div>
                  )}
                  {s.status === 'approved' && (
                    <div className="flex items-center space-x-1.5 text-sage font-bold text-xs pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Survey Approved — Ready to generate formal quotation</span>
                    </div>
                  )}
                  {s.status !== 'approved' && (
                    <div className="flex items-center space-x-1.5 text-amber font-semibold text-[11px] pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Quotation finalization disabled until engineering approval is signed off.</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Quotations */}
        {activeTab === 'quotations' && (
          <div className="space-y-3">
            {customerQuotes.length === 0 ? (
              <div className="text-center py-8 text-xs text-mutedGrey bg-sand-50 rounded-xl border border-warmGrey/60">
                No quotations issued yet.
              </div>
            ) : (
              customerQuotes.map(q => (
                <div key={q.id} className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy">{q.quotationNumber} — {q.packageName}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <div className="flex justify-between items-center text-charcoal">
                    <span>Contract Price: <strong className="text-navy text-sm">₹{q.totalAmount.toLocaleString('en-IN')}</strong></span>
                    <span className="text-mutedGrey">Valid Until: {q.validUntil}</span>
                  </div>
                  <p className="text-[11px] text-mutedGrey font-medium">Terms: {q.paymentTerms}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {customerOrders.length === 0 ? (
              <div className="text-center py-8 text-xs text-mutedGrey bg-sand-50 rounded-xl border border-warmGrey/60">
                No orders confirmed yet for this customer.
              </div>
            ) : (
              customerOrders.map(o => (
                <div key={o.id} className="p-3.5 bg-sand-50 rounded-xl border border-warmGrey text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy">{o.orderNumber} ({o.capacityKw} kW)</span>
                    <StatusBadge status={o.orderStatus} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-charcoal">
                    <div>Total Value: <strong>₹{o.totalOrderValue.toLocaleString('en-IN')}</strong></div>
                    <div>Advance Paid: <strong className="text-sage">₹{o.advanceAmountPaid.toLocaleString('en-IN')}</strong></div>
                    <div>Balance: <strong className="text-terracotta">₹{o.outstandingBalance.toLocaleString('en-IN')}</strong></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 6: Communication History & Notes */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            
            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="p-3 bg-sand-50 rounded-xl border border-warmGrey space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal">Log Interaction / Add Note:</span>
                <div className="flex space-x-1 text-xs">
                  {(['call', 'whatsapp', 'meeting', 'note'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNoteType(t)}
                      className={`px-2 py-0.5 rounded capitalize text-[11px] font-semibold ${
                        noteType === t ? 'bg-navy text-white' : 'bg-white text-charcoal border border-warmGrey'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Details of call, WhatsApp conversation, customer objections or requirements..."
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:ring-1 focus:ring-navy"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
                >
                  Save Note
                </button>
              </div>
            </form>

            {/* History Feed */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customerHistory.map(item => (
                <div key={item.id} className="p-3 bg-white rounded-xl border border-warmGrey/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal">{item.summary}</span>
                    <span className="text-[10px] text-mutedGrey font-mono">{item.timestamp}</span>
                  </div>
                  {item.details && <p className="text-mutedGrey text-[11px]">{item.details}</p>}
                  <span className="text-[10px] text-navy font-semibold block">By {item.authorName}</span>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </Modal>
  );
};
