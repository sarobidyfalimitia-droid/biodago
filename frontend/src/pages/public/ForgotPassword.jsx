import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/authApi';
// Même habillage que les pages de connexion et d'inscription (fond partagé)
import LoginBackdrop from '../../components/layout/LoginBackdrop';

/**
 * Récupération sans SMTP/OTP : le membre saisit ici le code communiqué
 * manuellement par l'Admin (voir /admin/password-resets côté Admin).
 */
export default function ForgotPassword() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', code: '', new_password: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null); setMessage(null);
    setLoading(true);
    try {
      const res = await authApi.resetPassword(form);
      setMessage(res.message);
    } catch (err) {
      setError(err.error?.message ?? 'Erreur');
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
          {/* Colonne illustration — identique aux pages de connexion et d'inscription */}
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

          {/* Formulaire de récupération */}
          <div className="flex flex-col justify-center bg-white p-8 sm:p-12">
            <span className="badge w-fit bg-earth-100 text-earth-600">{t('auth.badge_reset')}</span>
            <h1 className="mt-4 font-display text-3xl font-medium text-ink">{t('auth.forgot_password')}</h1>
            <p className="mt-2 text-sm text-earth-500">{t('auth.reset_hint')}</p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
                  {t('auth.email')}
                </label>
                <input type="email" required placeholder="votre@email.mg" className="input"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
                  {t('auth.reset_code')}
                </label>
                <input required placeholder={t('auth.reset_code_placeholder')} className="input"
                  value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
                  {t('auth.new_password')}
                </label>
                <input type="password" required placeholder="••••••••" className="input"
                  value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
              </div>

              {error && <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
              {message && <p className="rounded-2xl bg-forest-100 px-4 py-2.5 text-sm text-forest-700">{message}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? '…' : t('buttons.submit')}
              </button>
            </form>

            <div className="field-divider mt-7 pt-5" />
            <div className="flex items-center justify-between text-sm">
              <Link to="/login" className="font-semibold text-forest-700 hover:underline">{t('auth.login')}</Link>
              <Link to="/" className="text-earth-500 hover:underline">{t('nav.home')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
