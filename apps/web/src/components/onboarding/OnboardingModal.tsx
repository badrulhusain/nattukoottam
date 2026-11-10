'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { KERALA_LOCALITIES } from '../../lib/constants';
import { ArrowRight, Globe, MapPin, Check } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, language, setLanguage, currentLocality, setLocality } = useAppStore();
  const t = getT(language);

  if (!isOnboardingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[36px] overflow-hidden bg-gradient-to-b from-[#b7f0c7] via-[#e2f8e9] to-[#ffffff] p-6 shadow-2xl border border-white/60 text-center flex flex-col justify-between min-h-[580px]">
        {/* Floating Community Member Avatar Bubbles (matching reference image) */}
        <div className="relative w-full h-44 my-2">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Citizen"
            className="absolute top-2 left-6 w-12 h-12 rounded-2xl object-cover ring-3 ring-white shadow-md animate-bounce duration-1000"
          />
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
            alt="Citizen"
            className="absolute top-6 right-6 w-14 h-14 rounded-2xl object-cover ring-3 ring-white shadow-md"
          />
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
            alt="Citizen"
            className="absolute bottom-2 left-12 w-11 h-11 rounded-2xl object-cover ring-3 ring-white shadow-md"
          />
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
            alt="Citizen"
            className="absolute bottom-0 right-10 w-12 h-12 rounded-2xl object-cover ring-3 ring-white shadow-md"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg border border-emerald-100">
            <span className="text-2xl">🤝</span>
          </div>
        </div>

        {/* Headlines */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#064B2E] leading-tight">
            {t.onboarding.headline}
          </h2>
          <p className="text-xs text-[#77847C] px-2 leading-relaxed">
            {t.onboarding.subtext}
          </p>
        </div>

        {/* Selectors: Language & Locality */}
        <div className="space-y-3 pt-3">
          {/* Language Selection Toggle */}
          <div className="flex items-center justify-center gap-2 p-1 bg-white/90 rounded-2xl border border-[#E6EEE8] shadow-2xs">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                language === 'en' ? 'bg-[#087A45] text-white shadow-xs' : 'text-[#77847C] hover:text-[#17251D]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ml')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                language === 'ml' ? 'bg-[#087A45] text-white shadow-xs' : 'text-[#77847C] hover:text-[#17251D]'
              }`}
            >
              മലയാളം
            </button>
          </div>

          {/* Locality Quick Selector */}
          <div className="text-left bg-white/90 rounded-2xl p-3 border border-[#E6EEE8] shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#77847C]">
              <MapPin className="w-3.5 h-3.5 text-[#087A45]" />
              <span>{t.onboarding.selectLocality}</span>
            </div>
            <select
              value={currentLocality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full text-xs font-semibold text-[#064B2E] bg-transparent outline-none cursor-pointer"
            >
              {KERALA_LOCALITIES.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.district})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom CTA Button matching reference image */}
        <div className="pt-4">
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#064B2E] text-white font-bold text-sm shadow-lg shadow-[#064B2E]/30 hover:bg-[#087A45] transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{t.onboarding.proceed}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

