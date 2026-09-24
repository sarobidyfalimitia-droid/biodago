import React from 'react';
import useInViewOnce from '../../hooks/useInViewOnce';

const COLORS = { fauna: '#9e4f18', flora: '#367d50' };

/**
 * Répartition du nombre d'espèces par catégorie (Lémuriens, Reptiles, Baobabs, ...),
 * colorée selon Faune (marron) / Flore (vert) — barres horizontales, données réelles.
 */
export default function CategoryBarChart({ data }) {
  const [ref, inView] = useInViewOnce();
  const rows = (data ?? []).filter((r) => r.total > 0).slice(0, 10);
  const max = Math.max(1, ...rows.map((r) => Number(r.total)));

  return (
    <div ref={ref} className="rounded-[2rem] border border-earth-100 bg-white p-6 shadow-sm">
      <p className="specimen-tag">Fiche 02</p>
      <h3 className="mt-1 font-display text-xl font-semibold text-ink">Espèces documentées par catégorie</h3>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-earth-400">Pas encore assez de données.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div key={r.category} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 truncate text-earth-700">{r.category}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-earth-100">
                <div
                  className="bar-spring h-3 rounded-full"
                  style={{ width: inView ? `${(Number(r.total) / max) * 100}%` : '0%', background: COLORS[r.type] ?? '#68533a' }}
                />
              </div>
              <span className="w-6 text-right font-mono text-earth-500">{r.total}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-5 text-xs text-earth-600">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5" style={{ background: COLORS.flora }} /> Flore</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5" style={{ background: COLORS.fauna }} /> Faune</span>
      </div>
    </div>
  );
}
