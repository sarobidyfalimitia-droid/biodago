import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AuthProvider } from '../../features/auth/AuthContext';
import { ToastProvider } from '../../components/common/ToastContext';

export const rootRoute = createRootRoute({
  component: () => (
    <ToastProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ToastProvider>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <p className="text-6xl">🌴</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Page introuvable</h1>
    </div>
  ),
});
