import React from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-24 rounded-t-[3rem] bg-forest-950 text-parchment-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-xl">
              🌿 Biodiversité <span className="italic text-baobab-400">Madagasikara</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-forest-300">{t('footer.tagline')}</p>
            <p className="mt-4 font-display italic text-baobab-300">{t('footer.motto')}</p>
          </div>
          <div>
            <p className="specimen-tag text-forest-400">{t('nav.explorer')}</p>
            {/* Liens rendus fonctionnels — c'étaient de simples <li> texte auparavant */}
            <ul className="mt-3 space-y-2 text-sm text-forest-200">
              <li><Link to="/fauna" className="hover:text-baobab-300 hover:underline">{t('nav.fauna')}</Link></li>
              <li><Link to="/flora" className="hover:text-baobab-300 hover:underline">{t('nav.flora')}</Link></li>
              <li><Link to="/map" className="hover:text-baobab-300 hover:underline">{t('nav.map')}</Link></li>
              <li><Link to="/dashboard" className="hover:text-baobab-300 hover:underline">{t('nav.dashboard')}</Link></li>
            </ul>
          </div>
          <div>
            <p className="specimen-tag text-forest-400">{t('nav.blog')}</p>
            <ul className="mt-3 space-y-2 text-sm text-forest-200">
              <li><Link to="/blog" className="hover:text-baobab-300 hover:underline">{t('nav.blog')}</Link></li>
              <li><Link to="/about" className="hover:text-baobab-300 hover:underline">{t('nav.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-baobab-300 hover:underline">{t('nav.contact')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="field-divider mt-10 border-forest-800 pt-6">
          <p className="text-xs text-forest-500">
            © {new Date().getFullYear()} Biodiversité Madagasikara — {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
