import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { faunaApi } from '../../services/faunaApi';
import MemberFaunaManager from '../member/MemberFaunaManager';

/**
 * Bug #9 corrigé : la vue Admin réutilise le formulaire CRUD du Membre (permissions
 * identiques par conception — voir FaunaController, aucune restriction d'auteur pour
 * la Faune/Flore), mais ajoute une vue de contrôle propre à l'Admin : total et répartition
 * par statut de conservation, absente côté Membre.
 */
export default function AdminFauna() {
  const { data } = useQuery({ queryKey: ['fauna', 'admin-overview'], queryFn: () => faunaApi.list({ limit: 200 }) });
  const byStatus = (data?.data ?? []).reduce((acc, f) => {
    acc[f.conservation_status] = (acc[f.conservation_status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8 border border-baobab-200 bg-baobab-50 p-5">
        <p className="specimen-tag text-baobab-700">Vue Admin — contrôle global</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="font-semibold">{data?.data?.length ?? 0} espèces au total</span>
          {Object.entries(byStatus).map(([status, count]) => (
            <span key={status} className="badge border border-baobab-300 bg-white">{status} : {count}</span>
          ))}
        </div>
      </div>
      <MemberFaunaManager />
    </div>
  );
}
