import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/authApi';
// Même habillage que la page de connexion (fond « sous-bois nocturne » partagé)
import LoginBackdrop from '../../components/layout/LoginBackdrop';

// Téléphone : AUCUN préfixe ni groupement malgache n'est imposé.
// Le backend stocke la valeur telle quelle, donc on se contente d'une vérification
// souple : uniquement des chiffres (séparateurs espaces / . / - / _ / ( ) tolérés),
// 7 à 15 chiffres, avec « + » ou « 00 » facultatif pour l'international.
// Accepte donc : 034 12 345 67, 0341234567, 034 123 4567, 032 45 678 90,
// 038 11 222 33, 031 99 888 77, 020 22 000 00, +261 34 12 345 67, 00261341234567…
const PHONE_SEPARATORS = /[\s.\-/()_]/g;
const PHONE_REGEX = /^(?:\+|00)?\d{7,15}$/;

const isPhoneValid = (value) => PHONE_REGEX.test(String(value ?? '').replace(PHONE_SEPARATORS, ''));

// Base homogène : le numéro est enregistré en chiffres, sans espaces ni séparateurs.
// Les formes internationales malgaches (+261…, 00261…, 261…) reviennent à la forme
// locale « 0XXXXXXXXX » ; les autres pays gardent leur « + » initial.
const normalizePhone = (value) => {
  const cleaned = String(value ?? '').replace(PHONE_SEPARATORS, '');
  if (!cleaned) return '';
  const mg = cleaned.match(/^(?:\+|00)?261(\d{9})$/);
  if (mg) return `0${mg[1]}`;
  if (cleaned.startsWith('+')) return `+${cleaned.replace(/\+/g, '')}`;
  return cleaned;
};

export default function Register() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onPhoneChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, phone: value });
    setPhoneError(value && !isPhoneValid(value) ? t('auth.phone_invalid') : null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.phone && !isPhoneValid(form.phone)) {
      setPhoneError(t('auth.phone_invalid'));
      return;
    }
    setLoading(true);
    try {
      // Téléphone normalisé (chiffres seuls) et « null » si laissé vide → base homogène
      await authApi.register({ ...form, phone: normalizePhone(form.phone) || null });
      setStatus('pending');
    } catch (err) {
      setError(err.error?.message ?? 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'pending') {
    return (
      /* Même fond d'ambiance que la connexion, avec une carte blanche centrée */
      <div className="relative isolate -mt-24 overflow-hidden">
        <LoginBackdrop />
        <div className="relative z-10 flex min-h-screen items-center px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md rounded-[2.5rem] border border-white/15 bg-white p-10 text-center shadow-2xl sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-forest-100 text-4xl">⏳</div>
            <h1 className="mt-6 font-display text-2xl font-medium text-ink">{t('auth.pending')}</h1>
            <Link to="/" className="btn-secondary mt-6 inline-flex">{t('nav.home')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate -mt-24 overflow-hidden">
      <LoginBackdrop />

      {/* pt-32 / pb-16 : le -mt-24 fait remonter le fond derrière le header fixe,
          ces paddings rendent au contenu son espacement d'origine. */}
      <div className="relative z-10 flex min-h-screen items-center px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/15 shadow-2xl lg:grid-cols-2">
          {/* Colonne illustration — identique à la page de connexion (associations, deux halos) */}
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

          {/* Formulaire d'inscription — seule partie qui diffère de la page de connexion */}
          <div className="flex flex-col justify-center bg-white p-8 sm:p-12">
            <span className="badge w-fit bg-baobab-100 text-baobab-700">{t('auth.badge_register')}</span>
            <h1 className="mt-4 font-display text-3xl font-medium text-ink">{t('auth.register')}</h1>
            <p className="mt-2 text-sm text-earth-500">{t('auth.register_hint')}</p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
                    {t('auth.name')}
                  </label>
                  <input required placeholder={t('auth.name_placeholder')} className="input"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
                    {t('auth.username_optional')}
                  </label>
                  <input placeholder={t('auth.username_placeholder')} className="input"
                    value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
                  {t('auth.email')}
                </label>
                <input type="email" required placeholder="votre@email.mg" className="input"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
                  {t('auth.phone_optional')}
                </label>
                <input type="tel" inputMode="tel" autoComplete="tel" maxLength={30}
                  placeholder={t('auth.phone_placeholder')} className="input" value={form.phone} onChange={onPhoneChange} />
                {phoneError && <p className="mt-1.5 text-xs text-red-600">{phoneError}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
                    {t('auth.password')}
                  </label>
                  <input type="password" required placeholder="••••••••" className="input"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-earth-500">
                    {t('auth.confirm_password')}
                  </label>
                  <input type="password" required placeholder="••••••••" className="input"
                    value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
                </div>
              </div>

              {error && <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

              <button type="submit" disabled={loading || !!phoneError} className="btn-primary w-full">
                {loading ? '…' : t('auth.register')}
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
