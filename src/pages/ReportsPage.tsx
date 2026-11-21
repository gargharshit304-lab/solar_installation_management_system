import React, { useState } from 'react';
import { 
  BarChart3, Download, Calendar, Filter, FileSpreadsheet, 
  TrendingUp, Users, Wrench, ShieldCheck, IndianRupee 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsPage: React.FC = () => {
  const { customers, orders, inventory, profitability, complaints, showToast } = useApp();

  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('sales');

  const exportReport = () => {
    showToast(`Exported ${reportType.toUpperCase()} report (${dateRange}) to CSV`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Enterprise Reports & Analytics</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Operational KPIs, customer acquisition velocity, installation throughput & financial yields
          </p>
        </div>
        <button
          onClick={exportReport}
          className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Export Dataset (CSV)</span>
        </button>
      </div>

      {/* Date Range & Category Filter Shelf */}
      <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {['sales', 'installations', 'inventory', 'warranty', 'profitability'].map(type => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                reportType === type ? 'bg-navy text-white shadow-xs' : 'bg-sand-50 text-charcoal hover:bg-sand-100 border border-warmGrey'
              }`}
            >
              {type} Report
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Calendar className="w-4 h-4 text-mutedGrey" />
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="px-3 py-1.5 border border-warmGrey rounded-xl bg-white text-charcoal font-medium"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month (Nov 2026)</option>
            <option value="quarter">This Quarter (Q3 FY26)</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sales Performance Card */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-charcoal flex items-center space-x-2">
              <Users className="w-4 h-4 text-navy" />
              <span>Customer Acquisition & Conversion Velocity</span>
            </h3>
            <span className="text-xs font-bold text-sage">78.4% Conversion</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-sand-50 border border-warmGrey/60">
              <span className="text-mutedGrey">Total Inbound Inquiries:</span>
              <strong className="text-charcoal">{customers.length} Accounts</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-sand-50 border border-warmGrey/60">
              <span className="text-mutedGrey">Approved Contracts:</span>
              <strong className="text-navy">{orders.length} Executed</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-sand-50 border border-warmGrey/60">
              <span className="text-mutedGrey">Avg Solar Sizing:</span>
              <strong className="text-charcoal">4.2 kW per site</strong>
            </div>
          </div>
        </div>

        {/* Installation & Operations Yield */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-charcoal flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber" />
              <span>Installation Operational Velocity</span>
            </h3>
            <span className="text-xs font-bold text-navy">Target: 40/Mo</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-sand-50 border border-warmGrey/60">
              <span className="text-mutedGrey">Monthly Completed Projects:</span>
              <strong className="text-sage">38 Completed</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-sand-50 border border-warmGrey/60">
              <span className="text-mutedGrey">Average Installation Time:</span>
              <strong className="text-charcoal">1.8 Days per 5kW Rooftop</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-sand-50 border border-warmGrey/60">
              <span className="text-mutedGrey">Checklist Compliance:</span>
              <strong className="text-sage">100% DISCOM Net-Meter Synced</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
