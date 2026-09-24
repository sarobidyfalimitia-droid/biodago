import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/auth/AuthContext';
import LoginBackdrop from '../../components/layout/LoginBackdrop';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  // Item 13 : connexion par email OU pseudo — un seul champ "identifiant"
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form);
      // Tous les utilisateurs sont redirigés vers la page d'accueil (landing page)
      navigate({ to: '/' });
    } catch (err) {
      setError(err.error?.message ?? 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate -mt-24 overflow-hidden">
      <LoginBackdrop />

      {/* pt-32 / pb-16 : le -mt-24 fait remonter le fond derrière le header fixe,
          ces paddings rendent au contenu son espacement d'origine. */}
      <div className="relative z-10 flex min-h-screen items-center px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/15 shadow-2xl lg:grid-cols-2">
      {/* Colonne illustration, façon "sanctuaire" — fond dégradé décoratif, sans photo ni étiquette */}
      <div className="paper-texture-dark relative hidden overflow-hidden bg-gradient-to-br from-forest-900 via-forest-950 to-baobab-900 text-parchment-50 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-baobab-500/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-forest-700/20" />

        <span className="specimen-tag relative z-10 self-start text-baobab-300">🌿 {t('app.name')}</span>

        <div className="relative z-10">
          <p className="specimen-tag text-baobab-300">{t('auth.panel_kicker')}</p>
          <h2 className="mt-2 font-display text-3xl font-medium leading-tight">
            {t('auth.panel_title')}
          </h2>
          <p className="mt-4 max-w-sm text-sm text-forest-100">
            {t('auth.panel_text')}
          </p>
          <p className="mt-6 border-l-2 border-baobab-400 pl-4 font-display italic text-forest-200">
            {t('auth.panel_quote')}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex flex-col justify-center bg-white p-8 sm:p-12">
        <span className="badge w-fit bg-forest-100 text-forest-700">{t('auth.badge_login')}</span>
        <h1 className="mt-4 font-display text-3xl font-medium text-ink">{t('auth.login')}</h1>
        <p className="mt-2 text-sm text-earth-500">{t('auth.login_hint')}</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
              {t('auth.identifier')}
            </label>
            <input required placeholder={t('auth.identifier_placeholder')} className="input"
              value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
              {t('auth.password')}
            </label>
            <input type="password" required placeholder="••••••••" className="input"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? '…' : t('auth.login')}
          </button>
        </form>

        <div className="field-divider mt-7 pt-5" />
        <div className="flex items-center justify-between text-sm">
          <Link to="/register" className="font-semibold text-forest-700 hover:underline">{t('auth.register')}</Link>
          <Link to="/forgot-password" className="text-earth-500 hover:underline">{t('auth.forgot_password')}</Link>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
