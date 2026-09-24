import React, { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import FadeInOnScroll from '../../components/home/FadeInOnScroll';
import { useTranslation } from 'react-i18next';
import { blogApi } from '../../services/blogApi';

export default function BlogDetail() {
  const { slug } = useParams({ strict: false });
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['blog', slug], queryFn: () => blogApi.get(slug) });
  const post = data?.data;

  // Barre de progression de lecture : une fine ligne en haut de la page qui se remplit
  // au fur et à mesure qu'on avance dans l'article.
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? Math.min(100, (doc.scrollTop / scrollable) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);

  if (isLoading) return <p className="p-10 text-center text-earth-500">…</p>;
  if (!post) return <p className="p-10 text-center text-earth-500">{t('species.no_results')}</p>;

  return (
    /* Même principe que la liste du blog : le fond couvre toute la page, y compris
       sous le header fixe (on annule son padding-top puis on le repose en interne). */
    <div className="relative isolate -mt-24">
      <div aria-hidden className="felt-paper pointer-events-none absolute inset-0 -z-10" />

      <article className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
        {/* Contenu de l'article enveloppé : il n'est monté qu'après le chargement des données,
            donc le fondu se joue bien à l'arrivée du contenu (la barre de progression de lecture
            reste en dehors, pour ne pas être affectée par le transform du fondu). */}
        <FadeInOnScroll delayMs={80}>
          <Link
            to="/blog"
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
          <h1 className="mt-4 font-display text-4xl font-medium text-forest-900">{post.title}</h1>
          <p className="mt-3 text-sm text-earth-500">{post.author_name} · {new Date(post.published_at ?? post.created_at).toLocaleDateString()}</p>
          {post.image && <img src={`/${post.image}`} alt={post.title} className="mt-8 aspect-[16/9] w-full rounded-[2rem] object-cover shadow-lg shadow-earth-900/10" />}
          {/* Corrigé : les photos supplémentaires envoyées avec l'article étaient stockées
              mais jamais affichées (seule la principale l'était) — elles s'affichent maintenant ici. */}
          {post.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {post.images.filter((img) => img.image_path !== post.image).map((img) => (
                <img key={img.id} src={`/${img.thumbnail_path ?? img.image_path}`} alt="" className="aspect-square w-full rounded-xl object-cover" />
              ))}
            </div>
          )}
          {/* Le texte est posé sur une feuille blanche : très lisible et raccord avec le papier du fond */}
          <div className="prose prose-earth mt-8 max-w-none whitespace-pre-line rounded-[2rem] border border-earth-100 bg-white/90 px-6 py-8 text-earth-700 shadow-sm backdrop-blur-sm sm:px-10">
            {post.content}
          </div>
        </FadeInOnScroll>
      </article>
    </div>
  );
}
