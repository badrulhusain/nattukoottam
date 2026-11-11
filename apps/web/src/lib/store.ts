import { create } from 'zustand';
import { Language, Post, User } from '../types';
import { GUEST_USER, INITIAL_POSTS_MOCK, KERALA_LOCALITIES } from './constants';
import { DetectedLocation } from './geolocation';
import { removeStoredTokens } from './api';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentLocality: string;
  setLocality: (locality: string) => void;
  userLocation: DetectedLocation | null;
  setUserLocation: (loc: DetectedLocation | null) => void;
  currentUser: User;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot_password';
  setIsAuthModalOpen: (open: boolean, mode?: 'login' | 'register' | 'forgot_password') => void;
  login: (user: User) => void;
  logout: () => void;
  activeTab: 'home' | 'grievances' | 'discover' | 'notifications' | 'profile' | 'official';
  setActiveTab: (tab: 'home' | 'grievances' | 'discover' | 'notifications' | 'profile' | 'official') => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  feedFilter: 'forYou' | 'nearby' | 'following' | 'trending';
  setFeedFilter: (filter: 'forYou' | 'nearby' | 'following' | 'trending') => void;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (newPost: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'supportsCount' | 'commentsCount' | 'sharesCount'>) => void;
  toggleLike: (postId: string) => void;
  toggleSupport: (postId: string) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
  currentLocality: 'Kakkanad',
  setLocality: (currentLocality) => set({ currentLocality }),
  userLocation: null,
  setUserLocation: (userLocation) =>
    set((state) => ({
      userLocation,
      currentLocality: userLocation ? userLocation.locality : state.currentLocality,
      currentUser: userLocation
        ? {
            ...state.currentUser,
            locality: userLocation.locality,
            district: userLocation.district,
          }
        : state.currentUser,
    })),
  currentUser: GUEST_USER,
  isAuthenticated: false,
  isAuthModalOpen: false,
  authModalMode: 'login',
  setIsAuthModalOpen: (isAuthModalOpen, mode) =>
    set((state) => ({
      isAuthModalOpen,
      authModalMode: mode || state.authModalMode,
    })),
  login: (user: User) =>
    set({
      currentUser: user,
      isAuthenticated: true,
      isAuthModalOpen: false,
      currentLocality: user.locality || 'Kakkanad',
    }),
  logout: () => {
    removeStoredTokens();
    set({
      isAuthenticated: false,
      currentUser: GUEST_USER,
    });
  },
  activeTab: 'home',
  setActiveTab: (activeTab) => set({ activeTab }),
  activeCategory: 'all',
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  feedFilter: 'forYou',
  setFeedFilter: (feedFilter) => set({ feedFilter }),
  posts: INITIAL_POSTS_MOCK,
  setPosts: (posts) => set({ posts }),
  isOnboardingOpen: false,
  setIsOnboardingOpen: (isOnboardingOpen) => set({ isOnboardingOpen }),
  isCreateModalOpen: false,
  setIsCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),

  addPost: (newPostData) =>
    set((state) => ({
      posts: [
        {
          ...newPostData,
          id: `post_${Date.now()}`,
          createdAt: 'Just now',
          likesCount: 0,
          isLiked: false,
          supportsCount: 1,
          isSupported: true,
          commentsCount: 0,
          sharesCount: 0,
        },
        ...state.posts,
      ],
      isCreateModalOpen: false,
    })),

  toggleLike: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
          };
        }
        return post;
      }),
    })),

  toggleSupport: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          const isSupported = !post.isSupported;
          return {
            ...post,
            isSupported,
            supportsCount: isSupported ? post.supportsCount + 1 : Math.max(0, post.supportsCount - 1),
          };
        }
        return post;
      }),
    })),
}));

