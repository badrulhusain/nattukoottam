import { create } from 'zustand';
import { Language, Post, User } from '../types';
import { CURRENT_USER_MOCK, INITIAL_POSTS_MOCK, KERALA_LOCALITIES } from './constants';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentLocality: string;
  setLocality: (locality: string) => void;
  currentUser: User;
  activeTab: 'home' | 'grievances' | 'discover' | 'notifications' | 'profile' | 'official';
  setActiveTab: (tab: 'home' | 'grievances' | 'discover' | 'notifications' | 'profile' | 'official') => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  feedFilter: 'forYou' | 'nearby' | 'following' | 'trending';
  setFeedFilter: (filter: 'forYou' | 'nearby' | 'following' | 'trending') => void;
  posts: Post[];
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
  currentUser: CURRENT_USER_MOCK,
  activeTab: 'home',
  setActiveTab: (activeTab) => set({ activeTab }),
  activeCategory: 'all',
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  feedFilter: 'forYou',
  setFeedFilter: (feedFilter) => set({ feedFilter }),
  posts: INITIAL_POSTS_MOCK,
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

