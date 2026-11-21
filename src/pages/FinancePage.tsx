import React, { useState, useMemo } from 'react';
import { 
  IndianRupee, TrendingUp, TrendingDown, DollarSign, 
  PieChart, FileText, Download, Plus, ArrowUpRight, CheckCircle2, 
  Eye, Search, Filter, Calendar, Building, User, Wrench, Package, 
  Truck, Receipt, ChevronRight, X, AlertCircle, Info, ShieldCheck,
  Check, ArrowRight, Layers, FileSpreadsheet, ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProjectProfitability, DirectExpense, FinancialTransaction, DirectExpenseCategory, ProjectFinancialDetail } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const FinancePage: React.FC = () => {
  const { 
    profitability, 
    orders, 
    payments, 
    directExpenses,
    financialTransactions,
    financialSummary,
    recordDirectExpense,
    approveDirectExpense,
    getProjectFinancialDetail,
    showToast, 
    canCreate, 
    canEdit,
    canApprove,
    canExport
  } = useApp();

  // Tab State
  const [activeTab, setActiveTab] = useState<'profitability' | 'ledger'>('profitability');

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState<{
    isCompanyLevel: boolean;
    orderId: string;
    category: DirectExpenseCategory;
    amount: number;
    vendor: string;
    expenseDate: string;
    paymentMethod: string;
    paymentStatus: 'paid' | 'pending' | 'reimbursed';
    invoiceReference: string;
    description: string;
    receiptFileName: string;
  }>({
    isCompanyLevel: false,
    orderId: orders[0]?.id || 'ord-1',
    category: 'Freight & Site Transport',
    amount: 4500,
    vendor: 'City Express Tempo Logistics',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer (NEFT)',
    paymentStatus: 'paid',
    invoiceReference: 'INV-TRP-9021',
    description: 'Site transit and module delivery freight',
    receiptFileName: 'delivery_challan_receipt.pdf'
  });

  // Project Detail Workspace Modal State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetail, setProjectDetail] = useState<ProjectFinancialDetail | null>(null);

  // Transaction Ledger Filters
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>('ALL');
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<string>('ALL');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<string>('ALL');

  // Selected order details for expense form auto-fill
  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === expenseForm.orderId) || orders[0];
  }, [orders, expenseForm.orderId]);

  // Handle open project drilldown
  const handleOpenProjectDetail = (projectIdOrOrder: string) => {
    setSelectedProjectId(projectIdOrOrder);
    const detail = getProjectFinancialDetail(projectIdOrOrder);
    setProjectDetail(detail);
  };

  // Handle Record Direct Expense Submit
  const handleRecordExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || expenseForm.amount <= 0) {
      showToast('Expense amount must be greater than zero', 'error');
      return;
    }
    if (!expenseForm.vendor.trim()) {
      showToast('Vendor / Payee name is mandatory', 'error');
      return;
    }

    try {
      setIsSubmittingExpense(true);
      await recordDirectExpense({
        projectId: expenseForm.isCompanyLevel ? undefined : selectedOrder?.id,
        projectCode: expenseForm.isCompanyLevel ? undefined : (selectedOrder?.orderNumber ? `PRJ-${selectedOrder.orderNumber.replace('ORD-', '')}` : undefined),
        orderId: expenseForm.isCompanyLevel ? undefined : selectedOrder?.id,
        orderNumber: expenseForm.isCompanyLevel ? undefined : selectedOrder?.orderNumber,
        customerName: expenseForm.isCompanyLevel ? 'SunPower Central Overhead' : selectedOrder?.customerName,
        isCompanyLevel: expenseForm.isCompanyLevel,
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        vendor: expenseForm.vendor.trim(),
        expenseDate: expenseForm.expenseDate,
        paymentMethod: expenseForm.paymentMethod,
        paymentStatus: expenseForm.paymentStatus,
        invoiceReference: expenseForm.invoiceReference.trim() || undefined,
        description: expenseForm.description.trim(),
        receiptFileName: expenseForm.receiptFileName
      });

      setIsExpenseModalOpen(false);
    } catch (err: any) {
      // Toast already shown
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  // Export Financial Ledger CSV
  const handleExportLedger = () => {
    if (!canExport('finance')) {
      showToast('Unauthorized: You lack finance.export permission to export ledger data.', 'error');
      return;
    }

    const headers = ['Transaction ID', 'Date', 'Project Code', 'Order Number', 'Customer', 'Type', 'Category', 'Reference #', 'Amount (INR)', 'Status', 'Recorded By'];
    const rows = financialTransactions.map(tx => [
      tx.transactionNumber,
      tx.date,
      tx.projectCode || 'N/A',
      tx.orderNumber || 'N/A',
      `"${tx.customerName || 'N/A'}"`,
      tx.type,
      `"${tx.category}"`,
      tx.referenceNumber || 'N/A',
      tx.amount,
      tx.status,
      `"${tx.recordedBy || tx.createdBy || 'Accounts'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `solaros_financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Authoritative Financial Ledger exported to CSV', 'success');
  };

  // Filtered transactions for the Ledger tab
  const filteredTransactions = useMemo(() => {
    return financialTransactions.filter(tx => {
      if (ledgerTypeFilter !== 'ALL' && tx.type.toLowerCase() !== ledgerTypeFilter.toLowerCase()) return false;
      if (ledgerCategoryFilter !== 'ALL' && tx.category !== ledgerCategoryFilter) return false;
      if (ledgerStatusFilter !== 'ALL' && tx.status.toLowerCase() !== ledgerStatusFilter.toLowerCase()) return false;
      if (ledgerSearch.trim()) {
        const query = ledgerSearch.toLowerCase();
        const matches = 
          tx.transactionNumber.toLowerCase().includes(query) ||
          (tx.description && tx.description.toLowerCase().includes(query)) ||
          (tx.notes && tx.notes.toLowerCase().includes(query)) ||
          (tx.customerName && tx.customerName.toLowerCase().includes(query)) ||
          (tx.orderNumber && tx.orderNumber.toLowerCase().includes(query)) ||
          (tx.projectCode && tx.projectCode.toLowerCase().includes(query)) ||
          (tx.referenceNumber && tx.referenceNumber.toLowerCase().includes(query));
        if (!matches) return false;
      }
      return true;
    });
  }, [financialTransactions, ledgerTypeFilter, ledgerCategoryFilter, ledgerStatusFilter, ledgerSearch]);

  return (
    <div className="space-y-7">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">Finance & Project Profitability</h1>
            <span className="px-2.5 py-0.5 bg-navy/10 text-navy border border-navy/20 text-[11px] font-bold rounded-md">
              Real Cashflow & P&L
            </span>
          </div>
          <p className="text-xs text-mutedGrey mt-1 max-w-2xl">
            Authoritative project ledger: Revenue - Hardware BOM Cost - Installation Crew Labour - Direct Site Expenses = Net Profit. Every rupee traces to an operational source record.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          {canExport('finance') && (
            <button
              onClick={handleExportLedger}
              className="px-3 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-navy" />
              <span>Export Ledger</span>
            </button>
          )}

          {canCreate('finance') && (
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Direct Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Read-Only Mode Banner */}
      {!canCreate('finance') && !canEdit('finance') && (
        <div className="bg-amber-50 border border-amber/30 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber/10 flex items-center justify-center text-amber shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal">Read-Only Financial View Mode Active</p>
              <p className="text-[11px] text-mutedGrey mt-0.5">
                You have view-only access to Financial Accounts & Profitability. Transaction recording, direct expense posting, and payment reconciliation require elevated authorization.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white border border-amber/30 text-amber text-[10px] font-bold rounded-lg uppercase tracking-wider">
            View Only
          </span>
        </div>
      )}

      {/* Financial Scorecards — Authoritative Reconciled Company KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Card 1: Recognized Revenue */}
        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-mutedGrey uppercase tracking-wider">Recognized Revenue</span>
              <div className="w-6 h-6 rounded-lg bg-navy/10 flex items-center justify-center text-navy">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-navy mt-2">
              ₹{financialSummary.recognizedRevenue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-warmGrey/40 flex items-center justify-between text-[10px] text-mutedGrey">
            <span>Contracted: ₹{financialSummary.contractedValue.toLocaleString('en-IN')}</span>
            <span className="font-semibold text-navy">Milestone Governed</span>
          </div>
        </div>

        {/* Card 2: Hardware BOM Cost */}
        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-mutedGrey uppercase tracking-wider">Equipment Cost</span>
              <div className="w-6 h-6 rounded-lg bg-sand-200 flex items-center justify-center text-charcoal">
                <Package className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-charcoal mt-2">
              ₹{financialSummary.totalEquipmentCost.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-warmGrey/40 flex items-center justify-between text-[10px] text-mutedGrey">
            <span>{((financialSummary.totalEquipmentCost / (financialSummary.recognizedRevenue || 1)) * 100).toFixed(1)}% of revenue</span>
            <span className="font-semibold text-charcoal">Warehouse Dispatches</span>
          </div>
        </div>

        {/* Card 3: Technician Labour Outflow */}
        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-mutedGrey uppercase tracking-wider">Labour Outflow</span>
              <div className="w-6 h-6 rounded-lg bg-sand-200 flex items-center justify-center text-charcoal">
                <Wrench className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-charcoal mt-2">
              ₹{financialSummary.totalLabourCost.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-warmGrey/40 flex items-center justify-between text-[10px] text-mutedGrey">
            <span>{((financialSummary.totalLabourCost / (financialSummary.recognizedRevenue || 1)) * 100).toFixed(1)}% of revenue</span>
            <span className="font-semibold text-charcoal">Installation Logs</span>
          </div>
        </div>

        {/* Card 4: Direct Expenses */}
        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-mutedGrey uppercase tracking-wider">Direct Site Expenses</span>
              <div className="w-6 h-6 rounded-lg bg-sand-200 flex items-center justify-center text-charcoal">
                <Receipt className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-charcoal mt-2">
              ₹{financialSummary.totalDirectExpenses.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-warmGrey/40 flex items-center justify-between text-[10px] text-mutedGrey">
            <span>Freight, DISCOM & Crane</span>
            <span className="font-semibold text-charcoal">Vendor Invoices</span>
          </div>
        </div>

        {/* Card 5: Net Project Profit & Margin */}
        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col justify-between bg-gradient-to-br from-white to-sage-50/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sage uppercase tracking-wider">Net Project Profit</span>
              <div className="w-6 h-6 rounded-lg bg-sage-50 text-sage flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-sage mt-2">
              ₹{financialSummary.netProjectProfit.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-warmGrey/40 flex items-center justify-between text-[10px]">
            <span className="font-bold text-sage">{financialSummary.overallMarginPercent}% Margin</span>
            <span className="text-mutedGrey">Weighted Yield</span>
          </div>
        </div>

        {/* Card 6: Verified Cash vs Receivables */}
        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-mutedGrey uppercase tracking-wider">Cash vs Receivables</span>
              <div className="w-6 h-6 rounded-lg bg-sand-200 flex items-center justify-center text-charcoal">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-charcoal mt-2">
              ₹{financialSummary.verifiedCashCollected.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-warmGrey/40 flex items-center justify-between text-[10px]">
            <span className="text-mutedGrey">Pending:</span>
            <span className="font-bold text-amber">₹{financialSummary.outstandingReceivables.toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      {/* Tabs Navigation & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-warmGrey/80 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('profitability')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'profitability'
                ? 'bg-navy text-white shadow-xs'
                : 'bg-white text-charcoal border border-warmGrey hover:bg-sand-50'
            }`}
          >
            Project Profitability Ledger ({profitability.length})
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'ledger'
                ? 'bg-navy text-white shadow-xs'
                : 'bg-white text-charcoal border border-warmGrey hover:bg-sand-50'
            }`}
          >
            Financial Transaction History ({financialTransactions.length})
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-mutedGrey">
          <Info className="w-3.5 h-3.5 text-navy shrink-0" />
          <span>Click any project row below to inspect its itemized financial breakdown</span>
        </div>
      </div>

      {/* TAB 1: Project Profitability Ledger */}
      {activeTab === 'profitability' && (
        <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
          <div className="p-4 border-b border-warmGrey/60 bg-sand-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal">Project-Wise Profitability Ledger</h2>
              <p className="text-[11px] text-mutedGrey">Granular project margin analysis derived from confirmed transactions</p>
            </div>
            <span className="px-2.5 py-1 bg-sage-50 text-sage border border-sage/20 text-xs font-bold rounded-full self-start sm:self-auto">
              All Projects Positive Cashflow
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                <tr>
                  <th className="py-3 px-4">Project Code</th>
                  <th className="py-3 px-4">Customer & Capacity</th>
                  <th className="py-3 px-4 text-right">Recognized Rev (₹)</th>
                  <th className="py-3 px-4 text-right">Equipment (₹)</th>
                  <th className="py-3 px-4 text-right">Labour (₹)</th>
                  <th className="py-3 px-4 text-right">Direct Exp (₹)</th>
                  <th className="py-3 px-4 text-right">Net Profit (₹)</th>
                  <th className="py-3 px-4 text-right">Margin %</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                {profitability.map(proj => (
                  <tr 
                    key={proj.id} 
                    onClick={() => handleOpenProjectDetail(proj.orderId || proj.id)}
                    className="hover:bg-sand-50/90 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      <div className="flex items-center space-x-1.5">
                        <span>{proj.projectCode}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-mutedGrey group-hover:text-navy group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-mutedGrey font-normal mt-0.5">{proj.orderNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal">{proj.customerName}</div>
                      <div className="text-[11px] text-mutedGrey">{proj.systemType} ({proj.capacityKw} kW)</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-navy">
                      <div>₹{proj.revenue.toLocaleString('en-IN')}</div>
                      {proj.contractedValue && proj.contractedValue !== proj.revenue && (
                        <div className="text-[10px] text-mutedGrey font-normal">
                          Contract: ₹{proj.contractedValue.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-mutedGrey">
                      ₹{proj.equipmentCosts.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-mutedGrey">
                      ₹{proj.labourCosts.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-mutedGrey">
                      ₹{proj.otherExpenses.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-sage text-sm">
                      ₹{proj.profit.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-navy px-2 py-0.5 rounded bg-sand-100 border border-warmGrey/60">
                        {proj.profitMarginPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={proj.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenProjectDetail(proj.orderId || proj.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-navy hover:bg-navy/10 rounded-lg transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Financial Transaction History Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          
          {/* Ledger Filter Toolbar */}
          <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-mutedGrey" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                placeholder="Search transaction ID, customer, reference..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-warmGrey rounded-xl bg-sand-50/40 focus:bg-white focus:outline-navy"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Type Filter */}
              <select
                value={ledgerTypeFilter}
                onChange={e => setLedgerTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-warmGrey rounded-xl bg-white text-charcoal font-medium"
              >
                <option value="ALL">All Types</option>
                <option value="REVENUE">Revenue Inflows</option>
                <option value="EQUIPMENT_COST">Equipment BOM</option>
                <option value="LABOUR_COST">Technician Labour</option>
                <option value="DIRECT_EXPENSE">Direct Site Expenses</option>
              </select>

              {/* Status Filter */}
              <select
                value={ledgerStatusFilter}
                onChange={e => setLedgerStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-warmGrey rounded-xl bg-white text-charcoal font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="POSTED">Posted (Cleared)</option>
                <option value="PENDING">Pending Approval</option>
              </select>

              {(ledgerSearch || ledgerTypeFilter !== 'ALL' || ledgerStatusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setLedgerSearch('');
                    setLedgerTypeFilter('ALL');
                    setLedgerStatusFilter('ALL');
                  }}
                  className="px-2.5 py-1.5 text-xs text-mutedGrey hover:text-charcoal rounded-xl bg-sand-100 font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
            <div className="p-4 border-b border-warmGrey/60 bg-sand-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal">Authoritative Financial Ledger</h2>
                <p className="text-[11px] text-mutedGrey">Complete chronological sequence of revenue receipts, hardware dispatches, labour postings & site expenses</p>
              </div>
              <span className="text-xs font-bold text-navy">
                Showing {filteredTransactions.length} of {financialTransactions.length} entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                  <tr>
                    <th className="py-3 px-4">Tx ID & Date</th>
                    <th className="py-3 px-4">Project / Order</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Category & Description</th>
                    <th className="py-3 px-4">Source & Ref</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-sand-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-navy">{tx.transactionNumber}</div>
                        <div className="text-[10px] text-mutedGrey mt-0.5">{tx.date}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-charcoal">{tx.customerName || 'Company Central'}</div>
                        <div className="font-mono text-[10px] text-mutedGrey">{tx.projectCode || tx.orderNumber || 'OVERHEAD'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          tx.type.toLowerCase().includes('revenue') 
                            ? 'bg-sage-50 text-sage border border-sage/20' 
                            : tx.type.toLowerCase().includes('expense')
                            ? 'bg-amber-50 text-amber border border-amber/20'
                            : tx.type.toLowerCase().includes('equipment')
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-charcoal">{tx.category}</div>
                        <div className="text-[11px] text-mutedGrey line-clamp-1">{tx.description || tx.notes || tx.category}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-bold text-charcoal">{tx.referenceNumber || 'N/A'}</span>
                        <div className="text-[10px] text-mutedGrey uppercase font-medium">{tx.sourceModule}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-sm">
                        <span className={tx.type.toLowerCase().includes('revenue') ? 'text-sage' : 'text-charcoal'}>
                          {tx.type.toLowerCase().includes('revenue') ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          ['posted', 'verified', 'approved', 'paid'].includes(tx.status.toLowerCase())
                            ? 'bg-sage-50 text-sage border border-sage/30'
                            : 'bg-amber-50 text-amber border border-amber/30'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-mutedGrey text-[11px]">
                        {tx.recordedBy || tx.createdBy || 'Accounts'}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-mutedGrey">
                        No transactions match the selected filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: Redesigned Record Direct Installation Expense Modal */}
      {isExpenseModalOpen && (
        <Modal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          title="Record Direct Installation Expense"
          subtitle="Mandatory project attribution, vendor details and receipt document tracking"
          maxWidth="lg"
        >
          <form onSubmit={handleRecordExpenseSubmit} className="space-y-4">
            
            {/* Scope Toggle: Project-Specific vs Company-Wide */}
            <div className="bg-sand-50 p-3 rounded-xl border border-warmGrey flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-charcoal">Expense Attribution Scope</span>
                <p className="text-[11px] text-mutedGrey">Choose whether this expense is tied to an active solar project or corporate overhead</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setExpenseForm(prev => ({ ...prev, isCompanyLevel: false }))}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    !expenseForm.isCompanyLevel 
                      ? 'bg-navy text-white' 
                      : 'bg-white text-charcoal border border-warmGrey'
                  }`}
                >
                  Project Expense
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseForm(prev => ({ ...prev, isCompanyLevel: true }))}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    expenseForm.isCompanyLevel 
                      ? 'bg-navy text-white' 
                      : 'bg-white text-charcoal border border-warmGrey'
                  }`}
                >
                  Company Overhead
                </button>
              </div>
            </div>

            {/* Mandatory Project Selector if not company level */}
            {!expenseForm.isCompanyLevel && (
              <div className="bg-white p-3.5 rounded-xl border border-warmGrey space-y-3">
                <label className="block text-xs font-bold text-charcoal">
                  Select Associated Project / Customer Order *
                </label>
                <select
                  value={expenseForm.orderId}
                  onChange={e => setExpenseForm(prev => ({ ...prev, orderId: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white font-medium text-charcoal focus:outline-navy"
                  required
                >
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} — {order.customerName} ({order.capacityKw} kW)
                    </option>
                  ))}
                </select>

                {/* Auto-populated Project Information Card */}
                {selectedOrder && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2.5 bg-sand-50/70 rounded-lg text-xs border border-warmGrey/60">
                    <div>
                      <span className="text-[10px] text-mutedGrey uppercase font-semibold">Customer Name</span>
                      <p className="font-bold text-charcoal mt-0.5">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-mutedGrey uppercase font-semibold">Project Code / Order</span>
                      <p className="font-bold text-navy font-mono mt-0.5">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-mutedGrey uppercase font-semibold">Contracted Value</span>
                      <p className="font-bold text-sage mt-0.5">₹{selectedOrder.totalOrderValue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Category and Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Expense Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={e => setExpenseForm(prev => ({ ...prev, category: e.target.value as DirectExpenseCategory }))}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white font-medium focus:outline-navy"
                  required
                >
                  <option value="Freight & Site Transport">Freight & Site Transport</option>
                  <option value="Crane & Scaffolding Rental">Crane & Scaffolding Rental</option>
                  <option value="DISCOM Inspection Fees">DISCOM Inspection Fees</option>
                  <option value="Civil Works & Mounting Structure">Civil Works & Mounting Structure</option>
                  <option value="Electrical Conduit & Wiring">Electrical Conduit & Wiring</option>
                  <option value="Tools & Consumables">Tools & Consumables</option>
                  <option value="Technician Labour Expense">Technician Labour Expense</option>
                  <option value="Administrative Overhead">Administrative Overhead</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Expense Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-bold text-navy focus:outline-navy"
                />
              </div>
            </div>

            {/* Vendor Name and Expense Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Vendor / Payee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Express Tempo Services"
                  value={expenseForm.vendor}
                  onChange={e => setExpenseForm(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Expense Date *</label>
                <input
                  type="date"
                  required
                  value={expenseForm.expenseDate}
                  onChange={e => setExpenseForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-navy"
                />
              </div>
            </div>

            {/* Payment Method, Status, Invoice Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Payment Method</label>
                <select
                  value={expenseForm.paymentMethod}
                  onChange={e => setExpenseForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
                >
                  <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                  <option value="Bank Transfer (RTGS)">Bank Transfer (RTGS)</option>
                  <option value="Bank Transfer (IMPS)">Bank Transfer (IMPS)</option>
                  <option value="UPI">UPI</option>
                  <option value="Corporate Credit Card">Corporate Credit Card</option>
                  <option value="Cash Voucher">Cash Voucher</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Payment Status</label>
                <select
                  value={expenseForm.paymentStatus}
                  onChange={e => setExpenseForm(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white font-medium"
                >
                  <option value="paid">Paid (Disbursed)</option>
                  <option value="pending">Pending Reimbursement</option>
                  <option value="reimbursed">Reimbursed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Invoice / Ref #</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-9021"
                  value={expenseForm.invoiceReference}
                  onChange={e => setExpenseForm(prev => ({ ...prev, invoiceReference: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-mono focus:outline-navy"
                />
              </div>
            </div>

            {/* Description & Purpose */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Detailed Description & Allocation *</label>
              <textarea
                rows={2}
                required
                placeholder="Explain the operational purpose of this expenditure..."
                value={expenseForm.description}
                onChange={e => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg focus:outline-navy"
              />
            </div>

            {/* Document Upload Reference */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Receipt / Invoice Document</label>
              <div className="flex items-center space-x-2 border border-dashed border-warmGrey rounded-lg p-2.5 bg-sand-50/50">
                <Receipt className="w-4 h-4 text-navy shrink-0" />
                <span className="text-xs font-mono text-charcoal flex-1 truncate">{expenseForm.receiptFileName}</span>
                <span className="px-2 py-0.5 bg-white border border-warmGrey text-[10px] font-bold rounded text-mutedGrey">
                  Verified PDF
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-warmGrey/60 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-sand-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingExpense}
                className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light disabled:opacity-50 transition-colors shadow-xs"
              >
                {isSubmittingExpense ? 'Posting...' : 'Post to Project Ledger'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Comprehensive Project Financial Detail Workspace Drill-down */}
      {selectedProjectId && projectDetail && (
        <Modal
          isOpen={!!selectedProjectId}
          onClose={() => {
            setSelectedProjectId(null);
            setProjectDetail(null);
          }}
          title={`${projectDetail.project.projectCode} — Project Financial Workspace`}
          subtitle={`Customer: ${projectDetail.project.customerName} • Order: ${projectDetail.project.orderNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            
            {/* Top Scorecard Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-sand-50 p-3.5 rounded-xl border border-warmGrey">
              <div>
                <span className="text-[10px] font-bold text-mutedGrey uppercase">Contracted Value</span>
                <p className="text-sm font-bold text-charcoal mt-0.5">₹{projectDetail.revenue.contractedValue.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-mutedGrey uppercase">Recognized Revenue</span>
                <p className="text-sm font-bold text-navy mt-0.5">₹{projectDetail.profitability.revenue.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-mutedGrey uppercase">Net Project Profit</span>
                <p className="text-sm font-bold text-sage mt-0.5">₹{projectDetail.profitability.netProfit.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-mutedGrey uppercase">Operating Margin</span>
                <p className="text-sm font-bold text-navy mt-0.5">{projectDetail.profitability.profitMarginPercent.toFixed(1)}%</p>
              </div>
            </div>

            {/* Section 1: Revenue & Cash Reconciliation */}
            <div className="bg-white rounded-xl border border-warmGrey p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-warmGrey/60 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                  <IndianRupee className="w-4 h-4 text-navy" />
                  <span>1. Revenue & Payment Reconciliation</span>
                </h3>
                <span className="text-[11px] font-bold text-navy">
                  Stage: {projectDetail.operationalCompletion.currentStage.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-mutedGrey uppercase font-medium">Invoiced Value:</span>
                  <p className="font-bold text-charcoal">₹{projectDetail.revenue.invoicedValue.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-[10px] text-mutedGrey uppercase font-medium">Verified Cash:</span>
                  <p className="font-bold text-sage">₹{projectDetail.revenue.verifiedCashCollected.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-[10px] text-mutedGrey uppercase font-medium">Outstanding Receivable:</span>
                  <p className="font-bold text-charcoal">₹{projectDetail.revenue.outstandingReceivables.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-[10px] text-mutedGrey uppercase font-medium">Recognized Revenue:</span>
                  <p className="font-bold text-navy">₹{projectDetail.revenue.recognizedRevenue.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Payments table */}
              <div className="border border-warmGrey/60 rounded-lg overflow-hidden mt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey/60">
                    <tr>
                      <th className="py-2 px-3">Receipt #</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Milestone</th>
                      <th className="py-2 px-3">Method & Ref</th>
                      <th className="py-2 px-3 text-right">Amount (₹)</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warmGrey/40">
                    {projectDetail.revenue.payments.map((p, pIdx) => (
                      <tr key={pIdx}>
                        <td className="py-2 px-3 font-mono font-bold text-navy">{p.paymentNumber}</td>
                        <td className="py-2 px-3 text-mutedGrey">{p.date}</td>
                        <td className="py-2 px-3 font-medium text-charcoal">{p.stage}</td>
                        <td className="py-2 px-3 text-mutedGrey font-mono text-[11px]">{p.method} ({p.refNumber})</td>
                        <td className="py-2 px-3 text-right font-bold text-sage">₹{p.amount.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sage-50 text-sage border border-sage/20">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {projectDetail.revenue.payments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-3 text-center text-mutedGrey">No payment receipts registered yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Hardware BOM Cost Attribution */}
            <div className="bg-white rounded-xl border border-warmGrey p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-warmGrey/60 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                  <Package className="w-4 h-4 text-navy" />
                  <span>2. Equipment & Warehouse BOM Cost Basis</span>
                </h3>
                <span className="text-xs font-bold text-charcoal">
                  Total Hardware Cost: ₹{projectDetail.equipment.totalActualCost.toLocaleString('en-IN')}
                </span>
              </div>

              {projectDetail.equipment.dispatches.map(dsp => (
                <div key={dsp.dispatchNumber} className="border border-warmGrey/60 rounded-lg p-3 space-y-2 bg-sand-50/30">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-navy">{dsp.dispatchNumber}</span>
                      <span className="text-mutedGrey">• {dsp.dispatchDate}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px] uppercase">
                      {dsp.status}
                    </span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-white text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey/60">
                      <tr>
                        <th className="py-1.5 px-2">Dispatched SKU</th>
                        <th className="py-1.5 px-2 text-center">Qty</th>
                        <th className="py-1.5 px-2 text-right">Unit Cost (₹)</th>
                        <th className="py-1.5 px-2 text-right">Extended Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warmGrey/40">
                      {dsp.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-2 font-medium text-charcoal">{item.productName}</td>
                          <td className="py-1.5 px-2 text-center">{item.quantity}</td>
                          <td className="py-1.5 px-2 text-right text-mutedGrey">₹{item.unitCost.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2 text-right font-bold text-charcoal">₹{item.totalCost.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Section 3: Technician Labour Cost Attribution */}
            <div className="bg-white rounded-xl border border-warmGrey p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-warmGrey/60 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                  <Wrench className="w-4 h-4 text-navy" />
                  <span>3. Technician Labour Outflow Attribution</span>
                </h3>
                <span className="text-xs font-bold text-charcoal">
                  Total Labour Cost: ₹{projectDetail.labour.totalActualCost.toLocaleString('en-IN')}
                </span>
              </div>

              {projectDetail.labour.workOrders.map(wo => (
                <div key={wo.installationCode} className="border border-warmGrey/60 rounded-lg p-3 space-y-2 bg-sand-50/30">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-navy">{wo.installationCode}</span>
                      <span className="text-mutedGrey">• Scheduled Date: {wo.scheduledDate}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-sage-50 text-sage font-bold rounded text-[10px] uppercase">
                      {wo.status}
                    </span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-white text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey/60">
                      <tr>
                        <th className="py-1.5 px-2">Technician / Crew</th>
                        <th className="py-1.5 px-2">Role</th>
                        <th className="py-1.5 px-2 text-center">Hours Logged</th>
                        <th className="py-1.5 px-2 text-right">Hourly Rate (₹)</th>
                        <th className="py-1.5 px-2 text-right">Labour Outflow (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warmGrey/40">
                      {wo.technicians.map((c, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-2 font-bold text-charcoal">{c.technicianName}</td>
                          <td className="py-1.5 px-2 text-mutedGrey">{c.role}</td>
                          <td className="py-1.5 px-2 text-center font-mono">{c.hours} hrs</td>
                          <td className="py-1.5 px-2 text-right text-mutedGrey">₹{c.hourlyRate}/hr</td>
                          <td className="py-1.5 px-2 text-right font-bold text-charcoal">₹{c.cost.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Section 4: Direct Site Expenses */}
            <div className="bg-white rounded-xl border border-warmGrey p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-warmGrey/60 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                  <Receipt className="w-4 h-4 text-navy" />
                  <span>4. Direct Site Expenses & Vendor Disbursements</span>
                </h3>
                <span className="text-xs font-bold text-charcoal">
                  Total Direct Expenses: ₹{projectDetail.otherExpenses.totalDirectExpenses.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="border border-warmGrey/60 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey/60">
                    <tr>
                      <th className="py-2 px-3">Expense #</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Vendor / Payee</th>
                      <th className="py-2 px-3">Ref #</th>
                      <th className="py-2 px-3 text-right">Amount (₹)</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warmGrey/40">
                    {projectDetail.otherExpenses.expenses.map(e => (
                      <tr key={e.id}>
                        <td className="py-2 px-3 font-mono font-bold text-navy">{e.expenseNumber}</td>
                        <td className="py-2 px-3 text-mutedGrey">{e.expenseDate}</td>
                        <td className="py-2 px-3 font-medium text-charcoal">{e.category}</td>
                        <td className="py-2 px-3 text-charcoal">{e.vendor}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-mutedGrey">{e.invoiceReference || 'N/A'}</td>
                        <td className="py-2 px-3 text-right font-bold text-charcoal">₹{e.amount.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sage-50 text-sage border border-sage/20">
                            {e.approvalStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {projectDetail.otherExpenses.expenses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-3 text-center text-mutedGrey">No direct expenses recorded for this project yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5: Profitability Mathematical Formula Walkthrough */}
            <div className="bg-sand-100/70 rounded-xl border border-warmGrey p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-sage" />
                <span>5. Mathematical Profitability Formula Walkthrough</span>
              </h3>

              <div className="p-3 bg-white rounded-lg border border-warmGrey/60 font-mono text-xs text-charcoal space-y-1.5">
                <div className="flex justify-between items-center text-navy font-bold">
                  <span>Recognized Revenue</span>
                  <span>₹{projectDetail.profitability.revenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-mutedGrey">
                  <span>(-) Equipment BOM Cost Basis</span>
                  <span>- ₹{projectDetail.profitability.equipmentCosts.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-mutedGrey">
                  <span>(-) Technician Labour Outflow</span>
                  <span>- ₹{projectDetail.profitability.labourCosts.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-mutedGrey">
                  <span>(-) Direct Site Expenses</span>
                  <span>- ₹{projectDetail.profitability.otherExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-warmGrey flex justify-between items-center text-sm font-bold text-sage">
                  <span>(=) Net Operating Project Profit</span>
                  <span>₹{projectDetail.profitability.netProfit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-navy">
                  <span>Profit Margin % (Profit / Recognized Revenue)</span>
                  <span>{projectDetail.profitability.profitMarginPercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Section 6: Operational Milestones */}
            <div className="bg-white rounded-xl border border-warmGrey p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-navy" />
                <span>6. Lifecycle Operational Milestones</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  projectDetail.operationalCompletion.surveyApproved ? 'bg-sage-50/50 border-sage/30' : 'bg-sand-50/50 border-warmGrey/60'
                }`}>
                  <span className="font-semibold text-charcoal">1. Site Survey Approved</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    projectDetail.operationalCompletion.surveyApproved ? 'bg-sage text-white' : 'bg-warmGrey text-mutedGrey'
                  }`}>
                    {projectDetail.operationalCompletion.surveyApproved ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  projectDetail.operationalCompletion.quotationApproved ? 'bg-sage-50/50 border-sage/30' : 'bg-sand-50/50 border-warmGrey/60'
                }`}>
                  <span className="font-semibold text-charcoal">2. Quotation Confirmed</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    projectDetail.operationalCompletion.quotationApproved ? 'bg-sage text-white' : 'bg-warmGrey text-mutedGrey'
                  }`}>
                    {projectDetail.operationalCompletion.quotationApproved ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  projectDetail.operationalCompletion.advancePaymentReceived ? 'bg-sage-50/50 border-sage/30' : 'bg-sand-50/50 border-warmGrey/60'
                }`}>
                  <span className="font-semibold text-charcoal">3. Advance Mobilization (30%)</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    projectDetail.operationalCompletion.advancePaymentReceived ? 'bg-sage text-white' : 'bg-warmGrey text-mutedGrey'
                  }`}>
                    {projectDetail.operationalCompletion.advancePaymentReceived ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  projectDetail.operationalCompletion.materialsDispatched ? 'bg-sage-50/50 border-sage/30' : 'bg-sand-50/50 border-warmGrey/60'
                }`}>
                  <span className="font-semibold text-charcoal">4. Warehouse Dispatch (80%)</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    projectDetail.operationalCompletion.materialsDispatched ? 'bg-sage text-white' : 'bg-warmGrey text-mutedGrey'
                  }`}>
                    {projectDetail.operationalCompletion.materialsDispatched ? 'DISPATCHED' : 'PENDING'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  projectDetail.operationalCompletion.installationCompleted ? 'bg-sage-50/50 border-sage/30' : 'bg-sand-50/50 border-warmGrey/60'
                }`}>
                  <span className="font-semibold text-charcoal">5. Physical Installation</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    projectDetail.operationalCompletion.installationCompleted ? 'bg-sage text-white' : 'bg-warmGrey text-mutedGrey'
                  }`}>
                    {projectDetail.operationalCompletion.installationCompleted ? 'COMPLETED' : 'IN_PROGRESS'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  projectDetail.operationalCompletion.customerSignoff ? 'bg-sage-50/50 border-sage/30' : 'bg-sand-50/50 border-warmGrey/60'
                }`}>
                  <span className="font-semibold text-charcoal">6. Commissioning & Signoff (100%)</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    projectDetail.operationalCompletion.customerSignoff ? 'bg-sage text-white' : 'bg-warmGrey text-mutedGrey'
                  }`}>
                    {projectDetail.operationalCompletion.customerSignoff ? 'SIGNED' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Close action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId(null);
                  setProjectDetail(null);
                }}
                className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
              >
                Close Workspace
              </button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
