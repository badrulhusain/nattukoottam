'use client';

import React from 'react';
import {
  Home,
  AlertCircle,
  Compass,
  Bell,
  User as UserIcon,
  ShieldCheck,
  Plus,
  MapPin,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

export const DesktopSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    language,
    currentUser,
    currentLocality,
    setIsCreateModalOpen,
  } = useAppStore();
  const t = getT(language);

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Home, badge: null },
    { id: 'grievances', label: t.nav.grievances, icon: AlertCircle, badge: '18' },
    { id: 'discover', label: t.nav.discover, icon: Compass, badge: null },
    { id: 'notifications', label: t.nav.notifications, icon: Bell, badge: '3' },
    { id: 'profile', label: t.nav.profile, icon: UserIcon, badge: null },
    { id: 'official', label: t.nav.officialPortal, icon: ShieldCheck, badge: 'Gov' },
  ] as const;

  return (
    <aside className="hidden sm:flex flex-col w-64 h-[calc(100vh-61px)] sticky top-[61px] border-r border-[#E4EBE6] p-4 justify-between bg-white/60 backdrop-blur-xs select-none">
      <div className="space-y-5">
        {/* Community Context Card */}
        <div className="p-3.5 bg-gradient-to-b from-[#EAF7EF]/70 to-[#EAF7EF]/30 rounded-2xl border border-[#D1EBD9] transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider">
              {language === 'ml' ? 'സജീവ വാർഡ്' : 'Active Locality'}
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-lg border border-[#D1EBD9] shadow-2xs text-[#16A34A]">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#17231D] truncate leading-tight">
                {currentLocality}
              </div>
              <div className="text-[11px] text-[#718078] truncate leading-tight mt-0.5">
                {currentUser.district}, Kerala
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all active-press ${
                  isActive
                    ? 'bg-[#EAF7EF] text-[#16A34A] shadow-2xs border border-[#D1EBD9]'
                    : 'text-[#17231D] hover:bg-[#F8FAF8] hover:text-[#16A34A] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 transition-colors ${
                      isActive ? 'text-[#16A34A] stroke-[2.3]' : 'text-[#718078] stroke-[1.8]'
                    }`}
                  />
                  <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-[#16A34A] text-white'
                        : item.id === 'notifications'
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-[#F8FAF8] text-[#718078] border border-[#E4EBE6]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Primary Action Button: Post & Grievance */}
        <div className="pt-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs shadow-md shadow-[#16A34A]/20 transition-all active-press"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.nav.createPost}</span>
          </button>
        </div>
      </div>

      {/* User Quick Profile at Bottom */}
      <div
        onClick={() => setActiveTab('profile')}
        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8FAF8] border border-transparent hover:border-[#E4EBE6] transition-all cursor-pointer group"
      >
        <div className="relative">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#EAF7EF] group-hover:ring-[#16A34A]/40 transition-all"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-2 ring-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-[#17231D] truncate group-hover:text-[#16A34A] transition-colors">
            {currentUser.fullName}
          </div>
          <div className="text-[11px] text-[#718078] truncate">
            @{currentUser.username}
          </div>
        </div>
      </div>
    </aside>
  );
};
