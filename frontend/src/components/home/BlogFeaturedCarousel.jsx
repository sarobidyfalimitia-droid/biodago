import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';

/**
 * Carrousel des articles à la une, en haut de la page Blog — alterne automatiquement
 * entre les articles les plus récents, avec un fondu doux.
 */
export default function BlogFeaturedCarousel({ posts }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (posts.length < 2) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % posts.length), 6000);
    return () => clearInterval(t);
  }, [posts.length]);

  if (posts.length === 0) return null;

  return (
    <div className="relative mb-10 h-64 overflow-hidden rounded-3xl sm:h-80">
      {posts.map((post, i) => (
        <Link
          key={post.id}
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className={`absolute inset-0 flex items-end bg-forest-900 transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {post.image && <img src={`/${post.image}`} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-50" />}
          <div className="relative z-10 p-6 text-parchment-50 sm:p-10">
            <span className="badge bg-baobab-500 text-white">À la une</span>
            <h2 className="mt-2 font-display text-xl font-semibold sm:text-2xl">{post.title}</h2>
            <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-forest-100">{post.excerpt}</p>
          </div>
        </Link>
      ))}
      {posts.length > 1 && (
        <div className="absolute bottom-3 right-4 z-10 flex gap-1.5">
          {posts.map((post, i) => (
            <button
              key={post.id}
              aria-label={`Article ${i + 1}`}
              onClick={(e) => { e.preventDefault(); setIndex(i); }}
              className={`h-1.5 w-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
