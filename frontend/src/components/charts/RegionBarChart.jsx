import React from 'react';
import useInViewOnce from '../../hooks/useInViewOnce';

/**
 * Répartition du nombre d'espèces (Faune + Flore confondues) par région de Madagascar
 * où elles ont été localisées — barres horizontales, données réelles, top 8 régions.
 */
export default function RegionBarChart({ data }) {
  const [ref, inView] = useInViewOnce();
  const rows = (data ?? []).filter((r) => r.total > 0).slice(0, 8);
  const max = Math.max(1, ...rows.map((r) => Number(r.total)));

  return (
    <div ref={ref} className="rounded-[2rem] border border-earth-100 bg-white p-6 shadow-sm">
      <p className="specimen-tag">Fiche 03</p>
      <h3 className="mt-1 font-display text-xl font-semibold text-ink">Régions les plus documentées</h3>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-earth-400">Pas encore assez de régions renseignées sur les fiches.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div key={r.region} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0 truncate text-earth-700">{r.region}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-earth-100">
                <div
                  className="bar-spring h-3 rounded-full bg-baobab-500"
                  style={{ width: inView ? `${(Number(r.total) / max) * 100}%` : '0%' }}
                />
              </div>
              <span className="w-6 text-right font-mono text-earth-500">{r.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
