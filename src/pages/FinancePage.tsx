import React, { useState } from 'react';
import { 
  IndianRupee, TrendingUp, TrendingDown, DollarSign, 
  PieChart, FileText, Download, Plus, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProjectProfitability } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const FinancePage: React.FC = () => {
  const { profitability, orders, payments, showToast } = useApp();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Technician Labour Expense',
    amount: 15000,
    vendor: 'Field Crew Team A',
    description: 'Structure fabrication overtime for Baner project'
  });

  // Financial aggregates
  const totalRevenue = profitability.reduce((sum, p) => sum + p.revenue, 0);
  const totalEquipmentCost = profitability.reduce((sum, p) => sum + p.equipmentCosts, 0);
  const totalLabourCost = profitability.reduce((sum, p) => sum + p.labourCosts, 0);
  const totalOtherExpense = profitability.reduce((sum, p) => sum + p.otherExpenses, 0);
  const totalGrossProfit = profitability.reduce((sum, p) => sum + p.profit, 0);
  const overallMargin = ((totalGrossProfit / (totalRevenue || 1)) * 100).toFixed(2);

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Expense of ₹${expenseForm.amount.toLocaleString('en-IN')} recorded for ${expenseForm.category}`, 'success');
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Finance & Project Profitability</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Strict project-wise P&L calculation: Revenue - Equipment Costs - Labour Costs - Other Expenses = Project Profit
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Direct Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
          <span className="text-xs font-semibold text-mutedGrey uppercase tracking-wide">Total Realized Revenue</span>
          <div className="text-2xl font-bold text-navy mt-2">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-mutedGrey mt-2">Across 3 executed solar contracts</p>
        </div>

        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
          <span className="text-xs font-semibold text-mutedGrey uppercase tracking-wide">Hardware & BOS Cost</span>
          <div className="text-2xl font-bold text-charcoal mt-2">₹{totalEquipmentCost.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-mutedGrey mt-2">{((totalEquipmentCost / totalRevenue) * 100).toFixed(1)}% of gross project turnover</p>
        </div>

        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
          <span className="text-xs font-semibold text-mutedGrey uppercase tracking-wide">Technician Labour Outflow</span>
          <div className="text-2xl font-bold text-charcoal mt-2">₹{totalLabourCost.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-mutedGrey mt-2">Certified electrical installation crew</p>
        </div>

        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
          <span className="text-xs font-semibold text-mutedGrey uppercase tracking-wide">Net Project Profit</span>
          <div className="text-2xl font-bold text-sage mt-2">₹{totalGrossProfit.toLocaleString('en-IN')}</div>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="text-xs font-bold text-sage">{overallMargin}% Margin</span>
            <span className="text-[11px] text-mutedGrey">Company gross profit</span>
          </div>
        </div>
      </div>

      {/* Project-Wise Profitability Relational Table */}
      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card overflow-hidden">
        <div className="p-4 border-b border-warmGrey/60 bg-sand-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal">Project-Wise Profitability Ledger</h2>
            <p className="text-[11px] text-mutedGrey">Granular project margin analysis derived from confirmed transactions</p>
          </div>
          <span className="px-2.5 py-1 bg-sage-50 text-sage border border-sage/20 text-xs font-bold rounded-full">
            All Projects Positive Cashflow
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
              <tr>
                <th className="py-3 px-4">Project Code</th>
                <th className="py-3 px-4">Customer & Capacity</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
                <th className="py-3 px-4 text-right">Equipment (₹)</th>
                <th className="py-3 px-4 text-right">Labour (₹)</th>
                <th className="py-3 px-4 text-right">Other Exp (₹)</th>
                <th className="py-3 px-4 text-right">Project Profit (₹)</th>
                <th className="py-3 px-4 text-right">Margin %</th>
                <th className="py-3 px-4 text-center">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGrey/40 text-charcoal">
              {profitability.map(proj => (
                <tr key={proj.id} className="hover:bg-sand-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">
                    {proj.projectCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-charcoal">{proj.customerName}</div>
                    <div className="text-[11px] text-mutedGrey">{proj.systemType} ({proj.capacityKw} kW)</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-charcoal">
                    ₹{proj.revenue.toLocaleString('en-IN')}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Direct Expense Modal */}
      {isExpenseModalOpen && (
        <Modal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          title="Record Direct Installation Expense"
          subtitle="Book vendor freight, crane rental, or subcontractor labour"
          maxWidth="md"
        >
          <form onSubmit={handleRecordExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Expense Category</label>
              <select
                value={expenseForm.category}
                onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg bg-white"
              >
                <option value="Technician Labour Expense">Technician Labour Expense</option>
                <option value="Freight & Site Transport">Freight & Site Transport</option>
                <option value="Crane & Scaffolding Rental">Crane & Scaffolding Rental</option>
                <option value="DISCOM Inspection Fees">DISCOM Inspection Fees</option>
                <option value="Tools & Consumables">Tools & Consumables</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Expense Amount (₹) *</label>
              <input
                type="number"
                required
                value={expenseForm.amount}
                onChange={e => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg font-bold text-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Paid To / Vendor Name</label>
              <input
                type="text"
                required
                value={expenseForm.vendor}
                onChange={e => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Description / Project Allocation</label>
              <textarea
                rows={2}
                value={expenseForm.description}
                onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-warmGrey rounded-lg"
              />
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
                className="px-5 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light"
              >
                Post Expense
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
