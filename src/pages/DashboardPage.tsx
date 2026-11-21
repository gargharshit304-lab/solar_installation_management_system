import React from 'react';
import { 
  Users, UserPlus, Zap, Clock, IndianRupee, AlertCircle,
  TrendingUp, CheckCircle2, AlertTriangle, ArrowUpRight, 
  Package, Wrench, ShieldAlert, Calendar, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/common/KpiCard';
import { StatusBadge } from '../components/common/StatusBadge';
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
    profitability 
  } = useApp();

  // Metrics calculations
  const totalCustomers = customers.length;
  const newEnquiries = customers.filter(c => c.leadStatus === 'new' || c.leadStatus === 'contacted').length;
  const activeProjects = orders.filter(o => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled').length;
  const pendingQuotations = quotations.filter(q => q.status === 'sent' || q.status === 'draft').length;
  
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalOrderValue, 0);
  const outstandingPayments = orders.reduce((acc, curr) => acc + curr.outstandingBalance, 0);

  // Installation statuses
  const scheduledInst = installations.filter(i => i.status === 'scheduled' || i.status === 'assigned').length;
  const inProgressInst = installations.filter(i => i.status === 'in_progress').length;
  const completedInst = installations.filter(i => i.status === 'completed').length;
  const delayedInst = installations.filter(i => i.status === 'delayed').length;

  // Inventory alerts
  const lowStockItems = inventory.filter(i => i.stockStatus === 'low_stock' || i.stockStatus === 'out_of_stock');

  // Service overview
  const openComplaints = complaints.filter(c => c.status === 'open' || c.status === 'assigned');
  const inProgressComplaints = complaints.filter(c => c.status === 'in_progress' || c.status === 'waiting_for_parts');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'closed');

  // Monthly revenue chart data
  const revenueChartData = [
    { month: 'Jun', revenue: 780000, expenses: 540000, profit: 240000 },
    { month: 'Jul', revenue: 920000, expenses: 630000, profit: 290000 },
    { month: 'Aug', revenue: 1150000, expenses: 780000, profit: 370000 },
    { month: 'Sep', revenue: 1280000, expenses: 890000, profit: 390000 },
    { month: 'Oct', revenue: 1420000, expenses: 960000, profit: 460000 },
    { month: 'Nov', revenue: 1540000, expenses: 1020000, profit: 520000 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Operations Overview</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            SunPower Solutions — Live tracking across 40 monthly installations & 15 technicians
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <Link
            to="/quotations"
            className="px-3.5 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <span>+ Create Quotation</span>
          </Link>
          <Link
            to="/customers"
            className="px-3.5 py-2 bg-white text-charcoal border border-warmGrey text-xs font-semibold rounded-xl hover:bg-sand-100 transition-colors shadow-xs"
          >
            <span>Add Customer</span>
          </Link>
        </div>
      </div>

      {/* 1. KPI Cards Row (6 Cards as specified) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Customers"
          value={totalCustomers}
          subValue="Residential & Commercial"
          trend={{ value: '18.5%', isPositive: true }}
          icon={Users}
          iconBgColor="bg-sand-200/70"
          iconColor="text-navy"
        />
        <KpiCard
          title="New Enquiries"
          value={newEnquiries}
          subValue="This Month"
          trend={{ value: '12.0%', isPositive: true }}
          icon={UserPlus}
          iconBgColor="bg-amber-50"
          iconColor="text-amber"
          badge="In Flow"
          badgeColor="amber"
        />
        <KpiCard
          title="Active Projects"
          value={activeProjects}
          subValue="In Survey/Dispatch"
          trend={{ value: '8.4%', isPositive: true }}
          icon={Zap}
          iconBgColor="bg-sand-200/70"
          iconColor="text-navy"
        />
        <KpiCard
          title="Pending Quotes"
          value={pendingQuotations}
          subValue="Awaiting Approval"
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconColor="text-amber"
        />
        <KpiCard
          title="Total Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(2)}L`}
          subValue="Recorded Contracts"
          trend={{ value: '14.2%', isPositive: true }}
          icon={IndianRupee}
          iconBgColor="bg-sage-50"
          iconColor="text-sage"
          badge="Target Met"
          badgeColor="sage"
        />
        <KpiCard
          title="Outstanding Due"
          value={`₹${(outstandingPayments / 100000).toFixed(2)}L`}
          subValue="Across 3 Milestones"
          icon={AlertCircle}
          iconBgColor="bg-terracotta-50"
          iconColor="text-terracotta"
          badge="Follow-up"
          badgeColor="terracotta"
        />
      </div>

      {/* 2. Middle Row: Revenue Analytics Chart & Installation Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Analytics (Recharts) */}
        <div className="lg:col-span-2 bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-charcoal">Revenue & Profit Analytics</h2>
              <p className="text-xs text-mutedGrey">Monthly cash flow & gross profit comparison (₹ INR)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-navy" />
                <span className="text-mutedGrey">Revenue</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-sage" />
                <span className="text-mutedGrey">Net Profit</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#183153" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#183153" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6F8F7A" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#6F8F7A" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE8DE" vertical={false} />
                <XAxis dataKey="month" stroke="#777777" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#777777" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={val => `₹${val / 100000}L`} 
                />
                <Tooltip 
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#30343B', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#183153" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#6F8F7A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" name="Gross Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Installation Status Overview */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-charcoal">Installation Operations</h2>
              <Link to="/installations" className="text-xs text-navy font-semibold hover:underline flex items-center">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-mutedGrey mb-4">Monthly job capacity: 40 rooftop systems</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-warmGrey/60">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber" />
                  <span className="text-xs font-semibold text-charcoal">Scheduled / Assigned</span>
                </div>
                <span className="text-sm font-bold text-charcoal">{scheduledInst}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-warmGrey/60">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-navy" />
                  <span className="text-xs font-semibold text-charcoal">In Progress on Site</span>
                </div>
                <span className="text-sm font-bold text-charcoal">{inProgressInst}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-warmGrey/60">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-sage" />
                  <span className="text-xs font-semibold text-charcoal">Commissioned & Synced</span>
                </div>
                <span className="text-sm font-bold text-charcoal">{completedInst}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-warmGrey/60">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-terracotta" />
                  <span className="text-xs font-semibold text-charcoal">Delayed / Weather Gate</span>
                </div>
                <span className="text-sm font-bold text-charcoal">{delayedInst}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-warmGrey/60 flex items-center justify-between text-xs text-mutedGrey">
            <span>Workforce Allocation</span>
            <span className="font-semibold text-charcoal">15 / 15 Technicians Active</span>
          </div>
        </div>

      </div>

      {/* 3. Third Row: Recent Customer Enquiries & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Enquiries Table */}
        <div className="lg:col-span-2 bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-charcoal">Recent Customer Enquiries</h2>
              <p className="text-xs text-mutedGrey">Live inquiries across Website, WhatsApp & Phone</p>
            </div>
            <Link to="/customers" className="text-xs font-semibold text-navy hover:underline">
              View CRM Table
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-mutedGrey font-semibold uppercase tracking-wider border-b border-warmGrey">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Capacity</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Salesperson</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmGrey/40 text-charcoal">
                {customers.slice(0, 5).map(c => (
                  <tr key={c.id} className="hover:bg-sand-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-charcoal">{c.fullName}</div>
                      <div className="text-[11px] text-mutedGrey">{c.phone}</div>
                    </td>
                    <td className="py-3 px-3 text-mutedGrey">{c.city}</td>
                    <td className="py-3 px-3 font-semibold text-navy">{c.interestedCapacityKw} kW</td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-sand-100 text-[11px] text-charcoal font-medium">
                        {c.enquirySource.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-mutedGrey">{c.assignedSalesperson.split(' ')[0]}</td>
                    <td className="py-3 px-3 text-right">
                      <StatusBadge status={c.leadStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alerts Box */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber" />
                <h2 className="text-sm font-bold text-charcoal">Inventory Alerts</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber border border-amber/30">
                {lowStockItems.length} Warnings
              </span>
            </div>
            <p className="text-xs text-mutedGrey mb-3">Critical hardware near or below minimum threshold</p>

            <div className="space-y-2.5">
              {lowStockItems.map(item => (
                <div key={item.id} className="p-3 rounded-xl border border-warmGrey/60 bg-sand-50/60 hover:bg-sand-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-charcoal leading-tight">{item.name}</h4>
                      <p className="text-[11px] font-mono text-mutedGrey mt-0.5">{item.sku}</p>
                    </div>
                    <span className="text-xs font-bold text-terracotta">
                      {item.availableQuantity} Left
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-mutedGrey">
                    <span>Threshold: {item.minimumThreshold} units</span>
                    <span className="text-navy font-semibold">Reserved: {item.reservedQuantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-warmGrey/60">
            <Link
              to="/inventory"
              className="w-full block text-center py-2 bg-sand-100 hover:bg-sand-200 text-charcoal text-xs font-semibold rounded-xl transition-colors border border-warmGrey"
            >
              Open Warehouse Catalog
            </Link>
          </div>
        </div>

      </div>

      {/* 4. Fourth Row: Recent Activities & Service Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Operational Activities */}
        <div className="lg:col-span-2 bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
          <h2 className="text-sm font-bold text-charcoal mb-1">Company Activity Stream</h2>
          <p className="text-xs text-mutedGrey mb-4">Real-time log of sales conversions, site dispatches & signoffs</p>

          <div className="space-y-3.5">
            <div className="flex items-start space-x-3 text-xs">
              <div className="w-7 h-7 rounded-lg bg-sage-50 text-sage flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-charcoal">
                  Installation Commissioned: Mahalaxmi Agro Plastics (5 kW Commercial)
                </p>
                <p className="text-mutedGrey text-[11px]">
                  Technician Amit Jadhav completed 8-point checklist and obtained customer digital signature.
                </p>
                <span className="text-[10px] text-mutedGrey/70">2 hours ago • Operations</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <div className="w-7 h-7 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0 mt-0.5">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-charcoal">
                  Advance Payment Received: Rajesh Sharma (₹95,000)
                </p>
                <p className="text-mutedGrey text-[11px]">
                  NEFT-HDFC-991204882 verified by Chief Accountant Ramesh Patil.
                </p>
                <span className="text-[10px] text-mutedGrey/70">Yesterday • Accounts</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-charcoal">
                  Site Survey Approved: SRV-2026-041 (Baner Hill View)
                </p>
                <p className="text-mutedGrey text-[11px]">
                  94.5 sq.m shadow-free RCC area verified. High-yield 540W Mono PERC proposal generated.
                </p>
                <span className="text-[10px] text-mutedGrey/70">2 days ago • Engineering</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Complaints Overview */}
        <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-charcoal">Warranty & Support</h2>
            <Link to="/service" className="text-xs font-semibold text-navy hover:underline">
              Tickets
            </Link>
          </div>
          <p className="text-xs text-mutedGrey mb-4">Post-commissioning customer support & RMA</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60">
              <span className="text-[11px] font-semibold text-mutedGrey">Open Tickets</span>
              <p className="text-xl font-bold text-charcoal mt-0.5">{openComplaints.length}</p>
            </div>
            <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60">
              <span className="text-[11px] font-semibold text-mutedGrey">In Progress</span>
              <p className="text-xl font-bold text-amber mt-0.5">{inProgressComplaints.length}</p>
            </div>
            <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60">
              <span className="text-[11px] font-semibold text-mutedGrey">Under Warranty</span>
              <p className="text-xl font-bold text-sage mt-0.5">100%</p>
            </div>
            <div className="p-3 bg-sand-50 rounded-xl border border-warmGrey/60">
              <span className="text-[11px] font-semibold text-mutedGrey">Resolved</span>
              <p className="text-xl font-bold text-charcoal mt-0.5">{resolvedComplaints.length}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sand-100 border border-warmGrey text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-navy">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Active RMA Warranty Guarantee</span>
            </div>
            <p className="text-[11px] text-mutedGrey mt-1">
              Inverters 2Y, Batteries 2Y, Panels 20Y calculated from customer delivery confirmation.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
