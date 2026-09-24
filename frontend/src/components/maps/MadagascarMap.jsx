import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const MADAGASCAR_CENTER = [-19.0, 46.8];

const faunaIcon = L.divIcon({
  className: '',
  html: '<div style="background:#9e4f18;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 1px #9e4f18"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Marqueur Flore — vert, distinct de la Faune (marron), même principe : un simple point.
const floraIcon = L.divIcon({
  className: '',
  html: '<div style="background:#367d50;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 1px #367d50"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const pickerIcon = L.divIcon({
  className: '',
  html: '<div style="background:#c2661d;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

/** Capte les clics sur le fond de carte (utilisé en mode sélection de points). */
function ClickCatcher({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Carte réutilisable de Madagascar.
 * Faune ET Flore fonctionnent désormais à l'identique : uniquement des marqueurs
 * ponctuels (plus de polygones/rectangles de régions — la région est une simple
 * étiquette texte, sans représentation cartographique).
 * - `faunaMarkers` : points Faune (marron), tooltip au survol.
 * - `floraMarkers` : points Flore (vert), tooltip au survol.
 * - Mode sélection (formulaires) : `onMapClick` ajoute un point, cliquer un point
 *   existant (`pickedPoints`) le supprime.
 * - Zoom molette toujours actif, `minZoom` pour rester centré sur Madagascar.
 */
export default function MadagascarMap({
  faunaMarkers = [],
  floraMarkers = [],
  singlePoint = null,
  height = 480,
  zoom = 6,
  showLegend = true,
  layer = 'all', // 'all' | 'fauna' | 'flora' — filtre sur la carte générale
  onMapClick = null,
  pickedPoints = [],
  onRemovePoint = null,
}) {
  const showFlora = layer === 'all' || layer === 'flora';
  const showFauna = layer === 'all' || layer === 'fauna';

  const center = singlePoint ? [singlePoint.latitude, singlePoint.longitude] : MADAGASCAR_CENTER;

  return (
    <div>
      <MapContainer
        center={center}
        zoom={singlePoint ? 8 : zoom}
        minZoom={5}
        style={{ height, width: '100%' }}
        scrollWheelZoom
        className="leaflet-map-leaf-cursor"
      >
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {onMapClick && <ClickCatcher onMapClick={onMapClick} />}

        {showFauna && faunaMarkers.filter((m) => m.latitude && m.longitude).map((m) => (
          <Marker key={`fauna-${m.id ?? `${m.latitude}-${m.longitude}`}`} position={[Number(m.latitude), Number(m.longitude)]} icon={faunaIcon}>
            <Tooltip direction="top" offset={[0, -8]}>
              <span className="font-semibold">{m.name}</span>
              {m.family && <><br /><span className="italic">{m.family}</span></>}
            </Tooltip>
            <Popup>{m.name}</Popup>
          </Marker>
        ))}

        {showFlora && floraMarkers.filter((m) => m.latitude && m.longitude).map((m) => (
          <Marker key={`flora-${m.id ?? `${m.latitude}-${m.longitude}`}`} position={[Number(m.latitude), Number(m.longitude)]} icon={floraIcon}>
            <Tooltip direction="top" offset={[0, -8]}>
              <span className="font-semibold">{m.name}</span>
              {m.family && <><br /><span className="italic">{m.family}</span></>}
            </Tooltip>
            <Popup>{m.name}</Popup>
          </Marker>
        ))}

        {/* Points en cours de sélection dans un formulaire (cliquables pour suppression) */}
        {pickedPoints.map((p, i) => (
          <Marker
            key={`picked-${i}`}
            position={[Number(p.latitude), Number(p.longitude)]}
            icon={pickerIcon}
            eventHandlers={{ click: () => onRemovePoint?.(i) }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]}>Cliquer pour retirer</Tooltip>
          </Marker>
        ))}

        {singlePoint && (
          <Marker position={[Number(singlePoint.latitude), Number(singlePoint.longitude)]} icon={faunaIcon}>
            <Popup>{singlePoint.label}</Popup>
          </Marker>
        )}
      </MapContainer>

      {showLegend && (
        <div className="mt-3 flex flex-wrap items-center gap-5 rounded-2xl border border-earth-200 bg-white px-4 py-2.5 text-xs text-earth-600">
          {showFauna && <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-baobab-700" /> Localisations — Faune</span>}
          {showFlora && <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-forest-700" /> Localisations — Flore</span>}
        </div>
      )}
    </div>
  );
}