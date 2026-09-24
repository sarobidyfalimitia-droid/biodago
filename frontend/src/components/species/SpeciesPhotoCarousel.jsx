import React, { useState } from 'react';
import { assetUrl } from '../../utils/assetUrl';

/**
 * Carrousel de photos sur la fiche détail (1 à 3 photos par espèce) : image principale
 * en grand avec flèches + puces, miniatures cliquables en dessous.
 */
export default function SpeciesPhotoCarousel({ images, alt, fallbackIcon = '🐾', children }) {
  const [index, setIndex] = useState(0);
  const hasImages = images && images.length > 0;
  const go = (delta) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden border border-earth-200 bg-forest-100">
        {hasImages ? (
          <img src={assetUrl(images[index].image_path)} alt={alt} className="h-full w-full object-cover transition-opacity duration-300" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">{fallbackIcon}</div>
        )}
        {children}
        {images?.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Photo précédente"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink shadow hover:bg-white">
              ‹
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Photo suivante"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink shadow hover:bg-white">
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((img, i) => (
                <button key={img.id} aria-label={`Photo ${i + 1}`} onClick={() => setIndex(i)}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'bg-white/60'}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {images?.length > 1 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <button key={img.id} type="button" onClick={() => setIndex(i)}
              className={`aspect-square overflow-hidden rounded-md border-2 transition ${i === index ? 'border-forest-600' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <img src={assetUrl(img.thumbnail_path ?? img.image_path)} className="h-full w-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
