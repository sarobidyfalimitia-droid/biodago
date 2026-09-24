import React, { useState } from 'react';
import MadagascarMap from '../maps/MadagascarMap';

/**
 * Un ou plusieurs points GPS, remplissables à la main (champs latitude/longitude
 * éditables) OU en cliquant sur la carte (ajoute une nouvelle ligne automatiquement).
 * Bouton "Ajouter" pour une ligne vide à remplir manuellement.
 */
export default function LocationPointsEditor({ points, onChange }) {
  const [showMap, setShowMap] = useState(false);

  const updateAt = (index, field, value) => {
    const next = [...points];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };
  const addRow = () => onChange([...points, { latitude: '', longitude: '' }]);
  const removeRow = (index) => onChange(points.filter((_, i) => i !== index));
  const addFromMap = (lat, lng) => onChange([...points, { latitude: lat.toFixed(6), longitude: lng.toFixed(6) }]);

  return (
    <div className="space-y-3">
      {points.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="number" step="any" placeholder="Latitude" className="input" value={p.latitude}
            onChange={(e) => updateAt(i, 'latitude', e.target.value)} />
          <input type="number" step="any" placeholder="Longitude" className="input" value={p.longitude}
            onChange={(e) => updateAt(i, 'longitude', e.target.value)} />
          <button type="button" onClick={() => removeRow(i)} className="shrink-0 text-red-500 hover:text-red-700" aria-label="Retirer">
            ×
          </button>
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={addRow} className="text-sm font-semibold text-forest-700 hover:underline">
          + Ajouter un point (à la main)
        </button>
        <button type="button" onClick={() => setShowMap((s) => !s)} className="text-sm font-semibold text-baobab-700 hover:underline">
          {showMap ? 'Masquer la carte' : '🗺️ Ou cliquer sur la carte'}
        </button>
      </div>

      {showMap && (
        <div className="overflow-hidden rounded-2xl border border-earth-200">
          <MadagascarMap
            pickedPoints={points.filter((p) => p.latitude && p.longitude)}
            onMapClick={addFromMap}
            onRemovePoint={removeRow}
            layer="fauna"
            height={280}
            showLegend={false}
          />
        </div>
      )}
    </div>
  );
}
