import React from 'react';
import { CONSERVATION_STATUSES } from '../../utils/conservationStatus';

/**
 * Bandeau "façon partenaires" qui fait défiler en boucle les statuts de conservation
 * (Vulnérable, En danger, ...) pour rendre la légende plus dynamique.
 */
export default function StatusBadgesMarquee() {
  const items = [...CONSERVATION_STATUSES, ...CONSERVATION_STATUSES];
  return (
    <div className="overflow-hidden">
      <div className="marquee-track flex w-max gap-3">
        {items.map((s, i) => (
          <span key={`${s.code}-${i}`} className="badge whitespace-nowrap bg-forest-50 text-forest-700">
            {s.short} ({s.code})
          </span>
        ))}
      </div>
    </div>
  );
}
