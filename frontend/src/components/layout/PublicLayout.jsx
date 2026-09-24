import React from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';

// Le header est maintenant en position fixe (survol) pour pouvoir être transparent
// au-dessus d'un hero plein écran ; les autres pages compensent avec un padding-top.
const HERO_PAGES = ['/about', '/contact'];

export default function PublicLayout() {
  const { i18n } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHeroPage = HERO_PAGES.includes(pathname);

  return (
    <div className="paper-texture flex min-h-screen flex-col bg-parchment-50">
      <Header />
      {/* Fondu doux à chaque changement de page ET de langue : <main> est remonté via sa
          clé (chemin + langue), donc l'animation .i18n-fade rejoue à chaque navigation —
          même effet d'apparition que sur la page Contact. */}
      <main key={`${pathname}-${i18n.language}`} className={`i18n-fade flex-1 ${isHeroPage ? '' : 'pt-24'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
