import React from 'react';

/**
 * Affiche, sur la fiche détail publique, les sections de la fiche complète
 * (config faunaFields.js / floraFields.js) — une section n'est affichée que si
 * au moins un de ses champs a été renseigné.
 */
export default function SpeciesDetailSections({ sections, species }) {
  const visibleSections = sections.filter(
    (section) => section.fields.some((f) => species[f.key] !== null && species[f.key] !== undefined && species[f.key] !== '')
  );
  if (visibleSections.length === 0) return null;

  return (
    <div className="mt-4 grid gap-x-10 sm:grid-cols-2">
      {visibleSections.map((section) => {
        const filled = section.fields.filter((f) => species[f.key] !== null && species[f.key] !== undefined && species[f.key] !== '');
        return (
          <div key={section.title} className="mt-8 border-t border-dashed border-earth-300 pt-6">
            <p className="specimen-tag">{section.title}</p>
            <dl className="mt-3 space-y-2 text-sm">
              {filled.map((f) => (
                <div key={f.key}>
                  <dt className="font-semibold text-ink">{f.label}</dt>
                  <dd className="text-earth-700">{species[f.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}
