'use client';

import React from 'react';
import { Plus, Radio } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { ACTIVE_STORIES_MOCK } from '../../lib/constants';

export const StoriesBar: React.FC = () => {
  const { setLocality, setIsCreateModalOpen, currentLocality, language } = useAppStore();

  const circles = [
    {
      id: 'you',
      name: language === 'ml' ? 'നിങ്ങൾ' : 'You',
      subtitle: language === 'ml' ? 'പങ്കുവെക്കൂ' : 'Share',
      avatar: ACTIVE_STORIES_MOCK[0]?.avatar,
      isUser: true,
      hasUpdate: false,
    },
    {
      id: 'kakkanad',
      name: 'Kakkanad',
      subtitle: '18 reports',
      avatar: ACTIVE_STORIES_MOCK[1]?.avatar,
      isLive: true,
      hasUpdate: true,
    },
    {
      id: 'aluva',
      name: 'Aluva',
      subtitle: '9 reports',
      avatar: ACTIVE_STORIES_MOCK[2]?.avatar,
      isLive: false,
      hasUpdate: true,
    },
    {
      id: 'perinthalmanna',
      name: 'Perinthalmanna',
      subtitle: '14 reports',
      avatar: ACTIVE_STORIES_MOCK[3]?.avatar,
      isLive: true,
      hasUpdate: true,
    },
    {
      id: 'kozhikode',
      name: 'Kozhikode',
      subtitle: '22 reports',
      avatar: ACTIVE_STORIES_MOCK[4]?.avatar,
      isLive: false,
      hasUpdate: false,
    },
    {
      id: 'fortkochi',
      name: 'Fort Kochi',
      subtitle: '6 reports',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      isLive: false,
      hasUpdate: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-3 border border-[#E4EBE6] shadow-2xs">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[11px] font-bold text-[#718078] uppercase tracking-wider flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>{language === 'ml' ? 'സജീവ വാർഡ് കൂട്ടായ്മകൾ' : 'Active Ward Circles'}</span>
        </span>
        <span className="text-[10px] text-[#718078]">
          {language === 'ml' ? 'സമീപ പ്രദേശങ്ങൾ' : 'Tap to switch locality'}
        </span>
      </div>

      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
        {circles.map((circle) => {
          const isSelected = currentLocality.toLowerCase() === circle.name.toLowerCase();

          return (
            <button
              key={circle.id}
              onClick={() => {
                if (circle.isUser) {
                  setIsCreateModalOpen(true);
                } else {
                  setLocality(circle.name);
                }
              }}
              className="flex flex-col items-center flex-shrink-0 group focus:outline-none transition-transform"
            >
              <div className="relative">
                {/* Avatar Frame */}
                <div
                  className={`w-13 h-13 rounded-full p-0.5 transition-all group-hover:scale-105 active-press ${
                    circle.isUser
                      ? 'border-2 border-dashed border-[#16A34A]/70 bg-transparent'
                      : isSelected
                      ? 'ring-2 ring-[#16A34A] ring-offset-2 ring-offset-white'
                      : circle.hasUpdate
                      ? 'ring-2 ring-[#16A34A]/50 ring-offset-1'
                      : 'border border-[#E4EBE6]'
                  }`}
                >
                  <img
                    src={circle.avatar}
                    alt={circle.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                {/* Sub-badge: Add (+) or Live Dot */}
                {circle.isUser ? (
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center ring-2 ring-white shadow-xs">
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : circle.isLive ? (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#DC2626] text-white text-[8px] font-extrabold rounded-full tracking-wide ring-1.5 ring-white uppercase shadow-xs">
                    Live
                  </span>
                ) : null}
              </div>

              {/* Circle Labels */}
              <span
                className={`text-[11px] mt-1.5 truncate max-w-[68px] leading-tight ${
                  isSelected ? 'font-bold text-[#16A34A]' : 'font-medium text-[#17231D]'
                }`}
              >
                {circle.name}
              </span>
              <span className="text-[9px] text-[#718078] truncate max-w-[68px] leading-none">
                {circle.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
