import React from 'react';
import { Link } from '@tanstack/react-router';
import FadeInOnScroll from '../../components/home/FadeInOnScroll';

const PILLARS = [
  {
    title: 'La Conservation',
    text: "Gestion et extension des aires protégées pour offrir un refuge sûr à notre faune et notre flore.",
    icon: '🛡️',
    color: 'bg-forest-700',
  },
  {
    title: 'La Lutte contre le Changement Climatique',
    text: "Reforestation massive du territoire et préservation de nos forêts primaires face aux pressions humaines.",
    icon: '🌱',
    color: 'bg-baobab-500',
  },
  {
    title: 'Le Développement Durable',
    text: "Valorisation des ressources naturelles de manière responsable pour soutenir l'économie locale sans détruire notre avenir.",
    icon: '⚖️',
    color: 'bg-earth-500',
  },
];

const TIMELINE = [
  { year: '1927', text: "Création des premières aires protégées à Madagascar." },
  { year: '2003', text: "« Vision de Durban » : le réseau d'aires protégées est massivement étendu." },
  { year: "Aujourd'hui", text: "Un suivi numérique et collaboratif de la biodiversité, ouvert aux citoyens." },
];

export default function About() {
  return (
    <div className="overflow-hidden">
      {/* HERO — image plein écran, superposition sombre, cachet d'accession décoratif */}
      <section className="relative flex min-h-[72vh] items-end overflow-hidden text-parchment-50">
        <img src="/images/baobab.jpg" alt="" className="hero-breathe absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/70 to-forest-950/20" />
        <span className="specimen-tag absolute right-6 top-6 border border-white/40 bg-forest-950/70 px-3 py-1.5 text-parchment-100">
          Fiche N&deg; 001 — Ministère
        </span>
        <FadeInOnScroll className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <span className="badge bg-baobab-500 text-white">🌴 À propos du Ministère</span>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-medium leading-tight sm:text-5xl">
            Gardiens d'une biodiversité unique au monde
          </h1>
          <p className="mt-6 max-w-xl text-forest-100">
            Madagascar est une terre d'exception : une « île-continent » qui abrite à elle seule des
            milliers d'espèces végétales et animales uniques au monde. Cette richesse extraordinaire
            nous confère une responsabilité immense face à l'humanité.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/fauna" className="btn-primary">Explorer les espèces</Link>
            <Link to="/register" className="btn-secondary !border-white/60 !text-white hover:!bg-white/10">Rejoindre la communauté</Link>
          </div>
        </FadeInOnScroll>
      </section>

      {/* NOTRE RÔLE + 3 PILIERS */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <FadeInOnScroll className="mx-auto max-w-2xl text-center">
          <p className="specimen-tag">Notre rôle</p>
          <h2 className="mt-1 font-display text-3xl font-semibold text-ink">
            Le garant de la protection de ce sanctuaire naturel
          </h2>
          <p className="mt-3 text-earth-600">
            Nos actions se concentrent autour de trois piliers majeurs.
          </p>
        </FadeInOnScroll>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <FadeInOnScroll key={p.title} delayMs={i * 120} className="card group relative overflow-hidden p-7 transition-transform hover:-translate-y-1.5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${p.color}`}>
                {p.icon}
              </div>
              <h3 className="mt-5 font-display text-base font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-earth-600">{p.text}</p>
              <span className="absolute -bottom-6 -right-4 font-display text-8xl font-bold text-earth-50 transition-colors group-hover:text-forest-50">
                {String(i + 1).padStart(2, '0')}
              </span>
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      {/* CHRONOLOGIE façon "carnet de terrain" */}
      <section className="paper-texture-dark bg-forest-950 py-20 text-parchment-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="mx-auto max-w-xl text-center">
            <p className="specimen-tag text-baobab-300">Notre histoire</p>
            <h2 className="mt-1 font-display text-3xl font-semibold">Un engagement inscrit dans le temps</h2>
          </FadeInOnScroll>

          <div className="mt-14 space-y-10 border-l-2 border-dashed border-forest-700 pl-8">
            {TIMELINE.map((item, i) => (
              <FadeInOnScroll key={item.year} delayMs={i * 120} className="relative">
                <span className="absolute -left-[38px] top-1 h-3 w-3 rounded-full bg-baobab-400 ring-4 ring-forest-950" />
                <p className="font-display text-xl font-semibold text-baobab-300">{item.year}</p>
                <p className="mt-1 max-w-lg text-forest-100">{item.text}</p>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARENCE + citation */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <p className="specimen-tag">Ce tableau de bord</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Transparence et action ciblée</h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-earth-700">
            Cet outil a été conçu pour offrir aux citoyens, aux chercheurs et à nos partenaires
            internationaux une transparence totale sur l'état de notre biodiversité. En mesurant
            l'endémisme et en suivant l'évolution de nos espèces, nous pouvons mieux cibler nos
            efforts de conservation.
          </p>
          <p className="mx-auto mt-8 max-w-lg font-display text-2xl italic leading-snug text-forest-800">
            « Protéger la nature à Madagascar, c'est sauver un morceau unique de l'histoire de la Terre. »
          </p>
        </FadeInOnScroll>
      </section>

      {/* CTA finale */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <FadeInOnScroll className="rounded-[2.5rem] bg-baobab-50 p-10 text-center ring-1 ring-baobab-100 sm:p-16">
          <p className="specimen-tag text-baobab-700">Rejoindre la communauté</p>
          <h2 className="mx-auto mt-2 max-w-xl font-display text-3xl font-medium text-ink">
            Contribuez à la connaissance
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-earth-600">
            Créez un compte membre pour documenter la biodiversité malgache.
          </p>
          <Link to="/register" className="btn-primary mt-7">S'inscrire</Link>
        </FadeInOnScroll>
      </section>
    </div>
  );
}
