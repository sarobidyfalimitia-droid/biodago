import React from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { faunaApi } from '../../services/faunaApi';
import { conservationStatusLabel } from '../../utils/conservationStatus';
import MadagascarMap from '../../components/maps/MadagascarMap';
import SpeciesDetailSections from '../../components/species/SpeciesDetailSections';
import AccessionStamp from '../../components/species/AccessionStamp';
import SpeciesPhotoCarousel from '../../components/species/SpeciesPhotoCarousel';
import { FAUNA_SECTIONS } from '../../config/faunaFields';

export default function FaunaDetail() {
  const { id } = useParams({ strict: false });
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['fauna', id], queryFn: () => faunaApi.get(id) });
  const species = data?.data;

  if (isLoading) return <p className="p-10 text-center text-earth-500">…</p>;
  if (!species) return <p className="p-10 text-center text-earth-500">{t('species.no_results')}</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <Link
        to="/fauna"
        className="group inline-flex items-center gap-2 rounded-full border border-earth-200 bg-white/80 px-5 py-2 text-sm font-bold uppercase tracking-wider text-forest-800 shadow-sm backdrop-blur-sm transition-all hover:border-forest-400 hover:bg-forest-50 hover:text-forest-900 hover:shadow-md"
      >
        <span
          className="text-lg transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        >
          ←
        </span>
        {t('species.back')}
      </Link>

      <div className="mt-5 grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <SpeciesPhotoCarousel images={species.images} alt={species.name} fallbackIcon="🐾">
            <AccessionStamp id={species.id} className="absolute left-3 top-3" />
          </SpeciesPhotoCarousel>
        </div>

        <div>
          <p className="specimen-tag">Fiche Faune</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{species.name}</h1>
          <p className="font-display text-lg italic text-earth-500">{species.scientific_name}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-dashed border-earth-300 py-5 text-sm">
            <div><dt className="specimen-tag">{t('species.category')}</dt><dd className="mt-1 font-medium">{species.category_name ?? '-'}</dd></div>
            <div><dt className="specimen-tag">{t('species.family')}</dt><dd className="mt-1 font-medium">{species.family ?? '-'}</dd></div>
            <div><dt className="specimen-tag">{t('species.region')}</dt><dd className="mt-1 font-medium">{species.regions?.length ? species.regions.map((r) => r.name).join(', ') : '-'}</dd></div>
            <div><dt className="specimen-tag">{t('species.status')}</dt><dd className="mt-1 font-medium">{conservationStatusLabel(species.conservation_status)}</dd></div>
          </dl>

          <p className="mt-6 text-sm leading-relaxed text-earth-700">{species.description}</p>

          <div className="mt-6 space-y-3 text-sm">
            {species.diet && <p><span className="font-semibold">Alimentation : </span>{species.diet}</p>}
            {species.reproduction && <p><span className="font-semibold">Reproduction : </span>{species.reproduction}</p>}
            {species.behavior && <p><span className="font-semibold">Comportement : </span>{species.behavior}</p>}
          </div>

          <a href={faunaApi.downloadUrl(species.id)} className="btn-primary mt-8">
            📄 {t('species.download')}
          </a>
        </div>
      </div>

      {/* Fiche complète (12 sections) — pleine largeur, sous le bloc photo/résumé,
          pour ne pas laisser un grand vide sous une colonne photo plus courte. */}
      <SpeciesDetailSections sections={FAUNA_SECTIONS} species={species} />

      {/* Localisation(s) de l'espèce — une ou plusieurs, sur la carte de Madagascar */}
      {species.locations?.length > 0 && (
        <div className="mt-14">
          <p className="specimen-tag">Localisation{species.locations.length > 1 ? 's' : ''}</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-ink">
            {species.locations.length > 1
              ? `${species.locations.length} points documentés sur la carte de Madagascar`
              : 'Position sur la carte de Madagascar'}
          </h2>
          <div className="mt-4 rounded-[2rem] border border-earth-100 bg-white p-3">
            <MadagascarMap
              faunaMarkers={species.locations.map((l) => ({ id: l.id, name: species.name, latitude: l.latitude, longitude: l.longitude }))}
              layer="fauna"
              height={380}
            />
          </div>
        </div>
      )}
    </div>
  );
}
