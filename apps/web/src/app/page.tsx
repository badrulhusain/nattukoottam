'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { getT } from '../lib/translations';
import { StoriesBar } from '../components/feed/StoriesBar';
import { PostComposer } from '../components/feed/PostComposer';
import { PostCard } from '../components/feed/PostCard';
import { Flame, Sparkles, Plus } from 'lucide-react';

export default function HomePage() {
  const { posts, language, setIsCreateModalOpen, isAuthenticated, setIsAuthModalOpen } = useAppStore();
  const t = getT(language);

  // Trending & Latest Posts for Home Page (sorted by high community engagement & recent priority)
  const trendingLatestPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const scoreA = (a.supportsCount || 0) * 2 + (a.likesCount || 0) + (a.commentsCount || 0);
      const scoreB = (b.supportsCount || 0) * 2 + (b.likesCount || 0) + (b.commentsCount || 0);
      return scoreB - scoreA;
    });
  }, [posts]);

  return (
    <div className="space-y-4 pb-24 sm:pb-8">
      {/* Instagram-Style Stories Bar */}
      <StoriesBar />

      {/* Quick Post Composer Input */}
      <PostComposer />

      {/* Trending & Latest Issues Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
            <Flame className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-[#17231D]">
              {language === 'ml' ? 'ട്രെൻഡിംഗ് & പുതിയ പ്രശ്നങ്ങൾ' : 'Trending & Latest Issues'}
            </h2>
            <p className="text-[11px] text-[#718078]">
              {language === 'ml'
                ? 'ജനങ്ങളുടെ ഏറ്റവും പുതിയ പരാതികളും പ്രധാന ചർച്ചകളും'
                : 'Real-time updates & civic issues across your community'}
            </p>
          </div>
        </div>
      </div>

      {/* Posts Feed List (Only Trending & Latest Issues) */}
      <div className="space-y-3 pt-0.5">
        {trendingLatestPosts.length > 0 ? (
          trendingLatestPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#E4EBE6] shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF7EF] text-[#16A34A] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#17231D]">{t.feed.emptyFeed}</h4>
              <p className="text-xs text-[#718078] mt-1 max-w-xs mx-auto">
                {t.feed.beFirst}
              </p>
            </div>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true, 'login');
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] transition-colors active-press shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.nav.createPost}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
