import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, Search, Bell, HelpCircle, ChevronDown, 
  User, Settings as SettingsIcon, LogOut, ShieldCheck, 
  Menu, X, Check, ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    switchRole, 
    usersList, 
    setIsGlobalSearchOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    showToast,
    logout
  } = useApp();
  const navigate = useNavigate();

  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Derive human-readable page title from location
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
      case '/overview': 
        if (currentUser.role === 'survey_tech') return 'Field Operations Dashboard';
        if (currentUser.role === 'engineering_lead') return 'Engineering Dashboard';
        if (currentUser.role === 'sales_exec') return 'Sales Executive Workspace';
        return 'Executive Overview';
      case '/field':
      case '/field/dashboard': return 'Field Operations Dashboard';
      case '/field/assignments': return 'My Survey Assignments';
      case '/field/available-surveys': return 'Available Field Surveys';
      case '/field/schedule': return 'My Survey Schedule & Availability';
      case '/field/reports': return 'Technical Survey Reports';
      case '/field/team': return 'Field Survey Team Directory';
      case '/engineering':
      case '/engineering/dashboard': return 'Engineering Feasibility Dashboard';
      case '/engineering/review': return 'Feasibility Review Queue';
      case '/engineering/approved': return 'Approved Feasibilities History';
      case '/customers': return 'Customers & CRM';
      case '/surveys': return 'Site Surveys';
      case '/quotations': return 'Solar Packages & Quotations';
      case '/orders': return 'Orders & Customer Payments';
      case '/inventory': return 'Warehouse & Inventory';
      case '/dispatch': return 'Material Dispatch & Logistics';
      case '/installations': return 'Solar Installations & Operations';
      case '/workforce': return 'Field Engineering & Workforce';
      case '/warranty': return 'Equipment Warranty Records';
      case '/service': return 'Service Complaints & Repair Tickets';
      case '/finance': return 'Finance & Project Profitability';
      case '/reports': return 'Enterprise Reports & Analytics';
      case '/ai': return 'AI Operations Command Center';
      case '/agent-activity': return 'Autonomous Agent Execution Logs';
      case '/settings': return 'System Settings & Configurations';
      default: return 'SolarOS';
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-charcoal text-white shadow-md border-b border-charcoal-light">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Mobile hamburger + Brand & Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-sand hover:bg-charcoal-light transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-amber flex items-center justify-center text-charcoal shadow-sm group-hover:bg-amber-light transition-colors">
              <Sun className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base tracking-tight text-white">SolarOS</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-navy px-1.5 py-0.5 rounded text-sand border border-warmGrey/20">
                  Enterprise
                </span>
              </div>
              <p className="text-[10px] text-warmGrey-light leading-none">SunPower Solutions</p>
            </div>
          </Link>

          {/* Breadcrumb / Page Title */}
          <div className="hidden md:flex items-center space-x-2 border-l border-charcoal-light pl-4 ml-2">
            <span className="text-xs text-mutedGrey">Portal</span>
            <span className="text-xs text-warmGrey">/</span>
            <span className="text-sm font-semibold text-sand">{getPageTitle(location.pathname)}</span>
          </div>
        </div>

        {/* Center: Global Search Bar Trigger */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-warmGrey-light bg-charcoal-dark/70 hover:bg-charcoal-dark border border-warmGrey/20 rounded-xl transition-all shadow-inner group"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-warmGrey group-hover:text-amber transition-colors" />
              <span>Search customers, quotations, serial #s, tickets...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-charcoal text-warmGrey rounded border border-warmGrey/20">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Notifications, Role Switcher & Profile */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Search on mobile */}
          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg text-sand hover:bg-charcoal-light transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg text-sand hover:bg-charcoal-light hover:text-white transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-charcoal rounded-2xl shadow-dropdown border border-warmGrey overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 bg-sand-50/70 border-b border-warmGrey/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal">System Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber/20 text-amber">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-navy hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-warmGrey/40">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3.5 hover:bg-sand-50 transition-colors cursor-pointer flex items-start space-x-3 ${!n.read ? 'bg-amber-50/30' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-amber' : 'bg-warmGrey'}`} />
                      <div className="flex-1">
                        <p className={`text-xs ${!n.read ? 'font-bold text-charcoal' : 'font-medium text-charcoal-light'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-mutedGrey mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-mutedGrey/80 mt-1 inline-block">{n.timeAgo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help Modal Trigger */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-lg text-sand hover:bg-charcoal-light hover:text-white transition-colors"
            title="SolarOS Help & Architecture Guide"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* User Profile & Role Selector Dropdown */}
          <div className="relative pl-1" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-charcoal-light transition-colors text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-amber/50"
              />
              <div className="hidden lg:block">
                <div className="text-xs font-semibold text-white leading-tight flex items-center space-x-1">
                  <span>{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-warmGrey" />
                </div>
                <div className="text-[11px] text-warmGrey flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block"></span>
                  <span className="truncate max-w-[120px]">{currentUser.roleTitle}</span>
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-charcoal rounded-2xl shadow-dropdown border border-warmGrey p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Active User Card */}
                <div className="p-3 bg-sand-100 rounded-xl mb-2 border border-warmGrey/60">
                  <p className="text-xs font-bold text-charcoal">{currentUser.name}</p>
                  <p className="text-[11px] text-mutedGrey truncate">{currentUser.email}</p>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-navy text-white">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    {currentUser.roleTitle}
                  </div>
                </div>

                {/* Role Switcher Section for Instant Evaluation of All 7 Roles */}
                <div className="px-2 py-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-mutedGrey mb-1.5">
                    Switch Role View (Interactive RBAC):
                  </p>
                  <div className="space-y-1">
                    {usersList.map(u => (
                      <button
                        key={u.role}
                        onClick={() => {
                          switchRole(u.role);
                          setIsProfileMenuOpen(false);
                          const roleRoutes: Record<UserRole, string> = {
                            owner_admin: '/',
                            sales_exec: '/',
                            survey_tech: '/field',
                            engineering_lead: '/engineering',
                            warehouse_mgr: '/inventory',
                            install_tech: '/',
                            support_exec: '/',
                            accountant: '/',
                          };
                          navigate(roleRoutes[u.role] || '/');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                          currentUser.role === u.role
                            ? 'bg-navy text-white font-semibold'
                            : 'text-charcoal hover:bg-sand-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <img src={u.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                          <span className="truncate">{u.roleTitle}</span>
                        </div>
                        {currentUser.role === u.role && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="my-1 border-t border-warmGrey/60" />

                <Link
                  to="/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs text-charcoal hover:bg-sand-100 rounded-lg transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-mutedGrey" />
                  <span>Account & System Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                    navigate('/login', { replace: true });
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-terracotta hover:bg-terracotta-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-charcoal shadow-dropdown border border-warmGrey animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-warmGrey/60">
              <div className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-amber" />
                <h3 className="font-bold text-base text-charcoal">SolarOS System Architecture</h3>
              </div>
              <button onClick={() => setIsHelpOpen(false)} className="text-mutedGrey hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="py-4 space-y-3 text-xs leading-relaxed text-charcoal/90">
              <p>
                <strong>SunPower Solutions Operating System (SolarOS)</strong> handles complete end-to-end solar project lifecycles:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-mutedGrey">
                <li><strong className="text-charcoal">CRM:</strong> Inbound leads from website, WhatsApp & phone routing.</li>
                <li><strong className="text-charcoal">Site Surveys:</strong> Shadow analysis, azimuth tilt, cable distance & approvals.</li>
                <li><strong className="text-charcoal">Quotations:</strong> Dynamic BOM pricing for On-Grid & Off-Grid (1-5 kW).</li>
                <li><strong className="text-charcoal">Dispatches:</strong> Material allocation with automatic warranty activation upon delivery.</li>
                <li><strong className="text-charcoal">Installations:</strong> 8-point electrical safety checklist & digital customer signoff.</li>
                <li><strong className="text-charcoal">Finance:</strong> Project-wise profitability: <code className="bg-sand-100 px-1 py-0.5 rounded text-navy">Revenue - Equipment - Labour - Other = Profit</code>.</li>
              </ul>
              <div className="p-3 bg-sand-100 rounded-xl border border-warmGrey text-[11px]">
                💡 <strong>Tip:</strong> Click your avatar in the top right to instantly switch between all 7 enterprise roles (Owner, Sales, Survey, Warehouse, Installation, Support, Accountant).
              </div>
            </div>

            <div className="pt-3 border-t border-warmGrey/60 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-navy-light transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
