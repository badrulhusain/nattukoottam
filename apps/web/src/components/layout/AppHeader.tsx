'use client';

import React, { useState } from 'react';
import { MapPin, Search, Bell, Menu, Globe } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { KERALA_LOCALITIES } from '../../lib/constants';

export const AppHeader: React.FC = () => {
  const { language, setLanguage, currentLocality, setLocality, setIsOnboardingOpen, setActiveTab } = useAppStore();
  const t = getT(language);
  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E6EEE8] px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Icon / Mobile Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="p-2 -ml-1 rounded-full text-[#17251D] hover:bg-[#E9F8ED] transition-colors"
            title="Open Welcome Info"
          >
            <Menu className="w-5 h-5 text-[#087A45]" />
          </button>
          <span className="font-bold text-lg text-[#087A45] tracking-tight hidden sm:inline">
            {t.appName}
          </span>
        </div>

        {/* Center: Locality Pill Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLocalityDropdownOpen(!isLocalityDropdownOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E9F8ED] text-[#064B2E] text-sm font-medium hover:bg-[#d8f2de] transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#087A45]" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{currentLocality}</span>
            <span className="text-xs text-[#087A45] opacity-75">▾</span>
          </button>

          {/* Locality Dropdown */}
          {isLocalityDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E6EEE8] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-xs font-semibold text-[#77847C] uppercase tracking-wider">
                {language === 'ml' ? 'പ്രദേശം മാറ്റുക' : 'Select Locality'}
              </div>
              <div className="max-h-60 overflow-y-auto no-scrollbar">
                {KERALA_LOCALITIES.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => {
                      setLocality(loc.name);
                      setIsLocalityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-[#F7FAF7] transition-colors ${
                      currentLocality === loc.name ? 'text-[#087A45] font-semibold bg-[#E9F8ED]/60' : 'text-[#17251D]'
                    }`}
                  >
                    <span>{loc.name}</span>
                    <span className="text-xs text-[#77847C]">{loc.district}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Language switch, Search & Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Bilingual Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-[#E6EEE8] text-[#17251D] hover:bg-[#F7FAF7] transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#087A45]" />
            <span>{language === 'en' ? 'മല' : 'EN'}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="p-2 rounded-full text-[#17251D] hover:bg-[#F7FAF7] transition-colors relative"
            title={t.nav.notifications}
          >
            <Bell className="w-5 h-5 text-[#17251D]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E53E3E] ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

