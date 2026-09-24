import React from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { assetUrl } from '../../utils/assetUrl';

const STATUS_META = {
  LC: { label: 'Préoccupation mineure', color: 'bg-forest-100 text-forest-700 border-forest-300' },
  NT: { label: 'Quasi menacée', color: 'bg-lime-100 text-lime-800 border-lime-300' },
  VU: { label: 'Vulnérable', color: 'bg-baobab-100 text-baobab-800 border-baobab-300' },
  EN: { label: 'En danger', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  CR: { label: 'Danger critique', color: 'bg-red-100 text-red-800 border-red-300' },
  EW: { label: 'Éteinte à l\'état sauvage', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  EX: { label: 'Éteinte', color: 'bg-neutral-200 text-neutral-700 border-neutral-300' },
  DD: { label: 'Données insuffisantes', color: 'bg-earth-100 text-earth-600 border-earth-300' },
};

export default function SpeciesCard({ species, type }) {
  const { t } = useTranslation();
  // Bug #1 corrigé : construction de l'URL via le helper assetUrl centralisé,
  // au lieu du remplacement de chaîne redondant et invalide précédent.
  const image = assetUrl(species.primary_image);
  const status = STATUS_META[species.conservation_status] ?? STATUS_META.DD;

  return (
    <Link
      to={type === 'fauna' ? '/fauna/$id' : '/flora/$id'}
      params={{ id: String(species.id) }}
      className="card group block transition-transform duration-300 hover:-rotate-1 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-3xl bg-forest-100">
        {image ? (
          <img src={image} alt={species.name} className="h-full w-full object-cover grayscale-[15%] transition group-hover:grayscale-0" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-specimen-grid bg-grid text-4xl">
            {type === 'fauna' ? '🐾' : '🌿'}
          </div>
        )}
        {/* Coin corné, façon vraie fiche cartonnée qu'on aurait feuilletée */}
        <span
          className="absolute right-0 top-0 h-7 w-7 bg-parchment-50/90 shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
          style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
          aria-hidden="true"
        />
        <span className="specimen-tag absolute left-3 top-3 rounded-full border border-white/40 bg-forest-950/80 px-3 py-1 text-parchment-100">
          N° {String(species.id).padStart(3, '0')}
        </span>
      </div>

      <div className="space-y-2.5 p-4">
        <div>
          <h3 className="font-display text-base font-semibold leading-snug text-ink">{species.name}</h3>
          <p className="font-display text-sm italic text-earth-500">{species.scientific_name}</p>
        </div>

        <div className="field-divider" />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-earth-500">
          {species.category_name && <span>{species.category_name}</span>}
          {species.family && <span>· {species.family}</span>}
          {species.region && <span>· 📍 {species.region}</span>}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className={`badge border ${status.color}`}>{status.label}</span>
          <span className="text-xs font-semibold text-forest-700 group-hover:underline">{t('species.details')} →</span>
        </div>
      </div>
    </Link>
  );
}
