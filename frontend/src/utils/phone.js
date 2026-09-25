/**
 * Contrôle du numéro de téléphone — UNE seule règle pour toute l'application.
 *
 * Utilisé par le formulaire d'inscription publique (Register) ET par la création de
 * compte du SuperAdmin : les deux champs doivent accepter exactement les mêmes
 * numéros, sinon un compte créé par le SuperAdmin serait refusé à l'inscription (et
 * inversement). Le backend (AuthController / SuperAdminController) applique la même
 * règle souple de son côté : jamais confiance au frontend seul.
 *
 * Téléphone : AUCUN préfixe ni groupement malgache n'est imposé.
 * Uniquement des chiffres (séparateurs espaces / . / - / _ / ( ) tolérés),
 * 7 à 15 chiffres, avec « + » ou « 00 » facultatif pour l'international.
 * Accepte donc : 034 12 345 67, 0341234567, 034 123 4567, 032 45 678 90,
 * 038 11 222 33, 031 99 888 77, 020 22 000 00, +261 34 12 345 67, 00261341234567…
 */
export const PHONE_SEPARATORS = /[\s.\-/()_]/g;
export const PHONE_REGEX = /^(?:\+|00)?\d{7,15}$/;

export const isPhoneValid = (value) => PHONE_REGEX.test(String(value ?? '').replace(PHONE_SEPARATORS, ''));

// Base homogène : le numéro est enregistré en chiffres, sans espaces ni séparateurs.
// Les formes internationales malgaches (+261…, 00261…, 261…) reviennent à la forme
// locale « 0XXXXXXXXX » ; les autres pays gardent leur « + » initial.
export const normalizePhone = (value) => {
  const cleaned = String(value ?? '').replace(PHONE_SEPARATORS, '');
  if (!cleaned) return '';
  const mg = cleaned.match(/^(?:\+|00)?261(\d{9})$/);
  if (mg) return `0${mg[1]}`;
  if (cleaned.startsWith('+')) return `+${cleaned.replace(/\+/g, '')}`;
  return cleaned;
};

/**
 * Pseudo (nom d'utilisateur) : même règle que côté PHP
 * (`/^[a-zA-Z0-9_.-]{3,50}$/`) — 3 à 50 caractères, lettres/chiffres/./_/-.
 * C'est ce pseudo qui permet ensuite la connexion par pseudo OU par email.
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,50}$/;

export const isUsernameValid = (value) => USERNAME_REGEX.test(String(value ?? '').trim());