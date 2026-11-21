import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { ToastContainer } from '../common/ToastContainer';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isUnscrollablePage = location.pathname === '/orders';

  return (
    <div className="h-screen overflow-hidden bg-sand flex flex-col selection:bg-navy selection:text-white">
      {/* Top Charcoal Navbar (Sticky) */}
      <Navbar />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex flex-row w-full max-w-[1920px] mx-auto min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content Body */}
        <main className={`flex-1 min-h-0 min-w-0 p-5 sm:p-6 lg:p-7 ${isUnscrollablePage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className={`max-w-[1440px] mx-auto ${isUnscrollablePage ? 'h-full overflow-hidden' : 'space-y-8'}`}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <GlobalSearchModal />
      <ToastContainer />
    </div>
  );
};
