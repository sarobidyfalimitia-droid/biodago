import React, { useEffect, useState } from 'react';

/**
 * Numéro d'accession (ex. "N° 003") qui s'écrase comme un cachet de bibliothécaire à
 * l'arrivée sur la fiche : léger sur-agrandissement + rotation, puis "impact" net.
 * Idée retenue par l'utilisateur pour coller à l'esprit "carnet de terrain".
 */
export default function AccessionStamp({ id, className = '' }) {
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    setStamped(false);
    const t = setTimeout(() => setStamped(true), 120);
    return () => clearTimeout(t);
  }, [id]);

  return (
    <span
      className={`specimen-tag inline-block origin-center border border-white/40 bg-forest-950/80 px-2 py-1 text-parchment-100 transition-all duration-200 ease-out ${
        stamped ? 'scale-100 rotate-[-2deg] opacity-100' : 'scale-[2.2] rotate-[-14deg] opacity-0'
      } ${className}`}
    >
      N° {String(id).padStart(3, '0')}
    </span>
  );
}
