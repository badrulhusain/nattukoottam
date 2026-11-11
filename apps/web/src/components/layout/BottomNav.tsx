'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, AlertCircle, Compass, User as UserIcon, Plus, MessagesSquare } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

interface NavItem {
  id: 'home' | 'grievances' | 'create' | 'discussions' | 'profile';
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
}

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { language, setIsCreateModalOpen, isAuthenticated, setIsAuthModalOpen } = useAppStore();
  const t = getT(language);

  const navItems: NavItem[] = [
    { id: 'home', href: '/', label: t.nav.home, icon: Home },
    { id: 'grievances', href: '/grievances', label: t.nav.grievances, icon: AlertCircle },
    { id: 'create', href: '#', label: '', icon: Plus, isAction: true },
    { id: 'discussions', href: '/discussions', label: language === 'ml' ? 'ചർച്ചകൾ' : 'Chat', icon: MessagesSquare },
    { id: 'profile', href: '/profile', label: t.nav.profile, icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4EBE6] pt-1.5 pb-[max(env(safe-area-inset-bottom),0.625rem)] px-4 sm:hidden shadow-lg shadow-black/5">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key="create-action"
                onClick={() => {
                  if (!isAuthenticated) {
                    setIsAuthModalOpen(true, 'login');
                  } else {
                    setIsCreateModalOpen(true);
                  }
                }}
                className="relative -top-3 w-12 h-12 rounded-full bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white flex items-center justify-center shadow-md shadow-[#16A34A]/30 active-press transition-transform focus:outline-none"
                aria-label={t.nav.createPost}
              >
                <Plus className="w-6 h-6 stroke-[2.6]" />
              </button>
            );
          }

          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all active-press ${
                isActive ? 'text-[#16A34A]' : 'text-[#718078] hover:text-[#17231D]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-[#16A34A]' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
