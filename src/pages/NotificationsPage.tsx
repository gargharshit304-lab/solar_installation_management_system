import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Sales & Operational Notifications</h1>
          <p className="text-xs text-mutedGrey mt-0.5">
            Real-time alerts for customer enquiries, follow-ups due, survey approvals and quotation acceptances
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
