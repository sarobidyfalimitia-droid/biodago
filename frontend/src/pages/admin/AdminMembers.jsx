import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi } from '../../services/memberApi';
import { authApi } from '../../services/authApi';

const STATUS_TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Actifs' },
  { key: 'rejected', label: 'Refusés' },
  { key: 'suspended', label: 'Suspendus' },
];

export default function AdminMembers() {
  const [status, setStatus] = useState('all');
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['members', status], queryFn: () => memberApi.list({ status }) });
  const [resetCode, setResetCode] = useState(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['members'] });
  const approve = useMutation({ mutationFn: memberApi.approve, onSuccess: invalidate });
  const reject = useMutation({ mutationFn: memberApi.reject, onSuccess: invalidate });
  const suspend = useMutation({ mutationFn: memberApi.suspend, onSuccess: invalidate });
  const reactivate = useMutation({ mutationFn: memberApi.reactivate, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: memberApi.remove, onSuccess: invalidate });

  const generateCode = async (userId) => {
    const res = await authApi.generateResetCode(userId);
    setResetCode({ userId, ...res.data });
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">👥 Membres</h1>

      <div className="mt-4 flex gap-2">
        {STATUS_TABS.map((s) => (
          <button key={s.key} onClick={() => setStatus(s.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${status === s.key ? 'bg-baobab-600 text-white' : 'bg-white text-earth-600 ring-1 ring-earth-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {resetCode && (
        <div className="mt-4 rounded-xl bg-baobab-50 p-4 text-sm ring-1 ring-baobab-200">
          Code temporaire généré : <span className="font-mono font-semibold">{resetCode.code}</span> (expire à {resetCode.expires_at}) —
          communiquez-le manuellement au membre.
        </div>
      )}

      <div className="mt-6 space-y-2">
        {data?.data?.map((m) => (
          <div key={m.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{m.name}</p>
              <p className="text-xs text-earth-500">{m.email} · {m.phone ?? '-'}</p>
            </div>
            <span className="badge bg-earth-100 text-earth-600">{m.status}</span>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {m.status === 'pending' && <button onClick={() => approve.mutate(m.id)} className="text-forest-700 hover:underline">Accepter</button>}
              {m.status === 'pending' && <button onClick={() => reject.mutate(m.id)} className="text-red-600 hover:underline">Refuser</button>}
              {m.status === 'active' && <button onClick={() => suspend.mutate(m.id)} className="text-amber-600 hover:underline">Suspendre</button>}
              {m.status === 'suspended' && <button onClick={() => reactivate.mutate(m.id)} className="text-forest-700 hover:underline">Réactiver</button>}
              <button onClick={() => generateCode(m.id)} className="text-baobab-700 hover:underline">Code récup.</button>
              <button onClick={() => remove.mutate(m.id)} className="text-red-600 hover:underline">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
