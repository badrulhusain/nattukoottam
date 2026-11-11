import { create } from 'zustand';
import { Language, Post, User, UserStory, StoryItem } from '../types';
import { GUEST_USER, INITIAL_POSTS_MOCK, KERALA_LOCALITIES } from './constants';
import { DetectedLocation, getSavedLocation, saveLocationToStorage } from './geolocation';
import { removeStoredTokens, updateUserLocationApi } from './api';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentLocality: string;
  setLocality: (locality: string) => void;
  userLocation: DetectedLocation | null;
  setUserLocation: (loc: DetectedLocation | null) => void;
  saveAndSetUserLocation: (loc: DetectedLocation) => void;
  isLocationPromptOpen: boolean;
  setIsLocationPromptOpen: (open: boolean) => void;
  currentUser: User;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot_password';
  setIsAuthModalOpen: (open: boolean, mode?: 'login' | 'register' | 'forgot_password') => void;
  login: (user: User) => void;
  logout: () => void;
  activeTab: 'home' | 'grievances' | 'discussions' | 'discover' | 'notifications' | 'profile' | 'official';
  setActiveTab: (tab: 'home' | 'grievances' | 'discussions' | 'discover' | 'notifications' | 'profile' | 'official') => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  feedFilter: 'forYou' | 'nearby' | 'following' | 'trending';
  setFeedFilter: (filter: 'forYou' | 'nearby' | 'following' | 'trending') => void;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (newPost: Partial<Post> & Omit<Post, 'createdAt' | 'likesCount' | 'supportsCount' | 'commentsCount' | 'sharesCount'>) => void;
  deletePost: (id: string) => void;
  toggleLike: (postId: string) => void;
  toggleSupport: (postId: string) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  // Instagram Stories State
  stories: UserStory[];
  setStories: (stories: UserStory[]) => void;
  activeStoryUserIndex: number | null;
  activeStorySlideIndex: number;
  openStoryViewer: (userIndex: number, slideIndex?: number, customStories?: UserStory[]) => void;
  closeStoryViewer: () => void;
  nextStorySlide: () => void;
  prevStorySlide: () => void;
  isAddStoryOpen: boolean;
  setIsAddStoryOpen: (open: boolean) => void;
  addStory: (newStory: { id?: string; mediaUrl: string; caption?: string; locality?: string }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
  currentLocality: 'Kakkanad',
  setLocality: (currentLocality) => set({ currentLocality }),
  userLocation: null,
  isLocationPromptOpen: false,
  setIsLocationPromptOpen: (isLocationPromptOpen) => set({ isLocationPromptOpen }),
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
  saveAndSetUserLocation: (loc) => {
    saveLocationToStorage(loc);
    updateUserLocationApi({
      locality: loc.locality,
      district: loc.district,
    }).catch((e) => console.warn('Could not sync location to account:', e));

    set((state) => ({
      userLocation: loc,
      currentLocality: loc.locality,
      isLocationPromptOpen: false,
      currentUser: {
        ...state.currentUser,
        locality: loc.locality,
        district: loc.district,
      },
    }));
  },
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

  // Instagram Stories Implementation
  stories: [],
  setStories: (stories) => set({ stories }),
  activeStoryUserIndex: null,
  activeStorySlideIndex: 0,
  openStoryViewer: (userIndex, slideIndex = 0, customStories) =>
    set((state) => {
      const baseStories =
        customStories && customStories.length > 0 ? customStories : state.stories;
      const updatedStories = baseStories.map((s, idx) =>
        idx === userIndex ? { ...s, hasUnseen: false } : s
      );
      return {
        stories: updatedStories,
        activeStoryUserIndex: userIndex,
        activeStorySlideIndex: slideIndex,
      };
    }),
  closeStoryViewer: () => set({ activeStoryUserIndex: null, activeStorySlideIndex: 0 }),
  nextStorySlide: () =>
    set((state) => {
      if (state.activeStoryUserIndex === null) return {};
      const currentUserStory = state.stories[state.activeStoryUserIndex];
      if (!currentUserStory) return { activeStoryUserIndex: null, activeStorySlideIndex: 0 };

      if (state.activeStorySlideIndex < currentUserStory.stories.length - 1) {
        return { activeStorySlideIndex: state.activeStorySlideIndex + 1 };
      }

      if (state.activeStoryUserIndex < state.stories.length - 1) {
        const nextUserIndex = state.activeStoryUserIndex + 1;
        const updatedStories = state.stories.map((s, idx) =>
          idx === nextUserIndex ? { ...s, hasUnseen: false } : s
        );
        return {
          stories: updatedStories,
          activeStoryUserIndex: nextUserIndex,
          activeStorySlideIndex: 0,
        };
      }

      return { activeStoryUserIndex: null, activeStorySlideIndex: 0 };
    }),
  prevStorySlide: () =>
    set((state) => {
      if (state.activeStoryUserIndex === null) return {};

      if (state.activeStorySlideIndex > 0) {
        return { activeStorySlideIndex: state.activeStorySlideIndex - 1 };
      }

      if (state.activeStoryUserIndex > 0) {
        const prevUserIndex = state.activeStoryUserIndex - 1;
        const prevUserStory = state.stories[prevUserIndex];
        return {
          activeStoryUserIndex: prevUserIndex,
          activeStorySlideIndex: prevUserStory ? prevUserStory.stories.length - 1 : 0,
        };
      }

      return {};
    }),
  isAddStoryOpen: false,
  setIsAddStoryOpen: (isAddStoryOpen) => set({ isAddStoryOpen }),
  addStory: (newStory) =>
    set((state) => {
      const storyItem: StoryItem = {
        id: newStory.id || `story_${Date.now()}`,
        mediaUrl: newStory.mediaUrl,
        caption: newStory.caption,
        createdAt: 'Just now',
        locality: newStory.locality || state.currentUser.locality || state.currentLocality,
        likesCount: 0,
      };

      const userStoryIndex = state.stories.findIndex((s) => s.userId === state.currentUser.id);

      let updatedStories: UserStory[];
      if (userStoryIndex >= 0) {
        updatedStories = state.stories.map((s, idx) =>
          idx === userStoryIndex
            ? {
                ...s,
                hasUnseen: true,
                stories: [storyItem, ...s.stories],
              }
            : s
        );
      } else {
        const newUserStory: UserStory = {
          userId: state.currentUser.id,
          userName: state.currentUser.fullName,
          userAvatar: state.currentUser.avatarUrl,
          locality: state.currentUser.locality || state.currentLocality,
          hasUnseen: true,
          stories: [storyItem],
        };
        updatedStories = [newUserStory, ...state.stories];
      }

      return {
        stories: updatedStories,
        isAddStoryOpen: false,
      };
    }),

  addPost: (newPostData) =>
    set((state) => ({
      posts: [
        {
          ...newPostData,
          id: (newPostData as any).id || `post_${Date.now()}`,
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

  deletePost: (id) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== id),
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

