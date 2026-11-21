import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck, Mail, Phone, Award, Target, Star, CheckCircle2,
  Building2, CalendarDays, MapPin, BriefcaseBusiness, BadgeCheck,
  IndianRupee, HeadphonesIcon, Wrench
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    orders,
    quotations,
    customers,
    payments,
    profitability,
    complaints,
    installations,
    warranties
  } = useApp();
  const [activeSection, setActiveSection] = useState<'overview' | 'activity'>('overview');

  const myCustomers = customers.filter(c => c.assignedSalesperson.includes(currentUser.name.split(' ')[0]));
  const myOrders = orders.filter(o => myCustomers.some(c => c.id === o.customerId));
  const myQuotes = quotations.filter(q => myCustomers.some(c => c.id === q.customerId));
  const completedInstallations = installations.filter(item => item.status === 'completed').length;
  const openTickets = complaints.filter(item => item.status !== 'resolved' && item.status !== 'closed').length;
  const collectedPayments = payments.reduce((sum, item) => sum + item.amount, 0);
  const portfolioProfit = profitability.reduce((sum, item) => sum + item.profit, 0);

  const roleDetails: Record<string, { phone: string; employeeId: string; location: string; joined: string; experience: string; certification: string }> = {
    owner_admin: {
      phone: '+91 98220 44100', employeeId: 'SP-EMP-001', location: 'Pune Headquarters',
      joined: '12 January 2018', experience: '8+ years', certification: 'Enterprise Leadership'
    },
    sales_exec: {
      phone: '+91 98221 00916', employeeId: 'SP-EMP-002', location: 'Pune West',
      joined: '8 March 2021', experience: '5+ years', certification: 'Solar Sales & Payback'
    },
    survey_tech: {
      phone: '+91 98221 00914', employeeId: 'SP-EMP-003', location: 'Pune & Nashik',
      joined: '20 July 2022', experience: '4+ years', certification: 'Site Survey & Shadow Analysis'
    },
    warehouse_mgr: {
      phone: '+91 98221 00915', employeeId: 'SP-EMP-004', location: 'Central Warehouse',
      joined: '14 February 2020', experience: '6+ years', certification: 'Warehouse & Logistics'
    },
    install_tech: {
      phone: '+91 98221 00917', employeeId: 'SP-EMP-005', location: 'Pune Operations',
      joined: '5 May 2022', experience: '4+ years', certification: 'Solar PV Installation'
    },
    support_exec: {
      phone: '+91 98221 00918', employeeId: 'SP-EMP-006', location: 'Client Care Center',
      joined: '11 October 2023', experience: '3+ years', certification: 'Warranty & Customer Support'
    },
    accountant: {
      phone: '+91 98221 00919', employeeId: 'SP-EMP-007', location: 'Finance & Compliance',
      joined: '16 August 2021', experience: '5+ years', certification: 'Financial Accounting'
    }
  };

  const details = roleDetails[currentUser.role];

  const roleMetrics = currentUser.role === 'accountant'
    ? [
        { label: 'Payments Collected', value: `₹${collectedPayments.toLocaleString('en-IN')}`, icon: IndianRupee, tone: 'text-navy' },
        { label: 'Project Profit', value: `₹${portfolioProfit.toLocaleString('en-IN')}`, icon: Target, tone: 'text-sage' },
        { label: 'Active Projects', value: profitability.length.toString(), icon: BriefcaseBusiness, tone: 'text-amber' },
      ]
    : currentUser.role === 'support_exec'
    ? [
        { label: 'Open Tickets', value: openTickets.toString(), icon: HeadphonesIcon, tone: 'text-terracotta' },
        { label: 'Active Warranties', value: warranties.filter(item => item.status === 'active').length.toString(), icon: ShieldCheck, tone: 'text-sage' },
        { label: 'Customer Satisfaction', value: '4.9 / 5', icon: Star, tone: 'text-amber' },
      ]
    : currentUser.role === 'install_tech'
    ? [
        { label: 'Commissioned Sites', value: completedInstallations.toString(), icon: CheckCircle2, tone: 'text-sage' },
        { label: 'Assigned Jobs', value: installations.filter(item => item.status !== 'completed').length.toString(), icon: Wrench, tone: 'text-navy' },
        { label: 'Safety Compliance', value: '100%', icon: ShieldCheck, tone: 'text-amber' },
      ]
    : currentUser.role === 'sales_exec'
    ? [
        { label: 'Monthly Target', value: '10 Projects', icon: Target, tone: 'text-navy' },
        { label: 'Confirmed Orders', value: `${myOrders.length} Orders`, icon: CheckCircle2, tone: 'text-sage' },
        { label: 'Customer Rating', value: '4.9 / 5', icon: Star, tone: 'text-amber' },
      ]
    : [
        { label: 'Active Projects', value: orders.filter(order => order.orderStatus !== 'completed').length.toString(), icon: Target, tone: 'text-navy' },
        { label: 'Customer Accounts', value: customers.length.toString(), icon: Building2, tone: 'text-sage' },
        { label: 'Open Tickets', value: openTickets.toString(), icon: HeadphonesIcon, tone: 'text-amber' },
      ];

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-charcoal sm:text-2xl">My Profile</h1>
        <p className="mt-1 text-xs text-mutedGrey">Employee details, role information and work performance</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-warmGrey/60 bg-white shadow-card">
        <div className="h-24 bg-navy sm:h-28">
          <div className="h-full bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />
        </div>
        <div className="px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left">
            <div className="-mt-12 sm:-mt-14">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-card sm:h-28 sm:w-28"
              />
            </div>
            <div className="mt-3 min-w-0 flex-1 sm:mb-1 sm:ml-5 sm:mt-0">
              <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-3">
                <h2 className="truncate text-xl font-bold text-charcoal sm:text-2xl">{currentUser.name}</h2>
                <BadgeCheck className="mt-1 h-5 w-5 text-sage sm:mt-0" />
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-navy">
                <ShieldCheck className="h-3.5 w-3.5" />
                {currentUser.roleTitle}
              </div>
            </div>
            <div className="mt-4 sm:mb-1 sm:mt-0">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-sage/25 bg-sage-50 px-3 py-1.5 text-xs font-semibold text-sage">
                <span className="h-2 w-2 rounded-full bg-sage" />
                Active Employee
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="inline-flex w-full rounded-xl border border-warmGrey/60 bg-white p-1 sm:w-auto">
        {(['overview', 'activity'] as const).map(section => (
          <button
            key={section}
            type="button"
            onClick={() => setActiveSection(section)}
            className={`flex-1 rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-colors sm:min-w-32 ${
              activeSection === section ? 'bg-navy text-white shadow-xs' : 'text-mutedGrey hover:bg-sand-50 hover:text-charcoal'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {activeSection === 'overview' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
          <section className="rounded-2xl border border-warmGrey/60 bg-white p-4 shadow-card sm:p-5">
            <h3 className="text-sm font-bold text-charcoal">Professional Information</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: 'Email Address', value: currentUser.email, icon: Mail },
                { label: 'Phone Number', value: details.phone, icon: Phone },
                { label: 'Employee ID', value: details.employeeId, icon: BadgeCheck },
                { label: 'Department', value: currentUser.department, icon: Building2 },
                { label: 'Work Location', value: details.location, icon: MapPin },
                { label: 'Join Date', value: details.joined, icon: CalendarDays },
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-warmGrey/60 bg-sand-50/40 p-3">
                  <item.icon className="mb-2 h-4 w-4 text-navy" />
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-mutedGrey">{item.label}</p>
                  <p className="mt-1 break-words text-xs font-semibold text-charcoal">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-warmGrey/60 bg-white p-4 shadow-card sm:p-5">
            <h3 className="text-sm font-bold text-charcoal">Credentials</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-sage-50 p-3">
                <Award className="h-5 w-5 text-sage" />
                <p className="mt-2 text-xs font-bold text-charcoal">{details.certification}</p>
                <p className="mt-1 text-[11px] text-mutedGrey">Primary role certification</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-warmGrey/60 p-3">
                <span className="text-xs text-mutedGrey">Experience</span>
                <span className="text-xs font-bold text-navy">{details.experience}</span>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {roleMetrics.map(metric => (
            <article
              key={metric.label}
              className="rounded-2xl border border-warmGrey/60 bg-white p-4 shadow-card transition-transform duration-300 hover:-translate-y-0.5"
            >
              <metric.icon className={`h-5 w-5 ${metric.tone}`} />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-mutedGrey">{metric.label}</p>
              <p className={`mt-1 text-xl font-bold ${metric.tone}`}>{metric.value}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
