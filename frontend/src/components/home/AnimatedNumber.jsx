import React, { useEffect, useRef, useState } from 'react';

/**
 * Statistique qui compte progressivement de 0 jusqu'à sa valeur, au lieu d'apparaître
 * d'un coup — se déclenche quand le chiffre entre dans le viewport.
 */
export default function AnimatedNumber({ value, durationMs = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const target = Number(value) || 0;
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min(1, (now - start) / durationMs);
          setDisplay(Math.round(progress * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.4 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, durationMs]);

  return <span ref={ref}>{value === undefined || value === null ? '—' : display}</span>;
}
