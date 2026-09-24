import React from 'react';
import useInViewOnce from '../../hooks/useInViewOnce';

function DigitColumn({ digit, active, delayMs }) {
  return (
    <span className="odometer-digit">
      <span
        className="odometer-track"
        style={{ transform: `translateY(-${(active ? digit : 0) * 10}%)`, transitionDelay: `${delayMs}ms` }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="odometer-num">{i}</span>
        ))}
      </span>
    </span>
  );
}

/**
 * Chiffre qui s'anime façon compteur kilométrique (odomètre) : chaque position défile
 * verticalement jusqu'à révéler le bon chiffre, au lieu d'un simple comptage 0 → valeur.
 */
export default function OdometerNumber({ value }) {
  const [ref, inView] = useInViewOnce(0.4);
  const target = Number(value) || 0;
  const digits = String(Math.max(0, target)).split('');

  return (
    <span ref={ref} className="odometer" aria-label={String(value ?? '—')}>
      {value === undefined || value === null ? (
        '—'
      ) : (
        digits.map((d, i) => (
          <DigitColumn key={i} digit={Number(d)} active={inView} delayMs={i * 70} />
        ))
      )}
    </span>
  );
}
