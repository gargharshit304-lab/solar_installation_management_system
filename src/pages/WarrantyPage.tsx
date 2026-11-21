import React, { useState } from 'react';
import { 
  ShieldCheck, Search, Filter, AlertCircle, 
  Calendar, CheckCircle2, Clock, XCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WarrantyRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const WarrantyPage: React.FC = () => {
  const { warranties, currentUser, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredWarranties = warranties.filter(w => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = w.serialNumber.toLowerCase().includes(term) ||
                          w.customerName.toLowerCase().includes(term) ||
                          w.customerPhone.includes(term) ||
                          w.orderNumber.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'all' || w.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Equipment Warranty Management</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Serial lookup, automated duration rules (Inverter 2y, Battery 2y, Panels 20y) & active coverage records
          </p>
        </div>
      </div>

      {/* Read-Only Mode Banner for Warehouse & Supply Chain */}
      {currentUser.role === 'warehouse_mgr' && (
        <div className="p-3 bg-sand-100 border border-warmGrey rounded-card flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5 text-xs text-charcoal">
            <ShieldCheck className="w-4 h-4 text-navy shrink-0" />
            <span>
              <strong>Read-Only Equipment Warranty Traceability:</strong> Hardware serial lookup and dispatch coverage verification active. (Claim adjudication managed by Client Care).
            </span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold text-navy bg-white border border-warmGrey rounded-md shrink-0">
            Read-Only View
          </span>
        </div>
      )}

      {/* Warranty Duration Rules Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-card border border-warmGrey/60 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-bold text-charcoal">
            <span className="w-2.5 h-2.5 rounded-full bg-navy" />
            <span>Solar PV Panels (Waaree / Tier 1)</span>
          </div>
          <div className="text-xl font-bold text-navy mt-1">20 Years</div>
          <p className="text-[11px] text-mutedGrey mt-1">Linear power performance warranty from delivery date</p>
        </div>

        <div className="p-4 bg-white rounded-card border border-warmGrey/60 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-bold text-charcoal">
            <span className="w-2.5 h-2.5 rounded-full bg-sage" />
            <span>Grid & Hybrid Inverters (Deye / Growatt)</span>
          </div>
          <div className="text-xl font-bold text-sage mt-1">2 Years</div>
          <p className="text-[11px] text-mutedGrey mt-1">Full replacement & PCB replacement warranty</p>
        </div>

        <div className="p-4 bg-white rounded-card border border-warmGrey/60 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-bold text-charcoal">
            <span className="w-2.5 h-2.5 rounded-full bg-amber" />
            <span>Lithium Battery Banks (LiFePO4)</span>
          </div>
          <div className="text-xl font-bold text-amber mt-1">2 Years</div>
          <p className="text-[11px] text-mutedGrey mt-1">6000 cycle depth-of-discharge manufacturing warranty</p>
        </div>
      </div>

      {/* Universal Warranty Lookup Search Bar */}
      <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by serial #, customer name, phone or order ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-warmGrey rounded-xl bg-white text-charcoal"
          >
            <option value="all">All Equipment Types</option>
            <option value="Inverters">Inverters (2Y)</option>
            <option value="Batteries">Batteries (2Y)</option>
            <option value="Solar Panels">Solar Panels (20Y)</option>
          </select>
        </div>
      </div>

      {/* Warranty Records Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Hardware Serial Number</th>
                <th className="py-3 px-4">Product Model</th>
                <th className="py-3 px-4">Customer & Contact</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4">Warranty Start — End</th>
                <th className="py-3 px-4 text-right">Coverage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {filteredWarranties.map(record => (
                <tr key={record.id} className="hover:bg-sand-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">
                    {record.serialNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-charcoal">{record.productName}</div>
                    <div className="text-[11px] text-mutedGrey">{record.category} ({record.durationYears} Years)</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-charcoal">{record.customerName}</div>
                    <div className="text-[11px] text-mutedGrey">{record.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-charcoal font-medium">
                    {record.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 text-mutedGrey">
                    {record.deliveryDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-charcoal">{record.warrantyStartDate} to {record.warrantyEndDate}</div>
                    <div className="text-[10px] text-mutedGrey">Calculated from site delivery</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
