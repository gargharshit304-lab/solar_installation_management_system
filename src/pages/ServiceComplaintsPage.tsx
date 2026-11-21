import React, { useState } from 'react';
import { 
  HeadphonesIcon, AlertTriangle, CheckCircle2, Clock, 
  Plus, Search, Wrench, ShieldCheck, ShieldAlert 
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
  const [filterStatus, setFilterStatus] = useState('all');

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

  const filteredTickets = complaints.filter(c => {
    return filterStatus === 'all' || c.status === filterStatus;
  });

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

      {/* Tickets Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
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
                <tr key={ticket.id} className="hover:bg-sand-50/70 transition-colors">
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
                        onClick={() => updateTicketStatus(ticket.id, 'resolved', 'Fault rectified and generation re-tested on site.')}
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
