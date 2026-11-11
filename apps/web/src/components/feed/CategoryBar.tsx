'use client';

import React from 'react';
import {
  Layers,
  Car,
  Droplets,
  Zap,
  Waves,
  Trash2,
  ShieldAlert,
  HeartPulse,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

const CATEGORIES = [
  { key: 'all', icon: Layers },
  { key: 'ROAD_TRANSPORT', icon: Car },
  { key: 'WATER_SUPPLY', icon: Droplets },
  { key: 'ELECTRICITY', icon: Zap },
  { key: 'DRAINAGE', icon: Waves },
  { key: 'WASTE_MANAGEMENT', icon: Trash2 },
  { key: 'PUBLIC_SAFETY', icon: ShieldAlert },
  { key: 'HEALTH_SANITATION', icon: HeartPulse },
] as const;

export const CategoryBar: React.FC = () => {
  const { activeCategory, setActiveCategory, language } = useAppStore();
  const t = getT(language);

  return (
    <div className="relative py-1">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {CATEGORIES.map(({ key, icon: Icon }) => {
          const label = t.categories[key as keyof typeof t.categories] || key;
          const isActive = activeCategory === key;

          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active-press ${
                isActive
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'bg-white text-[#718078] hover:text-[#17231D] border border-[#E4EBE6] hover:border-[#D0DBD3]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
