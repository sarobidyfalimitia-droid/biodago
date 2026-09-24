import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { statsApi } from '../../services/statsApi';
import { superAdminApi } from '../../services/superAdminApi';

/** Tableau de bord SuperAdmin — vue globale : stats Admin + répartition des comptes par rôle. */
export default function SuperAdminDashboard() {
  const { data } = useQuery({ queryKey: ['stats', 'admin'], queryFn: statsApi.admin });
  const accounts = useQuery({ queryKey: ['accounts', 'all'], queryFn: () => superAdminApi.listAccounts({ role: 'all' }) });
  const s = data?.data;

  const byRole = (accounts.data?.data ?? []).reduce((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const cards = [
    ['Total Faune', s?.total_fauna], ['Total Flore', s?.total_flora],
    ['Catégories', s?.total_categories], ['Articles', s?.total_articles],
    ['Membres', byRole.member ?? 0], ['Admins', byRole.admin ?? 0],
    ['SuperAdmins', byRole.superadmin ?? 0], ['En attente', s?.pending_members],
  ];

  return (
    <div>
      <span className="badge bg-baobab-100 text-baobab-700">👑 Vue globale</span>
      <h1 className="mt-3 font-display text-2xl font-medium text-ink">Tableau de bord SuperAdmin</h1>
      <p className="mt-1 text-sm text-earth-500">Contrôle total : espèces, membres, administrateurs et comptes SuperAdmin.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-[1.75rem] border border-earth-100 bg-white p-5 text-center">
            <p className="font-display text-2xl font-semibold text-baobab-600">{value ?? '—'}</p>
            <p className="mt-1 text-xs text-earth-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[2rem] bg-forest-900 p-8 text-parchment-50">
        <p className="specimen-tag text-forest-400">Accès rapide</p>
        <h2 className="mt-1 font-display text-xl font-medium">Gestion des comptes</h2>
        <p className="mt-2 max-w-lg text-sm text-forest-300">
          Promouvoir un membre en administrateur, créer un nouveau compte SuperAdmin, ou gérer les accès.
        </p>
        <Link to="/superadmin/accounts" className="btn-primary mt-5 !bg-baobab-500 hover:!bg-baobab-600">Gérer les comptes →</Link>
      </div>
    </div>
  );
}
