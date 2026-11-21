import React, { useState } from 'react';
import { 
  Users, UserPlus, Zap, Clock, IndianRupee, AlertCircle,
  TrendingUp, CheckCircle2, AlertTriangle, ArrowUpRight, 
  Package, Wrench, ShieldAlert, Calendar, ChevronRight,
  Compass, Cpu, Building2, CheckSquare, Layers, Mic,
  Download, Filter, Bot, MessageSquare, Send, Sparkles, UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/common/KpiCard';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Legend 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { 
    customers, 
    orders, 
    quotations, 
    inventory, 
    installations, 
    complaints, 
    profitability,
    employees,
    departments,
    approvals,
    employeeActivities,
    smartAlerts,
    acknowledgeAlert,
    resolveAlert,
    aiMessages,
    sendAiQuery,
    isAiGenerating
  } = useApp();

  const [aiInput, setAiInput] = useState('');

  // 1. Calculated KPIs
  const totalCustomers = customers.length;
  const activeProjects = orders.filter(o => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled').length;
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status !== 'inactive').length;
  const onLeaveEmployees = employees.filter(e => e.status === 'on_leave').length;
  
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalOrderValue, 0);
  const outstandingPayments = orders.reduce((acc, curr) => acc + curr.outstandingBalance, 0);
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;

  // Departmental breakdown metrics
  const newEnquiriesCount = customers.filter(c => c.leadStatus === 'new' || c.leadStatus === 'contacted').length;
  const pendingQuotesCount = quotations.filter(q => q.status === 'sent' || q.status === 'draft').length;
  const lowStockCount = inventory.filter(i => i.stockStatus === 'low_stock' || i.stockStatus === 'out_of_stock').length;
  const scheduledInst = installations.filter(i => i.status === 'scheduled' || i.status === 'assigned').length;
  const inProgressInst = installations.filter(i => i.status === 'in_progress').length;
  const delayedInst = installations.filter(i => i.status === 'delayed').length;
  const openComplaintsCount = complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length;

  // Active operational smart alerts
  const activeAlerts = smartAlerts.filter(a => a.status !== 'resolved');

  // Chart data: 6-month Revenue vs Expense vs Profit
  const revenueChartData = [
    { month: 'Jun', revenue: 780000, expenses: 540000, profit: 240000 },
    { month: 'Jul', revenue: 920000, expenses: 630000, profit: 290000 },
    { month: 'Aug', revenue: 1150000, expenses: 780000, profit: 370000 },
    { month: 'Sep', revenue: 1280000, expenses: 890000, profit: 390000 },
    { month: 'Oct', revenue: 1420000, expenses: 960000, profit: 460000 },
    { month: 'Nov', revenue: totalRevenue, expenses: 1040000, profit: totalRevenue - 1040000 },
  ];

  const handleSendAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    sendAiQuery(aiInput);
    setAiInput('');
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Live Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-charcoal tracking-tight">Owner Command Center</h1>
            <span className="px-2.5 py-0.5 bg-sand-200/80 text-navy font-mono text-[10px] font-bold rounded-full border border-warmGrey uppercase tracking-wider">
              SunPower Operations OS
            </span>
          </div>
          <p className="text-xs text-mutedGrey mt-0.5">
            Executive control across 40 monthly rooftop projects, 19 personnel, 7 departments, and enterprise cashflow
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Link
            to="/approvals"
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Authorizations ({pendingApprovals})</span>
          </Link>
          <Link
            to="/workforce"
            className="px-3.5 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-navy" />
            <span>Manage Workforce</span>
          </Link>
          <Link
            to="/activity-center"
            className="px-3.5 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* 2. Primary KPI Cards: Exactly 6 Cards in 2 Rows of 3 on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Row 1, Card 1: Total Customers */}
        <KpiCard
          title="Total Customers"
          value={totalCustomers}
          subValue="Residential & Commercial Portfolios"
          trend={{ value: '18.5%', isPositive: true }}
          icon={Users}
          iconBgColor="bg-sand-200/70"
          iconColor="text-navy"
        />

        {/* Row 1, Card 2: Active Projects */}
        <KpiCard
          title="Active Projects"
          value={activeProjects}
          subValue="In Survey, Feasibility & Installation"
          trend={{ value: '8.4%', isPositive: true }}
          icon={Zap}
          iconBgColor="bg-amber-50"
          iconColor="text-amber"
          badge="In-Flight"
          badgeColor="amber"
        />

        {/* Row 1, Card 3: Total Employees */}
        <KpiCard
          title="Total Workforce"
          value={`${activeEmployees} Active`}
          subValue={`${totalEmployees} total personnel • ${onLeaveEmployees} on leave`}
          trend={{ value: '100%', isPositive: true }}
          icon={UserCheck}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          badge="100% Deployed"
          badgeColor="sage"
        />

        {/* Row 2, Card 4: Monthly Invoiced Revenue */}
        <KpiCard
          title="Monthly Invoiced Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(2)}L`}
          subValue="Confirmed customer contracts"
          trend={{ value: '14.2%', isPositive: true }}
          icon={IndianRupee}
          iconBgColor="bg-sand-200/70"
          iconColor="text-navy"
        />

        {/* Row 2, Card 5: Outstanding Balance */}
        <KpiCard
          title="Outstanding Receivables"
          value={`₹${(outstandingPayments / 100000).toFixed(2)}L`}
          subValue="Milestone balance payments due"
          trend={{ value: '3.1%', isPositive: false }}
          icon={AlertCircle}
          iconBgColor="bg-rose-50"
          iconColor="text-terracotta"
          badge="Collections Due"
          badgeColor="terracotta"
        />

        {/* Row 2, Card 6: Pending Owner Approvals */}
        <KpiCard
          title="Pending Approvals"
          value={pendingApprovals}
          subValue="POs, customer discounts & leaves"
          icon={CheckSquare}
          iconBgColor="bg-amber-50"
          iconColor="text-amber"
          badge={pendingApprovals > 0 ? "Requires Action" : "All Cleared"}
          badgeColor={pendingApprovals > 0 ? "amber" : "sage"}
        />

      </div>

      {/* 3. Operational Alerts Center */}
      {activeAlerts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-amber/30 shadow-[0_3px_12px_rgba(196,138,66,0.10)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber" />
              <h3 className="font-bold text-sm text-charcoal">
                Operational Alerts Requiring Executive Attention ({activeAlerts.length})
              </h3>
            </div>
            <Link to="/notifications" className="text-xs text-navy font-semibold hover:underline flex items-center space-x-1">
              <span>View All Alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeAlerts.slice(0, 3).map(alert => (
              <div 
                key={alert.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  alert.severity === 'critical' ? 'bg-rose-50/60 border-rose-200' :
                  alert.severity === 'warning' ? 'bg-amber-50/60 border-amber-200' :
                  'bg-sand-50/60 border-warmGrey/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.severity === 'critical' ? 'bg-rose-100 text-terracotta' :
                      alert.severity === 'warning' ? 'bg-amber-100 text-amber' :
                      'bg-sand-200 text-navy'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-mutedGrey">{alert.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-xs text-charcoal">{alert.title}</h4>
                  <p className="text-[11px] text-mutedGrey mt-1 leading-snug line-clamp-2">
                    {alert.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-warmGrey/40 flex items-center justify-between">
                  {alert.entityLink && (
                    <Link to={alert.entityLink} className="text-[11px] text-navy font-semibold hover:underline">
                      Inspect Record →
                    </Link>
                  )}
                  <div className="flex items-center space-x-1.5 ml-auto">
                    {alert.status === 'new' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2 py-0.5 bg-white border border-warmGrey text-charcoal rounded text-[10px] font-semibold hover:bg-sand-100"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-semibold hover:bg-emerald-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Departmental Operations Overview (6 Dedicated Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-charcoal tracking-tight">Departmental Health & Operations</h2>
            <p className="text-xs text-mutedGrey">Direct visibility into individual division workloads, heads, and KPIs</p>
          </div>
          <Link to="/departments" className="text-xs text-navy font-semibold hover:underline flex items-center space-x-1">
            <span>Manage All Departments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Dept 1: Sales & CRM */}
          <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] flex flex-col justify-between hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-charcoal">Sales & CRM</h3>
                    <span className="text-[10px] text-mutedGrey">Head: Pooja Kulkarni</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sand-100 rounded text-charcoal font-bold">SLS</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">New Enquiries</span>
                  <span className="text-base font-bold text-charcoal">{newEnquiriesCount}</span>
                </div>
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">Pending Quotes</span>
                  <span className="text-base font-bold text-amber">{pendingQuotesCount}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-700 font-semibold">76% Lead-to-Survey Rate</span>
              <Link to="/customers" className="text-navy font-bold hover:underline">
                View Sales →
              </Link>
            </div>
          </div>

          {/* Dept 2: Field Operations */}
          <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] flex flex-col justify-between hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-sand-100 text-navy flex items-center justify-center font-bold">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-charcoal">Field Operations</h3>
                    <span className="text-[10px] text-mutedGrey">Head: Suresh More</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sand-100 rounded text-charcoal font-bold">FLD</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">Active Surveyors</span>
                  <span className="text-base font-bold text-navy">5 Specialists</span>
                </div>
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">Surveys Month</span>
                  <span className="text-base font-bold text-charcoal">38 Completed</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-700 font-semibold">98.2% Measurement Accuracy</span>
              <Link to="/surveys" className="text-navy font-bold hover:underline">
                View Surveys →
              </Link>
            </div>
          </div>

          {/* Dept 3: Engineering & Approvals */}
          <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] flex flex-col justify-between hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-charcoal">Engineering & SLD</h3>
                    <span className="text-[10px] text-mutedGrey">Lead: Sandeep Patil</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sand-100 rounded text-charcoal font-bold">ENG</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">SLD Verification</span>
                  <span className="text-base font-bold text-emerald-700">100% Pass</span>
                </div>
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">Avg Turnaround</span>
                  <span className="text-base font-bold text-charcoal">4 Hours</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-700 font-semibold">PVSyst Feasibility Active</span>
              <Link to="/engineering" className="text-navy font-bold hover:underline">
                Review SLD →
              </Link>
            </div>
          </div>

          {/* Dept 4: Installation & Commissioning */}
          <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] flex flex-col justify-between hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-charcoal">Installation & Crew</h3>
                    <span className="text-[10px] text-mutedGrey">Crew Lead: Amit Jadhav</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sand-100 rounded text-charcoal font-bold">OPS</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">In-Progress Sites</span>
                  <span className="text-base font-bold text-navy">{inProgressInst} Active</span>
                </div>
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">Scheduled</span>
                  <span className="text-base font-bold text-charcoal">{scheduledInst} Upcoming</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-700 font-semibold">40 Monthly Installations Target</span>
              <Link to="/installations" className="text-navy font-bold hover:underline">
                View Rooftops →
              </Link>
            </div>
          </div>

          {/* Dept 5: Warehouse & Supply Chain */}
          <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] flex flex-col justify-between hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-charcoal">Warehouse & Supply</h3>
                    <span className="text-[10px] text-mutedGrey">Manager: Ganesh Shinde</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sand-100 rounded text-charcoal font-bold">LOG</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">Inventory Items</span>
                  <span className="text-base font-bold text-charcoal">{inventory.length} SKUs</span>
                </div>
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">Low Stock Alerts</span>
                  <span className="text-base font-bold text-terracotta">{lowStockCount} Critical</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-navy font-semibold">₹42.8L Total Stock Value</span>
              <Link to="/inventory" className="text-navy font-bold hover:underline">
                View Stock →
              </Link>
            </div>
          </div>

          {/* Dept 6: Accounts & Finance */}
          <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] flex flex-col justify-between hover:shadow-[0_5px_18px_rgba(196,138,66,0.16)] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-charcoal">Accounts & P&L</h3>
                    <span className="text-[10px] text-mutedGrey">Head: Ramesh Patil</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sand-100 rounded text-charcoal font-bold">FIN</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">Invoiced Value</span>
                  <span className="text-base font-bold text-navy font-mono">₹{(totalRevenue / 100000).toFixed(1)}L</span>
                </div>
                <div className="p-2.5 bg-sand-50/70 rounded-xl border border-warmGrey/40">
                  <span className="text-[10px] text-mutedGrey block">Operating Margin</span>
                  <span className="text-base font-bold text-emerald-700">28.6%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-700 font-semibold">GST & Tax Reconciled</span>
              <Link to="/finance" className="text-navy font-bold hover:underline">
                View Ledger →
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Business Performance & Recent Audit Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Financial Performance & Project Margins */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-charcoal">Revenue vs Operating Cost Snapshot</h3>
                <p className="text-xs text-mutedGrey">6-month trailing growth & net profit margin</p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-navy" />
                  <span className="text-mutedGrey">Revenue</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber" />
                  <span className="text-mutedGrey">Profit</span>
                </div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#183153" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#183153" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C48A42" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C48A42" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E0D2" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#777777' }} />
                  <YAxis tickFormatter={(val) => `₹${val / 100000}L`} tick={{ fontSize: 11, fill: '#777777' }} />
                  <Tooltip 
                    formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #D8D0C4' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#183153" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#C48A42" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activities (5 latest) with link to Activity Center */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-charcoal flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-navy" />
                  <span>Recent Company Activity</span>
                </h3>
                <Link to="/activity-center" className="text-xs text-navy font-semibold hover:underline">
                  Full Stream →
                </Link>
              </div>

              <div className="space-y-3">
                {employeeActivities.slice(0, 5).map(act => (
                  <div key={act.id} className="p-2.5 bg-sand-50/60 rounded-xl border border-warmGrey/40 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-charcoal">{act.employeeName}</span>
                      <span className="text-mutedGrey font-mono text-[10px]">{act.timestamp}</span>
                    </div>
                    <p className="text-xs text-mutedGrey leading-snug line-clamp-2">
                      {act.actionDetails}
                    </p>
                    <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold bg-sand-100 text-charcoal">
                      {act.department} • {act.actionType}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-warmGrey/40 text-center">
              <Link 
                to="/activity-center" 
                className="w-full py-2 bg-sand-100 text-charcoal hover:bg-sand-200 rounded-xl text-xs font-semibold inline-block transition-colors"
              >
                Inspect All Employee Actions
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* 6. Owner AI Executive Assistant Widget */}
      <div className="bg-white rounded-2xl p-6 border border-[rgba(196,138,66,0.18)] shadow-[0_3px_12px_rgba(196,138,66,0.10)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-navy text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-sand-200" />
            </div>
            <div>
              <h3 className="font-bold text-base text-charcoal">Owner AI Operations Executive</h3>
              <p className="text-xs text-mutedGrey">Real-time intelligence engine connected to live SolarOS database</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => sendAiQuery("What is our current monthly operating profit margin and total invoiced revenue?")}
              className="hidden sm:inline-block px-2.5 py-1 bg-sand-50 hover:bg-sand-100 text-navy rounded-lg text-xs font-semibold border border-warmGrey transition-colors"
            >
              Analyze Monthly Margin
            </button>
            <button
              onClick={() => sendAiQuery("Which installation projects are currently delayed and require intervention?")}
              className="hidden sm:inline-block px-2.5 py-1 bg-sand-50 hover:bg-sand-100 text-navy rounded-lg text-xs font-semibold border border-warmGrey transition-colors"
            >
              Check Delayed Projects
            </button>
          </div>
        </div>

        {/* AI Conversation View */}
        <div className="space-y-3 max-h-60 overflow-y-auto p-4 bg-sand-50/50 rounded-xl border border-warmGrey/60">
          {aiMessages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`p-3 rounded-2xl text-xs max-w-2xl leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-navy text-white rounded-tr-none' 
                  : 'bg-white text-charcoal border border-warmGrey/60 rounded-tl-none shadow-xs'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-mutedGrey mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isAiGenerating && (
            <div className="flex items-center space-x-2 text-xs text-mutedGrey p-2">
              <Bot className="w-4 h-4 text-navy animate-spin" />
              <span>SolarOS AI Assistant is analyzing live operations database...</span>
            </div>
          )}
        </div>

        {/* Query Input Box */}
        <form onSubmit={handleSendAi} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask anything (e.g. 'Show technician utilization', 'Summarize low stock inventory', 'Who has pending leaves?')..."
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            className="flex-1 p-3 text-xs border border-warmGrey rounded-xl focus:outline-none focus:ring-1 focus:ring-navy"
          />
          <button
            type="submit"
            disabled={!aiInput.trim() || isAiGenerating}
            className="px-5 py-3 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light transition-colors disabled:opacity-50 flex items-center space-x-1.5 shadow-xs"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
