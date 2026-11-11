'use client';

import React, { useMemo } from 'react';
import { Plus, Camera, Sparkles } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { UserAvatar } from '../ui/UserAvatar';
import { UserStory } from '../../types';

export const StoriesBar: React.FC = () => {
  const {
    stories,
    openStoryViewer,
    setIsAddStoryOpen,
    currentUser,
    language,
    posts,
    isAuthenticated,
    setIsAuthModalOpen,
  } = useAppStore();

  // Combine user stories and any live community post stories
  const displayStories: UserStory[] = useMemo(() => {
    const combined: UserStory[] = [...stories];

    // If there are community posts with photos, automatically aggregate them as ward stories
    posts.forEach((post) => {
      if (post.mediaUrls && post.mediaUrls.length > 0) {
        // Check if author already exists in combined
        const existing = combined.find((s) => s.userId === post.author.id);
        if (existing) {
          const alreadyHas = existing.stories.some((st) => st.id === post.id);
          if (!alreadyHas) {
            existing.stories.push({
              id: post.id,
              mediaUrl: post.mediaUrls[0],
              caption: post.content.slice(0, 100),
              createdAt: post.createdAt,
              locality: post.locality,
            });
          }
        } else {
          combined.push({
            userId: post.author.id,
            userName: post.author.fullName,
            userAvatar: post.author.avatarUrl,
            locality: post.locality,
            hasUnseen: true,
            stories: [
              {
                id: post.id,
                mediaUrl: post.mediaUrls[0],
                caption: post.content.slice(0, 100),
                createdAt: post.createdAt,
                locality: post.locality,
              },
            ],
          });
        }
      }
    });

    return combined;
  }, [stories, posts]);

  // Find if current user has an active story
  const myStoryIndex = displayStories.findIndex((s) => s.userId === currentUser.id);
  const myStory = myStoryIndex >= 0 ? displayStories[myStoryIndex] : null;

  return (
    <div className="bg-white rounded-2xl p-3 border border-[#E4EBE6] shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[11px] font-bold text-[#17251D] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-lg bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-2xs">
            <Camera className="w-3 h-3" />
          </span>
          <span className="font-extrabold text-xs">
            {language === 'ml' ? 'സ്റ്റോറികൾ' : 'Stories'}
          </span>
        </span>
        <button
          onClick={() => {
            if (!isAuthenticated) {
              setIsAuthModalOpen(true, 'login');
            } else {
              setIsAddStoryOpen(true);
            }
          }}
          className="text-[11px] text-[#16A34A] hover:text-[#15803D] font-bold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{language === 'ml' ? 'സ്റ്റോറി ചേർക്കുക' : 'Add Story'}</span>
        </button>
      </div>

      {/* Stories Scroll Container */}
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
        {/* User Story Circle (Your Story / Add Story) */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => {
                if (myStory && myStoryIndex >= 0) {
                  openStoryViewer(myStoryIndex);
                } else if (!isAuthenticated) {
                  setIsAuthModalOpen(true, 'login');
                } else {
                  setIsAddStoryOpen(true);
                }
              }}
              className="group focus:outline-none transition-transform"
              title={myStory ? 'View your story' : 'Add your story'}
            >
              <div
                className={`w-14 h-14 rounded-full p-0.5 transition-all group-hover:scale-105 active-press ${
                  myStory
                    ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-emerald-500 shadow-xs'
                    : 'border-2 border-dashed border-[#16A34A]/80 p-0.5'
                }`}
              >
                <div className="w-full h-full rounded-full p-0.5 bg-white">
                  <UserAvatar
                    src={currentUser.avatarUrl}
                    name={currentUser.fullName}
                    size="md"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </button>

            {/* Quick Add Plus Badge */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true, 'login');
                } else {
                  setIsAddStoryOpen(true);
                }
              }}
              className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center justify-center ring-2 ring-white shadow-xs transition-transform hover:scale-110 active-press cursor-pointer"
              title="Add to story"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          </div>

          <span className="text-[11px] mt-1.5 truncate max-w-[68px] leading-tight font-semibold text-[#17231D]">
            {language === 'ml' ? 'നിങ്ങൾ' : 'Your story'}
          </span>
          <span className="text-[9px] text-[#718078] truncate max-w-[68px] leading-none">
            {myStory ? (language === 'ml' ? 'കാണുക' : 'Active') : (language === 'ml' ? 'ചേർക്കുക' : 'Add')}
          </span>
        </div>

        {/* Other Citizen Stories */}
        {displayStories
          .filter((story) => story.userId !== currentUser.id)
          .map((story) => {
            const actualIndex = displayStories.findIndex((s) => s.userId === story.userId);

            return (
              <button
                key={story.userId}
                onClick={() => openStoryViewer(actualIndex)}
                className="flex flex-col items-center flex-shrink-0 group focus:outline-none transition-transform"
                title={`View ${story.userName}'s story`}
              >
                <div className="relative">
                  {/* Instagram Multi-Color Gradient Ring */}
                  <div
                    className={`w-14 h-14 rounded-full p-0.5 transition-all group-hover:scale-105 active-press ${
                      story.hasUnseen
                        ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-xs'
                        : 'bg-zinc-300'
                    }`}
                  >
                    <div className="w-full h-full rounded-full p-0.5 bg-white">
                      <UserAvatar
                        src={story.userAvatar}
                        name={story.userName}
                        size="md"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>

                <span className="text-[11px] mt-1.5 truncate max-w-[68px] leading-tight font-medium text-[#17231D]">
                  {story.userName.split(' ')[0]}
                </span>
                <span className="text-[9px] text-[#718078] truncate max-w-[68px] leading-none">
                  {story.locality}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
};
