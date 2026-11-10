'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

const CATEGORY_KEYS = [
  'all',
  'ROAD_TRANSPORT',
  'WATER_SUPPLY',
  'ELECTRICITY',
  'DRAINAGE',
  'WASTE_MANAGEMENT',
  'PUBLIC_SAFETY',
  'HEALTH_SANITATION',
] as const;

export const CategoryBar: React.FC = () => {
  const { activeCategory, setActiveCategory, language } = useAppStore();
  const t = getT(language);

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {CATEGORY_KEYS.map((catKey) => {
        const label = t.categories[catKey as keyof typeof t.categories] || catKey;
        const isActive = activeCategory === catKey;

        return (
          <button
            key={catKey}
            onClick={() => setActiveCategory(catKey)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#087A45] text-white shadow-xs'
                : 'bg-white text-[#17251D] border border-[#E6EEE8] hover:bg-[#E9F8ED]/60'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

