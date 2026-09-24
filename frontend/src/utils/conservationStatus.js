/**
 * Item : sigles UICN (LC, VU, EN...) affichés en toutes lettres plutôt qu'en
 * abréviation seule, partout dans l'application (fiches, formulaires, PDF).
 */
export const CONSERVATION_STATUSES = [
  { code: 'LC', label: 'Préoccupation mineure (LC)', short: 'Préoccupation mineure' },
  { code: 'NT', label: 'Quasi menacée (NT)', short: 'Quasi menacée' },
  { code: 'VU', label: 'Vulnérable (VU)', short: 'Vulnérable' },
  { code: 'EN', label: 'En danger (EN)', short: 'En danger' },
  { code: 'CR', label: 'En danger critique (CR)', short: 'En danger critique' },
  { code: 'EW', label: 'Éteinte à l\'état sauvage (EW)', short: 'Éteinte à l\'état sauvage' },
  { code: 'EX', label: 'Éteinte (EX)', short: 'Éteinte' },
  { code: 'DD', label: 'Données insuffisantes (DD)', short: 'Données insuffisantes' },
];

const BY_CODE = Object.fromEntries(CONSERVATION_STATUSES.map((s) => [s.code, s]));

export function conservationStatusLabel(code) {
  return BY_CODE[code]?.short ?? code ?? 'Non renseigné';
}
