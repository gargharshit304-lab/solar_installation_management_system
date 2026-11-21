import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AccessDeniedPage } from './components/common/AccessDeniedPage';
import { isRouteAllowedForRole } from './utils/rbac';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SalesDashboardPage } from './pages/SalesDashboardPage';
import { CustomerEnquiriesPage } from './pages/CustomerEnquiriesPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';

import { CustomersPage } from './pages/CustomersPage';
import { SiteSurveysPage } from './pages/SiteSurveysPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { OrdersPaymentsPage } from './pages/OrdersPaymentsPage';
import { InventoryPage } from './pages/InventoryPage';
import { DispatchPage } from './pages/DispatchPage';
import { InstallationsPage } from './pages/InstallationsPage';
import { WorkforcePage } from './pages/WorkforcePage';
import { WarrantyPage } from './pages/WarrantyPage';
import { ServiceComplaintsPage } from './pages/ServiceComplaintsPage';
import { FinancePage } from './pages/FinancePage';
import { ReportsPage } from './pages/ReportsPage';
import { SubsidyTrackingPage } from './pages/SubsidyTrackingPage';
import { AiCommandCenterPage } from './pages/AiCommandCenterPage';
import { AgentActivityPage } from './pages/AgentActivityPage';
import { SettingsPage } from './pages/SettingsPage';

// Field Survey Specialist & Engineering Lead Pages
import { FieldDashboardPage } from './pages/field/FieldDashboardPage';
import { MyAssignmentsPage } from './pages/field/MyAssignmentsPage';
import { AvailableSurveysPage } from './pages/field/AvailableSurveysPage';
import { MySchedulePage } from './pages/field/MySchedulePage';
import { SurveyReportsPage } from './pages/field/SurveyReportsPage';
import { SurveyTeamPage } from './pages/field/SurveyTeamPage';
import { EngineeringDashboardPage } from './pages/engineering/EngineeringDashboardPage';

// Owner Command Center Pages
import { EmployeeActivityCenterPage } from './pages/owner/EmployeeActivityCenterPage';
import { DepartmentsTeamsPage } from './pages/owner/DepartmentsTeamsPage';
import { RolesPermissionsPage } from './pages/owner/RolesPermissionsPage';
import { ApprovalsRequestsPage } from './pages/owner/ApprovalsRequestsPage';
import { AiAgentManagementPage } from './pages/owner/AiAgentManagementPage';

function HomeRouter() {
  const { currentUser } = useApp();
  if (currentUser.role === 'sales_exec') {
    return <SalesDashboardPage />;
  }
  if (currentUser.role === 'survey_tech') {
    return <FieldDashboardPage />;
  }
  if (currentUser.role === 'engineering_lead') {
    return <EngineeringDashboardPage />;
  }
  if (currentUser.role === 'accountant') {
    return <FinancePage />;
  }
  if (currentUser.role === 'support_exec') {
    return <ServiceComplaintsPage />;
  }
  if (currentUser.role === 'install_tech') {
    return <InstallationsPage />;
  }
  if (currentUser.role === 'warehouse_mgr') {
    return <InventoryPage />;
  }
  return <DashboardPage />;
}

function RoleGuard({ 
  routePath, 
  allowedRoles, 
  children 
}: { 
  routePath?: string; 
  allowedRoles?: string[]; 
  children: React.ReactNode 
}) {
  const { currentUser, isInitializing, canAccessRoute } = useApp();
  if (isInitializing) {
    return null;
  }
  // Dynamic capability evaluation takes priority
  if (routePath) {
    if (canAccessRoute(routePath)) {
      return <>{children}</>;
    }
    return <AccessDeniedPage />;
  }
  // Fallback to static allowed roles if no specific route path defined
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <AccessDeniedPage />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomeRouter />} />
              <Route path="overview" element={<HomeRouter />} />
              <Route path="sales-overview" element={<SalesDashboardPage />} />
              
              {/* Sales Workspace Routes */}
              <Route path="enquiries" element={
                <RoleGuard routePath="/enquiries" allowedRoles={['owner_admin', 'sales_exec']}>
                  <CustomerEnquiriesPage />
                </RoleGuard>
              } />
              <Route path="customers" element={
                <RoleGuard routePath="/customers" allowedRoles={['owner_admin', 'sales_exec', 'support_exec']}>
                  <CustomersPage />
                </RoleGuard>
              } />
              <Route path="follow-ups" element={
                <RoleGuard routePath="/follow-ups" allowedRoles={['owner_admin', 'sales_exec']}>
                  <FollowUpsPage />
                </RoleGuard>
              } />
              <Route path="surveys" element={
                <RoleGuard routePath="/surveys" allowedRoles={['owner_admin', 'sales_exec']}>
                  <SiteSurveysPage />
                </RoleGuard>
              } />
              <Route path="quotations" element={
                <RoleGuard routePath="/quotations" allowedRoles={['owner_admin', 'sales_exec']}>
                  <QuotationsPage />
                </RoleGuard>
              } />
              <Route path="orders" element={
                <RoleGuard routePath="/orders" allowedRoles={['owner_admin', 'sales_exec', 'accountant']}>
                  <OrdersPaymentsPage />
                </RoleGuard>
              } />
              <Route path="subsidies" element={
                <RoleGuard routePath="/subsidies" allowedRoles={['owner_admin', 'sales_exec', 'accountant']}>
                  <SubsidyTrackingPage />
                </RoleGuard>
              } />

              {/* Field Survey Specialist Routes */}
              <Route path="field" element={
                <RoleGuard routePath="/field" allowedRoles={['owner_admin', 'survey_tech']}>
                  <FieldDashboardPage />
                </RoleGuard>
              } />
              <Route path="field/dashboard" element={
                <RoleGuard routePath="/field/dashboard" allowedRoles={['owner_admin', 'survey_tech']}>
                  <FieldDashboardPage />
                </RoleGuard>
              } />
              <Route path="field/assignments" element={
                <RoleGuard routePath="/field/assignments" allowedRoles={['owner_admin', 'survey_tech']}>
                  <MyAssignmentsPage />
                </RoleGuard>
              } />
              <Route path="field/available-surveys" element={
                <RoleGuard routePath="/field/available-surveys" allowedRoles={['owner_admin', 'survey_tech']}>
                  <AvailableSurveysPage />
                </RoleGuard>
              } />
              <Route path="field/schedule" element={
                <RoleGuard routePath="/field/schedule" allowedRoles={['owner_admin', 'survey_tech']}>
                  <MySchedulePage />
                </RoleGuard>
              } />
              <Route path="field/reports" element={
                <RoleGuard routePath="/field/reports" allowedRoles={['owner_admin', 'survey_tech']}>
                  <SurveyReportsPage />
                </RoleGuard>
              } />
              <Route path="field/team" element={
                <RoleGuard routePath="/field/team" allowedRoles={['owner_admin', 'survey_tech']}>
                  <SurveyTeamPage />
                </RoleGuard>
              } />

              {/* Engineering Lead Routes */}
              <Route path="engineering" element={
                <RoleGuard routePath="/engineering" allowedRoles={['owner_admin', 'engineering_lead']}>
                  <EngineeringDashboardPage />
                </RoleGuard>
              } />
              <Route path="engineering/dashboard" element={
                <RoleGuard routePath="/engineering/dashboard" allowedRoles={['owner_admin', 'engineering_lead']}>
                  <EngineeringDashboardPage />
                </RoleGuard>
              } />
              <Route path="engineering/review" element={
                <RoleGuard routePath="/engineering/review" allowedRoles={['owner_admin', 'engineering_lead']}>
                  <EngineeringDashboardPage />
                </RoleGuard>
              } />
              <Route path="engineering/approved" element={
                <RoleGuard routePath="/engineering/approved" allowedRoles={['owner_admin', 'engineering_lead']}>
                  <EngineeringDashboardPage />
                </RoleGuard>
              } />
              
              {/* Operations & Business Routes */}
              <Route path="inventory" element={
                <RoleGuard routePath="/inventory" allowedRoles={['owner_admin', 'warehouse_mgr']}>
                  <InventoryPage />
                </RoleGuard>
              } />
              <Route path="dispatch" element={
                <RoleGuard routePath="/dispatch" allowedRoles={['owner_admin', 'warehouse_mgr']}>
                  <DispatchPage />
                </RoleGuard>
              } />
              <Route path="installations" element={
                <RoleGuard routePath="/installations" allowedRoles={['owner_admin', 'install_tech']}>
                  <InstallationsPage />
                </RoleGuard>
              } />
              <Route path="workforce" element={
                <RoleGuard routePath="/workforce" allowedRoles={['owner_admin']}>
                  <WorkforcePage />
                </RoleGuard>
              } />
              <Route path="activity-center" element={
                <RoleGuard routePath="/activity-center" allowedRoles={['owner_admin']}>
                  <EmployeeActivityCenterPage />
                </RoleGuard>
              } />
              <Route path="audit" element={
                <RoleGuard routePath="/audit" allowedRoles={['owner_admin']}>
                  <EmployeeActivityCenterPage />
                </RoleGuard>
              } />
              <Route path="audit-logs" element={
                <RoleGuard routePath="/audit-logs" allowedRoles={['owner_admin']}>
                  <EmployeeActivityCenterPage />
                </RoleGuard>
              } />
              <Route path="departments" element={
                <RoleGuard routePath="/departments" allowedRoles={['owner_admin']}>
                  <DepartmentsTeamsPage />
                </RoleGuard>
              } />
              <Route path="roles-permissions" element={
                <RoleGuard routePath="/roles-permissions" allowedRoles={['owner_admin']}>
                  <RolesPermissionsPage />
                </RoleGuard>
              } />
              <Route path="approvals" element={
                <RoleGuard routePath="/approvals" allowedRoles={['owner_admin']}>
                  <ApprovalsRequestsPage />
                </RoleGuard>
              } />
              <Route path="ai-agents" element={
                <RoleGuard routePath="/ai-agents" allowedRoles={['owner_admin']}>
                  <AiAgentManagementPage />
                </RoleGuard>
              } />
              <Route path="warranty" element={
                <RoleGuard routePath="/warranty" allowedRoles={['owner_admin', 'support_exec', 'warehouse_mgr']}>
                  <WarrantyPage />
                </RoleGuard>
              } />
              <Route path="service" element={
                <RoleGuard routePath="/service" allowedRoles={['owner_admin', 'support_exec', 'install_tech']}>
                  <ServiceComplaintsPage />
                </RoleGuard>
              } />
              <Route path="finance" element={
                <RoleGuard routePath="/finance" allowedRoles={['owner_admin', 'accountant']}>
                  <FinancePage />
                </RoleGuard>
              } />
              <Route path="reports" element={
                <RoleGuard routePath="/reports" allowedRoles={['owner_admin', 'accountant']}>
                  <ReportsPage />
                </RoleGuard>
              } />
              <Route path="ai" element={
                <RoleGuard routePath="/ai" allowedRoles={['owner_admin']}>
                  <AiCommandCenterPage />
                </RoleGuard>
              } />
              <Route path="agent-activity" element={
                <RoleGuard routePath="/agent-activity" allowedRoles={['owner_admin']}>
                  <AgentActivityPage />
                </RoleGuard>
              } />
              
              {/* User & General Routes */}
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
