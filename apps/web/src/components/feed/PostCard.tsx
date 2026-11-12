'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  AlertTriangle,
  Eye,
  Trash2,
  Loader2,
  UserPlus,
  UserCheck,
  Volume2,
  VolumeX,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  Sparkles,
  History,
  Globe,
} from 'lucide-react';
import { Post } from '../../types';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { UserAvatar } from '../ui/UserAvatar';
import {
  toggleLikeApi,
  toggleSupportApi,
  deletePostOrIssueApi,
  toggleFollowUserApi,
  translateTextApi,
} from '../../lib/api';

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
    followingIds,
    toggleFollowUser,
  } = useAppStore();
  const t = getT(language);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<Array<{ id: string; author: string; avatar: string; text: string; time: string }>>([]);

  // Background Voice Audio Playback State
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceCurrentTime, setVoiceCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleVoice = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!audioRef.current && post.voiceAudioUrl) {
      audioRef.current = new Audio(post.voiceAudioUrl);
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current) setVoiceDuration(audioRef.current.duration);
      };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) setVoiceCurrentTime(audioRef.current.currentTime);
      };
      audioRef.current.onended = () => {
        setIsPlayingVoice(false);
        setVoiceCurrentTime(0);
      };
    }
    if (audioRef.current) {
      if (isPlayingVoice) {
        audioRef.current.pause();
        setIsPlayingVoice(false);
      } else {
        audioRef.current.play().catch((err) => console.warn('Audio play error:', err));
        setIsPlayingVoice(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isShowingTranslation, setIsShowingTranslation] = useState(false);

  const handleToggleTranslation = async () => {
    if (translatedContent) {
      setIsShowingTranslation(!isShowingTranslation);
      return;
    }
    setIsTranslating(true);
    try {
      const targetLang = language === 'ml' ? 'ml' : 'en';
      const res = await translateTextApi(post.content, targetLang);
      setTranslatedContent(res.translatedText);
      setIsShowingTranslation(true);
    } catch (err) {
      console.warn('Translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'RESOLVED':
        return {
          step: 4,
          label: language === 'ml' ? 'പരിഹരിച്ചു (Resolved)' : 'Resolved & Inspected',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dotClass: 'bg-emerald-600',
        };
      case 'IN_PROGRESS':
        return {
          step: 3,
          label: language === 'ml' ? 'പ്രവൃത്തി പുരോഗമിക്കുന്നു' : 'Work in Progress',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
          dotClass: 'bg-blue-600 animate-pulse',
        };
      case 'VERIFIED':
        return {
          step: 2,
          label: language === 'ml' ? 'എഞ്ചിനീയർ പരിശോധിച്ചു' : 'Verified by Engineer',
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
          dotClass: 'bg-purple-600',
        };
      case 'WAITING_FOR_COORDINATION':
        return {
          step: 2,
          label: language === 'ml' ? 'വകുപ്പ് ഏകോപനം കാക്കുന്നു' : 'Coordination Required',
          badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
          dotClass: 'bg-orange-600',
        };
      case 'REJECTED':
        return {
          step: 0,
          label: language === 'ml' ? 'തള്ളി (Rejected)' : 'Rejected / Not Feasible',
          badgeClass: 'bg-red-100 text-red-800 border-red-300',
          dotClass: 'bg-red-600',
        };
      case 'REPORTED':
      case 'UNDER_REVIEW':
      default:
        return {
          step: 1,
          label: language === 'ml' ? 'പരിശോധനയിൽ (Review)' : 'Under Review',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
          dotClass: 'bg-amber-600',
        };
    }
  };

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
  const statusConfig = getStatusConfig(post.status);

  return (
    <article className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E4EBE6] shadow-2xs hover:border-[#D0DBD3] transition-all space-y-3.5 group">
      {/* Author & Header Metadata */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/profile?id=${encodeURIComponent(post.author.id || post.author.username)}&username=${encodeURIComponent(post.author.username)}`}
            className="relative flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            title={`View ${post.author.fullName}'s profile`}
          >
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
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile?id=${encodeURIComponent(post.author.id || post.author.username)}&username=${encodeURIComponent(post.author.username)}`}
                className="font-bold text-sm text-[#17231D] hover:text-[#16A34A] transition-colors cursor-pointer truncate"
              >
                {post.author.fullName}
              </Link>
              <Link
                href={`/profile?id=${encodeURIComponent(post.author.id || post.author.username)}&username=${encodeURIComponent(post.author.username)}`}
                className="text-xs text-[#718078] hover:text-[#17231D] transition-colors"
              >
                @{post.author.username}
              </Link>

              {/* Quick Follow Toggle for non-self authors */}
              {!isAuthor && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!isAuthenticated) {
                      setIsAuthModalOpen(true, 'login');
                      return;
                    }
                    const targetId = post.author.id || post.author.username;
                    toggleFollowUser(targetId);
                    toggleFollowUserApi(targetId).catch(() => {});
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer active-press ${
                    followingIds.includes(post.author.id) || followingIds.includes(post.author.username)
                      ? 'bg-[#EAF7EF] text-[#16A34A] border border-[#D1EBD9]'
                      : 'bg-[#16A34A] text-white hover:bg-[#15803D]'
                  }`}
                  title={
                    followingIds.includes(post.author.id) || followingIds.includes(post.author.username)
                      ? t.profile.following
                      : t.profile.follow
                  }
                >
                  {followingIds.includes(post.author.id) || followingIds.includes(post.author.username) ? (
                    <>
                      <UserCheck className="w-2.5 h-2.5" />
                      <span>{t.profile.following}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-2.5 h-2.5" />
                      <span>{t.profile.follow}</span>
                    </>
                  )}
                </button>
              )}

              {post.author.karmaPoints !== undefined && post.author.karmaPoints > 0 && (
                <span
                  className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 flex items-center gap-0.5"
                  title={`${post.author.karmaPoints} Civic Karma Points`}
                >
                  <span>⭐</span>
                  <span>{post.author.karmaPoints}</span>
                </span>
              )}
              {post.author.badges?.includes('TOP_REPORTER') && (
                <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  🌟 Top Reporter
                </span>
              )}
              {post.author.badges?.includes('COMMUNITY_MODERATOR') && (
                <span className="text-[9px] font-extrabold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
                  🛡️ Moderator
                </span>
              )}

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

              {post.department?.name && (
                <>
                  <span className="text-[#94A39B]">·</span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.2 rounded-md border border-emerald-200 text-[10px] flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    <span>{post.department.name}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Priority & Status Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {/* Official Grievance Status Badge */}
          {(post.status || post.isInfrastructureIssue) && (
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${statusConfig.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
              <span>{statusConfig.label}</span>
            </span>
          )}

          {/* Urgency Badge */}
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
      <p className="text-[15.5px] text-[#17231D] leading-relaxed whitespace-pre-line font-normal">
        {isShowingTranslation && translatedContent ? translatedContent : post.content}
      </p>

      {/* 1-Click Multilingual AI Translation Toggle */}
      <div className="flex items-center gap-2 -mt-1">
        <button
          type="button"
          onClick={handleToggleTranslation}
          disabled={isTranslating}
          className="text-[11px] font-semibold text-[#16A34A] hover:text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Globe className={`w-3 h-3 text-[#16A34A] ${isTranslating ? 'animate-spin' : ''}`} />
          <span>
            {isTranslating
              ? language === 'ml'
                ? 'വിവർത്തനം ചെയ്യുന്നു...'
                : 'Translating via Groq...'
              : isShowingTranslation
              ? language === 'ml'
                ? 'യഥാർത്ഥ ഉള്ളടക്കം കാണിക്കുക (Show Original)'
                : 'Show Original'
              : language === 'ml'
              ? 'മലയാളത്തിലേക്ക് വിവർത്തനം ചെയ്യുക'
              : 'Translate to English'}
          </span>
        </button>
        {isShowingTranslation && (
          <span className="text-[9.5px] font-semibold text-[#718078] bg-[#F8FAF8] px-1.5 py-0.5 rounded border border-[#E4EBE6]">
            Groq AI ({language === 'ml' ? 'മലയാളം' : 'English'})
          </span>
        )}
      </div>

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

      {/* Standalone Voice Note Card when post has no photo */}
      {post.voiceAudioUrl && (!post.mediaUrls || post.mediaUrls.length === 0) && (
        <div className="p-3 rounded-2xl bg-[#EAF7EF]/70 border border-[#D1EBD9] flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleVoice}
              className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center hover:bg-[#15803D] transition-colors shadow-xs active-press cursor-pointer flex-shrink-0"
              title={isPlayingVoice ? 'Pause' : 'Play voice note'}
            >
              {isPlayingVoice ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div>
              <div className="text-xs font-bold text-[#17231D] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{language === 'ml' ? 'വോയ്‌സ് പരാതി സന്ദേശം' : 'Voice Complaint Audio'}</span>
              </div>
              <div className="text-[10px] text-[#718078] font-mono mt-0.5">
                {isPlayingVoice
                  ? `${formatAudioTime(voiceCurrentTime)} / ${formatAudioTime(voiceDuration || 12)}`
                  : language === 'ml'
                  ? 'ശബ്ദം കേൾക്കാൻ ടാപ്പ് ചെയ്യുക'
                  : 'Tap to listen to citizen voice'}
              </div>
            </div>
          </div>

          {isPlayingVoice && (
            <div className="flex items-center gap-1 pr-1">
              <span className="w-1 h-3 bg-[#16A34A] rounded-full animate-bounce" />
              <span className="w-1 h-5 bg-[#16A34A] rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-4 bg-[#16A34A] rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1 h-6 bg-[#16A34A] rounded-full animate-bounce [animation-delay:0.45s]" />
            </div>
          )}
        </div>
      )}

      {/* Media Carousel / Gallery with Background Voice Audio Playback */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-[#E4EBE6] aspect-16/10 group/media">
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

            {/* Background Voice Audio Overlay on Photo */}
            {post.voiceAudioUrl && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-bold transition-all flex items-center gap-2 shadow-lg active-press cursor-pointer ${
                    isPlayingVoice
                      ? 'bg-[#16A34A] text-white ring-2 ring-white/60 shadow-[#16A34A]/50'
                      : 'bg-black/60 hover:bg-black/80 text-white border border-white/20'
                  }`}
                  title={
                    isPlayingVoice
                      ? 'Pause voice note'
                      : 'Play citizen voice in background of photo'
                  }
                >
                  {isPlayingVoice ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>{language === 'ml' ? 'ശബ്ദം നിർത്തുക' : 'Pause Voice'}</span>
                      {/* Animated Soundwave Visualizer Bars */}
                      <span className="flex items-center gap-0.5 ml-1">
                        <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce" />
                        <span className="w-0.5 h-4 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
                        <span className="w-0.5 h-4.5 bg-white rounded-full animate-bounce [animation-delay:0.45s]" />
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ml' ? 'ശബ്ദം കേൾക്കൂ' : 'Play Voice Note'}</span>
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    </>
                  )}
                </button>

                {isPlayingVoice && (
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-white/95 border border-white/10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>
                      {formatAudioTime(voiceCurrentTime)} / {formatAudioTime(voiceDuration || 12)}
                    </span>
                  </div>
                )}
              </div>
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

      {/* Official Resolution Note */}
      {post.resolutionNotes && (
        <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2.5 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span>{language === 'ml' ? 'വകുപ്പ് നടപടിക്കുറിപ്പ്' : 'Official Resolution Action'}</span>
              </span>
              {post.department?.name && (
                <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                  {post.department.name}
                </span>
              )}
            </div>
            <p className="text-[#17231D] text-xs font-medium leading-relaxed">{post.resolutionNotes}</p>
          </div>
        </div>
      )}

      {/* Auto-Escalated Accountability Alert Banner */}
      {(post.status === 'WAITING_FOR_COORDINATION' ||
        (post.history && post.history.some((h) => h.toStatus === 'WAITING_FOR_COORDINATION'))) && (
        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <span>
                  {language === 'ml'
                    ? '⚠️ ഓട്ടോ-എസ്കലേഷൻ: അടിയന്തര ഭരണതല ഇടപെടൽ'
                    : '⚠️ Auto-Escalated: District Administration Intervened'}
                </span>
              </span>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-bold border border-amber-200">
                {language === 'ml' ? 'ഉയർന്ന മുൻഗണന' : 'High Priority'}
              </span>
            </div>
            <p className="text-[11.5px] text-amber-900/90 leading-relaxed pt-0.5">
              {language === 'ml'
                ? 'പൗരന്മാരുടെ പിന്തുണയുള്ള ഈ പരാതിയിൽ നിശ്ചിത സമയത്തിനകം വകുപ്പുതല നടപടി ഉണ്ടാകാത്തതിനാൽ ജില്ലാ ഭരണകൂടം & LSGD സെക്രട്ടറി തലത്തിലേക്ക് ഓട്ടോ-എസ്കലേഷൻ ചെയ്യപ്പെട്ടിരിക്കുന്നു.'
                : 'Due to lack of timely departmental progress on this citizen-backed report, it has been auto-escalated to District Administration & LSGD Secretariat for urgent intervention.'}
            </p>
          </div>
        </div>
      )}

      {/* Civic Transparency Timeline Stepper */}
      {(post.status || post.isInfrastructureIssue) && (
        <div className="p-2.5 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6] space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsTimelineOpen(!isTimelineOpen)}
              className="text-[11px] font-bold text-[#16A34A] hover:text-[#15803D] flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>
                {language === 'ml' ? 'ഔദ്യോഗിക പരിഹാര ഘട്ടങ്ങൾ' : 'Civic Transparency Timeline'}
              </span>
              <span className="text-[10px] text-[#718078] font-normal">
                ({isTimelineOpen ? (language === 'ml' ? 'മറയ്ക്കുക' : 'Hide') : (language === 'ml' ? 'കാണുക' : 'View')})
              </span>
            </button>

            <span className="text-[10px] font-bold text-[#718078]">
              {statusConfig.step}/4 {language === 'ml' ? 'ഘട്ടം പൂർത്തിയായി' : 'Stages Complete'}
            </span>
          </div>

          {/* Stepper Progress Bar (Always visible compact) */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[
              { num: 1, label: language === 'ml' ? 'റിപ്പോർട്ട് ചെയ്തു' : 'Reported' },
              { num: 2, label: language === 'ml' ? 'പരിശോധന' : 'Verified' },
              { num: 3, label: language === 'ml' ? 'നിർമ്മാണം' : 'In Progress' },
              { num: 4, label: language === 'ml' ? 'പരിഹരിച്ചു' : 'Resolved' },
            ].map((st) => {
              const isPastOrCurrent = statusConfig.step >= st.num;
              const isCurrent = statusConfig.step === st.num;
              return (
                <div key={st.num} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      isPastOrCurrent
                        ? st.num === 4
                          ? 'bg-emerald-500'
                          : 'bg-[#16A34A]'
                        : 'bg-zinc-200'
                    } ${isCurrent ? 'ring-2 ring-[#16A34A]/30' : ''}`}
                  />
                  <div
                    className={`text-[9.5px] truncate font-medium ${
                      isCurrent
                        ? 'font-bold text-[#16A34A]'
                        : isPastOrCurrent
                        ? 'text-[#17231D]'
                        : 'text-[#94A39B]'
                    }`}
                  >
                    {st.label}
                  </div>
                </div>
              );
            })}
          </div>

          {isTimelineOpen && (
            <div className="pt-2 border-t border-[#E4EBE6] text-[11px] text-[#718078] space-y-2 animate-in fade-in duration-150">
              {post.history && post.history.length > 0 ? (
                <div className="space-y-1.5">
                  {post.history.map((hist, idx) => (
                    <div key={hist.id || idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#17231D]">
                            {hist.toStatus.replace(/_/g, ' ')}
                            {hist.actor?.fullName && (
                              <span className="font-normal text-[#718078] ml-1">
                                · {hist.actor.fullName}
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-[#94A39B]">
                            {new Date(hist.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {hist.notes && <p className="text-[#718078] text-[10.5px] mt-0.5">{hist.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                    <span>{language === 'ml' ? 'പൗരൻ ജി.പി.എസ് സഹിതം രേഖപ്പെടുത്തി' : 'Citizen verified & recorded via GPS'}</span>
                  </div>
                  {statusConfig.step >= 2 && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                      <span>{language === 'ml' ? 'വകുപ്പ് എഞ്ചിനീയർ പരിശോധിച്ച് ഉറപ്പുവരുത്തി' : 'Inspected & acknowledged by Department Official'}</span>
                    </div>
                  )}
                  {statusConfig.step >= 3 && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-blue-600 animate-spin" />
                      <span className="text-blue-700 font-semibold">{language === 'ml' ? 'കരാറുകാരൻ സ്ഥലത്തു പ്രവൃത്തി ആരംഭിച്ചു' : 'Field repair team assigned and work in progress'}</span>
                    </div>
                  )}
                  {statusConfig.step === 4 && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">{language === 'ml' ? 'പ്രവൃത്തി പൂർത്തിയാക്കി വാർഡ് ഇൻസ്പെക്ഷൻ നടത്തി' : 'Site inspection approved & officially resolved'}</span>
                    </div>
                  )}
                </div>
              )}
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
                <Link
                  href={`/profile?id=${encodeURIComponent(comm.author)}&username=${encodeURIComponent(comm.author.toLowerCase().replace(/\s+/g, '_'))}`}
                  className="flex-shrink-0 hover:opacity-90 transition-opacity"
                >
                  <UserAvatar
                    src={comm.avatar}
                    name={comm.author}
                    size="xs"
                  />
                </Link>
                <div className="flex-1 bg-[#F8FAF8] rounded-xl p-2.5 border border-[#E4EBE6]">
                  <div className="flex items-center justify-between mb-0.5">
                    <Link
                      href={`/profile?id=${encodeURIComponent(comm.author)}&username=${encodeURIComponent(comm.author.toLowerCase().replace(/\s+/g, '_'))}`}
                      className="font-bold text-[#17231D] hover:text-[#16A34A] transition-colors"
                    >
                      {comm.author}
                    </Link>
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
