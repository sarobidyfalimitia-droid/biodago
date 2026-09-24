import React from 'react';

/**
 * Fond d'ambiance « sous-bois nocturne » de la page de connexion.
 *
 * À poser en PREMIER enfant d'un conteneur `relative isolate overflow-hidden` : le
 * `-z-10` le place au-dessus du fond du layout mais sous le contenu de la page.
 *
 * Dépend uniquement des classes CSS .backdrop-night / .topo-lines-light / .canopy-blob /
 * .canopy-ray et des keyframes blob-drift / ray-glow (voir index.css).
 * Purement décoratif : `aria-hidden`, aucun asset réseau, animations coupées si le
 * visiteur a demandé `prefers-reduced-motion`.
 */
const BLOBS = [
  // Vert forêt en haut à gauche, ambre à droite, vert en bas : tailles et positions
  // sont décalées pour éviter une pulsation synchrone.
  { color: 'rgba(54, 125, 80, 0.6)', size: 560, position: { top: '-180px', left: '-140px' } },
  { color: 'rgba(194, 102, 29, 0.45)', size: 460, position: { top: '8%', right: '-150px', animationDelay: '-9s' } },
  { color: 'rgba(86, 158, 109, 0.35)', size: 620, position: { bottom: '-240px', left: '18%', animationDelay: '-17s' } },
];

const RAYS = [
  // Dimensions/positions en styles inline : les rais traversent la page en biais.
  { position: { left: '30%', width: 150, height: '70vh', transform: 'rotate(17deg)' } },
  { position: { top: '2vh', left: '62%', width: 100, height: '52vh', transform: 'rotate(-13deg)', animationDelay: '-10s' } },
];

const RAY_COLOR = 'rgba(178, 226, 194, 0.4)';

export default function LoginBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden backdrop-night"
    >
      {/* Courbes de niveau (SVG inline, tuile 360×240) */}
      <div className="absolute inset-0 topo-lines-light" />

      {/* Halos flous animés */}
      {BLOBS.map((blob, i) => (
        <span
          key={`blob-${i}`}
          className="canopy-blob"
          style={{ width: blob.size, height: blob.size, backgroundColor: blob.color, ...blob.position }}
        />
      ))}

      {/* Rais de lumière traversant la végétation */}
      {RAYS.map((ray, i) => (
        <span
          key={`ray-${i}`}
          className="canopy-ray absolute"
          style={{ '--ray-color': RAY_COLOR, ...ray.position }}
        />
      ))}
    </div>
  );
}
