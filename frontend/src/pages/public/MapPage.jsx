import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { faunaApi } from '../../services/faunaApi';
import { floraApi } from '../../services/floraApi';
import MadagascarMap from '../../components/maps/MadagascarMap';
import FadeInOnScroll from '../../components/home/FadeInOnScroll';

const LAYERS = [
  { key: 'all', label: 'Tout' },
  { key: 'fauna', label: '🐾 Faune' },
  { key: 'flora', label: '🌿 Flore' },
];

/**
 * Carte générale de Madagascar.
 * Faune ET Flore s'affichent désormais toutes les deux sous forme de marqueurs
 * ponctuels (plus de rectangles de régions) — filtre Faune/Flore/Tout, zoom libre.
 */
export default function MapPage() {
  const { t } = useTranslation();
  const [layer, setLayer] = useState('all');
  const fauna = useQuery({ queryKey: ['fauna', 'map-locations'], queryFn: faunaApi.mapLocations });
  const flora = useQuery({ queryKey: ['flora', 'map-locations'], queryFn: floraApi.mapLocations });

  const faunaMarkers = (fauna.data?.data ?? []).map((m) => ({
    id: m.location_id, name: m.name, latitude: m.latitude, longitude: m.longitude, family: m.family,
  }));
  const floraMarkers = (flora.data?.data ?? []).map((m) => ({
    id: m.location_id, name: m.name, latitude: m.latitude, longitude: m.longitude, family: m.family,
  }));

  const hasAnyMarker = faunaMarkers.length > 0 || floraMarkers.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-2 sm:px-6 lg:px-8">
      <FadeInOnScroll delayMs={40}>
        <span className="badge bg-forest-100 text-forest-700">Cartographie générale</span>
        <h1 className="mt-3 font-display text-3xl font-medium text-ink">{t('nav.map')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-earth-600">
          Localisations de la faune et de la flore documentées par la communauté.
          Passez la souris sur un marqueur pour voir le nom de l'espèce.
        </p>

        <div className="mt-5 flex gap-2">
          {LAYERS.map((l) => (
            <button key={l.key} onClick={() => setLayer(l.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${layer === l.key ? 'bg-forest-800 text-parchment-50' : 'bg-white text-earth-600 ring-1 ring-earth-200'}`}>
              {l.label}
            </button>
          ))}
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll delayMs={120} className="mt-4 rounded-[2rem] border border-earth-100 bg-white p-3">
        <MadagascarMap faunaMarkers={faunaMarkers} floraMarkers={floraMarkers} height={560} zoom={6} layer={layer} />
      </FadeInOnScroll>

      {!hasAnyMarker && (
        <p className="mt-4 text-sm text-earth-400">Aucune espèce géolocalisée pour l'instant.</p>
      )}
    </div>
  );
}