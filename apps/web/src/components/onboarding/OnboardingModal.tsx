'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { KERALA_LOCALITIES } from '../../lib/constants';
import { ArrowRight, Globe, MapPin, Check, ShieldCheck, Sparkles, X } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    language,
    setLanguage,
    currentLocality,
    setLocality,
  } = useAppStore();
  const t = getT(language);

  if (!isOnboardingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-white p-6 shadow-2xl border border-[#E4EBE6] text-center flex flex-col justify-between min-h-[500px]">
        {/* Top Dismiss Button */}
        <button
          onClick={() => setIsOnboardingOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Emblem & Cultural Visual */}
        <div className="pt-2 pb-1 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#16A34A] to-[#22C55E] flex items-center justify-center text-white mx-auto shadow-md shadow-[#16A34A]/25">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-[#17231D] tracking-tight">
              {language === 'ml' ? 'നാട്ടുകൂട്ടത്തിലേക്ക് സ്വാഗതം' : 'Welcome to Naatukoottam'}
            </h2>
            <p className="text-xs text-[#718078] max-w-xs mx-auto leading-relaxed">
              {t.onboarding.subtext}
            </p>
          </div>
        </div>

        {/* Community Highlights */}
        <div className="bg-[#F8FAF8] rounded-xl p-3 border border-[#E4EBE6] text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#17231D]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="font-semibold">
              {language === 'ml' ? 'വാർഡ് തല കൂട്ടായ്മ' : 'Hyperlocal Ward Social Network'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#17231D]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-semibold">
              {language === 'ml' ? 'റോഡ് വെട്ടിപ്പൊളിക്കൽ തടയൽ' : 'Interdepartmental Roadwork Sync'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#17231D]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="font-semibold">
              {language === 'ml' ? '"ഞാനും അനുഭവിക്കുന്നു" പിന്തുണ' : '"I Face This Too" Collective Power'}
            </span>
          </div>
        </div>

        {/* Selectors: Language & Locality */}
        <div className="space-y-2.5 pt-2">
          {/* Language Selection Segment */}
          <div className="flex items-center justify-center p-1 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6]">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-white text-[#16A34A] shadow-xs'
                  : 'text-[#718078] hover:text-[#17231D]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ml')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'ml'
                  ? 'bg-white text-[#16A34A] shadow-xs'
                  : 'text-[#718078] hover:text-[#17231D]'
              }`}
            >
              മലയാളം
            </button>
          </div>

          {/* Locality Selector */}
          <div className="text-left bg-white rounded-xl p-2.5 border border-[#E4EBE6] shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#718078] uppercase">
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{t.onboarding.selectLocality}</span>
            </div>
            <select
              value={currentLocality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full text-xs font-bold text-[#17231D] bg-transparent outline-none cursor-pointer"
            >
              {KERALA_LOCALITIES.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.district})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="w-full py-2.5 px-6 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md shadow-[#16A34A]/25 transition-all flex items-center justify-center gap-2 active-press"
          >
            <span>{t.onboarding.proceed}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
