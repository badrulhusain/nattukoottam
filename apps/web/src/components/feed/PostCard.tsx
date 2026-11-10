'use client';

import React, { useState } from 'react';
import { ChevronUp, MessageSquare, Repeat2, Heart, MoreVertical, MapPin, Share2, Check } from 'lucide-react';
import { Post } from '../../types';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { language, toggleLike, toggleSupport } = useAppStore();
  const t = getT(language);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const urgencyBadgeColor = () => {
    switch (post.urgency) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6EEE8] shadow-xs space-y-3.5 transition-all hover:border-[#32C878]/40">
      {/* Header: Author + Meta + Urgency Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={post.author.fullName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#087A45]/20 flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-[#17251D] hover:underline cursor-pointer">
                {post.author.fullName}
              </span>
              <span className="text-xs text-[#77847C]">· {post.createdAt}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#77847C] flex-wrap">
              <MapPin className="w-3 h-3 text-[#087A45]" />
              <span>{post.locality}, {post.district}</span>
              {post.latitude && post.longitude && (
                <span className="text-[10px] text-[#087A45] font-mono bg-[#E9F8ED] px-1.5 py-0.5 rounded-md">
                  {post.latitude.toFixed(3)}°, {post.longitude.toFixed(3)}°
                </span>
              )}
              {post.category && (
                <>
                  <span>·</span>
                  <span className="text-[#087A45] font-medium">
                    {t.categories[post.category as keyof typeof t.categories] || post.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Urgency Pill Badge */}
        {post.urgency && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${urgencyBadgeColor()}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {t.urgency[post.urgency]}
            </span>
          </div>
        )}
      </div>

      {/* Post Text Content */}
      <p className="text-sm text-[#17251D] leading-relaxed whitespace-pre-line font-normal">
        {post.content}
      </p>

      {/* Street/Landmark Tag if available */}
      {post.address && post.address !== `${post.locality}, ${post.district}` && (
        <div className="flex items-center gap-1.5 text-xs text-[#064B2E] bg-[#E9F8ED]/60 px-3 py-1.5 rounded-xl border border-[#32C878]/30">
          <MapPin className="w-3.5 h-3.5 text-[#087A45] flex-shrink-0" />
          <span className="truncate">{post.address}</span>
        </div>
      )}

      {/* Media Image Carousel / Grid */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-16/10">
            <img
              src={post.mediaUrls[activeMediaIndex]}
              alt="Evidence photo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Dots Indicator if multiple images */}
          {post.mediaUrls.length > 1 && (
            <div className="flex justify-center gap-1.5 pt-1">
              {post.mediaUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeMediaIndex ? 'w-5 bg-[#087A45]' : 'w-1.5 bg-[#CBD5E1]'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Bar: Support (Civic) vs Like (Appreciation) vs Comments vs Share */}
      <div className="pt-2 border-t border-[#E6EEE8]/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* "I Face This Too" Civic Support Pill */}
          <button
            onClick={() => toggleSupport(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs ${
              post.isSupported
                ? 'bg-[#087A45] text-white shadow-xs scale-102'
                : 'bg-[#E9F8ED] text-[#064B2E] hover:bg-[#d8f2de]'
            }`}
            title={t.feed.iFaceThisToo}
          >
            <ChevronUp className={`w-4 h-4 ${post.isSupported ? 'stroke-[3]' : 'stroke-[2.5]'}`} />
            <span>{post.supportsCount}</span>
            <span className="hidden sm:inline font-normal opacity-90 text-[11px]">
              {post.isSupported ? t.feed.supported : t.feed.iFaceThisToo}
            </span>
          </button>

          {/* Like Pill */}
          <button
            onClick={() => toggleLike(post.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              post.isLiked
                ? 'text-red-500 bg-red-50'
                : 'text-[#77847C] hover:bg-[#F7FAF7] hover:text-[#17251D]'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current text-red-500' : ''}`} />
            <span>{post.likesCount}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Comments */}
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#77847C] hover:bg-[#F7FAF7] hover:text-[#17251D] transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentsCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#77847C] hover:bg-[#F7FAF7] hover:text-[#17251D] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#087A45]" /> : <Repeat2 className="w-4 h-4" />}
            <span>{post.sharesCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

