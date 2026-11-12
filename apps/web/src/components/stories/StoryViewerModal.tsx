'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Heart,
  Send,
  MapPin,
  Smile,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { UserAvatar } from '../ui/UserAvatar';

const SLIDE_DURATION_MS = 5000;

export const StoryViewerModal: React.FC = () => {
  const {
    stories,
    activeStoryUserIndex,
    activeStorySlideIndex,
    closeStoryViewer,
    nextStorySlide,
    prevStorySlide,
    currentUser,
    language,
    isAuthenticated,
    setIsAuthModalOpen,
  } = useAppStore();

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reactions, setReactions] = useState<{ id: number; emoji: string }[]>([]);

  const activeUserStory =
    activeStoryUserIndex !== null && stories[activeStoryUserIndex]
      ? stories[activeStoryUserIndex]
      : null;

  const currentSlide =
    activeUserStory && activeUserStory.stories[activeStorySlideIndex]
      ? activeUserStory.stories[activeStorySlideIndex]
      : null;

  // Keyboard navigation
  useEffect(() => {
    if (activeStoryUserIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeStoryViewer();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        nextStorySlide();
      } else if (e.key === 'ArrowLeft') {
        prevStorySlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryUserIndex, nextStorySlide, prevStorySlide, closeStoryViewer]);

  // Slide timer progress animation
  useEffect(() => {
    if (!currentSlide || isPaused) return;

    setProgress(0);
    const startTime = Date.now();
    const intervalTime = 50; // update every 50ms

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = (elapsed / SLIDE_DURATION_MS) * 100;

      if (pct >= 100) {
        clearInterval(timer);
        setProgress(100);
        nextStorySlide();
      } else {
        setProgress(pct);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentSlide?.id, activeStorySlideIndex, activeStoryUserIndex, isPaused, nextStorySlide]);

  if (activeStoryUserIndex === null || !activeUserStory || !currentSlide) {
    return null;
  }

  const triggerReaction = (emoji: string) => {
    if (!isAuthenticated) {
      setIsPaused(true);
      setIsAuthModalOpen(true, 'login');
      return;
    }
    const id = Date.now();
    setReactions((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsPaused(true);
      setIsAuthModalOpen(true, 'login');
      return;
    }
    if (!replyText.trim()) return;
    triggerReaction('💬');
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Desktop Prev Button */}
      {activeStoryUserIndex > 0 || activeStorySlideIndex > 0 ? (
        <button
          onClick={prevStorySlide}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center backdrop-blur-xs transition-transform active:scale-95 z-20 cursor-pointer"
          title="Previous story"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      ) : null}

      {/* Main Story Phone Container */}
      <div
        className="relative w-full max-w-[420px] h-full sm:h-[90vh] sm:max-h-[820px] sm:rounded-2xl overflow-hidden bg-black flex flex-col justify-between shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story Progress Bars (Segmented like Instagram) */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
          {activeUserStory.stories.map((_, idx) => {
            const isCompleted = idx < activeStorySlideIndex;
            const isCurrent = idx === activeStorySlideIndex;

            return (
              <div
                key={idx}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width: isCompleted ? '100%' : isCurrent ? `${progress}%` : '0%',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header: Author + Time + Controls */}
        <div className="absolute top-6 inset-x-3 z-30 flex items-center justify-between text-white drop-shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-emerald-500">
              <UserAvatar
                src={activeUserStory.userAvatar}
                name={activeUserStory.userName}
                size="sm"
                className="w-full h-full ring-1 ring-black"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs leading-none">
                  {activeUserStory.userName}
                </span>
                <span className="text-[10px] text-white/70">·</span>
                <span className="text-[10px] text-white/70">
                  {currentSlide.createdAt}
                </span>
              </div>
              {currentSlide.locality && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-medium mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{currentSlide.locality}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeStoryViewer();
              }}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Left/Right Tap Areas */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              prevStorySlide();
            }}
          />
          <div
            className="w-2/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              nextStorySlide();
            }}
          />
        </div>

        {/* Background Image / Media */}
        <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden">
          <img
            src={currentSlide.mediaUrl}
            alt="Instagram Story"
            className="w-full h-full object-cover transition-transform duration-500"
          />
          {/* Subtle top & bottom vignette gradients */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Floating Flying Reaction Emojis */}
        <div className="absolute inset-0 pointer-events-none z-35 overflow-hidden">
          {reactions.map((r) => (
            <div
              key={r.id}
              className="absolute bottom-20 right-8 text-3xl animate-bounce"
              style={{
                animation: 'floatUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
              }}
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* Caption & Bottom Interaction Bar */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-3.5 space-y-3">
          {/* Caption text */}
          {currentSlide.caption && (
            <div className="bg-black/50 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 text-white text-xs font-normal leading-relaxed">
              {currentSlide.caption}
            </div>
          )}

          {/* Quick Reaction Tray & Reply Input */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSendReply} className="flex-1 flex items-center bg-white/20 hover:bg-white/25 focus-within:bg-white/30 rounded-full px-3.5 py-2 border border-white/20 backdrop-blur-xs transition-colors">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                placeholder={
                  language === 'ml'
                    ? `${activeUserStory.userName}-ന് മറുപടി നൽകുക...`
                    : `Reply to ${activeUserStory.userName}...`
                }
                className="flex-1 bg-transparent text-white text-xs placeholder-white/60 outline-none"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="text-white disabled:opacity-40 hover:scale-110 transition-transform ml-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Emoji Buttons */}
            <div className="flex items-center gap-1.5">
              {(['❤️', '🔥', '👏', '😮'] as const).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => triggerReaction(emoji)}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center text-sm transition-transform active:scale-125 cursor-pointer"
                  title="React"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Next Button */}
      {activeStoryUserIndex < stories.length - 1 ||
      activeStorySlideIndex < activeUserStory.stories.length - 1 ? (
        <button
          onClick={nextStorySlide}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center backdrop-blur-xs transition-transform active:scale-95 z-20 cursor-pointer"
          title="Next story"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      ) : null}

      {/* CSS Keyframes for Floating Reactions */}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translateY(-120px) scale(1.4);
          }
        }
      `}</style>
    </div>
  );
};

