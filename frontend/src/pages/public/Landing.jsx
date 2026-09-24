import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { statsApi } from '../../services/statsApi';
import { faunaApi } from '../../services/faunaApi';
import { floraApi } from '../../services/floraApi';
import SpeciesCard from '../../components/species/SpeciesCard';
import HeroCarousel from '../../components/home/HeroCarousel';
import StatusBadgesMarquee from '../../components/home/StatusBadgesMarquee';
import OdometerNumber from '../../components/home/OdometerNumber';
import FadeInOnScroll from '../../components/home/FadeInOnScroll';
import DecorativeDoodles from '../../components/home/DecorativeDoodles';

const HERO_IMAGES = [
  { src: '/images/baobab.jpg', alt: 'Un lémurien et un caméléon dans la forêt tropicale de Madagascar' },
  { src: '/images/login.jpg', alt: 'Paysage naturel de Madagascar' },
];

const ICON_ROW = [
  { icon: '🦎', title: 'Faune Endémique', text: 'Lémuriens, caméléons, oiseaux uniques' },
  { icon: '🌳', title: 'Flore Rare', text: 'Baobabs, orchidées, plantes médicinales' },
  { icon: '🧭', title: 'Cartographie', text: 'Régions et aires de répartition' },
];

export default function Landing() {
  const { t } = useTranslation();
  const stats = useQuery({ queryKey: ['stats', 'public'], queryFn: statsApi.public });
  const fauna = useQuery({ queryKey: ['fauna', 'preview'], queryFn: () => faunaApi.list({ limit: 3 }) });
  const flora = useQuery({ queryKey: ['flora', 'preview'], queryFn: () => floraApi.list({ limit: 3 }) });

  // Effet de parallaxe léger sur l'illustration du hero : elle bouge plus lentement
  // que le texte quand on défile, pour donner une impression de profondeur.
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    /* Le fond « taches & courbes » couvre toute la page : on annule le padding-top de
       <main> (-mt-24, posé pour compenser le header fixe) et on le repose en padding
       interne — sinon le fond démarrerait 96px trop bas, en bandeau de largeur limitée. */
    <div className="relative isolate -mt-24">
      <div aria-hidden className="blob-motif pointer-events-none absolute inset-0 -z-10" />

      {/* HERO — bloc photo arrondi asymétrique, façon "sanctuaire" */}
      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-32 sm:px-6 lg:px-8">
        <DecorativeDoodles
          items={[
            { shape: 'compass', className: 'left-2 top-2 text-forest-800', size: 90, opacity: 0.06, rotate: -8 },
            { shape: 'leaf', className: 'right-8 top-24 text-baobab-600 hidden sm:block', size: 46, opacity: 0.1, rotate: 25 },
            { shape: 'paw', className: 'left-1/3 bottom-4 text-forest-700 hidden lg:block', size: 34, opacity: 0.1, rotate: -12 },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="badge bg-forest-100 text-forest-700">🌴 Découvrir · Documenter · Préserver</span>
            {/* Taille de base limitée à text-4xl + break-words : en malgache le titre
                commence par un mot long ("Fahsamihafan'ny") qui dépassait la largeur
                des petits écrans et se faisait couper par l'overflow-hidden du hero. */}
            <h1 className="mt-5 break-words font-display text-4xl font-medium leading-[1.05] text-ink sm:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mt-5 max-w-md text-earth-600">{t('hero.subtitle')}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/dashboard" className="btn-primary">{t('hero.cta')}</Link>
              <Link to="/map" className="text-sm font-semibold text-forest-800 underline decoration-baobab-400 decoration-2 underline-offset-4">
                {t('nav.map')}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {ICON_ROW.map((i) => (
                <div key={i.title} className="flex items-start gap-3">
                  <span className="text-2xl">{i.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{i.title}</p>
                    <p className="text-xs text-earth-500">{i.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloc image arrondi façon "Olive Leaf" — carrousel avec léger effet de parallaxe */}
          <div className="relative">
            <div
              className="overflow-hidden rounded-[3rem] rounded-tr-[6rem] shadow-xl"
              style={{ transform: `translateY(${scrollY * 0.08}px)` }}
            >
              <HeroCarousel images={HERO_IMAGES} />
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau défilant des statuts de conservation, façon "partenaires" */}
      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <StatusBadgesMarquee />
      </section>

      {/* STATS — carte blanche arrondie : halos flous, squelettes de chargement, 4 chiffres clés */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll delayMs={140}>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-earth-100 sm:p-10">
            {/* Effets de fond */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-forest-50/50 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-baobab-50/50 blur-3xl" />

            {/* Affichage pendant le chargement */}
            {stats.isLoading ? (
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-earth-50" />
                ))}
              </div>
            ) : (
              <div className="relative grid grid-cols-2 gap-y-8 divide-earth-100 sm:grid-cols-4 sm:divide-x">
                {[
                  { key: 'fauna', value: stats.data?.data?.total_fauna ?? 0, icon: '🐾' },
                  { key: 'flora', value: stats.data?.data?.total_flora ?? 0, icon: '🌿' },
                  { key: 'categories', value: stats.data?.data?.total_categories ?? 0, icon: '📁' },
                  { key: 'articles', value: stats.data?.data?.total_articles ?? 0, icon: '📰' },
                ].map((s) => (
                  <div key={s.key} className="flex flex-col items-center text-center px-4 transition-transform hover:scale-105">
                    <span className="mb-2 text-xl opacity-80" aria-hidden="true">{s.icon}</span>
                    <p className="font-display text-4xl font-bold tracking-tight text-forest-900">
                      <OdometerNumber value={s.value} />
                    </p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-earth-400">
                      {/* Clé de traduction dynamique : stats.fauna / flora / categories / articles */}
                      {t(`stats.${s.key}`)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeInOnScroll>
      </section>

      {/* Bloc sombre arrondi façon "Discover our experiences", cercles photo */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll className="block-feature paper-texture-dark grid gap-8 p-10 sm:p-14 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <p className="specimen-tag text-forest-400">Collection</p>
            <h2 className="mt-1 font-display text-2xl font-medium">Découvrir nos espèces</h2>
            <p className="mt-2 text-sm text-forest-300">Un aperçu de la faune et de la flore documentées par la communauté.</p>
            <Link to="/fauna" className="btn-primary mt-6 !bg-baobab-500 hover:!bg-baobab-600">Voir toutes les espèces</Link>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[...(fauna.data?.data ?? []).slice(0, 2), ...(flora.data?.data ?? []).slice(0, 1)].map((s) => (
              <div key={s.id} className="relative text-center">
                <span className="absolute -top-2 left-1/2 z-10 h-5 w-14 -translate-x-1/2 -rotate-6 bg-baobab-400/70 shadow-sm" aria-hidden="true" />
                <div className="mx-auto aspect-square w-full overflow-hidden rounded-full border-4 border-forest-800 bg-forest-800">
                  {s.primary_image ? (
                    <img src={`/${s.primary_image}`} alt={s.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">{s.scientific_name ? '🐾' : '🌿'}</div>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold">{s.name}</p>
                <p className="font-display text-xs italic text-forest-300">{s.scientific_name}</p>
              </div>
            ))}
          </div>
        </FadeInOnScroll>
      </section>

      {/* FAUNA */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="specimen-tag flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-baobab-500" aria-hidden="true" />
                Collection I
                <span className="h-px w-8 border-t border-dashed border-earth-300" aria-hidden="true" />
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{t('nav.fauna')}</h2>
            </div>
            <Link to="/fauna" className="text-sm font-semibold text-forest-700 hover:underline">{t('buttons.view_all')} →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fauna.data?.data?.map((f) => <SpeciesCard key={f.id} species={f} type="fauna" />)}
          </div>
        </FadeInOnScroll>
      </section>

      {/* FLORA */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="specimen-tag flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-forest-600" aria-hidden="true" />
                Collection II
                <span className="h-px w-8 border-t border-dashed border-earth-300" aria-hidden="true" />
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{t('nav.flora')}</h2>
            </div>
            <Link to="/flora" className="text-sm font-semibold text-forest-700 hover:underline">{t('buttons.view_all')} →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {flora.data?.data?.map((f) => <SpeciesCard key={f.id} species={f} type="flora" />)}
          </div>
        </FadeInOnScroll>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <FadeInOnScroll className="rounded-[2.5rem] bg-baobab-50 p-10 text-center ring-1 ring-baobab-100 sm:p-16">
          <p className="specimen-tag text-baobab-700">Rejoindre la communauté</p>
          <h2 className="mx-auto mt-2 max-w-xl font-display text-3xl font-medium text-ink">
            Contribuez à la connaissance
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-earth-600">
            Créez un compte membre pour documenter la biodiversité malgache.
          </p>
          <Link to="/register" className="btn-primary mt-7">{t('auth.register')}</Link>
        </FadeInOnScroll>
      </section>
    </div>
  );
}
