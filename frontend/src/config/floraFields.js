/**
 * Même structure en 12 sections que la Faune (voir faunaFields.js), avec les champs
 * propres à la Flore (hauteur/diamètre plutôt que poids, feuilles/racines/fleurs,
 * floraison/fructification/pollinisateurs/sol, comestibilité, récolte excessive...).
 */
export const FLORA_SECTIONS = [
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
      { key: 'height_min', label: 'Hauteur — min (m)', type: 'number' },
      { key: 'height_max', label: 'Hauteur — max (m)', type: 'number' },
      { key: 'height_avg', label: 'Hauteur — moyenne (m)', type: 'number' },
      { key: 'canopy_diameter', label: 'Diamètre du feuillage (m)', type: 'number' },
    ],
  },
  {
    title: '🎨 4. Aspect visuel',
    fields: [
      { key: 'color', label: 'Couleur (fleurs / feuillage)', type: 'text' },
      { key: 'texture', label: 'Texture (écorce / feuilles)', type: 'text' },
    ],
  },
  {
    title: '🌱 5. Anatomie spécifique',
    fields: [
      { key: 'leaf_type', label: 'Type de feuilles', type: 'textarea' },
      { key: 'root_type', label: 'Type de racines', type: 'textarea' },
      { key: 'flower_type', label: 'Type de fleurs', type: 'textarea' },
    ],
  },
  {
    title: '🧬 6. Adaptations',
    fields: [
      { key: 'adaptation', label: 'Adaptation morphologique remarquable', type: 'textarea' },
      { key: 'environmental_tolerance', label: 'Tolérance environnementale', type: 'textarea' },
    ],
  },
  {
    title: '🌍 7. Écologie',
    fields: [
      { key: 'lifespan', label: 'Espérance de vie', type: 'text' },
      { key: 'ecological_role', label: 'Rôle écosystémique', type: 'textarea' },
      { key: 'interspecies_competition', label: 'Compétition interspécifique', type: 'textarea' },
      { key: 'seasonal_strategy', label: 'Dormance / cycle de floraison', type: 'textarea' },
      { key: 'flowering_season', label: 'Saison de floraison', type: 'text' },
      { key: 'fruiting_season', label: 'Saison de fructification', type: 'text' },
      { key: 'pollinators', label: 'Pollinisateurs connus', type: 'textarea' },
      { key: 'soil_type', label: 'Type de sol préféré', type: 'textarea' },
      { key: 'growth_rate', label: 'Vitesse de croissance', type: 'text' },
      { key: 'maturity_age', label: 'Âge de maturité', type: 'text' },
    ],
  },
  {
    title: '🦠 8. Santé et microbiologie',
    fields: [
      { key: 'health_status', label: 'Statut de santé / maladies de la plante', type: 'textarea' },
      { key: 'microbiote', label: 'Microbiote spécifique (mycorhizes / symbioses)', type: 'textarea' },
      { key: 'parasite_load', label: 'Charge parasitaire (ravageurs)', type: 'textarea' },
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
      { key: 'edibility', label: 'Comestibilité', type: 'text' },
      { key: 'edible_parts', label: 'Parties comestibles', type: 'textarea' },
      { key: 'toxic_parts', label: 'Parties toxiques / dangereuses', type: 'textarea' },
      { key: 'traditional_medicinal_uses', label: 'Usages médicinaux traditionnels', type: 'textarea' },
      { key: 'food_uses', label: 'Usages alimentaires', type: 'textarea' },
      { key: 'craft_uses', label: 'Usages artisanaux', type: 'textarea' },
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
      { key: 'overharvesting', label: 'Exploitation / récolte excessive', type: 'textarea' },
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

export const FLORA_EXTRA_EMPTY = Object.fromEntries(
  FLORA_SECTIONS.flatMap((s) => s.fields).map((f) => [f.key, ''])
);
