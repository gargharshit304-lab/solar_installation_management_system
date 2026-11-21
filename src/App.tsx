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

function HomeRouter() {
  const { currentUser } = useApp();
  if (currentUser.role === 'sales_exec') {
    return <SalesDashboardPage />;
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
              <Route path="enquiries" element={<CustomerEnquiriesPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="follow-ups" element={<FollowUpsPage />} />
              <Route path="surveys" element={<SiteSurveysPage />} />
              <Route path="quotations" element={<QuotationsPage />} />
              <Route path="orders" element={<OrdersPaymentsPage />} />
              
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
              <Route path="warranty" element={
                <RoleGuard allowedRoles={['owner_admin', 'support_exec']}>
                  <WarrantyPage />
                </RoleGuard>
              } />
              <Route path="service" element={
                <RoleGuard allowedRoles={['owner_admin', 'support_exec']}>
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
