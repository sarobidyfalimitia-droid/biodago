import React from 'react';

/**
 * Item : pagination "intelligente" — plafonne le nombre de boutons affichés
 * (1 … 8 9 10 … 42) au lieu d'un bouton par page, qui devenait ingérable au-delà
 * de quelques pages.
 */
export default function CompactPagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const items = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) items.push('…');
    items.push(p);
    prev = p;
  }

  return (
    <div className="flex justify-center gap-2">
      {items.map((item, i) =>
        item === '…' ? (
          <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-earth-400">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`h-9 w-9 rounded-full text-sm font-semibold ${
              item === page ? 'bg-forest-800 text-parchment-50' : 'bg-white text-earth-600 ring-1 ring-earth-200 hover:bg-forest-50'
            }`}
          >
            {item}
          </button>
        )
      )}
    </div>
  );
}
