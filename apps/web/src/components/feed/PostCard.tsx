'use client';

import React, { useState } from 'react';
import {
  ChevronUp,
  MessageSquare,
  Repeat2,
  Heart,
  MoreHorizontal,
  MapPin,
  Check,
  ShieldCheck,
  Share2,
  Send,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Post } from '../../types';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { language, toggleLike, toggleSupport, currentUser } = useAppStore();
  const t = getT(language);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<
    Array<{ id: string; author: string; avatar: string; text: string; time: string }>
  >([
    {
      id: 'c1',
      author: 'Mathew Varghese',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      text:
        language === 'ml'
          ? 'ഇന്നലെ രാത്രി ഇവിടെ ഒരു ബൈക്ക് മറിഞ്ഞു. ഉടൻ പരിഹരിക്കേണ്ട കാര്യമാണ്!'
          : 'A scooter skidded here yesterday evening. Needs immediate patch work!',
      time: '15m ago',
    },
  ]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentsList((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        author: currentUser.fullName,
        avatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        text: commentText.trim(),
        time: 'Just now',
      },
    ]);
    setCommentText('');
  };

  const getUrgencyConfig = (urgency?: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return {
          label: t.urgency.CRITICAL,
          badgeClass: 'bg-red-50 text-red-700 border-red-200',
          dotClass: 'bg-red-500 animate-pulse',
        };
      case 'HIGH':
        return {
          label: t.urgency.HIGH,
          badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
          dotClass: 'bg-orange-500',
        };
      case 'MEDIUM':
        return {
          label: t.urgency.MEDIUM,
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          dotClass: 'bg-amber-500',
        };
      default:
        return {
          label: t.urgency.LOW,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500',
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(post.urgency);

  return (
    <article className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E4EBE6] shadow-2xs hover:border-[#D0DBD3] transition-all space-y-3.5 group">
      {/* Author & Header Metadata */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={
                post.author.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              }
              alt={post.author.fullName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#EAF7EF]"
            />
            {post.isInfrastructureIssue && (
              <span className="absolute -bottom-1 -right-1 p-0.5 bg-[#16A34A] text-white rounded-full ring-1.5 ring-white">
                <ShieldCheck className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-[#17231D] hover:text-[#16A34A] transition-colors cursor-pointer truncate">
                {post.author.fullName}
              </span>
              <span className="text-xs text-[#718078]">@{post.author.username}</span>
              <span className="text-xs text-[#94A39B]">·</span>
              <span className="text-xs text-[#718078]">{post.createdAt}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#718078] flex-wrap mt-0.5">
              <span className="flex items-center gap-1 text-[#16A34A] font-medium">
                <MapPin className="w-3 h-3" />
                <span>{post.locality}, {post.district}</span>
              </span>

              {post.category && (
                <>
                  <span className="text-[#94A39B]">·</span>
                  <span className="text-[#17231D] font-medium bg-[#F8FAF8] px-2 py-0.2 rounded-md border border-[#E4EBE6] text-[11px]">
                    {t.categories[post.category as keyof typeof t.categories] || post.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Priority / Urgency Badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {post.urgency && (
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${urgencyConfig.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${urgencyConfig.dotClass}`} />
              <span>{urgencyConfig.label}</span>
            </span>
          )}

          <button
            type="button"
            className="p-1 rounded-lg text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors"
            title="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post Text Body */}
      <p className="text-[14px] text-[#17231D] leading-relaxed whitespace-pre-line font-normal">
        {post.content}
      </p>

      {/* Landmark / Ward Address Callout */}
      {post.address && post.address !== `${post.locality}, ${post.district}` && (
        <div className="flex items-center gap-2 text-xs text-[#14532D] bg-[#EAF7EF]/70 px-3 py-2 rounded-xl border border-[#D1EBD9]">
          <MapPin className="w-3.5 h-3.5 text-[#16A34A] flex-shrink-0" />
          <span className="font-medium truncate">{post.address}</span>
          {post.latitude && post.longitude && (
            <span className="ml-auto text-[10px] text-[#16A34A] font-mono bg-white px-1.5 py-0.5 rounded border border-[#D1EBD9]">
              {post.latitude.toFixed(3)}°, {post.longitude.toFixed(3)}°
            </span>
          )}
        </div>
      )}

      {/* Media Carousel / Gallery */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-[#E4EBE6] aspect-16/10">
            <img
              src={post.mediaUrls[activeMediaIndex]}
              alt="Community evidence"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
            />

            {/* Media Count Badge */}
            {post.mediaUrls.length > 1 && (
              <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {activeMediaIndex + 1} / {post.mediaUrls.length}
              </span>
            )}
          </div>

          {/* Media Dots */}
          {post.mediaUrls.length > 1 && (
            <div className="flex justify-center gap-1.5 pt-0.5">
              {post.mediaUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeMediaIndex ? 'w-5 bg-[#16A34A]' : 'w-1.5 bg-[#D0DBD3]'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Social & Civic Engagement Action Bar */}
      <div className="pt-2.5 border-t border-[#E4EBE6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Civic Innovation Button: "I Face This Too" */}
          <button
            onClick={() => toggleSupport(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active-press ${
              post.isSupported
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'bg-[#EAF7EF] text-[#16A34A] hover:bg-[#d8f2de] border border-[#D1EBD9]'
            }`}
            title={t.feed.iFaceThisToo}
          >
            <ChevronUp
              className={`w-4 h-4 ${post.isSupported ? 'stroke-[3]' : 'stroke-[2.4]'}`}
            />
            <span>{post.supportsCount}</span>
            <span className="hidden sm:inline font-semibold text-[11px] ml-0.5">
              {post.isSupported ? t.feed.supported : t.feed.iFaceThisToo}
            </span>
          </button>

          {/* Like Button */}
          <button
            onClick={() => toggleLike(post.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all active-press ${
              post.isLiked
                ? 'text-red-600 bg-red-50 border border-red-200'
                : 'text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] border border-transparent'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                post.isLiked ? 'fill-current text-red-500 scale-110' : ''
              }`}
            />
            <span>{post.likesCount}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Comments Trigger */}
          <button
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              isCommentsOpen
                ? 'text-[#16A34A] bg-[#EAF7EF]'
                : 'text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentsCount + (commentsList.length - 1)}</span>
          </button>

          {/* Share Trigger */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors"
            title="Share report"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#16A34A]" />
                <span className="text-[11px] text-[#16A34A] font-bold">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{post.sharesCount}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      {isCommentsOpen && (
        <div className="pt-3 border-t border-[#E4EBE6] space-y-3 animate-in fade-in duration-150">
          <div className="space-y-2.5">
            {commentsList.map((comm) => (
              <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                <img
                  src={comm.avatar}
                  alt={comm.author}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-[#E4EBE6] flex-shrink-0"
                />
                <div className="flex-1 bg-[#F8FAF8] rounded-xl p-2.5 border border-[#E4EBE6]">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-[#17231D]">{comm.author}</span>
                    <span className="text-[10px] text-[#718078]">{comm.time}</span>
                  </div>
                  <p className="text-[#17231D] leading-relaxed">{comm.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                language === 'ml'
                  ? 'അഭിപ്രായം രേഖപ്പെടുത്തൂ...'
                  : 'Write a community response...'
              }
              className="flex-1 bg-[#F8FAF8] border border-[#E4EBE6] focus:border-[#16A34A] rounded-xl px-3 py-1.5 text-xs text-[#17231D] placeholder-[#718078] outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors active-press"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};
