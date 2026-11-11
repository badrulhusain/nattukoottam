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
  Trash2,
  Loader2,
} from 'lucide-react';
import { Post } from '../../types';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { UserAvatar } from '../ui/UserAvatar';
import { toggleLikeApi, toggleSupportApi, deletePostOrIssueApi } from '../../lib/api';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    language,
    toggleLike,
    toggleSupport,
    currentUser,
    deletePost,
    isAuthenticated,
    setIsAuthModalOpen,
  } = useAppStore();
  const t = getT(language);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<Array<{ id: string; author: string; avatar: string; text: string; time: string }>>([]);

  const isAuthor =
    Boolean(
      currentUser?.id &&
        (currentUser.id === post.author.id ||
          currentUser.username === post.author.username ||
          (currentUser.fullName &&
            post.author.fullName &&
            currentUser.fullName.trim().toLowerCase() === post.author.fullName.trim().toLowerCase()))
    ) || currentUser?.role === 'ADMIN';

  const handleDelete = async () => {
    const confirmMsg =
      language === 'ml'
        ? 'ഈ പോസ്റ്റ് ഇല്ലാതാക്കണമെന്ന് ഉറപ്പാണോ?'
        : 'Are you sure you want to delete this post?';
    if (!window.confirm(confirmMsg)) return;

    setIsDeleting(true);
    try {
      await deletePostOrIssueApi(post.id, post.isInfrastructureIssue);
    } catch (err) {
      console.warn('API delete post error:', err);
    } finally {
      deletePost(post.id);
      setIsDeleting(false);
      setIsMenuOpen(false);
    }
  };
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true, 'login');
      return;
    }
    toggleLike(post.id);
    try {
      await toggleLikeApi(post.id);
    } catch (err) {
      console.debug('Like sync skipped:', err);
    }
  };

  const handleSupport = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true, 'login');
      return;
    }
    toggleSupport(post.id);
    try {
      await toggleSupportApi(post.id);
    } catch (err) {
      console.debug('Support sync skipped:', err);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsAuthModalOpen(true, 'login');
      return;
    }
    if (!commentText.trim()) return;
    setCommentsList((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        author: currentUser.fullName,
        avatar: currentUser.avatarUrl || '',
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
            <UserAvatar
              src={post.author.avatarUrl}
              name={post.author.fullName}
              size="md"
              className="ring-2 ring-[#EAF7EF]"
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

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-lg text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors active-press"
              title="Options"
              aria-label="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#E4EBE6] py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  {isAuthor && (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{language === 'ml' ? 'ഇല്ലാതാക്കുന്നു...' : 'Deleting...'}</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'ml' ? 'പോസ്റ്റ് ഇല്ലാതാക്കുക' : 'Delete Post'}</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      handleShare();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-[#17231D] hover:bg-[#F8FAF8] flex items-center gap-2 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#718078]" />
                    <span>
                      {copied
                        ? language === 'ml'
                          ? 'പകർത്തി!'
                          : 'Copied!'
                        : language === 'ml'
                        ? 'ലിങ്ക് പകർത്തുക'
                        : 'Copy link'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
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
            onClick={handleSupport}
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
            onClick={handleLike}
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
            <span>{(post.commentsCount || 0) + commentsList.length}</span>
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
            {commentsList.length > 0 ? commentsList.map((comm) => (
              <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                <UserAvatar
                  src={comm.avatar}
                  name={comm.author}
                  size="xs"
                  className="flex-shrink-0"
                />
                <div className="flex-1 bg-[#F8FAF8] rounded-xl p-2.5 border border-[#E4EBE6]">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-[#17231D]">{comm.author}</span>
                    <span className="text-[10px] text-[#718078]">{comm.time}</span>
                  </div>
                  <p className="text-[#17231D] leading-relaxed">{comm.text}</p>
                </div>
              </div>
            )) : (
              <div className="py-2 text-center text-[11px] text-[#718078]">
                {language === 'ml' ? 'പ്രതികരണങ്ങൾ ഒന്നുമില്ല. ആദ്യത്തെ പ്രതികരണം രേഖപ്പെടുത്തൂ!' : 'No responses yet. Be the first to reply!'}
              </div>
            )}
          </div>

          {/* Quick Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onFocus={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true, 'login');
                }
              }}
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
