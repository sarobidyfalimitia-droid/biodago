import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { regionApi } from '../../services/regionApi';

/**
 * Sélection manuelle d'une ou plusieurs régions parmi les 23 de Madagascar.
 * Toujours à la main (jamais déduit d'un clic sur la carte), indépendant du GPS.
 * Un bouton "+" ajoute une nouvelle liste déroulante ; chaque ligne a un "×" pour la retirer.
 */
export default function RegionSelectList({ regionIds, onChange }) {
  const regions = useQuery({ queryKey: ['regions'], queryFn: regionApi.list });
  const options = regions.data?.data ?? [];

  const updateAt = (index, value) => {
    const next = [...regionIds];
    next[index] = value;
    onChange(next);
  };
  const addRow = () => onChange([...regionIds, '']);
  const removeRow = (index) => onChange(regionIds.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {regionIds.map((val, i) => (
        <div key={i} className="flex items-center gap-2">
          <select className="input" value={val} onChange={(e) => updateAt(i, e.target.value)}>
            <option value="">— Choisir une région —</option>
            {options.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button type="button" onClick={() => removeRow(i)} className="shrink-0 text-red-500 hover:text-red-700" aria-label="Retirer">
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={addRow} className="text-sm font-semibold text-forest-700 hover:underline">
        + Ajouter une région
      </button>
    </div>
  );
}
