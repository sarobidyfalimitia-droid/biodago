import React from 'react';

/**
 * Petites illustrations décoratives en filigrane (feuille, empreinte, boussole),
 * dispersées et légèrement pivotées — purement esthétique, pointer-events désactivés.
 * À poser dans un conteneur `relative overflow-hidden`.
 */
const SHAPES = {
  leaf: (
    <path d="M2 22C2 10 10 2 22 2c0 12-8 20-20 20Z" />
  ),
  paw: (
    <>
      <circle cx="12" cy="16" r="6" />
      <circle cx="4" cy="7" r="2.4" />
      <circle cx="11" cy="3" r="2.4" />
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="22" cy="11" r="2.4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="10" fill="none" strokeWidth="1.2" stroke="currentColor" />
      <path d="M12 4l2.4 6.6L21 13l-6.6 2.4L12 22l-2.4-6.6L3 13l6.6-2.4Z" />
    </>
  ),
};

export default function DecorativeDoodles({ items }) {
  return (
    <>
      {items.map((it, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`pointer-events-none absolute ${it.className}`}
          style={{ width: it.size ?? 40, height: it.size ?? 40, opacity: it.opacity ?? 0.12, transform: `rotate(${it.rotate ?? 0}deg)` }}
          aria-hidden="true"
        >
          {SHAPES[it.shape]}
        </svg>
      ))}
    </>
  );
}
