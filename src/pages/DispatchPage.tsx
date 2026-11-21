import React, { useState } from 'react';
import { 
  Truck, CheckCircle2, Clock, Calendar, MapPin, 
  UserCheck, Plus, Package, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DispatchOrder } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const DispatchPage: React.FC = () => {
  const { 
    dispatches, 
    orders, 
    serialNumbers, 
    createDispatchOrder, 
    confirmDelivery, 
    showToast 
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedSerial, setSelectedSerial] = useState('');
  const [deliveryPersonnel, setDeliveryPersonnel] = useState('Tukaram Jadhav (Logistics Driver)');
  const [vehicleNumber, setVehicleNumber] = useState('MH-12-RN-8840');

  const readyOrders = orders.filter(o => o.orderStatus === 'confirmed' || o.orderStatus === 'processing' || o.orderStatus === 'ready_for_dispatch');

  const handleOpenCreate = () => {
    if (readyOrders.length > 0) {
      setSelectedOrderId(readyOrders[0].id);
      const availableSerial = serialNumbers.find(s => s.currentStatus === 'in_warehouse' || s.currentStatus === 'reserved');
      if (availableSerial) {
        setSelectedSerial(availableSerial.serialNumber);
      }
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;

    createDispatchOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      deliveryAddress: `Customer Site, ${order.customerCity}`,
      allocatedSerials: selectedSerial ? [selectedSerial] : [],
      deliveryPersonnel,
      vehicleNumber,
      deliveryStatus: 'in_transit'
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Material Dispatch & Logistics</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Fleet tracking, serial number allocation & automatic warranty commencement upon delivery
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          disabled={readyOrders.length === 0}
          className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light disabled:opacity-50 transition-colors shadow-xs flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Dispatch Order</span>
        </button>
      </div>

      {/* Warranty Automation Notification Banner */}
      <div className="bg-sand-100 border border-warmGrey rounded-xl p-3.5 flex items-start space-x-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-sage mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-charcoal">Automated Equipment Warranty Rule:</strong> As mandated by SolarOS operations policy, equipment warranties (2-Year Inverter, 2-Year Battery, 20-Year Solar Panel sets) are mathematically activated starting from the <strong>exact date and time of verified site delivery confirmation</strong>.
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Dispatch #</th>
                <th className="py-3 px-4">Order & Customer</th>
                <th className="py-3 px-4">Allocated Hardware Serials</th>
                <th className="py-3 px-4">Delivery Team & Vehicle</th>
                <th className="py-3 px-4">Dispatch Date</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {dispatches.map(dsp => (
                <tr key={dsp.id} className="hover:bg-sand-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">
                    {dsp.dispatchNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-charcoal">{dsp.customerName}</div>
                    <div className="text-[11px] text-mutedGrey">{dsp.orderNumber} • {dsp.deliveryAddress}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {dsp.allocatedSerials.length > 0 ? (
                      <span className="font-mono font-bold text-navy text-[11px] bg-sand-100 px-2 py-1 rounded border border-warmGrey/60">
                        {dsp.allocatedSerials.join(', ')}
                      </span>
                    ) : (
                      <span className="text-mutedGrey italic">Standard Package BOM</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-charcoal">{dsp.deliveryPersonnel}</div>
                    <div className="text-[11px] text-mutedGrey font-mono">{dsp.vehicleNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 text-mutedGrey font-medium">
                    {dsp.dispatchDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={dsp.deliveryStatus} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {dsp.deliveryStatus !== 'delivered' ? (
                      <button
                        onClick={() => confirmDelivery(dsp.id)}
                        className="px-3 py-1.5 bg-sage text-white text-xs font-semibold rounded-lg hover:bg-sage-dark transition-colors shadow-xs inline-flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivery & Activate Warranty</span>
                      </button>
                    ) : (
                      <span className="text-sage font-semibold text-xs inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Warranty Active</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dispatch Order Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Dispatch & Allocate Equipment"
          subtitle="Assign warehouse logistics driver and link hardware serial numbers"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateDispatch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Select Confirmed Customer Order *</label>
              <select
                value={selectedOrderId}
                onChange={e => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                {readyOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} — {o.customerName} ({o.capacityKw} kW, {o.customerCity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Allocate Inverter Serial Number *</label>
              <select
                value={selectedSerial}
                onChange={e => setSelectedSerial(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white font-mono"
              >
                {serialNumbers.map(s => (
                  <option key={s.id} value={s.serialNumber}>
                    {s.serialNumber} — {s.productName} ({s.currentStatus})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Delivery Personnel</label>
                <input
                  type="text"
                  value={deliveryPersonnel}
                  onChange={e => setDeliveryPersonnel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Vehicle License Plate</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-mono"
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
                className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
              >
                Dispatch Materials
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
