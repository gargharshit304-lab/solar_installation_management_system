import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  owner_admin: '/',
  sales_exec: '/sales-overview',
  survey_tech: '/field',
  engineering_lead: '/engineering',
  warehouse_mgr: '/inventory',
  install_tech: '/installations',
  support_exec: '/service',
  accountant: '/finance',
};

export const AccessDeniedPage: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const primaryDashboard = ROLE_DASHBOARDS[currentUser.role] || '/';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-warmGrey p-8 max-w-md w-full text-center shadow-card space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-charcoal">
          Access Restricted (403)
        </h2>

        <p className="text-xs text-mutedGrey leading-relaxed">
          Your current account role (<strong className="text-charcoal font-semibold">{currentUser.roleTitle}</strong>) does not have authorization to view this department workspace.
        </p>

        <div className="pt-4 border-t border-warmGrey/60 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-charcoal border border-warmGrey rounded-xl hover:bg-sand-100 transition-colors flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate(primaryDashboard, { replace: true })}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-navy hover:bg-navy-light rounded-xl transition-colors shadow-xs flex items-center justify-center space-x-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>My Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
