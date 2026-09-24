/**
 * Structure finale de la fiche Faune (12 sections, dans l'ordre de consultation/remplissage) :
 * Identification -> Général -> Biométrie -> Aspect visuel -> Anatomie spécifique -> Adaptations
 * -> Écologie -> Santé -> Relation humain -> Madagascar -> Menaces -> Conservation.
 * name / scientific_name / category_id / conservation_status / description / habitat / diet /
 * reproduction / behavior restent gérés à part (champs déjà existants, requis ou avec un
 * composant dédié) — ce fichier couvre les champs ajoutés pour la fiche complète.
 */
export const FAUNA_SECTIONS = [
  {
    title: '🟢 1. Identification',
    fields: [
      { key: 'vernacular_name', label: 'Nom vernaculaire', type: 'text' },
      { key: 'similar_species', label: 'Espèce similaire et différence', type: 'textarea', full: true },
    ],
  },
  {
    title: '📏 3. Biométrie',
    fields: [
      { key: 'size_min', label: 'Longueur / taille — min (cm)', type: 'number' },
      { key: 'size_max', label: 'Longueur / taille — max (cm)', type: 'number' },
      { key: 'size_avg', label: 'Longueur / taille — moyenne (cm)', type: 'number' },
      { key: 'wingspan', label: 'Envergure (cm)', type: 'number' },
      { key: 'weight_min', label: 'Poids — min (g)', type: 'number' },
      { key: 'weight_max', label: 'Poids — max (g)', type: 'number' },
      { key: 'weight_avg', label: 'Poids — moyen (g)', type: 'number' },
      { key: 'sexual_dimorphism', label: 'Dimorphisme sexuel', type: 'textarea', full: true },
    ],
  },
  {
    title: '🎨 4. Aspect visuel',
    fields: [
      { key: 'color', label: 'Couleur (pelage / plumage)', type: 'text' },
      { key: 'texture', label: 'Texture (peau)', type: 'text' },
      { key: 'eye_color', label: 'Couleur des yeux', type: 'text' },
    ],
  },
  {
    title: '🦴 5. Anatomie spécifique',
    fields: [
      { key: 'dentition', label: 'Dentition / bec / pièces buccales', type: 'textarea' },
      { key: 'appendages', label: 'Appendices et membres', type: 'textarea' },
      { key: 'cranial_structures', label: 'Structures crâniennes / ornements', type: 'textarea' },
    ],
  },
  {
    title: '🧬 6. Adaptations',
    fields: [
      { key: 'adaptation', label: 'Adaptation morphologique remarquable', type: 'textarea' },
      { key: 'sensory_organs', label: 'Organes sensoriels spécifiques', type: 'textarea' },
      { key: 'environmental_tolerance', label: 'Tolérance environnementale', type: 'textarea' },
    ],
  },
  {
    title: '🌍 7. Écologie',
    fields: [
      { key: 'lifespan', label: 'Espérance de vie', type: 'text' },
      { key: 'ecological_role', label: 'Rôle écosystémique', type: 'textarea' },
      { key: 'interspecies_competition', label: 'Compétition interspécifique', type: 'textarea' },
      { key: 'migration', label: 'Mouvements migratoires', type: 'textarea' },
      { key: 'seasonal_strategy', label: 'Stratégie hivernale / saisonnière', type: 'textarea' },
      { key: 'circadian_rhythm', label: 'Rythmes circadiens', type: 'textarea' },
    ],
  },
  {
    title: '🦠 8. Santé et microbiologie',
    fields: [
      { key: 'health_status', label: 'Statut de santé / pathologies', type: 'textarea' },
      { key: 'microbiote', label: 'Microbiote spécifique', type: 'textarea' },
      { key: 'parasite_load', label: 'Charge parasitaire', type: 'textarea' },
      { key: 'disease_vector', label: 'Vecteur de maladies / zoonoses', type: 'textarea' },
    ],
  },
  {
    title: "👥 9. Relation avec l'humain",
    fields: [
      { key: 'human_use', label: 'Usage anthropique', type: 'textarea' },
      { key: 'cultural_significance', label: 'Signification traditionnelle / culturelle', type: 'textarea' },
      { key: 'local_community_use', label: 'Utilisation par les communautés locales', type: 'textarea' },
      { key: 'economic_importance', label: 'Importance économique', type: 'textarea' },
      { key: 'medicinal_importance', label: 'Importance médicinale traditionnelle', type: 'textarea' },
    ],
  },
  {
    title: '🇲🇬 10. Importance pour Madagascar',
    fields: [
      { key: 'endemism', label: 'Endémisme', type: 'text' },
      { key: 'protected_area', label: 'Zone ou réserve naturelle', type: 'textarea' },
      { key: 'traditional_knowledge', label: 'Connaissances traditionnelles associées', type: 'textarea' },
      { key: 'regional_name_variations', label: 'Variations régionales du nom', type: 'textarea' },
    ],
  },
  {
    title: '⚠️ 11. Menaces',
    fields: [
      { key: 'habitat_loss', label: "Perte ou destruction de l'habitat", type: 'textarea' },
      { key: 'poaching', label: 'Chasse / braconnage', type: 'textarea' },
      { key: 'pollution', label: 'Pollution', type: 'textarea' },
      { key: 'climate_change', label: 'Changement climatique', type: 'textarea' },
      { key: 'invasive_species', label: 'Espèces invasives', type: 'textarea' },
      { key: 'other_threats', label: 'Autres menaces', type: 'textarea', full: true },
    ],
  },
  {
    title: '🛡️ 12. Conservation',
    fields: [
      { key: 'conservation_measures', label: 'Mesures de conservation', type: 'textarea' },
      { key: 'protection_actions', label: 'Actions de protection existantes', type: 'textarea' },
      { key: 'conservation_programs', label: 'Programmes de conservation', type: 'textarea', full: true },
    ],
  },
];

export const FAUNA_EXTRA_EMPTY = Object.fromEntries(
  FAUNA_SECTIONS.flatMap((s) => s.fields).map((f) => [f.key, ''])
);
