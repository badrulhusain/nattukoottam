'use client';

import React from 'react';
import { Plus, Radio, MapPin } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { KERALA_LOCALITIES } from '../../lib/constants';
import { UserAvatar } from '../ui/UserAvatar';

export const StoriesBar: React.FC = () => {
  const { setLocality, setIsCreateModalOpen, currentLocality, language, currentUser, posts } = useAppStore();

  const wardCircles = KERALA_LOCALITIES.slice(0, 6).map((loc) => {
    const postCount = posts.filter(
      (p) => p.locality.toLowerCase() === loc.name.toLowerCase()
    ).length;

    return {
      id: loc.name.toLowerCase(),
      name: loc.name,
      subtitle:
        postCount > 0
          ? `${postCount} ${language === 'ml' ? 'റിപ്പോർട്ടുകൾ' : 'reports'}`
          : language === 'ml'
          ? 'വാർഡ്'
          : 'Ward',
      hasUpdate: postCount > 0,
      initials: loc.name.slice(0, 2).toUpperCase(),
    };
  });

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
        {/* User's Circle (Create / Share) */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col items-center flex-shrink-0 group focus:outline-none transition-transform"
        >
          <div className="relative">
            <div className="w-13 h-13 rounded-full p-0.5 border-2 border-dashed border-[#16A34A]/70 bg-transparent transition-all group-hover:scale-105 active-press">
              <UserAvatar
                src={currentUser.avatarUrl}
                name={currentUser.fullName}
                size="md"
                className="w-full h-full"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center ring-2 ring-white shadow-xs">
              <Plus className="w-3 h-3 stroke-[3]" />
            </span>
          </div>
          <span className="text-[11px] mt-1.5 truncate max-w-[68px] leading-tight font-medium text-[#17231D]">
            {language === 'ml' ? 'നിങ്ങൾ' : 'You'}
          </span>
          <span className="text-[9px] text-[#718078] truncate max-w-[68px] leading-none">
            {language === 'ml' ? 'പങ്കുവെക്കൂ' : 'Share'}
          </span>
        </button>

        {/* Dynamic Ward Circles (Zero dummy data) */}
        {wardCircles.map((circle) => {
          const isSelected = currentLocality.toLowerCase() === circle.name.toLowerCase();

          return (
            <button
              key={circle.id}
              onClick={() => setLocality(circle.name)}
              className="flex flex-col items-center flex-shrink-0 group focus:outline-none transition-transform"
            >
              <div className="relative">
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center text-xs font-black transition-all group-hover:scale-105 active-press select-none ${
                    isSelected
                      ? 'bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white ring-2 ring-[#16A34A] ring-offset-2 ring-offset-white shadow-xs'
                      : circle.hasUpdate
                      ? 'bg-[#EAF7EF] text-[#16A34A] border border-[#D1EBD9] ring-2 ring-[#16A34A]/30'
                      : 'bg-[#F8FAF8] text-[#718078] border border-[#E4EBE6]'
                  }`}
                >
                  <span>{circle.initials}</span>
                </div>
                {circle.hasUpdate && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#16A34A] ring-1.5 ring-white shadow-2xs" />
                )}
              </div>

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
