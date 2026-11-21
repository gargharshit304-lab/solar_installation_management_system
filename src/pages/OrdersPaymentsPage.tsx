import React, { useState } from 'react';
import { 
  ShoppingCart, IndianRupee, FileText, CheckCircle2, 
  CreditCard, Calendar, Eye, Plus, ArrowRight, Printer 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, PaymentRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const OrdersPaymentsPage: React.FC = () => {
  const { 
    orders, 
    payments, 
    recordPayment, 
    updateOrderStatus, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetOrderForPayment, setTargetOrderForPayment] = useState<Order | null>(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState(50000);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'upi' | 'cheque' | 'cash'>('bank_transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentStage, setPaymentStage] = useState<'advance' | 'dispatch_milestone' | 'final_commissioning'>('dispatch_milestone');

  const totalContractedValue = orders.reduce((sum, o) => sum + o.totalOrderValue, 0);
  const totalCollections = orders.reduce((sum, o) => sum + o.advanceAmountPaid, 0);
  const totalReceivables = orders.reduce((sum, o) => sum + o.outstandingBalance, 0);

  const handleOpenPayment = (order: Order) => {
    setTargetOrderForPayment(order);
    setPaymentAmount(Math.min(order.outstandingBalance, 50000));
    setTransactionRef(`TXN-${Date.now().toString().slice(-6)}`);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOrderForPayment) return;

    recordPayment({
      orderId: targetOrderForPayment.id,
      orderNumber: targetOrderForPayment.orderNumber,
      customerId: targetOrderForPayment.customerId,
      customerName: targetOrderForPayment.customerName,
      amount: paymentAmount,
      paymentMethod,
      transactionRef,
      paymentStage
    });

    setIsPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Orders & Customer Payments</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Confirmed project contracts, milestone payment receipts & official customer tax invoices
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'orders' ? 'bg-navy text-white' : 'bg-white text-charcoal border border-warmGrey hover:bg-sand-100'
            }`}
          >
            Project Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'payments' ? 'bg-navy text-white' : 'bg-white text-charcoal border border-warmGrey hover:bg-sand-100'
            }`}
          >
            Payment Receipts ({payments.length})
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card">
          <span className="text-xs text-mutedGrey font-medium">Total Contracted Orders</span>
          <p className="text-xl font-bold text-charcoal mt-1">₹{totalContractedValue.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-mutedGrey mt-1 block">Active across {orders.length} accounts</span>
        </div>
        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card">
          <span className="text-xs text-mutedGrey font-medium">Collected Cash Inflow</span>
          <p className="text-xl font-bold text-sage mt-1">₹{totalCollections.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-sage font-semibold mt-1 block">
            {((totalCollections / (totalContractedValue || 1)) * 100).toFixed(1)}% Realized
          </span>
        </div>
        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card">
          <span className="text-xs text-mutedGrey font-medium">Outstanding Milestone Balance</span>
          <p className="text-xl font-bold text-terracotta mt-1">₹{totalReceivables.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-mutedGrey mt-1 block">Due upon dispatch & net meter</span>
        </div>
      </div>

      {/* Tab: Orders View */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Contract Value</th>
                  <th className="py-3 px-4">Paid / Balance</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-sand-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal">{order.customerName}</div>
                      <div className="text-[11px] text-mutedGrey">{order.customerCity}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy">
                      {order.capacityKw} kW
                    </td>
                    <td className="py-3.5 px-4 font-bold text-charcoal">
                      ₹{order.totalOrderValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-sage">
                        Paid: ₹{order.advanceAmountPaid.toLocaleString('en-IN')}
                      </div>
                      {order.outstandingBalance > 0 ? (
                        <div className="text-[11px] text-terracotta font-medium">
                          Due: ₹{order.outstandingBalance.toLocaleString('en-IN')}
                        </div>
                      ) : (
                        <div className="text-[11px] text-sage font-bold">100% Cleared</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {order.outstandingBalance > 0 && (
                        <button
                          onClick={() => handleOpenPayment(order)}
                          className="px-2.5 py-1 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors"
                        >
                          + Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 text-charcoal font-semibold rounded-lg text-xs inline-flex items-center space-x-1 border border-warmGrey"
                      >
                        <FileText className="w-3.5 h-3.5 text-navy" />
                        <span>Tax Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Payments History View */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Stage / Milestone</th>
                  <th className="py-3 px-4">Date & Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-sand-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      {pay.paymentNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-charcoal">
                      {pay.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-charcoal">
                      {pay.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sage text-sm">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-medium text-charcoal">
                        {pay.paymentMethod.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-mutedGrey block font-mono">{pay.transactionRef}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-sand-100 text-charcoal capitalize">
                        {pay.paymentStage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-mutedGrey">
                      <div>{pay.paymentDate}</div>
                      <div className="text-[11px] text-charcoal font-medium">By {pay.recordedBy}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && targetOrderForPayment && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Record Customer Payment Receipt"
          subtitle={`Collect milestone payment for ${targetOrderForPayment.customerName} (${targetOrderForPayment.orderNumber})`}
          maxWidth="md"
        >
          <form onSubmit={handleSavePayment} className="space-y-4">
            <div className="p-3 bg-sand-100 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-mutedGrey">Total Contract:</span>
                <span className="font-bold text-charcoal">₹{targetOrderForPayment.totalOrderValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-terracotta">
                <span>Outstanding Balance:</span>
                <span className="font-bold">₹{targetOrderForPayment.outstandingBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Receipt Amount (₹) *</label>
              <input
                type="number"
                required
                max={targetOrderForPayment.outstandingBalance}
                value={paymentAmount}
                onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-bold text-navy text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                >
                  <option value="bank_transfer">NEFT / RTGS</option>
                  <option value="upi">UPI / QR Transfer</option>
                  <option value="cheque">Bank Cheque</option>
                  <option value="cash">Cash Receipt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Payment Stage</label>
                <select
                  value={paymentStage}
                  onChange={e => setPaymentStage(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                >
                  <option value="advance">Advance on Booking</option>
                  <option value="dispatch_milestone">Material Dispatch</option>
                  <option value="final_commissioning">Final Commissioning</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Bank Transaction Reference / UTR *</label>
              <input
                type="text"
                required
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="e.g. UTR-HDFC-88912400"
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-mono"
              />
            </div>

            <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
              >
                Confirm Payment Receipt
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Tax Invoice Modal */}
      {selectedOrderForInvoice && (
        <Modal
          isOpen={!!selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
          title={`Tax Invoice — ${selectedOrderForInvoice.orderNumber}`}
          subtitle="SunPower Solutions Official GST Invoice"
          maxWidth="3xl"
        >
          <div className="space-y-6 bg-white p-6 rounded-xl border border-warmGrey print:p-0 print:border-none">
            <div className="flex justify-between items-start pb-4 border-b-2 border-charcoal">
              <div>
                <h3 className="text-lg font-bold text-navy">SUNPOWER SOLUTIONS PVT LTD</h3>
                <p className="text-xs text-mutedGrey">Pune, Maharashtra • GSTIN: 27AABCS1429P1ZK</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-mutedGrey">TAX INVOICE</span>
                <p className="text-base font-mono font-bold text-navy">INV-{selectedOrderForInvoice.orderNumber}</p>
                <p className="text-xs text-mutedGrey">Date: {selectedOrderForInvoice.orderDate}</p>
              </div>
            </div>

            <div className="p-3 bg-sand-50 rounded-lg text-xs space-y-1">
              <strong>Billed To:</strong>
              <div className="font-bold text-charcoal text-sm">{selectedOrderForInvoice.customerName}</div>
              <div className="text-mutedGrey">{selectedOrderForInvoice.customerCity}, Maharashtra</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-warmGrey">
                <thead className="bg-sand-100 font-bold text-charcoal">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3">Qty</th>
                    <th className="py-2 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmGrey/60">
                  <tr>
                    <td className="py-2.5 px-3">
                      Supply & Commissioning of {selectedOrderForInvoice.capacityKw} kW Solar Rooftop System
                    </td>
                    <td className="py-2.5 px-3">1 Set</td>
                    <td className="py-2.5 px-3 text-right font-medium">₹{selectedOrderForInvoice.totalOrderValue.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-3 bg-sand-100 rounded-lg text-xs font-bold">
              <span>Total Amount Paid:</span>
              <span className="text-sage text-sm">₹{selectedOrderForInvoice.advanceAmountPaid.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-3 border-t border-warmGrey flex justify-end space-x-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-lg hover:bg-sand-100 flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5 text-navy" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderForInvoice(null)}
                className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
