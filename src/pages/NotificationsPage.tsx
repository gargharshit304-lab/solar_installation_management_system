import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useApp();

  const roleNotificationContent: Record<string, { title: string; description: string }> = {
    owner_admin: {
      title: 'Executive Notifications',
      description: 'Company-wide operational alerts, approvals and critical business updates'
    },
    sales_exec: {
      title: 'Sales Notifications',
      description: 'Customer enquiries, quotation approvals, orders and follow-up alerts'
    },
    survey_tech: {
      title: 'Survey Notifications',
      description: 'Assigned surveys, submitted measurements and approval updates'
    },
    warehouse_mgr: {
      title: 'Warehouse Notifications',
      description: 'Inventory alerts, reservations, dispatches and stock thresholds'
    },
    install_tech: {
      title: 'Installation Notifications',
      description: 'Assigned jobs, service complaints and installation updates'
    },
    support_exec: {
      title: 'Client Care Notifications',
      description: 'New complaints, warranty cases, priority tickets and resolutions'
    },
    accountant: {
      title: 'Finance Notifications',
      description: 'Payments, receivables, approvals and financial stock alerts'
    }
  };

  const content = roleNotificationContent[currentUser.role];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">{content.title}</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            {content.description}
          </p>
        </div>
        <button
          onClick={markAllNotificationsAsRead}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-sand-100 text-charcoal border border-warmGrey transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card divide-y divide-warmGrey/40 overflow-hidden">
        {notifications.length === 0 && (
          <div className="p-8 text-center">
            <Check className="mx-auto h-5 w-5 text-sage" />
            <p className="mt-2 text-xs font-semibold text-charcoal">No new role-specific alerts</p>
            <p className="mt-1 text-[11px] text-mutedGrey">You are up to date with your workspace notifications.</p>
          </div>
        )}
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => markNotificationAsRead(n.id)}
            className={`p-4 hover:bg-sand-50 transition-colors cursor-pointer flex items-start space-x-3 text-xs ${
              !n.read ? 'bg-amber-50/20' : ''
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              n.type === 'warning' ? 'bg-amber-50 text-amber' :
              n.type === 'success' ? 'bg-sage-50 text-sage' :
              n.type === 'alert' ? 'bg-terracotta-50 text-terracotta' : 'bg-sand-100 text-navy'
            }`}>
              <Bell className="w-4 h-4" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${!n.read ? 'font-bold text-charcoal' : 'font-medium text-charcoal'}`}>
                  {n.title}
                </span>
                <span className="text-[10px] text-mutedGrey font-mono">{n.timeAgo}</span>
              </div>
              <p className="text-mutedGrey text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
