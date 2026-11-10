'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { PostCard } from '../feed/PostCard';
import { Edit3, Share2, MapPin, Award, CheckCircle2 } from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { currentUser, posts, language } = useAppStore();
  const t = getT(language);
  const [activeTab, setActiveTab] = useState<'posts' | 'grievances' | 'supported' | 'about'>('posts');

  const userPosts = posts.filter((p) => p.author.username === currentUser.username || p.author.id === currentUser.id);
  const supportedPosts = posts.filter((p) => p.isSupported);
  const grievancePosts = posts.filter((p) => p.isInfrastructureIssue);

  return (
    <div className="space-y-4 pb-12">
      {/* Profile Header Card (Inspired by Reference Image 1, Phone 3) */}
      <div className="bg-white rounded-3xl p-5 border border-[#E6EEE8] shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-extrabold text-[#17251D]">{currentUser.fullName}</h2>
              <CheckCircle2 className="w-4 h-4 text-[#087A45] fill-current" />
            </div>
            <div className="text-xs text-[#77847C] font-medium">@{currentUser.username}</div>
          </div>

          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-[#E9F8ED]"
            />
            <span className="absolute bottom-0 right-0 p-1 bg-[#087A45] text-white rounded-full ring-2 ring-white">
              <Award className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-[#17251D] leading-relaxed">
          {currentUser.bio}
        </p>

        {/* Interest Tag Chips */}
        {currentUser.interests && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {currentUser.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#F7FAF7] text-[#064B2E] border border-[#E6EEE8]"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Stats Line matching screenshot */}
        <div className="pt-2 border-t border-[#E6EEE8] flex items-center gap-3 text-xs text-[#77847C]">
          <span>
            <strong className="text-[#17251D] font-bold">{currentUser.followersCount}</strong> {t.profile.followers}
          </span>
          <span>·</span>
          <span>
            <strong className="text-[#17251D] font-bold">{currentUser.grievancesCount}</strong> {t.profile.grievances}
          </span>
          <span>·</span>
          <span>
            <strong className="text-[#17251D] font-bold">{currentUser.postsCount}</strong> {t.profile.posts}
          </span>
        </div>

        {/* Action Buttons: Edit profile & Share profile */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button className="py-2.5 px-4 rounded-2xl bg-[#E9F8ED] text-[#064B2E] font-semibold text-xs hover:bg-[#d8f2de] transition-colors flex items-center justify-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t.profile.editProfile}</span>
          </button>
          <button className="py-2.5 px-4 rounded-2xl border border-[#E6EEE8] text-[#17251D] font-semibold text-xs hover:bg-[#F7FAF7] transition-colors flex items-center justify-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.profile.shareProfile}</span>
          </button>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6EEE8] px-2 overflow-x-auto no-scrollbar">
        {(['posts', 'grievances', 'supported', 'about'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3.5 text-xs font-semibold capitalize whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
                isActive
                  ? 'border-[#087A45] text-[#087A45]'
                  : 'border-transparent text-[#77847C] hover:text-[#17251D]'
              }`}
            >
              {t.profile.tabs[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {activeTab === 'posts' && (
          userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="p-8 text-center text-xs text-[#77847C] bg-white rounded-3xl border border-[#E6EEE8]">
              {language === 'ml' ? 'പോസ്റ്റുകൾ ഒന്നും ലഭ്യമല്ല' : 'No posts published yet.'}
            </div>
          )
        )}

        {activeTab === 'grievances' && (
          grievancePosts.length > 0 ? (
            grievancePosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="p-8 text-center text-xs text-[#77847C] bg-white rounded-3xl border border-[#E6EEE8]">
              {language === 'ml' ? 'പരാതികൾ ഒന്നും സമർപ്പിച്ചിട്ടില്ല' : 'No grievances reported yet.'}
            </div>
          )
        )}

        {activeTab === 'supported' && (
          supportedPosts.length > 0 ? (
            supportedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="p-8 text-center text-xs text-[#77847C] bg-white rounded-3xl border border-[#E6EEE8]">
              {language === 'ml' ? 'പിന്തുണച്ചവ ഒന്നും ലഭ്യമല്ല' : 'No supported issues yet.'}
            </div>
          )
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl p-5 border border-[#E6EEE8] shadow-xs space-y-3 text-xs text-[#17251D]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#087A45]" />
              <span>{currentUser.locality}, {currentUser.district}, Kerala</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{language === 'ml' ? 'പ്രാദേശിക വാർഡ്:' : 'Ward:'}</span>
              <span>Ward 14 (Thrikkakara LSGD)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{language === 'ml' ? 'റജിസ്ട്രേഷൻ:' : 'Member Since:'}</span>
              <span>November 2026</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

