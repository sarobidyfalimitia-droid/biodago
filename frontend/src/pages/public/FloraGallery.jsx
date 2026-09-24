import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { floraApi } from '../../services/floraApi';
import { regionApi } from '../../services/regionApi';
import { categoryApi } from '../../services/categoryApi';
import SpeciesCard from '../../components/species/SpeciesCard';
import CompactPagination from '../../components/common/CompactPagination';
import DecorativeDoodles from '../../components/home/DecorativeDoodles';
import FadeInOnScroll from '../../components/home/FadeInOnScroll';
import { CONSERVATION_STATUSES } from '../../utils/conservationStatus';

export default function FloraGallery() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({ q: '', category_id: '', region_id: '', conservation_status: '', page: 1 });

  const categories = useQuery({ queryKey: ['categories', 'flora'], queryFn: () => categoryApi.list({ type: 'flora' }) });
  const regions = useQuery({ queryKey: ['regions'], queryFn: regionApi.list });
  const flora = useQuery({
    queryKey: ['flora', filters],
    queryFn: () => floraApi.list({ ...filters, limit: 12 }),
    placeholderData: (prev) => prev,
  });

  const update = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));

  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-4 pb-4 sm:px-6 lg:px-8">

      <DecorativeDoodles
        items={[
          { shape: 'leaf', className: 'right-6 top-0 text-baobab-600', size: 60, opacity: 0.09, rotate: -15 },
          { shape: 'leaf', className: 'left-1/3 top-4 text-forest-700 hidden sm:block', size: 34, opacity: 0.08, rotate: 20 },
        ]}
      />
      <FadeInOnScroll delayMs={40}>
        <h1 className="relative font-display text-3xl font-medium text-ink">🌿 {t('nav.flora')}</h1>

        <div className="mt-6 grid gap-3 rounded-[2rem] border border-earth-100 bg-white p-5 sm:grid-cols-5">
          <input className="input sm:col-span-2" placeholder={t('species.search')}
            value={filters.q} onChange={(e) => update({ q: e.target.value })} />
          <select className="input" value={filters.category_id} onChange={(e) => update({ category_id: e.target.value })}>
            <option value="">{t('species.category')}</option>
            {categories.data?.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input" value={filters.region_id} onChange={(e) => update({ region_id: e.target.value })}>
            <option value="">{t('species.region')}</option>
            {regions.data?.data?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select className="input" value={filters.conservation_status} onChange={(e) => update({ conservation_status: e.target.value })}>
            <option value="">{t('species.status')}</option>
            {CONSERVATION_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
          </select>
        </div>
      </FadeInOnScroll>

      {flora.isLoading && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-earth-100" />)}
        </div>
      )}
      {!flora.isLoading && flora.data?.data?.length === 0 && <p className="mt-10 text-center text-earth-500">{t('species.no_results')}</p>}

      {/* Les fiches n'existent qu'après le chargement : la grille est montée à ce moment-là,
          donc le fondu se joue à l'arrivée des résultats. */}
      {!flora.isLoading && (
        <FadeInOnScroll delayMs={100} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {flora.data?.data?.map((f) => <SpeciesCard key={f.id} species={f} type="flora" />)}
        </FadeInOnScroll>
      )}

      {flora.data?.pagination && (
        <div className="mt-10">
          <CompactPagination page={filters.page} totalPages={flora.data.pagination.totalPages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
        </div>
      )}
    </div>
  );
}
