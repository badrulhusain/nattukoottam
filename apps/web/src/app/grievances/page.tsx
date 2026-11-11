'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { CategoryBar } from '../../components/feed/CategoryBar';
import { PostCard } from '../../components/feed/PostCard';
import { AlertCircle, Plus } from 'lucide-react';

export default function GrievancesPage() {
  const {
    posts,
    activeCategory,
    feedFilter,
    setFeedFilter,
    currentLocality,
    language,
    setIsCreateModalOpen,
    isAuthenticated,
    setIsAuthModalOpen,
  } = useAppStore();
  const t = getT(language);

  // Grievances filtered by category and feed filter
  const filteredGrievances = useMemo(() => {
    let list = posts.filter((p) => p.isInfrastructureIssue || p.urgency);

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (feedFilter === 'nearby') {
      list = list.filter(
        (p) => p.locality?.toLowerCase() === currentLocality.toLowerCase()
      );
    } else if (feedFilter === 'trending') {
      list = [...list].sort(
        (a, b) => (b.supportsCount || 0) - (a.supportsCount || 0)
      );
    }

    return list;
  }, [posts, activeCategory, feedFilter, currentLocality]);

  return (
    <div className="space-y-4 pb-24 sm:pb-8">
      {/* Grievances Page Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4EBE6] shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#17231D] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span>{t.nav.grievances}</span>
          </h2>
          <p className="text-xs text-[#718078] mt-0.5">
            {language === 'ml'
              ? `${currentLocality} വാർഡിൽ റിപ്പോർട്ട് ചെയ്യപ്പെട്ട പ്രശ്നങ്ങൾ`
              : `Active citizen grievances in ${currentLocality}`}
          </p>
        </div>
        <span className="text-xs font-bold text-[#16A34A] bg-[#EAF7EF] border border-[#D1EBD9] px-3 py-1 rounded-full">
          {currentLocality}
        </span>
      </div>

      {/* Feed Mode Tabs (For You / Nearby / Following / Trending) */}
      <div className="bg-white rounded-2xl p-1 border border-[#E4EBE6] shadow-2xs flex items-center justify-between">
        {(['forYou', 'nearby', 'following', 'trending'] as const).map((filter) => {
          const isActive = feedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setFeedFilter(filter)}
              className={`flex-1 py-2 px-2 text-xs font-semibold capitalize rounded-xl transition-all active-press ${
                isActive
                  ? 'bg-[#EAF7EF] text-[#16A34A] font-bold shadow-2xs border border-[#D1EBD9]'
                  : 'text-[#718078] hover:text-[#17231D]'
              }`}
            >
              {t.feed[filter]}
            </button>
          );
        })}
      </div>

      {/* Category Filter Pills Bar (All, Road & Transport, Water Supply...) */}
      <CategoryBar />

      {/* Grievance Posts List */}
      <div className="space-y-3">
        {filteredGrievances.length > 0 ? (
          filteredGrievances.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#E4EBE6] shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#17231D]">
                {language === 'ml'
                  ? 'തിരഞ്ഞെടുത്ത വിഭാഗത്തിൽ പരാതികളൊന്നുമില്ല'
                  : 'No grievances in this category'}
              </h4>
              <p className="text-xs text-[#718078] mt-1 max-w-xs mx-auto">
                {language === 'ml'
                  ? 'ഈ വിഷയത്തിൽ പുതിയ പരാതി രേഖപ്പെടുത്താൻ താഴെ ക്ലിക്ക് ചെയ്യുക.'
                  : 'Be the first to report an infrastructure or civic issue in your ward.'}
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

