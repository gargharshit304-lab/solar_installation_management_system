import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Compass, FileText, ShoppingCart,
  Package, Truck, Wrench, UserCheck, ShieldCheck,
  HeadphonesIcon, IndianRupee, BarChart3, Bot,
  Cpu, Settings as SettingsIcon, ChevronRight, ChevronDown,
  UserPlus, CalendarClock, Bell, ClipboardList, CheckCircle2,
  Building2, Activity, CheckSquare, Layers, Mic
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { 
    currentUser, 
    isSidebarCollapsed, 
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    inventory,
    complaints,
    surveys,
    orders,
    followUps,
    enquiries,
    quotations,
    notifications,
    approvals,
    smartAlerts
  } = useApp();

  // Collapsible section state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const lowStockCount = inventory.filter(i => i.stockStatus === 'low_stock' || i.stockStatus === 'out_of_stock').length;
  const openComplaintsCount = complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length;
  const pendingSurveysCount = surveys.filter(s => s.status === 'submitted' || s.status === 'assigned').length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'confirmed' || o.orderStatus === 'processing').length;
  const overdueFollowUpsCount = followUps.filter(f => f.status === 'overdue' || (f.status === 'pending' && f.scheduledDate.startsWith(new Date().toISOString().split('T')[0]))).length;
  const newEnquiriesCount = enquiries.filter(e => e.leadStatus === 'new').length;
  const pendingQuotesCount = quotations.filter(q => q.status === 'sent' || q.status === 'draft').length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;
  const activeAlertsCount = smartAlerts.filter(a => a.status === 'new').length;

  // Field Survey Specialist metrics
  const myAssignedSurveys = surveys.filter(s => 
    (s.technicianName?.includes(currentUser.name.split(' ')[0]) || s.technicianId === currentUser.id) &&
    (s.status === 'assigned' || s.status === 'scheduled' || s.status === 'in_progress')
  );
  const availableSurveysCount = surveys.filter(s => s.status === 'unassigned').length;
  const myPendingReportsCount = surveys.filter(s => 
    (s.technicianName?.includes(currentUser.name.split(' ')[0]) || s.technicianId === currentUser.id) &&
    (s.status === 'in_progress' || s.reviewStatus === 'corrections_required' || s.isDraft)
  ).length;

  // Engineering Lead metrics
  const engineeringReviewQueueCount = surveys.filter(s => s.status === 'submitted' || s.reviewStatus === 'submitted').length;

  // Dedicated Field Survey Specialist Navigation Structure
  const fieldSections: NavSection[] = [
    {
      title: 'FIELD OPERATIONS',
      items: [
        { 
          name: 'My Dashboard', 
          path: '/field', 
          icon: LayoutDashboard, 
          allowedRoles: ['survey_tech'] 
        },
        { 
          name: 'My Assignments', 
          path: '/field/assignments', 
          icon: ClipboardList, 
          allowedRoles: ['survey_tech'],
          badge: myAssignedSurveys.length > 0 ? myAssignedSurveys.length : undefined
        },
        { 
          name: 'Available Surveys', 
          path: '/field/available-surveys', 
          icon: Compass, 
          allowedRoles: ['survey_tech'],
          badge: availableSurveysCount > 0 ? availableSurveysCount : undefined
        },
        { 
          name: 'My Schedule', 
          path: '/field/schedule', 
          icon: CalendarClock, 
          allowedRoles: ['survey_tech'] 
        },
        { 
          name: 'Survey Reports', 
          path: '/field/reports', 
          icon: FileText, 
          allowedRoles: ['survey_tech'],
          badge: myPendingReportsCount > 0 ? myPendingReportsCount : undefined
        },
        ...(currentUser.canViewTeam || currentUser.isChiefSurveySpecialist || currentUser.role === 'owner_admin' ? [
          { 
            name: 'Survey Team', 
            path: '/field/team', 
            icon: Users, 
            allowedRoles: ['survey_tech', 'owner_admin'] as UserRole[]
          }
        ] : []),
      ]
    },
    {
      title: 'OTHER',
      items: [
        { 
          name: 'Notifications', 
          path: '/notifications', 
          icon: Bell, 
          allowedRoles: ['survey_tech'],
          badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined
        },
        { 
          name: 'My Profile', 
          path: '/profile', 
          icon: UserCheck, 
          allowedRoles: ['survey_tech'] 
        },
        { 
          name: 'Settings', 
          path: '/settings', 
          icon: SettingsIcon, 
          allowedRoles: ['survey_tech'] 
        },
      ]
    }
  ];

  // Dedicated Engineering Lead Navigation Structure
  const engineeringSections: NavSection[] = [
    {
      title: 'ENGINEERING WORKSPACE',
      items: [
        { 
          name: 'Engineering Dashboard', 
          path: '/engineering', 
          icon: LayoutDashboard, 
          allowedRoles: ['engineering_lead'] 
        },
        { 
          name: 'Technical Review Queue', 
          path: '/engineering/review', 
          icon: ClipboardList, 
          allowedRoles: ['engineering_lead'],
          badge: engineeringReviewQueueCount > 0 ? engineeringReviewQueueCount : undefined
        },
        { 
          name: 'Approved Feasibilities', 
          path: '/engineering/approved', 
          icon: CheckCircle2, 
          allowedRoles: ['engineering_lead'] 
        },
      ]
    },
    {
      title: 'OTHER',
      items: [
        { 
          name: 'Notifications', 
          path: '/notifications', 
          icon: Bell, 
          allowedRoles: ['engineering_lead'],
          badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined
        },
        { 
          name: 'My Profile', 
          path: '/profile', 
          icon: UserCheck, 
          allowedRoles: ['engineering_lead'] 
        },
        { 
          name: 'Settings', 
          path: '/settings', 
          icon: SettingsIcon, 
          allowedRoles: ['engineering_lead'] 
        },
      ]
    }
  ];

  // Dedicated Sales Executive Navigation Structure (Section 2)
  const salesSections: NavSection[] = [
    {
      title: 'SALES WORKSPACE',
      items: [
        { 
          name: 'Sales Overview', 
          path: '/', 
          icon: LayoutDashboard, 
          allowedRoles: ['sales_exec'] 
        },
        { 
          name: 'Customer Enquiries', 
          path: '/enquiries', 
          icon: UserPlus, 
          allowedRoles: ['sales_exec'],
          badge: newEnquiriesCount > 0 ? newEnquiriesCount : undefined
        },
        { 
          name: 'My Customers', 
          path: '/customers', 
          icon: Users, 
          allowedRoles: ['sales_exec'] 
        },
        { 
          name: 'Follow-ups', 
          path: '/follow-ups', 
          icon: CalendarClock, 
          allowedRoles: ['sales_exec'],
          badge: overdueFollowUpsCount > 0 ? overdueFollowUpsCount : undefined
        },
        { 
          name: 'Site Surveys', 
          path: '/surveys', 
          icon: Compass, 
          allowedRoles: ['sales_exec'],
          badge: pendingSurveysCount > 0 ? pendingSurveysCount : undefined
        },
        { 
          name: 'Quotations', 
          path: '/quotations', 
          icon: FileText, 
          allowedRoles: ['sales_exec'],
          badge: pendingQuotesCount > 0 ? pendingQuotesCount : undefined
        },
        { 
          name: 'Orders', 
          path: '/orders', 
          icon: ShoppingCart, 
          allowedRoles: ['sales_exec'] 
        },
      ]
    },
    {
      title: 'OTHER',
      items: [
        { 
          name: 'Notifications', 
          path: '/notifications', 
          icon: Bell, 
          allowedRoles: ['sales_exec'],
          badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined
        },
        { 
          name: 'My Profile', 
          path: '/profile', 
          icon: UserCheck, 
          allowedRoles: ['sales_exec'] 
        },
        { 
          name: 'Settings', 
          path: '/settings', 
          icon: SettingsIcon, 
          allowedRoles: ['sales_exec'] 
        },
      ]
    }
  ];

  const accountantSections: NavSection[] = [
    {
      title: 'FINANCE WORKSPACE',
      items: [
        { name: 'Finance Dashboard', path: '/', icon: IndianRupee, allowedRoles: ['accountant'] },
        { name: 'Orders & Payments', path: '/orders', icon: ShoppingCart, allowedRoles: ['accountant'] },
        { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, allowedRoles: ['accountant'] },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Notifications', path: '/notifications', icon: Bell, allowedRoles: ['accountant'], badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined },
        { name: 'My Profile', path: '/profile', icon: UserCheck, allowedRoles: ['accountant'] },
      ]
    }
  ];

  const supportSections: NavSection[] = [
    {
      title: 'CLIENT CARE',
      items: [
        { name: 'Service Dashboard', path: '/', icon: HeadphonesIcon, allowedRoles: ['support_exec'] },
        { name: 'Service & Complaints', path: '/service', icon: Wrench, allowedRoles: ['support_exec'], badge: openComplaintsCount > 0 ? openComplaintsCount : undefined },
        { name: 'Warranty Management', path: '/warranty', icon: ShieldCheck, allowedRoles: ['support_exec'] },
        { name: 'Customers & CRM', path: '/customers', icon: Users, allowedRoles: ['support_exec'] },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Notifications', path: '/notifications', icon: Bell, allowedRoles: ['support_exec'], badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined },
        { name: 'My Profile', path: '/profile', icon: UserCheck, allowedRoles: ['support_exec'] },
      ]
    }
  ];

  const installationSections: NavSection[] = [
    {
      title: 'INSTALLATION WORKSPACE',
      items: [
        { name: 'Installation Dashboard', path: '/', icon: Wrench, allowedRoles: ['install_tech'] },
        { name: 'Installations', path: '/installations', icon: UserCheck, allowedRoles: ['install_tech'] },
        { name: 'Service Complaints', path: '/service', icon: HeadphonesIcon, allowedRoles: ['install_tech'], badge: openComplaintsCount > 0 ? openComplaintsCount : undefined },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Notifications', path: '/notifications', icon: Bell, allowedRoles: ['install_tech'], badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined },
        { name: 'My Profile', path: '/profile', icon: UserCheck, allowedRoles: ['install_tech'] },
      ]
    }
  ];

  // Dedicated Owner & Managing Director Command Center Navigation Structure
  const ownerSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { 
          name: 'Company Overview', 
          path: '/', 
          icon: LayoutDashboard, 
          allowedRoles: ['owner_admin'] 
        },
        { 
          name: 'Activity Center', 
          path: '/activity-center', 
          icon: Activity, 
          allowedRoles: ['owner_admin'] 
        },
        { 
          name: 'Approvals & Requests', 
          path: '/approvals', 
          icon: CheckSquare, 
          allowedRoles: ['owner_admin'],
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined
        },
      ]
    },
    {
      title: 'PEOPLE MANAGEMENT',
      items: [
        { 
          name: 'Employees & Workforce', 
          path: '/workforce', 
          icon: UserCheck, 
          allowedRoles: ['owner_admin'] 
        },
        { 
          name: 'Departments & Teams', 
          path: '/departments', 
          icon: Building2, 
          allowedRoles: ['owner_admin'] 
        },
        { 
          name: 'Roles & Permissions', 
          path: '/roles-permissions', 
          icon: Layers, 
          allowedRoles: ['owner_admin'] 
        },
      ]
    },
    {
      title: 'BUSINESS OPERATIONS',
      items: [
        { 
          name: 'Customers & CRM', 
          path: '/customers', 
          icon: Users, 
          allowedRoles: ['owner_admin'] 
        },
        { 
          name: 'Site Surveys', 
          path: '/surveys', 
          icon: Compass, 
          allowedRoles: ['owner_admin'],
          badge: pendingSurveysCount > 0 ? pendingSurveysCount : undefined
        },
        { 
          name: 'Installations & Projects', 
          path: '/installations', 
          icon: Wrench, 
          allowedRoles: ['owner_admin'] 
        },
        { 
          name: 'Inventory & Warehouse', 
          path: '/inventory', 
          icon: Package, 
          allowedRoles: ['owner_admin'],
          badge: lowStockCount > 0 ? lowStockCount : undefined
        },
        { 
          name: 'Finance & Accounts', 
          path: '/finance', 
          icon: IndianRupee, 
          allowedRoles: ['owner_admin'] 
        },
      ]
    },
    {
      title: 'INTELLIGENCE & AUTOMATION',
      items: [
        { 
          name: 'AI Voice Agents', 
          path: '/ai-agents', 
          icon: Mic, 
          allowedRoles: ['owner_admin'] 
        },
        { 
          name: 'Business Reports', 
          path: '/reports', 
          icon: BarChart3, 
          allowedRoles: ['owner_admin'] 
        },
        { 
          name: 'Smart Alerts', 
          path: '/notifications', 
          icon: Bell, 
          allowedRoles: ['owner_admin'],
          badge: activeAlertsCount > 0 ? activeAlertsCount : undefined
        },
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { 
          name: 'System Settings', 
          path: '/settings', 
          icon: SettingsIcon, 
          allowedRoles: ['owner_admin'] 
        },
        { 
          name: 'Company Profile', 
          path: '/profile', 
          icon: ShieldCheck, 
          allowedRoles: ['owner_admin'] 
        },
      ]
    }
  ];

  // Default Full Operational Sections (Preserved for Warehouse & Other Operations)
  const standardSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { 
          name: 'Overview', 
          path: '/', 
          icon: LayoutDashboard, 
          allowedRoles: ['owner_admin', 'warehouse_mgr', 'install_tech', 'support_exec', 'accountant'] 
        },
        { 
          name: 'Customers & CRM', 
          path: '/customers', 
          icon: Users, 
          allowedRoles: ['owner_admin', 'support_exec'] 
        },
        { 
          name: 'Site Surveys', 
          path: '/surveys', 
          icon: Compass, 
          allowedRoles: ['owner_admin'],
          badge: pendingSurveysCount > 0 ? pendingSurveysCount : undefined
        },
        { 
          name: 'Quotations', 
          path: '/quotations', 
          icon: FileText, 
          allowedRoles: ['owner_admin'] 
        },
        { 
          name: 'Orders & Payments', 
          path: '/orders', 
          icon: ShoppingCart, 
          allowedRoles: ['owner_admin', 'accountant'],
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
        },
      ]
    },
    {
      title: 'Operations',
      items: [
        { 
          name: 'Inventory', 
          path: '/inventory', 
          icon: Package, 
          allowedRoles: ['owner_admin', 'warehouse_mgr'],
          badge: lowStockCount > 0 ? lowStockCount : undefined
        },
        { 
          name: 'Dispatch', 
          path: '/dispatch', 
          icon: Truck, 
          allowedRoles: ['owner_admin', 'warehouse_mgr'] 
        },
        { 
          name: 'Installations', 
          path: '/installations', 
          icon: Wrench, 
          allowedRoles: ['owner_admin', 'install_tech', 'warehouse_mgr'] 
        },
        { 
          name: 'Workforce', 
          path: '/workforce', 
          icon: UserCheck, 
          allowedRoles: ['owner_admin'] 
        },
      ]
    },
    {
      title: 'After-sales',
      items: [
        { 
          name: 'Warranty Management', 
          path: '/warranty', 
          icon: ShieldCheck, 
          allowedRoles: ['owner_admin', 'support_exec', 'warehouse_mgr'] 
        },
        { 
          name: 'Service & Complaints', 
          path: '/service', 
          icon: HeadphonesIcon, 
          allowedRoles: ['owner_admin', 'support_exec', 'install_tech'],
          badge: openComplaintsCount > 0 ? openComplaintsCount : undefined
        },
      ]
    },
    {
      title: 'Business',
      items: [
        { 
          name: 'Finance', 
          path: '/finance', 
          icon: IndianRupee, 
          allowedRoles: ['owner_admin', 'accountant'] 
        },
        { 
          name: 'Reports & Analytics', 
          path: '/reports', 
          icon: BarChart3, 
          allowedRoles: ['owner_admin', 'accountant'] 
        },
      ]
    },
    {
      title: 'AI',
      items: [
        { 
          name: 'AI Command Center', 
          path: '/ai', 
          icon: Bot, 
          allowedRoles: ['owner_admin', 'warehouse_mgr', 'accountant'] 
        },
        { 
          name: 'Agent Activity', 
          path: '/agent-activity', 
          icon: Cpu, 
          allowedRoles: ['owner_admin'] 
        },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { 
          name: 'Settings', 
          path: '/settings', 
          icon: SettingsIcon, 
          allowedRoles: ['owner_admin'] 
        },
      ]
    }
  ];

  const sectionsToRender =
    currentUser.role === 'owner_admin' ? ownerSections :
    currentUser.role === 'sales_exec' ? salesSections :
    currentUser.role === 'survey_tech' ? fieldSections :
    currentUser.role === 'engineering_lead' ? engineeringSections :
    currentUser.role === 'accountant' ? accountantSections :
    currentUser.role === 'support_exec' ? supportSections :
    currentUser.role === 'install_tech' ? installationSections :
    standardSections;

  const renderContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-warmGrey/80 select-none">
      {/* Company Branding Card in Sidebar */}
      <div className="p-4 border-b border-warmGrey/60 bg-sand-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-xs">
            SP
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-charcoal truncate">SunPower Operations</h4>
            <p className="text-[11px] text-mutedGrey truncate">40 Installations / Mo</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sectionsToRender.map(section => {
          // Filter items based on current active user role
          const visibleItems = section.items.filter(item => 
            item.allowedRoles.includes(currentUser.role)
          );

          if (visibleItems.length === 0) return null;

          const isCollapsed = collapsedSections[section.title];

          return (
            <div key={section.title} className="space-y-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-mutedGrey hover:text-charcoal transition-colors group"
              >
                <span>{section.title}</span>
                <span className="text-warmGrey group-hover:text-charcoal">
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5 mt-1">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `
                          flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group
                          ${isActive 
                            ? 'bg-navy text-white shadow-xs font-semibold' 
                            : 'text-charcoal hover:bg-sand-100 hover:text-navy'}
                        `}
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center space-x-2.5 truncate">
                              <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-sand' : 'text-mutedGrey group-hover:text-navy'
                              }`} />
                              <span className="truncate">{item.name}</span>
                            </div>

                            {item.badge !== undefined && (
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                                isActive 
                                  ? 'bg-sand text-navy' 
                                  : 'bg-amber-50 text-amber border border-amber/30'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Role Indicator Footer */}
      <div className="p-3 border-t border-warmGrey/60 bg-sand-100/40 text-[11px]">
        <div className="flex items-center justify-between text-mutedGrey mb-1">
          <span>Active View:</span>
          <span className="font-semibold text-charcoal">{currentUser.name.split(' ')[0]}</span>
        </div>
        <div className="truncate font-medium text-navy text-[11px] bg-white px-2 py-1 rounded border border-warmGrey">
          {currentUser.roleTitle}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 shrink-0 z-30">
        {renderContent()}
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-xl">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};
