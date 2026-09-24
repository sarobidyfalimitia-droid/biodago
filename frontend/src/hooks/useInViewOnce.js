import { useEffect, useRef, useState } from 'react';

/**
 * Retourne [ref, inView] — inView passe à true (une seule fois) quand l'élément
 * attaché au ref entre dans le viewport. Sert à déclencher des animations
 * (barres, compteurs) seulement quand l'utilisateur les voit vraiment.
 */
export default function useInViewOnce(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}
