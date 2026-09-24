import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { statsApi } from '../../services/statsApi';
import { useAuth } from '../../features/auth/AuthContext';

/**
 * Items #9/#14 corrigés : le Tableau de bord Membre affichait un simple texte statique
 * sans aucune donnée. Il calcule désormais les VRAIES contributions personnelles de
 * l'utilisateur connecté (ses espèces, ses observations, ses articles), via
 * /stats/member. Grâce à TanStack Query, dès qu'une observation/espèce est ajoutée ou
 * supprimée ailleurs dans l'appli et que la query 'stats' est invalidée, ce tableau de
 * bord se met à jour tout seul — pas besoin de recharger la page.
 */
export default function MemberDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['stats', 'member'], queryFn: statsApi.member });
  const s = data?.data;

  const cards = [
    { label: 'Mes espèces — Faune', value: s?.my_fauna, icon: '🐾', to: '/member/fauna' },
    { label: 'Mes espèces — Flore', value: s?.my_flora, icon: '🌿', to: '/member/flora' },
    { label: 'Mes articles publiés', value: s?.my_published_posts, icon: '📰', to: '/member/blog' },
  ];

  return (
    <div>
      <span className="badge bg-forest-100 text-forest-700">Espace personnel</span>
      <h1 className="mt-3 font-display text-2xl font-medium text-ink">Bonjour {user?.name?.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-sm text-earth-500">Voici un aperçu de vos contributions à la biodiversité malgache.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-[2rem] border border-earth-100 bg-white p-6 transition hover:shadow-md">
            <p className="text-2xl">{c.icon}</p>
            <p className="mt-3 font-display text-3xl font-semibold text-forest-800">
              {isLoading ? '…' : c.value ?? 0}
            </p>
            <p className="mt-1 text-xs text-earth-500">{c.label}</p>
          </Link>
        ))}
      </div>

      {!isLoading && s?.my_fauna === 0 && s?.my_flora === 0 && (
        <div className="mt-8 rounded-[2rem] border border-dashed border-earth-300 bg-white p-8 text-center">
          <p className="text-3xl">🌱</p>
          <p className="mt-3 font-display text-lg font-medium text-ink">Vous n'avez encore rien ajouté</p>
          <p className="mt-1 text-sm text-earth-500">Commencez par documenter une espèce.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link to="/member/fauna" className="btn-primary !px-5 !py-2.5 !text-xs">Ajouter une espèce</Link>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-[2rem] bg-forest-50 p-6">
        <p className="text-sm font-semibold text-forest-800">Raccourcis</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link to="/member/fauna" className="btn-secondary !px-5 !py-2.5 !text-xs">🐾 Gérer la Faune</Link>
          <Link to="/member/flora" className="btn-secondary !px-5 !py-2.5 !text-xs">🌿 Gérer la Flore</Link>
          <Link to="/member/categories" className="btn-secondary !px-5 !py-2.5 !text-xs">🏷️ Catégories</Link>
          <Link to="/member/blog" className="btn-secondary !px-5 !py-2.5 !text-xs">📰 Mes articles</Link>
        </div>
      </div>
    </div>
  );
}
