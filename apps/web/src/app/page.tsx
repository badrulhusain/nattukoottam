'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { getT } from '../lib/translations';
import { fetchLivePosts, getCurrentUserApi } from '../lib/api';
import { Post } from '../types';
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
import { AuthModal } from '../components/auth/AuthModal';
import { UserProfileView } from '../components/profile/UserProfileView';
import { OfficialPortalView } from '../components/official/OfficialPortalView';
import { DiscoverMapView } from '../components/map/DiscoverMapView';
import { NotificationsView } from '../components/notifications/NotificationsView';
import { AlertCircle, Sparkles, Filter, Plus } from 'lucide-react';

export default function Home() {
  const {
    activeTab,
    feedFilter,
    setFeedFilter,
    posts,
    setPosts,
    activeCategory,
    currentLocality,
    language,
    login,
    setIsCreateModalOpen,
  } = useAppStore();
  const t = getT(language);

  // Restore authenticated session from stored JWT if valid
  useEffect(() => {
    async function restoreSession() {
      const user = await getCurrentUserApi();
      if (user) {
        login({
          id: user.id,
          fullName: user.fullName,
          username: user.email?.split('@')[0] || user.phone?.slice(-6) || 'user',
          email: user.email,
          phone: user.phone,
          role: user.role,
          district: user.district,
          locality: user.locality,
          avatarUrl: user.avatarUrl || '',
          bio: user.bio || '',
          interests: [],
          followersCount: 0,
          followingCount: 0,
          grievancesCount: 0,
          postsCount: 0,
          preferredLang: (user.preferredLang as any) || 'ml',
        });
      }
    }
    restoreSession();
  }, [login]);

  // Sync live posts from Neon backend
  useEffect(() => {
    async function loadLivePosts() {
      const res = await fetchLivePosts(currentLocality);
      const items = Array.isArray(res) ? res : res?.data || [];
      if (items.length > 0) {
        const mapped: Post[] = items.map((p: any) => ({
          id: p.id,
          author: {
            id: p.author?.id || 'anon',
            fullName: p.author?.fullName || 'Community Member',
            username: p.author?.username || p.author?.fullName?.toLowerCase().replace(/\s+/g, '_') || 'user',
            avatarUrl: p.author?.avatarUrl || '',
            locality: p.author?.locality || p.locality,
          },
          content: p.content,
          category: p.category,
          urgency: p.urgency || 'HIGH',
          locality: p.locality,
          district: p.district,
          latitude: p.latitude,
          longitude: p.longitude,
          mediaUrls: p.media && p.media.length > 0 ? p.media.map((m: any) => m.mediaUrl) : [],
          likesCount: p.likesCount ?? p._count?.likes ?? 0,
          isLiked: Boolean(p.isLiked),
          supportsCount: p.supportsCount ?? 1,
          isSupported: Boolean(p.isSupported),
          commentsCount: p.commentsCount ?? p._count?.comments ?? 0,
          sharesCount: 0,
          createdAt: 'Just now',
          isInfrastructureIssue: true,
        }));

        setPosts(mapped);
      } else {
        setPosts([]);
      }
    }
    loadLivePosts();
  }, [currentLocality, setPosts]);

  // Filter posts based on activeCategory
  const filteredPosts = posts.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <div
      lang={language}
      className="min-h-screen bg-[#F8FAF8] text-[#17231D] flex flex-col font-meera"
    >
      {/* Top Application Header */}
      <AppHeader />

      {/* Main 3-Column Responsive Shell */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex justify-center">
        {/* Left Column: Desktop Navigation Sidebar */}
        <DesktopSidebar />

        {/* Center Column: Social Feed & Dynamic Views */}
        <main className="w-full max-w-2xl px-3 sm:px-6 py-4 flex-1">
          {activeTab === 'home' && (
            <div className="space-y-4 pb-24 sm:pb-8">
              {/* Active Ward Circles */}
              <StoriesBar />

              {/* Quick Post Composer Input */}
              <PostComposer />

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

              {/* Category Filter Pills Bar */}
              <CategoryBar />

              {/* Posts Feed List */}
              <div className="space-y-3 pt-1">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
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
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] transition-colors active-press shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.nav.createPost}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'grievances' && (
            <div className="space-y-4 pb-24 sm:pb-8">
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

              <CategoryBar />

              <div className="space-y-3">
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

      {/* Onboarding Welcome Screen */}
      <OnboardingModal />

      {/* Issue Reporting / Post Creator Bottom Sheet */}
      <CreatePostModal />

      {/* Authentication Modal (Login / Register / Account Setup) */}
      <AuthModal />
    </div>
  );
}
