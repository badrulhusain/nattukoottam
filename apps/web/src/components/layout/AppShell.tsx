'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { fetchLivePosts, fetchLiveIssues, getCurrentUserApi } from '../../lib/api';
import { getSavedLocation, saveLocationToStorage } from '../../lib/geolocation';
import { Post } from '../../types';
import { AppHeader } from './AppHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { RightSidebar } from './RightSidebar';
import { BottomNav } from './BottomNav';
import { OnboardingModal } from '../onboarding/OnboardingModal';
import { CreatePostModal } from '../create/CreatePostModal';
import { AuthModal } from '../auth/AuthModal';
import { LocationPromptModal } from '../location/LocationPromptModal';
import { StoryViewerModal } from '../stories/StoryViewerModal';
import { AddStoryModal } from '../stories/AddStoryModal';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const {
    language,
    setPosts,
    setLocality,
    setUserLocation,
    setIsLocationPromptOpen,
    login,
    setActiveTab,
  } = useAppStore();

  // Keep store's activeTab in sync with the current URL pathname
  useEffect(() => {
    if (!pathname || pathname === '/') {
      setActiveTab('home');
    } else if (pathname.startsWith('/grievances')) {
      setActiveTab('grievances');
    } else if (pathname.startsWith('/discover')) {
      setActiveTab('discover');
    } else if (pathname.startsWith('/notifications')) {
      setActiveTab('notifications');
    } else if (pathname.startsWith('/profile')) {
      setActiveTab('profile');
    } else if (pathname.startsWith('/official')) {
      setActiveTab('official');
    }
  }, [pathname, setActiveTab]);

  // Check for saved location on initial website open
  useEffect(() => {
    const saved = getSavedLocation();
    if (saved && saved.locality) {
      setLocality(saved.locality);
      setUserLocation(saved);
    } else {
      // First time opening the website: prompt user to set their ward location
      setIsLocationPromptOpen(true);
    }
  }, [setLocality, setUserLocation, setIsLocationPromptOpen]);

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

        // Use location saved on user's account
        if (user.locality) {
          setLocality(user.locality);
          const savedLoc = getSavedLocation();
          if (!savedLoc || savedLoc.locality !== user.locality) {
            saveLocationToStorage({
              latitude: 10.0159,
              longitude: 76.3419,
              accuracy: 50,
              locality: user.locality,
              district: user.district || 'Ernakulam',
              state: 'Kerala',
              formattedAddress: `${user.locality}, ${user.district || 'Kerala'}`,
            });
          }
        }
      }
    }
    restoreSession();
  }, [login, setLocality]);

  // Sync live posts & grievances from Neon backend
  useEffect(() => {
    async function loadLiveFeed() {
      try {
        const [postsRes, issuesRes] = await Promise.all([
          fetchLivePosts(),
          fetchLiveIssues(),
        ]);

        const postItems = Array.isArray(postsRes) ? postsRes : postsRes?.data || [];
        const issueItems = Array.isArray(issuesRes) ? issuesRes : issuesRes?.data || [];

        const mappedPosts: Post[] = postItems.map((p: any) => ({
          id: p.id,
          author: {
            id: p.author?.id || p.authorId || 'anon',
            fullName: p.author?.fullName || 'Community Member',
            username: p.author?.username || p.author?.fullName?.toLowerCase().replace(/\s+/g, '_') || 'user',
            avatarUrl: p.author?.avatarUrl || '',
            locality: p.author?.locality || p.locality,
          },
          content: p.content,
          category: p.category,
          urgency: p.urgency,
          locality: p.locality,
          district: p.district,
          latitude: p.latitude,
          longitude: p.longitude,
          mediaUrls: p.media && p.media.length > 0 ? p.media.map((m: any) => m.mediaUrl) : (p.mediaUrls || []),
          likesCount: p.likesCount ?? p._count?.likes ?? 0,
          isLiked: Boolean(p.isLiked),
          supportsCount: p.supportsCount ?? 0,
          isSupported: Boolean(p.isSupported),
          commentsCount: p.commentsCount ?? p._count?.comments ?? 0,
          sharesCount: 0,
          createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Just now',
          isInfrastructureIssue: false,
        }));

        const mappedIssues: Post[] = issueItems.map((issue: any) => ({
          id: issue.id,
          author: {
            id: issue.reporter?.id || issue.reporterId || 'anon',
            fullName: issue.reporter?.fullName || 'Citizen Reporter',
            username: issue.reporter?.fullName?.toLowerCase().replace(/\s+/g, '_') || 'citizen',
            avatarUrl: issue.reporter?.avatarUrl || '',
            locality: issue.reporter?.locality || issue.locality,
          },
          content: issue.description || issue.title,
          category: issue.category,
          urgency: issue.urgency || 'HIGH',
          locality: issue.locality,
          district: issue.district,
          address: issue.address || `${issue.locality}, ${issue.district}`,
          latitude: issue.latitude,
          longitude: issue.longitude,
          mediaUrls:
            issue.evidences && issue.evidences.length > 0
              ? issue.evidences.map((e: any) => e.fileUrl)
              : [],
          likesCount: issue.likesCount ?? 0,
          isLiked: Boolean(issue.isLiked),
          supportsCount: issue.supportsCount ?? issue._count?.supports ?? 0,
          isSupported: Boolean(issue.isSupported),
          commentsCount: issue.commentsCount ?? issue._count?.comments ?? 0,
          sharesCount: 0,
          createdAt: issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Just now',
          isInfrastructureIssue: true,
        }));

        const allItems = [...mappedIssues, ...mappedPosts];
        setPosts(allItems);
      } catch (err) {
        console.warn('Failed to load live feed from Neon DB:', err);
      }
    }
    loadLiveFeed();
  }, [setPosts]);

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

        {/* Center Column: Dedicated Page Route Content */}
        <main className="w-full max-w-2xl px-3 sm:px-6 py-4 flex-1">
          {children}
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

      {/* Ward Location Prompt (Auto-saves to user account & localStorage) */}
      <LocationPromptModal />

      {/* Instagram Story Viewer & Story Creator */}
      <StoryViewerModal />
      <AddStoryModal />
    </div>
  );
};

