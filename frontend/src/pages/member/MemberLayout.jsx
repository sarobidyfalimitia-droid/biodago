import React from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import Header from '../../components/layout/Header';

const NAV = [
  { to: '/member', label: 'Tableau de bord' },
  { to: '/member/fauna', label: 'Faune' },
  { to: '/member/flora', label: 'Flore' },
  { to: '/member/categories', label: 'Catégories' },
  { to: '/account', label: 'Mon compte' },
];

export default function MemberLayout() {
  return (
    <ProtectedRoute role="member">
      <div className="paper-texture min-h-screen bg-forest-50">
        <Header />
        <div className="mx-auto flex max-w-7xl gap-8 px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <aside className="w-56 shrink-0">
            <nav className="card space-y-1 p-3">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="block rounded-lg px-3 py-2 text-sm font-medium text-earth-700 hover:bg-forest-50">
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
