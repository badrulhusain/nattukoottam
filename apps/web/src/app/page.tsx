'use client';

import React, { useMemo, useState } from 'react';
import { useAppStore } from '../lib/store';
import { getT } from '../lib/translations';
import { StoriesBar } from '../components/feed/StoriesBar';
import { PostComposer } from '../components/feed/PostComposer';
import { PostCard } from '../components/feed/PostCard';
import { CivicAssistantModal } from '../components/ai/CivicAssistantModal';
import { Flame, Sparkles, Plus, Bot } from 'lucide-react';

export default function HomePage() {
  const { posts, language, setIsCreateModalOpen, isAuthenticated, setIsAuthModalOpen } = useAppStore();
  const t = getT(language);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

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

      {/* AI Civic Assistant ("Ask About Your Area") Trigger Card */}
      <div className="p-3.5 bg-gradient-to-r from-[#17231D] via-[#1E3027] to-[#14532D] rounded-2xl text-white shadow-xs border border-white/10 flex items-center justify-between gap-3 animate-in fade-in">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-white">
                {language === 'ml' ? 'AI പൗരസഹായിയോട് ചോദിക്കൂ' : 'Ask AI Civic Assistant'}
              </span>
              <span className="text-[9px] bg-white/20 text-emerald-200 px-1.5 py-0.2 rounded font-mono">
                Groq RAG
              </span>
            </div>
            <p className="text-[11px] text-white/80 truncate">
              {language === 'ml'
                ? 'വാർഡിലെ റോഡ് പണികൾ, കുടിവെള്ളം, കറന്റ് തടസ്സങ്ങൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കാം'
                : 'Ask about local road works, pipe bursts, power outages & projects'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAiAssistantOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#17231D] font-extrabold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer flex-shrink-0"
        >
          {language === 'ml' ? 'ചോദിക്കുക' : 'Ask AI'}
        </button>
      </div>

      {/* AI Civic Assistant Modal */}
      <CivicAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      {/* Trending & Latest Issues Header */}
      {/* <div className="flex items-center justify-between px-1 pt-1">
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
      </div> */}

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
