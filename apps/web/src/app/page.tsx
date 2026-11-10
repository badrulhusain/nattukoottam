'use client';

import React from 'react';
import { useAppStore } from '../lib/store';
import { getT } from '../lib/translations';
import { AppHeader } from '../components/layout/AppHeader';
import { BottomNav } from '../components/layout/BottomNav';
import { DesktopSidebar } from '../components/layout/DesktopSidebar';
import { RightSidebar } from '../components/layout/RightSidebar';
import { PostComposer } from '../components/feed/PostComposer';
import { CategoryBar } from '../components/feed/CategoryBar';
import { StoriesBar } from '../components/feed/StoriesBar';
import { PostCard } from '../components/feed/PostCard';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import { CreatePostModal } from '../components/create/CreatePostModal';
import { UserProfileView } from '../components/profile/UserProfileView';
import { OfficialPortalView } from '../components/official/OfficialPortalView';
import { DiscoverMapView } from '../components/map/DiscoverMapView';
import { NotificationsView } from '../components/notifications/NotificationsView';

export default function Home() {
  const {
    activeTab,
    feedFilter,
    setFeedFilter,
    posts,
    activeCategory,
    currentLocality,
    language,
  } = useAppStore();
  const t = getT(language);

  // Filter posts based on activeCategory
  const filteredPosts = posts.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-[#F7FAF7] text-[#17251D] flex flex-col">
      {/* Top Application Header */}
      <AppHeader />

      {/* Main 3-Column Responsive Shell */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex justify-center">
        {/* Left Column: Desktop Navigation Sidebar */}
        <DesktopSidebar />

        {/* Center Column: Social Feed & Dynamic Views */}
        <main className="w-full max-w-2xl px-3 sm:px-6 py-4 flex-1">
          {activeTab === 'home' && (
            <div className="space-y-4 pb-20 sm:pb-8">
              {/* Active Community Circles (Inspired by Reference Image 2) */}
              <StoriesBar />

              {/* Quick Post Composer Input (Inspired by Reference Image 1) */}
              <PostComposer />

              {/* Feed Mode Tabs (For You / Nearby / Following / Trending) */}
              <div className="flex items-center justify-between border-b border-[#E6EEE8] px-1 pt-1">
                {(['forYou', 'nearby', 'following', 'trending'] as const).map((filter) => {
                  const isActive = feedFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setFeedFilter(filter)}
                      className={`pb-2.5 px-2 text-xs font-semibold capitalize transition-all border-b-2 -mb-[1px] ${
                        isActive
                          ? 'border-[#087A45] text-[#087A45]'
                          : 'border-transparent text-[#77847C] hover:text-[#17251D]'
                      }`}
                    >
                      {t.feed[filter]}
                    </button>
                  );
                })}
              </div>

              {/* Category Filter Pills Bar */}
              <CategoryBar />

              {/* Posts Feed List */}
              <div className="space-y-3.5 pt-1">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <div className="bg-white rounded-3xl p-8 text-center border border-[#E6EEE8] space-y-2">
                    <p className="text-sm font-semibold text-[#17251D]">{t.feed.emptyFeed}</p>
                    <p className="text-xs text-[#77847C]">{t.feed.beFirst}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'grievances' && (
            <div className="space-y-4 pb-20 sm:pb-8">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-[#17251D]">{t.nav.grievances}</h2>
                <span className="text-xs text-[#087A45] font-semibold">{currentLocality}</span>
              </div>
              <CategoryBar />
              <div className="space-y-3.5">
                {filteredPosts
                  .filter((p) => p.isInfrastructureIssue)
                  .map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'discover' && <DiscoverMapView />}

          {activeTab === 'notifications' && <NotificationsView />}

          {activeTab === 'profile' && <UserProfileView />}

          {activeTab === 'official' && <OfficialPortalView />}
        </main>

        {/* Right Column: Conflict Engine Alert & Civic Pulse Widgets */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Dock Navigation */}
      <BottomNav />

      {/* Onboarding Welcome Screen (Center Phone in Image 1) */}
      <OnboardingModal />

      {/* Issue Reporting / Post Creator Bottom Sheet */}
      <CreatePostModal />
    </div>
  );
}
