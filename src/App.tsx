import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

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
  return <DashboardPage />;
}

function RoleGuard({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { currentUser } = useApp();
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
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
                <RoleGuard allowedRoles={['owner_admin', 'sales_exec']}>
                  <CustomerEnquiriesPage />
                </RoleGuard>
              } />
              <Route path="customers" element={
                <RoleGuard allowedRoles={['owner_admin', 'sales_exec', 'support_exec']}>
                  <CustomersPage />
                </RoleGuard>
              } />
              <Route path="follow-ups" element={
                <RoleGuard allowedRoles={['owner_admin', 'sales_exec']}>
                  <FollowUpsPage />
                </RoleGuard>
              } />
              <Route path="surveys" element={
                <RoleGuard allowedRoles={['owner_admin', 'sales_exec']}>
                  <SiteSurveysPage />
                </RoleGuard>
              } />
              <Route path="quotations" element={
                <RoleGuard allowedRoles={['owner_admin', 'sales_exec']}>
                  <QuotationsPage />
                </RoleGuard>
              } />
              <Route path="orders" element={
                <RoleGuard allowedRoles={['owner_admin', 'sales_exec', 'accountant']}>
                  <OrdersPaymentsPage />
                </RoleGuard>
              } />

              {/* Field Survey Specialist Routes */}
              <Route path="field" element={
                <RoleGuard allowedRoles={['owner_admin', 'survey_tech']}>
                  <FieldDashboardPage />
                </RoleGuard>
              } />
              <Route path="field/dashboard" element={
                <RoleGuard allowedRoles={['owner_admin', 'survey_tech']}>
                  <FieldDashboardPage />
                </RoleGuard>
              } />
              <Route path="field/assignments" element={
                <RoleGuard allowedRoles={['owner_admin', 'survey_tech']}>
                  <MyAssignmentsPage />
                </RoleGuard>
              } />
              <Route path="field/available-surveys" element={
                <RoleGuard allowedRoles={['owner_admin', 'survey_tech']}>
                  <AvailableSurveysPage />
                </RoleGuard>
              } />
              <Route path="field/schedule" element={
                <RoleGuard allowedRoles={['owner_admin', 'survey_tech']}>
                  <MySchedulePage />
                </RoleGuard>
              } />
              <Route path="field/reports" element={
                <RoleGuard allowedRoles={['owner_admin', 'survey_tech']}>
                  <SurveyReportsPage />
                </RoleGuard>
              } />
              <Route path="field/team" element={
                <RoleGuard allowedRoles={['owner_admin', 'survey_tech']}>
                  <SurveyTeamPage />
                </RoleGuard>
              } />

              {/* Engineering Lead Routes */}
              <Route path="engineering" element={
                <RoleGuard allowedRoles={['owner_admin', 'engineering_lead']}>
                  <EngineeringDashboardPage />
                </RoleGuard>
              } />
              <Route path="engineering/dashboard" element={
                <RoleGuard allowedRoles={['owner_admin', 'engineering_lead']}>
                  <EngineeringDashboardPage />
                </RoleGuard>
              } />
              <Route path="engineering/review" element={
                <RoleGuard allowedRoles={['owner_admin', 'engineering_lead']}>
                  <EngineeringDashboardPage />
                </RoleGuard>
              } />
              <Route path="engineering/approved" element={
                <RoleGuard allowedRoles={['owner_admin', 'engineering_lead']}>
                  <EngineeringDashboardPage />
                </RoleGuard>
              } />
              
              {/* Operations & Business Routes (Restricted for sales_exec) */}
              <Route path="inventory" element={
                <RoleGuard allowedRoles={['owner_admin', 'warehouse_mgr']}>
                  <InventoryPage />
                </RoleGuard>
              } />
              <Route path="dispatch" element={
                <RoleGuard allowedRoles={['owner_admin', 'warehouse_mgr']}>
                  <DispatchPage />
                </RoleGuard>
              } />
              <Route path="installations" element={
                <RoleGuard allowedRoles={['owner_admin', 'install_tech']}>
                  <InstallationsPage />
                </RoleGuard>
              } />
              <Route path="workforce" element={
                <RoleGuard allowedRoles={['owner_admin']}>
                  <WorkforcePage />
                </RoleGuard>
              } />
              <Route path="activity-center" element={
                <RoleGuard allowedRoles={['owner_admin']}>
                  <EmployeeActivityCenterPage />
                </RoleGuard>
              } />
              <Route path="departments" element={
                <RoleGuard allowedRoles={['owner_admin']}>
                  <DepartmentsTeamsPage />
                </RoleGuard>
              } />
              <Route path="roles-permissions" element={
                <RoleGuard allowedRoles={['owner_admin']}>
                  <RolesPermissionsPage />
                </RoleGuard>
              } />
              <Route path="approvals" element={
                <RoleGuard allowedRoles={['owner_admin']}>
                  <ApprovalsRequestsPage />
                </RoleGuard>
              } />
              <Route path="ai-agents" element={
                <RoleGuard allowedRoles={['owner_admin']}>
                  <AiAgentManagementPage />
                </RoleGuard>
              } />
              <Route path="warranty" element={
                <RoleGuard allowedRoles={['owner_admin', 'support_exec']}>
                  <WarrantyPage />
                </RoleGuard>
              } />
              <Route path="service" element={
                <RoleGuard allowedRoles={['owner_admin', 'support_exec', 'install_tech']}>
                  <ServiceComplaintsPage />
                </RoleGuard>
              } />
              <Route path="finance" element={
                <RoleGuard allowedRoles={['owner_admin', 'accountant']}>
                  <FinancePage />
                </RoleGuard>
              } />
              <Route path="reports" element={
                <RoleGuard allowedRoles={['owner_admin', 'accountant']}>
                  <ReportsPage />
                </RoleGuard>
              } />
              <Route path="ai" element={
                <RoleGuard allowedRoles={['owner_admin']}>
                  <AiCommandCenterPage />
                </RoleGuard>
              } />
              <Route path="agent-activity" element={
                <RoleGuard allowedRoles={['owner_admin']}>
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
