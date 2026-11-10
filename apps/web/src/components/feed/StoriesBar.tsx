'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { ACTIVE_STORIES_MOCK } from '../../lib/constants';

export const StoriesBar: React.FC = () => {
  const { setLocality, setIsCreateModalOpen } = useAppStore();

  return (
    <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2">
      {ACTIVE_STORIES_MOCK.map((story, idx) => (
        <button
          key={story.id}
          onClick={() => {
            if (idx === 0) {
              setIsCreateModalOpen(true);
            } else {
              setLocality(story.name.split(' ')[0]);
            }
          }}
          className="flex flex-col items-center flex-shrink-0 group"
        >
          <div className="relative">
            <div
              className={`w-14 h-14 rounded-full p-0.5 transition-transform group-hover:scale-105 ${
                idx === 0
                  ? 'border-2 border-dashed border-[#087A45]'
                  : 'bg-gradient-to-tr from-[#087A45] via-[#32C878] to-[#064B2E]'
              }`}
            >
              <img
                src={story.avatar}
                alt={story.name}
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
            {idx === 0 ? (
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#087A45] text-white flex items-center justify-center ring-2 ring-white">
                <Plus className="w-3 h-3 stroke-[3]" />
              </span>
            ) : story.isLive ? (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1 py-0.2 bg-[#E53E3E] text-white text-[9px] font-bold rounded-sm tracking-tight ring-1 ring-white">
                LIVE
              </span>
            ) : null}
          </div>
          <span className="text-[11px] font-medium text-[#17251D] mt-1 truncate max-w-[62px]">
            {story.name}
          </span>
        </button>
      ))}
    </div>
  );
};

