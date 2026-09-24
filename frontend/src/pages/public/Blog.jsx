import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { blogApi } from '../../services/blogApi';
import BlogFeaturedCarousel from '../../components/home/BlogFeaturedCarousel';
import FadeInOnScroll from '../../components/home/FadeInOnScroll';

export default function Blog() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['blog', q], queryFn: () => blogApi.list({ q, limit: 9 }) });

  return (
    /* Le papier feutré doit couvrir toute la page : on annule le padding-top de <main>
       (-mt-24, posé pour compenser le header fixe) et on le repose en padding interne —
       sinon le fond démarrerait 96px trop bas, en bandeau de largeur limitée. */
    <div className="relative isolate -mt-24">
      <div aria-hidden className="felt-paper pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        {/* En-tête posé directement sur le papier — apparition en douceur (comme Contact) */}
        <FadeInOnScroll>
          <h1 className="font-display text-4xl font-medium text-forest-900 sm:text-5xl">📰 {t('nav.blog')}</h1>
          <div className="mt-8 h-px w-full bg-gradient-to-r from-earth-300/70 to-transparent" />
          <input className="input mt-6 mb-10 max-w-sm bg-white/90 backdrop-blur-sm" placeholder={t('species.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        </FadeInOnScroll>

        {!q && data?.data?.length > 0 && (
          <FadeInOnScroll delayMs={80}>
            <BlogFeaturedCarousel posts={data.data.slice(0, 3)} />
          </FadeInOnScroll>
        )}

        {isLoading && <p className="mt-10 text-center text-earth-500">…</p>}
        {data?.data?.length === 0 && <p className="mt-10 text-center text-earth-500">{t('species.no_results')}</p>}

        {/* Les cartes n'existent qu'une fois les données reçues : la grille est donc montée
            à ce moment-là, ce qui déclenche le fondu (sinon l'animation serait déjà passée). */}
        {data?.data?.length > 0 && (
          <FadeInOnScroll delayMs={140} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((post) => (
              <Link key={post.id} to="/blog/$slug" params={{ slug: post.slug }} className="card overflow-hidden hover:-translate-y-1">
                <div className="aspect-[16/9] bg-forest-100">
                  {post.image ? <img src={`/${post.image}`} alt={post.title} className="h-full w-full object-cover" /> : (
                    <div className="flex h-full items-center justify-center text-4xl">📰</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="mt-2 font-display text-lg font-semibold text-ink">{post.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-earth-600">{post.excerpt}</p>
                  <p className="mt-3 text-xs text-earth-400">{post.author_name} · {new Date(post.published_at ?? post.created_at).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </FadeInOnScroll>
        )}
      </div>
    </div>
  );
}
