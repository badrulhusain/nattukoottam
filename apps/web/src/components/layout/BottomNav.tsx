'use client';

import React from 'react';
import { Home, AlertCircle, Compass, Bell, User as UserIcon, Plus } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language, setIsCreateModalOpen } = useAppStore();
  const t = getT(language);

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'grievances', label: t.nav.grievances, icon: AlertCircle },
    { id: 'discover', label: t.nav.discover, icon: Compass },
    { id: 'notifications', label: t.nav.notifications, icon: Bell },
    { id: 'profile', label: t.nav.profile, icon: UserIcon },
  ] as const;

  return (
    <>
      {/* Floating Action Button for Create Post / Report */}
      <div className="fixed bottom-20 right-5 z-40 sm:hidden">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-14 h-14 rounded-full bg-[#087A45] text-white flex items-center justify-center shadow-lg shadow-[#087A45]/30 hover:bg-[#064B2E] active:scale-95 transition-transform"
          aria-label={t.nav.createPost}
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Bar Container */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6EEE8] py-1.5 px-3 sm:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive ? 'text-[#087A45]' : 'text-[#77847C] hover:text-[#17251D]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {item.id === 'notifications' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E53E3E]" />
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#087A45] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

