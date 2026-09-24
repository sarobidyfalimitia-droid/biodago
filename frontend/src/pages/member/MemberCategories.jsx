import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../services/categoryApi';
import { useToast } from '../../components/common/ToastContext';

export default function MemberCategories() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data, isLoading } = useQuery({ queryKey: ['categories', 'all'], queryFn: () => categoryApi.list() });
  const [form, setForm] = useState({ name: '', type: 'fauna', description: '' });

  // Item : au lieu d'une simple alerte quand la catégorie est utilisée, un vrai
  // sélecteur de réaffectation s'ouvre pour choisir où déplacer les espèces concernées.
  const [reassignFor, setReassignFor] = useState(null); // { id, type, speciesCount }
  const [reassignTo, setReassignTo] = useState('');

  const createMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      return categoryApi.create(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie créée');
      setForm({ name: '', type: 'fauna', description: '' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ id, opts }) => categoryApi.remove(id, opts),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie supprimée');
      setReassignFor(null);
    },
    onError: (err, variables) => {
      if (err.error?.code === 'CONFLICT_409') {
        const category = data?.data?.find((c) => c.id === variables.id);
        setReassignFor({ id: variables.id, type: category?.type, speciesCount: err.error.details?.species_count });
      } else {
        toast.error(err.error?.message ?? 'Erreur lors de la suppression');
      }
    },
  });

  const confirmReassign = () => {
    if (!reassignTo) { toast.error('Choisissez une catégorie de destination'); return; }
    removeMutation.mutate({ id: reassignFor.id, opts: { force: 1, reassign_to: reassignTo } });
  };

  const otherCategoriesOfSameType = data?.data?.filter((c) => c.type === reassignFor?.type && c.id !== reassignFor?.id) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">🏷️ Catégories</h1>

      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="mt-6 grid gap-3 rounded-[2rem] border border-earth-100 bg-white p-6 sm:grid-cols-3">
        <input required placeholder="Nom" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="fauna">Faune</option>
          <option value="flora">Flore</option>
        </select>
        <button type="submit" className="btn-primary">Ajouter</button>
        <textarea placeholder="Description" className="input sm:col-span-3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </form>

      {/* Panneau de réaffectation — remplace l'ancienne alert() basique */}
      {reassignFor && (
        <div className="mt-6 rounded-[2rem] border border-baobab-200 bg-baobab-50 p-6">
          <p className="font-semibold text-baobab-800">
            Cette catégorie est utilisée par {reassignFor.speciesCount} espèce(s). Choisissez où les déplacer avant suppression :
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <select className="input max-w-xs" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
              <option value="">— Choisir une catégorie de destination —</option>
              {otherCategoriesOfSameType.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={confirmReassign} className="btn-primary !px-5 !py-2.5 !text-xs">Réaffecter et supprimer</button>
            <button onClick={() => setReassignFor(null)} className="btn-secondary !px-5 !py-2.5 !text-xs">Annuler</button>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        {isLoading && [1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-[1.75rem] bg-earth-100" />)}
        {data?.data?.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-[1.75rem] border border-earth-100 bg-white p-4">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs uppercase text-earth-400">{c.type}</p>
            </div>
            <button onClick={() => removeMutation.mutate({ id: c.id, opts: {} })} className="text-sm font-semibold text-red-600 hover:underline">Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
}
