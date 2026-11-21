import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AuthInitializingScreen } from './AuthInitializingScreen';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing } = useApp();
  const location = useLocation();

  // 1. INITIALIZING State: Wait for session restoration before making routing decisions
  if (isInitializing) {
    return <AuthInitializingScreen />;
  }

  // 2. UNAUTHENTICATED State: Redirect to login while preserving the attempted path
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. AUTHENTICATED State: Render authorized route
  return <Outlet />;
};
