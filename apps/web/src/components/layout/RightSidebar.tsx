'use client';

import React from 'react';
import { AlertTriangle, Clock, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { INITIAL_CONFLICTS_MOCK } from '../../lib/constants';

export const RightSidebar: React.FC = () => {
  const { language, setActiveTab } = useAppStore();
  const t = getT(language);
  const conflict = INITIAL_CONFLICTS_MOCK[0];

  return (
    <aside className="hidden lg:flex flex-col w-80 h-[calc(100vh-65px)] sticky top-[65px] border-l border-[#E6EEE8] p-4 space-y-5 bg-white overflow-y-auto no-scrollbar">
      {/* Interdepartmental Project Conflict Card (The Main Differentiator) */}
      <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{t.coordination.conflictAlert}</span>
        </div>

        <h4 className="text-sm font-bold text-[#17251D] leading-snug">
          {conflict.title}
        </h4>

        <p className="text-xs text-[#77847C] leading-relaxed">
          {conflict.recommendedAction}
        </p>

        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
          <span className="text-[11px] text-amber-800 font-medium">
            {conflict.roadName} ({conflict.distanceMeters}m)
          </span>
          <button
            onClick={() => setActiveTab('official')}
            className="flex items-center gap-1 text-xs text-[#087A45] font-semibold hover:underline"
          >
            <span>{language === 'ml' ? 'വിശദാംശങ്ങൾ' : 'View Coordination'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Local Infrastructure Pulse Widget */}
      <div className="p-4 rounded-3xl bg-[#F7FAF7] border border-[#E6EEE8] space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#17251D]">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#087A45]" />
            {language === 'ml' ? 'പ്രദേശിക സ്ഥിതിവിവരം' : 'Locality Civic Pulse'}
          </span>
          <span className="text-[11px] text-[#77847C]">Kakkanad</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 bg-white rounded-2xl border border-[#E6EEE8]">
            <div className="text-lg font-bold text-[#087A45]">18</div>
            <div className="text-[11px] text-[#77847C]">{language === 'ml' ? 'പരിഹരിച്ചവ' : 'Resolved'}</div>
          </div>
          <div className="p-2.5 bg-white rounded-2xl border border-[#E6EEE8]">
            <div className="text-lg font-bold text-amber-600">6</div>
            <div className="text-[11px] text-[#77847C]">{language === 'ml' ? 'പുരോഗതിയിൽ' : 'In Progress'}</div>
          </div>
        </div>
      </div>

      {/* Trending Community Issues */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#17251D] uppercase tracking-wider px-1">
          <TrendingUp className="w-3.5 h-3.5 text-[#087A45]" />
          <span>{language === 'ml' ? 'ശ്രദ്ധേയമായ വിഷയങ്ങൾ' : 'Trending in Kochi'}</span>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-white hover:bg-[#F7FAF7] rounded-2xl border border-[#E6EEE8] transition-colors cursor-pointer">
            <div className="text-xs text-[#087A45] font-semibold">#KakkanadWaterSupply</div>
            <div className="text-xs text-[#17251D] mt-0.5 font-medium line-clamp-1">KWA pipeline repair schedule coordination</div>
            <div className="text-[10px] text-[#77847C] mt-1">489 {t.feed.supports}</div>
          </div>
          <div className="p-3 bg-white hover:bg-[#F7FAF7] rounded-2xl border border-[#E6EEE8] transition-colors cursor-pointer">
            <div className="text-xs text-[#087A45] font-semibold">#InfoparkRoads</div>
            <div className="text-xs text-[#17251D] mt-0.5 font-medium line-clamp-1">Fresco hotel road resurfacing required</div>
            <div className="text-[10px] text-[#77847C] mt-1">634 {t.feed.supports}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

