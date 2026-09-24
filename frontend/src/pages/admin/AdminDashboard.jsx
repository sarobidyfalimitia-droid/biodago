import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../../services/statsApi';

export default function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['stats', 'admin'], queryFn: statsApi.admin });
  const s = data?.data;

  const cards = [
    ['Total Faune', s?.total_fauna], ['Total Flore', s?.total_flora],
    ['Catégories', s?.total_categories], ['Membres', s?.total_members],
    ['En attente', s?.pending_members], ['Membres actifs', s?.active_members],
    ['Articles', s?.total_articles],
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Dashboard Admin</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-[1.75rem] border border-earth-100 bg-white p-5 text-center">
            <p className="font-display text-2xl font-semibold text-baobab-600">{value ?? '—'}</p>
            <p className="mt-1 text-xs text-earth-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-[1.75rem] border border-earth-100 bg-white p-5">
          <h2 className="mb-3 font-semibold text-ink">Derniers membres inscrits</h2>
          <ul className="space-y-2 text-sm">
            {s?.recent_members?.map((m) => (
              <li key={m.id} className="flex justify-between">
                <span>{m.name}</span>
                <span className="badge bg-earth-100 text-earth-600">{m.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
