'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { currentUser, posts, language } = useAppStore();
  const t = getT(language);
  const [activeTab, setActiveTab] = useState<'posts' | 'grievances' | 'supported' | 'about'>('posts');

  const userPosts = posts.filter(
    (p) => p.author.username === currentUser.username || p.author.id === currentUser.id
  );
  const supportedPosts = posts.filter((p) => p.isSupported);
  const grievancePosts = posts.filter((p) => p.isInfrastructureIssue);

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Header Card with Cover Photo */}
      <div className="bg-white rounded-2xl border border-[#E4EBE6] shadow-2xs overflow-hidden">
        {/* Cover Landscape */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-r from-[#0F3D24] via-[#16A34A] to-[#22C55E] overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="absolute bottom-3 right-4 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{currentUser.locality}, {currentUser.district}</span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-5 pb-5 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-12 sm:-mt-14 mb-4">
            {/* Avatar & Badges */}
            <div className="relative inline-block">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-22 h-22 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white shadow-md bg-white"
              />
              <span
                className="absolute bottom-1 right-1 p-1 bg-[#16A34A] text-white rounded-full ring-2 ring-white shadow-xs"
                title="Verified Citizen Volunteer"
              >
                <CheckCircle2 className="w-4 h-4 fill-current text-white" />
              </span>
            </div>

            {/* Actions: Edit Profile & Share */}
            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              <button className="py-2 px-3.5 rounded-xl bg-[#EAF7EF] hover:bg-[#d8f2de] text-[#16A34A] font-bold text-xs transition-colors flex items-center gap-1.5 border border-[#D1EBD9] active-press">
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.profile.editProfile}</span>
              </button>
              <button className="py-2 px-3.5 rounded-xl border border-[#E4EBE6] text-[#17231D] hover:bg-[#F8FAF8] font-semibold text-xs transition-colors flex items-center gap-1.5 active-press">
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.profile.shareProfile}</span>
              </button>
            </div>
          </div>

          {/* User Names & Identity */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-[#17231D] tracking-tight">
                {currentUser.fullName}
              </h1>
              <span className="text-[10px] font-bold bg-[#EAF7EF] text-[#16A34A] px-2 py-0.5 rounded-md border border-[#D1EBD9]">
                {language === 'ml' ? 'സന്നദ്ധ പ്രവർത്തകൻ' : 'Citizen Contributor'}
              </span>
            </div>
            <div className="text-xs text-[#718078] font-medium">
              @{currentUser.username} · {currentUser.locality} Ward 14
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-[#17231D] leading-relaxed pt-1 max-w-xl">
              {currentUser.bio}
            </p>

            {/* Tags / Interests */}
            {currentUser.interests && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                {currentUser.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#F8FAF8] text-[#14532D] border border-[#E4EBE6]"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-[#E4EBE6] text-center">
            <div className="p-2 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6]">
              <div className="text-base font-extrabold text-[#17231D]">
                {currentUser.followersCount}
              </div>
              <div className="text-[10px] font-medium text-[#718078] capitalize">
                {t.profile.followers}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6]">
              <div className="text-base font-extrabold text-[#16A34A]">
                {currentUser.grievancesCount}
              </div>
              <div className="text-[10px] font-medium text-[#718078] capitalize">
                {t.profile.grievances}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6]">
              <div className="text-base font-extrabold text-[#17231D]">
                {currentUser.postsCount}
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
        {(['posts', 'grievances', 'supported', 'about'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-2 text-xs font-semibold capitalize rounded-xl transition-all active-press ${
                isActive
                  ? 'bg-[#EAF7EF] text-[#16A34A] font-bold shadow-2xs border border-[#D1EBD9]'
                  : 'text-[#718078] hover:text-[#17231D]'
              }`}
            >
              {t.profile.tabs[tab]}
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

        {activeTab === 'supported' &&
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
                  {currentUser.locality}, {currentUser.district}, Kerala
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#718078]">
                <Layers className="w-4 h-4 text-[#16A34A]" />
                <span className="text-[#17231D] font-medium">
                  Ward 14 (Thrikkakara LSGD Municipality)
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
    </div>
  );
};
