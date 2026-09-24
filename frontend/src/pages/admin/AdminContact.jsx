import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '../../services/contactApi';

export default function AdminContact() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['contact'], queryFn: contactApi.list });
  const remove = useMutation({
    mutationFn: (id) => contactApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contact'] }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">✉️ Messages de contact</h1>
      <div className="mt-6 space-y-2">
        {data?.data?.map((m) => (
          <div key={m.id} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{m.subject || '(sans sujet)'}</p>
              {!m.is_read && <span className="badge bg-baobab-100 text-baobab-700">Nouveau</span>}
            </div>
            <p className="mt-1 text-xs text-earth-500">{m.name} · {m.email}</p>
            <p className="mt-2 text-sm text-earth-700">{m.message}</p>
            <button onClick={() => remove.mutate(m.id)} className="mt-3 text-sm font-semibold text-red-600 hover:underline">Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
}
