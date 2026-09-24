import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactApi } from '../../services/contactApi';
import FadeInOnScroll from '../../components/home/FadeInOnScroll';

const CARDS = [
  { label: 'Téléphone', value: '+261 20 22 000 00', icon: '📞', color: 'bg-forest-700' },
  { label: 'Email', value: 'contact@biodiversite-mada.mg', icon: '✉️', color: 'bg-baobab-500' },
  { label: 'Adresse', value: 'Antananarivo, Madagascar', icon: '📍', color: 'bg-earth-500' },
  { label: 'Horaires', value: 'Lun–Ven, 8h–16h', icon: '🕘', color: 'bg-forest-500' },
];

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null); // Bug #11 corrigé : gestion d'erreur ajoutée
  const [sending, setSending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await contactApi.send(form);
      setSent(true);
    } catch (err) {
      setError(err.error?.message ?? "L'envoi a échoué. Veuillez réessayer dans un instant.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* HERO — image plein écran + bord en vague, façon accueil visiteur d'un centre */}
      <section className="relative flex min-h-[46vh] items-center justify-center overflow-hidden text-center text-parchment-50">
        <img src="/images/baobab.jpg" alt="" className="hero-breathe absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-forest-950/70" />
        <FadeInOnScroll className="relative z-10 mx-auto max-w-2xl px-4">
          <span className="badge bg-baobab-500 text-white">✉️ Nous écrire</span>
          <h1 className="mt-4 font-display text-4xl font-medium sm:text-5xl">{t('nav.contact')}</h1>
          <p className="mt-4 text-forest-100">
            Une question, une observation à signaler, une envie de collaborer ? Écrivez-nous,
            notre équipe vous répond dans les meilleurs délais.
          </p>
        </FadeInOnScroll>
        {/* Bord en vague qui fait la transition vers le contenu, dans l'esprit du visuel de référence */}
        <svg className="absolute -bottom-1 left-0 w-full text-parchment-50" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
          <path d="M0,32 C240,80 480,0 720,24 C960,48 1200,80 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          {/* 4 cartes de coordonnées, façon fiches de terrain */}
          <FadeInOnScroll className="grid grid-cols-2 gap-4">
            {CARDS.map((c) => (
              <div key={c.label} className="card p-5 text-center transition-transform hover:-translate-y-1">
                <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-white shadow-sm ${c.color}`}>
                  {c.icon}
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{c.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-earth-600">{c.value}</p>
              </div>
            ))}
            <div className="col-span-2 border-t border-dashed border-earth-300 pt-4 text-xs leading-relaxed text-earth-500">
              Pour toute urgence liée à la faune sauvage (animal blessé, braconnage constaté),
              contactez directement les autorités locales compétentes.
            </div>
          </FadeInOnScroll>

          {/* Formulaire */}
          <FadeInOnScroll delayMs={120}>
            <p className="specimen-tag">Écrivez-nous</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Envoyer un message</h2>
            <p className="mt-2 text-sm text-earth-600">
              Complétez le formulaire ci-dessous, nous revenons vers vous rapidement.
            </p>

            {sent ? (
              <div className="mt-6 border border-forest-300 bg-forest-50 p-8">
                <p className="font-display text-lg text-forest-800">Merci ! Votre message a bien été envoyé.</p>
                <p className="mt-1 text-sm text-forest-600">Notre équipe vous répondra dans les meilleurs délais.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input required placeholder={t('auth.name')} className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input type="email" required placeholder={t('auth.email')} className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <input placeholder="Sujet" className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <textarea required rows={6} placeholder="Message" className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                {error && <p className="border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={sending} className="btn-primary w-full sm:w-auto">{sending ? '…' : t('buttons.submit')}</button>
              </form>
            )}
          </FadeInOnScroll>
        </div>
      </div>
    </div>
  );
}
