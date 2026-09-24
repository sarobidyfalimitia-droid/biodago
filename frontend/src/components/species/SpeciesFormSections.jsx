import React from 'react';

/**
 * Affiche une liste de sections de champs (config faunaFields.js / floraFields.js)
 * sous forme de sous-formulaires repliables visuellement séparés par section, dans
 * l'ordre logique de remplissage/consultation de la fiche.
 */
export default function SpeciesFormSections({ sections, form, set }) {
  return (
    <>
      {sections.map((section) => (
        <div
          key={section.title}
          className="sm:col-span-2 grid gap-3 border-t border-earth-100 pt-4 mt-2 sm:grid-cols-2"
        >
          <p className="specimen-tag sm:col-span-2">{section.title}</p>
          {section.fields.map((f) => {
            const value = form[f.key] ?? '';
            const className = `input ${f.full ? 'sm:col-span-2' : ''}`;
            if (f.type === 'textarea') {
              return (
                <textarea key={f.key} placeholder={f.label} className={className} value={value} onChange={set(f.key)} />
              );
            }
            return (
              <input
                key={f.key}
                type={f.type === 'number' ? 'number' : 'text'}
                step={f.type === 'number' ? '0.01' : undefined}
                placeholder={f.label}
                className={className}
                value={value}
                onChange={set(f.key)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}
