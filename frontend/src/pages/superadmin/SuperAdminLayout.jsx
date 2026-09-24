import React from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import Header from '../../components/layout/Header';

// Le SuperAdmin possède tous les droits Membre + Admin, plus la gestion des comptes.
const NAV = [
  { to: '/superadmin', label: 'Tableau de bord' },
  { to: '/superadmin/accounts', label: '👑 Comptes (tous rôles)' },
  { to: '/superadmin/members', label: 'Membres' },
  { to: '/superadmin/fauna', label: 'Faune' },
  { to: '/superadmin/flora', label: 'Flore' },
  { to: '/superadmin/categories', label: 'Catégories' },
  { to: '/superadmin/blog', label: 'Blog' },
  { to: '/superadmin/contact', label: 'Messages' },
  { to: '/account', label: 'Mon compte' },
];

export default function SuperAdminLayout() {
  return (
    <ProtectedRoute role="superadmin">
      <div className="paper-texture min-h-screen bg-parchment-50">
        <Header />
        <div className="mx-auto flex max-w-7xl gap-8 px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <aside className="w-60 shrink-0">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-baobab-600">👑 Super Admin</p>
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
