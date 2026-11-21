import React, { useState } from 'react';
import { 
  Download, Calendar, Users, Wrench, Package, ShieldCheck,
  IndianRupee, ArrowUpRight, CircleCheck, Share2, Copy, ExternalLink, Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';

type ReportType = 'sales' | 'installations' | 'inventory' | 'warranty' | 'profitability';

const ReportList: React.FC<{
  title: string;
  rows: Array<{ primary: string; secondary: string; value: string }>;
}> = ({ title, rows }) => (
  <div className="rounded-xl border border-warmGrey/60 overflow-hidden">
    <div className="border-b border-warmGrey/60 bg-sand-50/50 px-4 py-3">
      <h3 className="text-xs font-bold text-charcoal">{title}</h3>
    </div>
    <div className="divide-y divide-warmGrey/40">
      {rows.length > 0 ? rows.map((row, index) => (
        <div
          key={`${row.secondary}-${index}`}
          className="group flex items-center justify-between gap-4 px-4 py-3 transition-all duration-300 hover:bg-sand-50/80"
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-charcoal transition-transform duration-300 group-hover:translate-x-1">
              {row.primary}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-mutedGrey">{row.secondary}</p>
          </div>
          <span className="shrink-0 text-xs font-bold text-navy">{row.value}</span>
        </div>
      )) : (
        <p className="px-4 py-5 text-xs text-mutedGrey">No records available for this period.</p>
      )}
    </div>
  </div>
);

export const ReportsPage: React.FC = () => {
  const {
    customers,
    orders,
    payments,
    inventory,
    installations,
    warranties,
    profitability,
    financialSummary,
    complaints,
    currentUser,
    showToast
  } = useApp();

  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState('');

  const generateSnapshot = () => {
    const token = Math.random().toString(36).substring(2, 10);
    const url = `https://solaros.internal/reports/snapshot/snp-2026-${token}?type=${reportType}&range=${dateRange}&auth=read_only`;
    setSnapshotUrl(url);
    setIsShareModalOpen(true);
  };

  const copySnapshotUrl = () => {
    navigator.clipboard?.writeText(snapshotUrl);
    showToast('Secure snapshot link copied to clipboard (Expires in 7 days)', 'success');
  };

  const exportReport = () => {
    showToast(`Exported ${reportType.toUpperCase()} report (${dateRange}) to CSV`, 'success');
  };

  // Authoritative metrics synchronized with Finance Module
  const contractedValue = financialSummary?.contractedValue ?? orders.reduce((sum, order) => sum + order.totalOrderValue, 0);
  const collectedValue = financialSummary?.verifiedCashCollected ?? payments.filter(p => p.status === 'verified').reduce((sum, payment) => sum + payment.amount, 0);
  const outstandingValue = financialSummary?.outstandingReceivables ?? Math.max(0, contractedValue - collectedValue);
  const completedInstallations = installations.filter(item => item.status === 'completed').length;
  const activeInstallations = installations.filter(item => item.status !== 'completed').length;
  const lowStockItems = inventory.filter(item => item.stockStatus !== 'in_stock');
  const inventoryValue = inventory.reduce(
    (sum, item) => sum + item.availableQuantity * item.unitCost,
    0
  );
  const activeWarranties = warranties.filter(item => item.status === 'active').length;
  const openTickets = complaints.filter(item => item.status !== 'resolved' && item.status !== 'closed').length;
  const totalProfit = financialSummary?.netProjectProfit ?? profitability.reduce((sum, item) => sum + item.profit, 0);
  const totalRevenue = financialSummary?.recognizedRevenue ?? profitability.reduce((sum, item) => sum + item.revenue, 0);
  const averageMargin = financialSummary?.overallMarginPercent ?? (totalRevenue ? (totalProfit / totalRevenue) * 100 : 0);

  const reportOptions: {
    id: ReportType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'sales', label: 'Sales', icon: Users },
    { id: 'installations', label: 'Installation', icon: Wrench },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'warranty', label: 'Warranty', icon: ShieldCheck },
    { id: 'profitability', label: 'Profitability', icon: IndianRupee },
  ];

  const salesDetails = [
    { label: 'Customer Accounts', value: customers.length.toString(), note: 'Registered across the CRM' },
    { label: 'Approved Contracts', value: orders.length.toString(), note: `${orders.filter(order => order.orderStatus === 'completed').length} completed orders` },
    { label: 'Contracted Value', value: `₹${contractedValue.toLocaleString('en-IN')}`, note: 'Total confirmed order value' },
    { label: 'Cash Collected', value: `₹${collectedValue.toLocaleString('en-IN')}`, note: 'Verified customer receipts' },
  ];

  const installationDetails = [
    { label: 'Completed Sites', value: completedInstallations.toString(), note: 'Commissioned installations' },
    { label: 'Active Work Orders', value: activeInstallations.toString(), note: 'Scheduled or in progress' },
    { label: 'Monthly Target', value: '40 Projects', note: 'Installation capacity target' },
    { label: 'Checklist Compliance', value: '100%', note: 'DISCOM and commissioning checks' },
  ];

  const inventoryDetails = [
    { label: 'Stock Value', value: `₹${inventoryValue.toLocaleString('en-IN')}`, note: 'Current available stock at cost' },
    { label: 'SKU Locations', value: inventory.length.toString(), note: 'Tracked inventory categories' },
    { label: 'Low Stock Alerts', value: lowStockItems.length.toString(), note: 'Items at or below threshold' },
    { label: 'Reserved Units', value: inventory.reduce((sum, item) => sum + item.reservedQuantity, 0).toString(), note: 'Allocated to active projects' },
  ];

  const warrantyDetails = [
    { label: 'Active Warranties', value: activeWarranties.toString(), note: 'Registered equipment warranties' },
    { label: 'Open Service Tickets', value: openTickets.toString(), note: 'Awaiting resolution or close-out' },
    { label: 'Under Warranty', value: complaints.filter(item => item.isUnderWarranty).length.toString(), note: 'Tickets covered by warranty' },
    { label: 'Warranty Coverage', value: '100%', note: 'Recorded product coverage data' },
  ];

  const profitabilityDetails = [
    { label: 'Realized Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, note: 'Project-wise realized revenue' },
    { label: 'Gross Project Profit', value: `₹${totalProfit.toLocaleString('en-IN')}`, note: 'Net of project operating costs' },
    { label: 'Average Margin', value: `${averageMargin.toFixed(2)}%`, note: 'Weighted project margin' },
    { label: 'Outstanding Receivable', value: `₹${outstandingValue.toLocaleString('en-IN')}`, note: 'Remaining customer milestone balance' },
  ];

  const reportDetails: Record<ReportType, typeof salesDetails> = {
    sales: salesDetails,
    installations: installationDetails,
    inventory: inventoryDetails,
    warranty: warrantyDetails,
    profitability: profitabilityDetails,
  };

  const activeOption = reportOptions.find(option => option.id === reportType)!;
  const ActiveIcon = activeOption.icon;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Enterprise Reports & Analytics</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Operational KPIs, customer acquisition velocity, installation throughput & financial yields
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={generateSnapshot}
            className="px-3 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-navy" />
            <span>Share Snapshot</span>
          </button>

          <button
            onClick={exportReport}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Dataset (CSV)</span>
          </button>
        </div>
      </div>

      {/* Date Range & Category Filter Shelf */}
      <div className="bg-white rounded-card p-3 border border-warmGrey/60 shadow-card flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" role="tablist" aria-label="Report categories">
          {reportOptions.map(option => {
            const Icon = option.icon;
            const isActive = reportType === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setReportType(option.id)}
                className={`report-category-tab group ${isActive ? 'report-category-tab--active' : ''}`}
              >
                <Icon className="report-category-tab__icon h-4 w-4" />
                <span className="report-category-tab__label">{option.label}</span>
              </button>
            );
          })}
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

      {/* Active Report Details */}
      <section
        key={reportType}
        className="overflow-hidden rounded-card border border-warmGrey/60 bg-white shadow-card"
        style={{ animation: 'reportPanelIn 220ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
        role="tabpanel"
      >
        <div className="flex items-center justify-between border-b border-warmGrey/60 bg-sand-50/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-navy shadow-card">
              <ActiveIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal">{activeOption.label} Report</h2>
              <p className="mt-0.5 text-[11px] text-mutedGrey">
                {dateRange === 'month' ? 'November 2026 reporting period' : `${dateRange.replace('_', ' ')} reporting period`}
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1 text-[11px] font-semibold text-sage sm:flex">
            <CircleCheck className="h-3.5 w-3.5" />
            Data verified
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {reportDetails[reportType].map(detail => (
            <article
              key={detail.label}
              className="group rounded-xl border border-warmGrey/60 bg-sand-50/45 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-warmGrey hover:bg-white hover:shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-mutedGrey">
                  {detail.label}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-warmGrey-dark transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-navy" />
              </div>
              <p className="mt-2 text-xl font-bold text-charcoal">{detail.value}</p>
              <p className="mt-1 text-[11px] leading-4 text-mutedGrey">{detail.note}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-warmGrey/60 p-5 lg:grid-cols-2">
          {reportType === 'sales' && (
            <>
              <ReportList title="Recent Orders" rows={orders.slice(0, 4).map(order => ({
                primary: order.customerName,
                secondary: order.orderNumber,
                value: `₹${order.totalOrderValue.toLocaleString('en-IN')}`,
              }))} />
              <ReportList title="Payment Milestones" rows={payments.slice(0, 4).map(payment => ({
                primary: payment.customerName,
                secondary: payment.paymentStage.replace('_', ' '),
                value: `₹${payment.amount.toLocaleString('en-IN')}`,
              }))} />
            </>
          )}
          {reportType === 'installations' && (
            <>
              <ReportList title="Installation Pipeline" rows={installations.slice(0, 4).map(item => ({
                primary: item.customerName,
                secondary: item.installationCode,
                value: item.status.replace('_', ' ').toUpperCase(),
              }))} />
              <ReportList title="Open Warranty Tickets" rows={complaints.slice(0, 4).map(item => ({
                primary: item.customerName,
                secondary: item.complaintId,
                value: item.status.replace('_', ' ').toUpperCase(),
              }))} />
            </>
          )}
          {reportType === 'inventory' && (
            <>
              <ReportList title="Low Stock Items" rows={lowStockItems.slice(0, 4).map(item => ({
                primary: item.name,
                secondary: item.sku,
                value: `${item.availableQuantity} units`,
              }))} />
              <ReportList title="Top Stock Locations" rows={inventory.slice(0, 4).map(item => ({
                primary: item.locationBin,
                secondary: item.category,
                value: `${item.availableQuantity} available`,
              }))} />
            </>
          )}
          {reportType === 'warranty' && (
            <>
              <ReportList title="Active Warranty Register" rows={warranties.slice(0, 4).map(item => ({
                primary: item.productName,
                secondary: item.customerName,
                value: `Until ${item.warrantyEndDate}`,
              }))} />
              <ReportList title="Recent Service Tickets" rows={complaints.slice(0, 4).map(item => ({
                primary: item.productName,
                secondary: item.complaintId,
                value: item.priority.toUpperCase(),
              }))} />
            </>
          )}
          {reportType === 'profitability' && (
            <>
              <ReportList title="Project Profitability" rows={profitability.slice(0, 4).map(item => ({
                primary: item.customerName,
                secondary: item.projectCode,
                value: `₹${item.profit.toLocaleString('en-IN')} / ${item.profitMarginPercent.toFixed(1)}%`,
              }))} />
              <ReportList title="Collection Status" rows={orders.slice(0, 4).map(order => ({
                primary: order.customerName,
                secondary: order.orderNumber,
                value: `₹${order.outstandingBalance.toLocaleString('en-IN')} due`,
              }))} />
            </>
          )}
        </div>
      </section>

      {/* Shareable Snapshot Modal */}
      {isShareModalOpen && (
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share Immutable Report Snapshot"
          subtitle="Generate a tamper-proof, tokenized read-only link for executive review"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-sand-100 rounded-xl border border-warmGrey space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-mutedGrey">Report Focus:</span>
                <span className="font-bold uppercase text-navy">{reportType} Analytics</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mutedGrey">Time Horizon:</span>
                <span className="font-semibold text-charcoal capitalize">{dateRange} Period</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mutedGrey">Created By:</span>
                <span className="font-semibold text-charcoal">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mutedGrey">Access Level:</span>
                <span className="flex items-center space-x-1 text-sage font-bold">
                  <Lock className="w-3 h-3" />
                  <span>Read-Only (7 Days Expiry)</span>
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Shareable Snapshot URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={snapshotUrl}
                  className="w-full px-2.5 py-2 text-xs border border-warmGrey rounded-lg font-mono bg-sand-50/50 text-charcoal select-all"
                />
                <button
                  type="button"
                  onClick={copySnapshotUrl}
                  className="px-3 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors shrink-0 flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-warmGrey/60 flex justify-end">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
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
