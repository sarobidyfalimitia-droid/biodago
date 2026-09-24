import React from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import Header from '../../components/layout/Header';

const NAV = [
  { to: '/admin', label: 'Tableau de bord' },
  { to: '/admin/members', label: 'Membres' },
  { to: '/admin/fauna', label: 'Faune' },
  { to: '/admin/flora', label: 'Flore' },
  { to: '/admin/categories', label: 'Catégories' },
  { to: '/admin/blog', label: 'Blog' },
  { to: '/admin/contact', label: 'Messages' },
  { to: '/account', label: 'Mon compte' },
];

export default function AdminLayout() {
  return (
    <ProtectedRoute role="admin">
      <div className="paper-texture min-h-screen bg-parchment-50">
        <Header />
        <div className="mx-auto flex max-w-7xl gap-8 px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <aside className="w-56 shrink-0">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-baobab-600">Admin</p>
            <nav className="space-y-1 rounded-[1.75rem] border border-earth-100 bg-white p-3">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-earth-700 hover:bg-baobab-50">
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1"><Outlet /></main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
