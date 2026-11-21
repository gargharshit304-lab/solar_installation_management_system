import React from 'react';
import { useApp } from '../context/AppContext';
import { User, ShieldCheck, Mail, Phone, Award, Target, Star, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, orders, quotations, customers } = useApp();

  const myCustomers = customers.filter(c => c.assignedSalesperson.includes(currentUser.name.split(' ')[0]));
  const myOrders = orders.filter(o => myCustomers.some(c => c.id === o.customerId));
  const myQuotes = quotations.filter(q => myCustomers.some(c => c.id === q.customerId));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-charcoal tracking-tight">Sales Consultant Profile</h1>
        <p className="text-xs text-mutedGrey mt-0.5">
          Individual sales quotas, verified credentials & performance history
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-card p-6 border border-warmGrey/60 shadow-card flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-sand-200"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div>
            <h2 className="text-xl font-bold text-charcoal">{currentUser.name}</h2>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy text-white mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentUser.roleTitle}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-mutedGrey pt-1">
            <span className="flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-navy" />
              <span>{currentUser.email}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-navy" />
              <span>+91 98221 00916</span>
            </span>
            <span className="flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-amber" />
              <span>Solar Sizing & Payback Certified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Quota & Performance Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-bold text-mutedGrey">
            <Target className="w-4 h-4 text-navy" />
            <span>MONTHLY CONVERSION TARGET</span>
          </div>
          <div className="text-2xl font-bold text-navy mt-1">10 Projects</div>
          <p className="text-[11px] text-mutedGrey mt-1">Target monthly rooftop capacity: 50 kW</p>
        </div>

        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-bold text-mutedGrey">
            <CheckCircle2 className="w-4 h-4 text-sage" />
            <span>CONFIRMED SALES ORDERS</span>
          </div>
          <div className="text-2xl font-bold text-sage mt-1">{myOrders.length} Orders</div>
          <p className="text-[11px] text-mutedGrey mt-1">Across residential & commercial accounts</p>
        </div>

        <div className="bg-white rounded-card p-4 border border-warmGrey/60 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-bold text-mutedGrey">
            <Star className="w-4 h-4 text-amber" />
            <span>CUSTOMER SATISFACTION</span>
          </div>
          <div className="text-2xl font-bold text-amber mt-1">4.9 / 5.0</div>
          <p className="text-[11px] text-mutedGrey mt-1">Based on post-installation client reviews</p>
        </div>
      </div>
    </div>
  );
};
