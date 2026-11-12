'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { PostCard } from '../feed/PostCard';
import {
  Edit3,
  Share2,
  MapPin,
  Award,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  LogOut,
  LogIn,
  UserPlus,
  UserCheck,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { EditProfileModal } from './EditProfileModal';
import { useClerk } from '@clerk/nextjs';
import {
  fetchUserProfileApi,
  toggleFollowUserApi,
  getOrCreateDirectRoomApi,
  fetchPostsApi,
  PublicUserProfile,
} from '../../lib/api';

export const UserProfileView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('id') || searchParams.get('userId');
  const targetUsername = searchParams.get('username');

  const {
    currentUser,
    posts,
    setPosts,
    language,
    isAuthenticated,
    setIsAuthModalOpen,
    logout,
    followingIds,
    toggleFollowUser,
  } = useAppStore();
  const t = getT(language);

  // Check if viewing another citizen's profile
  const isVisitingOther = Boolean(
    (targetUserId && targetUserId !== currentUser.id && targetUserId !== currentUser.username) ||
      (targetUsername && targetUsername !== currentUser.username)
  );

  const [activeTab, setActiveTab] = useState<'posts' | 'grievances' | 'supported' | 'about'>('posts');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [visitedProfile, setVisitedProfile] = useState<PublicUserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isMessaging, setIsMessaging] = useState(false);
  const [copied, setCopied] = useState(false);
  const { signOut } = useClerk();

  // Load visited user's details if visiting someone else
  useEffect(() => {
    if (!isVisitingOther) return;

    const identifier = targetUserId || targetUsername || '';
    if (!identifier) return;

    // Check if author matches an existing post in memory for instant rendering
    const existingPostAuthor = posts.find(
      (p) =>
        p.author.id === identifier ||
        p.author.username === identifier ||
        (targetUsername && p.author.username === targetUsername)
    )?.author;

    if (existingPostAuthor) {
      setVisitedProfile({
        id: existingPostAuthor.id,
        fullName: existingPostAuthor.fullName,
        username: existingPostAuthor.username,
        avatarUrl: existingPostAuthor.avatarUrl,
        locality: 'Kakkanad',
        district: 'Ernakulam',
        role: (existingPostAuthor as any).role || 'CITIZEN',
        bio: 'Active citizen contributing to local ward and civic governance.',
        followersCount: 18,
        followingCount: 12,
        postsCount: posts.filter((p) => p.author.username === existingPostAuthor.username).length || 2,
        grievancesCount: 1,
        isFollowing: followingIds.includes(existingPostAuthor.id),
      });
      setIsFollowing(followingIds.includes(existingPostAuthor.id));
      setFollowersCount(18 + (followingIds.includes(existingPostAuthor.id) ? 1 : 0));
    }

    setIsLoadingProfile(true);
    fetchUserProfileApi(identifier)
      .then((data) => {
        if (data) {
          setVisitedProfile(data);
          const localFollowed = followingIds.includes(data.id);
          setIsFollowing(data.isFollowing || localFollowed);
          setFollowersCount(data.followersCount + (localFollowed && !data.isFollowing ? 1 : 0));
        }
      })
      .catch((err) => console.warn('Could not load profile:', err))
      .finally(() => setIsLoadingProfile(false));
  }, [targetUserId, targetUsername, isVisitingOther, followingIds]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    logout();
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true, 'login');
      return;
    }

    const targetId = visitedProfile?.id || targetUserId || targetUsername || '';
    if (!targetId) return;

    const nextState = toggleFollowUser(targetId);
    setIsFollowing(nextState);
    setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await toggleFollowUserApi(targetId);
      if (res && typeof res.followersCount === 'number') {
        setFollowersCount(res.followersCount);
      }
    } catch (err) {
      console.warn('Follow sync error:', err);
    }
  };

  const handleStartMessage = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true, 'login');
      return;
    }

    const targetId = visitedProfile?.id || targetUserId || targetUsername || '';
    if (!targetId) return;

    setIsMessaging(true);
    try {
      const directRoom = await getOrCreateDirectRoomApi(targetId);
      if (directRoom && directRoom.id) {
        router.push(`/discussions?room=${directRoom.id}`);
      } else {
        router.push('/discussions');
      }
    } catch (err) {
      console.warn('Failed to start chat:', err);
      // Fallback redirect to discussions
      router.push('/discussions');
    } finally {
      setIsMessaging(false);
    }
  };

  // Visited User Data vs Current User Data
  const activeUser = isVisitingOther && visitedProfile ? visitedProfile : currentUser;
  const isSelf = !isVisitingOther;

  // Filter posts authored by this citizen
  const userPosts = posts.filter((p) => {
    if (isSelf) {
      return !p.isInfrastructureIssue && (p.author.username === currentUser.username || p.author.id === currentUser.id);
    }
    return (
      !p.isInfrastructureIssue &&
      (p.author.id === activeUser.id ||
        p.author.username === activeUser.username ||
        (activeUser.fullName && p.author.fullName.toLowerCase() === activeUser.fullName.toLowerCase()))
    );
  });

  const grievancePosts = posts.filter((p) => {
    if (isSelf) {
      return p.isInfrastructureIssue && (p.author.username === currentUser.username || p.author.id === currentUser.id);
    }
    return (
      p.isInfrastructureIssue &&
      (p.author.id === activeUser.id ||
        p.author.username === activeUser.username ||
        (activeUser.fullName && p.author.fullName.toLowerCase() === activeUser.fullName.toLowerCase()))
    );
  });

  const supportedPosts = posts.filter((p) => p.isSupported);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Bar Navigation for Visited Profile */}
      {isVisitingOther && (
        <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-[#E4EBE6] shadow-2xs">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-[#17231D] hover:text-[#16A34A] transition-colors cursor-pointer active-press"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'ml' ? 'തിരികെ' : 'Back'}</span>
          </button>
          <div className="text-xs font-bold text-[#17231D] truncate max-w-[200px]">
            {activeUser.fullName}
          </div>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg border border-[#E4EBE6] hover:bg-[#F8FAF8] text-[#718078] hover:text-[#17231D] transition-colors relative"
            title="Share Profile"
          >
            {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Profile Header Card with Cover Photo */}
      <div className="bg-white rounded-2xl border border-[#E4EBE6] shadow-2xs overflow-hidden">
        {/* Cover Landscape */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-r from-[#0F3D24] via-[#16A34A] to-[#22C55E] overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="absolute bottom-3 right-4 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>
              {activeUser.locality || 'Kakkanad'}, {activeUser.district || 'Ernakulam'}
            </span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-5 pb-5 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-12 sm:-mt-14 mb-4">
            {/* Avatar & Badges */}
            <div className="relative inline-block">
              <UserAvatar
                src={activeUser.avatarUrl}
                name={activeUser.fullName}
                size="xl"
                className="ring-4 ring-white shadow-md"
              />
              <span
                className="absolute bottom-1 right-1 p-1 bg-[#16A34A] text-white rounded-full ring-2 ring-white shadow-xs"
                title="Verified Citizen"
              >
                <CheckCircle2 className="w-4 h-4 fill-current text-white" />
              </span>
            </div>

            {/* Actions: Follow, Message, Edit Profile, Share & Auth */}
            <div className="flex items-center gap-2 pt-1 sm:pt-0 flex-wrap">
              {isVisitingOther ? (
                <>
                  {/* Follow Button */}
                  <button
                    onClick={handleFollowToggle}
                    className={`py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 active-press cursor-pointer ${
                      isFollowing
                        ? 'bg-[#EAF7EF] hover:bg-[#d8f2de] text-[#16A34A] border border-[#D1EBD9]'
                        : 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{t.profile.following}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{t.profile.follow}</span>
                      </>
                    )}
                  </button>

                  {/* Message Button */}
                  <button
                    onClick={handleStartMessage}
                    disabled={isMessaging}
                    className="py-2 px-3.5 rounded-xl border border-[#E4EBE6] bg-white text-[#17231D] hover:bg-[#F8FAF8] font-bold text-xs transition-colors flex items-center gap-1.5 active-press shadow-2xs cursor-pointer disabled:opacity-60"
                  >
                    {isMessaging ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16A34A]" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5 text-[#16A34A]" />
                    )}
                    <span>{t.profile.message}</span>
                  </button>

                  {/* Share Profile */}
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl border border-[#E4EBE6] text-[#17231D] hover:bg-[#F8FAF8] transition-colors flex items-center gap-1.5 active-press"
                    title={t.profile.shareProfile}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Own Profile Actions */}
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        setIsAuthModalOpen(true, 'login');
                      } else {
                        setIsEditProfileOpen(true);
                      }
                    }}
                    className="py-2 px-3.5 rounded-xl bg-[#EAF7EF] hover:bg-[#d8f2de] text-[#16A34A] font-bold text-xs transition-colors flex items-center gap-1.5 border border-[#D1EBD9] active-press cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.profile.editProfile}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-2 px-3.5 rounded-xl border border-[#E4EBE6] text-[#17231D] hover:bg-[#F8FAF8] font-semibold text-xs transition-colors flex items-center gap-1.5 active-press"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Copied' : t.profile.shareProfile}</span>
                  </button>

                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="py-2 px-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors flex items-center gap-1.5 active-press"
                      title="Sign out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.auth.logout}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsAuthModalOpen(true, 'login')}
                      className="py-2 px-3.5 rounded-xl bg-[#16A34A] text-white font-bold text-xs hover:bg-[#15803D] transition-colors flex items-center gap-1.5 shadow-xs active-press"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t.auth.signIn}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* User Names & Identity */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-[#17231D] tracking-tight">
                {isSelf && !isAuthenticated
                  ? language === 'ml'
                    ? 'അതിഥി പൗരൻ'
                    : 'Guest Citizen'
                  : activeUser.fullName}
              </h1>
              <span className="text-[10px] font-bold bg-[#EAF7EF] text-[#16A34A] px-2 py-0.5 rounded-md border border-[#D1EBD9]">
                {activeUser.role === 'DEPARTMENT_OFFICIAL' ? '🏛️ Official' : '🌿 Citizen'}
              </span>
            </div>
            <div className="text-xs text-[#718078] font-medium">
              @{activeUser.username || 'citizen'} · {activeUser.locality || 'Kakkanad'}
            </div>

            {/* Bio */}
            {activeUser.bio && (
              <p className="text-xs sm:text-sm text-[#17231D] leading-relaxed pt-1 max-w-xl">
                {activeUser.bio}
              </p>
            )}

            {!isSelf && (
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#718078]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>
                    {activeUser.locality || 'Kakkanad'}, {activeUser.district || 'Ernakulam'}
                  </span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-[#16A34A] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'ml' ? 'സ്ഥിരീകരിച്ച പൗരൻ' : 'Verified Community Member'}</span>
                </span>
              </div>
            )}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-[#E4EBE6] text-center">
            <div className="p-2 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6]">
              <div className="text-base font-extrabold text-[#17231D]">
                {isVisitingOther ? followersCount : currentUser.followersCount}
              </div>
              <div className="text-[10px] font-medium text-[#718078] capitalize">
                {t.profile.followers}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6]">
              <div className="text-base font-extrabold text-[#16A34A]">
                {isVisitingOther
                  ? visitedProfile?.grievancesCount ?? grievancePosts.length
                  : currentUser.grievancesCount}
              </div>
              <div className="text-[10px] font-medium text-[#718078] capitalize">
                {t.profile.grievances}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6]">
              <div className="text-base font-extrabold text-[#17231D]">
                {isVisitingOther
                  ? visitedProfile?.postsCount ?? userPosts.length
                  : currentUser.postsCount}
              </div>
              <div className="text-[10px] font-medium text-[#718078] capitalize">
                {t.profile.posts}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#EAF7EF]/70 border border-[#D1EBD9]">
              <div className="text-base font-extrabold text-[#16A34A]">98%</div>
              <div className="text-[10px] font-medium text-[#16A34A] capitalize">
                Civic Karma
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1 border border-[#E4EBE6] shadow-2xs flex items-center justify-between">
        {(['posts', 'grievances', ...(isSelf ? ['supported'] : []), 'about'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 px-2 text-xs font-semibold capitalize rounded-xl transition-all active-press ${
                isActive
                  ? 'bg-[#EAF7EF] text-[#16A34A] font-bold shadow-2xs border border-[#D1EBD9]'
                  : 'text-[#718078] hover:text-[#17231D]'
              }`}
            >
              {t.profile.tabs[tab as keyof typeof t.profile.tabs]}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {activeTab === 'posts' &&
          (userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="p-8 text-center text-xs text-[#718078] bg-white rounded-2xl border border-[#E4EBE6] shadow-2xs">
              {language === 'ml' ? 'പോസ്റ്റുകൾ ഒന്നും പങ്കുവെച്ചിട്ടില്ല.' : 'No posts published yet.'}
            </div>
          ))}

        {activeTab === 'grievances' &&
          (grievancePosts.length > 0 ? (
            grievancePosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="p-8 text-center text-xs text-[#718078] bg-white rounded-2xl border border-[#E4EBE6] shadow-2xs">
              {language === 'ml'
                ? 'പരാതികൾ ഒന്നും സമർപ്പിച്ചിട്ടില്ല.'
                : 'No grievances reported yet.'}
            </div>
          ))}

        {activeTab === 'supported' && isSelf &&
          (supportedPosts.length > 0 ? (
            supportedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="p-8 text-center text-xs text-[#718078] bg-white rounded-2xl border border-[#E4EBE6] shadow-2xs">
              {language === 'ml'
                ? 'പിന്തുണച്ച പ്രശ്നങ്ങൾ ലഭ്യമല്ല.'
                : 'No supported issues yet.'}
            </div>
          ))}

        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl p-5 border border-[#E4EBE6] shadow-2xs space-y-4 text-xs text-[#17231D]">
            <h3 className="font-bold text-sm text-[#17231D] border-b border-[#E4EBE6] pb-2">
              {language === 'ml' ? 'വാർഡ് വിവരങ്ങൾ' : 'Locality & Civic Registration'}
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-[#718078]">
                <MapPin className="w-4 h-4 text-[#16A34A]" />
                <span className="text-[#17231D] font-medium">
                  {activeUser.locality || 'Kakkanad'}, {activeUser.district || 'Ernakulam'}, Kerala
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#718078]">
                <Layers className="w-4 h-4 text-[#16A34A]" />
                <span className="text-[#17231D] font-medium">
                  Ward {(activeUser as any).wardNumber || 14} (Thrikkakara LSGD Municipality)
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#718078]">
                <Calendar className="w-4 h-4 text-[#16A34A]" />
                <span className="text-[#17231D] font-medium">
                  {language === 'ml' ? 'അംഗത്വം: നവംബർ 2026' : 'Member since: November 2026'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal (Only for Self) */}
      {isSelf && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
        />
      )}
    </div>
  );
};
