import React, { useState } from 'react';
import { 
  HeadphonesIcon, AlertTriangle, CheckCircle2, Clock, 
  Plus, Wrench, ShieldCheck, ShieldAlert, MapPin, User,
  Phone, CalendarDays, Package, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceComplaint, TicketStatus, ComplaintPriority } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const ServiceComplaintsPage: React.FC = () => {
  const { 
    complaints, 
    customers, 
    serialNumbers, 
    warranties, 
    employees, 
    createServiceTicket, 
    updateTicketStatus, 
    showToast 
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
  const [selectedTicket, setSelectedTicket] = useState<ServiceComplaint | null>(null);

  // New Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    customerId: customers[0]?.id || '',
    equipmentSerialNumber: serialNumbers[0]?.serialNumber || '',
    productName: 'Growatt 3.3kW Dual-MPPT Inverter',
    faultDescription: '',
    faultCode: 'ERR-INV-04',
    priority: 'medium' as ComplaintPriority,
    assignedTechnicianName: 'Amit Jadhav',
    isUnderWarranty: true,
    estimatedRepairCost: 0,
    estimatedLabourCost: 0
  });

  const pendingTickets = complaints.filter(
    ticket => ticket.status !== 'resolved' && ticket.status !== 'closed'
  );
  const completedTickets = complaints.filter(
    ticket => ticket.status === 'resolved' || ticket.status === 'closed'
  );

  const filteredTickets = filterStatus === 'pending'
    ? pendingTickets
    : filterStatus === 'completed'
      ? completedTickets
      : complaints;

  const handleSerialChange = (serial: string) => {
    const matchedWar = warranties.find(w => w.serialNumber === serial && w.status === 'active');
    const isUnderWar = !!matchedWar;

    setTicketForm(prev => ({
      ...prev,
      equipmentSerialNumber: serial,
      isUnderWarranty: isUnderWar,
      estimatedRepairCost: isUnderWar ? 0 : 3500,
      estimatedLabourCost: isUnderWar ? 0 : 1500
    }));
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === ticketForm.customerId);
    if (!cust) return;

    createServiceTicket({
      customerId: cust.id,
      customerName: cust.fullName,
      customerPhone: cust.phone,
      equipmentSerialNumber: ticketForm.equipmentSerialNumber,
      productName: ticketForm.productName,
      faultDescription: ticketForm.faultDescription,
      faultCode: ticketForm.faultCode,
      priority: ticketForm.priority,
      assignedTechnicianName: ticketForm.assignedTechnicianName,
      isUnderWarranty: ticketForm.isUnderWarranty,
      estimatedRepairCost: ticketForm.estimatedRepairCost,
      estimatedLabourCost: ticketForm.estimatedLabourCost
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Service & Customer Complaints</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Post-commissioning RMA maintenance, fault diagnostics & warranty coverage adjudication
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register Service Ticket</span>
        </button>
      </div>

      {/* Task Categories */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setFilterStatus('pending')}
          className={`group text-left rounded-2xl border p-4 shadow-card transition-all duration-300 sm:p-5 ${
            filterStatus === 'pending'
              ? 'border-amber/50 bg-amber-50/70'
              : 'border-warmGrey/60 bg-white hover:-translate-y-0.5 hover:border-amber/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber transition-transform duration-300 group-hover:scale-105">
              <Clock className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-amber/30 bg-white px-2.5 py-1 text-xs font-bold text-amber">
              Pending
            </span>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-mutedGrey">Pending tasks</p>
          <p className="mt-1 text-2xl font-bold text-charcoal">{pendingTickets.length}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('completed')}
          className={`group text-left rounded-2xl border p-4 shadow-card transition-all duration-300 sm:p-5 ${
            filterStatus === 'completed'
              ? 'border-sage/50 bg-sage-50'
              : 'border-warmGrey/60 bg-white hover:-translate-y-0.5 hover:border-sage/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-50 text-sage transition-transform duration-300 group-hover:scale-105">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-sage/30 bg-white px-2.5 py-1 text-xs font-bold text-sage">
              This week
            </span>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-mutedGrey">Tasks completed this week</p>
          <p className="mt-1 text-2xl font-bold text-charcoal">{completedTickets.length}</p>
        </button>
      </div>

      {/* Tickets Table */}
      <div className="hidden bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Ticket #</th>
                <th className="py-3 px-4">Customer & Contact</th>
                <th className="py-3 px-4">Equipment Serial & Fault Code</th>
                <th className="py-3 px-4">Warranty Eligibility</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assigned Tech</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredTickets.map(ticket => (
                <tr
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="cursor-pointer hover:bg-sand-50/70 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">
                    {ticket.complaintId}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-charcoal">{ticket.customerName}</div>
                    <div className="text-[11px] text-mutedGrey">{ticket.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-charcoal">{ticket.equipmentSerialNumber}</div>
                    <div className="text-[11px] text-mutedGrey font-mono font-semibold text-terracotta">
                      Code: {ticket.faultCode}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {ticket.isUnderWarranty ? (
                      <span className="inline-flex items-center text-xs font-semibold text-sage space-x-1 bg-sage-50 px-2 py-0.5 rounded-full border border-sage/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Warranty Covered (₹0)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-semibold text-terracotta space-x-1 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta/20">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Chargeable: ₹{(ticket.estimatedRepairCost || 0) + (ticket.estimatedLabourCost || 0)}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={ticket.priority} />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-charcoal">
                    {ticket.assignedTechnicianName || 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {ticket.status !== 'resolved' && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          updateTicketStatus(ticket.id, 'resolved', 'Fault rectified and generation re-tested on site.');
                        }}
                        className="px-2.5 py-1 bg-sage text-white text-xs font-semibold rounded-lg hover:bg-sage-dark transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Task Cards */}
      <div className="space-y-3 md:hidden">
        {filteredTickets.map(ticket => (
          <button
            type="button"
            key={ticket.id}
            onClick={() => setSelectedTicket(ticket)}
            className="w-full rounded-2xl border border-warmGrey/70 bg-white p-4 text-left shadow-card transition-all duration-300 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-navy">{ticket.complaintId}</p>
                <h2 className="mt-1 truncate text-sm font-bold text-charcoal">{ticket.customerName}</h2>
              </div>
              <StatusBadge status={ticket.status} />
            </div>

            <p className="mt-3 line-clamp-2 text-xs leading-5 text-mutedGrey">{ticket.faultDescription}</p>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-warmGrey/50 pt-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-mutedGrey">Assigned technician</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-charcoal">
                  {ticket.assignedTechnicianName || 'Unassigned'}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-navy">
                <Eye className="h-4 w-4" />
                Details
              </span>
            </div>
          </button>
        ))}
        {filteredTickets.length === 0 && (
          <div className="rounded-2xl border border-warmGrey/60 bg-white p-8 text-center text-xs text-mutedGrey">
            No tasks in this category.
          </div>
        )}
      </div>

      {/* Complaint Detail Window */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Complaint Details — ${selectedTicket.complaintId}`}
          subtitle={selectedTicket.productName}
          maxWidth="4xl"
        >
          {(() => {
            const customer = customers.find(item => item.id === selectedTicket.customerId);
            return (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selectedTicket.status} />
                  <StatusBadge status={selectedTicket.priority} />
                  {selectedTicket.isUnderWarranty ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/25 bg-sage-50 px-2.5 py-1 text-xs font-semibold text-sage">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Under Warranty
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/25 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber">
                      Chargeable
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <section className="rounded-xl border border-warmGrey/70 bg-sand-50/40 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Complainee Details</h3>
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-mutedGrey">Customer</p>
                          <p className="mt-0.5 font-bold text-charcoal">{selectedTicket.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-mutedGrey">Phone</p>
                          <p className="mt-0.5 font-semibold text-charcoal">{selectedTicket.customerPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-mutedGrey">Location</p>
                          <p className="mt-0.5 font-semibold text-charcoal">
                            {customer ? `${customer.address}, ${customer.city}, ${customer.state}` : 'Location not available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-warmGrey/70 bg-sand-50/40 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Complaint Details</h3>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-mutedGrey">Ticket date</p>
                        <p className="mt-1 flex items-center gap-1.5 font-semibold text-charcoal">
                          <CalendarDays className="h-3.5 w-3.5 text-navy" />
                          {selectedTicket.complaintDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-mutedGrey">Fault code</p>
                        <p className="mt-1 font-mono font-bold text-terracotta">{selectedTicket.faultCode}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold uppercase text-mutedGrey">Equipment</p>
                        <p className="mt-1 flex items-center gap-1.5 font-semibold text-charcoal">
                          <Package className="h-3.5 w-3.5 text-navy" />
                          {selectedTicket.equipmentSerialNumber}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold uppercase text-mutedGrey">Assigned technician</p>
                        <p className="mt-1 font-semibold text-charcoal">
                          {selectedTicket.assignedTechnicianName || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="rounded-xl border border-warmGrey/70 p-4">
                  <h3 className="text-xs font-bold text-charcoal">Fault Description</h3>
                  <p className="mt-2 text-xs leading-5 text-mutedGrey">{selectedTicket.faultDescription}</p>
                  {selectedTicket.resolutionNotes && (
                    <div className="mt-4 rounded-lg border border-sage/25 bg-sage-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-sage">Resolution Notes</p>
                      <p className="mt-1 text-xs leading-5 text-charcoal">{selectedTicket.resolutionNotes}</p>
                    </div>
                  )}
                </section>

                <div className="-mx-4 mt-2 flex flex-col-reverse gap-2 border-t border-warmGrey/60 bg-white px-4 pt-3 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="min-h-11 rounded-lg border border-warmGrey px-4 text-xs font-semibold text-charcoal hover:bg-sand-50"
                  >
                    Close
                  </button>
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <button
                      type="button"
                      onClick={() => {
                        updateTicketStatus(selectedTicket.id, 'resolved', 'Fault rectified and generation re-tested on site.');
                        setSelectedTicket(null);
                      }}
                      className="min-h-11 rounded-lg bg-sage px-5 text-xs font-semibold text-white hover:bg-sage-dark"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Register Service Ticket Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Register Customer Service & Repair Ticket"
          subtitle="Record hardware breakdown or grid disconnection ticket"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Select Customer Account *</label>
              <select
                value={ticketForm.customerId}
                onChange={e => setTicketForm({ ...ticketForm, customerId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Equipment Serial Number *</label>
              <select
                value={ticketForm.equipmentSerialNumber}
                onChange={e => handleSerialChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white font-mono"
              >
                {serialNumbers.map(s => (
                  <option key={s.id} value={s.serialNumber}>
                    {s.serialNumber} — {s.productName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Fault Code</label>
                <select
                  value={ticketForm.faultCode}
                  onChange={e => setTicketForm({ ...ticketForm, faultCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white font-mono"
                >
                  <option value="ERR-INV-04">ERR-INV-04 (Grid Over-Voltage)</option>
                  <option value="ERR-EARTH-01">ERR-EARTH-01 (Earthing High Leakage)</option>
                  <option value="COMM-WIFI-FAIL">COMM-WIFI-FAIL (Datalogger Offline)</option>
                  <option value="BAT-BMS-TRIP">BAT-BMS-TRIP (Lithium Overcurrent)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Ticket Priority</label>
                <select
                  value={ticketForm.priority}
                  onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value as ComplaintPriority })}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical (Generation Halted)</option>
                </select>
              </div>
            </div>

            {/* Warranty Status Notice */}
            <div className={`p-3 rounded-xl border text-xs ${ticketForm.isUnderWarranty ? 'bg-sage-50 border-sage/30 text-sage' : 'bg-amber-50 border-amber/30 text-amber'}`}>
              <div className="font-bold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{ticketForm.isUnderWarranty ? 'Covered under Active Equipment Warranty' : 'Out of Warranty — Charges Apply'}</span>
              </div>
              <p className="text-[11px] mt-0.5 text-charcoal">
                {ticketForm.isUnderWarranty
                  ? 'Parts replacement and technician labour are covered 100% free of charge.'
                  : `Estimated Charges: Parts ₹${ticketForm.estimatedRepairCost} + Labour ₹${ticketForm.estimatedLabourCost}`}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Fault Description & Symptoms</label>
              <textarea
                rows={2}
                required
                value={ticketForm.faultDescription}
                onChange={e => setTicketForm({ ...ticketForm, faultDescription: e.target.value })}
                placeholder="Inverter red alarm light flashing, tripped MCB..."
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
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
                className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
              >
                Create Service Ticket
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
