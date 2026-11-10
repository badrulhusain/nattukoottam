'use client';

import React from 'react';
import { Image as ImageIcon, MapPin, AlertCircle, Camera } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

export const PostComposer: React.FC = () => {
  const { currentUser, language, setIsCreateModalOpen } = useAppStore();
  const t = getT(language);

  return (
    <div
      onClick={() => setIsCreateModalOpen(true)}
      className="bg-white rounded-3xl p-3.5 border border-[#E6EEE8] shadow-2xs hover:border-[#32C878]/50 transition-all cursor-pointer flex items-center gap-3"
    >
      <img
        src={currentUser.avatarUrl}
        alt={currentUser.fullName}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#087A45]/20 flex-shrink-0"
      />

      <div className="flex-1 bg-[#F7FAF7] hover:bg-[#E9F8ED]/40 px-4 py-2.5 rounded-full text-sm text-[#77847C] transition-colors truncate">
        {t.feed.whatToReport}
      </div>

      <div className="flex items-center gap-1 text-[#087A45] pr-1">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#E9F8ED] transition-colors"
          title="Add photo"
        >
          <Camera className="w-5 h-5 text-[#087A45]" />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#E9F8ED] transition-colors"
          title="Detect location"
        >
          <MapPin className="w-5 h-5 text-[#087A45]" />
        </button>
      </div>
    </div>
  );
};

