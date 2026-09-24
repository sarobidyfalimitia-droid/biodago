import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { statsApi } from '../../services/statsApi';
import { faunaApi } from '../../services/faunaApi';
import { floraApi } from '../../services/floraApi';
import CategoryBarChart from '../../components/charts/CategoryBarChart';
import RegionBarChart from '../../components/charts/RegionBarChart';
import FaunaFloraSplitChart from '../../components/charts/FaunaFloraSplitChart';
import OdometerNumber from '../../components/home/OdometerNumber';
import useInViewOnce from '../../hooks/useInViewOnce';
import FadeInOnScroll from '../../components/home/FadeInOnScroll';

function StatusDistributionBars({ rows }) {
  const [ref, inView] = useInViewOnce();
  return (
    <div ref={ref} className="mt-6 rounded-[2rem] border border-earth-100 bg-white p-6 shadow-sm">
      <p className="specimen-tag">Fiche 04</p>
      <h2 className="mt-1 font-display text-xl font-semibold text-ink">Répartition par statut de conservation</h2>
      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={row.conservation_status} className="flex items-center gap-3 text-sm">
            <span className="w-10 font-mono text-earth-500">{row.conservation_status}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-earth-100">
              <div className="bar-spring h-2 rounded-full bg-forest-700" style={{ width: inView ? `${Math.min(100, row.total * 6)}%` : '0%' }} />
            </div>
            <span className="w-6 text-right text-earth-500">{row.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Tableau de bord VISITEUR — vue d'ensemble publique, aucune donnée personnelle. */
export default function Dashboard() {
  const { t } = useTranslation();
  const { data, isLoading: statsLoading } = useQuery({ queryKey: ['stats', 'public'], queryFn: statsApi.public });
  const s = data?.data;

  const recentFauna = useQuery({ queryKey: ['fauna', 'recent-dash'], queryFn: () => faunaApi.list({ limit: 4, sort: 'created_at' }) });
  const recentFlora = useQuery({ queryKey: ['flora', 'recent-dash'], queryFn: () => floraApi.list({ limit: 4, sort: 'created_at' }) });

  return (
    /* Le motif de feuilles doit couvrir toute la page : on annule le padding-top de
       <main> (-mt-24, posé pour compenser le header fixe) et on le repose en padding
       interne — sinon le fond démarrerait 96px trop bas, en bandeau de largeur limitée. */
    <div className="relative isolate -mt-24">
      <div aria-hidden className="leaf-motif pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-7xl px-4 pb-4 pt-32 sm:px-6 lg:px-8">
        {/* En-tête posé directement sur le feuillage — apparition en douceur (comme Contact) */}
        <FadeInOnScroll delayMs={40}>
          <div className="max-w-2xl">
            <span className="badge bg-white/85 text-forest-700 ring-1 ring-forest-200 backdrop-blur-sm">Observatoire public</span>
            <h1 className="mt-4 font-display text-4xl font-medium text-forest-900 sm:text-5xl">{t('nav.dashboard')}</h1>
            <p className="mt-4 leading-relaxed text-earth-700">{t('hero.subtitle')}</p>
          </div>
        </FadeInOnScroll>

        {/* Chiffres clés — carte blanche arrondie posée sur le motif de feuilles :
            halos flous, squelettes de chargement, 4 chiffres clés. */}
        <FadeInOnScroll delayMs={100} className="mt-10">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-earth-100 sm:p-10">
            {/* Effets de fond */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-forest-50/50 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-baobab-50/50 blur-3xl" />

            {/* Affichage pendant le chargement */}
            {statsLoading ? (
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-earth-50" />
                ))}
              </div>
            ) : (
              <div className="relative grid grid-cols-2 gap-y-8 divide-earth-100 sm:grid-cols-4 sm:divide-x">
                {[
                  { key: 'fauna', value: s?.total_fauna ?? 0, icon: '🐾' },
                  { key: 'flora', value: s?.total_flora ?? 0, icon: '🌿' },
                  { key: 'categories', value: s?.total_categories ?? 0, icon: '📁' },
                  { key: 'articles', value: s?.total_articles ?? 0, icon: '📰' },
                ].map((c) => (
                  <div key={c.key} className="flex flex-col items-center text-center px-4 transition-transform hover:scale-105">
                    <span className="mb-2 text-xl opacity-80" aria-hidden="true">{c.icon}</span>
                    <p className="font-display text-4xl font-bold tracking-tight text-forest-900">
                      <OdometerNumber value={c.value} />
                    </p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-earth-400">
                      {/* Clé de traduction dynamique : stats.fauna / flora / categories / articles */}
                      {t(`stats.${c.key}`)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll delayMs={160} className="mt-8 grid gap-6 lg:grid-cols-3">
          <FaunaFloraSplitChart totalFauna={s?.total_fauna ?? 0} totalFlora={s?.total_flora ?? 0} />
          <CategoryBarChart data={s?.by_category} />
          <RegionBarChart data={s?.by_region} />
        </FadeInOnScroll>

        {s?.by_conservation_status?.length > 0 && (
          <StatusDistributionBars rows={s.by_conservation_status} />
        )}

        {/* Dernières fiches publiées — Faune et Flore */}
        <FadeInOnScroll delayMs={220} className="mt-8 grid gap-6 lg:grid-cols-2">
          {[
            { key: 'fauna', icon: '🐾', label: 'Dernières espèces — Faune', to: '/fauna', query: recentFauna },
            { key: 'flora', icon: '🌿', label: 'Dernières espèces — Flore', to: '/flora', query: recentFlora },
          ].map(({ key, icon, label, to, query }) => (
            <div key={key} className="rounded-[2rem] border border-earth-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink">{icon} {label}</h2>
                <Link to={to} className="text-xs font-semibold text-forest-700 hover:underline">Tout voir</Link>
              </div>
              <ul className="mt-4 divide-y divide-earth-100">
                {query.data?.data?.map((f) => (
                  <li key={f.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{f.name}</span>
                    <span className="font-display italic text-earth-400">{f.scientific_name}</span>
                  </li>
                ))}
                {!query.data?.data?.length && <p className="py-4 text-sm text-earth-400">Aucune donnée pour l'instant.</p>}
              </ul>
            </div>
          ))}
        </FadeInOnScroll>
      </div>
    </div>
  );
}
