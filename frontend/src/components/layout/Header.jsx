import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/auth/AuthContext';

const LANGS = [
  { code: 'mg', label: 'MG' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
];

// Pages avec un hero plein écran sombre en haut : seules elles ont un fond derrière
// le header capable d'accueillir un header transparent sans nuire à la lisibilité.
// Les trois pages d'authentification (connexion, inscription, mot de passe oublié)
// partagent exactement le même fond « sous-bois » : le header y est donc transparent.
const HERO_PAGES = ['/about', '/contact', '/login', '/register', '/forgot-password'];

export default function Header() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isAdmin, isSuperAdmin, logout, user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [explorerOpen, setExplorerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const explorerRef = useRef(null);
  const accountRef = useRef(null);

  // Fond qui apparaît progressivement : transparent tout en haut du hero, puis fond
  // opaque + ombre dès qu'on défile — évite l'effet "bandeau plat" sur les pages à hero.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const transparent = HERO_PAGES.includes(pathname) && !scrolled;

  // Soulignement qui glisse d'un lien à l'autre au survol de la nav.
  const [underline, setUnderline] = useState({ left: 0, width: 0, opacity: 0 });
  const trackUnderline = (e) => {
    const el = e.currentTarget;
    setUnderline({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
  };
  const clearUnderline = () => setUnderline((u) => ({ ...u, opacity: 0 }));

  useEffect(() => {
    function onClickOutside(e) {
      if (explorerRef.current && !explorerRef.current.contains(e.target)) setExplorerOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    }
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const doLogout = async () => {
    await logout();
    setAccountOpen(false);
    navigate({ to: '/' });
  };

  const dashboardHref = isSuperAdmin ? '/superadmin' : isAdmin ? '/admin' : '/member';

  return (
    <header className="fixed inset-x-0 top-4 z-40 px-3 sm:px-6">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 transition-all duration-300 ${
          transparent
            ? 'border border-transparent bg-transparent shadow-none'
            : 'border border-earth-200 bg-parchment-50/95 shadow-sm backdrop-blur'
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className={`font-display text-lg font-semibold tracking-tight transition-colors ${transparent ? 'text-parchment-50' : 'text-forest-900'}`}>Biodiversité</span>
          <span className={`font-display text-lg italic transition-colors ${transparent ? 'text-baobab-300' : 'text-baobab-600'}`}>Madagasikara</span>
        </Link>

        <nav
          onMouseLeave={clearUnderline}
          className={`relative hidden items-center gap-6 text-sm font-medium transition-colors lg:flex ${transparent ? 'text-parchment-100' : 'text-earth-700'}`}
        >
          <span
            className="pointer-events-none absolute -bottom-1.5 h-0.5 rounded-full bg-current transition-all duration-300 ease-out"
            style={{ left: underline.left, width: underline.width, opacity: underline.opacity }}
          />
          <Link to="/" onMouseEnter={trackUnderline} className={transparent ? 'hover:text-white' : 'hover:text-forest-700'}>{t('nav.home')}</Link>

          <div className="relative" ref={explorerRef} onMouseEnter={trackUnderline}>
            <button type="button" onClick={() => setExplorerOpen((o) => !o)}
              className={`flex items-center gap-1.5 ${transparent ? 'hover:text-white' : 'hover:text-forest-700'}`} aria-expanded={explorerOpen}>
              {t('nav.explorer')}
              <span className={`text-[10px] transition-transform ${explorerOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {explorerOpen && (
              <div className="absolute left-1/2 top-full mt-4 w-72 -translate-x-1/2 rounded-3xl border border-earth-100 bg-white p-2 text-earth-700 shadow-xl">
                <Link onClick={() => setExplorerOpen(false)} to="/dashboard" className="block rounded-2xl px-4 py-2.5 text-sm hover:bg-forest-50">{t('nav.dashboard')}</Link>
                <p className="specimen-tag px-4 pt-2 pb-1">{t('nav.species')}</p>
                <Link onClick={() => setExplorerOpen(false)} to="/fauna" className="block rounded-2xl px-4 py-2.5 text-sm hover:bg-forest-50">🐾 {t('nav.fauna')}</Link>
                <Link onClick={() => setExplorerOpen(false)} to="/flora" className="block rounded-2xl px-4 py-2.5 text-sm hover:bg-forest-50">🌿 {t('nav.flora')}</Link>
                <Link onClick={() => setExplorerOpen(false)} to="/map" className="block rounded-2xl px-4 py-2.5 text-sm hover:bg-forest-50">🗺️ {t('nav.map')}</Link>
                {isAuthenticated && (
                  <Link onClick={() => setExplorerOpen(false)} to={dashboardHref} className="block rounded-2xl px-4 py-2.5 text-sm hover:bg-forest-50">
                    🗂️ {t('nav.manage_species')}
                  </Link>
                )}
                <div className="field-divider my-1" />
                {!isAuthenticated && (
                  <Link onClick={() => setExplorerOpen(false)} to="/login" className="block rounded-2xl px-4 py-2.5 text-sm font-semibold text-forest-800 hover:bg-forest-50">
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            )}
          </div>

          <Link to="/blog" onMouseEnter={trackUnderline} className={transparent ? 'hover:text-white' : 'hover:text-forest-700'}>{t('nav.blog')}</Link>
          <Link to="/about" onMouseEnter={trackUnderline} className={transparent ? 'hover:text-white' : 'hover:text-forest-700'}>{t('nav.about')}</Link>
          <Link to="/contact" onMouseEnter={trackUnderline} className={transparent ? 'hover:text-white' : 'hover:text-forest-700'}>{t('nav.contact')}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className={`hidden items-center gap-0.5 rounded-full border p-0.5 lg:flex transition-colors ${transparent ? 'border-white/30' : 'border-earth-200'}`}>
            {LANGS.map((l) => (
              <button key={l.code} type="button" onClick={() => i18n.changeLanguage(l.code)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  i18n.language === l.code
                    ? 'bg-forest-800 text-parchment-50'
                    : transparent ? 'text-parchment-100 hover:bg-white/10' : 'text-earth-600 hover:bg-forest-50'
                }`}>
                {l.label}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="relative hidden lg:block" ref={accountRef}>
              <button type="button" onClick={() => setAccountOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-baobab-500 text-sm font-semibold text-white">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-4 w-56 rounded-3xl border border-earth-100 bg-white p-2 shadow-xl">
                  <div className="border-b border-earth-100 px-4 py-3">
                    <p className="text-sm font-semibold text-ink">{user?.name}</p>
                    <p className="text-xs text-earth-500">{user?.email}</p>
                    {isSuperAdmin && <span className="badge mt-1 bg-baobab-100 text-baobab-700">SuperAdmin</span>}
                  </div>
                  <Link onClick={() => setAccountOpen(false)} to="/account" className="block rounded-2xl px-4 py-2.5 text-sm hover:bg-forest-50">👤 Profil</Link>
                  <Link onClick={() => setAccountOpen(false)} to="/account" className="block rounded-2xl px-4 py-2.5 text-sm hover:bg-forest-50">✏️ Modifier mes informations</Link>
                  <Link onClick={() => setAccountOpen(false)} to="/account" className="block rounded-2xl px-4 py-2.5 text-sm hover:bg-forest-50">🔒 Changer mot de passe</Link>
                  <button type="button" onClick={doLogout} className="block w-full rounded-2xl px-4 py-2.5 text-left text-sm text-baobab-700 hover:bg-baobab-50">
                    ↩ {t('auth.logout')}
                  </button>
                  {/* Item 15 : bouton "Retour" explicite pour fermer le sous-menu */}
                  <button type="button" onClick={() => setAccountOpen(false)} className="block w-full rounded-2xl px-4 py-2.5 text-left text-sm text-earth-400 hover:bg-earth-50">
                    ← Retour
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary hidden !px-5 !py-2 !text-xs md:inline-flex">{t('nav.login')}</Link>
          )}

          <button type="button" className={transparent ? 'text-parchment-50 lg:hidden' : 'lg:hidden'} onClick={() => setMobileOpen((o) => !o)} aria-label="menu">
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-earth-200 bg-white px-4 py-3 shadow-lg lg:hidden">
          <div className="flex flex-col gap-1 text-sm font-medium text-earth-700">
            <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 hover:bg-forest-50">{t('nav.home')}</Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 hover:bg-forest-50">{t('nav.dashboard')}</Link>
            <Link to="/fauna" onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 hover:bg-forest-50">🐾 {t('nav.fauna')}</Link>
            <Link to="/flora" onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 hover:bg-forest-50">🌿 {t('nav.flora')}</Link>
            <Link to="/map" onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 hover:bg-forest-50">🗺️ {t('nav.map')}</Link>
            <Link to="/blog" onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 hover:bg-forest-50">{t('nav.blog')}</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 hover:bg-forest-50">{t('nav.about')}</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 hover:bg-forest-50">{t('nav.contact')}</Link>
            <div className="field-divider my-2" />
            {isAuthenticated ? (
              <>
                <Link to={dashboardHref} onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 font-semibold text-forest-800 hover:bg-forest-50">
                  🗂️ {t('nav.manage_species')}
                </Link>
                <Link to="/account" onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 hover:bg-forest-50">👤 Mon compte</Link>
                <button type="button" onClick={() => { doLogout(); setMobileOpen(false); }} className="rounded-2xl px-3 py-2.5 text-left text-baobab-700 hover:bg-baobab-50">
                  ↩ {t('auth.logout')}
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2.5 font-semibold text-forest-800 hover:bg-forest-50">{t('nav.login')}</Link>
            )}
            <div className="mt-2 flex gap-1">
              {LANGS.map((l) => (
                <button key={l.code} type="button" onClick={() => i18n.changeLanguage(l.code)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${i18n.language === l.code ? 'bg-forest-800 text-parchment-50' : 'bg-forest-50 text-earth-600'}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
