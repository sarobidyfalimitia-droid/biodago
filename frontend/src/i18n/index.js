import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import mg from './locales/mg.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

// Langues réellement fournies (ce sont aussi celles proposées dans l'en-tête : MG / FR / EN).
export const SUPPORTED_LNGS = ['mg', 'fr', 'en'];

// Le malgache reste la langue par défaut du site, mais UNIQUEMENT au premier chargement.
// Le choix effectué par l'utilisateur (boutons MG / FR / EN de l'en-tête) est mémorisé par
// i18next dans localStorage sous « i18nextLng » : il faut donc le relire ici, sinon un
// « lng » figé écraserait le détecteur à chaque rechargement de page et l'utilisateur
// retomberait systématiquement en malgache.
const initialLng = (() => {
  try {
    const stored = window.localStorage.getItem('i18nextLng');
    const base = String(stored || '').toLowerCase().split('-')[0];
    return SUPPORTED_LNGS.includes(base) ? base : 'mg';
  } catch {
    return 'mg';
  }
})();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { mg: { translation: mg }, fr: { translation: fr }, en: { translation: en } },
    fallbackLng: 'mg',
    lng: initialLng, // langue mémorisée, ou malgache par défaut
    supportedLngs: SUPPORTED_LNGS,
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage'], caches: ['localStorage'], lookupLocalStorage: 'i18nextLng' },
  });

export default i18n;
