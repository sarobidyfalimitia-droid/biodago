import React from 'react';

/**
 * Répartition réelle des fiches du site entre Faune et Flore (donut SVG, données live).
 */
export default function FaunaFloraSplitChart({ totalFauna = 0, totalFlora = 0 }) {
  const total = totalFauna + totalFlora;
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const faunaShare = total > 0 ? (totalFauna / total) * 100 : 0;
  const dash = (faunaShare / 100) * circumference;

  return (
    <div className="rounded-[2rem] border border-earth-100 bg-white p-6 shadow-sm">
      <p className="specimen-tag">Fiche 01</p>
      <h3 className="mt-1 font-display text-xl font-semibold text-ink">Faune vs Flore sur la plateforme</h3>

      <div className="mt-6 flex flex-col items-center">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Répartition Faune vs Flore">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="white" stroke="#367d50" strokeWidth={strokeWidth} />
          {total > 0 && (
            <circle
              cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#9e4f18" strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )}
          <text x="50%" y="47%" textAnchor="middle" fontSize="28" fontWeight="700" fill="#182015" fontFamily="Fraunces, serif">
            {total}
          </text>
          <text x="50%" y="60%" textAnchor="middle" fontSize="11" fill="#524232" letterSpacing="0.06em">
            FICHES AU TOTAL
          </text>
        </svg>

        <div className="mt-5 flex items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-2"><span className="h-3 w-3" style={{ background: '#9e4f18' }} /> Faune ({totalFauna})</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3" style={{ background: '#367d50' }} /> Flore ({totalFlora})</span>
        </div>
      </div>
    </div>
  );
}
