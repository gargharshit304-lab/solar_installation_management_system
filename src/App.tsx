import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
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

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="overview" element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="surveys" element={<SiteSurveysPage />} />
            <Route path="quotations" element={<QuotationsPage />} />
            <Route path="orders" element={<OrdersPaymentsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="dispatch" element={<DispatchPage />} />
            <Route path="installations" element={<InstallationsPage />} />
            <Route path="workforce" element={<WorkforcePage />} />
            <Route path="warranty" element={<WarrantyPage />} />
            <Route path="service" element={<ServiceComplaintsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="ai" element={<AiCommandCenterPage />} />
            <Route path="agent-activity" element={<AgentActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
