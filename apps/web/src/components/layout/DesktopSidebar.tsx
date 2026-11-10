'use client';

import React from 'react';
import { Home, AlertCircle, Compass, Bell, User as UserIcon, ShieldAlert, Plus, MapPin } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, language, currentUser, currentLocality, setIsCreateModalOpen } = useAppStore();
  const t = getT(language);

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'grievances', label: t.nav.grievances, icon: AlertCircle },
    { id: 'discover', label: t.nav.discover, icon: Compass },
    { id: 'notifications', label: t.nav.notifications, icon: Bell },
    { id: 'profile', label: t.nav.profile, icon: UserIcon },
    { id: 'official', label: t.nav.officialPortal, icon: ShieldAlert },
  ] as const;

  return (
    <aside className="hidden sm:flex flex-col w-64 h-[calc(100vh-65px)] sticky top-[65px] border-r border-[#E6EEE8] p-4 justify-between bg-white">
      <div className="space-y-6">
        {/* Locality Info Banner */}
        <div className="p-3 bg-[#E9F8ED] rounded-2xl flex items-center gap-2.5 text-[#064B2E]">
          <div className="p-2 bg-white rounded-xl shadow-2xs">
            <MapPin className="w-4 h-4 text-[#087A45]" />
          </div>
          <div>
            <div className="text-xs text-[#77847C]">{language === 'ml' ? 'നിങ്ങളുടെ പ്രദേശം' : 'Current Locality'}</div>
            <div className="font-semibold text-sm">{currentLocality}, Kerala</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#087A45] text-white shadow-sm shadow-[#087A45]/20 font-semibold'
                    : 'text-[#17251D] hover:bg-[#F7FAF7] hover:text-[#087A45]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Primary CTA: Report / Create Post */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#087A45] text-white font-semibold text-sm shadow-md shadow-[#087A45]/20 hover:bg-[#064B2E] transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>{t.nav.createPost}</span>
        </button>
      </div>

      {/* User Quick Profile at Bottom */}
      <div
        onClick={() => setActiveTab('profile')}
        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#F7FAF7] transition-colors cursor-pointer border border-transparent hover:border-[#E6EEE8]"
      >
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.fullName}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#087A45]/20"
        />
        <div className="overflow-hidden">
          <div className="text-sm font-semibold text-[#17251D] truncate">{currentUser.fullName}</div>
          <div className="text-xs text-[#77847C] truncate">@{currentUser.username}</div>
        </div>
      </div>
    </aside>
  );
};

